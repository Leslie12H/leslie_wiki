---
name: sandeval-inspector-rework-round-list-and-editability
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sandeval, quality, caption-refine, rework, task-list]
links: [sandeval-repeated-return-feedback-lineage, sandeval-roles-and-workflow]
---

# Sand Eval 质检员整改轮次与可编辑性核验

**Why:** 2026-09-28 的生产只读排查中，负责人反复退回后，质检员列表一度同时显示同一批次的旧轮次与新轮次，旧轮次标成“状态待确认”；最新工作台则显示新轮次的固定检查样本。一个源任务可包含同一派题批次下不同标注员的质检范围，因此相同“第 1 批次”名称本身也不代表重复；同一范围的旧质检轮次进入当前工作列表才是另一类重复感。把不同轮次误认为新生成了重复原题、把历史答案面板或根账号观察模式的只读拦截误认为质检员权限，都会误判原因。单看 Caption Refine 工作流里的 `inspector` 结构限制也会误判：质检修订的正式保存链会按记录的操作在服务端以 `annotator` 角色重放，再做完整校验。

**How to apply:** 先核对链接中的质量任务、检查任务、检查明细三个 ID，再按源任务、派题批次、标注员范围和质检轮次区分记录；不能只按任务名、批次名或“第 N 题”判断重复。同一标注员范围允许保留历史正式送审版本和质检轮次，但当前工作列表应仅显示最新正式版本的当前检查组；历史可留在详情中审计。列表摘要可用时按 `visible` 隐藏历史；摘要尚不可用时历史记录可能暂时显示为“状态待确认”，应进详情核对真实状态并在摘要就绪后回读。当前轮次要核对 `active` 状态、`save_items`、本轮答案编辑器及具体报错；历史修订和上一轮质检面板为只读。Caption Refine v6 的结构修订还要核对前端操作记录和 `answer_amendment.py` 的服务端重放，不能仅凭工作流中 `inspector` 分支定能力。根账号“查看成员”模式会拦截修改，不能用其禁用按钮判断成员本人是否可写。

- 列表与摘要指针：`sand-eval/platform/backend/app/repositories/quality_inspector_summaries.py::_scope_ctes`、`quality/application/inspection/inspector_list_projection.py::current`、`quality/application/management/submission_service.py::_current_batches`、`quality/application/inspection/review_query_service.py::detail`、`platform/frontend/src/pages/quality/inspection/SupplierInspectionList.tsx`。对具体生产实例，仍须实时核对摘要与检查任务记录。
- 题型修订指针：`sand-eval/platform/frontend/src/pages/quality/inspection/StructuredAnswer.tsx`、`platform/backend/app/services/facts/answer_amendment.py::prepare`、`platform/question_types/caption_refine_v6/backend/workflow.py::_ExactCaptionWorkflow`。结构操作是否成功仍以当前任务的保存回执为准。
- 观察模式指针：`sand-eval/platform/frontend/src/pages/observation/RootReadBoundary.tsx::blockEdit`。部署版本与当前行为应现场验证。
