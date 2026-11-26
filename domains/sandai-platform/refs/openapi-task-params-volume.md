---
name: sandai-openapi-task-params-volume
type: reference
created: 2026-11-27
updated: 2026-11-27
tags: [sandai-platform, openapi, grafana, athena]
links: [sandai-openapi-task-config-dashboard, openapi-organization-task-volume]
---

# 开放平台任务参数看板的任务量取数

**Why:** 参数分布面板的分母适合复算同口径的任务量。Athena Job 的创建时间与 Zeus API 受理、公开终态及实时在途的统计事件各不相同。2026-11-27 核查时，海外面板在最近 72 小时之前已有记录，完整历史起点需要按当前数据源查证。

**How to apply:** 在 [开放平台 · 任务参数统计](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-task-params-stats/a168183?orgId=1&timezone=Asia%2FShanghai&var-entry_region=us&viewPanel=7) 回读「目标分辨率」面板的 SQL。复用其 Athena 数据源、创建时间、平台和视频类型过滤，按 Job 计数，并保留参数缺失的任务。需要 Zeus 受理与公开完成口径时，从 [组织任务量查证](openapi-organization-task-volume.md) 进入。

固定一个完整的五分钟截止边界。查询用开始含、结束不含，按创建时间分桶，展示用北京时间。各桶以所在窗口的任务总数为分母。用同一固定窗口的分辨率任务数合计核对分桶，再用同口径的最早创建时间和全历史计数核对首桶及历史总量。全历史按创建时间升序单点查询超时时，可合并最早时间和总数做一次同条件聚合，历史分桶用互不重叠的有限窗口回补。
