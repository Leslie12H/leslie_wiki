---
name: monitoring-deploy-revokes-readonly-credentials
type: pitfall
created: 2026-09-17
updated: 2026-09-18
tags: [vidmuse, monitoring, deployment, readiness, secrets]
links: [monitoring-code-scope-blocks-claim, monitoring-github-app-config, monitoring-expanded-lead-escalation]
---

# 普通发布可能撤掉已经启用的监控调查凭据

**Why:** 2026-09-17 的发布流程中 `activate_readonly_evidence` 默认 false；该分支不是保持原状，而是用不含 GitHub App 和数据库 DSN 的清单 apply 同一个 Secret，再重启 MCP。此前由 apply 管理的凭据键会被移除。配置仍声明代码/数据库源，结果是 `source_credentials_missing`；数据库 DSN 也是配置身份计算的输入，缺失可同时造成 `configuration_fingerprint_failed`，不能直接归因为 HMAC 密钥错误。

**How to apply:**

- 核对发布实际输入、Secret 更新和 Pod 重启时间。2026-09-17 对照证据：[15:19 发布](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35193964862)为 true；[18:46 发布](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35212247842)为 false（北京时间）。后者成功更新 Secret 并重启 MCP，但成功不代表调查可用。
- 代码指针：MCP `aa4da58dfffe48ead1200298fa610c0370577650` 的 `.github/workflows/deploy-prod.yaml`，凭据清单生成与 apply、Admin-to-MCP 网络检查，以及条件为 `inputs.activate_readonly_evidence` 的严格验收。普通网络检查允许 ready/degraded，因此可能放行此故障。
- 源错误核验：`internal/evidence/code.go:appJWT`、`internal/evidence/database.go`、`internal/configsummary/summary.go:exactConfigurationIdentity`。不要输出凭据值或 Secret annotations。
- 从生产 Admin 容器读取 `http://vidmuse-monitoring-mcp-edge:8080/readyz`，核对 HTTP、sources、reasonCodes、snapshotAgeSeconds。2026-09-17 23:16 实查 HTTP 503，prod/code 与 prod/database 缺凭据，其他源 ready，快照未过期。
- Incident 绑定：`sls-incident-196901ae31821289edb7118848782d343f11d68e`；只读查询 `monitoring_incident` 与 `monitoring_incident_outbox`，当次证据 queued、无认领时间/Run、pending、attempt_count=0。下次必须重查，不能沿用状态。
- Admin `apps/admin/service/monitoring_incident_dispatch.py:dispatch_one_incident_event` 在认领前检查 readiness，因此尝试数 0 与空 last_error 不表示调度正常。
- 修复方向：恢复已审核的只读凭据并通过严格验收；长期将普通发布的保留语义与显式停用分开。恢复生产配置和补跑属于独立变更，2026-09-17 当次仅调查，未实施；2026-09-18 修复见下节。

## 2026-09-18 修复与跨仓库身份验收

1. 对比当前 main、实际镜像和发布输入。检查 `.github/workflows/deploy-prod.yaml` 的 Secret 构造、`activate_readonly_evidence`、canary 条件；只输出 Secret 键是否存在，禁止输出值及 last-applied 注解。
2. 分层核验 MCP `/readyz` 的 sources 与配置摘要，以及 Admin `MonitoringIncidentReadinessService`。指纹为空、源凭据缺失、非空指纹与 Admin 不匹配是不同断点；不能绕过任一门禁。
3. 配置身份取自与当前审查配置精确比较、并通过代码/数据库实际查询的发布验收。更新 Admin 仓库 prod 环境变量 `MONITORING_MCP_EXPECTED_CONFIG_FINGERPRINT_HMAC_SHA256`，从 main 重新部署 Admin。禁止仅凭一个任意 endpoint 的观测指纹自动接受身份。
4. 防复发实现见 MCP [PR #70](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/70)：默认启用，第一步拒绝 false/缺省等错误输入，先拒绝再访问集群；显式紧急撤权属于另行事故处置。
5. 完整上线验收见 MCP [PR #71](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/71)：所有源 canary 后检查每台活跃 Admin 的完整调查 readiness。一个副本不通过、缺少活跃副本、查询失败都应让发布失败。
6. 持久化 pending 不需要重建或伪造成功；修复门禁后检查原 outbox 的 Run、结论和错误。`agent_claimed_at`、`analysis_completed_at`、报告契约验收、飞书回执分开计算。连接超时要独立核验，不能归为原配置错误。

## 2026-09-18 核验入口

- 原始故障发布：[35212247842](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35212247842)，main 镜像发布使用 false。
- 修复前双副本与积压取证：[35284936130](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35284936130)。当次边界为北京时间 2026-09-17 晚间到 2026-09-18 07:00，12 条待认领事件；数字仅代表该快照。
- 原 main 镜像恢复全部 provider canary：[35285114873](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35285114873)。
- Admin 配置身份更新后的 main 部署：[35285450649](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35285450649)。
- 后续生产发布、补分析与最终验收以工作流记录为准，不从 Pod Running 或上述历史数量推断。

- 两项防复发修复合入 main 后的生产部署：[35285934111](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35285934111)。验收包括实际 code/database 查询与全部活跃 Admin 的完整 readiness；两台均 ready、blockers 为空。

## Maxwell 公网建连波动需独立处理

2026-09-18 的[阶段跟踪](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35287491319)显示：DNS 查询很快，但部分返回地址组 TCP 建连超时，尚未进入 TLS/HTTP；另一些地址组的同一鉴权能力查询正常。不能把它归为凭据故障或仅增加整个请求超时。

**Why:** 认领前 readiness 与后续结果回收都会访问 Runtime；一次不可达解析可能拖慢恢复。**How to apply:** [Admin PR #891](https://github.com/world-sim-dev/vidmuse-admin/pull/891)限制单次建连时间并仅重试请求发送前的 ConnectError/ConnectTimeout，保留提交后读取超时的“不确定投递”保护。用实际 HTTP transport 测试连接重试与 POST 不重复发送，再在全部生产副本重复验收完整 readiness。这是客户端容错，不能当作公网 CDN 路由已修好。

Admin #891 的 [生产 main 发布](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35289256236) 和 [双副本连续验收](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35289724712) 是后续核验入口；对照 [发布前样本](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35289188062)。任何历史通过率都不代表当前就绪，必须按事故重新回读。

## API 源站与页面链接分离

[2026-09-18 路由取证](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35291896335)和[源站能力/同一 Run 验证](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35291992380)用于确认候选 API origin 的真实归属。不能仅凭域名带 dev/prod 或一次 HTTP 200 判断环境。先核验 live ingress、同一 business/Preset 和不可变 Run，再切后台请求路径。

[Admin PR #892](https://github.com/world-sim-dev/vidmuse-admin/pull/892)增加可选 `MAXWELL_AGENT_API_BASE_URL`；空值仍走原地址，`MAXWELL_AGENT_BASE_URL` 继续用于用户可点击的会话链接。生产 origin 从 GitHub prod environment variable 获取，具体值和当前发布状态以 live 配置为准。客户端连接重试仍保留，但不是修复公网 CDN 路由的证据。

补分析期间的另一个独立问题见 [[monitoring-expanded-lead-escalation]]。


最终版本的[生产发布记录](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/35294064128)与[实际镜像、配置身份、双副本连续 readiness、新增报警自动分析回读](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/35294470353)用于核验 Admin #892 的落地状态。历史回填完成情况必须另查逐事故验收，不从发布成功推断。
