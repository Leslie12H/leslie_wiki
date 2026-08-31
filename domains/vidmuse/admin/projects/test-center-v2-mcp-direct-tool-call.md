---
name: test-center-v2-mcp-direct-tool-call
type: project
created: 2026-07-02
updated: 2026-07-02
tags: [vidmuse, admin, test-center-v2, mcp, vidmcp]
links: [vidmuse-admin, vidmcp-auth-runtime-context, vidmuse-admin-harness]
---

# Test Center V2 MCP Direct Tool Call

Test Center V2 支持 `mcp_tool_call` executor,用于在 admin 里创建一个 case,直接对指定 thread 调用 VidMCP 工具,再把结果包装成 Test Center V2 run / trace / artifact。

## 当前确认的流程

1. 创建 case:
   - Endpoint: `/admin/api/v1/test/v2/cases`
   - `executor_type`: `mcp_tool_call`
   - `payload_json` 必填: `thread_id`, `tool_type`, `call_args`
   - `init_args`, `num_results` 是可选兼容字段。
2. 触发 scratchpad job:
   - Endpoint: `/admin/api/v1/test/v2/scratchpad/run-case`
   - Body: `{"case_id": "...", "target_env": "dev"}`
3. 后台执行:
   - `replay_runner` 会消费 queued 的 `mcp_tool_call` runs。
   - Adapter 入口: `service/test_center_v2/adapters/mcp_tool_call_adapter.py`
4. 查看结果:
   - `/admin/api/v1/test/v2/jobs/{job_id}`
   - `/admin/api/v1/test/v2/jobs/{job_id}/runs`
   - `/admin/api/v1/test/v2/runs/{run_id}/trace`
   - `/admin/api/v1/test/v2/runs/{run_id}/artifact`

## 关键代码指针

- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/controller/admin/test_center_v2.py`
- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/case_service.py`
- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/replay_runner.py`
- `~/Downloads/sandai-code/vidmuse-admin/apps/admin/service/test_center_v2/adapters/mcp_tool_call_adapter.py`
- `~/Downloads/sandai-code/vidmuse-admin/playground/src/pages/test-center-v2/components/cases/McpToolCallPayloadForm.tsx`

## 可执行 harness

默认轻量工具是 `mcp_aion_tool_service_read_dsl`,默认参数是 `{"jmespath_expr":"@"}`。

```bash
make harness-health
make harness-mcp-tools
THREAD_ID=<existing_thread_id> make harness-tcv2-mcp-case
```

底层 CLI:

```bash
uv run python scripts/harness/tcv2.py mcp-case --thread-id <thread_id> --assert-success
```

## 判断成功

- Job status 是 `completed`。
- Job `failed_runs` 是 `0`。
- 所有 run status 是 `success`。

**Why:** 这个流程把 UI 点选、case payload、VidMCP 调用、job/run 状态和 artifact 输出串成一条可复现链路,是排查 MCP 相关问题的最短闭环。

**How to apply:** 修 Test Center V2 / MCP form / VidMCP direct call 时,先跑 catalog 和 dry-run;有真实 thread 时跑 full case harness。失败后用 `CASE_ID`, `JOB_ID`, `RUN_ID` 回到 Test Center V2 页面或 API 排查。
