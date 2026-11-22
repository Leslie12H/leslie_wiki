---
name: sandai-platform-admin-balance-grant-entrypoints
type: reference
created: 2026-11-22
updated: 2026-11-22
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
