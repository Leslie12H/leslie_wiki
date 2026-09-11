---
name: monitoring-code-scope-blocks-claim
type: pitfall
created: 2026-09-11
updated: 2026-09-11
tags: [vidmuse, admin, monitoring, github-app, readiness]
links: [monitoring-problem-title-vs-incident-report, admin-scheduled-report-mechanisms]
---

# GitHub App 仓库范围不一致会阻断 Agent 自动认领

**Why:** 2026-09-11 生产只读排查确认，Monitoring MCP `/readyz` 的 `prod/code` 返回 `unavailable/source_policy_violation`，其余已配置源 ready，快照未过期。线上 MCP 镜像 `bce8b7757f52e1309cadce55621ed06e2e2adb2a` 的 `CodeConnector.Health` 仅在 GitHub App 实际可见仓库数量或名称与配置白名单不完全一致时返回此策略错误。Admin 线上镜像 `9a8013f778e4cfdc5e8588330b2cedf70ddd80b8` 在认领之前检查 readiness，不通过直接返回，因此新调查不创建 Run。

**How to apply:**

- 从生产容器只读请求 `http://vidmuse-monitoring-mcp-edge:8080/readyz`，核对 sources、checkedAt、stale。Pod Running 或 healthz 200 不能代替证据源可用性。
- MCP 指针：`internal/evidence/code.go:Health` 的 `/rate_limit`、`/installation/repositories` 与集合完全匹配；配置指针 `configs/config.prod.yaml`。此次配置仓库数为 4；实际 GitHub App 集合尚未读取，不能断言是多授予、少授予或更名，也不能归因于凭据过期。
- Admin 指针：`apps/admin/service/monitoring_incident_dispatch.py:dispatch_one_incident_event`，`readiness_blocked/action=claim_skipped` 在 `claim_next_incident_event` 之前。
- 数据指针：`monitoring_incident.agent_claimed_at/agent_run_id/handling_status` 与 `monitoring_incident_outbox.status/create_time/last_error`。使用只读事务，UTC 转 Asia/Shanghai。2026-09-11 查询时最后认领 14:29:22，15 条派发事件 pending；未来必须重查，不能沿用数量。
- 同次近 48 小时查询另有 73 条 `invalid_incident_report: runtime_evidence_invalid` 和 1 条模型超时 failed。这是历史失败分类，不能直接断言与当前范围问题同因。恢复 readiness 不等于旧 failed 自动补跑。
- 恢复前核对实际 GitHub App 安装范围与已审查配置，对齐权限需相应授权；再验证 readyz 200、新认领、Run、报告和通知。此次仅排查，未改生产配置或补跑任务。
