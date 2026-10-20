---
name: sandeval-inspection-note-draft
type: reference
created: 2026-09-25
updated: 2026-10-20
tags: [sand-eval, quality, inspection, autosave]
links: []
---

# Sand Eval 质检备注草稿恢复入口

**Why:** 2026-09-25 按 `look` 的 Sand 质检任务核对：新质检工作台的「质检备注」原先只在页面组件状态中，选择判断并点击保存后才与判断一起写入服务端；刷新会重新从已保存的检查项初始化，所以未保存意见会消失。答案编辑已有浏览器草稿，但它不覆盖这块备注。

**How to apply:** 排查类似丢字时先区分「本机草稿」与「服务端已保存判断」，再核对 `sand-eval/platform/frontend/src/pages/quality/inspection/ReviewWorkspace.tsx`、`reviewNoteDraft.ts`、`ReviewJudgmentForm.tsx` 及 `platform/backend/quality/application/inspection/review_service.py::_save_judgments`。候选修复在 `codex/inspection-note-autosave` 分支：备注即时写当前浏览器，按账号、空间、任务、轮次和题目隔离；刷新恢复，服务端判断保存成功后清理。具体行为以当前代码及 `platform/backend/app/usage_docs/content/inspector/complete-inspection-task.md` 为准。2026-09-25 仅本地定向测试通过，尚未创建 PR、通过 Gate 或部署；不能据此认定生产已恢复。


## 2026-10-20 误退回与原设备草稿核对入口

**Why:** 整批退回说明已保存，不代表当前逐题备注已正式保存；任务被退回后停止，也可能只是隐藏仍留在原浏览器的备注草稿。服务端逐题note为空不能单独证明原设备文本被删除。

**How to apply:** 按生产实际SHA核对 `ReviewWorkspace.tsx` 的 `returnBatch`、`draftForItem` 与 `reviewNoteDraft.ts` 的存储键、有效期和观察模式。恢复原轮次后，让原质检员用原设备、原浏览器、同账号与空间打开原链接检查草稿；管理员只读代看不代表访问到了原设备草稿。整批说明、历史供应商反馈和当前逐题草稿要分别取证，不互相代填。

只在明确授权且未接单、未产生子整改/执行、来源答案无后续变化、原轮次无正式判断或后继轮次时评估撤销；先冻结预案，再用带版本占用、持久审计和独立读回的单例operator恢复同一轮次，保留原退回历史。不要将“撤销误退回”记为质量合格，不能把此单条件外推到已有供应商工作或完成的退回。

本次生产SHA、目标身份、预案hash、逐步回执、原生可用操作及页面读回仅保留本地验收入口：`/Users/leslie/.codex/visualizations/2026/10/19/01a1544d-7a4e-75d2-86c4-7fdd7aa21cb2/sandeval-sand-return-2867-20261020/report.md`。这是单例恢复证据，不是通用产品撤回功能上线证明；原设备未取得，逐题草稿是否仍在尚未验收。
