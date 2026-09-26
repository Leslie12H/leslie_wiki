---
name: sandeval-allocation-shutdown-recovery
type: reference
created: 2026-09-26
updated: 2026-09-26
tags: [sand-eval, quality, allocation, recovery, shutdown]
links: [sandeval-partial-assignment-recovery, sandeval-sql-lock-diagnosis]
---

# 质检分配在实例关闭后停留“准备中”的排查入口

**Why:** 分配进度按批次落库，页面剩余“准备中”可能是承载长执行的旧实例已关闭。检查计划恢复和整份分配恢复属于不同机制：任务可以已激活，但分配记录仍保留 `REVIEW_PLAN_BUSY`，不能因此新建一套任务或直接改成功标记。

**How to apply:** 固定 allocation、质量任务和时区，先把 `quality_allocation_resume` 外层结束事件与同一 Pod 的 shutdown 日志对齐，再核对 ReplicaSet 时间线、实际运行版本、当前 allocation recovery 配置。只有 `InterfaceError` 不能归因为数据库服务故障或 OOM。回读原分配的 group、submission、assignee 与实际检查任务；得到恢复授权后先备份/dry-run，再调用原应用服务受控续跑，等待每轮结束，复用原 request 身份。完成以全部批次、真实样本和页面回读为准。

- 代码入口：`sand-eval/platform/backend/quality/application/management/batch_allocation_service.py` 的 `resume` 与 `_record_batch`；`quality/application/inspection/review_plan_service.py` 的幂等计划完成；`quality/infrastructure/persistence/review_task_repository.py` 的 `activate` CAS。
- 运行配置与机制入口：`sand-eval/docs/subsystems/quality-center.md`。配置和发布状态每次重新核验，不沿用上次结论。
- 2026-09-26 案例证据：`QT-144a5dc30a795c58946721ff8547b60a` / `QA-498ac3f12c81501d9b79537194d74dc4`；本机审计目录 `/Users/leslie/Documents/Playground/output/quality-allocation-20260926/` 的 `report.md`、`logs-shutdown.json`、`replicasets.json`、`resume-apply-*.json` 和最终验证产物。这里只保存入口，恢复结果以审计文件为准。
- 送审结构注意：`sand_batch` 是引用式汇总，父 submission 只有一个成员可以正常；对象型 submission 的快照计数检查不能原样套用。
