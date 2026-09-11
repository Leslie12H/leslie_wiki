---
name: prod-table-retirement-audit
type: reference
created: 2026-09-11
updated: 2026-09-11
tags: [admin, database, cleanup]
links: [tool-daily-updating-hides-existing-data]
---

# 生产 Admin 表退役审计入口

2026-09-11 只读审计对照 DMS sandai-us-prod / vidmuse_admin 与 origin/main 9a8013f77。executor_registry、scorer_registry、replay_tool_registry 当次 EXISTS 为 0，外键查询无结果，源码没有运行时 ORM 引用；属于清理候选而非自动删表批准。生产运行镜像、外部消费者及可编程对象依赖仍需核对。

**Why:** 空表不等于未使用，闲置小表删除也不能缓解热路径压力。旧 analytics/latency/funnel daily 表虽默认停写，仍有兼容 Query 和开关，不能仅凭注释删除。

**How to apply:** 复核 information_schema.tables 的表清单与空间（估计值）；用 EXISTS 低成本检查候选空表；查 key_column_usage、可编程对象、运行时 ORM/SQL 及部署版本。代码入口为 controller/admin/test_center.py 的 registry endpoints、service/test_center/registry.py、workers/analytics_runner.py 的 legacy_daily_write_enabled、service/thread_analytics.py。先代码退役及验证，再单独授权数据清理。

当次已发现两个 tool publication 新表存在，main 已含 #870；此前对话未建表/未合并是旧状态，不能复用成当前事实。
