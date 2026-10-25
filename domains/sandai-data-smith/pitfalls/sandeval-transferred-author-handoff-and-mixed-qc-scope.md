---
name: sandeval-transferred-author-handoff-and-mixed-qc-scope
type: pitfall
created: 2026-10-25
updated: 2026-10-26
tags: [sand-eval, quality, reassignment, author, handoff, scope]
links: [sandeval-reassigned-answer-frozen-review-conflict, sandeval-partial-reassignment-package-completeness-gap]
---

# 转派后的原作者提交入口与混合质检范围

**Why:** 当前持卡权、最新答案作者、质量送审批次与冻结质检责任是不同事实。转派后若个人看板只读持卡人，而待提交质检按答案作者投影，就可能让原作者没有入口、新持卡人的提交又不覆盖原作者范围。新批次同时包含旧质检占用与从未送审题时，整批重复送审保护也可能将未送审部分一起挡住；“查看原质检任务”只提供导航，不能证明旧单覆盖整个新批次。

**How to apply:** 按稳定工作项并排核对当前持卡、最新响应作者与版本、逐卡改派审计、个人看板实际服务、作者明确交接回执、正式冻结成员、原质检轮次与处理人。分别统计旧占用和未送审部分；旧通过不能证明转派后新答案已检，也不能通过删除占用、扩大旧快照或减少应交数消除缺口。需要更改持卡归属时先确定业务接手意图；不得自动替active作者提交。修复验收应证明作者本人可提交、质检员真实收件、原责任链保存，以及应交集合没有重复或遗漏。

2026-10-25 梁旋、杨心月、文希三个具体形状、双生产副本只读核对、精确SHA、逐卡版本和待确认方案见[现场报告](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/report.md)。本次只读排查，没有生产恢复、代码PR或部署；当前状态和后续结果从报告及新回读查证，不能将本页当作已修复声明。

源码回查：个人看板 `app/repositories/my_tasks.py::annotation_tasks`、`app/services/facts/my_tasks.py::list_my_annotation_batches`；来源作者分组和本人交接 `app/services/facts/task_assignments.py::_submission_scopes_with_manifests`、`submit_annotation_batch_for_qc`；首次分配守卫 `quality/application/management/batch_allocation_service.py::batch_options` 和 `quality/infrastructure/persistence/inspection_work_claim.py`；接续展示 `quality/application/management/leader_query_service.py::_batch_options`、`frontend/src/pages/quality/management/PackageDetail.tsx`。复用时先按DEPLOY_SHA核实坐标和行为。


## 2026-10-26 原作者确认入口方案

用户明确选择保留当前标注员接手，恢复原作者本人对已保存作答的确认提交入口。**Why:** 不能为补交接入口擅自回退持卡归属，也不能让当前标注员的批次提交覆盖另一名作者的责任。**How to apply:** 原作者入口只使用当前仍属本人的最新答案范围，确认绑定scope版本和答案manifest；读取失败明确提示，成员或答案变化后重新确认，原有编辑权限不扩大。

实现坐标为 `app/services/facts/authored_annotation_handoffs.py`、`app/api/my_tasks.py::get_authored_annotation_handoffs_reader` 和 `frontend/src/pages/myTasks/AnnotationBatchList.tsx`；版本、测试PR与Gate、只读生产候选回查、虚构数据浏览器截图及测试分支冲突边界见[实施记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/implementation-status.md)和[PR #2839](https://github.com/world-sim-dev/sandai-data-smith/pull/2839)。入口代码验证、测试环境验收、生产上线和本人实际提交是四个独立状态，复用时分别查证。混合批次范围问题仍沿本页原调查报告核验，不能由此入口的修复外推已解决。
