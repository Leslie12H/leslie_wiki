---
name: sandeval-transferred-legacy-batch-submit-qc-mismatch
type: pitfall
created: 2026-10-16
updated: 2026-11-04
tags: [sandeval, correction, reassignment, batch-key, handoff]
links: [sandeval-transferred-correction-task-visibility, sandeval-reassignment-scope-and-batch-responsibility]
---

# 转交整改后历史标注的普通提交入口误报

**Why:** 整改转交保留原工作项和历史 wave 成员，但个人批次按当前 assignee 连接 wave，可能回退成 `legacy:<current-account>`。普通送审服务另行投影真实的 `wave:<current-account>`；整改提交回执又保留原冻结范围键。三者只按 batch_key 对齐时，已成功交整改的卡仍显示“历史标注／待确认提交”，点击普通“提交质检”便报“标注批次不存在或已转派”。该提示不能证明数据再次转出，也不能证明此前提交复验失败。

**How to apply:** 先以 assignment、answer_card、当前 holder 和 disposition.recipient 证明身份，再同时核对个人列表键、普通送审范围键、整改正式回交及后继 review。把“保存答案”“提交整改”“普通提交质检”“派回复验”“质检正式通过”分别取证。不得通过改 URL、替换 batch_key 再交一遍或重派卡掩盖投影缺陷；修复须衔接同一工作项的当前批次、历史整改和已交状态，保留原作者及冻结谱系。

## 核验入口

[2026-10-16 柯衔只读核查](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/report.txt) 保存原转交链、当前卡身份、正式答案与整改提交、随后三次普通 submit-qc 404，以及真实后继复验任务。可变状态和具体 ID 只从报告及实时记录取得。

- `native.json`：当前账号身份调用现有只读服务，对比个人 legacy 批次、正式 wave 送审范围和整改工作台；没有重放写请求。
- `detail.json`、`independent-state.json`：同一冻结工作项、答案版本、整改提交及另一个 Pod 的当前复验状态。
- `request-summary.json`：普通 submit-qc 的错误与此前成功整改提交的时间关系；两者不是同一个动作。
- 代码入口为 `app/repositories/my_tasks.py::_personal_batch_members_sql`、`app/services/facts/my_tasks.py::_batch_key`、`app/services/facts/task_assignments.py::_submission_scopes_with_manifests` / `submit_annotation_batch_for_qc` 及 `frontend/src/pages/myTasks/AnnotationBatchList.tsx`。按报告中的部署 SHA 回读，不从本页推断当前代码是否已修复。

本次只读取证，未修改生产、提交或重派；后继复验 active 不代表复验已通过。


