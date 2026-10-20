---
name: sandeval-reassigned-answer-frozen-review-conflict
type: pitfall
created: 2026-10-12
updated: 2026-10-20
tags: [sand-eval, quality, reassignment, frozen-answer, submission]
links: [sandeval-transferred-correction-task-visibility, sandeval-cross-stage-frozen-answer-superseded, sandeval-amendment-lookup-recovery]
---

# 转派后的标注新版与原质检冻结版本冲突

**Why:** 质检检查引用固定送审成员，来源作答卡按稳定工作项追加答案。工作项转派后，新持卡人的普通标注提交也能产生后续版本；旧质检仍检查原版本，编辑保护发现原答案不再是来源最新答案，就禁止继续代改。历史作者、当前持卡人、新版作者和各自送审任务要分别核对。仅有“已有后续版本”提示不能推定为质检代改继承丢失，也不能推定新版尚未送审；同一工作项可能已在另一批次中建立新的质检任务。

**How to apply:** 从精确 task/review/item 找到冻结 `submission_item.object_ref` 与 `work_unit_id`；按同一 `assignment_id` 查询全部来源响应和正式执行回执，判断新版属于标注 submit 还是 inspector_amend。逐卡查询 `ev2_change_log(entity='assignment', entity_id=assignment_id, operation='reassign')`，任务汇总或 assigned_at 不能证明目标卡的改派时间。再按 work_unit_id 找全部正式送审成员与对应真实 review_task，核对当前处理人与状态。刷新不会替换原轮次的冻结引用；如果新版已送审，应先核对新旧质检任务衔接，不能重复执行通用“重新送审”提示。

2026-10-12 邓敏实例的只读时间线、独立 Pod 核验和真实新旧检查项入口见 [现场报告](/Users/leslie/Documents/Playground/output/deng-qc-version-20261012/report.md)。该报告记录核验时点事实，不代表之后状态。未执行生产修复或任务处置。

代码指针：`sand-eval/platform/backend/app/services/facts/answer_amendment.py::verify_current`（最新答案保护）；`app/repositories/task_assignments.py`（逐卡改派审计与新批次）；`quality/infrastructure/persistence/submission_repository.py`、`review_task_repository.py`（冻结成员与轮次）；`frontend/src/pages/quality/inspection/StructuredAnswer.tsx`（可普通判断与禁用代改的提示）。复用时按 live DEPLOY_SHA 读取对应代码。

## 2026-10-12 初期修复方案指针（形成时尚未实施）

源码核查定位到两个相同身份断点：`app/api/annotation_write_gate.py::_correction_work_unit_if_fenced` 按当前 `wave_id:account_id` 查送审/分配；`quality/application/management/submission_service.py::check_revision` 仅对相同 scope_key 查重。对应文件已与现场部署提交比对。**Why:** 改派不改变稳定工作项，但会改变两个门禁依赖的批次/账号键，原送审约束没有跟到新键。

**How to apply:** 设计修复时把冻结写入保护与跨批次送审准入统一到稳定工作项及正式版本链；保留实际答案作者和历史批次展示，保留已授权换作者整改及合法多质检员。存量修复先核对完整送审范围与下游依赖，不能因为一个抽样题重叠就停止整批，不能直接替换冻结答案或把被替代视为通过。详细设计与验收要求见 [修复建议](/Users/leslie/Documents/Playground/output/deng-qc-version-20261012/repair-plan.md)；本建议不代表规则已获实施或生产修复已执行。


## 2026-10-12 修复实现与验收指针

针对稳定工作项的冻结写入保护和正式发布准入，已形成[测试 PR #2379](https://github.com/world-sim-dev/sandai-data-smith/pull/2379)；实现、精确提交、完整 CI 和测试环境验收边界见[修复交付记录](/Users/leslie/Documents/Playground/output/deng-qc-version-20261012/implementation-status.md)。状态会变，复用时读取 PR 与记录，不能将候选实现当作已上线的规则。赖航艳的第 5 批次入口已在真实页面验证可代改；未改写生产历史或判断。

**Why:** 冻结约束须跟随 Sand Eval 的稳定答题卡，同一张卡不能因换持有人而在另一范围重复送审。该约束不能泛化到其他来源的工作项复用规则。

**How to apply:** 回归验证已冻结卡转派、当前持有人正式整改、未送审卡、旧部署无准入记录、重叠批次并发、同范围中断重试和多质检员；实际 Hologres 写入语义和容量在测试环境验收，不能以只读 EXPLAIN 或 SQLite 契约测试替代。测试分支只接收开发改动，遇到生成资料冲突时不得将测试历史反向并入开发分支。


## 2026-10-20：有效交付已排除旧批次，旧检查仍留在待办

**Why:** 纸面 _11 的只读核验确认，转派后的普通人员批次与原作者固定整改批次存在整批重叠；整改后继已经产生正式代改、通过报告并交给 Sand，另一条无继承关系的普通检查仍 active。有效交付分区排除重复批次，不等于历史检查自动退出待办；同一质检员也不等于可以跨独立检查链共享代改。界面因此正确保护旧冻结版本，却让人继续面对已被另一条正式流程覆盖的待办。

**How to apply:** 对照旧批次全部 work_unit_id、整改后继全集、原生 live_annotator_partition、正式交接回执和两条检查的实际样本，确认是否完整覆盖而非仅一个抽样项重叠。用负责人身份只读调用最新版复验 preview；若返回 PACKAGE_ALREADY_SUBMITTED，不能从旧任务重送，也不能直接把旧任务记作通过。先核对整批下游依赖，再设计显式退役/衔接；不改历史冻结成员。不得把本类跨人员旧待办误归因于 Sand 包装待定声明遗漏。

- [2026-10-20 纸面旧检查只读报告与第二 Pod 核验](/Users/leslie/.codex/visualizations/2026/10/19/01a1544d-7a4e-75d2-86c4-7fdd7aa21cb2/sandeval-case-20261020/report.md)：原链接、精确对象、北京时间线、正式回执、当前部署及本次仅只读的边界。任务当前状态会变，沿报告重新查询。
- 当前源码指针：quality/application/inspection/answer_amendment_service.py::visible_amendments 与 quality/application/resolution/latest_answer_reinspection.py::_assert_no_foreign_handoff；复用前按当前部署 SHA 验证。
