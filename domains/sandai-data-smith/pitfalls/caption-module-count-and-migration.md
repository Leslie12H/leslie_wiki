---
name: caption-module-count-and-migration
type: pitfall
created: 2026-09-24
updated: 2026-09-24
tags: [sand-eval, caption, quality, migration]
links: []
---

# Caption 旧模块数量与整题迁移

**Why:** 旧 module_scoped 任务可能把三个模块义务都绑定到同一答题卡。管理页按模块义务数作分母，却按答题卡算完成和已分批，因而出现 30 题显示 30/90、60 待分批。不能从该数字推断每题三人或要求再派卡。

**How to apply:** 先对照 `platform/backend/app/repositories/task_assignments.py::quality_legacy_module_scope` 的 obligations 与去重 members，再读来源服务的当前批次。质检是否可推进要另查 `inspection_advancement`，数量口径和未结退回可能同时存在。

2026-09-24 的只读证据入口：`/Users/leslie/Documents/Playground/output/sandeval-caption30-20260924/report.md`。其中记录生产标识、部署核验、迁移 dry-run 和明确未执行的边界。

迁移工具入口为 `platform/question_types/caption_refine_v5/backend/whole_question_migration.py` 与质量侧 `quality_task_service.py`。核对当前实现是否支持已有 `review_bundle`；旧版仅接受 `annotator_batch`，来源活动时还会被 `source_not_closed` 拦截。不能为了迁移删验收历史。

历史退回的子整改通过，不自动代表祖先责任已闭环。沿 `resolution_service.py::_authorized_rows` 区分执行授权与关闭责任，核对祖先版本和正式闭环路径。不要直接清除阻断状态。
