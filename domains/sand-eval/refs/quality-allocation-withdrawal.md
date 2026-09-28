---
name: sand-eval-quality-allocation-withdrawal
type: reference
created: 2026-09-28
updated: 2026-09-28
tags: [sand-eval, quality-center, allocation]
links: [sand-eval-quality-center-test-data]
---

# 质检分配撤销与退回的核验入口

**Why:** 用户要求“撤销给某质检员的分配”时，不能将“退回质检员”视作同一操作。后者保持冻结的责任人；停止检查任务也不必然解除管理侧的批次占用。

**How to apply:** 先从生产管理页定位具体质量任务、allocation、关卡、人员及全部批次进度。沿 `quality/application/resolution/manual_return_service.py::return_to_reviewer` 核实退回接收人；沿 `quality/application/management/batch_allocation_service.py`、`quality/infrastructure/persistence/batch_allocation_repository.py::for_scopes` 核实占用判据；再检查当前 API、operator CLI 和runbook是否已经支持真正撤销。页面0进度不是无备注、无修订或无在途写入的数据库证明，不能直接删记录。

2026-09-28 核查证据及当时的未完成边界：`/Users/leslie/Documents/Playground/output/zeng-qc-unassign-20260928/report.md`。人员、批次数量、进度与是否已有撤销功能均以执行时的实时数据和最新源码为准，不将该快照当作未来事实。
