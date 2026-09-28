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

2026-09-28 用户明确授权后完成生产撤销的证据、审计归档与验收记录：`/Users/leslie/Documents/Playground/output/zeng-qc-unassign-20260928/report.md`。人员、批次数量、进度与是否已有撤销功能均以执行时的实时数据和最新源码为准，不将该快照当作未来事实。

生产直接操作须先获得明确范围授权。复用方案前同时核对 `review_task_repository.py::existing_submission_refs` 对任意状态任务的占用判断、`inspection/sand_review_write.py` 的 pending-write CAS，以及 `app/repositories/quality_inspector_summaries.py` 的实时来源约束。备份后冻结并验证未写入的记录，先处理检查任务再释放分配占用，保留原分配主键防止旧请求复活；最后以实际质检员身份和管理页面验收。Hologres多条写入不能假定整体回滚，失败后按审计与事实续做，不盲目重放。历史摘要可能无DELETE权限，应保留审计且不扩大权限；复核其是否被实时来源条件排除。
