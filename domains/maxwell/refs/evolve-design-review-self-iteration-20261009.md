---
name: evolve-design-review-self-iteration-20261009
type: reference
created: 2026-10-09
updated: 2026-10-09
tags: [maxwell, evolve, design-review, evaluation, self-iteration]
links: [maxwell, evolve-generic-platform-review, evolve-original-design-vs-current, evolve-usage-accounting]
---

# EVOLVE 自迭代设计审查入口

2026-10-09 按用户提供的《Agent 自迭代工程实践：GitHub 项目与收益证据》（2026-10-05）审查 EVOLVE。源码锚点为 main `28180a5c11f442decd79df3b35517c8018b01399`，不代表当前部署版本。

完整分析、PDF 页码、源码行号、改进顺序和本地反例结果见 [本地审查报告](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-design-review-20261009.md)。报告为本次本地产物，未提交业务仓库；长期复用时先确认文件存在并重新核对源码。

**Why:** 不可变证据、paired compare、holdout、Judge 校准和搜索账本各自存在，不代表最终采纳已经统一消费这些约束。需区分平台当前能力、历史缺口、方法层证据与真实线上收益。

**How to apply:**

- 采纳门槛从 `application/commands/optimization_methods.go` 与 `methods/optimization/optimization.go` 追到 `application/queries/evidence.go`，比较最终决定和查询/搜索是否使用相同的可比性、实际应用与统计门槛；小样本涨分是有效反例。
- final 独立性从 `application/search/service.go` 的 `confirmHoldout` 和 `domain/search/search.go` 的 `RecordHoldout` 核对数据用途、与开发集交叠、一次性验收及调用身份，不能以 hidden 权限替代数据隔离。
- 搜索从 `application/search/service.go` 的 `plan` 核对编辑父候选和评估基准是否分开、是否消费新诊断；Candidate 支持 parent 不代表循环自动使用胜者。
- Judge 从 `application/evaluation/judge_quality.go` 与 `methods/judge/calibrate/calibrate.go` 核对校准模型配置绑定、人工/Agent 样本分母和正式晋升时的处理方式。
- 预算分别核对 `infrastructure/postgres/runs.go` 的 Work 硬准入与 `methods/optimization/search.go` 的事后计数；`domain/usage` 只记录物理用量的选择应保留，经济预算可由外层价格快照和预留账本承接。
- 发布与回滚优先保留 EVOLVE 和 Adapter/外部发布器职责边界，见 `services/evolve-server/docs/external-candidate-control.md`。accepted、published、applied、runtimeVerified 和线上业务收益分别取证。

本轮验证仅包含三个临时 Go overlay 反例及 optimization/calibrate/search 三个包的既有测试。没有真实 Agent、浏览器产品验收、业务数据库查询、代码修复或部署；反例测试 PASS 表示缺口复现成功。
