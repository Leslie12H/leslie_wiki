---
name: monitoring-dashboard-window-and-day-semantics
type: pitfall
created: 2026-08-31
updated: 2026-08-31
tags: [vidmuse, admin, monitoring, timezone, dashboard]
links: [vidmuse-admin-deep-knowledge, vidmuse-admin]
---

# 线上监控处置大盘:窗口计数与"天"的三套口径

admin 页面 `/playground/admin/monitoring-incidents`(源码 `playground/src/pages/MonitoringIncidentPage.tsx` + `pages/monitoring-incidents/`,后端 `apps/admin/service/monitoring_incident_query.py`)里,"数量"和"天"各有多套互不相同的口径,混用会让看板数字自相矛盾。2026-08-31 修了一轮。

## 三套"天"的口径

后端同时存在三种时间基准,选错就会出现"图上 20 条、点进去 0 条":

1. `create_time` —— incident 创建时间。`created_day` 过滤走这个,边界用 `_local_day_bounds()`(**UTC+8**)。
2. `_investigation_activity_expression()` / `_investigation_activity_at()` —— 调查结果活动时间(`analysis_completed_at` 优先,否则 `update_time`/`create_time`)。趋势图 `_trend()` 和 `daily_issue_groups` 走这个。
3. `_alert_activity_expression()` —— 源告警活动时间(`MonitoringAlertInstance.last_seen_at` 优先)。前端窗口切换默认的 `window_basis`。

**2026-08-31 之前的 bug**:趋势桶和 `daily_issue_groups` 的 key 用 `datetime.now(timezone.utc).date()`(UTC 日期),而下钻用的 `created_day` 是 UTC+8 本地日 —— 差 8 小时且基准字段还不同,所以点趋势柱下钻当日告警拿到的是另一批数据。

**修法**:桶 key 统一改成 `.astimezone(MONITORING_DASHBOARD_TIMEZONE).date()`(该常量在 `monitoring_incident_query.py` 顶部,= `Asia/Shanghai`);同时给 dashboard 列表接口加了 `day_basis` 参数(`created|investigation|alert_activity`),让下钻能跟趋势柱用同一个基准。

## 全量计数 vs 窗口计数

`MonitoringIncidentDashboardSummary` 里:

- `total` / `problem_registry_total` 是**全表计数**,不带任何窗口或筛选条件 —— 这就是用户看到"问题永远是 35 个,切 24 小时/3 天/7 天都不变"的原因。这两个字段的语义**没有改**,因为有其它消费方依赖。
- 2026-08-31 新增 `window_incident_count` / `window_problem_count` 作为窗口内的对应值,前端顶栏和 tab 角标改用它们。

**注意**:`window_incident_count` 固定用 `alert_activity` 基准,不能做成按 basis 可变 —— 因为 `_dashboard_summary_cached()` 的缓存 key 只含 `window_hours`,不含 basis,加 basis 维度会串缓存。

`GET /monitoring/problems` 本来就支持 `last_seen_hours` / `sort_by`,但前端问题看板一直没传;`/monitoring/problems/status-counts` 原本完全没有窗口参数,同批加上了 `last_seen_hours`。

## 前端的假数据陷阱

问题看板 `MonitoringProblemBoard.tsx` 曾有一个「近 8 日」火花图,是从 `incidents` prop(即 dashboard 当前页的 `data.items`,最多 PAGE_SIZE 条)里数出来的。绝大多数 Problem 的关联 incident 根本不在这一页,所以火花图几乎恒为空 —— 看起来像"没按时间排序"。已删除,换成 `last_seen_at` / `first_seen_at` 时间列。

**Why:** 这套大盘的字段是分几批长出来的,每批各自选了当时顺手的时间基准和计数范围,没有一处统一的口径定义。看板上并排显示的数字因此来自不同宇宙,用户信不过任何一个。

**How to apply:**

- 改这个页面前,先确认你要的是哪套"天"和哪套"计数",不要看到 `created_day` 就以为是"告警发生那天"。
- 新增任何"数量"字段时,明确它是全量还是窗口内,并在前端文案上写清楚(例如"近 N 小时 X 条 / 全量 Y")。
- 往 `_dashboard_summary()` 里加依赖窗口的字段时,检查 `_dashboard_summary_cached()` 的缓存 key 是否覆盖了你引入的新维度。
- 前端任何"趋势/分布"如果是从分页后的列表算出来的,基本可以判定是假数据,要么后端出聚合,要么删掉。
