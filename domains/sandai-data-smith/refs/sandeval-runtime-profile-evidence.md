---
name: sandeval-runtime-profile-evidence
type: reference
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, performance, runtime, prometheus]
links: [sandeval-api-observability, sandeval-sql-lock-diagnosis]
---

# Sand Eval CPU、事件循环与恢复取证入口

**Why:** 长客户端 SQL span 不能区分网络、解码、调度与数据库计算；旧集群历史和新集群当前的 CPU 指标不能混作发布因果证据。

**How to apply:** 固定时间窗和部署 digest，先核实 live `app/infra/performance.py::sample_runtime` 是否存在及真实 interval，再用该进程的 runtime_sample 关联 loop_lag_ms、process_id、连接池和当前 inflight。没有 Python 栈时只报告调度延迟存在，不断言哪个方法占用 CPU。

- 2026-09-25 证据入口：[CPU、SET 与恢复报告](/Users/leslie/Documents/Playground/sandeval-cpu-evidence-20260925/report.md)。原始窗口、Pod、PID、分位数及 attempts 仅保存在报告，使用前重新采集。
- CFS 口径：用同窗 `increase(container_cpu_cfs_throttled_periods_total) / increase(container_cpu_cfs_periods_total)`；全局先各自求和再相除。比例表示受限周期占比，不是损失 CPU 时间占比。新建 Pod 首个可见点后的首尾差会漏掉启动段；窗口经历发布时累计 Pod 数不等于同时存活数。
- 当前与历史位置：从 infra skill 重新发现 ACK/SLS/Prometheus；旧集群缩容后仍可读历史 Prometheus，不用新 Pod 的 cpu.stat 倒推历史。ARMS Prometheus V2 使用 BasicAuth 时只向经验证的 HTTPS 官方端点发凭据；GetPrometheusInstance 返回 HTTP 地址不能直接携带凭据调用。
- Python profiler：先检查目标 worker 的 PID、容器 capability 与 ptrace_scope；权限拒绝不能写成成功采样。单独 exec 新 Python 的 sleep 不是 Web worker 的事件循环指标。已有 runtime 采样可补充证据，但低频最大值不是整个窗口的最大延迟。
- 会话往返：核对 `app/infra/holo.py::_create_pool/_setup_connection` 中 startup GUC 与每次借连接的重复 SET。移除重复 OFF 前必须检查 `quality/infrastructure/persistence/unit_of_work.py` 及 `app/repositories/material_metadata.py` 中 ON 的生命周期、异常和取消后恢复/弃连接；不是机械地移到 init。
- 后台进程：将 `/proc` 的 uvicorn 子进程、SLS process_id 与部署 `quality/api/router.py::lifespan`、`quality/infrastructure/runtime.py::_recover` 对齐。注册恢复循环数不等于瞬时忙执行数。检查 `review_advancement_repository.py::pending` 的 claim/租约与 `advancement_service.py::after_submit` 的 CAS 时机，区分重复读取和重复写回。

- 当前接口优先级的证据入口：[2026-09-25 API 排名与 trace](/Users/leslie/Documents/Playground/sandeval-api-priorities-20260925-1135/report.md)。易变的请求量、耗时、错误数和版本只存于报告，复用时固定新窗口重新查询。
- 排名方法：成功分位数之外同时看取消请求、应用 DB 调用量和客户端离开后的继续执行；以 request_id 对齐 Nginx 与应用结束日志。上游未提供 route header 时，结构化 Nginx 可能为 unmatched，单筛 `/api/` route 会漏掉 499，需要原始 request path 补齐。客户端 499 不等同服务器 60 秒超时。
- 恢复接口诊断：用 allocation_submission / allocation_assignment / allocation_progress 的单批阶段定位成本，检查是否跳过已完成批次，以及预算是在每批前还是每批后检查；不要因为 resume 慢就断言所有批次重做。批内 QualityError 可能被记录成业务状态而外层 HTTP 200，须读取阶段 outcome。
- acquire 的 setup 也在 pool_wait 计时内；将 SET 子 span 与 acquire 关联，避免重复相加或误判为纯连接排队。并发子分支的客户端耗时累计大于根请求时长是可能的，不能直接换算成耗时占比。

