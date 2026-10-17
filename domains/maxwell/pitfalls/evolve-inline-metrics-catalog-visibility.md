---
name: evolve-inline-metrics-catalog-visibility
type: pitfall
created: 2026-10-18
updated: 2026-10-18
tags: [maxwell, evolve, benchmark, scoring, catalog]
links: [evolve-layout-research-20261016, evolve-nextplay-ten-case-acceptance-20261015]
---

# Benchmark 内嵌评分与独立资产目录的可见性

**Why:** 独立指标、评估器目录与冻结 Case 内嵌评分绑定属于不同读取来源；独立目录为空不能推出 Benchmark 没有指标，运行尚未出分也不能作为隐藏评分定义的理由。仅阅读通用 JudgeSpec 会漏掉逐题有效绑定。

**How to apply:** 先核对 Benchmark 冻结组成、JudgeSpec 与冻结 Case 的有效绑定，再区分独立资产、内嵌定义、外部评分方法和测量结果。聚合展示必须保留版本、来源和适用范围，不按相同名称合并不同规则，也不将只读投影冒充独立发布资产。

- 本次只读页面证据、历史原件提取、源码入口与建议边界：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-display-audit-20261018/README.md`。目录数量和当前界面以现场为准。
- 旧对象历史路由及主动入口查 `apps/studio/src/products/evolve/v3/routes.ts`、`v3/library/ObjectDetailDrawer.tsx`；新版导航不等于旧入口已经退役。
- 原十题 Provider 升级与 v3 冻结身份继续沿[十题验收入口](../refs/evolve-nextplay-ten-case-acceptance-20261015.md)核实。本轮未迁移资产、改业务代码或启动评测。
