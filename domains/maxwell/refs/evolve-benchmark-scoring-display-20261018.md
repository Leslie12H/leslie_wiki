---
name: evolve-benchmark-scoring-display-20261018
type: reference
created: 2026-10-18
updated: 2026-10-18
tags: [maxwell, evolve, benchmark, scoring, navigation]
links: [evolve-inline-metrics-catalog-visibility, evolve-layout-research-20261016]
---

# Benchmark 外部评分展示与旧入口收敛

**Why:** 外部服务当前声明、冻结 Case 有效绑定和独立发布资产属于不同身份；展示既有定义不应以创建资产或重写历史评分为前提。

**How to apply:** 当前实现、三方向初稿、测试结果与未完成的登录后验收见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-improvements-20261018/README.md`。按同一指标定义组织导航时保留逐题配置和阈值；跨页读取核验冻结身份与完整范围，不能按名称把不同方法版本合并。

- 冻结评分读取：`apps/studio/src/products/evolve/benchmarks/BenchmarkScoringStore.ts`；页面：`v3/library/BenchmarkScoringPanel.tsx`。复用既有 definition snapshot 接口，不将服务当前版本替换历史版本。
- 外部声明目录：`v3/library/ExternalScoringAssets.tsx`，按服务加载指标；外部方法不冒充独立评估器资产。
- 旧对象分析路由迁移：`v3/lineage/legacyObjectNavigation.ts` 与 `LegacyObjectRedirect.tsx`。继续保留已选 Run、对象和任务身份，配置入口回对象目录。
- 首屏视觉仅交付三方向初稿，尚未选择/实施；真实服务页面验收、发布状态沿实施记录现场核实。
