---
name: sandai-openapi-task-config-dashboard
type: reference
created: 2026-11-27
updated: 2026-11-27
tags: [sandai-platform, openapi, grafana, prometheus, sls]
links: [sandai-inference-concurrency-dashboard-entrypoints, openapi-organization-task-volume]
---

# 开放平台在途任务配置看板

**Why:** 值班需要查看国内和美国生产的 OpenAPI 在途任务阶段和请求配置。2026-11-27 用户确认只调整 Grafana，且取数须避免向生产业务库增加查询。

**How to apply:** 从 [任务配置](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-task-config) 或 [06 并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 顶部的「查看任务配置」进入。06 可传入入口地区。阶段面板覆盖对应地区的所有组织。查看实际口径先回读已保存查询，再沿 Zeus `TaskLifecycleStage.initialInFlightSql` 和 `TaskSnapshotReader` 核对公开终态与复审边界。

- 在途总数与阶段计数来自现有 Prometheus。按地区的生产环境和快照主实例过滤 `openapi_tasks_inflight_count`、`openapi_tasks_inflight`，用 `openapi_snapshot_last_success_timestamp_seconds{group="tasks"}` 校验新鲜度。在同一查询时点复核阶段合计等于总数，并分别验证双区、国内、美国筛选。
- 逐任务配置在页面显式显示暂不可用。现有 Prometheus 聚合不提供任务 ID 和配置字段。生产接单 SLS 抽样缺少 PE 开关、请求时长、比例、分辨率。下游 Athena 只覆盖已派发任务，无法补齐仍在 Zeus 排队的全量任务。核对候选数据源时区分配置开关和实际 PE 执行。后者沿 [06 的 Athena PE 查证入口](inference-concurrency-dashboard-entrypoints.md#单任务-athena-前处理长尾与提示词增强)。
