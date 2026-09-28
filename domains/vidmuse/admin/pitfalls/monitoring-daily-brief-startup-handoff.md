---
name: monitoring-daily-brief-startup-handoff
type: pitfall
created: 2026-09-14
updated: 2026-09-14
tags: [vidmuse, admin, monitoring, daily-brief, scheduler, deployment]
links: [monitoring-daily-brief-evidence-loss, admin-scheduled-report-mechanisms]
---

# 滚动部署成功不证明日报调度循环仍在运行

## 2026-09-14 生产库窗口对账

生产 DMS（sandai-us-prod / vidmuse_admin，实例 2846368、数据库 77799075）只读复现 `get_brief_evidence` 完整条件：2026-09-12、09-13、09-14 10:00 应发窗口，分别符合 28、22、2 条记录，对应 firing outbox 为 13、11、1 条。每个窗口均是前一天 10:00 至当天 10:00，北京时间；SQL 使用 UTC 02:00 边界。这是入库记录数，不能当作独立事故数。

周日新建的 10 条记录均早于 10:00，最后一条为 08:59:55；最后窗口两条新建于周一 06:07:49 和 06:12:49。新建统计与完整日报条件计数一致。前两个窗口共 50 条不属于用户截图的最后窗口，不能把截图的两条解释成整个周末只有两条；这些 SQL 本身也不能证明历史窗口从未由其他路径发送。

**Why:** `_run_daily_brief_tick` 只领取当前日期，并取当天 10:00 往前一天的窗口，没有遍历历史未发送日期。重启后的当日补跑不会补齐历史漏发窗口；模型调用前的输入范围已排除前两个窗口，不能归咎模型只选两条。

**How to apply:** 先按应发日期核对窗口、原始事件、入库记录和日报候选，再查每一天发送终态。历史补发应保留原窗口和日期幂等键，避免直接扩大今天的窗口。此轮只读对账，没有补发或修改业务代码。

**Why:** 2026-09-14 只读核验确认，Admin `app.py` 在 startup 仅尝试一次全局后台 owner 锁；新进程发现旧 owner 后永久跳过，没有后续接管循环。滚动部署时旧进程随后退出，即使租约稍后过期，新进程也不会自动启动日报。开关启用、Pod Running 和 rollout success 均不足以证明每日 10:00 会执行。

## 已核验的历史链路

以下均为北京时间，不能用来推断未来部署状态。

- 2026-09-12 10:00 的旧故障是模型返回格式无效，见[证据与 JSON 排查](monitoring-daily-brief-evidence-loss.md)。PR #875 在当日 13:26 合并、14:08 首次部署，不能修复此前已经失败的执行。
- 2026-09-12 17:46:26 旧 Pod 取得全局后台锁，17:46:30 启动日报循环；17:48:17 新 Pod 的三个进程均因旧 owner 存在而跳过。
- 2026-09-12 17:48:34 旧 owner Pod 的应用进程全部退出；17:48:56 第二个新 Pod 的三个进程仍见旧租约而跳过。当次新镜像为 `432ac72280abfc21d1554cff2091efec97acf3a1`，已含 PR #875。
- 2026-09-13、2026-09-14 09:59–10:30 分别完整读取 3,834、4,611 条原始日志，没有日报或 Bedrock 请求事件。结合启动链路和代码，定位为循环缺失；不是同一时间的模型超时或飞书发送失败。

## 修复与验证指针

