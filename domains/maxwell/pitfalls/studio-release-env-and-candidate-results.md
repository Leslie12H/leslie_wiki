---
name: studio-release-env-and-candidate-results
type: pitfall
created: 2026-09-17
updated: 2026-09-17
tags: [maxwell, studio, evolve, deployment, candidate]
links: [evolve-candidate-editable-baseline-and-regrade-comparison]
---

# Studio 发布环境变量与候选结果展示

**Why:** 2026-09-17 验证候选展示修复时，Web 发布流程成功，但浏览器白屏。工作流迁移为 composite action 后，步骤 env 中的 VITE_BUILD_VERSION 从同层 env.BUILD_VERSION 求值为空，Vite 生成同源 /assets/ 路径；线上这些请求经 SPA 回退返回 HTML。构建成功、OSS 复制成功不代表浏览器可运行。

**How to apply:** 发布参数直接引用 action inputs / github context，避免同层 env 互相引用；上传前验证生成的 index 引用同一版本 CDN 的 JS、CSS 和 preload。上线后还要确认入口资源 MIME 与真实页面。修复、回归和发布状态读取 [PR #308](https://github.com/world-sim-dev/maxwell-ai/pull/308)；失败证据入口是 [DEV 发布 35177125323](https://github.com/world-sim-dev/maxwell-ai/actions/runs/35177125323) 的 Build Studio 空变量日志。

候选面板修复入口：[PR #307](https://github.com/world-sim-dev/maxwell-ai/pull/307)。单候选不能依赖手动多候选 comparison 才加载得分；候选生命周期 evaluating 与 Run 执行状态应区分；冻结 DecisionReport 不一定已经绑定 candidate.decide。展示原始分数时保留重判/真实执行来源与 Judge 质量提示，不据未校准分数宣称优化有效。

业务生成端与评测端分开验收。对 Nextplay 输出引用错误，先保留冻结 baseline 和错误证据，用独立业务规则检测，再将生成端改动作为候选验证后决定采用。不能因修复平台展示，直接修改业务默认 Agent。相关边界讨论入口：[nextplay-fe #33](https://github.com/world-sim-dev/nextplay-fe/pull/33) 与 [回滚 PR #34](https://github.com/world-sim-dev/nextplay-fe/pull/34)；当前合并与资源状态需现场核对。

2026-09-17 验收入口：[main Web 重新发布 35178109146](https://github.com/world-sim-dev/maxwell-ai/actions/runs/35178109146)（headSha 71486d35716976ffc655f5ac25575b8b3014e9ce）。该次发布后浏览器候选页能读取最近评分、重判与基准 Run、建议拒绝报告及 Judge 质量不足提示；入口脚本来自版本 CDN 且返回 application/javascript。线上后续状态仍从 Work/Run 与发布记录查询。

## 候选正文、Benchmark 定版与并发

**Why:** 候选列表中的 hypothesis 是修改理由，不是实际被冻结并发送的 Variant 正文。Benchmark 索引为空也不代表业务没有题集、Judge 或 Run；它表示尚未建立业务级、版本化的测量组合。入口修复见 [PR #309](https://github.com/world-sim-dev/maxwell-ai/pull/309)。

**How to apply:** 从候选的 variantArtifactRef / baseVariantArtifactRef 读取精确冻结内容，外部资源引用不能冒充完整文件快照。Benchmark 从来源 Run 复制 CaseSet/Judge 的精确 id+hash 和重复/聚合策略；定版前核验内容与 Case 数量。定义创建、历史结果登记、Judge 校准是三件事，不因创建定义而回填可信成绩。

Nextplay A2A 的外层任务通过 Registry.Dispatch 的 ReturnImmediately 返回 task id；livePass 先填满远端并发槽位，随后轮询补位，不是等每题完成才派发下一题。配置入口是 executor limits.maxParallel 与 EVOLVE_A2A_MAX_PARALLEL_TRIALS；前者须从实时配置读取，不能用默认值推断当前值。回归入口：evaluation/live_parallel_test.go 的五题四槽测试证明任何题完成前已有四个 remote_running。当前 evaluateTrials/forEachTrial 为同一 Run 顺序判卷；A2A 多轮和同步 HTTP 的阻塞 Dispatch 路径不能套用 Nextplay 异步外层的并发结论。

2026-09-17 UI 验收补充：只调用旧 store.openArtifact 会读取详情，但当前工作台不挂载旧 ArtifactDrawer，候选按钮因此没有可见反馈。应通过工作台 openArtifactUrl + selectAsset 展开并定位冻结产物；正文、基线、报告三个入口都要按点击结果验收。补丁入口：[PR #310](https://github.com/world-sim-dev/maxwell-ai/pull/310)。

Benchmark 定版验收入口：[单 Case 冒烟 Benchmark](https://agent.sandaii.cn/evolve/benchmarks?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&work=work_f3bc66b38eb27fc777d927aaa1aeef67&benchmark=bench_e4cbea8f43f9311346970f0eda8fc75e)。只复用原 Run 的测量配置，没有校准 Judge、导入更多用例或登记历史结果；后续版本与成绩以该入口实时数据为准。
