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

## 组织名称和下拉筛选

2026-11-25 在同一看板接入组织名称。组织下拉仍按所选入口与时间窗口从 SLS 获取组织 ID，使用「Zeus Admin 显示名 · ID」供搜索，提交给任务 SQL 的筛选值仍是 ID。组织表与下拉用同一份按入口和组织 ID 建键的名称映射。后台个人组织的显示名沿用脱敏值。

名称映射是对有任务的组织从 [Zeus Admin 组织目录](https://zeus-admin.sandaii.cn/organizations)作的点查快照，和日志取数独立。回读看板中隐藏的 `org_names` 常量可核对采集时间。组织改名或新增组织需回查后台并更新映射，名称没有覆盖时下拉仍支持按 ID 筛选。验收用同一固定窗口核对名称和 ID 搜索是否定位同一值，并逐行对比增加名称前后的任务量。

## 组织认证状态取数

2026-11-25 在 Zeus Admin 国内、海外生产各核验一条组织记录。组织列表支持按组织 ID 点查，`certifications` 提供个人实名、企业四要素的可用与通过标志。详情的 `/organizations/{orgId}/certifications` 还提供企业对公账户认证状态。沿 Zeus 的 `AdminOrganizationCertifications` 核对当前代码，认证记录归属于组织所有者。企业四要素和对公认证分开读取。

**How to apply:** 组织状态（如 ACTIVE）与认证分别取值。按入口和组织 ID 关联看板，区分通过、未通过和结果不可用，仅同步状态字段。查询别名时先用已授权目录候选确认身份。目录的精确查询按 ID、完整邮箱或手机号匹配，脱敏显示名可能省略账号前缀，不能据别名未匹配判断没有认证。复核入口见 [Zeus Admin 组织目录](https://zeus-admin.sandaii.cn/organizations)。

## 认证快照与成功率展示

2026-11-25 更新 [组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be)。按入口和组织 ID 关联组织所有者的个人实名、企业四要素和对公认证。回读隐藏的 `org_certifications` 变量和表格上方的北京时间，确认认证快照覆盖与新鲜度。任务量随所选时间变化，认证展示采集时的状态。只记录状态，判断已通过优先看有效通过标志，其次用最近记录区分待完成、处理中、未通过和未认证。快照未覆盖与数据不可用各自显示。

成功率为成功任务量除以完成任务量，完成含成功、失败和取消。零完成量显示空缺。验收固定时间窗口的双区逐组织的原始计数、成功率和状态，切换单组织检查表与概览卡同值。新组织或认证变更沿上节的 Admin 查证入口补齐。
