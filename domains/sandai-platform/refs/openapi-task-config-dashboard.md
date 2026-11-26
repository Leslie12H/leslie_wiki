---
name: sandai-openapi-task-config-dashboard
type: reference
created: 2026-11-27
updated: 2026-11-27
tags: [sandai-platform, openapi, grafana, prometheus, sls]
links: [sandai-inference-concurrency-dashboard-entrypoints, openapi-organization-task-volume]
---

# 开放平台在途任务配置看板

**Why:** 值班需要查看国内和美国生产的 OpenAPI 在途任务阶段和请求配置。2026-11-27 用户确认不改 Zeus 或 Athena 代码，只调整 Grafana，使用现有 SLS 日志，且不查生产业务库。缺少配置证据的字段显示「未知」。

**How to apply:** 从 [任务配置](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-task-config) 或 [06 并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 顶部的「查看任务配置」进入。06 可传入入口地区和组织。上方阶段面板覆盖对应地区的所有组织，组织筛选作用于 SLS 明细。查看实际口径先回读已保存查询，再沿 Zeus 的 `TaskLifecycleStage.initialInFlightSql` 和 `TaskSnapshotReader` 核对公开终态与复审边界。

- 在途总数与阶段计数来自现有 Prometheus。按地区的生产环境和快照主实例过滤 `openapi_tasks_inflight_count` 与 `openapi_tasks_inflight`，用 `openapi_snapshot_last_success_timestamp_seconds{group="tasks"}` 校验新鲜度。SLS 明细按最近一小时内已受理且截止时未观察到终态的任务 ID 去重。日志采集延迟、受理缺失和窗口之外任务会使候选数量与 Prometheus 快照不同。取同一截止时点对账，不能用条数相减得到精确任务缺失集合。
- 国内索引可用任务字段与事件词交集。美西用 `("taskId" OR "outcome" OR "task_submitted" OR "task_finished")` 取候选，再按 `content` 里的精确事件格式筛选。先对照同截止点的短窗口全选基线，比较受理、派发、终态计数。2026-11-27 验证时不加关键词的美西宽窗口扫描触及 500,000 条上限，返回部分日志。不要用这类扫描重建在途。 [阿里云 SLS 扫描分析限制](https://www.alibabacloud.com/help/en/sls/scan-based-analysis-syntax)
- 由 Zeus 已记录的派发回执关联唯一的 Athena Job ID。无派发或映射冲突时保留任务，配置逐字段标未知。PE 使用共享上海 `inference-prod` 中明确的参考 PE 完成或通过事件来确认开启。事件缺失不能推出关闭。时长使用 Athena 单段切片的下发配置，避免把耗时或成片时长带进来。比例、分辨率来自共享上海 `athena` 的结构化 Worker 推理配置。字段冲突时标未知，Worker 值不回写或替代原请求口径。 [PE 日志查证入口](inference-concurrency-dashboard-entrypoints.md#单任务-athena-前处理长尾与提示词增强)
- 看板内的隐藏 SLS 查询变量按同一截止点和组织关联 Job，只传标识和白名单字段。用分组打包同配置的 Job ID，避免大量重叠字段撑爆变量。回读面板说明和首行字段覆盖，复查超出明细条数或关联上限及取数失败提示。双区候选列表、四类字段有值和未知样本用实际 Grafana 查询和页面交叉核验。
