---
name: evolve-workbench-v22
type: reference
created: 2026-09-10
updated: 2026-09-10
tags: [maxwell, evolve, studio, ui]
links: [evolve-drawer-overflow, evolve-explainability-and-optimization]
---

# EVOLVE v2.2 工作台与原型边界

设计输入：2026-09-10 的「表单回答事项.zip」，按 README → CHANGES-v2.1-judging-tab → CHANGES-v2.2-app-frame 阅读，最终参考 EVOLVE 工作区原型的开始 / Run 完成场景。实现入口：Maxwell 分支 `codex/evolve-workspace-ui-20260910`，提交 `8a865199`；合并与部署状态需实时查询。

**Why:** 长页面和多层详情会隐藏失败原因；固定框架、四页签与行内判卷可缩短读路径。但原型里的模拟动作和样例阈值不能替代服务端契约。

**How to apply:** 看 `apps/studio/src/products/evolve/V2_HANDOFF.md` 的 v2.2 条目及 `WorkbenchStore.ts`、`panels/WorkbenchResults.tsx`。确认撤销通过 request-changes 转为待修改；选择执行目标不代表已绑定；仅重跑错误项无接口时不能伪造入队。聚合 passThreshold 不必然是通过率阈值，维度与 Baseline 比较必须取自真实判卷和可比回执。可见用例建议允许 Agent 补断言，正式修订仍保持非空断言校验。

验证入口：Studio check/build，`WorkbenchStore.test.mjs`、`workbenchResults.test.ts`；浏览器需验收两个场景、单层 Trial 返回、内部滚动、1000/1440 宽度、快捷键与 JSON 填表。2026-09-10 使用真实组件和本地固定数据完成验证，不表示线上评测已运行。
