---
name: sandai-platform-magi2-cn-native-production-entrypoints
type: reference
created: 2026-11-16
updated: 2026-11-17
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


## 2026-11-16 正向参数覆盖与成片验收

**Why:** 用户要求更换各类素材并先走正向用例，覆盖两档分辨率与全部画幅，以及显式水印开关。参数受理、下游派发和成片满足预期需要各自取证。

- 验收入口为项目 `.local/magi2-cn-positive-20261116/REPORT.md`，同目录 `plan.json` 按画幅、分辨率、输入类型和参数取值保存请求，`fixtures.json` 保存合成素材的规格和哈希，`ledger.jsonl` 保存线上回执。调度卡点沿精确任务号、`admin-queue-proof.json` 和派发日志回查。

**How to apply:** 用无人物的几何画面和纯合成乐音，先本地解码，再上传并核对线上下载哈希。两档分辨率分别对全部画幅提交合法请求，每档选一组固定种子、提示词、画幅和素材，只改变显式水印布尔值。拿到成片后比较可见标识，另用媒体流核对时长、方向、尺寸和音轨。大量任务按原 ID 轮换查询，优先查上轮未覆盖的 ID，并按实际读接口限额调整频率。长时间 `queued` 时查看测试组织有效并发和在途任务的派发阶段。

## 2026-11-17 失败比例与音频产物回查

**Why:** 最近创建的生成任务仍可能大量在途，已失败占比和已完成任务失败率要保留各自分母。公开成功也可能带有不符合请求参数的产物。

- 当次国内开放平台状态、同批测试归属和两条失败原因见工作区 `.local/magi2-cn-failures-20261117/REPORT.md`。同目录 `readback.json` 保留创建时间口径和翻页完整性。已下载成片的音轨证据见 `public-receipts.jsonl`，下发前的请求沿 `success-request-verified.json` 与提交哈希对应。

**How to apply:** 以固定创建窗口完整翻页，区分失败占全部任务与失败占成功、失败终态之和，报告仍在途数量。审核拒绝与下游提交拒绝按精确任务号复核。对显式关闭音频且不引用音视频的用例，下载结果并检查音轨及实际信号，再用请求哈希和下游有效选项定位问题；公开状态仍以任务回执为准。


## 2026-11-17 文生视频变体调整后的双接口复验

**Why:** 纯文本变体调整任务类型后，原生 v2 和方舟都能受理请求，仍可能在下游创建阶段被拒绝。参考增强的任务类型条件和素材存在条件需要同时满足。

- 方舟使用中央文档和现场 GET / POST 对照核对路径，正向请求和原生对照见工作区 `.local/magi2-cn-positive-20261116/ark/REQUEST-DETAILS.md`。分辨率默认值按协议和当前模型能力分别确认。
- 本次修复后两条独立用例的配置 revision、任务类型、输入计数、422 Trace 和历史版校验器复现见同目录 `t2v-retest/REPORT.md` 及相邻 JSON。区分线上实测的 422 与离线定位的具体校验分支。

**How to apply:** 使用无参考素材的同一提示词分别走两套协议，沿新任务查询实际保存的任务类型和输入。复查纯文本场景的有效增强类型，再对照下游当前校验规则。已经在队列里的旧任务保留创建时的任务类型；修复是否生效以修复后新任务实际派发、终态和成片为准。
