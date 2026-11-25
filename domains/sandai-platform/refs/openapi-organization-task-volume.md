---
name: openapi-organization-task-volume
type: reference
created: 2026-11-25
updated: 2026-11-25
tags: [sandai-platform, grafana, sls, openapi, organization]
links: [inference-concurrency-dashboard-entrypoints, development-entrypoints]
---

# 开放平台组织任务量看板查证

- [组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be)位于「sandai 开放平台」。入口、组织和粒度的实际配置以已保存面板为准。
- [Inference 并发资源看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency)提供生产双区的非终态快照，可用作同一结束时点的对照。

**Why:** 组织完成量按首次公开终态时刻计量。终态日志没有组织时，按任务 ID 关联创建请求受理事件的组织，保留任务创建时的归属。快照 Top 5 无法恢复全部组织的历史在途。日志推算会受关联覆盖、采集延迟和任务年龄边界影响。

**How to apply:** 从已保存查询核对国内 `message` 与美西 `content` 的已索引字段、受理路由、首次终态、时区及分桶。SLS 跨越看板起点的取数范围用 `__time__` 约束，并检查完整性和延迟。逐组织算数量时保留未记录的组织分类，核对成功、失败、取消之和等于完成，时段完成之和等于组织汇总，最后一个分桶的在途值等于期末在途。各时点的在途以过去 48 小时创建并仍未匹配公开终态的任务推算。用同一截止时间重新核对快照和日志历史覆盖。Grafana 现有 MySQL 连接的默认库与主从及索引状态须重新确认，避免将查询持续打到生产业务库。
