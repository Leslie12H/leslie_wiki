---
name: sandai-platform-magi2-request-pe-control
type: reference
created: 2026-11-17
updated: 2026-11-17
tags: [sandai, api-platform, magi2, zeus, athena, prompt-enhancement]
links: [sandai-api-platform-development-entrypoints, sandai-platform-magi2-cn-native-production-entrypoints]
---

# Magi-2 单次请求控制 PE 的查证入口

**Why:** 2026-11-17 评估开放平台按请求启停提示词增强。请求字段、任务中保存的开关、模型选项快照和下游执行路径需要一致。参考增强类型参与 Athena 路由，无参考素材的变体也可能使用该类型。

## 从入口到推理

- 在 Zeus 回查 [v2 严格请求解析](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/generation-api/src/main/java/co/sandai/zeus/openapi/v2/generations/GenerationRequestDeserializer.java#L26)、[原生与方舟共享的创建服务](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/OpenApiGenerationService.java#L40)、[模型选项转任务快照](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/lattice/ability/openapi/ConfiguredModelTaskAssembler.java#L21)及[派发选项合并顺序](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/modelconfig/AthenaOptionApplier.java#L19)。只改任务布尔值可能被同名快照覆盖。默认值要按本次选中的有效变体回查。既有线上案例和配置读回指针见[国内生产验收入口](magi2-cn-native-production-entrypoints.md)。
- 在 Athena 对照[参考增强准入](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/validators/reference.py#L30)、[独立参考素材校验步骤](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/services/job.py#L794)和[参考增强分支与普通分支的实际派发](https://github.com/world-sim-dev/athena-admin/blob/a1fe83db6121e6577f3e40eae464ee95f54f7006/ApiService/services/job.py#L371)。单独的素材校验覆盖与素材在最终推理中被消费需要各自取证。Zeus [参考输入冻结协议](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/MagiGenerationAdmission.java#L71)是端到端对照入口。

**How to apply:** 设计时保留省略、显式 true 和显式 false 三态。选中变体后决议并冻结有效值，同时核对派发快照及 PE 类型。以实际模型、变体和输入角色决定能力。纯文本关闭要验证模型确实收到原文。参考素材关闭还需逐槽核对输入、参考编号、顺序和首尾帧绑定，继续执行审核和媒体校验。遇到未验证的组合，创建时同步报参数错误。验收用同一模型、种子与输入对照三态，跨一次重新派发核对快照，并追到 Athena 实际入参和生成终态。2026-11-17 为设计和源码核查，部署能力和成片走独立实测。
