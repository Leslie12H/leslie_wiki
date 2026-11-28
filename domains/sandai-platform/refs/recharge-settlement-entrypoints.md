---
name: sandai-platform-recharge-settlement-entrypoints
type: reference
created: 2026-11-11
updated: 2026-11-28
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

## 对公汇款漏通知与资金处理的查证

2026-11-12 按国内生产发布版本复核。对公汇款先有渠道资金，再经资金通知、认款及权威查单生成本地履约证据。排查时按[资金通知与认款流程](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/docs/zeus/alipay-bank-transfer-api.md#L109-L160)核对收款绑定、付款主体、原资金号、认款请求号、订单和积分流水，按[对账与恢复](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/docs/zeus/alipay-bank-reconciliation-api.md#L9-L43)区分已知待处理、需人工核对、漏通知和退款。

银行账单任务与网页查单任务各自调度，任务 ID 回查生产清单。诊断自动发现时同时读 SchedulerX 结果的 `enabled`、`discoveryEnabled` 和超管只读对账状态中的最近成功账单日期、失败账单及未解决差异。理由和步骤见[银行账单调度结果](https://github.com/world-sim-dev/zeus/blob/4e8b927d966b4bdff9f901eee13bf668086313a4/docs/zeus/alipay-bank-reconciliation-api.md#L130-L159)。资金通知漏送要按原签名和原资金号恢复。停用前核对客户已保存的收款账号、原商户与未决资金，退款时回查对应积分流水。

## 2026-11-25 组织与邮箱域名充值准入验收

先确认目标地区运行的 Platform 镜像包含这次变更，再核对该进程实际加载的 `zeus.platform.recharge.mode`，以及当地至少一个渠道和对应币种已启用。`OPEN` 会放行全部组织，`CLOSED` 会关闭充值，这两种模式下的结果都无法证明某条白名单已命中。模式和返回码查 [Zeus #528](https://github.com/world-sim-dev/zeus/pull/528)。

在 `ALLOWLIST` 下使用三个已正常登录的测试组织，逐一确认名单条件：仅组织 ID 命中、仅所有者已验证邮箱的完整域名命中、两项均未命中。域名按小写完整匹配。需要验证匹配边界时，可用仅父域列入名单的子域邮箱，或域名命中但邮箱未验证的所有者作对照。组织所有者身份及有效状态的取数条件见 [PlatformRechargeAccess 测试](https://github.com/world-sim-dev/zeus/blob/8550c36bdc54c3f398da1ee61e54119e6dfe4895/modules/domain/src/test/java/co/sandai/zeus/domain/payment/PlatformRechargeAccessTest.java)。

分别读取 `GET /api/v1/platform/payments/methods` 的 `rechargeEnabled` 和渠道启用状态。对于两项均未命中的组织，以已启用渠道的有效请求验证发起端返回 HTTP 403 和业务码 `00002`。未登录、无效参数或渠道不可用的回执无法定位到白名单判断。入口说明和故障降级行为见 [充值部署文档](https://github.com/world-sim-dev/zeus/blob/8550c36bdc54c3f398da1ee61e54119e6dfe4895/deployment/README.md)。

## DeepSeek 企业认证与对公充值渠道查证

**Why**　同一个「对公打款」表述可指企业身份核验时的小额验证，或企业通过银行给 API 余额充值。在线充值方式、充值收款银行、实名认证的服务商分别需要对应的证据。

**How to apply**　先读 [DeepSeek 开放平台官方 FAQ](https://static.deepseek.com/faq/index.html?lang=zh) 的「如何充值」与「个人认证账号可以更改为企业实名账号吗」。企业实名认证后的收款主体、开户行和专属账号在 [充值 → 对公汇款](https://platform.deepseek.com/top_up) 当场核对。2026-11-28 登录只读查到了充值收款行和「企业实名认证」入口。个人账号跳转到企业认证前先提示变更的不可逆性，因此核查停在确认前。

认证小额打款的实际付款方看认证页服务协议或脱敏的认证入账回单，避免把充值收款行或在线扫码渠道当成核验服务商。[开放平台隐私政策](https://cdn.deepseek.com/policies/zh-CN/deepseek-open-platform-privacy-policy.html)的「身份及企业认证信息」和「委托服务提供商处理」可作为公开资料入口。本次材料未证实小额验证用的具体服务商。
