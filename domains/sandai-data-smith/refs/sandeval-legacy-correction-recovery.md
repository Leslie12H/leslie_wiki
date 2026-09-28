---
name: sandeval-legacy-correction-recovery
type: reference
created: 2026-09-20
updated: 2026-09-20
tags: [sand-eval, quality, reinspection, recovery]
links: [sandeval-auto-reinspection-verification]
---

# 历史整改快照冲突恢复入口

**Why:** 新提交使用 durable intent，并不代表旧版本遗留的正式快照已有对应复验执行。重试可能再次构造相同修订号而碰到 `SUBMISSION_SCOPE_EXISTS`。旧快照与最新提交也可能已有答案差异，不能只看题数相同就复用。

**How to apply:** 分开核对送审版本、失败提交意图、处置版本、复验执行和原检查员待办。保留既有冻结记录；通过当前恢复规则和明确的 dry-run / apply 协议处理，不手工删除快照或直接翻转处置状态。完整机制以代码、runbook 和现场回读为准。

- 代码及回归入口：[PR #1504](https://github.com/world-sim-dev/sandai-data-smith/pull/1504)。对应 `quality/application/resolution/legacy_correction_snapshot.py`、`resubmission_intent.py` 和 `tests/quality/application/resolution/test_resolution_workflow.py`。
- 运维协议：业务仓库 `sand-eval/docs/operations/legacy-correction-recovery.md`；operator 入口 `python -m app.cli.legacy_correction_recovery`。部署状态须核实 main workflow 与运行中镜像，不能由合并状态推断。
- 2026-09-20 生产原始失败批次、只读计划、应用结果、版本与工作台回读证据：`/Users/leslie/Documents/Playground/output/prod-legacy-correction-20260920/report.md` 及同目录输出。是否恢复、是否派单以该报告实际完成的证据为准。
