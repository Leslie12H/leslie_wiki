---
name: sandai-api-platform-staging-cn-generation-invoice-verification
type: reference
created: 2026-11-05
updated: 2026-11-05
tags: [sandai, api-platform, staging, openapi, invoice, testing]
links: [sandai-api-platform-postman-entrypoints, sandai-api-platform-development-entrypoints]
---

# 国内 Staging 生成与企业开票验收

**Why:** 2026-11-05 用企业测试账号的 Key 触发一次生成，为企业开票验收准备消费。公开 OpenAPI 描述示例中的模型被部署返回 `model_not_supported`，明确未受理。换用测试模型后唯一一条任务成功，当前控制台会话的 Key 列表未匹配该 Key，账单和开票仍需在归属账号验证。当天生成结果只作历史证据，模型启用状态需要重新查证。

**How to apply:**

1. 先按 [Postman 工作区](postman-interface-workspace.md) 和国内 Staging Ingress 确认环境。公开 schema 能证明路由与协议，模型是否可用应查同环境管理后台模型配置、启用状态和组织权限。预检用只读 GET。生成 POST 不保证幂等，遇到响应未知应先查已受理任务。若服务明确在模型校验处拒绝且没有任务，再考虑纠正参数。
2. 分开核对生成终态、用量明细、符合开票资格的历史消费、申请及 PDF 归档。用量回读前在同一环境用控制台登录会话确认 Key 归属，再以任务 ID 对账。仅凭 Bearer Key 或生成成功无法确认充值批次、实际消费额或开票额度。
3. 沿 [研发入口](development-entrypoints.md) 回查 Zeus 的 `docs/zeus/enterprise-monthly-invoice-application-api.md` 及企业月度申请服务。核对北京时间消费月份、充值付款归属和月度额度。若当天需要验收开票，应查已有可申请额度的历史月份，再独立核对审批和 PDF 归档。
4. 当次脱敏回执入口为平台工作区 `.local/staging-cn-enterprise-invoice-20261105/`，其中有首次拒绝、唯一受理和终态三份证据。该目录不入 Git。
