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
- 用户选定 B 后明确 0/1/多次适配，正式首屏已实施为单次默认、显式多次比较。组件测试、登录后真实只读页面的单列/双列/返回、窄屏与后端 502 恢复边界继续沿上述实施记录核实；本轮没有启动新评测或部署。

## B 方向的阅读连续性

**Why:** 固定双轮构图不能覆盖零次或单次运行；列表轮询若持续取消较慢的读取，保存的备注和真实进度会长期不出现。备注与实际目标版本也有不同证据来源。

**How to apply:** 默认单次完整阅读，显式选择多次才并排。冻结 Variant 的可读名称作为备注，实际版本仍以运行回执为准。同一选择的读取未结束时不被列表轮询重启；切换选择或评分口径则淘汰迟到响应，结果分页核对投影代次。已经核验的备注缓存与当前评分结果分开管理。当前源码见 `BenchmarkReadingStore.ts`、`benchmarkReading.ts`、`BenchmarkReadingOverview.tsx` 和相邻测试，完整浏览器证据见实施记录。
