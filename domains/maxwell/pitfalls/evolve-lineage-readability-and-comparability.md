---
name: evolve-lineage-readability-and-comparability
type: pitfall
created: 2026-10-12
updated: 2026-10-12
tags: [maxwell, evolve, studio, lineage, ux]
links: [evolve-nextplay-entry-plan-20261009]
---

# EVOLVE 谱系的阅读结构与可比性

**Why:** 2026-10-12 用户指出对象谱系难读。截图与本地源码审查发现，稀疏候选仍占完整双泳道，节点靠短 ID、颜色和图例传达含义；趋势连线与来源推断还会影响结果解释。视觉调整必须同时保护证据语义。

**How to apply:** 从[本次审查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/lineage-readability-review-20261012.md)和 `apps/studio/src/products/evolve/v3/lineage/` 的 `LineageGraph`、`LineagePage`、`EvolutionTrend`、`evolutionModel` 重新核对当前实现。先让用户读懂来源、改动、验证结果及接受/应用状态；稀疏记录用紧凑布局，真实分支才展开图。明确引用才能证明派生，内容相同只能证明一致。趋势需核对题集、评分版本、有效评分范围及执行范围，不能仅按时间串联。未知、未评分、无有效样本与真实零分分别处理。

产品约束回到[通用工作台方案](../projects/evolve-nextplay-entry-plan-20261009.md)的“对话协作、候选来源、谱系与可比趋势”。本次仅截图和源码审查；未修改产品代码，未核验部署版本或真实统计数据，也未获得新的接口或数据库变更授权。
