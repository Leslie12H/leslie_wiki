---
name: sand-eval-quality-allocation-progress-cas
type: pitfall
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, quality-center, allocation, concurrency]
links: [sand-eval-quality-center-test-data, sandeval-sql-lock-diagnosis]
---

# 质检分配的进度写回冲突会留下“准备中”

**Why:** 2026-09-25 排查生产质量任务 `QT-1ea3f3c1faa05b35937db02a4ba69411` 的分配 `QA-e02b9dc587ec534d974225863cb06d37`：37 个已选批次仅 1 个生成 100 条质检样本，36 个仍为 0/0“准备中”。12:31:29 的同一 `quality_allocation_resume` trace 显示两个并行批次的 `allocation_progress` 几乎同时结束：batch 1 成功，batch 0 抛出 `QualityError`，外层 step 随之报错。当时部署版本 `e1913c8158241ed4ea7b623f52288f7791b8f278` 允许供应商质检两批并行，但进度都写入同一条分配记录；Hologres 自动提交下 `configs.get(lock=True)` 不提供跨调用的行锁，`BatchAllocationRepository.put` 的版本 CAS 是最终保护。并行读到相同版本时后写者可能拿到 `VERSION_CONFLICT`；`TaskGroup` 将这一错误扩大为整次续跑停止。日志只记了 `QualityError` 类型，未记错误码；上述版本冲突是由时序与部署代码支持的高置信归因，不是日志直接给出的错误码。

**How to apply:** 查单个分配时先固定 allocation ID、质量任务 ID、北京时间和部署 SHA。在当前 SLS `sandeval-prod` 中按 allocation ID 查 `quality_allocation_resume` 的 `allocation_progress` 与外层 `step`，同时核对真实 `group_id`、检查任务和 `sample_count`；计划行和已选质检员不能证明任务已生成。若一批成功、一批进度写回冲突，先核对已生成组的幂等引用，再对原分配走受控续跑；续跑后分别复验管理页及质检员本人待办。检查 `batch_allocation_service.py::_record_batch` 的冲突处理、`batch_allocation_repository.py::put` 的 CAS，以及 `quality_allocation_recovery_enabled` 的运行配置。2026-09-25 本次只读排查未执行生产续跑或发布；本地未提交改动及后续部署状态须分别核验。

日志入口见 [Sand Eval SQL 与锁诊断入口](../../sandai-data-smith/refs/sandeval-sql-lock-diagnosis.md)。业务代码入口：`sand-eval/platform/backend/quality/application/management/batch_allocation_service.py`、`quality/infrastructure/persistence/batch_allocation_repository.py`、`quality/infrastructure/runtime.py`；现行行为以部署 SHA 为准。
