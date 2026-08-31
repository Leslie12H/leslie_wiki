---
name: vidmcp-auth-runtime-context
type: pitfall
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, vidmcp, auth, mcp]
links: [vidmuse-admin, test-center-v2-mcp-direct-tool-call]
---

# VidMCP Auth 与 Runtime Context 容易混淆

Test Center V2 里 admin 调 VidMCP 时,调用源是 admin service,不是 thread container。排查时要分清两层:

- 连接 VidMCP endpoint: 看 `MCP_URL` 和 bearer token。
- 绑定工具调用上下文: 看 `X-Auth-Thread-Id`, `X-Auth-User-Id`, `X-Auth-Project-Id`。

## 当前确认事实

- `MCP_URL` 是 admin service 访问 VidMCP `/mcp` 的 endpoint。
- `AION_MANAGER_JWT` / `MCP_AUTH_TOKEN` 可作为 VidMCP HTTP client 的 bearer token 来源。
- `X-Auth-Thread-Id` 用于把 VidMCP 工具调用绑定到目标 thread runtime context。
- `X-Auth-User-Id` 和 `X-Auth-Project-Id` 由 runtime context 解析后一起传给 VidMCP。
- `/mcp/tools` 在 `MCP_URL` 未配置时会 fallback 到标准静态 catalog,避免工具选择器直接坏掉。

## 代码指针

- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/clients/vidmcp_client.py`
- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/mcp_runtime.py`
- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/controller/admin/test_center_v2.py`
- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/adapters/mcp_tool_call_adapter.py`

## 验证命令

```bash
make harness-mcp-tools
THREAD_ID=<existing_thread_id> make harness-tcv2-mcp-case
uv run pytest apps/admin/tests/test_center_v2/test_vidmcp_client.py -q
uv run pytest apps/admin/tests/test_center_v2/test_mcp_tools_endpoint.py -q
```

**Why:** 2026-06-25 前后曾反复澄清 `AION_MANAGER_JWT`、`MCP_URL`、internal K8s URL、`X-Auth-Thread-Id` 的职责。如果把 bearer token 和 runtime context header 混成一件事,会误判是权限问题、网络问题还是 thread 绑定问题。

**How to apply:** 遇到 VidMCP list/call 失败时,按顺序检查:admin 能否访问 `MCP_URL`; bearer token 是否存在; `thread_id` 是否有效; runtime context 是否能解析 user/project; VidMCP 返回的是 HTTP error 还是 tool result error。
