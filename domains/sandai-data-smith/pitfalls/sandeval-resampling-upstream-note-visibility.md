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


## 分享链接权限与管理员查看模式

**Why:** 上游 Sand 质检员拿到供应商第 2 轮工作台链接时，可能因该报告由另一位执行人持有而被拒绝。原 Sand 意见存在与本人能否访问供应商复验是两项事实。root 登录能打开也不能代替本人访问证据：具体记录的查看模式会按实际执行人自动切换，URL 的 observe_account 不一定是最终读取身份。

**How to apply:** 先确认用户打不开的是当前复验还是原 Sand 检查，按当前账号真实来源上下文调用 ReviewService.require/assert_visible，分别核对执行人、allowed_actions、负责人和精确下钻授权。观察浏览器最终 URL 和“正在查看”的姓名；不可将 root 自动选中的执行人当作用户本人，也不可仅凭角色名断言可以看下游报告。区分历史检查、退回日期与今天的操作，不用历史署名证明当日质检。

- [2026-10-16 侯香伊访问原链接只读核验](/Users/leslie/Documents/Playground/output/sandeval-sand-note-20261016/hou-access-report.md)：真实 Actor 授权、双方读取结果、历史日期及未检查用户真实会话的边界；账号与任务状态重新现场核查。
- 代码入口：quality/application/inspection/review_service.py::assert_visible；app/api/root_observation.py::resolve_owner/open_context。按线上 SHA 读取，不能借管理员查看模式扩大原用户权限。
