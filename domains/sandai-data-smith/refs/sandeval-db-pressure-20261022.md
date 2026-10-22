---
name: sandeval-db-pressure-20261022
type: reference
created: 2026-10-22
updated: 2026-10-22
tags: [sand-eval, hologres, performance, evidence]
links: [sandeval-init-warehouse-latency-20261010]
---

# Sand Eval 2026-10-22 数据库压力取证指针

**Why:** 纸面质检恢复后的生产复核遇到资源组内存错误及 SQL 超时。不能因业务功能修复已部署就把超时全部归为外部业务，也不能用历史 Caption FPS 事故解释本次来源。

**How to apply:** 先对齐报错 query ID、查询日志时间窗和实际计算组，再检查调用方、扫描量与启动等待。资源组瞬时内存上限、查询日志 memory_bytes 和整实例内存不是同一口径；累计 CPU 与墙钟耗时不可相加。小结果集、lookup 表及参数过滤不保证实际扫描成本低。

## 本次证据入口

- 完整本地报告与脱敏资源证据：`/Users/leslie/.codex/visualizations/2026/10/22/01a16320-cb2a-7231-b0af-61d168d28c51/db-pressure/report.md`，同目录 `probe.json`、`trace.json`、`trace2.json`、`trace3.json`、`trace4.json`。
- 原复核错误：`/Users/leslie/Documents/Playground/output/paper-quality-20261022/postdeploy-live.json`、`postdeploy-09-final.json`；只在获授权环境读取，不上传业务记录。
- 功能修复 PR：[world-sim-dev/sandai-data-smith#2762](https://github.com/world-sim-dev/sandai-data-smith/pull/2762)。此次数据库调查未修改代码、终止查询或调整资源。

## 结论边界

2026-10-22 样本确认 Eval 自身摘要扫描、质检列表和单成员修订查询存在大扫描；部署前已有负载，本次新增校验和复核也增加调用。大幅启动等待同时拖慢了轻查询。但最大内存查询仍未匹配日志，当前只读身份不具备 `pg_read_all_stats`，不能指定它属于摘要 Worker 或其他业务，也不能宣称所有超时根因已经闭环。后续状态与数字以原始证据及重新取证为准。

## 代码与下一步

- `sand-eval/platform/backend/quality/infrastructure/persistence/review_amendment_repository.py` 的 `for_member` 及 `quality/application/management/parallel_amendment_partition.py`：验证成员读取的真实扫描计划、批量读取与请求内复用；保留正式承接、身份、版本校验。
- `sand-eval/platform/backend/quality/infrastructure/summary_database.py` 与 `sand-eval/docs/operations/holo-compute-group-isolation.md`：核实后台 source 与控制读的计算路由。不能把强一致性校验整体改为 Follower 展示读取。
- 先补齐最大内存 query ID 的全量统计来源，再做受控优化；历史其他业务的压力不能直接归因到当前窗口。


## 2026-10-22 后续最小性能修复

- 实现与 review：[PR #2767](https://github.com/world-sim-dev/sandai-data-smith/pull/2767)。发布与运行态以 PR、CI、健康检查回读为准，不从合并状态推断已经上线。
- 有限生产只读前后对比、结果一致性、查询日志口径及回归结果：上述证据目录的 `perf-fix/report.md`；纯内存同一分区夹具的调用次数见 `perf-fix/partition-counts.json`。
- **Why:** 窄 lookup 与宽 extension 放进同一 JOIN 不保证实际裁剪；代码上的单成员过滤可能仍读取全量 extension。新增正确性检查扩大了这种查询的触达范围，必须同时约束单次 SQL 成本和重复调用。
- **How to apply:** 先读取窄 lookup IDs，无匹配即返回；第二步用显式 extension/report IDs 限定原 JOIN，并保留任务/成员关联、当前报告状态与版本、排序和封存判据。单次只读分区内按冻结成员与当前答案引用复用证明，下一次计算重新读取。不要恢复会漏掉“scope 仍有效但成员已被其他批次正式承接”的过宽提前返回。
- 回归应证明空成员不读取宽表、成员与任务隔离、当前报告资格、证明调用上界、下一尝试重新校验，以及仍需真实负责人验收。微样本耗时改善不代表整站 p95 或共享计算组容量已经达标。
