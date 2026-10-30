---
name: monitoring-thread-scan-pagination-exhaustion
type: pitfall
created: 2026-10-30
updated: 2026-10-30
tags: [vidmuse, monitoring, runtime, pagination, incident]
links: [monitoring-deploy-revokes-readonly-credentials, monitoring-report-vs-chat-output]
---

# 历史会话扫描上限导致新报警接管失败

**Why:** 新事故在创建Thread前先扫描同business的历史会话，以避免重复建会话。如果实现只有固定页数上限且没有按事故身份的服务端筛选，历史增长会使新事故在接管前失败；将这个确定性错误标为可重试会反复扫描直到耗尽尝试。readiness通过只证明能力和证据源就绪，不保证会话查找完成。恢复卡属于源告警状态，也不证明Agent分析恢复。

**How to apply:** 先从事故API确认Thread/Run、分析开始时间，再以活动event_key关联SLS outbox及最后一次尝试的trace；按实际镜像读取对应源码。核对分页请求数、响应状态、cursor是否推进、有无POST；将“接管前失败”与“有Run但报告合同失败”分开。修复应采用事故稳定身份精确查询/索引及持久化hint，保留并发幂等；明确分页上限错误码与不可盲目重试语义，不能只无限增加页数或放松报告校验。

## 2026-10-30 取证入口

- 本地报告：`/Users/leslie/Downloads/sandai-code/vidmuse-admin/.codex-artifacts/monitoring-failures-20261030/report.md`；同目录`evidence.json`保留限定窗口的事故状态及同trace明细。动态数量和当前状态按API重查，不从历史报告推断。
- 事故：`sls-incident-461b44ddf2c480447ec2f6511baf5c86686eda9a`；outbox 3592；trace `2caf2abc9e2e40729b595222261effe6`；北京时间2026-10-30 12:14:35–12:18:59。
- [实际部署源码](https://github.com/world-sim-dev/vidmuse-admin/blob/22c6f51e4af6ed9b7f09495c40f8ed36683fd8ea/apps/admin/service/maxwell_runtime_gateway.py#L828)：`MAX_SCAN_PAGES`、`_find_thread`、先查后创建调用链。线上100页均HTTP200后失败，与100页上限分支相互印证；公开API仅返回兜底码，未直接读取outbox.last_error原文，不能把所有通用失败码都视为逐条同trace核验。
- [生产SLS入口](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/vidmuse-admin?slsRegion=us-west-1)。`log`字段未索引时按Pod/时间/级别完整分页后本地筛选；查询Complete但关键词无匹配不代表正文不存在。
- Dashboard使用`/admin/api/v1/monitoring/incidents/dashboard?window_hours=168&windowed=true&limit=200`，核对`window_basis=created`、total/items/truncated；事故记录数不是业务问题去重数。
- 独立报告失败样本：`sls-incident-fcbdd653a4bb6e2a5cac7c504dc00ac8f66569d4`；`report_transport_invalid`需要回读原Run canonical事件，历史降级投影不是正式报告验收。
- 本次只读诊断，无生产配置/业务数据变更、无部署、无补跑。修复和恢复须沿后续实际实施回执查证。


## 2026-10-30 复查与无新增接口修复

- 历史成功trace `236ca95a3cb84d628a921897c342025e`（outbox3546）与失败trace的对照、实际分页数量和Thread201/message202见本地报告新增小节及`followup-evidence.json`。两次镜像Gateway相同；应先证实数据容量触发旧缺陷，不把故障自动归因于最近发布。
- [Admin PR #950](https://github.com/world-sim-dev/vidmuse-admin/pull/950) 是此次修复及后续CI/合并/发布状态的回查入口。复用现有Thread列表的userId筛选稳定监控服务身份、按实际cursor结束，保留已有hint、精确metadata身份/重复匹配和逐请求租约保护；不增加Maxwell接口、无数据库变更。仅按当前preset筛选会漏旧preset；仅改大固定页数不能消除数据增长引发的失败。
- 原生userId是持久业务身份，不应为了索引便利临时改成事故ID。无hint方案仍随监控历史线性增长；未来身份迁移须兼容旧Thread引用。线上集合覆盖、绝对取证时间和测试回执保存在本地报告，不能当作永久规模承诺。
- 分析失败另有独立原因：Job Pod的8位数字后缀也匹配Deployment命名正则，正确Job部署和代码被错判缺失。用主窗口canonical SLS记录的Pod UID，连接同namespace/Pod的已验证K8s记录，再读取真实controller Job owner；不能只凭Pod名称猜控制器类型，也不能接受UID变化后的重建Pod。
- 原Run168个canonical事件及owner正文恢复后可离线复现。修复让原证据acquisition完整，但原Run没有成功prepared report，不能据此宣布历史正式报告恢复。修复发布和受影响事故补跑沿PR及后续实际回执核验。

## 2026-10-30 查询路径复审：缩小扫描范围不等于精确定位

**Why:** PR #950 head 71c793db59d2a5b282224ecbfaaba6b5990940c0 的 userId 过滤只隔离监控服务身份；缺少 threadId 时仍须读完该身份全部历史才能证明没有重复。逐请求 timeout 与续租不能约束整轮扫描耗时，移除固定页数后仍存在随历史增长的延迟和 worker 占用。将其称为完整精确查找修复不成立。

**How to apply:** 分清已知 threadId 的直接读取、本地 incidentKey+analysisGeneration 到 threadId 的映射，以及远端创建成功但回执丢失的恢复窗口。前两者可复用 Admin 持久状态；仅靠本地映射不能发现第三种远端孤立创建。要使恢复不扫描历史，需要 Runtime 按业务+事故稳定身份筛选，或提供原子幂等创建；不一定新增 URL，也可扩展既有列表接口的筛选契约，但都属于 Runtime 能力/契约改动。

- 源码回查：Admin `_find_thread`、`deliver`、`claim_next_incident_event`；Maxwell `threadListInput` 和 `threadstore.SQLStore.List`。本次核对既有 q 只对title/id/user/creator/preset等字段搜索，不搜索clientMetadata.incidentKey；不能用标题关键词替代身份合同。
- [PR #950 查询复审](https://github.com/world-sim-dev/vidmuse-admin/pull/950) 的待解决项：正常接管不依赖历史页数，恢复按完整事故身份及分析代次精确定位，保留旧代次与创建回执丢失保护。查询条件精确也不自动代表数据库高效，应核对实际索引与执行计划，不能未经EXPLAIN宣称已走索引。
- 本次是查询路径复审，未修改业务代码、接口、数据库、PR状态或生产数据。查询修复仍有改进项；Job证据绑定修复的验证结果独立保留。
