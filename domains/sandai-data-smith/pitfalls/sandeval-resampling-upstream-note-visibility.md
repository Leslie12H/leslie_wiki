---
name: sandeval-resampling-upstream-note-visibility
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sandeval, quality, reinspection, sampling, feedback]
links: [sandeval-repeated-return-feedback-lineage, sandeval-correction-reviewer-display-scope]
---

# Sand Eval 重抽范围与原意见可见性

**Why:** 原 Sand 逐题意见已保存、整批意见也可见时，供应商复验工作台仍可能整轮没有逐题意见。若唯一被 Sand 判不合格的题不在复验重抽集合内，按当前工作项匹配的意见组件没有可展示的对应原话。不能直接归因为意见丢失、作者字段缺失或姓名功能没上线。供应商前轮合格、Sand 后轮不合格还涉及跨关卡历史，单追供应商 previous_task_id 会漏掉它。

**How to apply:** 固定部署 SHA，用 quality_task_id、review_task_id、review_item_id 关联冻结 source_submission_id/source_submission_item_id 与 work_unit_id。比较本轮完整样本集合和原 Sand 有意见的工作项集合；用原题页面核对实际题号，不能拿抽样后序号替代。分别验证整批退回原话、逐题备注、当前范围和原判定。检查抽样规则是否涵盖两级最近有效不合格，并核对规则变更时间与历史计划创建时间；新规则上线不证明既有冻结样本已重建。人工整批退回的原检查可能为 stopped 且逐项 submitted_at 为空，须结合退回处置验证，不能因此判定备注未保存。

## 核验指针

- [2026-10-16 原单只读报告](/Users/leslie/Documents/Playground/output/sandeval-sand-note-20261016/report.md)：实时数据库、浏览器题号、样本交集、原文、部署 SHA 和未修改生产的边界。具体任务、人员与状态回到报告或线上重新核实。
- 前端入口：sand-eval/platform/frontend/src/pages/quality/inspection/ReviewWorkspace.tsx 的 selectedUpstreamNotes/selectedContextNotes，按稳定 work_unit_id 展示当前题意见。
- 抽样入口：sand-eval/platform/backend/quality/application/management/reinspection_sampling.py 的 historical_priority_members/rejected_lineage_members，以及 reinspection_service.py 的 required_member_refs。
- 跨关卡历史必抽变更指针：[99a5966622105a9370ba00637d0e11feb567a971](https://github.com/world-sim-dev/sandai-data-smith/commit/99a5966622105a9370ba00637d0e11feb567a971)。AuthorDate、主线 CommitDate、部署时间和历史计划创建时间分别取证；历史计划恢复须走本域 runbook 与明确生产授权，不裸改冻结检查项。
