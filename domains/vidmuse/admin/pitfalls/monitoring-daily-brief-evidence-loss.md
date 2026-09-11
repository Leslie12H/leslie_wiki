---
name: monitoring-daily-brief-evidence-loss
type: pitfall
created: 2026-09-10
updated: 2026-09-11
tags: [vidmuse, admin, monitoring, daily-brief]
links: [monitoring-problem-title-vs-incident-report]
---

# 日报质量要沿证据输入、综合、渲染与发送链路排查

**Why:** 2026-09-10 对照详尽人工告警总结排查 Admin 代码时，发现问题不只在提示词：摘要字段裁剪、首批记录采样、Top N 展示及模型异常静默降级都会丢失独立故障、影响边界和原始引用。HTTP 200 只证明预览接口返回，不证明智能研判执行成功。不要把未确认的模型配置或 Provider 故障当成生产静默降级的已知根因。

**How to apply:** 使用固定带时区窗口；核对实际加载记录与完整报告；让模型引用真实事故并检查全量覆盖；原始链接与记录计数由程序生成；分别展示请求终态、告警恢复、证据缺口和全量处置统计。源数据没有的日志或群消息不能靠提示词补齐。上线前用真实同窗数据逐项验收，契约测试通过不能替代语义验收。

## 代码与验证指针

- Admin 仓库 `apps/admin/service/monitoring_daily_brief_report.py`：综合、生成诊断、预览与发送边界。
- 分支 `codex/monitoring-brief-quality-20260910` 的 `apps/admin/service/monitoring_brief_evidence.py`：证据净化、来源引用和覆盖契约；`monitoring_incident_query.py` 的 `get_brief_evidence`：firing 窗口批量读取。应确认分支是否已合入，不能当成已部署状态。
- 同分支 `docs/monitoring-daily-brief-quality.md`：时间窗口、七类语义验收目标及已验证边界。
- `POST /admin/api/v1/monitoring/incidents/daily-brief/preview` 只预览；不要用 send 代替。重新核对当前版本参数与诊断字段。
- [历史 Problem 标题与当次报告](monitoring-problem-title-vs-incident-report.md)。

## 发送身份与群成员不一致

**Why:** 2026-09-11 的生产诊断返回 HTTP 400 / `230002`。截图里有抓虫机器人，但实际 token 对应通用后台机器人；专用 App ID 未配置导致客户端回退。仅看显示名称或 HTTP 状态会误判为未入群、卡片过长。

**How to apply:** 对照 Admin `service/feishu_bug_bot/clients.py` 的实际凭据选择，读取所选 App ID 与 `/bot/v3/info/` 返回身份，再核对目标群。专用 App ID 与 Secret 应成对配置。不要打印 Secret/token；先保留业务错误码再决定是否重试。卡片正文长度与整卡字节预算是独立校验，来源折叠只改善展示。当前配置、代码和发布状态到 Admin `docs/monitoring-daily-brief-quality.md` 及生产现场核验，不从历史快照推断。
