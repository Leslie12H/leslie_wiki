---
name: vidmuse-admin-deep-knowledge
type: system
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, knowledge-index]
links: [vidmuse-admin, test-center-v2-mcp-direct-tool-call, vidmcp-auth-runtime-context, cdn-user-generated-images-video-cdn, vidmuse-admin-harness]
---

# Vidmuse Admin 深入知识

这里放 **vidmuse-admin 子系统**的深入知识:Test Center V2、VidMCP direct tool call、admin 专属排障、harness、artifact/CDN 展示逻辑等。

不要把整个 Vidmuse 业务域的知识都塞到这里。跨 aion / vidmuse-zeus / vidmuse.ai / admin 的链路和事件,应放回 `domains/vidmuse/projects/` 或对应系统 page。

## Projects

- [2026-06 admin 知识地图](projects/2026-06-admin-knowledge-map.md) — 过去一个月 admin 子系统主题索引。
- [Test Center V2 MCP direct tool call](projects/test-center-v2-mcp-direct-tool-call.md) — `mcp_tool_call` case/job/run 闭环。

## Pitfalls

- [VidMCP auth/runtime context](pitfalls/vidmcp-auth-runtime-context.md) — `MCP_URL` / bearer token / `X-Auth-*` 职责边界。
- [CDN user-generated images](pitfalls/cdn-user-generated-images-video-cdn.md) — `aion-user-base/assets/images` 应走 video CDN。
- [admin 定时报表机制与死配置](pitfalls/admin-scheduled-report-mechanisms.md) — 两套定时机制、`BugBotConfig.schedules` 是死配置、`app.py` 启动总闸、`FeishuMessageClient` 的 webhook/chat_id 优先级坑。
- [监控大盘窗口与「天」的口径](pitfalls/monitoring-dashboard-window-and-day-semantics.md) — `created_day` / investigation activity / alert activity 三套基准,以及全量 vs 窗口计数。

## Refs

- [vidmuse-admin harness](refs/vidmuse-admin-harness.md) — Test Center V2 / VidMCP harness 指针。

## 判断是否属于这里

放这里:

- 主要修复入口在 `~/Downloads/sandai-code/vidmuse-admin/`。
- 主要验证方式是 `make harness-*`、admin API、Test Center V2 UI 或 admin 前端测试。
- 知识只影响管理后台或 Test Center V2 的展示/评测/调试体验。

不要放这里:

- aion / vidmuse-zeus / vidmuse.ai 的产品主链路事实。
- credits/billing/render completion 这种跨服务影响范围。
- 需要多个子系统共同理解的业务事件。
