---
name: evolve-query-latency-and-tuning-visibility
type: pitfall
created: 2026-10-18
updated: 2026-10-18
tags: [maxwell, evolve, performance, tuning, visibility]
links: [evolve-inline-metrics-catalog-visibility, evolve-layout-unification-20261018]
---

# EVOLVE 查询耗时与隐藏基线调优的边界

**Why:** 浏览器请求耗时、鉴权依赖、查询服务耗时、数据库执行和对象读取是不同层。接口慢不能直接推出慢 SQL 或锁竞争。普通共享调优 Agent 的可见范围又与人工评测管理权限不同，绑定隐藏基线不等于 Agent 获得了隐藏材料；资源型候选还依赖执行凭据的读取权限。

**How to apply:** 先对齐业务、冻结版本、Run/Work/Thread、页面版本及实际部署 SHA，再比对浏览器瀑布、独立鉴权计时、查询指标、只读执行计划及不同时点锁采样。保留原来的 CAS/权限检查，优先消除多 Store 重复读取和无用历史预读；不能把空闲锁快照当作高峰无争用证明，也不能盲目加索引。调优遇到基线不可读时核对 Case 可见性与共享会话访问级别，保持隐藏集保护；缺目标配置、提示词或技能读取权限应如实阻塞，不能改规则、补零或无候选实测就宣称提升。

- 源码、回归范围与真实调优记录：[PR #365](https://github.com/world-sim-dev/maxwell-ai/pull/365)，`docs/verification/2026-10-18-evolve-ui-performance.md`。
- 动态运行、SQL 计划、锁采样、发布回执、浏览器会话边界及最终报告：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ui-performance-20261018/`。现场结论必须查该记录，不以本页替代当前状态。
- 读取层入口：`products/evolve/inflightReads.ts`、`benchmarks/BenchmarkResultsPanel.tsx`、`BenchmarkTargetFilter.tsx`；后端 `application/queries/benchmark_definition.go`、`queries/tuning_baseline.go`、`transport/http/handler.go`。
- 调优授权入口：`application/agentsessions/service.go` 的共享 visible 边界；`queries/service.go` 的 Run 输入授权；外部目标读取凭据是另一条边界。Agent 对跨 Work 的推测不能替代独立核实。
