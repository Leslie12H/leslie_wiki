---
name: evolve-candidate-loop-decision-boundaries
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [maxwell, evolve, candidate, optimization, decision]
links: [evolve-query-latency-and-tuning-visibility, evolve-catalog-projection-and-external-adoption]
---

# 候选验证、搜索与正式决策的衔接边界

**Why:** 同一平台可以分别支持独立验证、Runner 基线与原生指标展示，但这些能力不自动兼容旧的 Work 内候选搜索和均分决策。比较页有应用回执与漂移检查，也不代表正式采纳入口调用了相同门禁。

**How to apply:** 在 2026-10-19 origin/main `758a1d25` 的审查中，沿以下指针核对，不将该历史快照视作永久现状：

- `commands/candidate_validation.go` 创建独立 evaluation Work；采纳与 Search 若仍以原 Work 查 Run，需要显式精确证据关联，而不是改写历史 Work 或候选归属。独立验证可读不等于可以据此采纳。
- `application/search/service.go:Start` 要求带 CandidateID 的基线，Runner 的正常 baseline Run 则没有 CandidateID；检查两个入口合同，沿 initial evaluation baseline 的真实身份表达衔接，禁止伪造基线 Candidate。
- `methods/optimization/optimization.go` 的旧离线决策依赖 normalized total；原生输出向量没有自动的总分。沿 `commands/optimization_methods.go` 检查 inconclusive 是否被映射 reject；应冻结优化指标、方向与约束，并保留待定语义。指标名叫 overall 本身不是跨协议归一化授权。
- 正式 DecisionReport 的父 Run 选择、生成和重放应共享比较条件、实际应用与回归门禁；只检查 JudgeSpec 与聚合策略不足以证明两次测量可比，平均值上升也不能替代关键题回归检查。
- 共享会话 visible 与隐藏题、执行 Key 资源读取授权是不同边界；前置能力不足时如实阻塞，不放宽权限换取候选产出。逻辑执行器可以在创建任务时选择已关联 Runner，原生执行拒绝候选资源本身不等于内部调度缺失。

本次发现、优先级、最小复现、测试边界与未验证项见 [候选链路审查](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-candidate-audit-20261019/review.md)，对应复现输出为同目录 repro.log。该次仅审查与临时 overlay 测试，未修业务代码或执行线上候选采纳。
