---
name: evolve-trial-review-boundaries
type: reference
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, evolve, review, ui, evidence]
links: [evolve-nextplay-entry-plan-20261009]
---

# EVOLVE 人工复核的状态与展示边界

**Why:** 单项分数修订不等于整题判定改变；内存中保留草稿也不等于服务器已保存。界面若省略这些区别，会让用户误判操作结果。原始自动结果、当前采用结果、编辑草稿需要在同一上下文中辨认。

**How to apply:** 查 Studio `reviews/TrialReviewPanel.tsx`、`TrialReviewStore.ts`、`trialReviewSession.ts`，并对照后端 `domain/results/projection.go` 的独立投影语义。人工修订只追加复核，恢复自动结果保留历史。导航保留与刷新持久化分开表述，保存失败保持请求身份，冲突明确重新核对；切换题目、评分项、只读与窄屏都应实点验证。界面使用“未通过”表达质量判定，避免与执行失败混淆；通用标量和冻结指标身份不因某个 Provider 改写。

当前实现、隔离组件故障注入、截图和剩余验收范围见[复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-trial-review-layout-review-20261014.md)。这些结果不证明真实 Nextplay 评分、数据库持久化或完整自然调优通过。整体交互约定见[通用工作台方案](../projects/evolve-nextplay-entry-plan-20261009.md)。