- 三接口深查入口：[2026-09-25 leader/tasks、resume、leader/progress 的完整 trace 与源码对照](/Users/leslie/Documents/Playground/sandeval-three-api-evidence-20260925/report.md)。检查 live 列表中 `include_progress or has_status` 的触发条件；有状态筛选时不展示进度也可能展开候选来源。明确记录 query 参数，不能仅按 route 混算。
- 来源清单分页：核查 `SubmissionService.check_completeness` → `AnnotationSourceClient.list_required_work_items` → `TaskAssignmentService.list_work_item_manifest` 是否先重建完整成员再切页。分页 API 不保证数据库分页；同一请求的两次完整校验可能将整包读取乘以页数。改为复用固定版本成员时仍需保持来源版本、权限及最新报告校验。
- SLS 索引与原始日志：本次 SQL 查询 content 仅返回 2,048 字符而原始检索有完整 summary。长 JSON 缺少尾部阶段时，先检查原始日志，不把索引截断当成埋点缺失；数据库/Redis span 分开统计，ARMS 分页取尽后才标 complete。

- 发布效果对比入口：[2026-09-25 四接口前后全量调用与同包 trace](/Users/leslie/Documents/Playground/sandeval-four-after-release-20260925-1515/report.md)。先以发布流程最后一次 rollout/health 校验和实际配置确定完成边界；同一 digest 仍可能因功能开关再滚动，不能把首个新 Pod 的请求时间当全量发布完成。
- 后台化的测量边界：核查 `ReviewService._detach_advancement` 的 Context 隔离；HTTP 延迟和前台 db_calls 下降不证明整包总工作量同比下降。读取对应持久化 advancement 的状态、attempts 与时间，区分正式报告成功、待派单完成和前置条件未齐的 blocked。前后比较同时保留成功分位数、499、样本量和同包/同 allocation 对照；历史最慢时段不能代替紧邻发布的基线。

- 新版热点与中断取证入口：[2026-09-25 发布后慢接口、完整 trace、阶段及运行栈](/Users/leslie/Documents/Playground/sandeval-current-slow-20260925-1545/report.md)。对批量分配区分响应头到达、流结束和单包业务结果；HTTP 200 后仍要检查 `allocation_progress` / `step` 的 outcome 及持久化批次完成引用。并行批次最后写同一 allocation 时，检查 CAS 合并/重试边界，不能用整批重放掩盖进度写回失败。
- loop_stall 深查：读取未截断的原始日志，保留叶函数和业务调用栈，用 Pod、时间区间和路由链缩小归属；构图/最大流阻塞 Web 事件循环与 SQL 客户端耗时是不同证据。候选页展开多个来源的查询次数也不等于不同包数量，须分清按包一次的昂贵统计与同包重复扫描。

- 整改工作台、发布与派题入口：[2026-09-25 三接口逐请求诊断](/Users/leslie/Documents/Playground/output/three-api-latency-20260925/report.md)。具体请求、版本、分段耗时、完整 ARMS 分页和原始阻塞栈放在报告，复用时重新固定窗口。旧版本工作台与新版发布/派题样本不能混作同版性能基线；不同整改任务或没有 preview 的请求也不能充当同场景优化证明。
- 发布受理：从 `app/services/facts/dispatch_publish_confirmation.py::confirm_publish` 追踪 `guard_publish` 与 `context` 的同步查询，再区分返回 202 前的范围核查和 worker 后台执行。定位昂贵 SQL 后还需实际执行计划，不能仅凭查询文字推断缺索引。
- 派题规模：用 assignment_insert 的 rows 与 chunk 数确认实际答题卡数，再分别统计身份保护、波次和回读；按 `app/services/facts/assignment_planning.py::plan_split` 的具体调用栈关联构图/最大流。保留精确份额与去重约束，不能把取消保护校验当作性能优化。
