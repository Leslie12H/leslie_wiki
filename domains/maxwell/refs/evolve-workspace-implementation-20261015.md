---
name: evolve-workspace-implementation-20261015
type: reference
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, evolve, studio, ui, validation]
links: [evolve-commercial-ui-20261015, evolve-continuous-workspace-layout-20261015]
---

# EVOLVE 连续工作区实装与验证入口

2026-10-15，用户授权按原型的布局在 Maxwell 项目中开始实施，明确要求融合项目 token，不逐像素照抄原型。此前关于暖色、边框与投影的反馈仍有效；实施授权不等于最终视觉认可。

**Why:** 原型只能说明组织方式。落地要让已有 Case、Benchmark、Run、指标修订和候选证据在同一阅读路径中工作，并保持 Maxwell 的表面、文字、控件和阴影层级。

**How to apply:** 从当前代码和下方验收记录核实实现范围；采用同一外层工作面、上方趋势与下方记录、指标分组内比较运行。用冻结身份关联结果，不凭相同名称合并指标或用例。统计未读到不能写成没有运行，缺失值不能补零。任务当前草稿的 Case 清单也不能替代历史 Benchmark 的冻结用例。

## 指针

- 本轮实现与真实浏览器验证：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-layout-implementation-20261015/README.md`。截图、检查命令、受测记录、范围限制和本地服务入口均在该记录；可变状态以现场为准。
- 视觉系统：`apps/studio/src/styles/tokens.css`、`src/components/composite/TableFrame/TableFrame.tsx`、`src/products/evolve/v3/workspace.css`。
- Benchmark 综合趋势与汇总读取：`src/products/evolve/benchmarks/BenchmarkMetricsOverview.tsx`、`BenchmarkOverviewStore.ts`、`benchmarkOverview.ts` 及相邻测试。
- 指标分组与冻结用例回归：`src/products/evolve/v3/matrix/MetricVersionMatrix.tsx`、`matrixMetrics.ts`、`matrixModel.ts` 及相邻测试。
- 对象趋势与记录、任务上下文切换：`src/products/evolve/v3/lineage/EvolutionMetrics.tsx`、`src/products/evolve/v3/ledger/TaskSidePanel.tsx`。

本轮为前端本地实装验证，真实服务数据仅只读浏览；未新建评测、发送 Agent 消息、应用候选或部署。不要把截图中的旧 Run 当成本轮执行结果。
