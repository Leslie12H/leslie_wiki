---
name: tool-daily-updating-hides-existing-data
type: pitfall
created: 2026-09-11
updated: 2026-09-14
tags: [vidmuse, admin, analytics, tool-usage]
links: [analytics-maintenance-historical-rebuild-pressure, thread-analytics-read-path-3s]
---

# Tool 日汇总状态与已有数据展示的边界

2026-09-11 通过生产 Thread Analytics 页面、DMS 只读查询及 origin/main a8670450c 核验：查询窗口 2026-09-03 至 2026-09-10（右端不含，北京时间）显示正在重建；七天均已有 tool_usage 日汇总。查询期间 09-05 汇总更新时间前进且 dirty 行消失，证明消费者确有进展；09-07 汇总完成约 46 秒后又被 thread_upsert 标脏。此为当次观测，不代表未来队列状态。

**Why（2026-09-11 当次版本）:** analytics_runner._mark_tool_daily_dirty_for_upsert 按 Thread 创建日标脏，不比较工具指标是否实际变化。thread_analytics_tool_daily_read._any_dirty_day_in_window 只检查窗口内任一历史日有无 dirty 行，不检查正在执行的任务；try_hot_metrics_from_tool_daily 已构造数据后仍可返回 updating。前端 threadAnalyticsHelpers.isUsableSecondaryAnalyticsResponse 仅接受 active/无状态，ThreadAnalyticsPage.loadHotMetrics 与 loadToolBreakdown 对 updating 直接 return，不合并已有数据。因此任务更新造成整日反复入队，而跨多日窗口要求全部同时干净才展示；暂无记录文案不证明底层无数据。

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


## 2026-09-14：接口成功但 Top Tool 与命中率仍被拒收

**Why:** 在 Admin API 当次部署版本 `432ac7228` 中，`ThreadAnalyticsPage.loadHotMetrics` 和 `loadToolBreakdown` 收到 HTTP 成功响应后仍检查 `isUsableToolPublication`。`updating` 被拒收且不合并响应数据，Top Tool 又把数据状态和请求异常显示成同一条“加载失败”。命中率红条的“正在重建”来自 dirty 日期判断，只证明存在待更新记录，不证明任务正在运行；Skill 空态还可能进一步误导为没有记录、需要回填。

2026-09-14 10:40–11:00（北京时间）完整读取 SLS 原始日志 2,908 条，筛出 13 条相关事件：API 多次记录 `tool_breakdown_read_hit items=20`，hot 记录 `rows=51557`。独立 Analytics Worker 当次镜像 `5ddbc019` 在 10:50、10:57 分别完成 2026-08-31、2026-09-01 日汇总，并记录 `processed=1, failed=0`，remaining 从 14 到 13。因此观察窗口内消费者有进展；这不证明用户整窗已完整发布，也不代表队列没有后续新增或失败。

另有独立读路径问题：混合时间窗口的部分日直接读明细，但原 dirty 检查覆盖整个查询日期，部分日的待更新汇总也会把刚读出的明细数据标成 updating。只有实际使用的完整日汇总才应参与此判断。

上面的“每次 Thread upsert 都标脏”是 2026-09-11 历史判断，不能直接用于当前版本。2026-09-14 核对 `apps/admin/workers/analytics_runner.py`，普通路径已比较人口维度和工具指标，仅发生相关变化时标脏；真实更新仍采用整日重建，不能据此宣称已完成 Thread 增量聚合。

**How to apply:**
- 分别核对 HTTP 状态、`filter_state`、返回统计值、`published_at` 及待更新日期；不要把 HTTP 200 当作统计可展示证明，也不要把 dirty 当作执行中的任务。
- 先确认 API 与独立 Analytics Worker 各自的镜像及日志。Web 日报循环缺失不能推出独立 Analytics Worker 停跑。
- 展示有效 stale 快照前仍需配套同版人口分母、发布完成标记和规则版本；不能通过一律接受 updating 修复展示。
- 区分请求异常与等待更新，展示具体原因；“重新查询”仅发起 GET，不应暗中回填。未收到可用命中率响应时，不给“没有记录”或修复指令。
- 部分日回归必须保留非空返回值断言，覆盖纯部分日、左右边界和中间完整日；完整日真的待更新时仍不得冒充当前完整数据。

当前修复与验收指针：Admin `docs/operations/tool-metrics-publication.md` 的 2026-09-14 小节，`apps/admin/service/thread_analytics_tool_daily_read.py`、`test_thread_analytics_tool_daily_read.py`、`test_thread_tool_publication.py`、`playground/src/pages/ThreadAnalyticsPage.tsx` 和 `threadAnalyticsHelpers.ts`。本次在 `codex/brief-scheduler-handoff-20260914` 实现，部分日读路径的 46 项后端回归已通过；前端调整仍在验证，不能当作生产已恢复。未启用生产 publication、未回填、未增加重建并发。

原始核验指针：SLS 项目 `k8s-log-c7c0ede6c71484f8da34a829954c50cd9`，Logstore `vidmuse-admin`，上述绝对时间窗；本机定向摘录 `/private/tmp/analytics-tool-events-20260914.json`，临时文件可能失效。涉及日志未索引字段时应完整分页读取 raw 后匹配，单次全文搜索为零不足以判定事件不存在。
