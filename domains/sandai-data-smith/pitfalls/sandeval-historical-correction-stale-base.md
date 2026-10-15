---
name: sandeval-historical-correction-stale-base
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, correction, submission, lineage, handoff]
links: [sandeval-repeated-correction-ancestor-blocker, sandeval-correction-handoff-stale-response, sandeval-reassigned-answer-frozen-review-conflict]
---

# 历史整改转交后从旧送审基线重复生成版本

**Why:** 历史退回仍为处理中时，可以保留它自己的 rejected 执行和 followup group；同一真实批次的另一后续退回可能已产生更高送审版本并完成质检。旧单转交只改变当前接收人，不能证明其回交基线已经接到最新版本。工作台四题都已更新、显示可提交，仍可能在保存正式回交时触发 `SUBMISSION_SCOPE_EXISTS`。该通用提示出现在正确的整改入口，不应据此判断用户进错页面。

**How to apply:** 从精确整改单核对 target、handoff_history、全部本单执行和同 scope 的送审版本链；按本人身份读取 `resubmit_base_submission_id` 与 manifest，再检查失败命令 intent.prepared.submission 的直接前置、版本号和正式落库/执行登记。用原生 `check_revision` 只读重放，不为复现触发完整提交。区分本单最近失败轮次、另一子单的后续通过和原责任是否已关闭；答案准备度不代表正式版本链可接续。恢复应保留已保存答案及历史报告，核对下游后走受控接续/收尾；不能绕过唯一性门禁、覆盖旧版本或仅手动增加版本号。

- 2026-10-15 徐佳玉纸面 0923_04 实例的正式时间线、本人工作台、实际失败意图及生产只读校验：[现场报告](/Users/leslie/Documents/Playground/output/xujiayu-correction-20261015/report.md)。动态对象、SHA 和当时状态留在报告和证据目录；本次未执行生产修复。
- 源码入口：`sand-eval/platform/backend/quality/application/resolution/resolution_scope_service.py::original_group_ids`、`answer_correction_service.py::prepare`、`quality/application/management/submission_service.py::check_revision`、`resolution/legacy_correction_snapshot.py::recover_snapshot`。复用前核对现场部署；旧快照孤儿恢复有严格身份与未使用条件，不可推定可接续已正式复验通过的其他提交。
- [整改转交后的授权失配](sandeval-repeated-correction-ancestor-blocker.md)是另一种阻断，不能因同一人员或相似页面直接套用旧单修复。
