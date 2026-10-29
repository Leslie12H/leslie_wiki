---
name: sandeval-lead-reinspection-frozen-identity
type: pitfall
created: 2026-10-29
updated: 2026-10-29
tags: [sand-eval, reinspection, leader-acceptance, frozen-plan, recovery]
links: [sandeval-saved-version-vs-browser-display, sandeval-reinspection-partial-submit-acceptance-blocker]
---

# 负责人复验的历史身份与本轮验收身份不能混写

**Why:** 复验创建时如果将本轮验收人填入历史报告身份，人员不变的回归可以通过，换负责人后却会在保存准入与真实前驱报告比较时失败。计划已落库、正式验收未完成，再由另一负责人重试，可能先被冻结计划的人员保护拒绝，遮住更早的历史身份错误。截图中的“冻结责任或人员不一致”是复合比较提示，不能据此让原负责人盲目重试，也不能直接取消保护。

**How to apply:** 固定质检报告、已有负责人复核单、实际上一轮报告、冻结快照及整改执行，分别比较历史作者、本轮计划人、当前操作者和正式转交。对照实际授权摘要、版本、范围、规则；再对已有复核单运行原生只读 check_blockers，不能以计划重用一致代替保存/提交可行。修复应保留真实历史身份，以明确的负责人授权证明新轮继承；对未完成单据提供受控接续，不冒用他人验收身份、不改写历史报告。回归覆盖历史负责人 A → 本轮 B 的完整验收闭环，以及 B 创建后中断、C 重试；只覆盖质检员转交而仍由同一负责人验收会漏掉此组合。已有错误冻结计划的存量恢复与通用代码修复分开验收。

- [2026-10-29 纸面 260-04 只读报告](/Users/leslie/Documents/Playground/output/qc-accept-conflict-20261029/report.md)：双副本事实、两位负责人的字段对照、原生门禁失败、首次创建时间窗日志、生产部署与旧修复祖先关系。日志没有原始错误正文，不能把当前复现说成历史响应原文；本次未实施修复或生产写入。
- 当前实现沿报告中的部署 SHA 查 `ReinspectionService._create/create_lead_verification`、`ReviewService.check_blockers`、`LeadReviewService.accept`、`ResolutionService.prepare_lead_verification`。同时看新建和重用计划两条路径。
- 旧修复范围沿 [PR #2863](https://github.com/world-sim-dev/sandai-data-smith/pull/2863) 与 `test_pending_sand_feedback.py` 查验；复验重试保护沿 [PR #2590](https://github.com/world-sim-dev/sandai-data-smith/pull/2590) 与 `test_reinspection_retry_plan.py` 查验。是否已部署、是否覆盖某现场，必须用实际运行 SHA 和精确单据重新验证。
