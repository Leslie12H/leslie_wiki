---
name: sandeval-transferred-correction-task-visibility
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sand-eval, quality-center, reassignment, remediation, my-tasks]
links: [sandeval-cross-stage-feedback, sandeval-roles-and-workflow]
---

# 转派后整改接收人与原标注批次分离

**Why:** 质检按历史标注批次展示原作者，退回标注时却按固定工作项的当前持有人选接收人。若原作者交卷后工作项被转派，质检行上的标注员与实际整改接收人不同。个人任务页按当前投放批次列出卡；整改摘要保留历史批次键，两者不能直接按批次键合并，会出现独立警示入口，而不是当前批次表中的“待整改”。

**How to apply:** 对“整改中但 `/me/tasks` 无对应标注任务”，先固定 QA、质量任务、原提交批次及工作项 ID；分别读原提交成员的 `producer_account_id`、当前 `ev3_assignment.holder_account_id`、`ev2_change_log` 的转派及新旧 wave、退回 `recipient_id`。再代登录**原作者和当前持有人**，核对个人批次、独立整改警示、工作台题目与可用操作。不要因原作者没有任务就判断整改未派发，也不要将当前持有人称作原答案作者。转派审计只证明操作者、时间和模式；若没有原因字段，不推断动机。

- 2026-09-28 限定实例、时间线、代码和实时页面证据：[只读报告](/Users/leslie/Documents/Playground/output/quality-correction-holder-20260928/report.md)。具体状态可变化，复用时重新读取。
- 退回取人：`sand-eval/platform/backend/quality/application/resolution/manual_return_service.py::_return` → `app/services/facts/task_assignments.py::annotation_correction_recipient`；批次合并与警示：`frontend/src/pages/myTasks/AnnotationBatchList.tsx`。
- 转派审计在 `app/repositories/task_assignments.py` 的 `ev2_change_log` 与 assignment wave 写入；个人批次按当前持卡读取，入口为 `app/services/facts/my_tasks.py::list_my_annotation_batches`。
