---
name: sandeval-cross-request-first-submission-race
type: pitfall
created: 2026-10-17
updated: 2026-10-18
tags: [sand-eval, quality, allocation, submission, concurrency, autocommit]
links: [sandeval-reinspection-command-recovery-barriers, sandeval-correction-evidence-and-deferred-lineage]
---

# 跨请求的同范围首送不能只靠先查后写

**Why:** 请求号只约束同一命令，不能约束两个请求占用同一个业务范围。生产普通 UOW 自动提交；名为 lock 的读取不自动获得行锁。正式父记录延后发布期间，另一个请求仍可能通过版本检查；若主键只区分送审 ID，两条首版都会成功。后续“同一范围存在多个当前正式版本”是读取端发现真实分叉，不能通过任取最新消除。

**How to apply:** 先按来源任务确定质量任务，再比较 scope_key、scope_version、revision_no、previous_submission_id、冻结 work_unit 与答案版本。反查每个分支的质检执行和已保存判断，不按“两个任务”猜成“两个人”。对齐部署 SHA 和原始 SQL 指纹：冻结时间不是 INSERT 完成时间，重点检查另一请求的版本查询是否落在首个 INSERT 未完成窗口。初始分配与正式版本发布都要有按业务身份定义的持久原子占用；仅按请求号幂等、进程锁、按钮防重或任意加长事务不构成充分修复。恢复既有分叉前保留原判断、备注与审计链，冻结精确归并计划再执行。

- 2026-10-17 临科智华反馈的双实例只读状态、人员精确反查、SLS 检查/发布交错、纯内存复现及剩余未知：[根因取证报告](/Users/leslie/Documents/Playground/output/ambiguous-submission-20261017/report.md)。线上对象、处理状态和发布版本只从该报告及原生服务刷新。
- 源码入口：`quality/application/management/batch_allocation_service.py::reserve`、`submission_service.py::_publish_creation/check_revision/_current_batches`、`infrastructure/persistence/submission_repository.py::add`、普通 `unit_of_work.py`。负责人详情的元数据与批次列表并发加载，批次列表失败可使抽屉整体不可读。
- 测试边界：检查 FakeUOW 是否在整个用例外持有全局锁或提供真实环境没有的快照事务。并发 gather 通过不证明覆盖生产检查后、发布前的交错；需要故障点/屏障强制两个业务命令经过该窗口，数据库原子约束另作独立验收。

- 2026-10-17 用户明确要求先单案修复、再修根因。空白重复分支归档及逐对象移除通过原生 operator 执行；首次返回连接中断后，由另一生产实例独立核验保留判断、唯一当前链及负责人批次查询，未盲目重做。冻结计划、完整前像和回读结果见[单案修复验收](/Users/leslie/Documents/Playground/output/ambiguous-submission-20261017/manual-repair-report.md)；代码入口为 `app.cli.duplicate_quality_branch`，[根因修复 PR #2594](https://github.com/world-sim-dev/sandai-data-smith/pull/2594)。合并、CI 与上线状态以远端当前证据为准。

## 2026-10-17 新占用的恢复兼容与归档重试审查

**Why:** 新增的持久占用也是已接受业务事实。只让正式父记录守唯一，却让既有恢复工具继续以“没有父记录、明细、证据”判断从未发布，会漏掉首条写入之前的占用；归档重试若只核对旧对象，也会漏掉后来接受的新命令。同一原单已经前进时，整对象比较还会把正常进度误判为身份漂移。

**How to apply:** 增加 ledger 时逐一审计旧的 partial-publication 判据、管理员最新意图恢复及停写协议，把占用纳入冻结计划与受审计的处置，普通失败不能自行释放。每次归档续跑都要重新检查当前额外引用，并阻止接收新命令与删除之间的竞争；同请求重复发布应核对不可变方案、保留已前进进度。复查 `correction_reservation_recovery.py::RecoveryStore.publication`、`duplicate_quality_branch.py::apply_plan/run` 和 `BatchAllocationRepository.put`；不要以 CI 通过替代这三种故障窗口。

实际方法与 SQLite 的故障复现、审查提交及修复建议见 [PR #2594 审查记录](/Users/leslie/Documents/Playground/output/ambiguous-submission-20261017/review-2594.md)。该记录区分代码可复现窗口与生产已发生事件；当前修复和发布状态沿 PR 刷新。


## 2026-10-18 占用接续与恢复协议

**Why:** 管理员选择最新整改意图时，旧请求可能已占住业务版本、却尚无父记录和明细。恢复不能遗漏该事实，也不能以普通重试为由释放占用。归档删除的旧前像同样不能授权移除后来接受的新命令所引用的对象。

**How to apply:** operator 将完整 ledger 前像纳入冻结摘要，确认停写后，在原范围守卫及版本 CAS 下仅接续选定业务键，保留其他范围和原命令/责任版本回执，并让占用变更与新执行发布在同一事务内回滚。归档续跑检查新引用、原命令和严格删除前缀；停写确认与有界混合 DML 仅用于低频运维，不进入普通服务写路径。原单重复发布只比较不可变方案，保留其他实例推进的状态。

实现、故障回归及当前 CI 入口见 [复查修复记录](/Users/leslie/Documents/Playground/output/quality-scope-review-fixes-20261018/fix-report.md) 和 [PR #2594](https://github.com/world-sim-dev/sandai-data-smith/pull/2594)。代码交付、合并、发布和生产验收分别沿原始证据核对。

## 2026-10-18 持久占用的性能审查入口

**Why:** 业务占用能阻止版本分叉，但额外串行往返、同任务共用的 CAS 行和持续增长的 JSON 会产生开销；低频管理员事务还可能持有跨任务共用物理表的锁。正确性 CI 不提供延迟前后对照。

**How to apply:** 区分完整 PR 的服务成本与最新 operator 补修，沿真实入口统计范围封存、重复预留、intent 和 ledger 查询；在同一环境分别验证同任务/不同任务并发。表锁按物理表判断影响范围，事务预算不能当作正常耗时或恢复 ETA。当前代码坐标、静态调用统计及未测量事项见[性能核对记录](/Users/leslie/Documents/Playground/output/quality-scope-review-fixes-20261018/performance-impact.md)；混合事务机制沿[官方文档](https://help.aliyun.com/en/hologres/developer-reference/sql-transaction-capabilities)刷新。
