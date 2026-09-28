---
name: sandeval-inspector-rework-structure-and-round-list
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sandeval, quality, caption-refine, rework, task-list]
links: [sandeval-repeated-return-feedback-lineage, sandeval-roles-and-workflow]
---

# Sand Eval 质检员整改轮次与 Caption 结构代改边界

**Why:** 2026-09-28 的生产只读排查中，负责人反复退回后，质检员列表一度同时显示同一批次的旧轮次与新轮次，旧轮次标成“状态待确认”；最新工作台则显示新轮次的固定检查样本。退回会生成新检查轮次，但不会扩大 Caption Refine 题型的质检代改能力。把不同轮次误认为新生成了重复原题，或把根账号观察模式的只读拦截误认为质检员权限，都会误判原因。

**How to apply:** 先核对链接中的质量任务、检查任务、检查明细三个 ID，区分当前 `attempt`、`previous_task_id` 链和每轮抽样明细；不能只按任务名、批次名或“第 N 题”判断重复。列表摘要可用时按 `visible` 隐藏历史；摘要尚不可用时历史记录可能暂时显示为“状态待确认”，应进详情核对真实状态并在摘要就绪后回读。Caption Refine v6 的质检代改可改正文与允许的镜头切点；新增、删除、合并镜头，以及新增、删除、重命名场景对象受到前后端限制。需要这些结构修改时应走有该操作能力的标注整改链，不能靠再次退回质检员解锁。根账号“查看成员”模式会拦截修改，不能用其禁用按钮判断成员本人是否可写。

- 列表与摘要指针：`sand-eval/platform/backend/app/repositories/quality_inspector_summaries.py::_scope_ctes`、`quality/application/inspection/review_query_service.py::detail`、`platform/frontend/src/pages/quality/inspection/SupplierInspectionList.tsx`。对具体生产实例，仍须实时核对摘要与检查任务记录。
- 题型能力指针：`sand-eval/platform/question_types/caption_refine_v6/backend/workflow.py::_ExactCaptionWorkflow`、`ui/SchemaEditor.tsx`、`ui/Answering.tsx`、`platform/frontend/src/components/questionTypes/shared/captionLocalWorkflow.ts`。
- 观察模式指针：`sand-eval/platform/frontend/src/pages/observation/RootReadBoundary.tsx::blockEdit`。部署版本与当前行为应现场验证。
