---
name: evolve-explainability-and-optimization
type: reference
created: 2026-09-09
updated: 2026-09-09
tags: [maxwell, evolve, judge, optimization, statistics]
links: [evolve-maxwell-tuning-receiving, maxwell]
---

# EVOLVE 判卷解释与优化方法实现指针

**Why:** 通过率与均分描述不同事实，需要冻结阈值、逐题 verdict 与分布才能解释；候选改进结论需要同题配对与不确定性，不能仅看均分差。

**How to apply:** 从 PR 和仓库验收文档查看当前实现，不把本地 fixture 通过当作真实模型、线上部署或 agent-server Variant 应用已验收。比较前核对冻结 JudgeSpec、JudgeConfig、trialsPerCase 与执行接应证据；历史 Artifact 缺失数据不得补写成已知结果。

- [实现 PR #269](https://github.com/world-sim-dev/maxwell-ai/pull/269)：2026-09-09 将分支已有领域升级与解释/优化实现合为一个提交。合并、CI 与部署状态以该链接为准。
- 仓库 `docs/evolve-explainability-implementation-20260909.md`：实现、测试命令、统计假设及未验收边界。
- 仓库 `docs/evolve-explainability-and-optimization-plan-20260909.md`：需求与展示方案。
- `services/evolve-server/internal/modules/evolve/application/queries/{explainability,proposals,evidence}.go`：verdict、候选提案、Run 统计与配对可比性入口。
- `services/evolve-server/internal/modules/evolve/methods/optimization/`：独立 Method；`internal/app/e2e_optimization_test.go`：本地 fake Maxwell/text 通道回归。
- `services/evolve-server/internal/modules/evolve/application/commands/calibrate.go`：业务 Judge 模型选择与校准报告冻结配置；模型设置变化的兼容检查不能只覆盖 Run worker。
- `apps/studio/scripts/check-evolve-explainability.mjs`：展示断言与固定样本预览入口；API 类型通过 `pnpm --filter @maxwell/studio api:generate:evolve` 生成。

## Review 回归入口（2026-09-09）

复查 PR #269 时需覆盖以下场景，是否修复以 PR 最新代码为准：
- queries/evidence.go CompareCandidates：子候选先于父候选传入时，顶层配对结果不得被反向比较覆盖。
- methods/optimization/statistics.go：5 个 Case 各重复 5 次，候选每题 1 次高分加 4 次错误，不能忽略执行可靠性后无条件宣告整体 better。
- queries/proposals.go 与 methods/optimization/proposals.go：minScore=maxScore=1 的满分样本，不应被 minScore+1 永久排除。
- queries/evidence.go Statistics：同题前一次通过、后一次错误，最近结果需要保留错误 Trial。

**Why:** CI 与固定顺序、无错误的 fixture 未覆盖这些边界。**How to apply:** 增加顺序反转、错误比例变化、满分量纲及最近错误回归，再判断是否可合并。

## 修复与资产审查指针（2026-09-09）

PR #269 的修复验收见仓库 docs/evolve-explainability-implementation-20260909.md。回归分别位于 e2e_optimization_test.go（反向选择）、queries/evidence_streaming_test.go（最近错误）、methods/optimization/statistics_test.go（覆盖与评分量纲）、Studio check-evolve-explainability.mjs（错误与有效样本展示）。是否已合并或部署仍以 PR 和部署记录为准。

Prompt/Skill 核查还需区分 Wilson 通过率估计精度和配对改进检验、存在校准报告和校准通过、hidden 对调优侧的隔离和对目标发送输入；完整基线资源与只修改部分资源的候选不能混为同一 payload 规则。已有授权应复用，无 inline Prompt 时不能循环调用 propose。代码契约和静态场景检查不证明真实模型自然对话符合指引。
