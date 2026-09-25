---
name: sandeval-cross-stage-feedback
type: reference
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, quality-center, reinspection, feedback]
links: [sandeval-reinspection-sampling-lineage]
---

# Sand Eval 跨关卡退回意见可见性

**Why:** 2026-09-25 排查质量任务 `QT-77f2452de266548a83e8c466ae107d1a`：Sand 质检对黄佳辉批次两题写了逐题修改意见，并将整批退回给供应商负责人；负责人在空间质检链路中填写了另一条退回原因。生产页面当时的第 5 轮空间质检能显示负责人原因，不能显示 Sand 质检的整批原因或逐题意见。该轮当时仍在质检中，不可把标注员未见意见当作已经发生的本轮页面实测。同任务另一题本轮 Sand 质检为“不合格”，队列下方绿色“空间质检合格”来自上游空间质检旧判断，并非本轮结论；文案和颜色没有明确区分历史。

**How to apply:** 排查多级退回时分别核对 Sand 质检原报告的逐题 `note`、Sand 退回 `Disposition.note`、负责人后续处理说明、空间质检的新轮次，以及标注员整改预览。不要把“本轮整改依据”显示了负责人说明视为 Sand 原意见已送达。需要新增受限的跨关卡、按批次和题目精确映射的只读投影；不能直接放开上级整份报告或全局 `Disposition` 读取权。

代码核验入口：`sand-eval/platform/backend/quality/application/inspection/review_query_service.py` 的 `detail` 只从直接上一轮与匹配的执行记录组成 `correction_notes`；`add_upstream_verdicts` 仅为 Sand 阶段展示前驱结论，且刻意只带 verdict。`sand-eval/platform/backend/quality/application/resolution/disposition_query_service.py` 的 `visible` 限制处置读取范围。`disposition_issue_service.py` 对 `manual_annotation_return` 的问题页使用该次退回自己的 `note`；`answer_correction_service.py` 按该整改对应检查组投影逐题判断。前端分别见 `ReviewWorkspace.tsx`、`AnswerCorrectionPanel.tsx`。

候选修复入口：业务仓分支 `codex/inspection-note-autosave` 中，`delegated_feedback.py` 沿复验执行找到委派子处置和 Sand 原退回；`disposition_issue_service.py` 沿质检员再次退回标注的父处置链，按本人整改批次的工作项映射 Sand 原逐题意见；页面明确标注原退回意见与历史上游判断。该分支截至 2026-09-25 尚未通过 PR Gate、合并、发布或由标注员现场验收，不能视为生产已修复。
