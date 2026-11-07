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

## 2026-11-07 报告生成约束与隔离验收入口

**Why:** 生成端把“独立 record locator”说成抽象要求、只给 eq 示例而不解释身份字段和 producer 边界时，模型可能把同一日志库的文本 contains 拼成跨源 correlation。预检如果先因协议或读取权限失败，模型也拿不到可执行的字段纠正反馈。原始模型请求比当前仓库 Skill 模板更能证明当时实际消费了哪些规则。

**How to apply:** 同时核对 model.request 中系统提示词、Admin 输入和激活的 Skill。明确 correlations 可空、locator 必须指向真实身份字段并精确 eq，同一 SLS project/logstore 的不同查询/分页/span 不算独立来源；删除无效关联时同步清理 supports，保留已验证事实。生成规则修复应通过新隔离 Run 自主产出报告验证，不把手工改稿或历史 Run 的事后 preflight 当成完整交付。

- 源码入口：Admin `maxwell_runtime_gateway.py::_message_content`、`monitoring_incident_evidence_retry.py::evidence_retry_prompt` 和 `config_file/maxwell_skills/monitoring-incident-root-cause/SKILL.md`。共享线上 Skill 可能早于仓库版本；发布与消费状态沿实际 Run 和变更记录核对。
- 原模型请求、双次错误 correlation、最小修复、真实新 Run、相关回归以及完整链路边界：[生成端验证报告](/Users/leslie/.codex/worktrees/monitoring-report-context-admin/vidmuse-admin/.codex-artifacts/correlation-generation-verification/report.md)。动态完成/部署状态以该报告及源码为准。
- Studio 账号创建的隔离测试 Thread 默认可能为 private，Admin 服务身份读取会被隐藏成 HTTP404，最终表现为 report_preflight_unavailable。先从服务日志核对，不推断为超时或放宽校验；测试创建时显式使用获授权的 business/read，只改新测试对象。原请求在共享范围修正后的只读 preflight 可作为环境诊断，完整验收仍须从正确配置的新 Run 开始。

## 2026-11-07 补查证据与根因投影的验收边界

**Why:** proofManifest 的记录级验证与 evidenceAcquisition 的固定检查清单不是同一个集合。合法补查结果可以通过当前 Run 的证据校验，却没有被固定检查列入 resultEventIds；若展示投影只按该清单寻找来源，就会把已验证支持丢弃，误投影为 incomplete。

**How to apply:** 完整链路验收须继续检查接纳后的 rootCauseProof，而不能止于 MCP prepared、Run 完成或卡片生成。对照 proof 的 toolResultEventId 与采集清单逐项定位缺失，保留未验证/跨 Run 拒绝边界；不要通过删除真实证据或放宽 correlation 校验掩盖索引缺口。修复状态以实际代码和验证报告为准。

- 实现入口：Admin `monitoring_incident_proof.py::project_root_cause_proof` 的 result_context 和 context 过滤；数据入口为 `monitoring_incident_report_validation_v2.py` 的 proof/acquisition 两类 manifest。隔离复现及投影缺口证据沿上面的生成端验证报告读取，不将该问题误称为历史报告修复失败。

## 2026-11-07 索引与通知谓词的修复入口

**Why:** 已验证来源补索引只能修正根因快照；通知卡片还可能保留早期“probable 必须有 correlation”的独立谓词。摘要存在并不证明卡片采用了已验证报告，也可能来自降级叙事投影。

**How to apply:** 仅在完整采集策略及记录级 proof 校验后索引实际引用的当前 Run 补查 call/result，不让补查替代必需检查。验收同时断言持久化 rootCauseProof、证明引用以及无降级说明；覆盖 directErrors/confirmedFacts 单独支持 probable 的两类卡片和失效 supports 负例。保留 supported 与跨源 verified 的强度区别。

- [Admin PR #970](https://github.com/world-sim-dev/vidmuse-admin/pull/970)：生成约束、已验证补查来源索引、通知谓词及回归入口。审查、CI、合并、部署与历史保全状态以该 PR 和生成端验证报告末节为准。
- 实现入口补充 `monitoring_incident_report_validation_v2.py::_index_validated_report_sources`、`monitoring_incident_notification.py::_validated_v2_report`；两类通知卡片须直接检查证明引用和降级提示，不能只检查摘要或标题。
