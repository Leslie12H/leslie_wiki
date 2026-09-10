---
name: evolve-evaluation-blockers-20260910
type: reference
created: 2026-09-10
updated: 2026-09-10
tags: [maxwell, evolve, stability, cancellation]
links: [evolve-retry-state-transition, evolve-tuning-agent-loop-audit-20260909]
---

# EVOLVE 全流程稳定性审计指针

**Why:** 修复重试状态转换不等于旧远端任务已经停止。本地 Run 终态、Attempt 取消状态和远端执行需要分别验收；已有通过的正常路径测试不能覆盖取消失败与容量边界。

**How to apply:** 查看 Maxwell `codex/trial-detail-ui` 分支 `docs/evolve-evaluation-blockers-audit-20260910.md` 的触发条件、复现记录和后续修复状态，不能把本地模拟当作线上事故频率或修复发布证明。

- `application/evaluation/live.go`：超时 bestEffortCancel、取消未确认的重入、证据整体冻结容量。
- `application/evaluation/processor.go`：Run 失败的本地终态提交与远端清理职责。
- `methods/judge/llmrubric/llmrubric.go`：格式修复重试与端点错误重试的区别。
- 仓库 `.tmp/evolve-audit-20260910-overlay.json` 与同日期 log/test 文件：取消失败后重派、取消预算不可恢复、Run 失败无远端取消、证据总量超限四个本地探针。探针断言现存缺陷，不是修复回归。
- `commands/draft.go`：2026-09-10 已核实 ConfirmDraft 调用 validateDraftForFreeze；旧审计中的“确认不校验 payload”不再适用。

优先检查远端任务清理最终收敛，再处理规模准入和仅判卷恢复。具体修复/部署状态以代码和运行证据为准。
