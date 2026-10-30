---
name: sandai-api-platform-postman-entrypoints
type: reference
created: 2026-10-26
updated: 2026-10-30
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

## 2026-10-30 Staging 国内与海外路由拆分

**Why:** 用户提供两个 Staging 平台要求配置 Postman。旧本地说明将 Staging 控制台 API 视为地区共用，当前在线两地区平台实际请求和前端远端 main 的地区解析已不同，不能以初始化快照覆盖部署事实。

- 当前两地区控制台 API、前端 Origin、桌面导入与回读截图、无凭据系统配置 GET 结果和生成 API 待确认范围，查工作区 `postman/reports/staging-environments-20261030/README.md`、`origins.json`、PNG，以及 `postman/README.md`。
- 对应环境是 `postman/environments/staging-{cn,global}.postman_environment.json`；生成入口 `postman/scripts/generate.py` 已保留地区差异，避免重新生成回退。配置当前值仍需现场核验，此页不复制运行时地址。
- 前端部署路由来源查 `world-sim-dev/sandai-website` 的 `packages/site-config/src/index.ts` 与在线平台实际资源请求。远端引用刷新与本地 checkout 更新分别报告；本次未切换或覆盖业务仓库工作。
- 公开文档中的生产生成示例不能代表 Staging OpenAPI；没有明确 Staging 生成域名时保留空值并请求地址，不迁移 Dev Key / Cookie。

**How to apply:** 在既有工作区与环境上更新，导入同 ID 环境时核对 Replace 结果和唯一环境条目；回读实际变量及当前选中环境。配置接口 GET 200 与登录、生成、扣费验收分开。现有 v2.1 导出 JSON 的格式校验与新版 CLI v3 lint 支持范围分别记录，不能把后缀/格式不支持报告为 lint 通过。

### 2026-10-30 后续从实际 Ingress 确认生成入口

**Why:** 用户明确要求自行查明 Staging 生成地址；前端公开文档仍显示生产示例，代码仓库未完整管理香港公网 Ingress，仅停在模板不足以定位。

- 已从仓库工作流定位香港 ACK 目标，再在阿里云控制台只读查看 default 命名空间的实际 Staging 两条 Ingress，分别对应国内/海外 OpenAPI Service。精确域名、路径、后端映射与公开描述的 servers、v2 路径及无凭据鉴权响应证据，回查同一报告的 `ingress-proof.json` / `openapi-verification.json` 与最新 PNG。
- 同一报告后续部分已取代初查“生成地址待确认”的状态；两套桌面环境与本地生成器均已补齐，凭据为空。当前运行时地址仍需沿真实路由与公开描述重新核验，不从域名命名规律猜测，不迁移其他环境 Key。

**How to apply:** 查生成入口时优先将实际 Ingress 主机、OpenAPI Service、公开 schema.servers 和无凭据 v2 错误契约相互对应。只读发现路由不等于生成业务验收；无凭据查询不创建任务、不扣费。无需为找地址而读取 Secret、生成新 kubeconfig 或改集群。
