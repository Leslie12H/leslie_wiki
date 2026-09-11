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

## 2026-09-11 Worker 日志取样

ACK 生产部署 prod-vidmuse-admin-analytics-worker，Pod 7cb6665474-9zr9j，main 容器镜像 4ef5053f。读取最近 500 行，日志时间 10:27:46.019–10:57:37.346（约 29 分 51 秒；原始日志时间，未用浏览器时间直接换算）。332 条 analyzed 日志涉及 145 个 Thread，三个 Thread 各出现 8 次。187 次为同 ID 后续分析记录，不能在缺少源 revision 的情况下认定全部为冗余。

6 条 tool_daily_consume 均 processed=1、failed=0，完成时间 10:30:35、10:35:49、10:41:06、10:46:20、10:51:35、10:56:51；remaining 依次 5、5、5、5、10、9（包括当天不可消费记录，不等于全部历史日积压）。相邻完成间隔约 314–317 秒。日志无单日开始时间、日期、扫描/写入行数，不能将间隔直接算为重建耗时，也不能推导数据库 CPU/IO 压力。

main tailer 每轮可见 recent-priority 和增量处理；facts_reconcile 在样本内均 checked=0/repaired=0。应优先核对重复 Thread 的源 update_time、版本和维度门禁，而非将重复归咎于 facts 对账；尚未把先前 09-03 至 09-09 标脏记录精确关联到具体 Thread/循环。新增量写方案未实现，当前日志不能代替其压测。诊断只读取日志，未触发重建。

## 2026-09-11 本地实现指针

后续实现位于 vidmuse-admin 分支 `codex/tool-metrics-published-state`，部署前置条件、额外读写开销、验收和回滚见该分支 `docs/operations/tool-metrics-publication.md`。本地测试不代表生产已部署或数据库负载已下降。按日重建仍保留；Thread 增量聚合尚未实现。

**Why:** 已发布分子必须配套同版人口分母；InnoDB 的 INSERT SELECT 不能直接当作普通一致性 SELECT 使用。

**How to apply:** 在同一 REPEATABLE READ 事务内用普通 SELECT 分页读取人口，和汇总、完成标记一起提交；启用旧快照读取前完成 Facts 与预期错误物化迁移，并排除旧重建 Worker 混跑。

## 2026-09-11 PR Review 指针

PR https://github.com/world-sim-dev/vidmuse-admin/pull/871 的 review 记录见分支操作文档。不要把测试通过视作生产降载验收：人口快照重写、窗口 DISTINCT 聚合、历史 Facts 完整性分别需要验证。MySQL FLOAT 精度差异也可能使精确比较误判更新，比较策略必须与存储精度相容，同时保留真实数值变化测试。

## 2026-09-11 目标设计修订

原 #871 已整合到 #870。重新设计文档位于 #870 的 `docs/operations/tool-metrics-incremental-design.md`：普通更新使用 Thread 新旧贡献及项目引用计数；整日计算仅用于受控初始化/修复。该文档是尚未实现的目标，不能当作上线证明。整日删除的现有原因是全量替换要清除已消失的汇总键，简单改成 upsert 会残留旧键；项目 OR 位图没有可直接撤销的旧贡献。
