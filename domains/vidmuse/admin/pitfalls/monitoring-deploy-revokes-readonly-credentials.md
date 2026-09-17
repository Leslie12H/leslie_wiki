---
name: monitoring-deploy-revokes-readonly-credentials
type: pitfall
created: 2026-09-17
updated: 2026-09-17
tags: [vidmuse, monitoring, deployment, readiness, secrets]
links: [monitoring-code-scope-blocks-claim, monitoring-github-app-config]
---

# 普通发布可能撤掉已经启用的监控调查凭据

**Why:** `activate_readonly_evidence` 默认 false；该分支不是保持原状，而是用不含 GitHub App 和数据库 DSN 的清单 apply 同一个 Secret，再重启 MCP。此前由 apply 管理的凭据键会被移除。配置仍声明代码/数据库源，结果是 `source_credentials_missing`；数据库 DSN 也是配置身份计算的输入，缺失可同时造成 `configuration_fingerprint_failed`，不能直接归因为 HMAC 密钥错误。

**How to apply:**

- 核对发布实际输入、Secret 更新和 Pod 重启时间。2026-09-17 对照证据：[15:19 发布](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35193964862)为 true；[18:46 发布](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35212247842)为 false（北京时间）。后者成功更新 Secret 并重启 MCP，但成功不代表调查可用。
- 代码指针：MCP `aa4da58dfffe48ead1200298fa610c0370577650` 的 `.github/workflows/deploy-prod.yaml`，凭据清单生成与 apply、Admin-to-MCP 网络检查，以及条件为 `inputs.activate_readonly_evidence` 的严格验收。普通网络检查允许 ready/degraded，因此可能放行此故障。
- 源错误核验：`internal/evidence/code.go:appJWT`、`internal/evidence/database.go`、`internal/configsummary/summary.go:exactConfigurationIdentity`。不要输出凭据值或 Secret annotations。
- 从生产 Admin 容器读取 `http://vidmuse-monitoring-mcp-edge:8080/readyz`，核对 HTTP、sources、reasonCodes、snapshotAgeSeconds。2026-09-17 23:16 实查 HTTP 503，prod/code 与 prod/database 缺凭据，其他源 ready，快照未过期。
- Incident 绑定：`sls-incident-196901ae31821289edb7118848782d343f11d68e`；只读查询 `monitoring_incident` 与 `monitoring_incident_outbox`，当次证据 queued、无认领时间/Run、pending、attempt_count=0。下次必须重查，不能沿用状态。
- Admin `apps/admin/service/monitoring_incident_dispatch.py:dispatch_one_incident_event` 在认领前检查 readiness，因此尝试数 0 与空 last_error 不表示调度正常。
- 修复方向：恢复已审核的只读凭据并通过严格验收；长期将普通发布的保留语义与显式停用分开。恢复生产配置和补跑属于独立变更，本次仅调查，未实施。