[Admin PR #878](https://github.com/world-sim-dev/vidmuse-admin/pull/878)，日报修复提交 `5cb06cddcf2722a0a8280ca5165e0f807d8d042d`：将日报循环移出全局后台 owner 门禁，每进程启动并保存任务句柄，shutdown 取消且等待。实际生成仍由 Redis 日级 SET NX 领取控制，保留执行租约、成功 guard 和飞书日级幂等键。其他全局后台任务的 owner 接管不在本次修复范围。

2026-09-14 首次本地验证时，91 项相关测试、静态检查已通过，PR 已提交，尚未执行生产部署或补发。后续合并与生产发送核验见下节；当前发布及群卡片状态仍到 PR 和生产现场重新核对。

- `apps/admin/app.py`：startup/shutdown 与全局后台锁边界。
- `apps/admin/service/monitoring_daily_brief_report.py`：`_run_daily_brief_tick`、领取、失败租约和发送终态。
- `apps/admin/tests/test_monitoring_daily_brief_startup.py`：旧 owner 忙、日报关闭/单独启用及退出清理。
- `apps/admin/tests/test_monitoring_daily_brief_report.py`：六进程竞争同一天任务仅一个实际生成。
- `docs/monitoring-daily-brief-quality.md`：2026-09-14 启动交接与发布验收。

**How to apply:**
- 先查新进程 `monitoring_daily_brief event=worker_started`，再查具体日期的生成、发送终态，最后核对目标群实际卡片；三层证据分别验证。
- 无日报事件时先排查启动与领取路径，不直接增加模型超时或归咎卡片长度；有事件才沿综合、渲染、飞书错误码深入。
- 生产日志字段未建立全文索引时，按可信窗口完整分页读取 raw 后匹配；只搜索一次返回零不能证明没有事件。
- 重启交接要覆盖“新进程先启动、旧 owner 后退出、租约稍后过期”的顺序；只有单进程正常启动测试会漏掉该故障。
- 诊断尽量只读；测试幂等与退出处理不需要发送真实群消息，不能把本地回归当成历史漏发已补偿。

历史证据指针：SLS 项目 `k8s-log-c7c0ede6c71484f8da34a829954c50cd9`、Logstore `vidmuse-admin`。部署窗口 2026-09-12 17:40–18:10 完整扫描 7,299 条，其中 192 条启动/owner 事件存于本机 `/private/tmp/brief-rollout-owner-events-20260912.json`；摘要 `/private/tmp/brief-weekend-investigation-20260914.md`。临时文件可能失效，应以绝对时间和日志源重新定位，不在知识库复制凭据或完整日志。


## 2026-09-14 11:36：旧版本重启后自动补跑成功

用户提供的群卡片截图显示一张日期为 2026-09-13 的日报，统计窗口为 2026-09-13 10:00 至 2026-09-14 10:00，包含 2 条入库记录、1 个模型归并后的主要问题。随后读取北京时间 2026-09-14 11:16–11:37 的完整原始 SLS 日志 4,466 条，获得 5 条相关事件：

- 11:35:41，Pod `prod-vidmuse-admin-deployment-c5956c946-rc9hp` 在 `app.startup_event:572` 记录日报 scheduled；11:35:46 记录 `worker_started`，轮询 60 秒、发送时间 10:00。
- 11:36:02，`anthropic/claude-sonnet-4.6` 综合成功，耗时 11,959 毫秒、模型调用 1 次。
- 11:36:03，`_run_daily_brief_tick` 记录 `event=sent send_day=2026-09-14 incident_count=2`。

上述事件均来自旧镜像 `432ac72280abfc21d1554cff2091efec97acf3a1`，仍是全局 owner 门禁内启动日报的版本。该链路是新 Pod 启动后发现当日已过 10:00，由定时循环自动补跑；发送来源为 `_run_daily_brief_tick`，不是人工 API 或 `send_preview`。它证明这一次旧版本恢复了循环并发送成功，不能当作 PR #878 新交接机制已部署验收的证据。

[PR #878](https://github.com/world-sim-dev/vidmuse-admin/pull/878) 已于 2026-09-14 11:17:40 合并，merge commit `412e4be3`。对应[部署工作流 34803091343](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/34803091343) 在 11:34:57 启动；完成状态、新 Pod 镜像与新代码启动日志应到该运行和生产现场重新核验，不从这张旧镜像发送的卡片推断。

**Why:** 定时判断是“当前时间不早于发送时间且当天领取成功”，并非只在 10:00 整点执行。一次真实卡片到达可以由旧版本的重新启动解释；若不关联 Pod、镜像和实际调用栈，会把补跑成功误记为新修复已验证。

**How to apply:** 先用 `sent` 日志定位具体 Pod 与镜像，再对照合并与 rollout 时间。分别记录卡片到达、该次发送来源、新代码部署与下一次交接验证；不因已收到卡片而省略后续接班场景。

### 两条记录、一个主要问题、一张卡片的口径

- `MonitoringIncidentQueryService.get_brief_evidence` 统计窗口内 firing outbox 的 `create_time` 所关联的 incident，或 incident 自身 `create_time` 位于窗口内的记录。`total` 在 limit 前计数；默认上限 2,000，读取截断时 `truncated` 会阻止发送。因此此次 2 条不是代码固定只采样两条，也不是模型从全群告警任取两条；未入库或不在该窗口口径内的告警不在此计数中。
- `MonitoringDailyBriefReportService.send_report` 每次调用只发送一张汇总卡；卡片张数不等于事故数。主要问题数则来自模型归并，不能拿一个模型类目证明来源属于同一事故。
- 本次截图 A001 为 1,200 秒后仍 pending、最终业务状态未知；A002 为约 300 秒单次 ReadTimeout，随后任务 succeed。正文保留了这个边界，但放进同一主要问题仍显得过粗；本轮仅定位和解释该分组问题，尚未为此新增业务代码修复。
- 卡片底部“问题处置”计数来自全局 `record_status=active`、`problem_kind=canonical` 的 `status_counts`，不限定本次日报窗口，不能与“入库记录 2”直接核对为同一组统计。

实现指针为 Admin `apps/admin/service/monitoring_daily_brief_report.py` 的 `build_report`、`send_report`、`_run_daily_brief_tick`，`apps/admin/service/monitoring_incident_query.py` 的 `get_brief_evidence` 及 `apps/admin/config.py` 的 `MONITORING_DAILY_BRIEF_MAX_INCIDENTS`。本机摘录 `/private/tmp/brief-send-events-20260914.json`；临时文件可能失效，可按上述 SLS 源和绝对窗口重取。此轮仅核验生产日志与用户截图，没有人工触发发送或修改部署。
