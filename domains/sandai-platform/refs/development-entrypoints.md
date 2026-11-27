---
name: sandai-api-platform-development-entrypoints
type: reference
created: 2026-10-26
updated: 2026-11-27
tags: [sandai, api-platform, prd, frontend, zeus, development]
links: [sandai-api-platform]
---

# API 开放平台研发入口

**Why:** 2026-10-26 用户指定官网/平台前端、Zeus 后端和 PRD，要求初始化跨仓库 Codex 工作区。代码和文档会继续变化，此页仅记录回查入口与使用边界。

## 权威来源

- 前端：[world-sim-dev/sandai-website](https://github.com/world-sim-dev/sandai-website)。官网、开放平台、地区配置和 API 适配由该仓库 README / docs 导航。
- 后端：[world-sim-dev/zeus](https://github.com/world-sim-dev/zeus)。不是 VidMuse 的 `vidmuse-zeus`；控制台入口查 `modules/api`，外部生成入口查 `modules/openapi`，领域逻辑查 `modules/domain`。
- [API 开放平台需求](https://j0yswlgboxz.feishu.cn/wiki/RAgUwdQ9biHj6YkSvU0cyX4Xnmc)。
- [开放平台 1031 版本 TODOs](https://j0yswlgboxz.feishu.cn/wiki/QRgdwd8zOicGktk0c59czsmYnle)：历史排期和任务入口，不能把勾选当成部署或验收回执。
- 本机工作区：`/Users/leslie/Documents/ChatGPT/Apipltform/`。根 README / AGENTS.md 为导航和协作入口，两个子目录保持独立 Git 仓库。
- 本次精确分支/SHA/文档 revision 和验证结果：工作区 `workspace-sources.json`、`docs/initialization.md`。这些是 2026-10-26 的初始化证据，不代表后续最新状态。

## 下次如何查证

1. 先查各仓库 remote、默认分支、HEAD 和未提交修改；本次入口分支是前端 main、后端 dev，后续仍需现场核对。
2. 读工作区 `docs/requirements-map.md`，按功能进入前端适配与后端 Controller / Service / DTO / tests。控制台 Cookie Session 与外部 Bearer Key 分开验证。
3. 需求差异沿原 PRD、关联 TODO 和当前源码核对：工作区已记录充值金额、发票周期、企业按月申请及结果 URL 有效期的对照指针；不要用旧前端接入文档断言后端缺功能。
4. 开发环境看 `docs/development.md`。若 README 引用模板但克隆中不存在，先取得脱敏配置清单，不从其他业务或生产复制凭据。Java toolchain、pnpm 和依赖版本以当前构建文件为准。
5. Zeus `docs/zeus/README.md` 说明部分文档由共享源生成，修改应走源文件与发布脚本；不要直接覆盖生成文档。

**How to apply:** 后续开发从该工作区继续，以实时 PRD 和代码为准；preview、基础检查、实际联调、部署及首次生成成功分别报告。私有读取响应保存在忽略的 `.local/`，不把文档正文或凭据复制进知识库。

## Platform ERROR 告警与手机号登录业务拒绝

**Why:** 2026-11-27，上海生产手机号登录 HTTP 400 触发 Platform ERROR 告警。日志切面把这次业务拒绝记为一条 ERROR。告警规则按 ERROR 日志级别计数，业务码 `00900` 也可触发。告警只提示请求处理失败时，HTTP 状态、业务错误码和触发规则仍可分别查证。实际 `errorKey` 在该样本中未记录，不能根据 `00900` 判定具体验证分支。

**How to apply:** 从 [上海 Platform ERROR 规则](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/alert/alert-1794831493-905681?slsRegion=cn-shanghai) 的 `internal-alert-history` 取触发评估窗口、`Results` 的计数和 `sample_trace`。按 Trace ID 在上海 Zeus SLS 同时读 `RequestCompletionLog` 的 HTTP 状态、`DigestLogger` 的 Controller 和业务码、`ErrorLogger` 的脱敏情况。缺 `errorKey` 时沿 [手机号登录入口](https://github.com/world-sim-dev/zeus/blob/b9a13124e27232ef794ab8b66d5bbadb7845de47/modules/api/src/main/java/co/sandai/zeus/api/user/PhoneLoginController.java) 和服务实现核对可能分支，精确分支以客户端原响应或同一 Trace 的允许日志为准。告警通知与恢复从 [开放平台监控告警群](https://applink.feishu.cn/client/chat/open?openChatId=oc_290876bfe3d0050c2ab37ef63aec3a34) 核对；案例见 [触发卡片](https://applink.feishu.cn/client/chat/open?openChatId=oc_290876bfe3d0050c2ab37ef63aec3a34&position=794)。
