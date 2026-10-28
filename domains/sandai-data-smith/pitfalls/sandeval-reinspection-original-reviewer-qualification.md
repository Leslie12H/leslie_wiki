---
name: sandeval-reinspection-original-reviewer-qualification
type: pitfall
created: 2026-10-28
updated: 2026-10-28
tags: [sand-eval, reinspection, qualification, space-membership, case-recovery]
links: [sandeval-manual-return-passed-status-handoff-gap]
---

# 整批复验默认原质检员与换人后的冻结人员校验

**Why:** 批次表“安排整批复验”沿用原质检员。离开供应商空间或失去检查资格后，该动作会拒绝。2026-10-28 指定单案还证明：整改详情的原生“分配本轮复验”允许选新质检员，计划创建可成功，但创建器把新人员写进前驱报告人员字段，而作答校验仍对比原报告人员，导致任务进入本人待办后不能保存。派单成功和可实际作答必须分开验收。

**How to apply:** 先核对包所属空间、原质检员实时资格、真实整改接收人、正式提交与唯一后继。换人时排除原作者和整改人，并核验真实质检员角色与待办量。不能把“plan_ready”或“active”当成恢复完成；必须以目标人员身份核对待办、首题读取、save_items，以及原报告和正式答案不变。复验已准备仍不代表质检通过。

## 源码指针

重新按当前部署版本读取 `sand-eval/platform/frontend/src/pages/quality/management/BatchReviewTable.tsx`、`resolution/ResolutionWorkspace.tsx`、`backend/quality/application/management/reinspection_service.py`、`inspection/review_service.py::check_blockers` 和 `domain/inspection/review_task.py::planned_assignee_id`。这些入口分别解释固定选人、整改选人、计划生成、前驱校验及交接后原指派恢复；不把旧行号当作现行规则。

## 2026-10-28 明确授权后的单案恢复

- [恢复回执](/Users/leslie/Documents/Playground/output/liaojunjia-reinspection-20261028/recovery-receipt.md) 汇总用户指定范围、实际分配、部署版本与验收；现场状态会变化，按其证据及线上重新读取。
- [只读预检](/Users/leslie/Documents/Playground/output/liaojunjia-reinspection-20261028/case-recovery-preview.json) 固定完整前像、新旧计划、人员、题目范围和哈希。内存构造的修正计划通过现有生产守卫，并负向证明错误前驱版本仍被拒绝。
- [单案流程](/Users/leslie/Documents/Playground/output/liaojunjia-reinspection-20261028/case-recovery-runbook.md) 和同目录 `case_recovery.py` 为本单受控恢复指针：默认只读，显式 apply + 原预检哈希，进入原生包屏障；保留旧快照，新建纠正后的计划，先存不可变恢复档案，再CAS重绑唯一未作答后继，登记真实修复回执，最后走原生交接给实际质检员。没有恢复原人的成员资格、改旧报告、改答案、清业务占用或代交卷。
- [应用审计](/Users/leslie/Documents/Playground/output/liaojunjia-reinspection-20261028/case-recovery-apply.json)、[另一副本独立回读](/Users/leslie/Documents/Playground/output/liaojunjia-reinspection-20261028/final-independent-readback.json) 和[完整审计导出](/Users/leslie/Documents/Playground/output/liaojunjia-reinspection-20261028/final-recovery-audit.json) 分别证明写入、可作答和前像/交接追溯。原报告、正式整改答案及样本保持不变，没有额外轮次。

## 适用边界

这是明确授权、精确冻结、尚未发生任何人工判断的单任务恢复，不是通用平台修复，也不是可直接套用于其它任务的SQL。已有保存、意见、仲裁、提交、版本变化或并发写入时必须停止并重新评估。所有语句独立提交，不承诺回滚；失败或未知结果先读审计和现状，不盲目重试。复验状态及未来通用修复的发布情况只沿证据指针重新核验。

相关：[人工退回后的通过状态与转交断点](sandeval-manual-return-passed-status-handoff-gap.md)。
