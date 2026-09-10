---
name: monitoring-problem-title-vs-incident-report
type: pitfall
created: 2026-09-10
updated: 2026-09-10
tags: [vidmuse, admin, monitoring, clustering]
links: [monitoring-dashboard-window-and-day-semantics]
---

# 报警汇总先核对当次报告，不能直接沿用 Problem 标题

**Why:** 2026-09-10 生产 Admin 只读预览发现，当次 Incident 调查内容与关联历史 Problem 的代表标题不一致。2026-09-09 22:09:53 的业务告警报告指向 Kie/Suno 音频任务失败，却关联 Gemini 图像生成 Problem；22:26:13 严重告警同样指向 Kie 音频失败，却关联超长文件名上传 Problem。此观察仅证明页面关联与报告不一致，未定位聚类实现根因。

**How to apply:** 从生产 `/playground/admin/monitoring-incidents?view=alerts` 按首次触发时间读取当次详情，分别核对调查结论、记录级事实、影响判断、仍需补证及 Problem。原始列表的报警/恢复记录不能当独立故障计数；“已有可用结论”也不等于根因证明通过，应保留“证据不足”或 `runtime_evidence_invalid`。发送摘要前以当次报告为依据，不把历史 Problem 标题里的供应商、错误码或恢复结果套到本次。

## 追溯指针

- 生产 UI：`https://prod-vidmuse-admin.vidmuse.ai/playground/admin/monitoring-incidents`
- 22:09 报告 Agent Thread：`thr_01M239TNMMT3RBCZDDYA22MMDR`。
- 22:26 报告 Agent Thread：`thr_01M2391RXAEEGF7AA2E7QV6TJ5`。
- 代码入口：`playground/src/pages/MonitoringIncidentPage.tsx` 原始列表与详情、`playground/src/pages/monitoring-incidents/MonitoringProblemBoard.tsx` 问题标题、`apps/admin/service/monitoring_incident_query.py` 查询投影。变动后重新核验，不沿用当日数量或状态。
