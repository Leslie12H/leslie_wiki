---
name: hologres-replica-sync-lag-20261013
type: reference
created: 2026-10-13
updated: 2026-10-13
tags: [sandai-data-smith, hologres, replica, latency, cloud-monitor]
links: [sandeval-init-warehouse-latency-20261010]
---

# Hologres 2026-10-13 副本同步延迟取证入口

**Why:** 实例级同步延迟取最大值，仅检查 Leader 或业务自己的计算组会遗漏小 Follower 的瓶颈。已有业务 API 卡顿诊断不能直接复用为新的副本同步根因。

**How to apply:** 先调用云监控指标元数据 API 核实 replica lag 的统计口径和维度，再查全部计算组的规格、CPU、内存分类、Worker 水位和 Table Group Leader/Follower 关系。将批量 UPDATE/写入的应用名、digest、调用数与绝对时间对齐。高频 `ADD COLUMN IF NOT EXISTS` 调用不等于真实新增列或真实元数据变更；FE replay 和 Shard 同步分别验证。Query Log 的 calls/CPU 为聚合统计，不能把 CPU 秒当墙钟时间，不能把读取量当更新量。

## 证据指针

- [2026-10-13 只读诊断报告](/Users/leslie/Documents/Playground/holo-sync-lag-20261013/report.md)：历史曲线、完整计算组对照、`samples` 更新触发候选、DDL 的因果边界及受限证据。同目录保留脱敏云 API 原始指标、只读 SQL 脚本和资源聚合；当前负载和规格以后应重新查询，不复用报告数值。
- 本次证据强支持小 Follower 资源耗尽与持续批量更新共同形成同步瓶颈；具体最大延迟 Shard、引擎后台进程根因、唯一触发任务和受控恢复尚未证明。`hg_worker_info` 在本次账号下要求 Superuser，不以缺失权限代替已定位到具体副本的结论。
- [2026-10-10 API 延迟取证](sandeval-init-warehouse-latency-20261010.md)：复用只读、脱敏和跨核 CPU 统计的方法，不复用其历史任务结论。
- 官方机制入口：[Hologres 监控指标](https://help.aliyun.com/zh/hologres/user-guide/hologres-metrics)、[计算组管理](https://help.aliyun.com/zh/hologres/user-guide/manage-virtual-warehouses)。
