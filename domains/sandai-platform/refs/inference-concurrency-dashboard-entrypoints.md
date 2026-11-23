---
name: sandai-inference-concurrency-dashboard-entrypoints
type: reference
created: 2026-11-23
updated: 2026-11-23
tags: [sandai, inference, grafana, concurrency, prometheus]
links: [sandai-api-platform-openapi-quota-entrypoints]
---

# Inference 并发资源看板查证入口

**Why:** 开放平台并发管理要同时看可用推理资源、最长等待、已派发任务和租户配额。2026-11-23 用户要求新增看板，并明确要求取数不能给生产数据库带来较大压力，业务数据保持无损。

## 查证入口

- [Inference / 06-并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086)：通过面板查询和实时样本核对当前口径。Worker 查 Athena 的就绪及在线信号和 Worker ID 去重。Longest time P95 查推理队列最长等待的有效时序样本、各来源采集成功和所选时间范围。
- [开放平台业务大盘](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-business-v1)：查看 Zeus 任务快照的 leader、更新时间和阶段标签。代码入口为 `TaskSnapshotReader` 与 `TaskLifecycleStage`。执行阶段可估计在途任务，精确派发占用沿 `TaskDispatchStateService` 的 `SUBMITTED` 到 `FINISHED` 边界核对，包括可能晚于用户可见终态的下游停止确认。
- [OpenAPI 配额入口](openapi-quota-entrypoints.md)：查组织有效覆盖和 Redis 默认值。逐用户预估先核对预估来源及用户与组织的映射。组织 Top 5 使用同一时点的已派发在途数量。

**How to apply:** 先回读目标 Grafana 文件夹的有效权限和看板已保存的数据源。对候选数据库查询只执行元数据查询和不执行语句的 EXPLAIN，核对是否为只读副本、语句超时、访问路径和预计扫描量。2026-11-23 Athena 数据源状态和查询计划不足以支撑看板常驻查询，因此保留 Prometheus 刷新。新增配额或组织维度时，沿专用快照采集入口评估一次采集复用、限时限量和采集陈旧状态。Worker 零值或分子缺失时，超售比留空。

## 2026-11-23 并发快照和分阶段耗时

- 最长队列等待先对照相同时间范围内的队列积压。采集端返回成功且等待值全为 0 仍可能漏掉实际积压的年龄。打开 06 的 PromQL，分别核对有效分钟样本数、等待值峰值和队列待处理数。积压存在且等待始终为 0 时，把等待计时当成缺失，沿推理队列 exporter 的年龄解析和标签覆盖继续排查。
- 按用户确认的口径，预计并发取正常开放平台用户所属有效组织的并发配额。继承值从 Redis 全局默认一次读取。有重复有效组织无法判唯一归属时停止更新这一快照。
- 精确在途沿 Zeus `TaskDispatchMapper.submittedPage` 的覆盖索引获取已确认派发的任务和组织。Athena 使用带 group 的请求 ID 批查确认 pending/running，再由同份结果算总量和 Top 5。复查 [Athena 作业批查](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/controllers/job.py) 和 jobs 的复合唯一索引。整批缺记录、状态未知、超时或达到读数上限时，沿快照采集日志和 Prometheus 时间戳判不可用。检查对应部署及监控开关的在线状态。
- 06 的「分阶段耗时 · 完整链路」包含国内实时 Zeus 直方图，以及[五日原表](https://j0yswlgboxz.feishu.cn/docx/H8TMdJsI6oBefWxuWRLcxXvBnHh)的固定基线。基线用逐任务配对计算 Athena 排队和模型子阶段。实时 Zeus 完成耗时起点是建单。后处理可对照原表的 Worker 上报到公开总间隔，独立水印或审核耗时需再核对各自的计时字段和覆盖。
