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

## 请求视频时长占比

任务创建时间用于选择滚动窗口。档位按 [请求视频时长分布](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-task-params-stats/a168183?orgId=1&timezone=Asia%2FShanghai&var-entry_region=us&viewPanel=4) 的时长字段计算。先回读面板 SQL 核对有效 duration、历史分段时长回退和无效值口径，再在同一截止点对照各原始秒数的任务量。

档位边界需要明确。采用含上限的五秒档时，恰好 5 秒归 0–5 秒，恰好 30 秒归 25–30 秒。按窗口内全部任务计算占比时，超过 30 秒和时长未记录分别保留，合计对齐独立任务计数。
