---
name: sandeval-remediation-scope-change-stale-handoff
type: pitfall
created: 2026-10-05
updated: 2026-10-05
tags: [sandeval, quality, remediation, handoff, source-scope]
links: [sandeval-direct-remediation-and-batch-handoff, sandeval-handoff-duplicate-scope, sandeval-auto-reinspection-verification]
---

# 整改后的批次范围变化与旧包交接状态

**Why:** 2026-10-05 生产只读核查发现，供应商复检与负责人验收已成功，但整改由另一账号提交部分正式答案后，来源按最新实际作者投影批次，两个批次范围版本改变。质量汇总按 key 和范围版本筛选，整批排除旧范围；完整性门禁随后正确拦下缺项的新包。新包未生成时，负责人详情仍读旧包的首次交接事实，造成「已提交 Sand」与批次「待交接」并存。该结论限于当天部署与证据，不代表之后版本仍有此问题。

**How to apply:** 固定部署版本和真实账号，分别核查空间报告、负责人报告、后台推进、当前来源清单、冻结成员、QHANDOFF 和 Sand 后继轮次。来源范围版本改变时，比对每个工作项集合的增减及最新正式作者，不能把不匹配批次整批消失理解为工作项不再应交，也不能取消完整性/版本校验来补交。旧包已交接是历史事实，当前整改是否可交接要独立投影。委派子整改闭环与直接 supplier_accepted 回执的自动派回发现口径也须分别验证。

- 本次报告、真实任务身份、部署 SHA、时序与修复建议：`/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/report.md`。
- 当前生产投影、后台尝试与范围差集证据：同目录 `runtime.json`、`completeness.json`、`scope-change.json`；刷新运行状态时重新读，不复用静态数量。
- 来源作者和批次投影入口：`app/repositories/task_assignments.py::quality_submission_owners`、`app/services/facts/task_assignments.py::_quality_projected_waves`。
- 当前批次筛选与完整性入口：`quality/application/management/submission_service.py::live_annotator_batches` / `check_completeness`、`aggregation_service.py::_vendor_package`。
- 旧包展示与交接条件入口：`leader_query_service.py::_package`、`aggregation_service.py::require_supplier_acceptance` / `package_submitted`、`frontend/src/pages/quality/management/AllocationDetail.tsx`。
- 默认负责人路线自动派回发现入口：`quality/infrastructure/persistence/disposition_repository.py::handed_off_supplier_returns`；源代码存在不等于新包交接后已自动派回。

本次仅排查，未实施业务代码修复、生产数据恢复或部署。修复与现场恢复应保全正式答案和已验证质检证据，并独立验收原 Sand 检查员唯一新轮次。
