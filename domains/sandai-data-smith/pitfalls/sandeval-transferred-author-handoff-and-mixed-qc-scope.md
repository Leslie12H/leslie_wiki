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

实现坐标为 `app/services/facts/authored_annotation_handoffs.py`、`app/api/my_tasks.py::get_authored_annotation_handoffs_reader` 和 `frontend/src/pages/myTasks/AnnotationBatchList.tsx`；版本、测试PR与Gate、只读生产候选回查、虚构数据浏览器截图及测试分支冲突边界见[实施记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/implementation-status.md)和[PR #2839](https://github.com/world-sim-dev/sandai-data-smith/pull/2839)。入口代码验证、测试环境验收、生产上线和本人实际提交是四个独立状态，复用时分别查证。混合批次的后续方案与验收边界见下节，不能由单一入口的修复外推线上已恢复。

## 2026-10-26 混合范围与失效确认

**Why:** 原整批确认绑定完整范围和答案；一题产生后续版本后，旧确认可能失效，即使其余未送审答案没有改变。只解除混合批次的展示禁用仍可能缺少真实来源范围证明，或让旧通过掩盖新答案。

**How to apply:** 按稳定质检归属投影互不重复的固定成员分组，来源列举、版本读取、提交证明和派检共用同一标识。已有质检的题沿原责任链；新答案使用“核对答案版本 → 按最新版重新复验”，普通退回质检员不换版。原整批确认只有精确匹配当前完整成员和答案时才覆盖分组；失效确认由本人绑定新清单重交并追加回执，原历史不改写。验证须覆盖独立首送、原链复验、整包完整性及无重复成员，不能只验证按钮可点。

实现从 `app/domain/annotation_inspection_partition.py`、`app/repositories/annotation_qc_allocation.py::inspection_owners`、`app/services/facts/task_assignments.py` 和 `quality/application/resolution/latest_answer_reinspection.py` 回查。转派操作人及无业务原因的审计边界、调查期间出现后续质检版本的核验、本人确认与质检候选、最终提交与Gate状态见[混合范围修复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/mixed-fix-status.md)及[PR #2839](https://github.com/world-sim-dev/sandai-data-smith/pull/2839)。原作者、当前持卡人、各批验收人和整包最终提交人分别核验；整包尚未封存时不把回落规则说成已经指定了提交人。

分组进入质检后还须反向约束原持卡批次。**Why:** 只更新质检队列，会让个人看板和普通修改仍按旧批次标识误判；滚动发布时，给旧领域对象直接增加序列化字段还可能令旧进程无法解码或在写回进度时丢掉门禁。**How to apply:** 来源提供父范围关联，贯穿预览和分配；准备中的分配也参与原批次门禁。兼容测试同时证明旧对象形状可读、旧进度写回不会丢失限制、真实数据库匹配父范围且拒绝其他范围。具体字段与存储实现沿修复记录和 `quality/infrastructure/persistence/batch_allocation_repository.py` 回查。


## 2026-10-26 数据包展示的低风险边界

**Why:** “原批次处理中”“部分题目”“重新确认”没有明确题目范围、待办人和下一步；为了补齐展示而额外展开历史任务查询，又会增加读取范围，并可能把旧答案的通过误当成当前答案已通过。

**How to apply:** 先用现有接口返回的范围、作者、状态和操作引用，明确未送审份数、谁应提交质检及负责人何时可以派检。仅把确认入口改名为提交质检，不改变提交请求或权限；原任务详细状态通过现有详情入口核对，不以展示层推测覆盖关系。性能结论应限定为本轮没有新增请求或查询，不能外推其他功能的延迟不变。

本轮实现从 `frontend/src/pages/quality/management/PackageBatchStatus.tsx`、`PackageDetail.tsx` 和 `frontend/src/pages/myTasks/AnnotationBatchList.tsx` 回查；没有增加后端读取。虚构数据浏览器证据、最终提交与 Gate、未部署边界见[展示修复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/display-status.md)及[PR #2839](https://github.com/world-sim-dev/sandai-data-smith/pull/2839)。


## 2026-10-26 完整差异 review 的边界

**Why:** 仅展示层无新增查询，不能外推整个修复的查询成本；保存不可变门禁元数据，也不代表滚动版本能完整恢复领域对象。全量 CI 通过仍可能遗漏历史任务规模、单任务失败隔离及旧写回后的新读取往返。

**How to apply:** 本人待提交列表应限定有效待办并批量或有界读取，避免逐历史任务展开。错误必须带任务范围，只阻断不能证明完整性的任务；不能让单个历史异常抹掉其他健康入口。扩展记录兼容要实测旧进程替换 payload 后，新进程从保留的 owner_ref 恢复字段，并通过原命令幂等重试，不能只检查新写回 SQL 没有修改 owner_ref。

本次逐提交说明、三个具名缺口、隔离脚本和证明范围见[main PR 复查记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/review-main-2842.md)及[PR #2842](https://github.com/world-sim-dev/sandai-data-smith/pull/2842)。修复采用同请求批量归属事实、按任务隔离失败、所有领域对象读取恢复不可变父范围；实现、隔离前后对照、页面证据和最新 Gate 以[review 修复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/review-fixes-status.md)及该 PR 当前 head 为准，不将隔离调用预算等同于生产延迟。
