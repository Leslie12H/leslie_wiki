---
name: evolve-langsmith-learning
type: reference
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, evolve, langsmith, evaluation, observability, product]
links: [evolve-mode-design-audit-20261013, evolve-trial-review-boundaries, evolve-design-clarity-20261013]
---

# EVOLVE 借鉴 LangSmith 的核对入口

2026-10-14，用户询问 EVOLVE 可以借鉴 LangSmith 的哪些机制。本页保存官方来源与本地复核入口；建议尚未获得实施批准，不代表线上能力、产品验收或正式排期。

**Why:** 竞品的能力名称容易掩盖本平台已经存在的实现。应先区分已有基础、工作流衔接和新增能力，再判断其对真实评测与调优决策的价值。

**How to apply:**

- 先读 [模式设计复核](evolve-mode-design-audit-20261013.md)、[人工复核边界](evolve-trial-review-boundaries.md) 和 [页面清晰度约束](../pitfalls/evolve-design-clarity-20261013.md)。当前状态必须重读源码和实际环境，不以本页断言已上线。
- 实验对照：LangSmith 的 [evaluation types](https://docs.langchain.com/langsmith/evaluation-types)；本地入口为 `services/evolve-server/internal/modules/evolve/application/queries/compare_runs.go`、`queries/evidence.go`、`methods/optimization/statistics.go`、`apps/studio/src/products/evolve/RunComparisonStore.ts` 和 `candidates/BaselineComparison.tsx`。核对精确基线、同题变化、缺失覆盖、重复运行、Judge 质量及实际应用证据；已有统计能力不能自动等同于最终采纳的统一门槛。
- 人工复核到校准：LangSmith 的 [annotation queues](https://docs.langchain.com/langsmith/annotation-queues)；本地入口为 `reviews/TrialReviewStore.ts`、`v3/library/CalibrationPage.tsx`、`application/evaluation/judge_quality.go` 和 `methods/judge/calibrate/calibrate.go`。核对任务分配、独立人工样本、精确方法/配置与评分标准版本、冲突和结果采用；不把 Agent 自报标签视为人工真值。
- 真实问题到用例：LangSmith 的 [dataset management](https://docs.langchain.com/langsmith/manage-datasets-in-application) 和 [online evaluations](https://docs.langchain.com/langsmith/online-evaluations-llm-as-judge)；本地入口为 `domain/caseimport/bundle.go`、`preflight.go`、`application/commands/case_import.go` 和 `domain/casecatalog/`。复用来源与导入预检；核对线上样本筛选、去重、脱敏、上下文/附件、复现条件及人工确认，完整 Trace 不是天然可重放的 Case。
- 分数到执行原因：LangSmith 的 [observability](https://www.langchain.com/langsmith/observability)；本地入口为 `apps/studio/src/products/evolve/v3/matrix/TrialDetailPanel.tsx`、`application/queries/evidence.go` 及原件下载/执行回执链路。区分已可保存的原始轨迹、可视化/检索能力和对外部 Agent 内部步骤的实际观测覆盖；缺少埋点时明确未知，不能从最终输出猜内部原因。
- 日常开发集成：LangSmith 的 [pytest integration](https://docs.langchain.com/langsmith/pytest)；本地入口为 `services/evolve-server/README.md`、生成 API 客户端和执行器接入文档。若规划 CI 自动评测，复用冻结 Benchmark/Run 与预算机制，先声明自动执行范围和副作用；不得绕过现有明确启动授权策略。

本轮为知识库、当前本地源码和官方文档对照；未执行业务运行、测试、数据库查询、浏览器验收或部署。已有未提交工作区改动不属于本轮实施。建议优先完善实验对照与复核校准，再连接线上失败到回归用例，之后扩展观测与 CI；此顺序是本轮判断，后续应依据实际使用阻塞重新决定。


## 2026-10-14 UI 参考来源与使用边界

官方来源为 [实验结果对照](https://docs.langchain.com/langsmith/compare-experiment-results)。本轮从官方文档页面导出并查看四张公开产品截图：实验列表、逐题回归矩阵、展开的结果详情、并排执行轨迹。原始 AVIF、仅格式转换的 PNG 与来源 manifest 位于 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/langsmith-ui-reference-20261014/`，文件依次为 `01-experiment-list`、`02-experiment-comparison`、`03-output-details`、`04-trace-comparison`。

**Why:** UI 借鉴需要可检查的具体页面证据；文档截图可能不是所有账户最新界面，也不能证明登录后的完整流程、键盘导航和持久化行为。本轮是公开界面研究，不是对 LangSmith 的完整交互验收。官方截图的红色虚线标记属于教程注释，不是产品视觉规范。

**How to apply:** 从这些图核对对象标题与页内 Tab、图表与表格的层级、按改善/退步筛选、选中项展开、双版本详情与轨迹对照。借鉴时保持 EVOLVE 用例与评分的核心地位，并遵循 [页面清晰度约束](../pitfalls/evolve-design-clarity-20261013.md) 中已有桌面优先、暖色与粗线条要求；未知指标方向和不兼容口径不能自动着改善色。优先研究同题基线/候选的同屏阅读、状态筛选及上下文保留，再决定视觉密度调整。

本轮 EVOLVE 对照材料为 `output/evolve-results-20261013/benchmark-records-desktop.jpg`、`record-journey-desktop-after-20261014.jpg` 和 `baseline-refresh-desktop-20261014.jpg`。它们明确标注本地示例/组件验证，不能据此判断当前部署状态；后续实施前须重新打开实际页面核对。本轮没有修改业务 UI。
