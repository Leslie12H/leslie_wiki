---
name: thread-analytics-read-path-3s
type: project
created: 2026-09-02
updated: 2026-09-02
tags: [vidmuse, admin, thread-analytics, performance, rollup]
links: [vidmuse-admin, vidmuse-admin-deep-knowledge]
---

# Thread Analytics 读路径:为什么 30 天做不到 3 秒(2026-09-02 体检)

目标:Thread Analytics 页 8 个 Tab 在 30 天区间 3 秒内响应。2026-09-02 基于 `apps/admin` 代码(commit 94d669523)做的读路径体检结论。完整报告(含每个 Tab 的路径/卡点/去向表、四阶段方向)见 Claude artifact「Thread Analytics 3 秒读路径」(会话 2026-09-02)。

## 五个病根(代码可证)

1. **聚合在请求进程里做,成本 ∝ 窗口长度。** 小时表与日表都把整份指标塞进一列 MEDIUMTEXT `summary_json`;读侧逐行反序列化 + Python 合并(`merge_hourly_summaries` 永不改写入参,每行复制整份累积结果;总体和趋势各合并一遍)。DB 侧没有任何 SUM。加 Worker/加索引无效。
2. **四类指标五张表五套完整性定义。** latency(hourly + latency_daily v4 marker)、hot/tool/card(analytics_daily_metrics,**没有 marker** → `get_latency_hot_metrics` 对 >72h 直接 unavailable)、funnel_daily、outcome_daily + outcome_facts。同一区间不同卡片状态不一致是结构性的。
3. **脏判断是全局 fail-closed。** 小时读路径要求 60 天 campaign 内一个脏小时都没有(`completed_hourly_backfill_window`),规则变更一次标脏上千小时、consumer 每 30s 消费 2 小时 → 快路径关闭数小时。banned/abuse 同步每次把"今天"重新标脏;`_load_outcome_summary` 调 `analytics_exclusion_rollup_window_status(db, start_time)` 不传 end_time("到现在"语义)→ 历史窗口常年 updating。
4. **逐 ID map 藏在 JSON 里**(project_counts、credits 桶 user_counts、outcome *_user_counts),只为算去重数,却让行大小随 Thread 数增长。
5. **三个对比 Tab 没有聚合路径**:模版对比纯明细、实验对比 cohort→明细 join、Plugin 对比门禁失败即明细。72h 限制是 150k 行闸倒推出来的。

## 方向(原则:任何仪表盘读取 = 对有界数量预聚合行求和,与窗口长度无关)

- 阶段 0(不改 schema):原地单遍合并、只取需要列、去掉"campaign 内不能有脏小时"的门、outcome overlay 传 end_time、小时路径补分步计时日志。
- 阶段 1:**日投影表**(同一 consumer 从 24 小时行派生,同一直方图格式)+ scope 按 UI 筛选维度物化 + hot/funnel 进 `rebuild_hour` 同事务 + ID map 移到窄表 COUNT(DISTINCT)。
- 阶段 2:单一发布契约,退役日 ledger 与排他维护锁;排除规则只在滚动 horizon 内生效(产品口径要明确)。
- 阶段 3:对比 Tab 读 scoped 日投影;实验对比加每 Thread 一行的窄事实表;lookback 扩 90–180 天;标准窗口结果缓存。

## 最终方案(2026-09-02 v2,取代上面"四阶段"里的日投影路线)

不再修小时表。**Thread 级窄事实表 `agent_thread_analytics_facts`(1:1 主表,只有维度+数值列,无 JSON)作为唯一读源**,所有 Tab 的汇总由 MySQL 在窗口内直接 SUM / COUNT DISTINCT / GROUP BY;排除规则读时用现成的 `apply_analytics_exclusion_filter`(NOT EXISTS)过滤,规则变更零重算;分位数按 Tab 只取需要的列(库内 ROW_NUMBER 或拉单列排序)。

- 复用不改:`agent_thread_analytics`(数值列+索引已齐)、`agent_thread_tool_usage_metric`(Hot/Tool/卡片本来就是窄计数表,只是以前 >72h 不敢读)、`agent_thread_outcome_facts`、error_cluster+预期错误规则、assignment 表。
- 新增:facts 表 + `agent_thread_funnel_dropoff_reason` 子表 + 读模块 `thread_analytics_facts_read.py`(开关 `ANALYTICS_FACTS_READ_ENABLED`)+ 纯投影回填脚本。
- 退役:小时表/脏队列/campaign/reconcile、四张日表/v4 marker/dirty-day ledger/维护锁/repair 脚本、`_load_daily_*`、72h 门与 409。
- 落地五步:①生产只读库先量 30/90/180 天 SQL 耗时(决策门:30 天 <500ms、90 天 <1.5s)→ ②DDL+worker 同事务写+回填(parity 逐 Thread 对齐 `_latency_daily_sample_from_row`)→ ③按端点切读模块(≤72h 与明细扫描逐字段 parity)→ ④切流拆门 → ⑤退役;仅当 180 天超时才加夜间派生的按日加速表(无脏队列)。
- 前提:日 Thread 数千级。量级高一个数量级则按日加速表从可选变必选,但事实表仍是源头。

