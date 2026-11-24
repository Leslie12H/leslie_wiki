---
name: sandai-platform-magi2-request-pe-control
type: reference
created: 2026-11-17
updated: 2026-11-24
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
