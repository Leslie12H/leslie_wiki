---
name: monitoring-trace-context-correlation
type: pitfall
created: 2026-11-07
updated: 2026-11-07
tags: [vidmuse, monitoring, trace, evidence, validation]
links: [monitoring-report-context-and-empty-projection, monitoring-report-vs-chat-output]
---

# 复合 trace 字段导致跨 span 的证据误拒绝

**Why:** SLS 返回的 traceId/_traceId_ 不一定是纯 trace：观察到字段同时含 span_id 与 correlation_id 后缀。Admin 将整串当作 trace 身份时，同一请求的失败与回退响应会因 span 不同而无法关联。修复此误拒绝后，报告仍可能有独立的精确引用或独立来源声明错误，不能因第一项是系统问题而放宽后续校验。

**How to apply:** 从 canonical 当前 Run 完整 owner 恢复证据并校验 hash；对照主查询与被引用记录的完整字段、请求 ID、时间和 producer。对已知复合格式可在已验证 recordRef 之上派生纯 trace 身份，保留 canonical V1 anchors/hash，不改历史证据或宽松截取任意前缀。验证相同 trace 不同 span 的正例，以及不同 trace、非主查询、异常格式的负例。单个 SLS producer 的两次查询不是两个独立来源；correlations 的字段/eq/来源规则与普通日志观察分别处理。

## 2026-11-07 查证入口

- 原始 Run、拒绝路径、两条证据的来源和同请求对照、完整回放矩阵：[验证报告](/Users/leslie/.codex/worktrees/monitoring-report-context-admin/vidmuse-admin/.codex-artifacts/incident-correlation-verification/report.md)。同目录保存 replay-audit.py、baseline-observation.json、replay-results.json 和更正的本地草稿。
- 实现入口：Admin `apps/admin/service/monitoring_incident_report_validation_v2.py` 的 `_resolved_identity_anchors`、`_resolve_observation`、`_require_record_anchor` 与 `_independent_evidence_producer`。分支/提交/发布状态沿验证报告和 Git 核对，不从本页推断已上线。
- 更正草稿必须作为独立离线校验输入，不能改 canonical 工具调用后宣称历史 Run 验收成功。区分 Fal 提交响应与最终视频结果。具体采集规则的修改批次尚未归因；消费者格式适配不能称为已修复上游采集配置。

## 2026-11-07 发布与只读复核入口

- [Admin PR #968](https://github.com/world-sim-dev/vidmuse-admin/pull/968)、[PR CI](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/42358131365)、[镜像构建](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/42359303833)、[生产部署](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/42359715175)。审查、合并、镜像与发布结果沿这些入口及验证报告核对。
- 用户明确要求不改写历史。只读预检复用原 canonical toolCallId 与原参数；不得把更正草稿替换到原调用后宣称原 Run 已通过。部署前后比较事故状态、错误码、Run、更新时间、证据快照及活动记录；记录实际镜像、所有副本就绪与通知开关恢复。证据位于验证报告同目录的 deployment/。
