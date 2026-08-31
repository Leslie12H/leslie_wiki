---
name: vidmuse-admin-harness
type: reference
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, harness, test-center-v2]
links: [vidmuse-admin, test-center-v2-mcp-direct-tool-call]
---

# vidmuse-admin Harness 指针

`vidmuse-admin` 里已经有第一版 Test Center V2 / VidMCP harness。

## 代码位置

- `~/Downloads/sandai-code/vidmuse-admin/scripts/harness/README.md`
- `~/Downloads/sandai-code/vidmuse-admin/scripts/harness/tcv2.py`
- `~/Downloads/sandai-code/vidmuse-admin/scripts/harness/smoke.sh`
- `~/Downloads/sandai-code/vidmuse-admin/Makefile`

## 常用入口

```bash
make harness-health
make harness-mcp-tools
THREAD_ID=<existing_thread_id> make harness-tcv2-mcp-case
make harness-smoke
```

## 适用场景

- 验证 Test Center V2 router/auth 是否可用。
- 验证 MCP tools catalog 是否可用。
- 验证 `mcp_tool_call` case -> scratchpad job -> runs 的闭环。
- 给 Codex/Claude 修 MCP 相关问题时提供可执行验证。

> 只存指针:具体参数和最新行为以 `scripts/harness/README.md` 与代码为准。
