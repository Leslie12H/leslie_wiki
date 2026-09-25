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
