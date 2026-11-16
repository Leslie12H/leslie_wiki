---
name: sandai-api-platform-model-pricing-entrypoints
type: reference
created: 2026-11-16
updated: 2026-11-16
tags: [sandai, api-platform, magi, pricing, billing]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-admin-rpm-change-verification-entrypoints]
---

# 开放平台模型定价查证入口

## Why

2026-11-16 查证 Magi 开放平台模型定价和更改方式。模型管理、生成费率、充值与余额折算分属不同入口。一个推理参数被生成计费读取，因此只看后台表单或名字含 pricing 的接口容易选错改动位置。

## How to apply

1. 在 [Zeus Admin 模型配置](https://zeus-admin.sandaii.cn/platform/models) 分别选择国内和美国生产。用中央 GET `/admin/api/v1/sites/{site}/model-configs` 列出启用项，再读取 `/model-configs/{id}`。按候选路由核对 `variants[].options.nSampleSteps`，缺省时检查公共 `options`。同时核对源类型、规格约束、白名单和对应接口。控制台说明和保存契约见 [Admin API](https://github.com/world-sim-dev/zeus/blob/dev/docs/admin-api.md#模型配置与白名单)。
2. 依据部署 SHA 的 [MagiCreditAbility](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/lattice/ability/credit/MagiCreditAbility.java)、[CreditUtils](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/util/CreditUtils.java) 和 [HighQualityStrategyUtils](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/task/HighQualityStrategyUtils.java) 回查基础费率和质量倍数。用 [ConfiguredModelTaskAssembler](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/lattice/ability/openapi/ConfiguredModelTaskAssembler.java) 核对用于计费的步数字段，也要查该字段对应的推理参数。v2 创建时由 [OpenApiGenerationService](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/OpenApiGenerationService.java) 用请求时长构造任务块，再由 [OpenApiTaskEnqueueService](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/OpenApiTaskEnqueueService.java) 在入队的事务中扣费。
3. 货币换算另查 [CreditAmountConversion](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/credit/CreditAmountConversion.java)、区域实际配置及支付 pricing GET。用同一任务的已知请求时长对照 Admin GET `/tasks/{taskId}` 的 `chargedCredits`、`chargedAmount`、`currency` 和退款状态。2026-11-16 已回读双区测试组织的历史任务。文生样本入口为工作区 `.local/aspect-ratio-retest-20261116-1556/REPORT.md` 中两区成功的 4 秒 v2 / 方舟用例，参考素材样本入口为 `.local/generation-parameter-acceptance-20261116/{cn,us}/CASES.md` 中成功的 v2 图片参考用例。当前价格和允许的规格随现场回读。
4. 需要变更推理步数时，由目标区域有 `model.config.write` 权限的员工先读旧配置和 revision，再以完整 `config`、`expectedRevision` 和 `reason` 保存并回读。跨过计费步数阈值会同时影响实际推理与计费，需要单独验收。独立更改基础费率或增加按模型、规格、地区的价格，需要改 Zeus 计费规则并按 [Magi 发布手册](https://github.com/world-sim-dev/zeus/blob/dev/deployment/magi/README.md) 发布目标区域的生成入口。检查 v2、方舟及 Playground 的扣费与账单一致性。已扣费用 [任务结算与退款文档](https://github.com/world-sim-dev/zeus/blob/dev/deployment/scripts/task-credit-refund.md) 查原始扣款和退款。
