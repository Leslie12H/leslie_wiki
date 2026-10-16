---
name: sandeval-package-self-check-return-and-offboarding
type: reference
created: 2026-10-16
updated: 2026-10-16
tags: [sand-eval, package, self-check, handoff, offboarding]
links: [sandeval-direct-remediation-and-batch-handoff, sandeval-reassignment-scope-and-batch-responsibility, sandeval-work-handoff-unsettled-occupancy]
---

# Sand 未分配前整包自查退回与离职交接核查入口

**Why:** 2026-10-16 用户提出供应商正式交包后，Sand 不分配、不检查就整包退回供应商质检自查，并询问质检员或标注员离职的后果。这个入口没有 Sand 检查任务或原检查人；直接套用现有单批退回及自动派回原 Sand 质检员，会丢失进入前提和正确的回流阶段。

**How to apply:** 固定最新 main/部署版本，分清包级总责任、按批检查、标注整改和历史作者。核对历史报告只读、新轮次、有效接手人、实际持卡与整改责任一起转交、负责人资格及重新整包交接；不要把已有转交按钮视为所有状态可改派，也不要用 QC 报告 passed 单独证明问题清零。建议与已确认业务规则分别记录。

- [2026-10-16 源码核查与方案报告](/Users/leslie/Documents/Playground/output/sandeval-package-return-20261016/analysis.md)：保存准确 main SHA、代码永久链接、现有能力限制、包级自查建议、离职与并发风险及最小验收范围。仅源码/已有测试审查，未核验生产部署，未实施新功能或操作业务数据。
- 入口前提：`quality/application/resolution/manual_return_service.py::assert_returnable/_return`、`quality/api/resolution/resolution_handlers.py::return_supplier_batch`、`quality/api/router.py`、前端 `quality/management/PackageDetail.tsx`。
- 离职交接：`quality/application/management/work_handoff_service.py::_load/_transfer`、`app/services/facts/work_handoff.py::require_owner`、`app/repositories/task_assignments.py::transfer_correction_cards`；配套测试 `tests/quality/application/management/test_work_handoff.py`，分别看进行中和待重检状态。
- 无效原检查人及负责人：`quality/application/resolution/direct_return_service.py::_lead_actor/_delegate`、`resolution_service.py::auto_assign_reinspections`。区分留待负责人处理与已成功创建新人待办。
- 完成语义：`quality/domain/inspection/review_rules.py::calculate_result` 与正式验收/处置闭环；整包范围和正式重新交接看 `quality/application/management/aggregation_service.py` 与 `leader_query_service.py`。
- 方案尚待评审：包级退回、按批次自查、无人时负责人分配、供应商验收及整包重交，之后回到 Sand 首次待分配；“整包”与“100%全检”是分别需要明确的口径。上述不是本次已实施或人类已拍板的规则。
