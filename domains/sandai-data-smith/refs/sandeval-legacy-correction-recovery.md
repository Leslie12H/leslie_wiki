---
name: sandeval-legacy-correction-recovery
type: reference
created: 2026-09-20
updated: 2026-10-19
tags: [sand-eval, quality, reinspection, recovery]
links: [sandeval-auto-reinspection-verification]
---

# 历史整改快照冲突恢复入口

**Why:** 新提交使用 durable intent，并不代表旧版本遗留的正式快照已有对应复验执行。重试可能再次构造相同修订号而碰到 `SUBMISSION_SCOPE_EXISTS`。旧快照与最新提交也可能已有答案差异，不能只看题数相同就复用。

**How to apply:** 分开核对送审版本、失败提交意图、处置版本、复验执行和原检查员待办。保留既有冻结记录；通过当前恢复规则和明确的 dry-run / apply 协议处理，不手工删除快照或直接翻转处置状态。完整机制以代码、runbook 和现场回读为准。

- 代码及回归入口：[PR #1504](https://github.com/world-sim-dev/sandai-data-smith/pull/1504)。对应 `quality/application/resolution/legacy_correction_snapshot.py`、`resubmission_intent.py` 和 `tests/quality/application/resolution/test_resolution_workflow.py`。
- 运维协议：业务仓库 `sand-eval/docs/operations/legacy-correction-recovery.md`；operator 入口 `python -m app.cli.legacy_correction_recovery`。部署状态须核实 main workflow 与运行中镜像，不能由合并状态推断。
- 2026-09-20 生产原始失败批次、只读计划、应用结果、版本与工作台回读证据：`/Users/leslie/Documents/Playground/output/prod-legacy-correction-20260920/report.md` 及同目录输出。是否恢复、是否派单以该报告实际完成的证据为准。

## 已被正式检查的后继版本

**Why:** 孤立快照恢复只能消费未被检查/执行使用的立即后继；旧整改单落后多个已消费版本时，不能放宽该守卫，也不能以当前作者不同推断历史批次失效。

**How to apply:** 先核对当前责任/持有人、原执行组、同 scope 的逐代送审及报告继承、完整工作项、最新已保存答案和失败意图。已消费后继从连续的正式最新依据追加版本；答案已经变化时使用新命令，保留旧失败意图。审计 before-image 在服务端保存，owned operation 中断后先独立回读，再继续同一操作；待处理复验用任务读取，不能调用只接受正式报告的接口验收。

- 2026-10-19 两单调查、精确恢复计划、服务端审计 receipt 和独立回读：[本地恢复报告](/Users/leslie/Documents/Playground/output/correction-two-cases-20261019/recovery-and-root-cause.md)。报告区分个案恢复、代码 Gate、合并与部署，运行态以重新回读为准。
- 根因修复候选：[测试 PR #2601](https://github.com/world-sim-dev/sandai-data-smith/pull/2601)。共享依据 owner 为 `quality/application/resolution/resolution_scope_service.py`；回归入口 `tests/quality/application/resolution/test_resolution_scope_service.py`。查询、逐题意见和提交须使用同一经校验后继；PR 是否可合并、CI 及部署状态看链接，不能由本页推断。
