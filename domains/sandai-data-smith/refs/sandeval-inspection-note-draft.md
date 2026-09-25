---
name: sandeval-inspection-note-draft
type: reference
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, quality, inspection, autosave]
links: []
---

# Sand Eval 质检备注草稿恢复入口

**Why:** 2026-09-25 按 `look` 的 Sand 质检任务核对：新质检工作台的「质检备注」原先只在页面组件状态中，选择判断并点击保存后才与判断一起写入服务端；刷新会重新从已保存的检查项初始化，所以未保存意见会消失。答案编辑已有浏览器草稿，但它不覆盖这块备注。

**How to apply:** 排查类似丢字时先区分「本机草稿」与「服务端已保存判断」，再核对 `sand-eval/platform/frontend/src/pages/quality/inspection/ReviewWorkspace.tsx`、`reviewNoteDraft.ts`、`ReviewJudgmentForm.tsx` 及 `platform/backend/quality/application/inspection/review_service.py::_save_judgments`。候选修复在 `codex/inspection-note-autosave` 分支：备注即时写当前浏览器，按账号、空间、任务、轮次和题目隔离；刷新恢复，服务端判断保存成功后清理。具体行为以当前代码及 `platform/backend/app/usage_docs/content/inspector/complete-inspection-task.md` 为准。2026-09-25 仅本地定向测试通过，尚未创建 PR、通过 Gate 或部署；不能据此认定生产已恢复。
