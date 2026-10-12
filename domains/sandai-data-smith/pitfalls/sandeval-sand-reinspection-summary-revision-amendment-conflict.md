---
name: sandeval-sand-reinspection-summary-revision-amendment-conflict
type: pitfall
created: 2026-10-12
updated: 2026-10-12
tags: [sand-eval, quality, sand-qc, reinspection, amendment, frozen-answer]
links: [sandeval-cross-stage-frozen-answer-superseded, sandeval-stopped-review-amendment-conflict, sandeval-reassigned-answer-frozen-review-conflict]
---

# Sand 复验换汇总版本后丢失停止轮次的代改基线

**Why:** 同一标注批次被 Sand 代改、整批退回、由供应商重新复验并交接后，固定叶子成员可以不变，但 Sand 汇总送审版本会变化。只按当前 Sand 轮次的相同 `submission_id` 追直系前驱会在换汇总版本处停止；只在当前任务是空间质检时展开委派退回链，也不足以让重新进入 Sand 的读取路径带入此前 Sand 已落地的修订。结果是页面基线仍是空间质检较早的代改，来源最新却是 Sand 后来的代改，正确的最新版本保护因而禁止继续代改。连续退回时，先只有一题被锁，后一题再次代改后也会被锁。

**How to apply:** 分别核对当前 review 的顶层汇总、原标注送审及固定成员，不能因顶层 SUB 改变就认定是另一批答案。核对 `previous_task_id`、连续 attempt、汇总的 `previous_submission_id`、完整包交接与前置通过报告、人工退回/供应商委派/空间复验正式证据，并把每条来源响应区分为普通标注或质检代改。只读调用实际 `resolve_predecessor_reports`、`visible_amendment` 与 `verify_current`，记录页面实际基线和来源最新响应；质检历史的“最近合格”不证明代改基线正确。

2026-10-12 可梦王思淇两题的生产实例、两轮退回时间线、真实基线与来源最新差异及浏览器只读证据，见 [现场报告](/Users/leslie/Documents/Playground/output/kemeng-qc-version-20261012/report.md) 和 [部署服务只读验证](/Users/leslie/Documents/Playground/output/kemeng-qc-version-20261012/guard-probe.json)。该案当前是 Sand 第 3 轮，不是错误打开旧入口；没有发现首次标注后新的普通标注提交。记录是核验时点证据，后续状态须重新读取。本轮仅排查，未进行生产修复。

修复应按正式版本/退回/委派证据，把同一固定叶子成员的合法修订继承到新的 Sand 汇总；读取、保存与修订资格共用判据。不得无条件读取来源最新、全局取消同送审限制、继承同组其他质检员草稿或改写历史快照。回归需包含第一次复验一题正常、再次代改退回后两题复验，以及无关新答案、平行检查和被否报告的反例。

代码指针：`sand-eval/platform/backend/quality/application/inspection/answer_amendment_service.py::visible_amendments`、`_lineages`、`_sand_return_chain`；`quality/domain/inspection/amendment_lineage.py::is_same_member_predecessor`；`quality/application/management/inspection_context_service.py::resolve_predecessor_reports`；`app/services/facts/answer_amendment.py::verify_current`。复用时按当前部署 SHA 核对实现。
