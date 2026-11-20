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
2. 从两区域 `task_submitted` 提取同一条日志里的平台 Task ID 和 Athena Job ID。上海 Athena 的 `inference-prod` 日志查 `moderation stage decided`，以原始结构字段区分 `rejected` 和 `error`。提交时间早于窗口的任务也可能在窗口内结束。报告两个来源的关联及剩余差异。平台建单 Request ID 以同一任务号对应的成功建单日志为准，核对 API、方舟兼容路由或 Playground 创建路由。派发、查询和终态日志各自的 Request ID 单独使用。
3. 日志只给文本标签时，按 [VidMuse 访问日志入口的审核段落](../../vidmuse/refs/access-log-entrypoints.md#画布提示词命中阿里云文本标签2026-11-19) 以 `job_moderation` 的审核项 DataId，或以实际送审精确分段、服务、决定时间对齐原回执。多次提交同一分段时，用 Athena 决定时间减 `duration_ms` 得到审核阶段起点，再用 Green 回执的原始 RequestTime 消除歧义。阿里云返回的 `riskWords`、`customizedWords` 和原始风险等级分别保留。媒体结果的供应商 Task ID 和平台建单 Request ID 各列保存。
4. 媒体优先用 Athena `http_response_started` 的结构化 `path` 提取 `/moderation/aliyun/callback/{job_id}/{review_id}`，其中 `review_id` 对应阿里云 DataId。一个 Job 可能有多个回调，逐个查看供应商结果，按审核阶段、对应素材和等级绑定拒绝项。媒体标签与语音命中词按供应商证据分别记录。
5. 源记录缺词、缺等级、尚未取得原件、审核执行报错各有不同含义。导出保留对应任务号和审查依据，默认只导出排查所需字段。明确要求导出原始 Prompt 时，从对应任务的授权内容接口读取并仅放入指定本地交付物。凭据、证件和签名素材链接按项目规则处理。Wiki 仅留取证指针。单独补审核通过的对照样本后再评估准确率。

- [Athena 审核编排](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/moderation.py) · [审核状态存储](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/models/moderation.py) · [Green 返回值归一化](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/clients/green.py) · [媒体原回执查证](aliyun-output-moderation-receipts.md)。
- 2026-11-20 两区域 96 小时只读核对的证据入口为 Apipltform 工作区 `.local/moderation-96h-20261120/`。

## 2026-11-20 审核通过的对照样本

先按平台 Task ID 对齐 Athena Job，读取 `moderation stage decided` 中的 `stage=input` 与 `status=passed`，再用实际送审文本、调用时间和服务名定位供应商回执。遇到提示词增强，按事件先后识别实际审核的版本。本次国内生产 Playground 的原文在增强前送审，回执为 `riskLevel=none` 且标签为空。用同名审核服务的拒绝样本核对时，共有词可以对应不同分类结果，原因以原回执字段和可观测的配置为准。只读证据见工作区 `.local/task-872481655980421/`。

## 2026-11-20 预发与生产同窗核对

四个站点从两套 [生产](https://zeus-admin.sandaii.cn/) 和 [预发](https://zeus-admin-dev.sandaii.cn/) 管理台的 `/admin/api/v1/sites` 分别发现。香港的 `co_sandai_zeus_dev` 日志库同时收集部分开发和国内预发日志，按 Pod 中的环境以及管理台任务归属区分。预发调用也可进入上海 `inference-prod`，推理日志库名称不能证明调用环境。海外预发若未在香港终态日志出现，通过该站点的管理台任务分页独立确认。已建单审核失败的取数验收对齐四个站点任务 ID 集合、Zeus 终态、Athena 决定和建单 Request ID。

核对某个词是否确实命中时，直接读取供应商命中词字段。按送审分段哈希、审核阶段时间及供应商回执排重。相同请求窗口内有重复文本时，在共用候选的任务之间核对回执 ID 的唯一分配。对没有回调的同步图片审核，使用审核项索引、同素材对象路径和风险等级对应 Green 记录。只有明确授权需要原始 Prompt 时才从任务内容接口逐条拉取，汇总后回读工作簿验证多行文本与标识符。

- 2026-11-20 四站点的任务清点与只读回执证据指针见 Apipltform 工作区 `.local/moderation-expanded-20261120/`。
