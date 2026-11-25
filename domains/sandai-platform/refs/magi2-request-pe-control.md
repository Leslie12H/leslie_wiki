---
name: sandai-platform-magi2-request-pe-control
type: reference
created: 2026-11-17
updated: 2026-11-25
tags: [sandai, api-platform, magi2, zeus, athena, prompt-enhancement]
links: [sandai-api-platform-development-entrypoints, sandai-platform-magi2-cn-native-production-entrypoints]
---

# Magi-2 单次请求控制 PE 的查证入口

**Why:** 2026-11-17 评估开放平台按请求启停提示词增强。请求字段、任务中保存的开关、模型选项快照和下游执行路径需要一致。参考增强类型参与 Athena 路由，无参考素材的变体也可能使用该类型。

## 从入口到推理

- 在 Zeus 回查 [v2 严格请求解析](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/generation-api/src/main/java/co/sandai/zeus/openapi/v2/generations/GenerationRequestDeserializer.java#L26)、[原生与方舟共享的创建服务](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/OpenApiGenerationService.java#L40)、[模型选项转任务快照](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/lattice/ability/openapi/ConfiguredModelTaskAssembler.java#L21)及[派发选项合并顺序](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/modelconfig/AthenaOptionApplier.java#L19)。只改任务布尔值可能被同名快照覆盖。默认值要按本次选中的有效变体回查。既有线上案例和配置读回指针见[国内生产验收入口](magi2-cn-native-production-entrypoints.md)。
- 在 Athena 对照[参考增强准入](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/validators/reference.py#L30)、[独立参考素材校验步骤](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/services/job.py#L794)和[参考增强分支与普通分支的实际派发](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/services/job.py#L371)。单独的素材校验覆盖与素材在最终推理中被消费需要各自取证。Zeus [参考输入冻结协议](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/MagiGenerationAdmission.java#L71)是端到端对照入口。

**How to apply:** 设计时保留省略、显式 true 和显式 false 三态。选中变体后决议并冻结有效值，同时核对派发快照及 PE 类型。以实际模型、变体和输入角色决定能力。纯文本关闭要验证模型确实收到原文。参考素材关闭还需逐槽核对输入、参考编号、顺序和首尾帧绑定，继续执行审核和媒体校验。遇到未验证的组合，创建时同步报参数错误。验收用同一模型、种子与输入对照三态，跨一次重新派发核对快照，并追到 Athena 实际入参和生成终态。2026-11-17 为设计和源码核查，部署能力和成片走独立实测。

## 2026-11-17 上海控制台 PE 关闭时发生 422

生产任务快照同时保留显式关闭的 `options.promptEnhancement` 和 `gaga4r2v` 类型。按精确派发 trace 命中的 Athena 访问日志提供 HTTP 状态和镜像，未记录响应体。[该版本请求模型的整体校验钩子](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/services/job.py#L240)依据增强类型运行[参考增强准入](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/validators/reference.py#L30)，所以 `loc=["body"]` 可指向多个选项组合失败。用保存的任务快照和[部署版本派发组装](https://github.com/world-sim-dev/zeus/blob/aa0add01bfdde4c3d4300264f829ddc901f1d3f8/modules/domain/src/main/java/co/sandai/zeus/domain/service/impl/TaskDomainServiceImpl.java#L295)离线恢复后，同一请求改开关为 true 或删除参考增强类型都通过了请求模型校验。生成服务层和最终成片仍需分别验收。生产原始响应与离线错误输出须注明来源。

## 2026-11-24 提示词码点路由

**Why**　[Zeus #522](https://github.com/world-sim-dev/zeus/pull/522) 支持按提示词正文的 Unicode 码点选择 PE 类型。发布成功与模型下发的规则是两条证据，任务受理与 Athena 加载对应配置也需要分开核对。

**How to apply**　先通过 [Magi staging 发布](https://github.com/world-sim-dev/zeus/actions/runs/45360688665) 对照目标 OpenAPI 和 Dispatcher 版本，再从 [预发 Zeus Admin 模型配置](https://zeus-admin-dev.sandaii.cn/platform/models) 按站点回读模型、变体和组织权限。规则的 `gt` 严格大于，等于阈值时继续使用固定值，前提是没有其他匹配规则或显式 PE 类型覆盖。建议用同规格、同变体的阈值 −1、阈值、阈值 +1 输入测试，加入一个补充平面字符校验码点计数。

回查已有国内 staging 任务时，从 Admin 的 `/tasks/{id}/content` 对未截断正文计数，在香港 SLS 的 `co_sandai_zeus_dev` 用 `task_submitted` 将任务映射到 Athena Job。在上海 SLS 的 `inference-prod` 按 Job ID 查 `services.config` 中的完整 PE 类型及 `reference PE output accepted`。可回查 Job `4840739`（24 码点）和 `4840833`（101 码点），分别有阈值下、阈值上实际执行的证据。等于阈值的结果来自部署版本规则与当时配置的离线复算。

提交前确认当前组织在对应模型白名单。管理台白名单读回的 `writable` 表示当前 Redis 键可写，调用仍需中央的 `model.whitelist.write` 权限。产品生成请求和管理台写入各自有鉴权。

2026-11-24 白名单生效后，用真实 v2 请求补测阈值 −1、等值和 +1。对应 Athena Job 为 `4841003`、`4841004`、`4841005`，三单均有增强结果被接受的日志。最后一单的 Worker 日志包含完整 PE 名。前两单的普通 PE 日志只显示 provider 和 LLM 模型，同名模型及相同生成选项不能区分两个 PE 版本。需要逐单证实时，应使用经过授权的 Job 选项或类型日志。若 `services.config` 没有记录配置名，检查缓存命中行为。

排查管理台写操作 403 时，可从 `/admin/api/v1/me` 复核站点权限及 CSRF 头字段。优先使用原生白名单页面。缺少防伪头的手工请求返回 403，不能据此判断账号缺少白名单写权限。

## 2026-11-24 改按 Qwen3-8B token 路由

**Why**　[Zeus #524](https://github.com/world-sim-dev/zeus/pull/524) 将规则改成 `when.promptTokens.gt`。升级后按正文 token 数选择 PE，旧 `promptCodePoints` 条件需要随发布迁移。公开输入长度上限仍按 Unicode 码点校验。

**How to apply**　从合并版本的 `tokenizers/qwen3-8b/SOURCE` 取固定词表版本与 SHA-256，对原文编码并关闭截断、填充和新增特殊 token。用阈值 −1、等值、+1 样本验证，且让码点数明显超过阈值以区分两种计数。保存后回读当前站点配置，并用任务详情正文哈希确认样本在入口与任务存储间一致。`gt` 是严格大于，单条规则等值时使用该层固定值。 [双区 staging 发布](https://github.com/world-sim-dev/zeus/actions/runs/45387411879)

Athena 配置缓存命中可能不会记录配置名。按 Job ID 找带 ID 的 `preprocess_handler_async start` 与 `Enhancing with provider`，再按 PE 全名查看 `provider_factory` 的 `Created total … provider factories`。仅在同一个 Worker Pod、两个带 Job ID 事件之间恰有一条候选时，用它关联实际类型。最后回读 `reference PE output accepted`。2026-11-24 国内 staging 可回查 149、150、151 和 404 token 的 Job `4865013` 至 `4865016`。最后一单复用原 2,000 码点样本。

## 2026-11-25 PE 结果渲染和派发前引号转换

**Why**　Zeus 的执行失败及 Athena 的 PE 步骤失败可覆盖两个不同边界。PE 输入审核通过后，结果可能在生成阶段无法渲染为提示词，也可能已经生成和落盘，却在派发前转换素材引用时失败。单看步骤状态会把两类错误合并。

**How to apply**　先按 Job 主键复核 `options.promptEnhancementType`、`state.reference_preparation.pe_completed`、`pe_result_urn` 和 `inference_task_id`。按 Artifact 主键投影输出格式，不复制正文。用上海 SLS 的 `reference PE output accepted/invalid` 核对每次尝试，对照同 Job 的 HTTP 状态。遇到 `unmatched … verbatim quote`，在不输出正文的情况下扫描原文和增强文的 U+201C/U+201D 顺序，确认问题原已有还是由改写引入。该转换在 PE 落盘后、推理发布前执行，保留引号内对白及画面文字，外部才做引用映射。遇到 `rendered no prompt text`，沿 provider 分支确认返回文本已解析成 JSON 对象，渲染后没有可用正文。两次 empty 日志只确认分类，具体空字段、供应商完成原因与网关内部路由需要能关联的原始调用记录。

回查示例见 [v6.1 引号错误](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-job-detail?var-job_id=4932227)、[v7 引入不配对引号](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-job-detail?var-job_id=4962269)、[v7 渲染无正文](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-job-detail?var-job_id=4939809) 和 [PE 响应检查](https://github.com/world-sim-dev/athena-admin/blob/345fc7acb626d8b87b20d6b65428b955344dbc9b/ApiService/prompt_enhancement/enhance_v2/providers/gaga4_reference_enhance.py#L194-L262)。分版本失败率的分母要另外取同窗口成功和失败的完整 PE 调用。
