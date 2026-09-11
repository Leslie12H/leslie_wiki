---
name: monitoring-code-scope-blocks-claim
type: pitfall
created: 2026-09-11
updated: 2026-09-12
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
- 恢复前核对实际 GitHub App 安装范围与已审查配置，对齐权限需相应授权；再验证 readyz 200、新认领、Run、报告和通知。该初次快照阶段尚未改生产配置或补跑；后续修复见下文。

## 2026-09-11 权限新增后的修正方向

用户确认曾新增 GitHub 仓库权限。就绪检查应要求配置集合是安装可见集合的子集，而不要求完全相等；新增可见仓库仍不能绕过工具层的仓库与路径白名单。隔离实现指针：`/Users/leslie/Downloads/sandai-code/monitoring-mcp-readiness-fix`，分支 `fix/code-readiness-repository-superset`。修改 `Health` 集合比较并覆盖额外仓库、缺少仓库、同数量替换、重复响应和额外仓库的三个查询入口拒绝。部署状态请查 Git/CI/线上镜像，不从本页推断已恢复。

## PR 63：允许安装扩展，限制实际取证

- PR： https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/63 。2026-09-11 已合并，最终代码与 CI/评审均通过。部署与补跑状态以 Actions 和生产记录核验。
- 仅把就绪检查改为子集不够：评审指出搜索布尔表达式可能使尾部 repo qualifier 无法约束所有分支。应同时在 GitHub App 临时令牌请求中显式限定 repositories，并验证每个搜索结果的 repository.full_name 等于目标仓库；缺失/越界响应不返回证据。
- GitHub scoped installation token 最多列出 500 个仓库，配置校验需提前拒绝超限；参考 https://docs.github.com/en/rest/apps/apps#create-an-installation-access-token-for-an-app 。
- 回归入口：internal/evidence/code_test.go（额外可见仓库、缺失/替换、分页、重复、令牌请求范围、跨仓库搜索结果），internal/config/config_test.go（500/501）。
- 发布入口：.github/workflows/release.yaml 构建指定 Git SHA；deploy-prod.yaml 必须保留 activate_readonly_evidence=true，否则该工作流会撤销已启用的代码/数据库凭据。

## 2026-09-11 发布后发现独立的节点网络阻塞

**Why:** PR 63 镜像 `2a3389fe11e448bface2aaea7d0063c34cc8e98b` 上线后，Admin readiness 恢复并自动派发原积压及发布期间新增的 19 条记录。但认领不等于调查成功：精确 Run 的告警上下文和 SLS 工具反复 `context deadline exceeded`，随后动态执行预算耗尽。不能把报错中的 9/10 次模型调用误写成固定调用上限，也不应先提高预算掩盖取证失败。

**How:** 分开验证 readiness、实际工具请求、每个 edge Pod 到每个 MCP Pod 的 TCP/HTTP 路径。此次 edge 所在节点 `us-west-1.172.17.229.107` 到 MCP Pod `172.16.176.202:19092` 超时，而另一 edge 到两端都成功；Nginx 日志是 `while connecting to upstream` 的 504。替换 edge Pod 后仍落到同节点且同样失败，证明单纯重启容器不能解决这个已复现的网络路径问题。底层 CNI/安全组/路由的具体原因尚未证实。

- 生产发布（代码/数据库验证通过，后续 Prometheus 探活失败）：https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34614326829 。
- 精确 Run 取证：https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34615527450 。
- 逐副本矩阵：https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34615794382 。
- 临时缓解：仅对 `vidmuse-monitoring-mcp-edge` 增加 required node affinity，排除上述节点，保留两个副本；操作与全矩阵复测：https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34616267163 。这是线上临时调度配置，不是 PR 63 的代码改动，也不是节点网络的永久修复。去除前应重新验证该节点到全部服务副本的路径。
- 原始积压固定范围为 incident id 2341–2359 / outbox id 2354–2372；未来应按 incident key 与 analysis generation 关联，不能只数最新 pending 或把历史失败当本轮结果。

