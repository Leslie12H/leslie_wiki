---
name: quicktracking-frontend-metrics
type: reference
created: 2026-09-12
updated: 2026-09-12
tags: [vidmuse, frontend, quicktracking, rum, metrics, observability]
links: [vidmuse-ai-frontend, sisyphus, 2026-09-okr-zhaoye-scope, monitoring-dashboard-window-and-day-semantics]
---

# VidMuse 前端 QuickTracking 指标：采集现状与拉取方式

阿里云 QuickTracking（国际站，ap-southeast）承载 VidMuse Web 的性能与稳定性 RUM 数据。2026-09-12 按 `~/Downloads/sandai-code/vidmuse.ai/` 本地工作树核对文档与代码，未验证线上控制台状态。

## 去哪看

- `docs/quicktracking-performance-dashboard.md`：看板建设说明、公共字段表、七个分区的报表清单、事件到代码入口的映射表。
- `docs/specs/2026-05-25-vidmuse-stability-platform-context.md`：稳定性平台接入上下文。**第「QuickTracking OpenAPI 拉取方案」节是程序化取数的唯一权威入口**，含签名算法、接口名、调度建议、幂等键、建议保存的报表定义、待确认事项与验收标准。
- `docs/specs/2026-05-18-quicktracking-frontend-monitoring-extension.md`：前端监控扩展设计。
- 代码收口点：`apps/vidmuse/src/analytics/analytics.ts` 的 `performanceMetric`（约 586 行），所有性能与稳定性事件经此进 `window.aplus_queue`；指标目录在 `analytics/performance/catalog.ts`；SDK 配置在 `analytics/quickTrackingConfig.ts`。

## 三个必须知道的约束

- **拉取的是报表结果，不是明细事件。** 必须先在控制台创建并保存报表拿到 `reportId`，OpenAPI 才能取数。因此**控制台的报表定义就是下游的接口契约**，改分组维度会静默改变下游数据，而报表没有版本控制。
- **同一时间桶的数据会变。** 方案设计了三层拉取（每 5 分钟取近 2 小时、每小时校准近 24 小时、每天校准 T-1）正是为了修正延迟到达的数据。下游必须按幂等键 upsert 覆盖，不能 append；出双周报要等日级校准完成。
- **前端口径不等于服务端口径。** 文档明确把「不替代服务端 APM 和日志系统」「不作为财务/计费/安全审计的唯一事实源」列为非目标。用户关闭页面在前端记 `cancelled`，服务端任务可能仍然成功，两套数字不能相加或互相替代。

## 「首字节到达率」有三个候选口径

`duration_ms` 是耗时，**「率」必须由 `status` 字段算**（枚举 `success`/`timeout`/`error`/`cancelled`/`detected`/`clear`）。候选事件：`web_vital` 且 `web_vital_name = TTFB`（浏览器 Navigation Timing 意义）、`stream_accept_duration`（SSE 接受）、`generation_first_content_duration`（生成首内容，最接近 AI 产品的用户体感）。三者数值差别很大，报表必须写明取哪个。

**Why:** 这批指标是线上真实用户数据，比任何测试侧指标都接近质量，但它在第三方 SaaS 里，取数路径、延迟行为和口径都与自有数据库完全不同。把它当成普通数据源直接查会取不到数；当成稳定快照会算错趋势。

**How to apply:** 接入前先读 spec 的 OpenAPI 节，按其幂等键组合 `report_id + time_unit + bucket_start + bucket_end + group_dimension_hash + indicator_name` 设计下游唯一键，可直接映射到 [Sisyphus](../../sisyphus/README.md) `metric_daily_rollups` 的 `dimension_key`。前置依赖两项：控制台保存报表拿 `reportId`，以及主账号可见的 API Secret，都要提前申请。spec 的「待确认事项」六条尚未核实，其中 `release_version` 在所有生产发布中是否稳定唯一直接决定版本对比能否成立，接入前必须先验。建议把报表定义抄成仓库内的声明文件作为契约备份，控制台改动时同步。
