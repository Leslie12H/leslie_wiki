---
name: sandai-platform-magi2-cn-native-production-entrypoints
type: reference
created: 2026-11-16
updated: 2026-11-16
tags: [sandai, api-platform, magi2, testing, production]
links: [sandai-api-platform, sandai-api-platform-v2-input-validation-entrypoints, sandai-platform-magi2-multimodal-api-test-entrypoints]
---

# 国内生产 Magi-2 原生全链路验收入口

**Why:** 2026-11-16 使用用户提供的国内 API Key 做原生上传、生成和结果验收。公开 Schema、产品参数说明、同步参数拒绝和成片交付是四层不同证据。历史用例的 `magi-2-1114` 与本次指定的 `magi-2` 分开，不能把前者的通过或失败算作后者的结果。

- 地区与结构：[国内生产公开 OpenAPI](https://api.sandai.cn/openapi.json)，模型规格与展示约定：[飞书参数说明](https://j0yswlgboxz.feishu.cn/wiki/BOG6wZQpjiQ9lJk0jf7c91LBnyl)。重新读取，再冻结当次验收口径。
- 工作区证据：`/Users/leslie/Documents/ChatGPT/Apipltform/.local/magi2-cn-native-20261116/REPORT.md`。沿同目录 `case-results.csv` 和 `ledger.jsonl` 查字段错误、请求号、原任务查询和成片证据。另一模型的累计时长和分层诊断参见[既有多模态入口](magi2-multimodal-api-test-entrypoints.md)。

**How to apply:** 同一组织上传每类小素材，逐条回读资产 ID，再用精确模型创建。严格校验用例检查 HTTP 与字段错误；引用已有 asset ID 的累计时长可能由下游预处理判断，应同时追查终态和可用时的失败阶段。对返回 202 的任务，仅沿原 ID 查询；GET 200 可能显示排队、处理中或失败。成功后下载并解码成片，分别核对时长、画幅、分辨率、音轨和显式水印。POST 缺回执不重放，查询触发限流时降低查询频率和每轮读取量。扣退款需用独立账务证据。
