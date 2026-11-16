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
