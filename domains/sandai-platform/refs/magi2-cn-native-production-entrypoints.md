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
- 本次修复后两条独立用例的配置 revision、任务类型、输入计数、422 Trace 和历史版校验器复现见同目录 `t2v-retest/REPORT.md` 及相邻 JSON。2026-11-17 复查发布标签与日志后，更正早期校验器推断。该批复验时的 Athena 已包含 #824 并允许空参考输入。Zeus 当时的无素材 I2FV 路径仍会带上两个缺省 0 的旧裁剪字段。使用生产版本的校验函数重放会拒绝旧裁剪参数，移除这两个字段后通过。Zeus [#505](https://github.com/world-sim-dev/zeus/pull/505) 与实际部署及新任务验收分别查证。更正后的任务级报表见同目录 `FAILURE-RCA-20261117.md`。

**How to apply:** 使用无参考素材的同一提示词分别走两套协议，沿新任务查询实际保存的任务类型和输入。复查纯文本场景的有效增强类型，再对照下游当前校验规则。已经在队列里的旧任务保留创建时的任务类型；修复是否生效以修复后新任务实际派发、终态和成片为准。


## 2026-11-17 推理执行阶段失败的 worker 取证

**Why:** 原生 v2 和方舟都出现公开 `generation_failed`。相同错误码可对应节点取数据超时，也可对应完成回报被拒绝。收到推理完成请求不等于任务通过公开终态。

- 已核验任务号、Job ID、worker 错误和同一批请求入口见工作区 `.local/magi2-cn-positive-20261116/KNOWN-ISSUES.md`。逐条载体为 `failure-causes.json`、`ark/failure-causes.json`、`job-id-index.json` 和对应 SLS worker 回执。

**How to apply:** 先确认 Zeus 按任务号记录的终态阶段，再用派发日志中对应的 Athena Job ID 去 worker 搜索。遇到 `FETCH_TIMEOUT` 时核对对端请求失败与 worker 回报失败的时序；遇到 `Post-process source artifact already set` 时分别查首次产物设置和后续回报，不把已观察的冲突直接当成首次设置的根因。成片和参数验收继续使用公开成功且实际下载的产物。

## 2026-11-17 推理完成后审核 worker 的字段兼容错误

**Why** 公开任务长时间处于处理中时，推理可能已经完成。国内生产这次在 Athena 审核 worker 的 JobPreProcessor 校验拒绝了 `pp_reference_media_validation`，并观察到后处理失败写回阶段重复出现同一字段错误。

- 逐条任务号、Job ID、公开状态及日志位置见工作区 `.local/magi2-cn-positive-20261116/KNOWN-ISSUES.md` 的在途诊断和相邻 `in-flight-diagnostics.json`。原始取证按 v2 与方舟分别保存。
- 取证时按同一 Job ID 对齐 `inference-completed`、`Task athena.moderation` 和 `Failed to persist post-process failure`，以日志中的实际校验字段和值定位兼容问题。
- Athena [#823](https://github.com/world-sim-dev/athena-admin/pull/823) 新增 Job 步骤类型。该次按日志的容器镜像标记反查发布 tag，定位到 API 写入端与消费同一 Job 的后处理 worker 部署到了不同版本。API、预处理和后处理使用独立发布目标，核对各自 rollout 和有效 Git SHA。实际镜像、发布记录、重复完成回报对照及未恢复任务指向 `FAILURE-RCA-20261117.md`。

**How to apply** 用该 Job 的最新公开查询确认终态，日志异常单独标记为在途阻塞。对照提交端写入的步骤类型和读取端正在运行的任务 schema，再检查异常后的失败状态能否持久化。记录修复后原任务是否能继续，以及新建任务是否经过审核并产生成片。


## 2026-11-17 方舟公开文档与生产版本核对

**Why:** 公开文档的发布时间和参数说明准确性需要分别检查。此日国内线上页面已包含当时主线的最新 Ark 文档，查询 `duration` 的说明仍把它概括为实际成片时长。

**How to apply:** 读取[线上方舟文档](https://platform.sandai.cn/docs/ark-generations/)的 HTML，核对静态资源路径中的前端 SHA 与[国内发布工作流](https://github.com/world-sim-dev/sandai-website/actions/runs/44005528927)，再比较部署 SHA 和主线之间是否修改文档。另从生产 Zeus Pod 镜像定位[方舟查询响应](https://github.com/world-sim-dev/zeus/blob/aa0add01bfdde4c3d4300264f829ddc901f1d3f8/modules/openapi/src/main/java/co/sandai/zeus/openapi/compatible/ark/ArkGenerationController.java#L114)及[创建参数解析](https://github.com/world-sim-dev/zeus/blob/aa0add01bfdde4c3d4300264f829ddc901f1d3f8/modules/openapi/src/main/java/co/sandai/zeus/openapi/compatible/ark/ArkGenerationRequest.java#L140)。该历史版本优先返任务记录中的正整数时长，回退时才对成片时长取整。模型可用分辨率也需结合有效模型配置，解析器枚举只证明入口识别。

## 2026-11-17 推理工作器关停与运行中状态

**Why:** Athena 已派发的任务可以在工作器关停后继续显示运行中。只有按工作器和推理请求核对实际进度，才能区分执行被打断、排队及推理完成后的交付阻塞。

- 当次任务、派发时点、GPU 工作器关停和最后去噪步数见工作区 `.local/task-871469831763909/`，沿 `sls-job-4232150.json`、`sls-gpu-pod.json`、`sls-request-final-check.json` 及 `admin-status-recheck.json` 回查。关停触发方须在工作器所属环境查证。

**How to apply:** 从 Zeus 任务 ID 取得 Athena Job ID，再用 Job ID 找工作器、推理请求 ID 和 trace。用工作器名回查无任务 ID 的关停日志，用推理请求 ID 查最后一条进度和接续情况。再读 API 或管理台终态，按实际事件时间排序。区分已确认的执行中断和待证的发布、缩容或驱逐原因。
