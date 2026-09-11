---
name: tool-daily-updating-hides-existing-data
type: pitfall
created: 2026-09-11
updated: 2026-09-11
tags: [vidmuse, admin, analytics, tool-usage]
links: [analytics-maintenance-historical-rebuild-pressure, thread-analytics-read-path-3s]
---

# Tool 日汇总反复标脏，前端隐藏已有数据

2026-09-11 通过生产 Thread Analytics 页面、DMS 只读查询及 origin/main a8670450c 核验：查询窗口 2026-09-03 至 2026-09-10（右端不含，北京时间）显示正在重建；七天均已有 tool_usage 日汇总。查询期间 09-05 汇总更新时间前进且 dirty 行消失，证明消费者确有进展；09-07 汇总完成约 46 秒后又被 thread_upsert 标脏。此为当次观测，不代表未来队列状态。

**Why:** analytics_runner._mark_tool_daily_dirty_for_upsert 按 Thread 创建日标脏，不比较工具指标是否实际变化。thread_analytics_tool_daily_read._any_dirty_day_in_window 只检查窗口内任一历史日有无 dirty 行，不检查正在执行的任务；try_hot_metrics_from_tool_daily 已构造数据后仍可返回 updating。前端 threadAnalyticsHelpers.isUsableSecondaryAnalyticsResponse 仅接受 active/无状态，ThreadAnalyticsPage.loadHotMetrics 与 loadToolBreakdown 对 updating 直接 return，不合并已有数据。因此任务更新造成整日反复入队，而跨多日窗口要求全部同时干净才展示；暂无记录文案不证明底层无数据。

**How to apply:**
- 先按用户窗口查询 agent_thread_analytics_daily_dirty 的 local_date/reason/marked_at，再查 agent_thread_tool_daily_agg（scope_kind=0）的分类、call_count、updated_at；观察更新时间前进与队列消失，区分停跑、失败、再次入队。
- 不因页面暂无 Skill 就直接运行 repair_tool_usage_metrics；先检查读响应与 UI 接收门禁。
- 修复方向（本次未实施）：明确已发布但待刷新的 stale 与缺失/失败状态，返回发布时间和待更新日期，前端展示允许使用的已发布数据；写侧仅在影响工具汇总的事实变化时标脏。规则变化涉及排除口径，必须另外定义可否展示旧结果，不能一律接受 updating。
- 只凭 reason=thread_upsert 不能断定触发它的是哪条调度循环；定位具体生产者仍需同时间段 Worker 日志。本次没有修改生产数据或部署。
