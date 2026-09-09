---
name: evolve-drawer-overflow
type: pitfall
created: 2026-09-09
updated: 2026-09-09
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
