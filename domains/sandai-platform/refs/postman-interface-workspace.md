---
name: sandai-api-platform-postman-entrypoints
type: reference
created: 2026-10-26
updated: 2026-10-26
tags: [sandai, api-platform, postman, api, testing]
links: [sandai-api-platform, sandai-api-platform-development-entrypoints]
---

# API 开放平台 Postman 接口工作区入口

**Why:** 2026-10-26 用户要求在 Postman 建立基础工作区并整理所需接口。需把控制台登录态与对外生成认证分开，避免将接口已配置或导入成功说成已完成真实联调。

## 回查入口

- 桌面 Postman 工作区名称：`Sand.ai API Platform`。创建时用户明确确认仅本人及受邀者可见，未邀请成员；当前权限和环境需回到工作区查看。
- 本地配置与使用说明：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/README.md`。
- 接口索引与逐项代码来源：同目录 `interface-list.md`、`interface-list.json`。
- 集合与环境模板：同目录 `console.postman_collection.json`、`openapi.postman_collection.json`、`environments/`；生成入口为 `scripts/generate.py`。
- 源码归属、PRD 与首发 TODO：[研发入口](development-entrypoints.md)。本页不复制接口正文或固定环境地址；以后按当前 Controller / DTO 和部署来源重新核对。

## 使用边界

- 控制台依靠域内 Cookie Session；生成 OpenAPI 使用独立地址与 Bearer Key，不能从控制台域名推断生成入口。缺少证据的地址保留空值。
- 配置模板不带真实凭据，脚本不转存一次性完整 Key。Postman 的 secret 标识不能代替本地值/Vault 与同步范围核对。
- GET 也可能有副作用：Stripe 票据下载会请求发邮件，支付/认证查询可能向供应商核对。按请求说明操作，不直接批量运行混合业务动作的集合。
- 支付/认证/开票采用原参数与稳定幂等键恢复；生成 POST 不保证幂等，结果未知不能盲目重发。具体行为以当前源码为准。

**How to apply:** 先查看本地 README 的导入回读与离线校验记录，再选择环境、补齐本人授权的本地凭据及对象ID。接口格式验证、Postman 导入、在线响应和业务完成分别取证；初次配置时没有执行业务请求；后续在线测试见 [Dev Global 联调入口](global-api-acceptance-20261026.md)。
