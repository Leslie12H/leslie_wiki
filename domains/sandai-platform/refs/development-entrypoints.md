---
name: sandai-api-platform-development-entrypoints
type: reference
created: 2026-10-26
updated: 2026-10-26
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
