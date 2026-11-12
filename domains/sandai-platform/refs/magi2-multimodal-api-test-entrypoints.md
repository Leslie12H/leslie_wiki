---
name: sandai-platform-magi2-multimodal-api-test-entrypoints
type: reference
created: 2026-11-12
updated: 2026-11-12
tags: [sandai, api-platform, magi2, multimodal, testing]
links: [sandai-api-platform, sandai-api-platform-development-entrypoints, sandai-api-platform-v2-input-validation-entrypoints]
---

# Magi2 全模态 API 测试查证入口

**Why:** 2026-11-12 用户指定以 Magi2 为测试对象，参考协议对齐文档设计全模态参考生成用例。评审稿、协议实现和各地区公开契约需要分别核对。

- [接口限制对比与 Sand.ai 开放平台接口协议对齐](https://j0yswlgboxz.feishu.cn/docx/Nd6udn6ejo3Xwvxritec3HYFn7f)。从 Magi-2 列定位计划能力，从“限制实现”列和评论回查校验责任、待定规格、音轨和水印；本次读到 revision 670。
- [国内公开 OpenAPI Schema](https://api.sandai.cn/openapi.json)及[海外公开 OpenAPI Schema](https://api.sand.ai/openapi.json)。逐地区核对公开路径、请求结构和已发布的默认值；部署版本与组织模型权限另查。
- [Zeus v2 生成接口说明](https://github.com/world-sim-dev/zeus/blob/dev/docs/openapi-v2-generations.md)及[既有 v2 参数专项入口](v2-input-validation-entrypoints.md)。用于回归已发布的创建、查询和交付契约，按目标分支确认全模态及兼容层实现。

**How to apply:** 在评审时冻结地区、模型变体、协议版本、合法素材组合和实际生效的规格。每类素材用单变量覆盖数量、字节、时长、真实容器和内部编码，再覆盖单素材与累计约束同时生效的组合。先用分类上限和计数范围验证混合总数边界是否可达。两套协议复用同一套输入素材，比较字段映射、有效参数、终态、错误语义与产物规格。API 层拒绝检查任务和扣费副作用，预处理失败检查公开终态、费用结算及并发释放。成功用例检查下载、媒体探测和少量人工成片验收；待定项带来源和版本留待签字。
