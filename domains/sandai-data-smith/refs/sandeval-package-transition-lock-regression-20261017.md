---
name: sandeval-package-transition-lock-regression-20261017
type: reference
created: 2026-10-17
updated: 2026-10-17
tags: [sand-eval, hologres, latency, transaction, regression]
links: [sandeval-api-observability, sandeval-init-warehouse-latency-20261010]
---

# Sand Eval 整包退回事务与提交锁等待取证

**Why:** 2026-10-17 用户报告整个平台卡顿、任务提交失败，并要求先定位卡顿时间再讨论归因。合入、部署、SQL 开始等待、客户端断开和应用最终报错是不同时间，不能凭最近一次合入直接归因，也不能把全部慢请求解释为历史上的共享计算组负载。

**How to apply:** 先按北京时间绝对窗口定位集中变慢，再按 deploy SHA 切版本；用 request_id 直接关联客户端断开和应用完成事件。约五分钟的写入失败要核对 Hologres `Cannot acquire lock in time`、BE 锁阶段和持锁事务。对齐运行 SQL 模板与引入提交，同时检查普通写入新增的跨表条件和显式事务边界。不能仅凭 `lock_trx` 或失败时的持锁快照宣布完整死锁环，也不能凭一次无锁快照宣布恢复。

## 权威证据指针

- [2026-10-17 只读诊断报告](/Users/leslie/Documents/Playground/sandeval-incident-20261017/report.md)：部署时间线、首次锁等待与近期集中慢窗口、真实提交 request_id、SQL digest/QueryID、事务持锁链、前后日期对照、计算组负载和未覆盖事项；同目录保存脱敏证据与只读脚本。
- [PR #2566](https://github.com/world-sim-dev/sandai-data-smith/pull/2566) 与 [b4177be35](https://github.com/world-sim-dev/sandai-data-smith/commit/b4177be35c670406cd738cdcf28d993cb6bd9b92)：普通 CAS 更新加入共享扩展表条件，Sand 退回进入显式实验事务；生产失败模板和共享表阻塞的归因入口。此处记录定位指针，不表示已经修复或回滚。
- [阿里云锁诊断](https://www.alibabacloud.com/help/en/hologres/user-guide/locks-and-lock-troubleshooting)：BE 锁错误和默认五分钟超时；实验事务实际行为须结合目标版本源码及现场记录，不能照搬普通 PostgreSQL 行锁假设。
- [API 观测入口](sandeval-api-observability.md) 与 [历史计算组延迟取证](sandeval-init-warehouse-latency-20261010.md)：分别复核当前日志映射和跨业务资源聚合边界，旧事故结论不能当成本次触发源。

## 复用边界

共享物理表的事务或跨表 CAS 可影响不同任务，不能以业务包 ID 不同断定已经隔离。修复要保留冻结版本、整包退回防护和并发正确性，并用同任务/不同任务的保存、提交、代改和退回并发验收。生产回滚、部署或取消持锁查询属于独立操作，不由诊断自动授权。

## 2026-10-17 修复设计补证

- [SQL transactions](https://help.aliyun.com/en/hologres/developer-reference/sql-transaction-capabilities) 直接说明实验混合 DML 事务内所有读写都拿表级写锁，仅适合低 QPS；讨论本次模式时优先引用此页，不把通用锁文档中默认事务模式的描述当成实验模式行为。
- 报告新增“修复建议”节：移除在线退回长事务，普通写入恢复单行 CAS，以持久包级执行准入与已开始写入收敛保留一致性；单批退回复用原 pending/不可变意图。该方案尚未实现，执行记录的承载位置和容量仍需实现前核对。
- 仅拆成先查 fence 后更新，或仅增加 Redis 租约，都不能替代数据库执行令牌和版本守卫。延迟自动任务、分配和转交须覆盖同一准入协议；真实 Hologres 并发证据不能由 SQLite 或模拟锁测试替代。
