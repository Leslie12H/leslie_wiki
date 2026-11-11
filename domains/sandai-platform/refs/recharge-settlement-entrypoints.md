---
name: sandai-platform-recharge-settlement-entrypoints
type: reference
created: 2026-11-11
updated: 2026-11-11
tags: [sandai, zeus, recharge, alipay, stripe, reconciliation]
links: [sandai-api-platform, sandai-api-platform-development-entrypoints]
---

# 开放平台充值入账与对账查证入口

**Why**　渠道扣款与平台积分发放有各自的提交点。排查已付款未到账时，要同时找到渠道付款、平台充值订单、账单和积分流水，才能判断是回调未送达、本地回滚、商户归属不符，还是页面尚未读到结果。

## 查证入口

- 2026-11-11 审查以两地 Platform 发布回执为源码入口。镜像和就绪证据见 [国内发布](https://github.com/world-sim-dev/zeus/actions/runs/42779696381)及[海外发布](https://github.com/world-sim-dev/zeus/actions/runs/42782830899)。重查时按区域核对实际 Platform 镜像及商户，再切到对应 SHA。
- 本地入账原子性和幂等查 [支付宝结算](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/modules/domain/src/main/java/co/sandai/zeus/domain/payment/alipay/AlipaySettlementService.java#L46-L146)、[Stripe 结算](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/modules/domain/src/main/java/co/sandai/zeus/domain/payment/stripe/StripeCreditPaymentService.java#L373-L471)和共享积分 DAO。跟踪订单行锁、渠道流水唯一约束、入账后检查、账单与积分流水及终态提交。故障注入与并发入口为 `AlipayPaymentTransactionTest`、`StripeCreditPaymentTransactionTest`。
- 支付宝按 WEB、WAP、企业收银台及银行转账核对补偿入口。WEB 需核对 [SchedulerX 任务与扫描条件](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/docs/zeus/payment-alipay-api.md#L287-L323)、Worker、最近运行及失败积压。任务 ID 和上线前状态查[国内上线清单](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/deployment/reports/prod-cn-prelaunch-checklist-20261105.md#L53-L64)。企业和银行分别沿各自的查单与对账任务核验。
- Stripe 查 [Webhook 与重试窗口](https://docs.stripe.com/webhooks#automatic-retries)、`InvoicePaidEventHandler`、`StripeCreditPaymentService.query / returned`、`AdminBillingService.reconcile` 和 [Stripe 商户迁移约束](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/deployment/magi/stripe-migration/README.md#L5-L11)。查漏单时同时确认用户是否回跳、原单是否已绑定 Session、事件是否送到当前商户端点及是否存在商户切换前未决单。核对自动扫单是否有独立实现与运行回执。

**How to apply**　以渠道确认实收但本地未履约的订单差集做对账，保留原商户和原单号，使用已有查单结算路径复核恢复。补偿测试覆盖回调缺失且用户离开、积分流水写失败后回放、同笔回调与查单并发、付款成功后响应丢失。生产任务在线状态和实际差额需另行读取，2026-11-11 的源码与发布核查未执行真实付款。

## 秒级调度成功轮次的查证

2026-11-11 生产只读核查发现，`second_delay` 的每轮执行记录在持续运行的主实例内。只查最近几小时的实例开始时间，或只筛主实例 `Status=4`，都可能漏掉正在正常循环的任务。

通过 [GetJobInfo](https://api.aliyun.com/api/schedulerx2/2019-04-30/GetJobInfo) 核对启用状态，使用 [GetWorkerList](https://api.aliyun.com/api/schedulerx2/2019-04-30/GetWorkerList) 核对同一应用分组。在控制台只能看到默认命名空间时，可用已登录的 OpenAPI Explorer，按[生产任务清单](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/deployment/reports/prod-cn-prelaunch-checklist-20261105.md#L53-L64)指定地域、命名空间 ID、应用分组和任务 ID。

用 [GetJobInstanceList](https://api.aliyun.com/api/schedulerx2/2019-04-30/GetJobInstanceList) 查询覆盖主实例启动的时间范围，保留运行中状态。读取完整调用结果的 `Progress.recentProgressHistory`，按 `success=true` 和 `endTime` 找最新完成轮次，毫秒时间戳按北京时间展示。[秒级任务历史说明](https://help.aliyun.com/zh/schedulerx/schedulerx-serverless/use-cases/create-second-delay-jobs)。运行成功只能确认调度结果，实际扫单和入账数量沿业务结果另查。
