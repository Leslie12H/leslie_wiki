---
name: analytics-maintenance-historical-rebuild-pressure
type: pitfall
created: 2026-09-07
updated: 2026-09-07
tags: [vidmuse, admin, thread-analytics, polardb, maintenance, incident]
links: [thread-analytics-read-path-3s, vidmuse-admin]
---

# Analytics 维护调度器持续重建历史日 → PolarDB writer 报警(2026-09-07)

2026-09-07 01:00 起 PolarDB writer 网络输入持续超阈值(报警 3 分钟内日表 INSERT 从 3,328 次涨到 22,443 次,DB 输出≈输入 7.7 倍,来源是 analytics maintenance 容器,处理的是 08-04/08-08/08-26 等历史日期)。基于 origin/main 4d7a7f0 定位到三个放大器叠加,全部在**旧路径**(maintenance 调度器 + 4 张日表),而新路径(窄事实表 facts + tool_daily)在生产读写都已开启、且不读这些日表。

三个放大器(`service/analytics_feature_sync_scheduler.py`,行号会变,以函数名为准):
1. `analytics_feature_sync_loop`:只要 62 天窗口内任一日 latency 完成标记不完整,就 30 秒后再跑一次,每次重建一整个自然日。名义"每小时维护",实际 30 秒排水。
2. `_run_analytics_feature_sync_once_unlocked` 审计分支:每 2 小时轮转审计一个已关闭日,**审计通过也触发完整重建**(base replay + hot/funnel/outcome/latency)。2026-08-24 #771 引入。
3. prod overlay 给 maintenance 容器设 `ANALYTICS_DAILY_BASE_REPLAY_CONCURRENCY=16`,容器只有 1 核,压力全推给 DB。

写入侧两处结构浪费:日表主键 MySQL 自增 + ORM `add_all`,SQLAlchemy 无 RETURNING 只能逐行 INSERT(1000 行 = 1000 条语句);整天 tool 明细流式拉到 Python 聚合再逐行写回(c23dba3cb 为省内存把 4 条 GROUP BY 改成客户端聚合)。

同类隐患在新路径也存在:`mark_days_for_rule_change` 对 plugin 规则变更默认标脏 **400 天**,一次规则改动会让 tool_daily 消费者重建 400 个自然日。

**Why:** 旧架构的正确性契约是"已关闭日必须能从源精确复现",靠整日重建强制执行;加上 fail-closed 的完成标记,任何一次失败或迟到写入都会把日期重新推回 30 秒快车道。新架构(读时排除过滤 + 逐 Thread upsert)不需要这个契约,但旧架构没退役,两套并行跑。

**How to apply:**
- 看到 analytics 库写入报警,先查 DAS 语句指纹是否是 `agent_thread_analytics_daily_metrics` 逐行 INSERT 和 500 行一批的 tool_usage 删除;再看 Worker 日志 `metric=analytics_projection_rebuild_stage trigger=… scope=…` 判断是审计/reconcile/token 哪条触发、同一日期一天重建几次。
- 修法不是修调度器,是退役它。方案页(artifact「Analytics 维护调度器退役方案」,会话 2026-09-07)分 5 阶段。PR #853(分支 `feat/analytics-retire-maintenance-rebuild`,三个提交)已完成阶段 0–3:
  - ad24be39b:止血配置、审计通过不重写、日表多行 INSERT、规则同步迁入 Worker(`ANALYTICS_WORKER_FEATURE_RULE_SYNC_ENABLED`)、tool_daily 冻结线 `ANALYTICS_TOOL_DAILY_FREEZE_DAYS`=14 + plugin 规则标脏 400→14 天。
  - b5295d470:删 maintenance 容器与 `workers/analytics_maintenance_worker.py`;`ANALYTICS_FEATURE_SYNC_ENABLED` 默认 false;`observability_scheduler_loop` 迁入 Worker 主容器(同开关,监控 secret 随迁)。
  - bd62f8977:五个端点(funnel_overview / latency_with_trends / latency_hot_metrics / credits_distribution / period_comparison)删 daily_rollup、hourly、长窗口 row_scan 兜底,facts 未命中返回 `query_source=unsupported`+`reason`;Plugin 对比不读 legacy 日表、超 3 天明细窗口返回空;`ANALYTICS_LEGACY_DAILY_WRITE_ENABLED` 默认 false 关三张 legacy 日表逐 Thread 写;prod 关 hourly rollup/read;tool_daily 今天永远读明细、消费者只处理闭合日 + 300s 去抖 + `_heavy_work_lock`。
  - 剩余阶段 4:DROP 四张日表、小时表与脏队列、dirty-day ledger、维护锁、campaign watermark,并删 `analytics_feature_sync_scheduler.py` 等无调用方模块。发布观察一个周期后再做。
- 退役后分析写入只剩:Thread 完成时一次 facts + tool_usage upsert、2 天 lookback 的 facts 对账、闭合日 tool_daily 一次聚合、每小时规则同步。验证:DAS 日表/小时表写入归零;日志筛 `path=unsupported` 应无真实用户请求。
- 单独建库解决不了:同集群建表算同一 writer;独立实例只是转移(写入模式不变照样报警,读端仍扫业务库);跨区更糟(实时 Worker 同事务写 facts 会被加延迟)。隔离只在退役后作为故障域隔离考虑。
- 冻结线的口径代价:只影响 Hot / Top Tool 两块卡片 H 之前的历史(规则变更不回溯、老 Thread 重分析不触发整日重算),facts 路径不受影响;需要时手动 `backfill_thread_tool_daily` 指定日期。
- 第三轮核对发现:小时表也没有读者(latency_with_trends facts 优先命中即返回,hourly 排在其后),所以 hourly rollup 直接关掉;`get_latency_overview` 无 API/前端调用方,留待阶段 4 删除。
- 通用教训:任何"物化 + 整段重算"的表都要有**冻结线**和**每秒写入预算**;审计通过不应产生写;MySQL 自增表批量写必须用多行 VALUES。
