---
name: monitoring-report-context-and-empty-projection
type: pitfall
created: 2026-11-07
updated: 2026-11-07
tags: [vidmuse, monitoring, maxwell, report, execution-context]
links: [monitoring-report-vs-chat-output, monitoring-thread-scan-pagination-exhaustion]
---

# 报告执行上下文缺失与空快照伪结论

**Why:** Runtime 完成调查与 Admin 接受正式报告是两个边界。报告准备工具依赖平台传入的受信执行身份；上下文丢失时，普通日志/源码查询仍可能成功，但报告预检在进入 Admin 前被拒绝。终态若只显示 report_transport_invalid，会把上下文缺失、证据未通过和 JSON 格式错误混在一起。另一个独立缺陷是把初始化的空报告对象序列化后当作可读结论，导致没有报告也出现“Maxwell 已返回结论”和 {}。

**How to apply:** 先取限定窗口完整事故列表，再对每条失败按原 Thread/Run 读取 canonical events，处理 hasMore/cursor、按 seq 排序、用 resultRef 恢复完整 owner。把最后一次准备工具的原始反馈与最终 agent.content 分开读取；检查 owner hash，不用公开卡片反推模型输出。缺失执行上下文时核对实际部署的分发/Provider、MCP initialize 扩展协商与 tools/call _meta，不允许模型自行补身份。空容器不能构成历史报告；历史叙述必须保留可追溯 Run 来源。

## 2026-11-07 取证指针

- 只读报告与逐 Run 分类：`/Users/leslie/Downloads/sandai-code/vidmuse-admin/.codex-artifacts/monitoring-failures-20261107/report.md`；同目录 dashboard.json、failure-details.json、run-analysis.json 和 events-*.json。动态数量及当前状态沿实时 API 查证。
- 指定事故 sls-incident-c1450b2fc00c7b800da643afbe40d4709214050e，原 Run run-ba904d343225d1a03643beb3971b2ccd。真实 Markdown 非空，两次准备工具反馈为 report_preflight_context_missing；两份完整 owner hash 已比对。未将该 Markdown 升级为已验收业务根因。
- [MCP 上下文合同](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/blob/05ef7b31be3da98b2c878ab3f6b4cdaef221857c/internal/server/report_preflight.go)：检查 version/businessId/threadId/runId/toolCallId；报错本身不指出具体缺失字段。
- [Admin 空快照来源](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/service/monitoring_incident_state.py)、[空对象投影](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/service/monitoring_incident_degraded_conclusion.py)、[正式报告选择](https://github.com/world-sim-dev/vidmuse-admin/blob/main/apps/admin/service/monitoring_incident_report_transport.py)。空 response 与空 fallback_report 的本地复现返回 summary/rootCause 为 {}，不能解释为模型真的输出了 {}。
- 本次全部 report_transport_invalid 样本已完成事件分页；runtime_stalled/runtime_error 样本仍有部分历史，不能给出同等完整归因。当前 readiness 降级和再次查询超时独立记录，不用事后探针解释凌晨故障。
- 未核实当时部署 SHA、具体丢失字段和引入回归的提交；当前源码可说明合同与复现，但不能直接证明发布因果。未修业务代码、部署、补跑或发送消息。
