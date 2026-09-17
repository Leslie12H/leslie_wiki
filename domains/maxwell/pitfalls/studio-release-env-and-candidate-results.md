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
