---
name: sandeval-init-warehouse-latency-20261010
type: reference
created: 2026-10-10
updated: 2026-10-10
tags: [sand-eval, hologres, latency, sls, arms]
links: [sandeval-sql-lock-diagnosis, sandeval-api-observability]
---

# Sand Eval 2026-10-10 计算组延迟取证入口

**Why:** 2026-10-10 整体 API p95 上升而 p90 保持较低。聚合曲线只能定位尾延迟，不能证明每个接口都慢，也不能直接将历史跨业务资源争用事故归因为本次触发源。

**How to apply:** 固定 Asia/Shanghai 绝对窗口，按 route、Pod 和 deploy SHA 拆分，再将 SLS 请求与 ARMS 数据库 span、同模板同时间的 Hologres QueryID 对齐。对齐方式必须注明是直接 query_id 关联还是模板/时间强匹配。比较同 digest 的扫描规模、CPU、启动阶段及墙钟耗时，区分工作量增加与服务端等待；`lock_trx` 只能证明该阶段等待，尚须 owner/waiter 才能指向持锁方。客户端 pool wait、服务端 query queue 和事务锁等待分别核验。

## 证据指针

- [2026-10-10 16:00–17:02 只读取证报告](/Users/leslie/Documents/Playground/sandeval-latency-20261010/report.md)：已验证的部署、接口分位数、请求/trace/QueryID、计算组 CPU、扫描量与证据缺口；同目录保留脱敏查询、日志和只读脚本。
- 本次已定位慢 SQL 在 `init_warehouse`，普通 `sand_eval` 读取相对稳定。用户追加授权后，定位到 Caption FPS 动作召回查询是后半段最大的新增压力源，叠加既有 videoonly 查询；负载名称、时间、并发、CPU 和读取规模见报告，不作为当前状态复用。尚未做停/启对照，不称所有尖峰的唯一原因。
- 2026-10-10 用户已明确授权跨业务只读取证；实际收窄为资源聚合、连接元数据、表名、布尔查询形状及固定计划节点名称。节点提取只能使用固定名称白名单，不能使用 Bitmap 后匹配整行的正则，避免带出过滤条件参数。
- [SQL 与锁诊断](sandeval-sql-lock-diagnosis.md)、[API 观测入口](sandeval-api-observability.md)：生产资源与查询方法须在新事故中重新核实。

- **How to apply（补充）：** point-readonly 名称、clip_id IN、LIMIT 或 Index Scan 都不能证明低开销；继续核对每次实际读取规模与 CPU。按 query_start/query_end 计算执行并发，不以 session 数代替；相同客户端出口也不能直接识别操作者。
