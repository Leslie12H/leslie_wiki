---
name: evolve-layout-research-20261016
type: reference
created: 2026-10-16
updated: 2026-10-16
tags: [maxwell, evolve, interaction, langsmith, opik]
links: [evolve-workspace-implementation-20261015]
---

# EVOLVE 成熟产品交互研究与差距入口

2026-10-16，用户要求先研究 LangSmith、Opik 的基础概念串联、整体布局和状态流转，明确差距后再实施；本次研究没有新增业务代码。

**Why:** 把已有功能分别放进图表、候选区、标签页和折叠表单，并不能形成连续工作。只覆盖完成态的原型也无法规定首次评测、部分结果和无候选时的内容，容易导致重复空态与概念堆叠。

**How to apply:** 先确定当前对象范围与状态，再定义默认工作面、选择联动、阅读与编辑边界。保留现有五项导航分类和 Maxwell tokens；页面不使用概念教学式问句或引导口号。当前实现与拟议调整应分别说明，不把局部检查通过当成设计获认可。

## 指针与边界

- 研究证据、官方来源、当前源码差距、状态提案、调整顺序与验收场景：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/research-20261016.md`。
- 原型及已确认交互：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-continuous-prototype-20261015/README.md`。
- 前序实现边界：[连续工作区实装指针](evolve-workspace-implementation-20261015.md)。

研究使用官方文档、官方界面截图、用户截图、本地只读页面和源码；没有在竞品付费工作区执行完整实验。版本、导航与现有实现会变化，应沿指针现场核对。设计推导不等于竞品已验证行为，也不等于 EVOLVE 已实现。

## 工作区与评分配置实施指针

- 五类对象的职责、横向导航的工作区/资产分组、版本关系、默认工作面和方法能力边界：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/workspace-and-evaluator-design-20261016.md`。
- 任务状态、评分阅读/编辑、定义检查及未保存草稿的浏览器证据：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/task-states-20261016/README.md`。

**Why:** LLM Judge 的 Prompt、模型、评分标准和运行策略不能仅因竞品放在一个编辑器内就混为同一持久化对象；只做布局翻译会产生保存位置和版本采用的歧义。

**How to apply:** 先查当前契约和方法实际消费字段，再给常用配置表单；以精确方法版本控制能力。定义 preflight、样本试评、真实运行出分和部署验证分别记录。引用读取失败不能变成“无引用”，未部署接口也不能靠前端占位宣称已经可用。当前支持范围和遗留问题沿上述验收记录现场核对。
