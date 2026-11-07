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
- 初次只读取证未核实部署 SHA 或引入提交；后续源码定位与本地验证见下节。故障时生产 Worker 的镜像/SHA 仍待回读，不能把源码回归证明等同于具体发布批次证明。

## 2026-11-07 修复与验证指针

**Why:** 协议名称是外部服务共同依赖的 wire contract，去品牌化批量替换不能当作文案调整。Maxwell [PR #391](https://github.com/world-sim-dev/maxwell-ai/pull/391) / `259b51ec1db3af85d63ef5ece3540475d746f551` 将 execution-context 名称改为 ai.agent-platform，而监控 MCP 仍声明并读取 ai.maxwell；客户端按新名称协商后删除身份。HTTP 复现中，替换父提交的原始客户端/领域合同文件通过，替换该提交文件失败。此处确定代码回归，不断言未回读的生产部署批次。

**How to apply:** 固定 wire 名称的测试必须独立于被改常量。2026-11-07 用户选择只适配新协议：在监控 MCP 同步修改 initialize 声明与 tools/call._meta 读取，不增加 Runtime 旧名称兼容。覆盖新名称准备成功、旧名称/缺失/错误版本拒绝；部署前确认调用方 Runtime 使用新协议。身份仍由当前 Runtime 产生，不能从模型参数补造。Admin 区分准备工具反馈与正式 prepared 报告，允许展示可追溯真实叙述但不发放验收；空对象和占位投影必须被拒绝。

- 本地修复、基线、分支、回归日志和 14 条完整 Run 的离线回放结果：[验证报告](/Users/leslie/.codex/worktrees/monitoring-report-context-admin/vidmuse-admin/.codex-artifacts/monitoring-context-verification/report.md)。动态修复/发布状态只沿该报告和 Git 工作树核对。
- 最终 MCP 实现指针：`/Users/leslie/Downloads/sandai-code/vidmuse-monitoring-context-1107/internal/server/report_preflight.go`、`server.go` 与 `report_preflight_test.go`；Runtime 工作树的旧协议兼容补丁已撤回，历史复现日志保留于其 `.tmp/monitoring-context-verification/`。Admin 空结论和错误分类修复保留，具体工作树见验证报告。
- 用户随后授权先核实线上 Runtime 新协议，再分别提 PR、合并、部署 MCP 与 Admin。生产历史记录未迁移/重跑，未额外发送通知；证据不足与 JSON 无效仍按原约束失败，不因协议适配而自动验收。
- 实际生产 Admin 路由、API/Worker 镜像和源代码协议核验：[runtime-live-proof.json](/Users/leslie/.codex/worktrees/monitoring-report-context-admin/vidmuse-admin/.codex-artifacts/monitoring-context-verification/runtime-live-proof.json)。核对 Admin 使用的 endpoint，再沿 Ingress → Service → Deployment/Pod 找执行方；不能凭域名含 dev 就推断与生产无关。
- 发布指针：[MCP PR #73](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/73)、[MCP 生产部署](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/42337201088)、[Admin PR #967](https://github.com/world-sim-dev/vidmuse-admin/pull/967)、[Admin 生产部署](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/42338436251)。当前状态与镜像仅沿 PR/Actions 和上述验证报告核对。
- 不写数据的上线对照方法：从 canonical 原 Run 取精确 prepare 调用和参数，通过 MCP 的新协议 metadata 回放同一 business/thread/run/toolCall 身份，Admin 再从 canonical 事件核实身份与参数。部署前 context_missing、部署后进入具体验证拒绝可以证明传递链路已修复；不能据此把原报告判为成功，也不能算新的自然用户场景验收。
- 上线检查要区分 Deployment Ready、证据源 readiness 与报告验收：曾观测单副本告警源 source_timeout，稍后恢复。保留瞬态与恢复时间，核对每个副本和配置指纹，不把一次绿色探针扩展为持续稳定性证明。
