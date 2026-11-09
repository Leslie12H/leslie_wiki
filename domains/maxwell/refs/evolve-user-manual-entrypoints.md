---
name: evolve-user-manual-entrypoints
type: reference
created: 2026-11-09
updated: 2026-11-09
tags: [maxwell, evolve, user-guide, benchmark, a2a]
links: [evolve-benchmark-unified-plan-review, evolve-preset-evaluation-entry, evolve-trial-review-boundaries]
---

# EVOLVE 使用手册与环境查证入口

**Why:** 第一次使用、线上问题诊断和已有基线的候选验证是不同入口。还需区分用例资产、执行连接、实际运行配置、评分来源和业务发布。连接成功不能证明执行、判卷或候选应用完成；源码有入口也不等于目标环境已发布。

**How to apply:** 用户操作手册在 Maxwell 工作区 `docs/evolve-user-manual.md`（2026-11-09 初稿；是否已进入业务仓库主线须核对 Git）。按「接入 → Case → 评分 → Benchmark → 运行 → 候选验证」查页面，只有原会话时先走诊断入口。具体按钮与能力回查实际版本的 `EvolveNavigation.tsx`、`BenchmarkDetailPage.tsx`、`RecordsPage.tsx`、`RuntimeTuningPage.tsx`；开发者按 [Executor Kit](https://github.com/world-sim-dev/maxwell-ai/tree/main/services/evolve-server/docs/executor-kit) 与 [原生指标评分服务](https://github.com/world-sim-dev/maxwell-ai/blob/main/services/evolve-server/docs/native-grading-provider.md) 回查执行与评分两个契约。

核对线上版本：读取对应环境的 Studio HTML，比较其中 `cicd-<run_id>-<attempt>` 的静态构建路径，再按 Actions 的实际作业核对 Web、EVOLVE、Agent API、Worker 是否分别发布。入口域名或发布标题不足以区分环境与服务。2026-11-09 取证入口：[日常 Studio](https://agent.sandaii.cn/evolve)、[DEV HTML](https://static.sandcdn.com/deploy/maxwell/dev/studio/index.html) 和 [DEV 回执](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42591994053)；另比对 [生产 HTML](https://static.sandcdn.com/deploy/maxwell/prod/studio/index.html)、[生产 Web 回执](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42182539731)、[生产 EVOLVE 回执](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42171569360)。此为只读查证，不能替代当前部署或业务实跑。
