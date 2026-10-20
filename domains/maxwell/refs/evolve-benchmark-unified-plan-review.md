---
name: evolve-benchmark-unified-plan-review
type: reference
created: 2026-10-20
updated: 2026-10-20
tags: [maxwell, evolve, benchmark, split, subject, executor, adapter, visualization]
links: [evolve-benchmark-run-subset]
---

# Benchmark 补齐方案专项复审入口

2026-10-20 用户要求复审可视化通用性、split 逻辑和 Subject/Executor/Adapter 职责。本轮只修订方案，未实施。

**Why:** 共享 Adapter 可以服务多个被测对象；当前连接关联不能代替历史业务身份。平台 Work 停止不等于远端准备已取消；业务展示需要独立的数据 schema、展示器版本和受控读取规则。

**How to apply:** 接口/结构、七项发现及处理沿方案核对。实施前检查多对多关联、Work 的固定归属、两端重试/取消、split 全量归一和展示降级，不能把设计修订当作真实运行验收。

- 方案：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-unified-plan-20261020/proposal.md`；七项发现与证据见同目录 `review.md`。精确接口和结构清单以修订方案为准。
- EVOLVE 源码：`domain/executor/routing.go`、`application/execution/runner_binding.go`、`runner_preparation.go`、`commands/work.go` 与 PostgreSQL `CommitWorkStop`；保留已有 Work 行锁与活动 Run 屏障，不把拟新增准备取消当成现有事实。
- 昨日选题工作区：`/Users/leslie/.codex/worktrees/benchmark-case-selection/maxwell-ai`；`commands/case_selection.go` 全选返回原全量，`domain/evaluation/selection.go` 的 Selection 仅表示真实子集。
- 展示入口：Studio `rendering/evidenceRenderers.ts` 和 EVOLVE `domain/artifact/display_hints.go`；业务原件、schema 解释和展示器职责分开，证据归属/完整性统一由平台处理。
