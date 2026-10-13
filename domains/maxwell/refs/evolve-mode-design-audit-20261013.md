---
name: evolve-mode-design-audit-20261013
type: reference
created: 2026-10-13
updated: 2026-10-13
tags: [maxwell, evolve, architecture, evaluation, optimization, decision]
links: [maxwell, evolve-design-review-self-iteration-20261009, evolve-nextplay-entry-plan-20261009, evolve-usage-accounting]
---

# EVOLVE 当前模式的整体设计复核入口

2026-10-13 根据用户对 EVOLVE 模式漏洞和整体设计的提问重新核对本地工作区。源码基线为 `6c09a025`；工作区另有 Studio 未提交改动。本页是代码复核指针，不代表线上部署、实际损失或端到端产品验收。2026-10-09 的历史审查见 [自迭代设计审查](evolve-design-review-self-iteration-20261009.md)，其中的缺口必须逐项复核，不能整份当作现状。

**Why:** 冻结、评分、人工复核、候选验证、搜索和接受各自可用，仍可能没有共同的实验与决策约束。直接评测、原生指标和独立验证扩展之后，要核对旧搜索及最终决定是否真正消费新模型。

**How to apply:**

- 最终采纳从 `services/evolve-server/internal/modules/evolve/application/commands/candidate.go`、`decision.go` 和 `optimization_methods.go` 追到 `methods/optimization/optimization.go`。与 `application/queries/evidence.go`、`compare_runs.go` 比较应用回执、实验可比性、成对统计、回归、Judge 质量和独立验收是否统一。特别核对有父候选与首次直接基线两条路径的设置检查是否一致。方法包的 `TestOfflineComparisonEnforcesCandidateAndVariantLineage` 是单题涨分可以 promote 的明确复验入口；不是线上事件。
- 新评测到旧搜索的接线从 `application/commands/tuning_baseline.go` 和 `application/queries/tuning_baseline.go` 追到 `application/search/service.go` 的 Start。核对跨任务绑定基线是否沿用 analysisRun 授权，以及普通直接评测没有 CandidateID 时如何进入搜索；不要伪造候选或重跑来掩盖模型不匹配。
- 独立候选验证从 `application/commands/candidate_validation.go` 追到 `queries/compare_runs.go` 的 CompareRunBaseline，再检查旧 CompareCandidates、DecisionReport 是否可按确切 Run 消费新任务的结果。验证不改写旧决定是现有明确边界，不意味着自动晋升已贯通。
- 原生指标从 `services/evolve-server/docs/native-grading-provider.md`、`methods/optimization/statistics.go`、`optimization.go` 和 `domain/objective/objective.go` 核对。`native_examples_test.go` 的 TestNativePairedStatisticsExplainUnavailableTotal 明确记录无统一总分时默认成对统计为 inconclusive；额外 pairwise 判卷是另一条路径。目标目前按 0..1 表达，不能将毫秒、费用或类别静默转成统一分数。新决策应由业务声明具体指标、方向、单位、收益和保护条件。
- 搜索反馈从 `application/search/service.go` 的 Advance/plan 核对每轮读取的 DiagnosisReportRef、提案的 BaselineRunRef、编辑父候选与评估基准是否分别声明；Candidate 支持 parent 不代表自动循环已累计前轮改进。
- final 独立性从同文件 confirmHoldout 及 `domain/search/search.go` 的 RecordHoldout 核对真实题集用途、开发/验收交叠和重复确认；hidden 权限与独立数据协议分别验证。统计背景见 [Generalization in Adaptive Data Analysis and Holdout Reuse](https://arxiv.org/abs/1506.02629)。
- Judge 校准从 `application/evaluation/judge_quality.go` 和 `methods/judge/calibrate/calibrate.go` 核对报告绑定的 JudgeConfig、方法版本和独立人工样本分母；不能只看人工来源非零和总样本数。探索警告与正式采用门槛应区别处理。
- 预算与自动执行从 `infrastructure/postgres/runs.go`、`methods/optimization/search.go`、`domain/usage/usage.go` 和 `agent-resources/skills/optimization-loop/SKILL.md` 核对。Work 有事务内硬预算，Search 在完成后计数；search_test.go 的 TestSearchAdvanceStopsWhenBudgetIsExhausted 保留越过较窄 Search 上限后停止的例子。每轮用户启动是现有授权策略，新增有界自动实验必须明确范围、额度和副作用。
- 生命周期从 `commands/candidate.go` 的 candidateDecisionWorkChanges 和 `services/evolve-server/docs/external-candidate-control.md` 核对 accepted、published、applied、runtimeVerified、线上收益与回滚的分别取证。发布仍由 Adapter/外部发布器负责；EVOLVE 的后续证据关联不能用接受候选或完成 Work 替代。

本轮运行 optimization、judge/calibrate、domain/search 三个包的既有 Go 测试，均通过（缓存结果）。只核对代码语义；未执行真实被测 Agent、业务数据库查询、浏览器验收、业务代码修改或部署。