2026-10-16 长期修复指针：[PR #2510](https://github.com/world-sim-dev/sandai-data-smith/pull/2510)。个人批次沿同一工作项保留实际来源 wave；当前批次与历史整改的关联须验证完整且唯一的同一组答题卡，不能以部分重叠合并，也不能改写原冻结范围。PR、Gate 与生产部署分开核验，精确运行版本和原单只读验收留在[现场报告](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/report.txt)。


2026-10-16 部署后验收入口：[原单只读验收报告](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/postdeploy-report.txt)。报告独立保存 PR Gate、生产合并 SHA、全部副本、实际下发前端资源及多 Pod 原生查询；同时区分占用解除、列表状态、真实整包与正式提交，不能把源码或候选计算通过等同于业务交接完成。后续状态须实时读取。

## 2026-11-03 已进质检的卡普通转派后仍显示待提交

**Why:** 个人标注列表按当前持卡人和派题 wave 分组，按新批次键查询送审回执和已分配时间。质检侧按稳定工作项保留既有检查责任，继续使用原冻结范围。新个人批次的卡全有正式答案时，列表可能显示「待提交质检」，但如果所有卡都已被原质检范围占用，普通提交服务就找不到新批次键并返回 404。转派后保存的最新版与原质检冻结版本需要单独核对。

**How to apply:** 先用同一 task/batch_key 对照题单 GET 和 submit-qc POST，再查当前持卡范围、`inspection_owners`、带和不带质检分区的送审投影，以及冻结版本与最新版。按原批次分别核对仍在检查和已退回的分支。保留冻结记录，使用负责人核对答案版本或原退回整改入口处理后续；是否可继续须回读相应门禁。展示层应按实际送审资格决定按钮，并说明已在原质检流程中的题数。

现场回查指针为质量任务 `QT-a532c0d7f4f65933b278c4231f28884f`、派题批次 `949b6c8e-3fe4-49a4-8fc0-9f4412d8eb40`、2026-11-03 22:24（北京时间）提交日志，以及生产版本 `3fb2d5cba36186041d24e727e339d06152825a3a`。代码入口为 `MyTasksService.list_my_annotation_batches`、`TaskAssignmentService._quality_projected_waves`、`AnnotationQcAllocationRepository.inspection_owners` 和 `AnnotationBatchList.tsx`。

### 2026-11-03 受控复验与原质检员兼持卡人的边界

**Why:** 仍在检查的旧批次可由有权限的负责人按最新版发起复验，已停的标注退回轮次走原整改。原质检员兼任当前持卡人时，直接把原退回单转给他会触及角色冲突。普通转交整改也要求原整改人仍持有完整批次，不能用它补记已经发生的普通改派。

**How to apply:** 用 `app.cli.latest_answer_reinspection` 按原 review ID 预览和执行，独立回读旧轮停用、新轮可保存、冻结引用与正式最新版相同。对停轮先按原退回类型验证转交入口及接收人校验，避免把原标注退回当作可转交的待重检责任。

实际执行和逐批回执见[现场审计](/Users/leslie/Documents/Playground/output/sandeval-949b-qc-recovery-20261103/report.md)。

### 2026-11-03 普通作答提交与整批送审的门禁差异

**Why:** 普通作答写入的 `_correction_work_unit_if_fenced` 使用当前个人批次键查送审回执与质检分配。普通转派换了批次键，同一稳定卡的旧质检责任仍在，但此写入检查没有按卡查该责任。整批送审则按稳定卡上的既有检查责任投影，所以同一批可以保存新答案，却无法按新键送审。完成卡的暂缓入口已有额外的逐卡检查，不能用它代表普通作答提交路径。

**How to apply:** 对同一卡分别核对普通 `submit` 执行回执、整批送审回执、旧冻结时间和新复验创建时间。用部署中的普通作答门禁做只读重跑，同时查任务是否允许自由修订、新批次键的分配与回执、按稳定卡查到的质检归属。不要通过实际写答复现门禁。现场坐标沿用上文，答案回执集中在 2026-11-03 22:04–22:06（北京时间）。只读重跑的部署 SHA 为 `47a14c6d65abd8ca7a7204067551b339b414f156`。

### 2026-11-04 历史批次整改显示范围暂不可用

**Why:** 普通标注改派后，原退回单可能仍由原接收人处理，当前题卡则已归其他人。原接收人能看到历史退回，但读取冻结范围的最新答案时会被当前持有人校验拦住。列表此时同时隐藏整改入口和更新计数。正式答案是否存在、退回单是否开放、当前账号能否整改需要分别核对。

**How to apply:** 用列表里的原批次键找到退回单和冻结送审，按稳定工作项核对当前持有人、派题波次和正式答案。以退回单接收人身份复跑整改摘要及来源读取，分别记录处置状态、来源错误和更新计数。处理前独立确认正式整改转交的准入，尤其是旧整改人已无持卡和候选人兼原质检员的情况。

现场回查指针为质量任务 `QT-a532c0d7f4f65933b278c4231f28884f`、退回单 `DISP-f062bda3ae315612ba39cf3d03fb1d6e` 和[双副本只读回查](/Users/leslie/Documents/Playground/output/sandeval-r2v-correction-scope-20261104/independent-readback.json)。代码入口为 `AnswerCorrectionService.annotation_page`、`TaskAssignmentService._annotation_correction_context` 和 `AnnotationBatchList.tsx`。
