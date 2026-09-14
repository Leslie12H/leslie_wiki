---
name: monitoring-daily-brief-startup-handoff
type: pitfall
created: 2026-09-14
updated: 2026-09-14
tags: [vidmuse, admin, monitoring, daily-brief, scheduler, deployment]
links: [monitoring-daily-brief-evidence-loss, admin-scheduled-report-mechanisms]
---

# 滚动部署成功不证明日报调度循环仍在运行

**Why:** 2026-09-14 只读核验确认，Admin `app.py` 在 startup 仅尝试一次全局后台 owner 锁；新进程发现旧 owner 后永久跳过，没有后续接管循环。滚动部署时旧进程随后退出，即使租约稍后过期，新进程也不会自动启动日报。开关启用、Pod Running 和 rollout success 均不足以证明每日 10:00 会执行。

## 已核验的历史链路

以下均为北京时间，不能用来推断未来部署状态。

- 2026-09-12 10:00 的旧故障是模型返回格式无效，见[证据与 JSON 排查](monitoring-daily-brief-evidence-loss.md)。PR #875 在当日 13:26 合并、14:08 首次部署，不能修复此前已经失败的执行。
- 2026-09-12 17:46:26 旧 Pod 取得全局后台锁，17:46:30 启动日报循环；17:48:17 新 Pod 的三个进程均因旧 owner 存在而跳过。
- 2026-09-12 17:48:34 旧 owner Pod 的应用进程全部退出；17:48:56 第二个新 Pod 的三个进程仍见旧租约而跳过。当次新镜像为 `432ac72280abfc21d1554cff2091efec97acf3a1`，已含 PR #875。
- 2026-09-13、2026-09-14 09:59–10:30 分别完整读取 3,834、4,611 条原始日志，没有日报或 Bedrock 请求事件。结合启动链路和代码，定位为循环缺失；不是同一时间的模型超时或飞书发送失败。

## 修复与验证指针

[Admin PR #878](https://github.com/world-sim-dev/vidmuse-admin/pull/878)，日报修复提交 `5cb06cddcf2722a0a8280ca5165e0f807d8d042d`：将日报循环移出全局后台 owner 门禁，每进程启动并保存任务句柄，shutdown 取消且等待。实际生成仍由 Redis 日级 SET NX 领取控制，保留执行租约、成功 guard 和飞书日级幂等键。其他全局后台任务的 owner 接管不在本次修复范围。

截至本次核验，91 项相关测试、静态检查已通过；PR 已提交，未据此执行生产部署或补发。当前合并、发布与群卡片状态到 PR 和生产现场重新核对。

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
