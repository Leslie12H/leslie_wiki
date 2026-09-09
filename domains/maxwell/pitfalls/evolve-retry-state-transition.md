---
name: evolve-retry-state-transition
type: pitfall
created: 2026-09-09
updated: 2026-09-09
tags: [maxwell, evolve, retry, stability]
links: [evolve-drawer-overflow, evolve-explainability-and-optimization]
---

# EVOLVE 已接受远端任务后的重试状态转换

**Why:** Attempt 和 Trial 分开持久化。远端接受后 Trial 已进入 remote_running，Attempt 失败后直接派发新 Attempt 会撞上仅允许 dispatching 的 MarkRemoteRunning。只有派发前失败的重试测试无法覆盖此路径；非法转换会向 Run 传播并取消同轮其他 Trial。

**How to apply:** 重试资格与退避通过后，先通过租约/预期状态检查持久化 Trial 的重试派发状态，再创建下一次 Attempt，保留原并发槽位。检查创建前后、派发状态写入后、远端接受写入后的恢复；有远端 ID 不重复派发。原生执行器未确认首次派发时的保守策略仍须保留。

## 实现及验收指针

- Maxwell 分支 `codex/trial-detail-ui` 与 `docs/evolve-run-retry-stability-20260909.md`：修复、回归命令和线上验收边界；当前合并/部署状态以 Git 与发布记录为准。
- `services/evolve-server/internal/modules/evolve/application/evaluation/live.go`、`live_retry_test.go`：重试和八 Trial / 九 Attempt 的隔离回归、四个持久化边界。
- `domain/evaluation/evaluation.go`：显式 RetryDispatching；不要为了重试放宽所有 MarkRemoteRunning 转换。
- `apps/studio/src/products/evolve/runProgress.ts` 与 `scripts/check-evolve-explainability.mjs`：评分数以 scoredTrials 为准，pending 不能重复加进分母。无有效判定不得显示 0% 暗示所有题失败。
- 用户提供的首次 Attempt 触发原因仍需运行证据，不能由本次状态机错误推断为超时。修代码不会修复历史 Run，重跑应核对原冻结配置和环境。
