---
name: vidmuse-aion
type: system
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, backend, aion]
links: [vidmuse-zeus, vidmuse-ai-frontend, vidmuse-repo-scan-aion-vidmuse-zeus-vidmuse-ai-2026-07-02]
---

# aion(agent/runtime/media generation 后端平台)

本地:`~/Downloads/sandai-code/aion/`。

## 当前确认事实

- Python / uv workspace,根 `pyproject.toml` 要求 Python `3.10.18`。
- workspace 成员:`apps/manager`,`apps/runner`,`apps/vidflow`,`apps/vidmcp`,`packages/*`。
- 根 README 将主模块概括为:
  - `manager`: API service
  - `runner`: agent runtime
- 共享 packages 包含 `schemas`,`artifact_manager`,`checkpoint_manager`,`cost_manager`,`message_manager`,`dsl_manager`,`timeline_manager`,`memory_client`,`data_reporter`,`event_emitter`,`api_aggregation_adapter`,`feishu_client` 等。

## 子模块定位

### manager

Thread Manager API,FastAPI 服务。README 描述它负责项目/API key、JWT、Agent 线程、工作流执行和 Swagger 文档。

代码入口 `apps/manager/app.py` 挂载了四组子应用:

- `/public` — public thread/config/upload/scene KB/task worker 等路由。
- `/private` — private project/thread/task/message/test/user plan/model API 等路由。
- `/manager` — manager-authenticated thread/message/task/config/execution log/MCP async task/runner auth/template 等路由。
- `/model` — standalone model API。

基础探活:`/health`。

Vidmuse 产品侧的 adventurer `/api/v2/threads` 并不是直接暴露 AION 给浏览器,而是由 `vidmuse-zeus` relay 到 AION manager 的 `/public/api/v2/threads/**`。

### runner

Agent runtime。根 README 的本地 demo 入口是 `apps/runner/examples/oneshot-agent/narrative/main.py`。

### vidflow

Inngest worker service。负责挂载 `/api/inngest`,提供 `/health` 和 `/metrics`,并从 `vidflow_tasks/` 自动发现 workflow。README 明确提到的业务逻辑包括 draw shot image/reference、generate shot video/avatar audio、render video。

### vidmcp

FastMCP / Streamable HTTP MCP server,默认 MCP endpoint `/mcp`,health `/health`。README 列出的工具包括 `generate_image`,`generate_video`,`generate_music`,`generate_speech`,`analyze_music`,`download_file`,`recall_art_style`。

长耗时工具支持 `call_async=true` 后走 `_aion_async` handoff,依赖 `MANAGER_URL`,并由 AION runner 在 planner turn barrier 等待最终结果。

## 常用命令

```bash
uv sync --all-packages
```

```bash
cd apps/manager
PYTHONPATH=. uv run fastapi dev
```

```bash
cd apps/runner
PYTHONPATH=. uv run examples/oneshot-agent/narrative/main.py
```

```bash
cd apps/vidflow
uv sync
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

```bash
cd apps/vidmcp
uv sync
uv run python main.py
```

## 注意

- aion 更像 agent/runtime/media generation 平台,不要把它简单理解成 vidmuse-zeus 那种用户产品 REST API。
- manager 的 README 与根 README 对数据库环境变量示例不完全一致;改数据库相关代码或配置前必须读目标环境实际配置。
- VidMCP 与 admin 的 direct tool call 排障细节在 [admin 知识区](../admin/README.md),不要把 admin 专属经验直接套到 aion 全域。
