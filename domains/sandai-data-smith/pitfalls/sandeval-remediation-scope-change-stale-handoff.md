---
name: sandeval-remediation-scope-change-stale-handoff
type: pitfall
created: 2026-10-05
updated: 2026-10-05
tags: [sandeval, quality, remediation, handoff, source-scope]
links: [sandeval-direct-remediation-and-batch-handoff, sandeval-handoff-duplicate-scope, sandeval-auto-reinspection-verification]
---

# 整改后的批次范围变化与旧包交接状态

**Why:** 2026-10-05 生产只读核查发现，供应商复检与负责人验收已成功，但整改由另一账号提交部分正式答案后，来源按最新实际作者投影批次，两个批次范围版本改变。质量汇总按 key 和范围版本筛选，整批排除旧范围；完整性门禁随后正确拦下缺项的新包。新包未生成时，负责人详情仍读旧包的首次交接事实，造成「已提交 Sand」与批次「待交接」并存。该结论限于当天部署与证据，不代表之后版本仍有此问题。

**How to apply:** 固定部署版本和真实账号，分别核查空间报告、负责人报告、后台推进、当前来源清单、冻结成员、QHANDOFF 和 Sand 后继轮次。来源范围版本改变时，比对每个工作项集合的增减及最新正式作者，不能把不匹配批次整批消失理解为工作项不再应交，也不能取消完整性/版本校验来补交。旧包已交接是历史事实，当前整改是否可交接要独立投影。委派子整改闭环与直接 supplier_accepted 回执的自动派回发现口径也须分别验证。

- 本次报告、真实任务身份、部署 SHA、时序与修复建议：`/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/report.md`。
- 当前生产投影、后台尝试与范围差集证据：同目录 `runtime.json`、`completeness.json`、`scope-change.json`；刷新运行状态时重新读，不复用静态数量。
- 来源作者和批次投影入口：`app/repositories/task_assignments.py::quality_submission_owners`、`app/services/facts/task_assignments.py::_quality_projected_waves`。
- 当前批次筛选与完整性入口：`quality/application/management/submission_service.py::live_annotator_batches` / `check_completeness`、`aggregation_service.py::_vendor_package`。
- 旧包展示与交接条件入口：`leader_query_service.py::_package`、`aggregation_service.py::require_supplier_acceptance` / `package_submitted`、`frontend/src/pages/quality/management/AllocationDetail.tsx`。
- 默认负责人路线自动派回发现入口：`quality/infrastructure/persistence/disposition_repository.py::handed_off_supplier_returns`；源代码存在不等于新包交接后已自动派回。

修复实现入口：业务仓库分支 `codex/correction-reviewer-names`，提交 `b65ccc9d1`；主要代码为 `quality/application/management/remediation_batch_scope.py`，完整回归在 `tests/quality/application/management/test_remediation_batch_scope.py`。该提交的验证与发布状态应重新查 Git 和 CI，不由本页推断。生产恢复仍需独立验收原 Sand 检查员唯一新轮次。

**接续判据：** 来源普通分批与冻结质检分区分开；已完成整改执行、连续送审链、全部差异工作项和当前精确答案共同证明换作者的接续。接收整改卡的相邻批次也要核验。无依据的普通改派或后来答案不能借历史整改恢复；一个候选失效仅排除相关分区，不连带阻断其他正常 Sand 批次。最终结果资格以已验证完整包范围核对精确历史答案，作者事实仍独立保留。


**Review 核验边界（2026-10-05）：** 审查业务提交 `b65ccc9d1` 时，不能只比对当前正式送审批次和报告组来证明整包仍已交接：恢复此前暂缓但尚未送审的批次，会增加当前应交清单，而正式批次集合和注册范围身份可能不变。核对 `leader_query_service.py::_require_current_handoff_evidence` 是否也校验当前完整清单；来源规则与既有负例分别见 `app/services/facts/task_assignments.py::_quality_context`、`tests/quality/application/management/test_result_eligibility.py::test_restored_deferred_batch_blocks_package_qualification_until_quality_is_complete`。此处是该提交的修复覆盖遗漏，是否已补齐须重新查代码和 CI。

整改换作者的回归还应按真实顺序安排：先保存新作者答案并改变来源投影，再提交整改、复验、验收与交接。`test_remediation_batch_scope.py::completed_author_change` 在上述审查提交中把投影变化延后到负责人验收之后，因此不能单凭它证明真实时序通过；这属于验证缺口，尚未据此确认默认整包路线存在新的运行故障。


**Review 修复指针（2026-10-05）：** 业务分支 `codex/correction-reviewer-names` 的本地提交 `e92221efb0c149cffa14e7e9612ca8675b7844cd` 补入当前完整应交范围的只读校验；整包及单批交接成功路径都复用 `SubmissionService.check_completeness`。真实先投影的回归入口仍在 `test_remediation_batch_scope.py`；实现及验证记录见 `/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/review-fixes.md`。CI 与生产状态须重新查证，提交和静态检查不代表运行验收通过。
