---
name: sandeval-assignment-performance-evidence
type: reference
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, assignment, performance, hologres, asyncio]
links: [sandeval-sql-lock-diagnosis, sandeval-api-observability]
---

# Sand Eval 派题性能证据入口

**Why:** 大批派题同时包含同步规划、数据库分块和操作占用权检查。仅看数据库累计时间或旧版写入函数，容易误判实际执行顺序、事务边界和分块优化收益。

**How to apply:** 先固定 request_id、部署 SHA、Pod 与进程，再用完整 loop_stall 栈、ARMS ServiceIp 和网关/应用差值判断同 worker 影响。将实际持久化路径的五类分块、Redis 检查、两次快照读取分别归因；嵌套阶段不相加，客户端耗时不称为数据库纯执行时间。

## 代码与证据指针

- 仓库：`/Users/leslie/Downloads/sandai-data-smith`。
- 纯规划：`sand-eval/platform/backend/app/services/facts/assignment_planning.py` 的 `plan_split`、`_bounded_bipartite_matching`、`_Dinic`。转线程需核验输入所有权；纯 Python 受 GIL 影响，改善响应性不等于加速计算。
- 实际写入：`app/repositories/assignment_persistence.py` 的 `persist_assignment_plan`；与 `app/repositories/ev3_write.py` 的显式连接路径区分，不能只改一个同名批量常量就认定所有入口生效。
- 占用权检查：`app/infra/assignment_operations.py` 的 `AssignmentOperationSession.assert_owned`；分块数也影响 Redis 往返，不能删除保护来省时。
- 复核：`app/repositories/task_assignments.py` 的 `_load_snapshot`、`_v3_snapshot`、`_insert_new_pairs`。确认当前 Leader/autocommit 和操作占用权边界，不把第二次快照复核称为多语句事务回滚保证。
- 2026-09-25 固定生产请求、逐块 CSV、线程只读输入探针、测试 Hologres 500/2,000 分块与 Python 内存实验：`/Users/leslie/Documents/Playground/output/assignment-evidence-20260925/report.md`。该目录保留部署版本源码及可复现脚本；历史测量不是当前生产基线。
- 实验使用独立测试实例、自有 schema 和合成数据；先验证实例身份及表属性，完成后显式清理并回查。Hologres 写入不能用 ROLLBACK 冒充清理。DB `memory_bytes` 缺值时保持未知，不用 Python 分配峰值替代服务端内存。

## 判断边界

固定行数的生产日志不能单独证明网络固定成本。批量实验应固定总行数、交替运行、分开性能与内存采样，并说明本机公网 RTT 与生产链路的差别。同 Pod 不等于同 worker；无 socket/调度时间戳时，网关与应用差值只能提供排队关联证据。保留快照新鲜度、冲突检测、冻结计划、回执和完整回读，再讨论版本摘要。
