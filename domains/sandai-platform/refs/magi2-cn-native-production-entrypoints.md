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

## 2026-11-16 纯文本任务提交校验

**Why:** 纯文本任务可以被开放平台受理，随后在 Athena 创建作业前失败。配置解析后，纯文本类型与提示词增强类型仍需满足同一份下游约束。参考素材提示词增强要求 `I2FV` 并启用增强。

- 原任务、派发 Trace、落库选项和当时的下游校验源码取样见本页证据目录中的 `sls-871244278575877-submission.json`、`dispatch-options-871244278575877.tsv` 及 `athena-reference-871244278575877.txt`。实际生效配置与是否恢复沿当次任务和部署回查。
- Zeus 按保存的选项构造 Athena 请求，结构化 422 会被分类为 `INVALID_REQUEST`。从[请求组装](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/modules/domain/src/main/java/co/sandai/zeus/domain/service/impl/TaskDomainServiceImpl.java#L444)与[派发错误分类](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/modules/infra/src/main/java/co/sandai/zeus/infra/infer/dispatch/AthenaDispatchClient.java#L191)定位，按当次部署重核。

**How to apply:** 从任务 ID 确认 `SUBMISSION` 阶段，再按派发 Trace 关联下游响应。若结构化失败只保存了 `body`，只读核对单任务保存的类型、增强开关及增强类型，再用当时部署的 Athena 整体请求校验离线复现。后续验收分别验证纯文本和有参考素材的变体，区分校验复现与线上生成恢复。

### 模型变体配置回查

**Why:** Athena 按 `promptEnhancementType` 识别参考素材增强，再校验任务类型和开关。因此只关闭开关时，残留的参考增强类型仍会触发整体验证。Zeus 配置合并按公共、变体、请求的顺序应用非 null 值。

**How to apply:** 从管理台目标区域读取精确模型的公共项和 `NONE/T2V`、`REFERENCE/I2FV` 各自的有效选项。国内配置回读及当次 revision 见证据目录 `cn-magi2-config-readback.json`。对关闭增强的纯文本配置，确认有效开关为 false，且有效类型没有参考增强前缀。管理变更沿 [Zeus 模型配置契约](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/docs/admin-api.md#模型配置与白名单) 和现场 revision；验证时先对比两个变体的有效选项，再分别查新任务终态与成片。
