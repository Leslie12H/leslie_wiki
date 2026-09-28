---
name: sandeval-bulk-allocation-latency
type: reference
created: 2026-09-23
updated: 2026-09-23
tags: [sandeval, quality, allocation, performance]
links: [sandeval-e2e-acceptance, sandeval-handoff-duplicate-scope]
---

# 质检批量分配延迟

**Why:** 质检批量分配的「分配前核查」不是只读元数据，而会展开所选包的完整题目、答案卡、范围版本、正式批次与交接状态；正式分配又按包内批次串行准备并多次写进度。Sand 质检还有额外放大：每准备一个 Sand 子批次，都会重新校验一次整个供应商包，包越大越接近二次复杂度。浏览器约 60 秒断开只终止客户端等待，后端可能继续运行并留下部分完成状态。

**How to apply:** 先用 allocation id、task id 与 trace id 串起 access、事务分段及持久化进度；分别测准备核查、单包准备、单批 submission 和 assignment，不把 499 或页面超时当成后端停止。修复时保留范围、版本、权限、完整性与凭证门禁：整包校验及不可变读取应在一次 allocation command 内复用；子批读取可有界并发，持久化写入保持可恢复；重复请求还要核查 request id 与内容指纹是否稳定。

- 代码入口：`quality/application/management/bulk_allocation_service.py`、`quality/application/management/batch_allocation_service.py`、`quality/application/management/aggregation_service.py::prepare_sand_batch`、`AggregationService.require_for_stage`、`app/services/facts/task_assignments.py::_submission_scopes`。代码会变，使用前在当前主线复核。
- 2026-09-23 生产只读测量：单包准备核查中，供应商质检约 2.880 秒，Sand 质检约 8.799 秒；即使包已被分配而最终返回不可选，仍完成整包来源展开。数值会随数据和负载变化。
- 同日供应商质检案例：3 批 allocation 的后端 trace 为 132.751 秒并最终 `HologresBusy`；浏览器约 60 秒返回 499，持久化仅 1/3 完成，重试状态中还出现 `IDEMPOTENCY_CONFLICT`。这证明一分钟只是客户端边界，连接池繁忙是观测到的故障；没有数据库锁证据时不要进一步声称由某类锁导致。
- 同日 Sand 质检案例：34 批 allocation 仅 3 批完成；单个 `allocation_submission` 为 151.022 秒，同一 resume trace 超过 636 秒仍在执行，失败批次出现 `SOURCE_PROOF_EXPIRED`。当时自动 allocation recovery 配置为关闭，因此不能归因于多副本自动恢复风暴。
- 既有提交已减少准备阶段的重复整包枚举和候选人重复读取，但当前准备仍会对每个所选包完整展开一次，尚不是轻量元数据核查。
