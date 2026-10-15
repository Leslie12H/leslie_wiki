---
name: evolve-unified-ia-plan-20261015
type: reference
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, evolve, information-architecture, cases, metrics, benchmark, candidate, lineage]
links: [evaluation-platform-interactions-20261014, langsmith-interaction-study-20261014, evolve-design-clarity-20261013]
---

# EVOLVE 统一展示规划入口

2026-10-15，用户要求重点参考 LangSmith 与 Opik 的整体布局，统一规划 Case 管理、指标展示、Benchmark、候选谱系及相关概念，并沿用 EVOLVE 现有风格。产品建议、页面骨架、来源、当前本地源码复用点、落地顺序和验收见[统一展示规划](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-ia-plan-20261015/README.md)；源码指纹及链接检查见同目录的 `source-review-manifest.json`。这是待评审规划，未实施业务界面、接口、数据或部署变更。

**Why:** 导航名称与页面样式统一之后，仍可能混淆指标定义与测量、Benchmark 的固定比较范围与对象跨任务历史，以及候选派生、验证基线、重评来源和实际应用。需要统一对象身份、范围及阅读路径。

**How to apply:** 先看规划的主结构和对象表，再沿用例到 Benchmark、Run、候选及验证的完整动线核对当前代码。保留用例与评分的核心地位、全指标概览和单题证据；谱系作为任务或对象范围内的关系视图。执行连接与实际 targetRef 分别核对，历史资产读冻结修订，接受和发布分别取证。规划所列页面和读取能力会变化，实施前重新验证生成客户端与完整分页合同；不把本地未提交源码或参考图当作部署及产品验收。

官方来源与公开界面的核对边界见 [LangSmith 研究](langsmith-interaction-study-20261014.md)和[平台交互对照](evaluation-platform-interactions-20261014.md)；用户已有桌面优先与页面连续阅读约束见[页面清晰度](../pitfalls/evolve-design-clarity-20261013.md)。
