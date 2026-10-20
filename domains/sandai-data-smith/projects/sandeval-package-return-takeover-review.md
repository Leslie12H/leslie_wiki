---
name: sandeval-package-return-takeover-review
type: project
created: 2026-10-20
updated: 2026-10-20
tags: [sand-eval, quality, package-return, review, concurrency]
links: [sandeval-completed-review-followup-round, sandeval-sand-wrapper-deferred-declaration]
---

# 整包退回接管未结复验的方案复审

状态：2026-10-20 方案建议，尚未实施。用户要求复审，不代表批准实施、生产恢复或发布。

**Why:** 停止旧 Sand 复验并不自动转移旧整改责任。旧责任继续阻断新流程可能形成循环等待，强行关闭又可能制造通过结论；持久化接管字段还会影响旧 worker 的解析和恢复。

**How to apply:** 实施前明确精确责任范围和接管授权、新 Sand 正式结果如何收口旧责任、并发决定与保存的统一围栏、每阶段幂等恢复、旧问题必检与合法待定、混合版本及回滚兼容。首版建议限于供应商整改正式完成而 Sand 复验未结束的完整覆盖范围。此为建议，不能据此跳过现有生产阻断。

## 核验指针

- [2026-10-20 完整复审与验收清单](/Users/leslie/.codex/visualizations/2026/10/20/01a15791-b458-7e83-a099-1620fc10895e/package-return-review.md)。源码基线和全部发现以该记录为准，后续实施时重新核对。
- 代码入口：`quality/application/management/package_self_check_service.py`、`package_decision.py`、`aggregation_service.py`；`quality/application/resolution/resolution_service.py`；`quality/infrastructure/persistence/unit_of_work.py`、`resolution_execution_repository.py`，均位于 `sand-eval/platform/backend/`。
- 已核验的现有机制与个案边界：[已检完与后继轮次](../pitfalls/sandeval-completed-review-followup-round.md)。
