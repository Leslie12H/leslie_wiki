---
name: sandai-api-platform-moderation-failure-census-entrypoints
type: reference
created: 2026-11-20
updated: 2026-11-20
tags: [sandai, api-platform, zeus, athena, moderation, aliyun, sls]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-aliyun-output-moderation-receipts]
---

# 开放平台审核失败全量取数入口

**Why:** Athena 审核日志服务于多个调用方。直接统计其拒绝行会把其他业务放进开放平台分母，单看平台阶段又会把明确拒绝和审核执行报错混在一起。

**How to apply:**

1. 先冻结绝对起止时间、时区和时间字段。对开放平台国内和海外生产分别查 Zeus SLS 的 `task_finished`，以 `stage=MODERATION` 为任务终态范围，并检查分页总数和重复任务。同步请求未建单的审核拒绝根据接口与阶段另外查证。
2. 从两区域 `task_submitted` 提取同一条日志里的平台 Task ID 和 Athena Job ID。上海 Athena 的 `inference-prod` 日志查 `moderation stage decided`，以原始结构字段区分 `rejected` 和 `error`。提交时间早于窗口的任务也可能在窗口内结束。报告两个来源的关联及剩余差异。
3. 日志只给文本标签时，按 [VidMuse 访问日志入口的审核段落](../../vidmuse/refs/access-log-entrypoints.md#画布提示词命中阿里云文本标签2026-11-19) 以 `job_moderation` 的审核项 DataId，或以实际送审精确分段、服务、决定时间对齐原回执。阿里云返回的 `riskWords`、`customizedWords` 和原始风险等级分别保留。
4. 媒体优先用 Athena `http_response_started` 的结构化 `path` 提取 `/moderation/aliyun/callback/{job_id}/{review_id}`，其中 `review_id` 对应阿里云 DataId。一个 Job 可能有多个回调，逐个查看供应商结果，按审核阶段、对应素材和等级绑定拒绝项。媒体标签与语音命中词按供应商证据分别记录。
5. 源记录缺词、缺等级、尚未取得原件、审核执行报错各有不同含义。导出保留对应任务号和审查依据，不在工作表或 Wiki 留整段客户输入、签名素材链接或凭据。单独补审核通过的对照样本后再评估准确率。

- [Athena 审核编排](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/moderation.py) · [审核状态存储](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/models/moderation.py) · [Green 返回值归一化](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/clients/green.py) · [媒体原回执查证](aliyun-output-moderation-receipts.md)。
- 2026-11-20 两区域 96 小时只读核对的证据入口为 Apipltform 工作区 `.local/moderation-96h-20261120/`。