- 修复节点调度后的 9 项真实取证验证全部通过：https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34616468049 。CloudMonitor 空结果仅证明接口成功返回有效空证据，不证明业务无异常。
- 补分析通过现有 Admin reanalysis 入口执行，保留 generation 与审计，不直接写成功状态：代表记录 https://github.com/world-sim-dev/vidmuse-admin/actions/runs/34616488594 ，其余 18 条精确补跑 https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34616929466 。是否终态成功必须重查生产记录。
- 业务错误样本与监控运输故障分开：9 个触发窗口的有界 SLS 样本见 https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34616777230 。样本显示媒体抓取超时、图像模型不支持 MP4 输入、参考图宽度过小、YouTube 源视频不可用；每窗最多 10 条且均截断，不能当全量错误统计或据此断言统一根因。

## 2026-09-12 Admin 必须读取工具结果引用的权威正文

**Why:** Maxwell 的成功 `agent.tool.result` 可以只含 `resultRef/resultHash/resultSize/resultPreview`，完整正文位于对应的 `message.created` 工具消息。旧 Admin 只接受内联 `result`，导致已有证据仍被判为 `runtime_evidence_invalid`。这是 Runtime 与消费方的契约兼容问题，不是 GitHub 权限新增的另一个直接后果。

**How to apply:** 终态收割时在原有有界事件分页中同时读取 owner 消息；要求引用唯一、同一 thread/run/call、role=tool、UTF-8 字节数和 SHA-256 完全匹配。摘要不能替代证据，任何不一致仍拒绝；运行中的轻量轮询无需读取完整 owner。随后仍执行原有证据与报告检查，不能因为补齐正文就直接认定报告合格。

- 修复与回归指针：[Admin PR 872](https://github.com/world-sim-dev/vidmuse-admin/pull/872)，`apps/admin/service/maxwell_runtime_gateway.py` 的 `_list_run_report_events`、`_hydrate_tool_result_references`；测试 `apps/admin/tests/test_monitoring_result_references.py`。部署以该 PR 的合并 SHA、Actions 和生产镜像为准。
- Producer 指针：Maxwell `services/agent-server/internal/modules/runtime/domain/event.go`、`extensions/toolresultsummary/middleware.go` 及 `transport/http/legacy_message.go`。HTTP 兼容投影的正文是 payload.content 字符串，不能照搬原生消息 Parts 结构。
- 只读回放指针：[19 条预检](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34618921602)。兼容恢复后仍发现必需检查未尝试、可继续查询的证据缺口及 V2 结构错误。诊断工作流成功不等于报告验收成功；候选 probable/inconclusive 也不是已经证明的根因。
- 旧失败不会因更新消费者自动重跑；若恢复既有 Run，应保留原始 receipt/generation 并走完整校验。证据缺口不应触发无界新 Run 循环，也不能通过提高预算或直接写成功状态掩盖。

- PR 872 的生产 Admin 发布核验：[34620958112](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/34620958112)，三个 rollout 阶段成功，镜像 `5ddbc019a70ababe89ccd8bbc21c091545255611`。今后仍须重查线上镜像与报告验收，不能从历史发布成功推断持续健康。
- 全量测试风险指针：[PR CI 34618828976](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/34618828976)。除主分支已失败的 `mark_tool_dirty` 测试桩外，日分桶测试在北京时间零点后 7 分钟内会把过去 8 分钟错误假定为同一天；发布前 SHA `9a8013f...` 的隔离 worktree 在固定 2026-09-11T16:06:14Z 同样复现。时间敏感用例应固定时钟或选择不会跨业务日的样本；不能把两个已复现基线问题写为全量 CI 通过。

- 同一镜像的生产 Analytics Worker 发布：[34621577029](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/34621577029)。发布 API 与 Worker 分别验收，避免只确认其中之一。

- 最终线上验证：[原始 Run 回放 34621581178](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34621581178) 与 [双副本各三次 readiness 34621971784](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/34621971784)。首次快照有一次能力验证不可用，底层错误类型未记录；后续请求成功、监控 readiness 全部 ready，不把未复现误写成已经确定偶发超时。完整 Preset 的非监控必需工具降级与监控必需工具就绪要分开看。
