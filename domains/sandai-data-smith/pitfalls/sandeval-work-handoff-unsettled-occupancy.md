---
name: sandeval-work-handoff-unsettled-occupancy
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sand-eval, handoff, assignment, hologres, locks, recovery]
links: [sandeval-sql-lock-diagnosis, sandeval-reassignment-scope-and-batch-responsibility]
---

# 质检转交失败后的任务占用与通用冲突提示

**Why:** 转交质检会同时更新当前质检员、分配事实与成功回执，必须保持一致。2026-10-16 的只读排查发现，一次转交写成功回执时遭遇数据库锁超时；来源任务的分配操作进入待核对状态，随后其他批次的转交也被同一任务占用拦住。界面把忙碌和待核对都提示为“任务正在分配或归属已变化，请刷新后重试”，无法从文字判断是否真的有人改变了归属。

**How to apply:** 以准确部署 SHA 阅读报错翻译与占用作用域，关联原 task_id、operation_id、请求号、HTTP request_id 和数据库 query_id。分别核对当前 assignee、版本、handoff_history、成功回执、Redis active 指针及执行租约。候选读取成功不代表转交可执行，499 不代表后端已经结束，租约不存在也不单独证明在途 SQL 停止。恢复须通过正式原事务结案流程，在证明完整提交或回滚及旧执行器/SQL 停止后登记结果；不直接删除占用键。

## 证据与代码指针

- [2026-10-16 只读排查报告](/Users/leslie/Documents/Playground/output/quality-handoff-20261016/report.md)：精确对象、当时状态、请求时间线、原转交失败 SQL、部署证据及未执行恢复的边界。会变化的状态以该报告和后续实时读取为准。
- 以报告记录的部署 SHA 读取 `app/services/facts/work_handoff.py`、`app/repositories/task_assignments.py`、`app/infra/assignment_operations.py`：确认 busy / needs_review 的错误翻译、按来源任务的占用及冻结后异常退出行为。
- `quality/application/management/work_handoff_service.py`、`quality/infrastructure/client/work_handoff_client.py`、`quality/infrastructure/persistence/unit_of_work.py`：确认显式事务、成功回执及候选读取边界。
- `sand-eval/docs/operations/assignment-recovery.md` 的“原事务操作结案”：核对生产对应版本的正式操作条件。只读排查不自动授权结案或重新转交。
- [SQL 与锁诊断入口](../refs/sandeval-sql-lock-diagnosis.md)：数据库异常原文与 owner / waiter 证据要求。相近时间的其他接口异常栈不能直接归给原请求；本案未完整还原锁竞争链，未认定死锁或最初持锁业务。

## 关键经验

将“客户端连接断开”“后端请求结束”“数据库事务结果已核实”“操作占用已结案”分别取证。同一请求的 Nginx 与应用结束时间可能相差数分钟；先定位失败 SQL，再解释持续冲突，不能把刷新建议当作恢复方案。

## 2026-10-16 经授权的原事务结案

用户在诊断后明确授权手动恢复线上数据。正式 operator CLI 按原计划哈希将该操作按 rolled_back 结案；写入前冻结、跨 Pod 复核、原会话/请求结束证据、执行回执与写入后独立核验见 [恢复报告](/Users/leslie/Documents/Playground/output/quality-handoff-20261016/recovery/recovery-report.md)。结案 succeeded 仅表示人工核对完成，实际事务结果仍以 result.resolution 区分；不代表原转交成功。此次没有重放转交或修改当前质检人，具体时点状态只从报告和后续线上读取判断。