## 实测证据(2026-09-02,本机跑仓库真实代码)

- E1 小时 global 路径 30 天:62 直方图/行、17.8 KB/行,json.loads 0.13s + 总体合并 0.91s + 趋势合并 0.55s = **1.59s**(48h 0.06s)。→ 模型问题成立,但解释不了用户实测的 404s。
- E2 latency-with-trends 明细轻量路径(`_latency_summary_row_load_columns` + `_build_latency_overview_from_rows`):50/200 行都只有 6 条 SQL,**无 N+1**。
- E3 漏斗明细路径:直接调底层 `_funnel_overview_rows_query` + `_apply_funnel_row_to_stats` 会出现每行 1 条 SELECT execution_summary_json。**更正(2026-09-02 子任务核对)**:生产调用方 `_query_funnel_overview_rows`/`_iter_funnel_overview_rows` 在 main 6cf0e384c(2026-08-11)已加 `_hydrate_legacy_funnel_reason_payloads` 批量预加载 + 写入时落 marker,该 N+1 在生产链路不存在。教训:复现要从生产调用方入口跑,不能只测底层函数。
- E4 用户的 5.46s/404.6s 代码无法归因;用现成日志定位:`metric=latency_with_trends … path=`、`step=filtered_row_scan elapsed_ms=`、`hourly_latency_read_miss reason=`。若 path=row_scan,候选是产品库 agent_thread COUNT(索引 (type,plugin_id,create_time,id) 无 plugin 过滤时对 type 全索引扫)、行流式传输、排除 NOT EXISTS、outcome overlay。
- 复现脚本:会话 scratchpad `bench_hourly_merge.py`、`repro_live_scan_queries.py`(SQLite + before_cursor_execute 计数;MEDIUMTEXT 需 @compiles 成 TEXT)。

## 最终方案 v3 补充:两层 + 路由

Tier 1 窄事实表(≤行数阈值,建议 15 万行,探针实测后定)+ Tier 2 日聚合(`daily_agg` 计数器列 / `daily_hist` 直方图桶长表 / `daily_user` 去重窄行 / `daily_dirty` 规则变更重算队列),Tier 2 由 Tier 1 派生,一日一条 GROUP BY 重算,无维护锁;路由用 daily_agg 的 SUM(thread_count) 估行数。探针 SQL:`apps/admin/docs/thread_analytics_facts_probe.sql`(Q0–Q15)。

## 待确认的强候选根因(2026-09-02,探针 Q1 六分钟无结果)

规则表 `agent_thread_analytics_exclusion_rules` / `_plugin_exclusion_rules` 的建表 DDL(2026_08_05 / 2026_08_10 migration)只有 `DEFAULT CHARSET=utf8mb4`,未显式 COLLATE → MySQL 8 默认 `utf8mb4_0900_ai_ci`;而事实表 2026_04_20 DDL 是 `COLLATE=utf8mb4_unicode_ci`(与 `analytics_exclusion.py` 注释所说恰好相反)。`apply_analytics_exclusion_filter` 用相关子查询 NOT EXISTS 并在外侧列上显式 COLLATE(运行时反射规则表 collation,失败回落常量 unicode_ci)。若显式 COLLATE 与规则表列不一致,规则表唯一索引失效 → 外表每行全扫规则表(banned/abuse 同步可生成上万条规则)。生产共 21 处调用点(含小时重算 rebuild_hour)。判别:去掉 NOT EXISTS 的 Q1 是否秒回;information_schema.COLUMNS 查真实 COLLATION_NAME;EXPLAIN 看 DEPENDENT SUBQUERY + type=ALL。修法:DDL 显式对齐 collation + 改 hash anti-join(LEFT JOIN 派生表 IS NULL),删运行时 COLLATE。

## 生产实测定根因(2026-09-02,DMS)

- 30 天 COUNT(*) 走 idx_ata_create_time 覆盖索引:69,700 行、93 ms(日均 ≈ 2.3k Thread)。
- 同窗口带数值列聚合(无排除):13,391 ms;EXPLAIN key=idx_ata_version(无 create_time)、rows=67,256、Using where。
- 13,391 ms / 67,256 行 ≈ 0.2 ms/行 = 一次随机页读。**根因 = 聚簇顺序(随机 thread_id 主键)与查询顺序(时间)不一致 + 胖行(6 个 JSON 列)** → 任何非覆盖聚合 = 窗口行数 × 随机页读。buffer pool 26 GB 也不常驻。
- 排序规则确认:事实表 user_id/plugin_id = utf8mb4_unicode_ci,规则表 = utf8mb4_0900_ai_ci(DDL 未显式声明)。探针写死 unicode_ci 方向反了 → 规则表索引失效 → 6 分钟;生产代码运行时反射规则表 collation,索引大概率可用。修法:ALTER 规则表列到 unicode_ci + 反连接。
- 对策定稿:窄事实表按 (local_date, thread_id) 聚簇(30 天 ≈ 14 MB 顺序读);现表临时止血 = 热查询覆盖索引 + 删 idx_ata_version。

