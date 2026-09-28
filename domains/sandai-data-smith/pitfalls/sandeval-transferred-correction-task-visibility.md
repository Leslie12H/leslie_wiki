---
name: sandeval-transferred-correction-task-visibility
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sand-eval, quality-center, reassignment, remediation, my-tasks]
links: [sandeval-cross-stage-feedback, sandeval-roles-and-workflow]
---

# 转派后整改接收人与原标注批次分离

**Why:** 质检按历史标注批次展示原作者，退回标注时却按固定工作项的当前持有人选接收人。若原作者交卷后工作项被转派，质检行上的标注员与实际整改接收人不同。个人任务页按当前投放批次列出卡；整改摘要保留历史批次键，两者不能直接按批次键合并，会出现独立警示入口，而不是当前批次表中的“待整改”。同一键差异还会触发写入门禁：整改工作台可打开，但当前持卡批次已交质检时，保存答案仍按当前批次键寻找整改摘要，历史批次键匹配不上便返回 `ANNOTATION_BATCH_SUBMITTED`。复验准备度按当前答案版本与冻结原版是否不同判断，两套判据分离，可能出现“可提交复验”却无法保存更新。

**How to apply:** 对“整改中但 `/me/tasks` 无对应标注任务”，先固定 QA、质量任务、原提交批次及工作项 ID；分别读原提交成员的 `producer_account_id`、当前 `ev3_assignment.holder_account_id`、`ev2_change_log` 的转派及新旧 wave、退回 `recipient_id`。再代登录**原作者和当前持有人**，核对个人批次、独立整改警示、工作台题目与可用操作。若工作台能打开但答案编辑区报“本批次已提交质检”，对照当前持卡批次键和整改摘要的原批次键，查 `annotation_write_gate.py` 的写入门禁；不要把可打开或“可提交复验”当成答案可编辑的证明。“已更新”仅说明答案版本引用不同，不证明该接收人在本次退回后修改，也不证明意见已解决。整改摘要即使写“待整改”，当前工作项再次转移或来源读取失败时也不能据此断言可编辑；必须单独核实来源可用性。同一来源任务可以有多条历史整改，列表需以质检任务和原批次区分。不要因原作者没有任务就判断整改未派发，也不要将当前持有人称作原答案作者。转派审计只证明操作者、时间和模式；若没有原因字段，不推断动机。

- 2026-09-28 限定实例、时间线、代码和实时页面证据：[只读报告](/Users/leslie/Documents/Playground/output/quality-correction-holder-20260928/report.md)。具体状态可变化，复用时重新读取。
- 退回取人：`sand-eval/platform/backend/quality/application/resolution/manual_return_service.py::_return` → `app/services/facts/task_assignments.py::annotation_correction_recipient`；批次合并与警示：`frontend/src/pages/myTasks/AnnotationBatchList.tsx`。
- 2026-09-28 同一实例后续页面显示可提交复验，但题目编辑区返回 `ANNOTATION_BATCH_SUBMITTED`；源码判据：`backend/app/api/annotation_write_gate.py::_correction_batch_if_fenced` 与 `_assert_correction_authorized` 按当前批次键匹配 `AnnotationCorrectionSummary.batch_key`，后者来自历史 `submission.scope_key`。`quality/application/resolution/answer_correction_service.py::_preview` 以当前和冻结答案的 `object_ref` 差异计算“已更新”和复验准备度。修复时应按精确整改单、工作项和当前持有人核权，避免放开整个任务的交卷保护。
- 2026-09-28 修复指针：[main PR #2134](https://github.com/world-sim-dev/sandai-data-smith/pull/2134)，当次 [Platform Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36397923304)。开发分支按当前持有工作项鉴权，并在摘要中单独标记来源可用性；列表对无法核实的整改不提供编辑入口，多条历史整改显示质检任务和原批次。PR、合并、部署和实际页面效果须重新核验。
- 转派审计在 `app/repositories/task_assignments.py` 的 `ev2_change_log` 与 assignment wave 写入；个人批次按当前持卡读取，入口为 `app/services/facts/my_tasks.py::list_my_annotation_batches`。
- 2026-09-28 另一生产实例在答案更新后点击“提交复验”返回 `SOURCE_FORBIDDEN / 无权访问此标注员的批次`。部署 `/health` 的 SHA 为 `11538fb3a164766bc20331a980de6635d6e6009c`；本人任务页显示整改仍在历史批次行，原批次键的作者与当前持卡整改人不同。源码路径：`quality/application/resolution/answer_correction_service.py::prepare` 经 `SubmissionService.prepare_correction` 首次冻结时传 `correction=True`；`quality/application/resolution/resubmission_intent.py::resume_resubmission` 恢复固定意图时再次调用 `SubmissionService.freeze`，却只传 `preserve_snapshots=True`，默认走普通送审 `validate_submission_scope`，最终在 `TaskAssignmentService._quality_manifest_with_owners` 以历史批次作者与当前整改人不同返回 403。排查此报错需同时核对原批次键、当前持有人、部署 SHA 和恢复路径；修复应让整改意图的二次校验沿用整改范围授权，并覆盖转派后提交及同一请求重试。该实例页面回读为“待整改、1/1 已更新”，本次未执行提交或生产写入；后续状态需重新核验。
