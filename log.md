# 时间线(append-only)

> 每次 ingest / 重要变更追加一行。格式:`## [YYYY-MM-DD] 操作 | 摘要`

## [2026-07-02] init | 初始化 wiki 骨架:domains(vidmuse 全景+5系统)/ disciplines / global / _template + schema(CLAUDE.md/AGENTS.md)+ index.md
## [2026-07-02] ingest | 梳理 vidmuse-admin 2026-06 知识地图,新增 Test Center V2 MCP / VidMCP auth / CDN / admin harness 页面,并更新 index 与 vidmuse 全景
## [2026-07-02] refactor | 将 Test Center V2 MCP / VidMCP auth / CDN / harness 页面下沉到 domains/vidmuse/admin/,避免 admin 子系统知识冒充 Vidmuse 全域知识
## [2026-07-02] ingest | 从本地 aion/zeus/vidmuse.ai 三仓库扫描并回填 Vidmuse 全景、三张 system 页和 repo scan reference
## [2026-07-02] correction | 确认 Vidmuse 产品 API 事实源是 vidmuse-zeus 而非 zeus,并将 /api/v2/threads 链路修正为 vidmuse.ai -> vidmuse-zeus relay -> AION /public/api/v2/threads
- 2026-07-06 ingest: 2026-07-06-test-center-v2-audit(Test Center V2 全链路审查 P0 结论:dedupe migration MySQL 自连接跑不过/credits 门控不对称/cancel_run 全量重算污染)
- 2026-07-23 ingest: 开新域 domains/maxwell(Agent 平台 + Quality eval 域),写入 README + quality-eval refs;背景:与 Anthropic demystifying-evals 文章做差距分析
- 2026-07-24 update: quality-eval refs 补交互设计结论(v4 原型指针、三层对象模型、能力地图=聚类标签、爬山日志、影响面 gate)
- 2026-08-31 ingest: monitoring-dashboard-window-and-day-semantics(线上监控处置大盘三套"天"的时间基准 + 全量 vs 窗口计数;修了 UTC/UTC+8 桶错位、新增 window_incident_count/window_problem_count 与 day_basis、删掉分页数据算出来的假火花图)
- 2026-08-31 ingest: admin-scheduled-report-mechanisms(admin 两套定时报表机制:外部 /cron 端点 vs 进程内 asyncio+next_fire_at;BugBotConfig.schedules 是没人读的死配置;app.py startup 有一道提前 return 的总闸会静默吞掉新后台循环;FeishuMessageClient 的 webhook_url 优先于 chat_id)
