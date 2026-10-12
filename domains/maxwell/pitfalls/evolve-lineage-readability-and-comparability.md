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

产品约束回到[通用工作台方案](../projects/evolve-nextplay-entry-plan-20261009.md)的“对话协作、候选来源、谱系与可比趋势”。初次审查仅覆盖截图和源码；后续本地实施与真实页面验收见下节。未获得新的接口或数据库变更授权。

## 2026-10-12 完整视图入口的补充

**Why:** 用户继续追问完整趋势和完整调优路径的入口。改善密度不能隐藏主阅读目标。

**How to apply:** 见本次审查记录的“完整趋势与完整迭代路径的入口”。当前入口分别核对 Benchmark 详情的按页结果、对象页的历史读取范围、任务右侧候选谱系及进展/报告。完整趋势与完整迭代路径应保留明确主入口；范围、分页、缺失来源和不可比口径可见，趋势点与节点相互定位。不要将局部记录或第一页称为全量历史。这是实施前的阅读目标；后续结果见下节。

## 2026-10-12 完整历史实施与真实页面验收

**Why:** 真实旧 Run 的新版结果汇总可能缺少投影，但原统计与逐题判定仍存在；直接替换数据源会让既有成绩消失。最新验证没有判卷结果时，取旧成功记录也会制造错误的“当前效果”。

**How to apply:** 从[完整实施与验收记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/lineage-history-acceptance-20261012.md)重新核对当前代码与运行证据，实时数据和发布状态以页面、仓库及发布记录为准。完整性需分别穷尽 Works、Run catalog、任务 Runs、Candidates、Artifacts 和结果指标分页；失败应标明未读全，不把第一页称为全量。原判卷统计与新版/复核评分分别保留口径，未知和执行错误不补零。原始统计复用 `panels/runRates.ts`；后续迁移完成与否须实时核验，不能从 ready 状态推断已有完整投影。

趋势与谱系共享精确的 Work/Candidate/Run/Artifact 选择，URL 保留范围与评分口径；跨视图定位可清除遮挡筛选，外页返回恢复原上下文。历史目录与任务资产分批到达时，链接不能丢掉所选候选/验证。派生只认明确引用；显示同一冻结标准的测量时还需核对执行方式、判卷配置及完整判定，不能因题集/评分 ID 相同就混连。范围名称要可区分。

此次证据覆盖本地 Studio 接真实后端的历史阅读、双向定位、详情往返、过滤及桌面/窄屏。多百条分页、复杂分支与竞态属于技术回归，不能写成真实后端大历史或自然 Agent 场景通过。此记录不表示代码已发布。
