---
name: monitoring-report-preflight-budget
type: pitfall
created: 2026-09-18
updated: 2026-09-18
tags: [vidmuse, monitoring, runtime, preflight, timeout]
links: [monitoring-deploy-revokes-readonly-credentials, monitoring-expanded-lead-escalation]
---

# 完整 Run 报告校验需要独立于单次源查询的预算

**Why:** 2026-09-18 补分析 Incident 2491 时，Agent 已完成必需取证，但报告准备反复收到 `report_preflight_unavailable`，最终耗尽预算。普通 readiness 能成功，并不能证明长 Run 的全部 canonical events 能在报告准备预算内读完。原 Admin 总读取预算为 `min(10, request_timeout)`，MCP tools/call 与 HTTP callback 共用普通源查询的 15 秒预算。

**How to apply:**

- 从持久化历史 receipt 绑定原始 threadId/runId；自动续查会创建新 Thread，不能把旧 Run 与当前 Incident 的新 Thread 拼在一起。使用完整同 Run 的事件、实际工具参数回放校验，不伪造成功准备结果。
- 分别测量每页条数/字节、全部 canonical 读取耗时、校验耗时，以及真实 HTTP 状态/耗时。[原始读取与草稿回放](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35297322887)与[真实 HTTP 对照](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35297468216)表明：离线完整读取可得到明确引用校验拒绝，而线上请求在约 10 秒返回 503。不要把笼统 unavailable 直接认定为缺凭据或同一个 CDN 问题。
- [Admin #893](https://github.com/world-sim-dev/vidmuse-admin/pull/893)为 canonical 总读取提供有界 30 秒预算，保留每次 HTTP 请求限制与全部 V2 证据门禁，并补充安全诊断日志；[MCP #72](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/72)仅为报告准备提供 45 秒外层与 callback 预算，给读取、校验和传输留出余量，其他工具保持原预算。
- 必需 acquisition 完成后应及时准备最有证据支持的报告，按具体拒绝修正；不能因为还有可执行查询就无限枚举源码/日志。报告保留真实不确定性，不能把 available query 当作永不结束的完成条件。
- 单次工具成功、Runtime 结束、prepared 成功、Admin 持久化验收是不同阶段。手动工作流 20 分钟等待、Admin 30 分钟调查期限和 Runtime 自身预算也不同；工作流超时不代表底层 Run 已停止，恢复前必须回读实际终态与当前代次。
- 验证应覆盖多个单页均在单次预算内、总读取超过单次预算的事件历史，并同时验证正常准备与具体引用错误反馈。不能用连接探测替代真实 report-preflight HTTP 对照。

- 大日志分页恢复时，不仅核对 offset 是否都出现过，还要核对同 query/window/limit 的每个下一页 call 是否发生在上一页 result 之后。2026-09-18 [canonical 页链审计](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35298890535)显示，多轮大页失败与乱序重读会出现末页已查到但 completeChains=0；应按已验收前缀补顺序链尾，或者新 Run 从已证实可用的小页开始。不同页大小不能拼接同一链，旧不完整链的记录不能当作当前完整采集证明。相关实现指针：`_complete_sls_page_chain_groups`、`_complete_sls_page_chains`，位于 Admin `monitoring_incident_report_validation_v2.py`。

- [MCP #72 生产发布](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35298252323)包含 code/database canary 和全部 Admin 副本调查 readiness 验收；Admin 同草稿真实 HTTP 回放仍须在对应版本部署后单独执行。

- 2026-09-18 [Admin #893 生产发布](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35299386849)后，[同草稿真实 HTTP 回放](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35301477628)从约 10 秒的 503 改为约 18.8 秒 HTTP 200，返回具体 `downstream_trace_record_acquisition_overclaim`。草稿仍然被正确拒绝；这证明预算修复和严格门禁同时生效，不代表 Incident 已完成。完整 main CI 指针：[35299104130](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35299104130)。
