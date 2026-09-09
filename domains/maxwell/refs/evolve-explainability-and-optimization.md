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
