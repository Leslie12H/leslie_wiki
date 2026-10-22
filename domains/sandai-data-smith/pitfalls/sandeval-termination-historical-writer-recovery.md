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
