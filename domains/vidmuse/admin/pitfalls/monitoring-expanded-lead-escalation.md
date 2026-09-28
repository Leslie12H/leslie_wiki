---
name: monitoring-expanded-lead-escalation
type: pitfall
created: 2026-09-18
updated: 2026-09-18
tags: [vidmuse, monitoring, evidence, preflight, backfill]
links: [monitoring-deploy-revokes-readonly-credentials]
---

# 扩展窗口线索不应触发无法满足的事故部署取证

**Why:** 2026-09-18 回填 Incident 2494 时，主告警窗口完整查空后，Agent 按策略执行前后各 15 分钟的固定扩窗。扩窗日志只能作为诊断线索，不能证明事故归属。原 `_adaptive_escalation_checks` 却从这些线索提取源码位置并强制要求事故部署版本；`_incident_deployment_bindings` 正确拒绝把扩窗日志绑定成事故工作负载，导致多次成功查询 Deployment 仍被判 `adaptive_deployed_revision/not_attempted`，报告无法准备。

**How to apply:**

- 区分“日志采集合法完成”和“这条日志能证明当前事故”。扩大时间窗取得的记录不会自动变成事故因果证据，不能放宽 deployment binding 或 record membership 来凑通过。
- 核对原始策略的 canonical query、主窗和允许扩窗，再从同一 Run 的 canonical events 读取实际 query scope、observed_at、Pod/namespace、deployment attempts 与 preflight 返回。工具 status=success 不等于事件归属已证明。
- 修复入口：[Admin PR #892](https://github.com/world-sim-dev/vidmuse-admin/pull/892)。仅同 project、Logstore、canonical query、固定扩窗的诊断线索免于触发强制事故级 code/database escalation；主窗口要求、主窗查空、固定扩窗、分页完整性和报告证据归属校验继续保留。
- 回归同时检查主窗口仍强制升级、扩窗不能得到事故 membership/deployment binding、主窗与扩窗混合不能隐藏主窗要求，以及错误 query/project/Logstore/window 不获得豁免。
- [真实窗口与来源记录](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35291404264)及[同报告只读候选逻辑回放](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35291763719)：旧规则拒绝，候选逻辑验证同一 canonical draft。诊断进程验证通过不是部署或数据写入证明；最终必须回读实际部署版本和持久化报告。
- 认领恢复、Runtime completed、报告 prepared、Admin 验收与结论展示是不同阶段。不可伪造成功准备记录，也不可用无效草稿覆盖正式报告。


## 已取证却耗尽预算的另一种边界

**Why:** 必需 acquisition 完成不等于报告准备成功。反复 `report_preflight_unavailable` 会让 Agent 继续查询和重试；报告也可能因引用不属于完整 exact-trace 采集集合而被拒绝。不能仅凭预算耗尽就增加预算，也不能跳过失败的 prepare 直接保存草稿。

**How to apply:** 先按同一 Run 的 canonical events 分别统计采集完成情况、prepare 返回码和 Runtime 终态，再区分网络/总读取预算与报告证据引用错误。恢复访问路径后重新走正式 prepare 与最终验收。[2026-09-18 acquisition 回读](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35292749936)和[prepare 失败分类](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35293058822)保留了这一案例的证据入口。

修复的 live 闭环证据：[2494 正式新 Run 回填工作流](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35294619310)成功，[实际同 Run prepare 成功及逐事故验收](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35295040863)通过。对主窗查空的历史报警，正确结果可以是完成取证后的 inconclusive，不能为了提高完成率把扩窗线索升级成事故根因。
