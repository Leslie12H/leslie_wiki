---
name: sandeval-supplier-task-grouping
type: reference
created: 2026-09-26
updated: 2026-09-26
tags: [sandai-data-smith, sandeval, supplier, dispatch]
links: [sandeval-local-startup]
---

# Sand Eval 供应商任务与批次分类入口

**Why:** 供应商执行列表的历史命名可能重名或含任务名后缀。检查任务归属时应追溯明确的发布关联，不能通过批次名称猜所属任务。

**How to apply:** 在 sandai-data-smith 当前发布分支检查以下 owner；分组功能是否已上线、相关配置是否启用，必须重新核对部署与页面，本文不保存发布状态。

- 供应商列表入口：`sand-eval/platform/frontend/src/pages/mySpaceTasks/SpaceTaskListPage.tsx`；原派题路径由 `domain/paths.ts` 管理。
- 本空间取数与归属约束：`sand-eval/platform/backend/app/repositories/my_space_tasks.py`；发布任务关联 owner 为 `eval_dispatch_master_item` / `eval_dispatch_master`，同时核对本空间 scope 与关联唯一性。
- 配置与 API 装配：`sand-eval/platform/backend/app/api/my_space_tasks.py`、`app/config.py`；检查 `dispatch_workspace_enabled` 的实际值与仓储构造参数。不要把其他环境的开关状态当成本地事实。
- 质检中心分组参考：`sand-eval/platform/frontend/src/pages/quality/inspection/SupplierInspectionList.tsx`；它的分组对象与派题发布关联须分别核对。
- 内置帮助正文：`sand-eval/platform/backend/app/usage_docs/content/space-owner/manage-space-task.md`；文档同步路由由 `sand-eval/.agents/skills/sand-eval-platform-doc-sync/scripts/check_usage_docs_sync.py` 管理。
- 本地启动与健康检查参考 [本机启动入口](sandeval-local-startup.md)。
