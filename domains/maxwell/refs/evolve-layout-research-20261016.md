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
