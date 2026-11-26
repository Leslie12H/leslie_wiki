---
name: sandai-openapi-task-config-dashboard
type: reference
created: 2026-11-27
updated: 2026-11-27
tags: [sandai-platform, openapi, grafana, sls]
links: [sandai-inference-concurrency-dashboard-entrypoints, openapi-organization-task-volume]
---

# 开放平台在途任务配置看板

**Why:** 值班需要知道中美生产当前在途任务的 PE 配置、请求视频时长、画面比例、请求分辨率和 Zeus 阶段。组织任务量提供组织汇总，06 提供并发和运行阶段的聚合信号，两处需要能下钻到同一批任务的配置。看板刷新须避免查询生产业务库。

**How to apply:** 从 [任务配置](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-task-config) 或 [06 并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 顶部的「查看任务配置」进入。检查 06 链接传入的地区和组织。口径沿 Zeus `TaskLifecycleStage.initialInFlightSql` 和 `TaskSnapshotReader` 核对，覆盖 `API_PLATFORM` 与 `HUMAN_API_PLATFORM` 的首次非终态，且排除终态后的复审。

- 取数入口是国内、美西 Zeus SLS 的 `openapi_task_config_snapshot` 事件。先检查 Grafana 已保存查询与数据源权限，再按版本回查 Zeus 现有快照采集。复用同一次分页扫描读取少量配置列，由快照主实例在读事务结束后投递日志。Grafana 只读 SLS 和已有 Prometheus 聚合。PE 字段表示已持久化的开关，实际执行结果沿 [06 的 Athena PE 查证入口](inference-concurrency-dashboard-entrypoints.md#单任务-athena-前处理长尾与提示词增强)。
- 检查同一地区同一采集时间的快照完成标记、明细条数和去重任务数，再对账 Prometheus 的 `openapi_tasks_inflight_count` 与 `openapi_snapshot_last_success_timestamp_seconds{group="tasks"}`。缺完成标记、分批缺失、重复任务和过期的结果都需显式提示。只有完整快照可以显示零任务或计算配置占比。抽查任务的请求分辨率来自保存的 `extra_infer_args.resolution`。旧任务配置字段缺失时显示未知。
- 2026-11-27 线上已回读看板和 06 链接，并用双区 SLS 合成样本验证完整、不完整、过期、重复、空批次、筛选及分页。双区真实快照随 Zeus 采集上线后再验收。开启前核对既有 SQL 新旧投影的耗时与扫描路径，以及 SLS 批次大小和采集延迟。配置开关查 `zeus.observability.task-config-snapshot.enabled`。
