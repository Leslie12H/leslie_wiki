---
name: sandeval-partial-assignment-recovery
type: reference
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, assignment, recovery, redis]
links: []
---

# Sand Eval 派题部分完成核验与原计划恢复

**Why:** 分配计划、身份保护、真实答题卡、wave 和成功回执分别持久化。看到管理端有题数或部分同学开始作答，不能推断整批派题成功；Redis 状态校验失败也可能发生在 SQL 已经成功之后。

**How to apply:** 先核对任务和账号空间，再按原操作核对冻结计划、实际 assignment、身份保护、wave 成员与结果回执。只在原执行器和在途 SQL 已停止、已有卡无冲突时，用部署对应版本的正式 CLI 恢复同一计划。保留原卡及答案，不重新选人、生成身份或清空占用键。执行期间若实例被滚动替换，应重新核对，不能将 CLI 退出或卡总数齐全当作完成。

- 正式 runbook：仓库 `sand-eval/docs/operations/assignment-recovery.md`；写入契约 `sand-eval/docs/subsystems/assignment-distribution-writes.md`。
- 实现指针：`platform/backend/app/cli/assignment_recovery.py`、`app/repositories/assignment_persistence.py`、`app/infra/assignment_operations.py`。
- 权限指针：`app/services/facts/space_scope.py::require_task`。跨空间“任务不存在”与分配中断应分别证明。
- 2026-09-25 可梦案例证据、授权、执行状态、备份与独立验收：`/Users/leslie/Documents/Playground/kemeng-assignment-recovery-20260925/report.md`；动态数量和结论以此报告及相邻产物为准。
- 日志判定应区分 step 失败与 SQL 失败。AssignmentOperationUnavailable 说明操作状态不可用；仅凭异常类型不足以区分 Redis 网络超时、连接错误和状态记录异常。
