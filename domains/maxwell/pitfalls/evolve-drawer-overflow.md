---
name: evolve-drawer-overflow
type: pitfall
created: 2026-09-09
updated: 2026-10-17
tags: [maxwell, studio, evolve, frontend]
links: [evolve-explainability-and-optimization]
---

# EVOLVE 抽屉完整展示与滚动验收

**Why:** 长编号、工具按钮和 Grid 子项的最小内容宽度可能撑开抽屉。脱离 Portal 和真实滚动容器的静态 HTML 预览不能证明抽屉内所有内容可到达；仅检查题目区域也会漏掉评分表、元数据和底部操作。

**How to apply:** 在真实 Run / Trial / Artifact 组件中放入长中文、无空格编号、长输出和多行列表。检查标题与正文独立滚动、元数据展开、全部页签、叠加/返回、底部操作；比较正文 clientWidth 与 scrollWidth，宽表格的横向滚动限于表格内部。核验展开后的文本末尾，不能把 DOM 含有文本当作视觉可读。

## 代码与验收指针

- Maxwell 分支 `codex/trial-detail-ui`；合并和发布状态须从 Git/部署记录核验。
- `apps/studio/src/products/evolve/drawers/DrawerShell.tsx` 与 `drawerShell.css`：公共头部、正文滚动、长编号与窄屏边界。
- `drawers/TrialDrawer.tsx` 与 `trialDrawer.css`：正文/JSON 分流、输出展开和回执布局。
- `typed/EvidenceSetView.tsx`、`TypedArtifactView.tsx`：证据完整输出与未知产物类型的原始数据展示。
- `pnpm --filter @maxwell/studio check` 和 `build` 检查不替代真实浏览器的滚动、页签和响应式验收。


## 2026-10-17：刷新连续性与评测作用域

当前实现与技术回归见 [Maxwell PR #362](https://github.com/world-sim-dev/maxwell-ai/pull/362) 和仓库 `services/evolve-server/docs/evolve-evaluator-workspace.md`。PR、CI 与发布状态以这些来源为准。

**Why:** Store 保留旧结果，不代表组件没有被 loading/error 整块替换；effect 在渲染后才清理旧 Case，也可能短暂显示别条用例的预期。非模态抽屉允许直接切换 Run，旧 Trial、复核目标或操作参数若留在 URL，会污染新选择。

**How to apply:** 同时验证 Store 和实际组件的刷新/失败态，保留已读内容并明确状态；按当前业务与冻结 Case 修订同步门控正文和错误，只在所需页签读取，并取消过期请求。切换 Run 清理其内部状态，保留外层比较、筛选与分页；同一 Run 返回列表可保留阅读页签。取消已获接受后，以回执更新状态，不因后续读取失败退回旧状态。模拟网络与静态组件测试仍不替代真实浏览器视觉和滚动验收。
