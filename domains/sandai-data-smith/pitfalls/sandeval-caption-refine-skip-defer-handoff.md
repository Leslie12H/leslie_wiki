---
name: sandeval-caption-refine-skip-defer-handoff
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sand-eval, caption-refine, annotation, handoff, quality]
links: [sandeval-roles-and-workflow]
---

# Caption Refine 的跳过、待定与整批交质检口径不一致

**Why:** Caption Refine 工作流题的首次作答页提供“有问题，跳过”，但提交服务的工作流分支拒绝 `skipped`，返回“此题型需要完成整题修订，不能跳过”。“进入待定”只保存作答快照和待定回执，不生成正式答案；标注批次交质检只认有最新正式答案且未待定的成员。页面待定弹窗却称素材不会进入后续标注、质检，容易让人误以为该题已从整批交卷门槛移除。2026-09-28 只读核对任务 `a38415e6-5d21-54e8-be17-748ac89e11ad`、批次 `ae4470c6-899d-578a-b0c7-139e8bbf7de7:cfad9891-f924-571d-ba0d-da3f878aeb67`：6 张卡中 5 张有正式答案、1 张待定且无答案，批次无交质检记录。这是当日快照，之后须重新核验。

**How to apply:** 先用生产 `/health` 固定部署 SHA，再按任务、`assignment_id` 和批次键读 `ev2_task.rule_version`、`ev3_assignment`、`ev3_response`、`eval_answer_execution_receipt` 的 `annotation_defer`、`ev2_assignment_wave_item` 与 `eval_annotation_batch_handoff`。区分按钮可见、请求被拒、待定回执写入和正式答案写入；不要把待定当作已交，也不要为凑交卷虚构答案。代码入口：`sand-eval/platform/frontend/src/pages/myTasks/QuestionWorkPage.tsx`、`backend/app/services/facts/my_tasks.py::submit_answer`、`backend/app/services/facts/task_assignments.py::_quality_result_available` 与 `submit_annotation_batch_for_qc`。修复前要明确业务选择：让工作流跳过成为可质检的正式版本，或让经授权排除的待定卡不占交卷分母，并同步页面提示、交接清单及后续质检口径；此页不代表该选择已确定或已上线。

2026-09-28 修复范围核查：不能仅删除跳过拒绝条件后套用普通答案写路。工作流题的质检修订在 `backend/app/services/facts/answer_amendment.py::prepare` 读取对应固定作答上下文；缺回执会在后续质检报错。`backend/app/repositories/result_delivery.py::candidates` 只取非跳过答案，`backend/app/services/facts/result_delivery.py::_answers` 又要求主任务全题有完整固定答案。放开跳过送审时应同时核对修订恢复、正式结果交付和异常清单口径；批准跳过不应直接等同于产出有效 Caption。上述路径随代码变化，复用前重新读取。
