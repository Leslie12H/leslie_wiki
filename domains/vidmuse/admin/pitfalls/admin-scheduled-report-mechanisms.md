---
name: admin-scheduled-report-mechanisms
type: pitfall
created: 2026-08-31
updated: 2026-09-17
tags: [vidmuse, admin, feishu, scheduler, cron, report]
links: [vidmuse-admin-deep-knowledge, monitoring-dashboard-window-and-day-semantics, monitoring-daily-brief-evidence-loss, monitoring-daily-brief-startup-handoff]
---

# admin 定时报表:两套机制,以及一个骗人的死配置

vidmuse-admin 里"定时往飞书群发卡片"有**两套完全不同**的机制,选错会白做。

## 机制一:外部调度器打 `/cron` 端点(现存 4 个报表都是这套)

`apps/admin/controller/public/` 下一个 token 守卫的 `POST .../cron` 端点,由**仓库外的调度器**定时调用:

| 端点 | Token 设置项 |
|---|---|
| `/api/v1/thread-analytics/weekly-report/cron` | `THREAD_LATENCY_REPORT_CRON_TOKEN` |
| `/api/v1/feishu-bug-bot/cron/{report_type}` | `FEISHU_BUG_BOT_CRON_TOKEN` |
| `/api/v1/error-intelligence/cron` | `ERROR_INTELLIGENCE_CRON_TOKEN` |
| `/api/v1/observability-intelligence/{latency,experiment,experiments}/cron` | `OBSERVABILITY_INTELLIGENCE_CRON_TOKEN` |

**触发方不在这个仓库里**,repo 内搜不到任何 CronJob manifest / GitHub Actions schedule。2026-08-31 排查时未能定位它究竟是什么(飞书多维表格自动化 / 云函数 / 运维管的 K8s CronJob),TODO。

## 死配置警告:`BugBotConfig.schedules` 是假的

`service/feishu_bug_bot/models.py` 的 `ScheduleConfig` 里写着 `morning: "09:30"`、`online_sla: "10:00"`、`poll_interval_seconds: 60`,长得非常像内部调度配置。

**但全仓库没有任何代码读它。** grep `.schedules` / `online_sla` / `poll_interval_seconds` / `ScheduleConfig`,除 `models.py` 的定义本身外唯一命中是一个测试的函数名。改它不会改变任何行为。

早上 10:00 那张 P0/P1 卡片(`ReportType.ONLINE_SLA`,标题「线上缺陷 SLA 修复提醒」,过滤线上阶段 + P0∪P1)的真实时间来自机制一的外部调度器。

## 机制二:进程内 asyncio 循环 + `next_fire_at` 落库

`service/test_center/schedule_service.py` 是仓库内现成的 croniter 实现:`TestSchedule` 表存 `cron_expr`/`timezone`/`next_fire_at`,`scheduler_loop()` 每 30s tick,`app.py` 启动时 `create_task`。

2026-08-31 新增的「昨日线上告警日报」(`service/monitoring_daily_brief_report.py`)走的是简化进程内循环。2026-09-17 已核验生产版本 `cb3a69c392e29eb7c5abff573aab5210d0bedc84`：每进程独立 60s tick，以 Redis `SET NX EX` 日级领取和执行租约选出生成者，成功后延长 guard，飞书日级 uuid 再做去重；Redis 不可用则 fail closed。失败不统一删除 guard：`_defer_failed_brief` 对指定瞬态错误有界重试，确定性失败延至当天结束。`invalid_schema` 首次失败停当天的实例见[日报结构校验失败](monitoring-daily-brief-evidence-loss.md)。

## 两个必须知道的启动陷阱

1. **`app.py` 的 startup 里存在提前 return 的全局门禁**，其后才启动的后台循环会受功能开关集合和 owner 锁约束。新增循环需先判断其执行模型，不能一律要求加入总闸：按进程轮询且由持久化任务租约选主的任务，应核对独立启动、领取与 shutdown 清理。否则会发生开关开启但循环未启动，或滚动部署无人接班。
2. **`_try_acquire_background_tasks_lock()` 只约束它后方启动的全局后台任务**；它不等于某天已发送，也不能替代日报的日级幂等。2026-09-17 已核验日报在[独立启动入口](https://github.com/world-sim-dev/vidmuse-admin/blob/cb3a69c392e29eb7c5abff573aab5210d0bedc84/apps/admin/app.py#L421)启动，位于该全局门禁前方，实际生成/发送由日级 Redis 领取控制。

> 历史边界：2026-08-31 的日报受全局 owner 启动门禁影响；2026-09-14 已定位滚动部署时 owner 仅抢一次造成循环缺失，PR #878 改为日报独立启动。2026-09-17 生产源码与当日综合日志已证实新路径执行，见[日报启动交接](monitoring-daily-brief-startup-handoff.md)和[结构校验失败实例](monitoring-daily-brief-evidence-loss.md)。其他全局后台任务是否可自动接班仍需单独核验。

## 发送:`FeishuMessageClient` 的两个坑

`service/feishu_bug_bot/clients.py`:

- `send_interactive_card()` 里 **`webhook_url` 优先于 `chat_id`**。想发到指定群就**只传 `chat_id`,绝不能同时传 `webhook_url`**,否则消息会去 webhook 对应的群。
- `_tenant_access_token()` 在 `app_id`/`app_secret` 为 `None` 时自动回落 `FEISHU_BUG_BOT_APP_ID` → `FEISHU_APP_ID`。所以**只传 chat_id 就能复用 Bug Bot 的机器人身份**,不用新增凭证配置(前提:该飞书 app 已在目标群内,app 不在群里发不了消息)。
- `idempotency_uuid` 会作为飞书 `uuid` 字段发出,飞书自身按它去重,可当第二层幂等。

**Why:** 这几套机制是不同时期各自长出来的,外观相似但触发路径完全不同;`ScheduleConfig` 这种"看起来是配置其实没人读"的残留最浪费时间。

**How to apply:**

- 加新定时报表:优先机制二(进程内 + `next_fire_at`/Redis 幂等),因为不依赖仓库外的黑盒调度器,时间改配置即可,重启不重发不漏发。同时**仍要留 preview + 手动重发端点**,出问题能立刻重放。
- 改现有报表的发送时间:**不要动 `BugBotConfig.schedules`**,去找机制一的外部调度器。
- 任何 `settings` 里的配置项,加之前先 grep 确认真的有人读;发现死配置要么删要么标注。
- 新增后台循环，先确定由全局 owner 还是持久化任务租约控制，再检查启动位置、领取与退出；不要将 `app.py` 总闸要求套到已独立启动的日报。
