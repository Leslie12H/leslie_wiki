---
name: sandeval-stopped-review-amendment-conflict
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sandeval, quality, amendment, reinspection, manual-return]
links: [sandeval-inspector-rework-round-list-and-editability, sandeval-amendment-lookup-recovery]
---

# 整批退回后，上一轮代改与新轮冻结答案冲突

**Why:** 质检代改会立即向来源作答卡追加新 `ev3_response`，但修订能否作为后续质检基线，还要由该轮已提交且通过的报告封存。负责人在代改后将整批退回质检员，会把尚未提交的上一轮标记为 `stopped`；同一送审版本的新轮仍冻结原答案。此时来源最新答案已是上一轮代改，新的答案草稿读取会报 `ANSWER_BASE_SUPERSEDED`，页面只允许对冻结答案作普通判断。单纯重建 Git test 分支不会改变这一生产状态。

2026-09-28 生产只读核验入口：[质检检查项](https://eval.sandaii.cn/quality/inspection?task=QT-2a37e2d62d45581eb09f9acb7530e9ed&review=RT-b1cdc2a034465684a0d1f6119f6aa626&item=RI-d6a3452ae6a252849a3548d210aadacd)。同一 `assignment_id` 的原 response 为 `7a8c2641...`，上一轮质检员于 2026-09-27 19:21（北京时间）代改生成 `5be046de...`；上一轮 `RT-553168ff...` 在 19:46 因手工整批退回变为 `stopped`，没有正式报告。新轮 `RT-b1cdc2...` 为 `active`，沿用相同送审和原 response。退回处置为 `DISP-01bcc758...`，新轮请求标识为 `MANUAL_RESTART`。这些状态会变化，复用时须重新查询。

**How to apply:** 对同类提示按精确检查项核对：`eval_quality_review_item` 的送审成员与 `eval_quality_submission_item.object_ref`；同一 `assignment_id` 的原版和最新 `ev3_response`；`eval_quality_review_amendment_lookup` 对应的修订事实；前序与当前 `eval_quality_review_task` 的 `previous_task_id`、状态、计划和提交结果；以及 `eval_quality_disposition` 的退回方向与时间。不要把“已有后续版本”一概当成标注员重新提交，也不要直接把未封存修订当成合格继承版本。修复需要为“代改后整批退回”的修订确定受控去向：明确允许同成员直系新轮继承的处置凭据与资格，或在退回前完成其他受控版本处理；保留原答案、修订和审计记录，继续执行最新版本写入保护。

代码入口：`sand-eval/platform/backend/app/services/facts/answer_amendment.py::verify_current`；`quality/application/inspection/answer_amendment_service.py::visible_amendment` / `candidate`；`quality/domain/inspection/amendment_lineage.py::sealed_by`；`quality/application/resolution/manual_return_service.py` 的退回停止与重启。实际部署版本与流程须现场核验。
