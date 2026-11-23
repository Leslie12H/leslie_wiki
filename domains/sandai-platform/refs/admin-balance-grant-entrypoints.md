---
name: sandai-platform-admin-balance-grant-entrypoints
type: reference
created: 2026-11-22
updated: 2026-11-23
tags: [sandai, zeus, admin, billing, balance-grant]
links: [sandai-platform-recharge-settlement-entrypoints, sandai-api-platform-admin-rpm-change-verification-entrypoints]
---

# 开放平台组织赠送余额的操作与回查

**Why**　组织赠送会增加目标组织的可用余额并产生独立流水。管理台可能沿用上一次访问选择的环境，提交前要再次核对站点和组织。台账回查可确认该笔赠送实际入账，也能在回执丢失时定位原操作。

## 查证入口

- [Sand.ai 开放平台管理控制台](https://zeus-admin.sandaii.cn/organizations)。使用有目标站点权限的飞书身份。国内组织可按已验证的完整手机号精确筛选，随后核对唯一组织 ID、账号和组织状态。
- [Zeus 管理操作 SOP](https://github.com/world-sim-dev/zeus/blob/dev/docs/admin-operations-sop.md#3-组织赠送余额)和 [Admin API](https://github.com/world-sim-dev/zeus/blob/dev/docs/admin-api.md)。回查赠送权限、金额币种、有效期与原操作号的处理约定。余额按站点显示的主货币单位填写。
- 2026-11-22 在国内生产核验了「余额与账单 → 赠送余额 → 预览赠送 → 确认赠送」及入账回查。币种和有效期以当次表单及预览为准。具体客户、金额、批次及流水保留在管理台。

**How to apply**　提交前记录原可用余额，在预览核对环境、组织、金额、币种、到期时间和原因。提交后读取回执，再回查余额明细的运营赠送批次和余额流水的入账记录，核对金额、方向和入账时间。结果不明时按原操作号和原参数回查，按管理台的原单恢复流程处理。

## 2026-11-22 赠额后组织余额继续变化

**Why**　活跃组织在赠额提交和回读之间可能产生出账。原发放金额、批次剩余金额和当前可用余额各有自己的口径。

**How to apply**　按原 `operationId` 读取 `amount`、币种和关联流水号，再在余额流水核对同一笔 `IN`。当 `remainingAmount` 或总余额较低时，取赠额到账后的流水，并按方向和金额核对差额。回执中同时记录实际入账、回读时刻与当前余额。根据原操作流水确认结果后，沿该流水继续核对后续出入账。

- 字段口径和流水入口见 [Zeus Admin API](https://github.com/world-sim-dev/zeus/blob/dev/docs/admin-api.md#余额明细与金额口径)。客户资料和订单号保存在当次受限回执。

## 2026-11-23 批量开白与赠额

**Why**　不同工作簿的同名子表可能保留相同的 `sheet_id`。名单的充值安排也可能留空，而管理台已有白名单成员和赠送流水。只看子表 ID 或安排列容易遗漏名单或重复赠送。

**How to apply**　先把飞书 Wiki 链接解析为工作簿 `obj_token`，再用工作簿 token、子表 ID 和版本确认名单。按来源行号留存核对结果，按目标站点和唯一 `orgId` 去重。使用完整注册手机号精确查组织并复核关联账号。缺联系方式或查无匹配的行保留待处理，待取得可核对账号后再执行。

- 开白前在目标站点核对正式模型名称、启用状态和访问策略。逐组织读回确切白名单成员。赠额前核对既有入账和批次，名单空白时也沿同样方式回查。发现已有同额赠送时保留原流水，核实是否已满足本批目标再决定是否补发。
- 本次新增额度按管理台默认有效期预览，逐组织保存操作号。赠送回查以相同操作号关联的入账流水和余额批次为准。逐条业务结果保留在管理台与受限回执。

## 2026-11-23 错赠批次的定向冲销

**Why**　组织可能在短时间内收到多笔赠送。可用额度取余额批次，原入账流水还承担赠送回执和幂等校验。直接覆写原入账金额会破坏回执中的原金额约束。

**How to apply**　先在正确站点用精确账号确认组织，再按创建时间、原始流水和余额批次识别唯一错单。获授权后在主库同一事务核对组织归属、批次 ID、原入账 ID 与两者的请求关联，锁定批次并复核待撤销额度仍未被使用。将该批次剩余金额归零，保留原入账，按余额生命周期既有的过期扣除子类型写入等额冲销，并使用关联原流水的唯一标记。被部分使用的批次需先对账。提交后从管理台分别回读批次、原入账、冲销和组织可用余额，核对其他批次的自然消费。[赠送回执实现](https://github.com/world-sim-dev/zeus/blob/f04eae7afef28dd3941d9a2ff18ffffff0c52782/modules/domain/src/main/java/co/sandai/zeus/domain/credit/grant/OrganizationCreditGrantService.java)
