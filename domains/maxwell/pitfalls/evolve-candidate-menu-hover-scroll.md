---
name: evolve-candidate-menu-hover-scroll
type: pitfall
created: 2026-10-30
updated: 2026-10-30
tags: [maxwell, evolve, studio, ui, acceptance]
links: [evolve-historical-baseline-and-async-acceptance]
---

# 候选菜单鼠标目标位移

**Why:** 同一菜单键盘选择正常而鼠标选错时，不能直接归因路由或旧高亮重放。本次长候选说明令单项高于滚动容器，hover 改变游标触发自动滚动，导致按下/释放之间目标移动；键盘原实现正确是重要反证。

**How to apply:** 对照鼠标与键盘、选项与容器实际尺寸，再区分 hover 与键盘的滚动意图。仅缩短菜单预览，完整内容仍留在无障碍名称和详情；打开/键盘导航保持可见定位，鼠标悬停不主动移动目标。默认折叠列表的 SSR 测试应验证折叠语义，展开后的记录身份仍需实际交互核对。已尝试但未证实的高亮补丁应撤回，不用一次现象解释所有选择问题。

源码沿 Maxwell `apps/studio/src/products/evolve/v3/EvolveSelect.tsx` 与 `ledger/LedgerLineage.css` 回查；实际鼠标复验、截图、完整审查增量、CI 与 dev 发布状态见 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的 2026-10-30 23:13 条目。界面修复、实际候选应用与全量质量结果分别验收。
