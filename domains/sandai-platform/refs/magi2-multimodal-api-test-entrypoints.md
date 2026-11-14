---
name: sandai-platform-magi2-multimodal-api-test-entrypoints
type: reference
created: 2026-11-12
updated: 2026-11-14
tags: [sandai, api-platform, magi2, multimodal, testing]
links: [sandai-api-platform, sandai-api-platform-development-entrypoints, sandai-api-platform-v2-input-validation-entrypoints]
---

# Magi2 全模态 API 测试查证入口

**Why:** 2026-11-12 用户指定以 Magi2 为测试对象，参考协议对齐文档设计全模态参考生成用例。评审稿、协议实现和各地区公开契约需要分别核对。

- [接口限制对比与 Sand.ai 开放平台接口协议对齐](https://j0yswlgboxz.feishu.cn/docx/Nd6udn6ejo3Xwvxritec3HYFn7f)。从 Magi-2 列定位计划能力，从“限制实现”列和评论回查校验责任、待定规格、音轨和水印；本次读到 revision 670。
- [国内公开 OpenAPI Schema](https://api.sandai.cn/openapi.json)及[海外公开 OpenAPI Schema](https://api.sand.ai/openapi.json)。逐地区核对公开路径、请求结构和已发布的默认值；部署版本与组织模型权限另查。
- [Zeus v2 生成接口说明](https://github.com/world-sim-dev/zeus/blob/dev/docs/openapi-v2-generations.md)及[既有 v2 参数专项入口](v2-input-validation-entrypoints.md)。用于回归已发布的创建、查询和交付契约，按目标分支确认全模态及兼容层实现。

**How to apply:** 在评审时冻结地区、模型变体、协议版本、合法素材组合和实际生效的规格。每类素材用单变量覆盖数量、字节、时长、真实容器和内部编码，再覆盖单素材与累计约束同时生效的组合。先用分类上限和计数范围验证混合总数边界是否可达。两套协议复用同一套输入素材，比较字段映射、有效参数、终态、错误语义与产物规格。API 层拒绝检查任务和扣费副作用，预处理失败检查公开终态、费用结算及并发释放。成功用例检查下载、媒体探测和少量人工成片验收；待定项带来源和版本留待签字。

## 2026-11-14 美国生产双协议派发查证

**Why:** 指定模型在管理后台可选的规格与 Athena 创建作业前的校验存在差异。两种协议都可能返回 Zeus 任务 ID，随后在下游提交阶段失败。

- [Zeus #484 当前联调版本的方舟接口说明](https://github.com/world-sim-dev/zeus/blob/2c8bcabfe8cd56a7ebeef56333c50f8b6108049f/docs/openapi-ark.md)。沿实际部署提交核对兼容路径及查询契约，[美国模型配置入口](https://zeus-admin.sandaii.cn/platform/models/12)用于复核模型变体和组织准入。
- 当次脱敏创建和查询回执、dispatcher 日志及精确任务状态回读在工作区 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/magi2-us-v2-ark-smoke-20261114/`。查 `dispatch-db-readback.json` 的下游校验字段与退款状态，以及 `dispatcher-1080p-initial.txt` 的 Athena Job ID。线上状态和有效规格以现场回读为准。

**How to apply:** 取同组织的已审核素材，双协议使用同一参数。收到任务 ID 后，按该 ID 查询公开状态，并从 dispatcher 的 `task_submitted` 事件确认下游 Job ID。提交失败时按组织和测试任务 ID 只读投影 `dispatch_control.last_error`、提交尝试次数、作业 ID 和退款状态。明确被拒且未创建下游作业时，按失败字段修正单一变量并保留前后请求证据。客户端提交结果未知时按原请求 ID 追查。


## 2026-11-14 国内方舟实名准入查证

**Why:** 同一已授权测试组织、模型、参考图与生成参数下，原生 V2 成功派发，方舟返回通用模型权限错误。方舟错误映射可覆盖创建阶段的实名拒绝。

- [当时部署版本的入队实现](https://github.com/world-sim-dev/zeus/blob/2c8bcabfe8cd56a7ebeef56333c50f8b6108049f/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/OpenApiTaskEnqueueService.java#L45-L48)按 `nativeV2` 区分两条创建路径。[任务服务实现](https://github.com/world-sim-dev/zeus/blob/2c8bcabfe8cd56a7ebeef56333c50f8b6108049f/modules/domain/src/main/java/co/sandai/zeus/domain/service/impl/TaskDomainServiceImpl.java#L112-L123)限定常规路径检查实名。[国内准入源码](https://github.com/world-sim-dev/zeus/blob/2c8bcabfe8cd56a7ebeef56333c50f8b6108049f/modules/domain/src/main/java/co/sandai/zeus/domain/identity/DomesticAccessService.java#L40-L49)用于核对具体认证条件。
- 当次事实沿工作区 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/magi2-cn-us-v2-ark-1080p-20261114/` 的 `cn-ark-create.json`、`cn-openapi-compare.txt`、`cn-org-access.json` 和两区 dispatcher 日志回查。

**How to apply:** 国内方舟出现 403 时，用请求 ID 确认拒绝阶段，并分别读取模型白名单和组织认证状态。压测或冒烟需要国内方舟实际入队时，预检同一专用组织具备真实认证以及模型权限。两区准入行为随部署和配置重新核对。
