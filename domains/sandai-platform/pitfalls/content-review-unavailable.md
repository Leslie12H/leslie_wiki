---
name: sandai-platform-content-review-unavailable
type: pitfall
created: 2026-11-26
updated: 2026-11-26
tags: [sandai, openapi, athena, moderation, aliyun-green]
links: [sandai-api-platform-development-entrypoints, sandai-inference-concurrency-dashboard-entrypoints]
---

# 开放平台内容审核不可用的查证方法

**Why** 2026-11-26 排查 `Content safety review is unavailable.` 时，Zeus 共享日志库的文本命中主要来自 VidMuse 接口回读，开放平台失败则可以在任务终态和 Athena 审核决策中回查。同一句提示覆盖不同的审核阶段、素材类型及供应商错误。输入参考视频送审失败会在模型开跑前结束任务。

**How to apply** 用生产管理后台的国内和美国任务列表分页取 `Fail`、`moderationStatus=FAIL` 状态，包含软删记录。按任务 ID 去重，筛出首次审核 `MODERATION_INPUT_ERROR` 和 `MODERATION_OUTPUT_ERROR`，保留建单时间向前的缓冲。用 Athena 的 `jobs.request_id` 对应平台任务 ID，点查 `job_moderation.job_id`，并按 Athena 审核终态确定发生时刻。核对审核 `error`、`service_unavailable`、项目、`failed_item`、素材 `kind`、`last_error` 和重试次数。可用同一 Job ID 查 `services.moderation` 的 `moderation stage decided` 事件。按受影响任务计数，供应商重试和客户端重复回读分别查证。

Zeus 对外提示和失败码沿 [AthenaModerationProjection](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/AthenaModerationProjection.java) 与 [GenerationQueryService](https://github.com/world-sim-dev/zeus/blob/dev/modules/openapi/src/main/java/co/sandai/zeus/openapi/v2/generations/GenerationQueryService.java) 回查。Athena 按 [审核流程](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/moderation.py) 和 [Green 客户端](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/clients/green.py) 确认操作名，再到相应的供应商 API 解释返回码。`VideoModeration` 的业务返回码 `480` 对应检测并发路数超限。核对实配额度和共享范围时，需要供应商账号、区域、Service Code 及配额侧证据。[阿里云视频文件审核增强版](https://www.alibabacloud.com/help/zh/content-moderation/latest/video-moderation-enhanced-api#code说明)


## 审核项目有 `480` 时按最终审核决策归类

**Why** 2026-11-26 上海生产有三笔成片审核的 `final_video` 保留 `last_error=green_code_480`，最终审核记录为 `rejected`、`content_policy_violation`，原因是 `riskLevel=high`。项目的最近一次错误字段和最终决策可以同时存在。

**How to apply** 用 `jobs.state` 的失败阶段和错误码对齐 `job_moderation.status`、`failure_code` 与失败项目的 `status`、`reason`。按决策归类，把 `last_error` 记为送审过程的错误。重试次数按同一 Job 的重试事件逐笔查，具体画面或语音的命中标签按[阿里云成片审核回执](../refs/aliyun-output-moderation-receipts.md)查。
