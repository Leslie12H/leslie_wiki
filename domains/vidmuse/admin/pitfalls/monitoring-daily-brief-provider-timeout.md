---
name: monitoring-daily-brief-provider-timeout
type: pitfall
created: 2026-09-19
updated: 2026-09-19
tags: [vidmuse, admin, monitoring, daily-brief, provider]
links: [monitoring-daily-brief-evidence-loss, admin-scheduled-report-mechanisms]
---

# 日报重试生效仍漏发：模型通道失败与总超时

**Why:** 2026-09-19 生产排查证明，日报遗漏不能一律沿用历史 invalid_schema 结论。该次已经部署输出修复及有限重试，但三次生成均在 model_request 阶段超时，未进入输出校验和飞书发送。调度层耗尽重试后保留当天锁，因此稍后模型恢复也不会自行补发。

**How to apply:** 先固定北京时间窗口，核对实际镜像；联合 SLS 的 synthesis_finished / send_deferred / send_failed、ProviderRouter 日志及 Redis 只读 GET/TTL，分别回答上游故障、应用超时、调度停止。model_calls=1 只统计合成层调用，不代表底层只请求了一次；内部通道切换及 SDK 重试可能耗尽同一预算。不要删除锁或调用发送接口来诊断原因。

## 2026-09-19 核验指针

- 当次实际镜像：`7543773dfd2e34133f7be9a45c011816070658f0`；[生产发布记录](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35303133656)。后续排查须重新读取部署状态。
- [生产 SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/vidmuse-admin?slsRegion=us-west-1)：选择 2026-09-19 09:55—10:35 Asia/Shanghai。`datetime` 内容使用 UTC，三次合成结束为 `02:05:08.386`、`02:15:11.581`、`02:30:21.789`；均为 `status=timeout stage=model_request model_calls=1`，耗时分别 300015、300006、309130 ms。
- 上游证据：三个开始时段 02:00、02:10、02:25 UTC，aws-09 / aws-08 共六次 HTTP 400，原始错误为 `Access to Anthropic models is not allowed for this account.`。PIP 备用路径三轮共出现八次 HTTP 503；02:04:36.226、02:14:35.011 的路由失败记录包含 code `6030002`、`上游在返回响应前关闭了连接（EOF）`。这些记录不证明 AWS 为何拒绝访问，也不证明 PIP 内部为何 EOF。
- 配置验证入口：`config.settings` 的 `MONITORING_DAILY_BRIEF_LLM_MODEL`、`MONITORING_DAILY_BRIEF_LLM_TIMEOUT_SECONDS`、`TESTCENTER_REPLAY_LLM_TRANSPORT`。当次读取为 sonnet-4.6、300 秒、admin direct；会变，后续须重读。
- `apps/admin/service/monitoring_daily_brief_report.py`：`_try_llm_synthesize` 的总预算与 `asyncio.wait_for`，`_defer_failed_brief` 的 300/600 秒退避及第三次失败后当天停重试。
- Redis 键指针：`monitoring:daily-brief:sent:<发送日期>` 和 `:attempts`。当次 2026-09-19 的 attempts=3，第三次日志 retry_after_seconds=48638；sent 键存在不等于成功发送。
- Provider 路由入口：`packages/api_aggregation_adapter/src/api_aggregation_adapter/provider_router.py`、`providers/aws_bedrock_provider.py`；日报经 `service/replay/llm_transport.py` 进入配置的 transport。

## 日志索引陷阱

本次可见记录的正文被解析到 `log`，但索引仍列 `content` 等旧字段。全文搜 monitoring_daily_brief 得到 0 条，普通 SQL 提示 log 未建索引；改用只读 scan SQL 后找到精确结果。不得把检索 0 条直接当作没有执行。

查询指针：`* | set session mode=scan; select datetime, log where log like '%monitoring_daily_brief%' order by datetime limit 100`，使用上述有限时间窗口。[SLS 扫描文档](https://www.alibabacloud.com/help/en/sls/scan-logs)。

本次仅排查；未补发、未修改生产配置、未部署修复。
