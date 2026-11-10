---
name: sandeval-direct-return-handoff-status
type: pitfall
created: 2026-11-10
updated: 2026-11-10
tags: [sand-eval, quality, direct-return, handoff]
links: [sandeval-direct-return-interrupted-by-leader]
---

# 直接整改显示「待交接」后仍可能自动回交

**Why:** 「已通过」取自批次当前质检结果，「待交接」取自单条 Sand 退回的交接进度。部署版本可能在系统步骤等待超时、仍没有可用交接时，把前台状态从「回交中」切到「待交接」。后台直接整改恢复仍独立扫描未闭环的退回。2026-11-10 的生产案例在供应商验收通过约 27 分钟后写入单批回交回执，随后派出 Sand 复验。同期日志未定位具体延迟原因。

**How to apply:** 用原退回处置 ID 对齐整改流水，依次查供应商质检通过、负责人验收或子处置关闭、单批交接回执、Sand 复验任务和当前任务状态。批次级「已提交 Sand」可能来自历史整包。判断历史文案和延迟成因时，核对当时部署版本的状态投影和后台日志，并区分本次是否已经推进与为何推进较晚。

- [2026-11-10 生产案例的质检任务](https://eval.sandaii.cn/quality/management?tab=tasks&task=QT-3f5d3f3ce6e85a909f1039d4aaad9bfa&allocation=QA-c829f7d871df586681768ca06d47f625)，从「整改流水」查标注批次，定位退回 `DISP-7015b04bd1995c1fbdea4a5edf08d353`。
- [当日部署的状态投影](https://github.com/world-sim-dev/sandai-data-smith/blob/1951e4581326c5613a06cc29497885bc50d96745/sand-eval/platform/backend/quality/application/resolution/leader_resolution_service.py#L342)及[直接整改后台恢复](https://github.com/world-sim-dev/sandai-data-smith/blob/1951e4581326c5613a06cc29497885bc50d96745/sand-eval/platform/backend/quality/application/resolution/direct_return_service.py#L74)。