## 实施启动(2026-09-02)

- 分支 `feat/thread-analytics-facts`,worktree `~/Downloads/sandai-code/vidmuse-admin-facts`,基于 origin/main 6e718d8d7。
- 探针 Q7b:`agent_thread_tool_usage_metric` 30 天约 **400 万行**(≈58 行/Thread)→ Tool 家族首期必建 `agent_thread_tool_daily_agg` + `agent_thread_analytics_daily_dirty`;维护方式=worker 标脏 local_date、消费者每 60s 按 6 个 scope_kind 整日 GROUP BY 重算(源 tool_usage_metric.metric_date 已是 UTC+8 日),不做逐 Thread 增量。口径变化:跨日 project 去重改为日内去重求和(旧 hot 日表用 project_ids_json 精确去重),需业务确认。
- Outcome facts(Q8)仍未决。

## 实施进度(2026-09-02,分支 feat/thread-analytics-facts,worktree ~/Downloads/sandai-code/vidmuse-admin-facts)

已提交(按顺序):b9058888d 止血迁移+outcome end_time → bcc627c07 facts 表/投影/upsert → 4d9c0acfc worker 同事务写+对账循环+回填+工作流 → dc675a928 Tool 日聚合/逐 project 日行/脏日消费 → 963042669 工作流注册 backfill_tool_daily → acc36cdf0 latency-with-trends 走 facts、hot-metrics 走 tool_daily。进行中:漏斗(facts 补 funnel_break_stage_idx / approx_render_completed_s 两列)与 Credits 分布。待做:tool-breakdown(Top Tool)、outcome、四个对比、下钻、规则变更接线 mark_days_for_rule_change、前端拆门、退役。
关键设计事实:漏斗阶段 FUNNEL_STAGE_IDS 是 12 个(不是 9,9 是 BUSINESS_STAGE_DEFINITIONS);facts 读路径不重写响应构造器,而是从列拉取构造同形状 summary 再调 _latency_response_from_daily_summary;排除用 LEFT JOIN 反连接;主表 update_time 镜像产品库 Thread 更新时间(非写入时刻),对账规则 facts.updated_at < update_time 不会误判。
部署 runbook:DMS 依次跑 4 个 2026_09_02 迁移 → worker configmap 开 ANALYTICS_FACTS_WRITE_ENABLED / ANALYTICS_TOOL_DAILY_ENABLED → Actions 跑 backfill_facts、backfill_tool_daily(60 天分别约 5–8 min / ~20 min;JSON 实测每行 ≈17 KB)→ API configmap 开 ANALYTICS_FACTS_READ_ENABLED / ANALYTICS_TOOL_DAILY_READ_ENABLED → 观察一周 → 拆门与退役。

## 用户指出的缺口(2026-09-02 晚):Tool 家族只支持整日窗口

Hot / Top Tool 的日聚合读路径最初要求整北京时间自然日,"过去 7 天到当前时刻"这种两端零头窗口会落回旧路径(>72h unavailable);前端也一直用"超过 72h 必须 00:00 对齐"的校验把这类窗口拦掉。修法(T15):混合窗口——整日读 daily_agg / daily_project,两端零头从 tool_usage_metric 明细现算(每零头日 ≤13 万行,索引命中),project 去重用 UNION ALL 子查询 COUNT(DISTINCT CASE WHEN flags & bit)。做完后前端 00:00 对齐规则可删。教训:日粒度物化表要配零头补算,否则"整日"约束会泄漏到产品交互。

**Why:** 2026-08-26 的小时事实表重构解决了"可合并"(直方图替代原始值列表),但没解决"在哪合并";而且读路径门禁设计成全局 fail-closed。用户实测 latency-with-trends 1h≈5.46s、48h≈404.6s——代码里无法定位到哪一步(小时路径没有分步计时),要先看日志是 `hourly_latency_read_hit` 还是 `_miss reason=`,miss 的话 404s 是明细扫描的数字。

**How to apply:**
- 讨论 Thread Analytics 性能时先分清是 R1(合并成本)还是 R2/R3(门禁 fail-closed);v2 方案用"不预聚合"同时消掉 R1–R5。若有人提议继续修小时表/日投影,先看本页"最终方案"再讨论。
- 动手前必须先做第 1 步实测(生产只读库跑 30/90/180 天 SQL),量级不符再谈按日加速表。
- 不做双写/影子/增量 delta(2026-08-26 已否决,整段重算便宜);不为当前量级(~1k threads/天)上 OLAP。
- 关键代码位置:`service/thread_analytics.py:13028 get_latency_with_trends`、`service/analytics_hourly_read.py:570`、`service/analytics_hourly.py:183/296`、`service/analytics_backfill_campaign.py`、`service/analytics_exclusion.py:832`、`service/thread_outcomes.py:1509`、`service/thread_analytics.py:15160 get_latency_hot_metrics`。行号会变,以函数名为准。
