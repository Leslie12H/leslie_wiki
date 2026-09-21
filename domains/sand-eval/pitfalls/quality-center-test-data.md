---
name: sand-eval-quality-center-test-data
type: pitfall
created: 2026-09-17
updated: 2026-09-21
tags: [sand-eval, testing, quality-center]
links: []
---

# Sand Eval 质量中心测试数据入口

**Why:** 2026-09-17 构造待质检测试数据时，任务内 QcCard 的空间质检队列不能证明题目已进入质量中心。用户需要在质量中心查看并执行质检，验收必须针对该中心的分配、检查任务和冻结题目详情。

**How to apply:** 先读 `sandai-data-smith/sand-eval/docs/subsystems/quality-center.md`。沿来源任务公开契约确认完整应交份数、已作答的标注批次，再通过质量中心 PolicyService 和 BatchAllocationService 做规则登记、预览和正式分配。不要以任务内 QcCard 分配代替中心送审。测试环境也应校验独立 Holo 与 OSS 写前缀。

排查指针：`platform/backend/app/services/facts/task_assignments.py` 的 `_quality_context` 校验完整应交人数，`list_submission_scopes` 从 assignment waves 生成可送审批次。仅使用旧派题 CLI 后若没有批次，先核对真实分配事实，再按官方 `backfill-assignment-waves` 的 dry-run / apply 流程限定本次任务补齐，保留其推断标记。

验收指针：`quality/application/management/leader_query_service.py` 的管理列表；`quality/application/inspection/review_query_service.py` 的本人待办、详情与冻结题目。核对待质检数量、检查人、可执行动作、无阻断以及题目内容可读。管理与质检链接在 `platform/frontend/src/routes/quality.tsx`，root 用户的管理页默认 Sand 阶段，供应商批次需显式选择 `space_qc`。

2026-09-21 构图待质检验收：当前批次门禁、标注员主动提交质检及实际工作台证据见 `/Users/leslie/Documents/Playground/output/sandeval-composition-qc-20260921/report.md`。完成数量不等于已交接；复用脚本时检查当前 `can_allocate` 和阻断原因，再走 `my_tasks.py` 的批次交接接口。
