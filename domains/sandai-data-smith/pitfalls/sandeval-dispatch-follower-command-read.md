---
name: sandeval-dispatch-follower-command-read
type: pitfall
created: 2026-10-13
updated: 2026-10-13
tags: [sandai-data-smith, sandeval, dispatch, hologres, read-after-write]
links: [sandeval-sql-lock-diagnosis]
---

# Sand Eval 主任务发布与 Follower 误报不存在

**Why:** 创建成功、发布受理、题目包冻结、供应商批次创建与页面读取是不同步骤。若保存或冻结在 Leader 提交，而下一步的归属检查、命令准备或回执读取使用 Follower，副本延迟会把已存在对象误判为不存在；页面也可能继续显示旧失败。只把最终写连接切到 Leader，不能修正到达该连接前已经拒绝的外层检查。

**How to apply:** 先固定 master_id、operation_id、素材来源、北京时间窗口与部署 SHA；使用当前生产应用凭据和只读 guard，对同一主任务、题目包、成员及操作回执分别读取 Leader/Follower。只读复现 get 与归属 guard，不调用真实发布或重试。失败历史应对照当时镜像对应代码；当前页面状态、业务回执和个人派题分别核验。授权、版本与命令判断以及写后确认应显式读取 Leader，不能用延时、刷新页面或重新创建任务代替。副本滞后为何持续，需要数据库复制与资源指标，业务行对照不能证明 CPU、锁或具体上游负载归因。

## 核验指针

- 2026-10-13 两个主任务的脱敏读数、阶段 trace、部署 SHA、跨 Pod 只读复现及未确认事项：[本次证据](/Users/leslie/Documents/Playground/sandeval-dispatch-20261013/evidence.json)。这是固定日期的调查证据，不代表未来运行状态；本次没有执行生产恢复、写入或部署。
- 线上发布路由：`sand-eval/platform/backend/app/api/dispatch_masters.py::publish`。核对进入 `confirm_publish` 前的 `require_master_actor(svc.holo, ...)` 是否仍通过默认池读取。
- 主任务归属与详情：`app/repositories/dispatch_permissions.py::require_master_actor`、`app/repositories/dispatch_masters.py::get`。
- 批次备题后准备：`app/services/facts/dispatch_masters.py::publish` 向 `prepare_task_from_question_set` 传递哪个 Holo；`task_from_question_set.py::plan_task_from_question_set` 的 SET_SQL 和成员读取走哪个池。
- 回执与步骤：`app/repositories/task_operations.py::step`、`get`；区分步骤自身 Leader 回执检查与其 prepare 回调的实际连接。
- 连接语义：仓内 `sand-eval/docs/operations/holo-compute-group-isolation.md` 与 `app/infra/holo.py`；环境配置和连接实现均须核对部署镜像。
- 当前基础设施与日志入口：[SQL 与锁诊断指针](../refs/sandeval-sql-lock-diagnosis.md)。


## Git 历史核验（2026-10-13）

**Why:** 最新行的 blame 可能落在 merge 或音频参数调整，不能据此把准备回调的默认池读取归因于那次 merge；生产副本积压的触发时间也不能当作代码首次引入时间。

**How to apply:** 对当次部署 SHA 沿 `git log -S` 追踪回调与权限调用，检查首次改动的父子 diff，再在 main 的 first-parent 历史找第一个包含原提交的合并点，并验证其前一 main 父提交不包含。main 合入、生产部署、故障首次触发分开报告。

- 发布前创建人检查的原始引入：提交 [`a39cdd335`](https://github.com/world-sim-dev/sandai-data-smith/commit/a39cdd335ad4b39f59e3ab11642d7b34f21b3aa8)，经 [PR #1173](https://github.com/world-sim-dev/sandai-data-smith/pull/1173) 于 2026-09-16 00:12:25（Asia/Shanghai）进入 main。检查调用和 helper 的默认池读取一起核对。
- 备题后任务准备移到写步骤之前、传入 `self.holo`：提交 [`463ff41bf`](https://github.com/world-sim-dev/sandai-data-smith/commit/463ff41bf4a815f75b49ac36d91c0fc559bf7cca)，经 [PR #1160](https://github.com/world-sim-dev/sandai-data-smith/pull/1160) 于 2026-09-16 18:06:11 进入 main。更早版本在创建步骤中使用控制连接上的 BoundHolo；`212cae03` 和 `c5e503bc` 是后续回调形式及合并调整，不能替代原始引入点。
- 发布路径外层检查在 PR 内重新加入的指针：[PR #1892](https://github.com/world-sim-dev/sandai-data-smith/pull/1892)，2026-09-25 12:15:16 合入 main；`fc4a8c40` 先将正式确认移至 Leader，随后 [`0ca5cd387`](https://github.com/world-sim-dev/sandai-data-smith/commit/0ca5cd3870132e742ba4ce8fd47693c9457b7c27) 在进入该函数前重新加回默认池归属检查。上一 main 版本也有默认池检查；这里是 PR 内提交的回归，不代表生产曾修复后再次回归。
- 背景配置指针：[PR #440](https://github.com/world-sim-dev/sandai-data-smith/pull/440) 于 2026-08-14 10:57:31 合入 main，将主池指向 sand_eval。读写分离配置早于上述缺口；生产实际生效时间不能只从 merge 时间推出。
- Git 证据和时间边界已加入上面的本次证据 JSON。历史生产上线时间及本次副本积压的开始时间尚未核实。
