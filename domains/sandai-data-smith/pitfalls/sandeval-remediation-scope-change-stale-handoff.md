---
name: sandeval-remediation-scope-change-stale-handoff
type: pitfall
created: 2026-10-05
updated: 2026-10-07
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


**代改兼容性 review（2026-10-05）：** 在 `e92221efb0c149cffa14e7e9612ca8675b7844cd` 的静态审查中，整改换作者完成后再正式质检代改，会产生合法的新答案版本；只要求当前引用等于整改冻结引用，会排除依赖接续的批次，阻断后续 Sand 提交和整包成果准入。Why：当前来源展示最新版本，质量冻结版本与合法代改谱系是不同事实，不能把所有新版本都视为无关变化。How to apply：同时核对 `remediation_batch_scope.py`、`facts/answer_amendment.py`、`inspection_context_service.py::_sand_batch_predecessors` 和 `result_eligibility_service.py`；代改执行中与最终封存的资格分别验证，避免报告自身无法提交。组合场景、影响边界与测试缺口见 [第二轮 review](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/review-2.md)。该条是审查提交上的发现，不代表后续修复或生产故障已验证。

**正式代改接续修复指针（2026-10-07）：** 业务仓库本地提交 `9b94a882df4bdff109b203b1115fde698cf7e0ed`；实现与验证边界见 [第二轮 review 修复记录](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/review-2-fixes.md)。**Why:** 换作者整改后的合法质检代改会继续推进来源版本；若来源写入和其执行回执已成功、质量代改账本尚未写完，原请求重试又先校验实时范围，会在补齐事实之前把自己锁住。**How to apply:** 批次接续只接受从冻结成员到当前引用的连续正式代改证据，校验真实报告、检查项、操作者、计划、写入版本和摘要，并拒绝断链、分叉或循环；范围归属证据不等于答案可见性或报告通过。恢复只读取原 task/card/request/fingerprint 完全匹配的来源执行回执，先复核当前权限、来源状态、计划、成员与处置，再补齐质量账本；没有来源回执不可推定成功。实现入口为 `inspection/amendment_provenance.py`、`inspection/sand_review_write.py` 和 `inspection/answer_amendment_service.py`，组合回归在 `test_remediation_amendment_scope.py`。该提交的回归测试交由 CI，静态/契约检查不代表测试通过或已部署；后续运行状态重新核验。

**PR 核验入口（2026-10-07）：** [测试 PR #2241](https://github.com/world-sim-dev/sandai-data-smith/pull/2241) 由 `codex/correction-reviewer-names` 指向 `sandeval-test-only`。四条任务提交已从原 main 基线更新到 `afd72cda8d10`，生成文档由原生成器处理冲突，业务补丁的 range-diff 核对记录见 [PR 准备记录](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/pr-status.md)。CI、合并与部署状态读取 PR 和对应 run，不能由历史本地提交推定。

**恢复引用与调用契约（2026-10-07）：** Why：质量侧冻结引用含 quality_snapshot，而来源代改客户端只剥离这一缓存字段；恢复时混用两层引用会拒绝合法原请求。How to apply：核验两层除该字段外完全相同后，按原质量引用重算原绑定；连续代改使用其替换引用，不能顺便忽略 work_scope、计划、操作者或元数据。假来源也必须遵守真实客户端的字段边界。同时，会话复用不应让公开读取 API 自递归，避免调用计数与一次真实读取的契约分离；保留原预算断言。具名失败、218 个定向用例及补修提交 dd3d6dfec 的指针见 [PR 准备记录](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/pr-status.md)，最终 CI 状态以 PR 对应最新 head 为准。

**Main PR 指针（2026-10-07）：** 用户授权后由干净开发分支创建 [main PR #2246](https://github.com/world-sim-dev/sandai-data-smith/pull/2246)，五条补丁更新到最新 main 后经 range-diff 确认等价。前序测试 PR #2241 的合入与测试部署证据、准确 base/head、main Gate 及浏览器/生产验收边界见 [main PR 记录](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/main-pr-status.md)；后续状态以对应 PR/run 回读为准。
