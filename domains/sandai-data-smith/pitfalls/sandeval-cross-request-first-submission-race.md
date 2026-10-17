---
name: sandeval-cross-request-first-submission-race
type: pitfall
created: 2026-10-17
updated: 2026-10-17
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
