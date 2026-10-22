---
name: sandeval-termination-historical-writer-recovery
type: pitfall
created: 2026-10-22
updated: 2026-10-22
tags: [sand-eval, termination, recovery, audit]
links: [sandeval-package-termination-validation, sandeval-dashboard-package-termination-scope]
---

# 终止处理中：旧执行器遗留与新异常需要分别核对

**Why:** 局部恢复完成不等于全站旧登记已清理，也不等于产生未知结果的底层异常已修复。包可以在正常开放期间留下未知操作登记，之后才提出终止；页面上的“终止处理中”不能证明执行器仍在运行。

**How to apply:** 先比较前次恢复目标与本次完整 stopping 清单，独立复查旧目标有无回退；再按登记时间、原始异常、执行器身份区分存量与新增。只对用户授权终止的包沿原生 operator 核销：冻结 request/reason/scope/revision/owners，证明原执行器退出及 SQL 排空，dry-run 后逐 owner CAS apply，保留全部 reconciliation 审计，并从另一个生产副本核对业务摘要、管理列表、新写拒绝与正常兄弟包准入。不得用超时、Pod 消失或临近时间推断业务结果成功。

## 查证入口

- 2026-10-21 两包恢复回执：`/Users/leslie/Documents/Playground/output/package-termination-recovery-20261021/receipt.md`；只代表该次冻结范围。
- 2026-10-22 全量恢复回执：`/Users/leslie/Documents/Playground/output/package-termination-recovery-20261022/receipt.md`；包含两次范围差异、历史/当日异常分类及完整包清单。最新数量与状态沿回执及线上重新核验。
- 同目录 `bundle.json`、`dry-run.jsonl`、`apply.jsonl`、`independent-verify.jsonl`：冻结证据、原生核销和独立验收指针。未决操作的业务结果未被恢复动作改写；摘要相等只证明本次恢复未改变所覆盖业务表。
- 权威 runbook：`sand-eval/docs/operations/package-termination.md`；原生入口：`sand-eval/platform/backend/app/cli/package_controls.py`；屏障与状态机：`app/infra/package_control.py`；管理列表投影：`app/services/facts/package_termination.py`。
- [隔离与验收入口](../refs/sandeval-package-termination-validation.md)；[主任务与数据包状态边界](sandeval-dashboard-package-termination-scope.md)。

## 证据边界

原生核销撤销已排空执行器的参与登记，不是业务命令重试，不清除答案/质检历史。新出现的事务超时、内存不足或数据库内部错误仍应按其原命令另行查证，不能因终止列表清零宣布异常源已永久修复。未提交终止的开放包不属于该次 stopping 恢复范围。

## 2026-10-22 只读准备过早登记执行器

**Why:** 恢复命令在读取详情、历史或已有回执之前就登记持久写执行器，读失败会被保守地归为未知写入；之后部署新代码并不会自动清除旧登记。已经确认成功的请求冻结步骤，也不应因后续独立只读准备失败被重新判为未知。

**How to apply:** 先用异常时间、命令、Pod/进程和 SQL 指纹定位是否已进入写步骤。将有证据的只读准备移到写准入之前，在首个可能变更的入口重新检查终止与接管屏障，并保留原版本条件、幂等身份和真实未知写入保护。不要把事务取消/OOM 一概认定为无写入，也不要重放整个业务命令。准备与终止交错、冻结请求后读失败、真正写入丢回执、兄弟包隔离都需回归。

- 修复与 Gate/部署入口：[main PR #2773](https://github.com/world-sim-dev/sandai-data-smith/pull/2773)；当前上线状态沿 PR、Actions 和生产镜像核对，不从本页推断。
- 查询扫描优化入口：[#2770](https://github.com/world-sim-dev/sandai-data-smith/pull/2770)，与写执行器准入边界是不同层面的修复。
- 私有诊断及验收指针：`/Users/leslie/Documents/Playground/output/package-termination-recovery-20261022/root-cause.md`、同目录 `deployment-receipt.md`。包含精确匹配的 SQL 指纹、未唯一反解的 OOM 查询及仍须保留保护的写事务取消边界。
