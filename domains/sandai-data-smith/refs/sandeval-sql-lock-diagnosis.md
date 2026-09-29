---
name: sandeval-sql-lock-diagnosis
type: reference
created: 2026-09-17
updated: 2026-09-29
tags: [sandai-data-smith, sandeval, hologres, sls, sql, locks]
links: []
---

# Sand Eval SQL 与锁诊断入口

**Why:** 2026-09-17 排查确认，单搜 slow SQL、deadlock、lock wait 会漏掉真正的慢 SQL 与锁获取失败；应用事务阶段计时和数据库异常原文需要共同核验。

**How to apply:** 固定北京时间窗口，先从当前 ACK 生产 Deployment 和 SLS 项目核对集群及日志库，再区分 Sandworm 与 Eval、生产与开发 Pod 前缀；只统计 transaction_trace 的 finish 事件，并区分 SQL、加锁、连接池和写入准入阶段。日志行、trace、独立请求不能混算。

## 指针

- 全局访问技能：`~/.codex/skills/sdh-infra-access/SKILL.md`。用操作者自己的授权配置；技能中的历史部署和采集映射须现查。
- Eval 日志（2026-09-25 核验）：[sandeval-prod](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/sandeval-prod?slsRegion=cn-shanghai)，过滤 namespace=sandworm、pod=sandeval*、container=app；开发环境单列。集群或采集规则再迁移时重新发现项目与 Logstore。
- Eval API 看板（2026-09-25 重建）：[上海新集群](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/dashboard/dashboard-1790304848380-487363?slsRegion=cn-shanghai)。旧看板仍指向旧项目，历史数据不能证明当前采集正常。
- Sandworm 日志：先在当前集群对应 SLS 项目核对 Logstore，不能沿用迁移前的 [旧 sandworm 库](https://sls.console.aliyun.com/lognext/project/k8s-log-c7a4a4cf4049c494ca6dea4aaf1e7f9b9/logsearch/sandworm?slsRegion=cn-shanghai)。状态 updated_at 冲突不能当数据库锁证据。
- 数据库：[Hologres实例控制台](https://hologram.console.aliyun.com/cn-shanghai/instance/hgprecn-cn-y1i3x6u00004/info)，进入HoloWeb核对历史慢Query及阻塞会话。控制台可见不等于数据库可登录。
- 2026-09-17固定窗口证据、SQL指纹、代表性trace及复查查询：`/Users/leslie/Documents/Playground/output/sdh-log-audit-20260917.md`。该文件是历史核验，不代表当前健康状态。

## 证据解释

- Hologres锁获取失败可能写为 `Cannot acquire lock in time`，异常类别可能是 `InternalServerError / XX000`；不能只搜Deadlock或LockNotAvailable。
- 解析content中的transaction_trace JSON。`phase=sql`的`elapsed_ms`是应用观测的SQL调用耗时；`business_phase`可进一步区分submission_task_lock、submission_assignment_lock等路径。名称只用于定位，数据库锁异常原文和阻塞信息才证明锁行为。
- statement timeout、用户请求取消、锁获取超时需要分别统计，不能仅凭QueryCanceledError混为一种错误。
- 把长事务、加锁耗时、连接池耗尽串成因果链前，必须关联持锁owner、等待者、SQL及时间窗；Ready和重启次数只说明容器状态。

## 多进程恢复与取连接计时（2026-09-22）

**Why:** 后台恢复在每个 Web worker 启动，若仅在完成后用 CAS 合并结果，不能阻止执行阶段重复消耗资源。日志里的取连接阶段也可能覆盖 asyncpg setup，不等于纯队列等待。

**How to apply:** 关联同一 allocation_id、不同 trace_id、Pod 和重叠时间，检查恢复前是否有跨进程认领与续租；再用 server_pid、连接池路由和来源读取路径核验是否与在线请求共用连接。不要把分配全程耗时当作单条连接持有时长，也不要把有界日志样本比例当全站负载比例。

- 代码入口（须核对部署版本）：`sand-eval/platform/backend/quality/infrastructure/runtime.py` 的 start/_recover，`quality/application/management/batch_allocation_service.py` 的 recover/_resume，以及 `quality/infrastructure/persistence/batch_allocation_repository.py` 的 pending。
- 来源取数与批量粒度：`quality/application/management/submission_content_service.py`、`app/services/facts/qc_verdict.py` 的 read_response_versions。
- 计时边界：`app/infra/holo.py` 的 _pool_connection、_setup_connection 和主池/控制池路由。需要单独分解 queue/setup 才能量化纯排队占比。
- 2026-09-22 本次诊断确认同一分配多路恢复及共享连接；停止重复工作后的恢复幅度尚未验证，不能视为全站慢请求的唯一原因。

## QPS、重扫描与写入等待分开归因（2026-09-28）

**Why:** 请求最多、累计 SQL CPU 最高、用户等待最长可能来自三条不同链路；后台汇总还可能在业务流量上涨前就维持高成本。只看慢查询耗时或 HTTP QPS 会错排优化优先级。

**How to apply:** 固定北京时间窗口，以 SLS 按 route 统计请求和每请求 DB 调用，以 ARMS 的 db.name 分计算组，再对 Hologres query log 按 digest/application_name 排 calls、CPU、读取量和分段耗时。使用 sum(calls) 及 sum(cpu_time_ms * calls)，识别聚合记录、NULL 指标和当前账号的可见性；查询日志 CPU 份额不等于整个计算组物理 CPU 份额。

- 固定窗口证据：[2026-09-28 QPS 与数据库压力报告](/Users/leslie/Documents/Playground/output/qps-pressure-20260928/report.md)。小时趋势、部署 SHA、原始 SQL、完整 trace、代表性只读 EXPLAIN 与统计脚本在同目录；复用前重新采集，不把历史数值当作当前状态。
- 单题查询入口：`app/repositories/my_tasks.py::personal_batch_member_for_card`、`ev3_single_card.py::single_card_sql`。检查限制是否贯穿后续 wave/verdict 关联；入口 LIMIT 1、CTE 复用或少量返回行并不保证整个计划是点查。EXPLAIN 的估计 rows 与历史日志 read_rows 要分开陈述，未取得历史计划时不要混称同一次执行。
- 后台计数入口：`quality/application/task_list_summary.py::_facts` → `app/repositories/quality_inspector_batch_metadata.py::inspector_batch_metadata`。这里 required_count / 检查任务 batch_count 表示整批答题卡数，不是人员数。核对 include_counts、scope 粒度和后台 application_name；优化批量/复用时保留题数与一致性语义，不直接关闭统计或迁移强一致读取。
- 后台路径的历史来源：[PR #1779](https://github.com/world-sim-dev/sandai-data-smith/pull/1779) 把该计数接入质检员任务摘要计算；底层函数先由 [#1674](https://github.com/world-sim-dev/sandai-data-smith/pull/1674) 引入，[#1912](https://github.com/world-sim-dev/sandai-data-smith/pull/1912) 后改摘要存储和刷新机制。细节、Git blame 与前端字段用途见 [2026-09-28 来源核验](/Users/leslie/Documents/Playground/output/qps-pressure-20260928/summary-task-origin.md)。区分函数引入、后台接入和调度重构，不能只凭最新修改 PR 归因；SQL 执行次数也不等于不同业务任务数。
- 慢写入口：按 `ev3_response`、`ev3_response_field` INSERT 指纹核验 start_query_cost 与 extended_cost。记录到 lock_trx 长等待能定位阶段，不能单凭字段名判定行锁、死锁、具体持锁者或后台查询造成阻塞；继续需要 owner/waiter 和同窗事务证据。
- 高频通知入口：`frontend/src/components/NotificationBell.tsx`。同时核验刷新间隔和 refreshCount 内的可见性判断；只看 setInterval 会漏掉已有后台跳过逻辑。按请求数和 SQL CPU 分别排序，再决定降频收益。
- SQL 到接口的核验：[六类热点 SQL 入口映射](/Users/leslie/Documents/Playground/output/qps-pressure-20260928/api-map.md)。SQL 指纹是共享查询，不能按业务标签直接当 HTTP 路由；质检修订草稿/历史与普通详情封存快照走不同读取，派发进度既有 actions/refresh 异步入口也有 worker 自动刷新。先沿 router → service → repository 验证，再用 trace 区分请求内执行和后台执行；SQL 次数不直接分摊成接口次数。

## 整体 API p95 尖峰的分层诊断（2026-09-29）

**Why:** 2026-09-29 14:25–14:27、14:30–14:34、14:53–14:54（北京时间）的生产看板出现多次 p95 尖峰。按接口和 Pod 拆分后，轻量接口仍快，题目交互、提交和质检详情的数据库调用耗时却同步上升；四个 Web Pod 同步受影响且部署 SHA 不变。全局分位数不能直接解释为每个接口都慢，也不能仅凭客户端 SQL 计时判定数据库锁或 CPU。

**How to apply:** 先用 [生产 API 看板](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/dashboard/dashboard-1790304848380-487363?slsRegion=cn-shanghai) 固定异常分钟，再在 [生产 SLS 日志库](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/sandeval-prod?slsRegion=cn-shanghai) 按 route、Pod、`deploy_sha`、`db_client_ms`、`pool_wait_ms` 和 `transaction_trace` 阶段分解。该日志库中的 `transaction_trace` 行以字面前缀 `transaction_trace ` 开头，先用 `substr(content,19)` 去掉前缀再调用 `json_extract_scalar`；直接对 `content` 提取 JSON 字段会得到空值。只统计 `event=finish`，按 `http_route` 与 `sql_fingerprint` 核对 SQL 来源。应用计时含驱动、网络及结果读取；服务端执行、锁等待和其他租户负载仍须生产 Hologres `hg_query_log`、实例指标与 owner/waiter 证据。当前 HoloWeb 用户缺少 `pg_read_all_stats`，历史慢 Query 页面不可见；查询返回零行不能解释为没有慢 SQL。代码入口（重新核对部署版本）：`sand-eval/platform/backend/app/repositories/choice_interaction.py` 的 `CHOICE_INTERACTION_BATCH_CONTEXT_SQL`、`CHOICE_INTERACTION_BATCH_WRITE_GUARD_SQL` 和 `authorized_batch_session`；计算组入口见 `sand-eval/platform/k8s/configmap.yaml` 的 `HOLO_CONTROL_COMPUTE_GROUP`。
