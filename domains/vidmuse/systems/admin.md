---
name: vidmuse-admin
type: system
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, frontend]
links: [vidmuse-ai-frontend, test-center-v2-mcp-direct-tool-call, vidmuse-admin-harness]
---

# admin(管理后台)

Vidmuse 管理后台。主仓:`~/Downloads/sandai-code/vidmuse-admin/`。

## 当前确认事实

- 后端是 FastAPI service,主入口在 `apps/admin/app.py`。
- 管理端前端在 `playground/`,使用 Vite 管理构建/开发服务。
- admin API 挂载在 `/admin`,public API 挂载在 `/admin/public`。
- Test Center V2 API 在 `/admin/api/v1/test/v2`,路由入口是 `apps/admin/controller/admin/test_center_v2.py`。
- Test Center V2 前端在 `playground/src/pages/test-center-v2/`。
- 深入知识入口见 [admin 深入知识](../admin/README.md);已有 Test Center V2 / VidMCP harness,见 [vidmuse-admin-harness](../admin/refs/vidmuse-admin-harness.md)。

本地存在多个 release / feature 工作树(说明发版时按版本切目录开发):
`vidmuse-admin-release-20260523`、`-20260602`、`-tcv4-antd`、`-test-center-v4`、
`-email-recall-tests`、`-skill-fixes`、`-analytics-cards`、`-analytics-followup` 等。

## TODO(涉及时现场确认后回填,不臆造)
- [ ] release 工作树的组织约定:为什么按 release 建独立目录?流程是什么?
- [ ] test-center-v4 是什么模块
- [ ] 生产/测试环境的构建、部署方式
