---
name: seedance-ark-audio-pricing-entrypoints
type: reference
created: 2026-11-16
updated: 2026-11-16
tags: [sandai, api-platform, seedance, pricing, billing]
links: [sandai-api-platform-model-pricing-entrypoints]
---

# 火山方舟 Seedance 音频开关与定价查证

**Why:** 2026-11-16 核对 Seedance 2.0 与 2.5 各分辨率的有声和无声报价。输出音频开关、参考音频和参考视频是不同的请求条件。报价还需区分火山方舟 API 和其它按秒或积分收费的产品入口。

**How to apply:**

1. 在[创建视频生成任务 API](https://console.volcengine.com/ark/region%3Acn-beijing/docs/create-video-generation-task-api)核对目标型号支持的 `resolution`、`generate_audio`、默认值和相关任务限制。优先打开文档正文核对更新时间。
2. 在[火山方舟模型价格](https://console.volcengine.com/ark/region%3Acn-beijing/docs/model-pricing)查视频生成模型的在线推理单价、Token 用量估算公式及价格示例。固定输入视频条件、输出画幅、分辨率、时长和帧率，确认开关音频是否改变单价或预计用量。输入包含视频时，按价表核对最低用量规则。
3. 若需要验证实际账单，固定其它参数，仅切换 `generate_audio`，对照成功任务的 `usage.completion_tokens` 与对应账单。2026-11-16 的查证范围为公开文档和示例价。

## Seedance 1.5 Pro 历史价格与方舟下线

2026-11-16 补查 `doubao-seedance-1-5-pro-251215`。从[火山引擎官方模型与价格示例](https://docs.volcengine.com/docs/87254/2075755?lang=zh)核对有声、无声的不同 Token 单价及 720p 样例。需要补算其它规格时，可对照 [BytePlus 官方视频生成教程](https://docs.byteplus.com/fr/docs/modelark/video-generation-tutorial)的 1.5 Pro 像素表，货币单价沿用对应区域的历史价目。

中国站 API 仍需对照[火山方舟模型下线公告](https://docs.volcengine.com/docs/ark/model-deprecation-notice?lang=en)的第九批模型和完整模型 ID。该版本的关停时间为 2026-09-21 14:00（北京时间）。历史价格用于回查旧账与对比。

## Seedance 1.0 音频能力、计价与下线

2026-11-16 补查 1.0 系列。对照[方舟视频生成 API](https://docs.volcengine.com/docs/ark/create-video-generation-task-api?lang=zh)中 `generate_audio` 的支持型号。1.0 Pro 和 Pro Fast 的模型能力也可沿[火山引擎视频生成算子能力矩阵](https://docs.volcengine.com/docs/lake-ai-service/seedance-video-generation-doubao-series?lang=zh)回查。计算无声输出价格时，以[方舟模型价格](https://console.volcengine.com/ark/region%3Acn-beijing/docs/model-pricing)的在线或离线单价为准，按[方舟视频生成教程](https://docs.volcengine.com/docs/ark/video-generation-tutorial?lang=zh)核对 1.0 的实际输出像素。

在[方舟模型下线公告](https://docs.volcengine.com/docs/ark/model-deprecation-notice?lang=zh)按完整 ID 查生命周期。第八批覆盖 `doubao-seedance-1-0-lite-i2v-250428` 和 `doubao-seedance-1-0-lite-t2v-250428`，第十批覆盖 `doubao-seedance-1-0-pro-250528` 和 `doubao-seedance-1-0-pro-fast-251015`。旧接入点的后续行为按批次表和模型行核对。
