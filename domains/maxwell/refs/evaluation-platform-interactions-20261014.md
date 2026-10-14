---
name: evaluation-platform-interactions-20261014
type: reference
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, evolve, evaluation, tuning, interaction, braintrust, opik, langfuse, phoenix]
links: [langsmith-interaction-study-20261014, evolve-langsmith-learning, evolve-design-clarity-20261013]
---

# 评测与调优平台交互研究入口

2026-10-14，按用户要求研究 LangSmith 之外的平台，并保持 EVOLVE 现有视觉风格。详细来源、Opik 官方截图及 EVOLVE 参考路径见[交互对照记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evaluation-platform-interactions-20261014/README.md)。本轮为研究，未修改业务 UI 或执行模型、优化任务、保存及发布；Langfuse 示例入口在选择 US 后转到注册页，未构成项目内实操证据。

**Why:** 评测平台分别覆盖人工 Prompt 试验、反馈辅助修改、自动候选搜索和完整应用复测。界面相似并不代表对象或执行范围相同；把局部涨分、最佳候选或正式采用当成实际应用会影响决策。

**How to apply:** 先沿结果反馈、资源 Diff、小范围验证、固定基线复测和单题证据核对完整动线，再映射到 EVOLVE 的 Case、Run 与 Candidate。Opik 此处的 Trial 是候选 Prompt 实验，应映射到 Candidate 与 Run，不直接替换 EVOLVE 的单题 Trial。Prompt 调试与完整 Agent 执行分开；更改评分口径应让两侧使用同一定义重评。当前功能、账号限制及布局会变化，应回到研究记录和官方来源刷新；不将本轮建议当成实施批准。

优先查阅 [Braintrust Playground](https://www.braintrust.dev/docs/evaluate/playgrounds) 和[实验比较](https://www.braintrust.dev/docs/evaluate/compare-experiments)、[Opik Optimization Studio](https://www.comet.com/docs/opik/development/optimization-runs/optimization_studio)；补充参照 [Langfuse UI 实验](https://langfuse.com/docs/evaluation/experiments/experiments-via-ui)与 [Phoenix Playground](https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/using-the-playground)。已有 LangSmith 现场实操见 [LangSmith 具体交互研究](langsmith-interaction-study-20261014.md)。
