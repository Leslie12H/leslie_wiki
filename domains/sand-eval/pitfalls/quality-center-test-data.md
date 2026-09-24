---
name: sand-eval-quality-center-test-data
type: pitfall
created: 2026-09-17
updated: 2026-09-23
tags: [sand-eval, testing, quality-center]
links: []
---

# Sand Eval 质量中心测试数据入口

**Why:** 2026-09-17 构造待质检测试数据时，任务内 QcCard 的空间质检队列不能证明题目已进入质量中心。用户需要在质量中心查看并执行质检，验收必须针对该中心的分配、检查任务和冻结题目详情。

**How to apply:** 先读 `sandai-data-smith/sand-eval/docs/subsystems/quality-center.md`。沿来源任务公开契约确认完整应交份数、已作答的标注批次，再通过质量中心 PolicyService 和 BatchAllocationService 做规则登记、预览和正式分配。不要以任务内 QcCard 分配代替中心送审。测试环境也应校验独立 Holo 与 OSS 写前缀。

排查指针：`platform/backend/app/services/facts/task_assignments.py` 的 `_quality_context` 校验完整应交人数，`list_submission_scopes` 从 assignment waves 生成可送审批次。仅使用旧派题 CLI 后若没有批次，先核对真实分配事实，再按官方 `backfill-assignment-waves` 的 dry-run / apply 流程限定本次任务补齐，保留其推断标记。

验收指针：`quality/application/management/leader_query_service.py` 的管理列表；`quality/application/inspection/review_query_service.py` 的本人待办、详情与冻结题目。核对待质检数量、检查人、可执行动作、无阻断以及题目内容可读。管理与质检链接在 `platform/frontend/src/routes/quality.tsx`，root 用户的管理页默认 Sand 阶段，供应商批次需显式选择 `space_qc`。

2026-09-21 构图待质检验收：当前批次门禁、标注员主动提交质检及实际工作台证据见 `/Users/leslie/Documents/Playground/output/sandeval-composition-qc-20260921/report.md`。完成数量不等于已交接；复用脚本时检查当前 `can_allocate` 和阻断原因，再走 `my_tasks.py` 的批次交接接口。

2026-09-23 生产排查：负责人工作台的“代交接”请求若返回 500，先按质量任务号和 `/leader/batches/<scope>/handoff` 查 SLS 的同秒 stderr。`management_handlers.hand_off_annotation_batch` 曾调用不存在的 `runtime.allocations`，而组合根实际只暴露 `runtime.batch_allocations`，请求会在进入 `hand_off_batch` 和来源门禁前抛 `AttributeError`，因此服务端不会产生 `QualityError code`。

同日产品口径恢复为：负责人可直接分配题目已全部完成且尚未分配的批次，标注员主动交接保留为本人确认和锁定事实，不再作为 `can_allocate` 前置条件。负责人页面不显示“代交接”；确认分配时由质量中心冻结实际送检答案版本和责任范围。修复分支 `codex/fix-quality-handoff-allocation`，本地提交 `2bff1030a`，尚未发 PR 或部署。

2026-09-24 生产排查：管理页的分配扩展记录只是计划/执行进度，不能单独证明质检员账号里已有同数目的真实待办。一次分配若中途停止，管理页仍可能保留已选检查人和全部计划批次，但本人列表只读取已经创建、属于当前提交链的 `eval_quality_review_task`。数字不一致时，按质量任务分别核对分配记录中的 `submission_id` / `group_id`、真实检查任务、当前提交版本和本人工作台；恢复未完成分配后再同时复验管理页与检查人页面，不把跨数据包总数或仅有计划行的数量当作已下发任务数。

2026-09-24 生产排查：整包列表显示“待提交 Sand”、详情按钮仍禁用时，不要只看 `43/43` 验收数。服务端真正的判据是每个负责人复核报告的 `inspection_advancement.blocking_reasons`。当当前批次由多名供应商负责人验收，且任务没有显式 `task_reviewer_config.return_recipient_id` 时，整包生成持续阻断为 `RECIPIENT_UNRESOLVED`（供应商完整包需要明确承接及唯一质检负责人）。此时核对当前 43 批的最新 `vendor_review` 报告执行人，再通过人员配置明确整包退回接收人；后台恢复会重试待推进记录。列表“待提交”只按验收数归类，详情又因尚未生成 `vendor_package` 退化为 `PACKAGE_NOT_READY`，会隐藏上述真实阻断码；页面排查必须回读持久化推进记录。
