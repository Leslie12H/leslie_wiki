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

## 2026-10-30 现有接口精确筛选、索引与创建回执恢复

**Why:** userId 范围分页仍与历史规模线性相关；客户端先查再创建也不能消除并发和远端已提交但回执丢失的窗口。完整事故身份必须在存储层筛选，创建重试还需要数据库原子去重，两者职责不同。

**How to apply:** 扩展既有 Thread 列表的 clientMetadata 筛选，在分页前按 business + source + incidentKey + fingerprint + alertSource + analysisGeneration 查询；limit=2 检测重复，不扫描历史。不把 preset/user 当事故身份。兼容旧代次缺省值；仅在服务端明确回显已应用筛选与幂等能力后允许创建。创建使用稳定身份派生的 business-scoped key，由唯一表达式索引保证同键同请求返回原 Thread；不同请求、已删除目标及身份歧义必须拒绝。

- 实现与动态状态回查：[Maxwell PR #390](https://github.com/world-sim-dev/maxwell-ai/pull/390)、[Admin PR #950](https://github.com/world-sim-dev/vidmuse-admin/pull/950)。此前 userId 全量分页方案被此次精确筛选取代；不新增 URL。
- 索引、兼容、暂停旧派发及发布/回滚操作入口：Maxwell `docs/operations/runtime-thread-identity.md`；Admin `docs/monitoring-runtime-identity.md`。先并发建索引并验证定义/有效性，再完整升级 Runtime，最后切换 Admin；避免新旧 keyless/keyed writer 混跑。先回滚 Admin，保留唯一索引和创建身份元数据。
- 验证入口：Runtime `identity_integration_test.go` 使用隔离本机 PostgreSQL，实际 List SQL 的 EXPLAIN、并发创建、重建 store 回执恢复、墓碑/冲突/缺索引、两份并发索引操作重复执行；HTTP、adapter/application replay 测试和生成的 OpenAPI 客户端随 PR 保存。不能用本地毫秒数承诺线上 SLA。
- 复审经验：回放标记必须跨存储 adapter 传给应用层，否则重试可能重复初始化资源；不要仅验证 Thread ID 相同。内部解析错误使用稳定公开文案，仍保留内部 cause。
- Job Pod 证据绑定修复独立保留。事故恢复状态、已提交 prepared report、生产迁移/部署及补跑均沿实际回执核验，不能从本地测试或 PR 创建推断已恢复。


## 2026-10-30 发布前置操作的目标定位

**Why:** Admin 的 prod 环境可能配置指向 dev 命名的 Runtime；按环境名字猜数据库，可能把索引建到无关库。PR 合并、dev 自动发布、Runtime 发布及事故恢复是不同回执。并发建索引只改变结构，不能替代应用能力部署。

**How to apply:** 每次发布沿 Admin 实际 MAXWELL_AGENT_API_BASE_URL → 实时 Ingress → Service → Deployment → 配置中的 database.dsn 确认目标，只记录非敏感身份信息，不保存 DSN。先备份本次受影响表与结构，确认键冲突/索引有效性，事务外并发建索引，再逐字比对 pg_get_indexdef 与合并迁移，并对真实稳定身份执行 EXPLAIN。切换版本才暂停/排空旧派发，待 Runtime 全副本能力确认后再上生产 Admin。

- 实际合并、目标定位、备份范围、两索引验证、真实事故查询计划及未部署边界，见本地回执 `/Users/leslie/Downloads/sandai-code/vidmuse-admin/.codex-artifacts/monitoring-failures-20261030/index-rollout/report.md`。动态库名、版本、耗时以此带日期回执及实时环境核对；不将单次测量当 SLA。
- Admin 主分支自动发布目标需回看 `.github/workflows/admin-cicd.yml`；[本次 dev 流水线](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/41032586159)。生产切换和历史补跑仍须独立验收。
- 认证经验：libpq 的 PGDATABASE 环境变量不可直接当连接 URI 使用；连接错误可能回显该字段。应通过独立 PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE 参数、受限文件或标准连接器传入，并在输出前脱敏；凭据意外进入工具日志须按真实暴露处理，清理本地副本不能撤回已输出内容。轮换应同步依赖服务，不能擅改运行中账号。


## 2026-10-30 受控切换与派发门禁

**Why:** `MAXWELL_INCIDENT_SYNC_ENABLED=false` 同时停止消费者和新 outbox 入队，不适合作为“持续收集报警、只暂停认领”的维护开关。代码合并、发布完成、精确查询成功、Thread/Run 接管和正式报告通过仍是不同验收层次。

**How to apply:** 发布前检查 `monitoring_incident_outbox.py` 的入队条件、`monitoring_incident_dispatch.py` 在认领前的 readiness gate 及已接纳 Run 独立回收路径。维护期间保持入队，使用受审计的临时就绪门禁阻止新认领；保存原覆盖状态，确认全部旧写入者退出且租约恢复，不直接改事故状态。先 Runtime Worker/API，再生产 Admin；最后移除临时覆盖，逐副本验证真实依赖与通知开关，观察原 pending 自动恢复。

- 本次切换事实、临时覆盖、双副本验收、真实事故单次查询、唯一 Thread/持久幂等键及终态边界见 `/Users/leslie/Downloads/sandai-code/vidmuse-admin/.codex-artifacts/monitoring-failures-20261030/production-switch/report.md`。
- 发布回执：[Maxwell Worker/API](https://github.com/world-sim-dev/maxwell-ai/actions/runs/41037923191)、[生产 Admin](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/41038684278)。当前部署状态须实时核对，不以历史流水线成功代替。
- 对真实待处理事故可在新 Admin 调用只读 `_find_thread` 并观察 HTTP 请求数量：必须是一条完整身份过滤 GET、limit=2、无 cursor；随后另查持久化 Thread/Run、创建幂等键和正式报告。维护过程中恢复 pending 与重置历史 failed 是不同操作，不能借切换盲目批量补跑。
- 就绪检查一次出现证据源 HTTP unready/degraded 后恢复，必须保留失败回执并复验；不能只挑成功样本宣称依赖永不波动。Run completed 也不能替代 Admin 报告合同验收。


### 切换后独立分析失败：部署仓库不在证据目录

**Why:** 部署 SHA 必须与实际仓库绑定。代码目录只有相近项目时，Agent 可能把独立服务的 SHA 和路径套到相似代码所在仓库，造成 GitHub 404，无法满足部署版本的源码证据门禁；这与 Thread 接管或 Job owner 识别是不同原因。

**How to apply:** 对 `report_transport_invalid` 回读 canonical prepare 工具反馈，核对当前 code describe 目录、Deployment 镜像 SHA、GitHub commit 的真实归属和该 SHA 下的文件树。补仓库前需核验代码证据服务自身的 GitHub App 权限、最小路径范围和配置身份发布流程；不要放宽报告校验、引用别的仓库或用当前 main 冒充部署版本。

- 2026-10-30 现场样本与精确事件指针见 production-switch 报告追加节及 analysis-failure-3595-evidence.json。实际代码归属 [music_analyzer 部署提交](https://github.com/world-sim-dev/music_analyzer/commit/dc113df28608aab9bb0ca14cd6cff4b1409ceba9)。本轮已定位配置覆盖缺口，未把新报警一个成功样本推断为全部分析恢复，额外 MCP 配置修复尚未实施。
