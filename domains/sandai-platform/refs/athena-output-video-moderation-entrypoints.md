---
name: sandai-athena-output-video-moderation-entrypoints
type: reference
created: 2026-11-26
updated: 2026-11-26
tags: [sandai, openapi, athena, moderation, latency]
links: [sandai-platform-content-review-unavailable, sandai-inference-concurrency-dashboard-entrypoints]
---

# Athena 成片审核规则与耗时查证入口

**Why:** 2026-11-26 双区开放平台成片审核的短窗 P95 升高。后处理排队、送审受理前重试、供应商受理后等结论及整个后处理都有独立边界。仅按 Athena Job 的 `completed_at` 选样会漏掉审核拦截等终态。美西产品入口也使用共享 Athena，按入口选择美西 SLS 无法覆盖这段。

**How to apply:** 用共享生产 Athena 的 `jobs` 与 `job_moderation` 按 Job ID 关联，以 `jobs.project_name` 确认开放平台入口。用 `job_moderation.stage='output'`、`output_review.finished` 和 `items.final_video.kind='video'` 取成片审核结论，按 `job_moderation.updated_at` 定统计窗口，保留放行、拦截和技术失败。用建单 ID 范围约束查询时预留跨窗任务缓冲，必要时对照日志检查更老的长尾。用该阶段 `started_at` 到审核决策计算执行耗时，以审核步骤 `queued_at` 到 `started_at` 计算排队，按上海 `inference-prod` 的 `moderation stage decided` 和 `duration_ms` 抽样校验。

送审受理前与受理后按 `items.final_video.accepted_at` 分段，缺受理时间的样本单列。判断供应商并发超限时核对 `last_error`、`moderation provider retry pending` 和 Green 对应操作的错误码。最终审核行里的 `last_error` 不能当作所有历史重试次数。当前百分位与样本量沿当次聚合结果回查，不在知识库固化。

从 `jobs.options.extra.moderation.service_codes.video` 读取实际请求的服务代码，再到[阿里云上海视频规则配置](https://yundun.console.aliyun.com/?p=cts#/videoReview/ruleConfig/cn-shanghai)核对画面/语音子服务、截帧间隔和返回范围。阶段启用、供应商故障策略以 `output_review` 的落库快照为准，风险等级如何映射为拒绝或通过沿 [Athena Green 客户端](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/clients/green.py) 查验。队列起点和审核决策日志沿 [后处理交接](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/postprocess.py) 与 [审核流程](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/moderation.py) 回查。
