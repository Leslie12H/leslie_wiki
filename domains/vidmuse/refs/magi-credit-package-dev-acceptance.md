---
name: magi-credit-package-dev-acceptance
type: reference
created: 2026-11-24
updated: 2026-11-24
tags: [vidmuse, billing, credits, magi-2, testing]
links: [vidmuse-zeus, vidmuse-testing, magi2-generation-lineage-entrypoints]
---

# VidMuse MAGI-2 专属积分包查证入口

**Why** 价格页展示名、付款商品、钱包批次和真实扣费是四个不同证据。总余额包含专属分，不能用来证明某个模型可用或判断扣掉的批次。预扣可能在完成时补扣，或在失败时返还，必须核对结算状态。

**How to apply** 先核对目标页面、Zeus 镜像提交和支付测试模式。走商品目录、付款订单、账本到账、按模型生成四步。保留发票、批次 ID、画布/任务 ID 和逐次余额快照。测试场景与证据见测试仓 `Vidmuse/docs/tests/2026-11-24-magi-credit-package-dev.md`。

- 海外商品按 Manager 规范 ID 查 `GET /api/v1/credits/package?model=magi-2`。显示名 `MAGI-2` 走精确匹配时会返回空目录。会员来源和目录匹配曾分别修订，查实际部署提交。参考 [会员资格修订](https://github.com/world-sim-dev/vidmuse-zeus/pull/687)、[规范 ID 修订](https://github.com/world-sim-dev/vidmuse-zeus/pull/688) 和 [目录契约恢复](https://github.com/world-sim-dev/vidmuse-zeus/pull/690)。
- 付款回跳成功后，在 DEV 订单列表确认 `PAID`，从 `credits/user` 的 `creditDetailList` 找发票关联的 `PURCHASED` 批次，在 `transaction/by-user` 核对入账流水；按 `usageModel` 和批次余额确认积分用途。Stripe 测试金额与档位沿 [购买契约](https://github.com/world-sim-dev/vidmuse-zeus/blob/main/docs/specs/zeus/model-credit-packages.md) 核实。支付宝有独立商品目录，沿 [支付宝契约](https://github.com/world-sim-dev/vidmuse-zeus/blob/main/docs/specs/zeus/alipay-credit-packages.md) 查当前配置。
- 抵扣核对按 `creditId` 对照 `creditAmountMilli`。显式 `model` 的 `availableCreditAmountMilli` 用于预检，`scopedCreditList` 只表示账户名下的专属批次。用 `threads/{id}/tasks` 和 `credits/transaction/by-thread` 对照实际模型、预扣和终态；跨批次优先级查 `user_credit_transaction_allocation.allocation_order`。逻辑入口见 [专属积分账本](https://github.com/world-sim-dev/vidmuse-zeus/blob/main/docs/specs/zeus/scoped-credit-rewards.md) 和 [Magi 生成任务关联](magi2-generation-lineage-entrypoints.md)。
- DEV 真实短任务只取够覆盖主路径的候选。余额上限不合适时，可在同一部署提交的 `CreditMilliLedgerTest` 基础上用隔离账本构造专属不足、同到期 ID 排序、一般模型余额不足和取消返还，记录本地测试与真实模型试跑的边界。
