---
name: sandeval-package-self-check-return-and-offboarding
type: reference
created: 2026-10-16
updated: 2026-10-17
tags: [sand-eval, package, self-check, handoff, offboarding]
links: [sandeval-direct-remediation-and-batch-handoff, sandeval-reassignment-scope-and-batch-responsibility, sandeval-work-handoff-unsettled-occupancy]
---

# Sand 整包自查退回与离职交接核查入口

**Why:** 2026-10-16 用户提出供应商正式交包后，Sand 不分配、不检查就整包退回供应商质检自查，并询问质检员或标注员离职的后果；2026-10-17 将范围扩展到部分批次已经分配或质检。包级退回不能依赖已有 Sand 检查任务，部分已检查时还需保留报告历史并阻止旧任务继续执行。

**How to apply:** 固定最新 main/部署版本，分清包级总责任、按批检查、标注整改和历史作者。核对历史报告只读、新轮次、有效接手人、实际持卡与整改责任一起转交、负责人资格及重新整包交接；不要把已有转交按钮视为所有状态可改派，也不要用 QC 报告 passed 单独证明问题清零。建议与已确认业务规则分别记录。

- [2026-10-16 源码核查与方案报告](/Users/leslie/Documents/Playground/output/sandeval-package-return-20261016/analysis.md)：保存准确 main SHA、代码永久链接、现有能力限制、包级自查建议、离职与并发风险及最小验收范围。仅源码/已有测试审查，未核验生产部署，未实施新功能或操作业务数据。
- [2026-10-17 实现及测试 PR #2564](https://github.com/world-sim-dev/sandai-data-smith/pull/2564)：当前代码、验证和测试集成状态以 PR 最新 head 为准。开发基于 main，测试目标为 sandeval-test-only；PR 有集成冲突时不能把单分支 Gate 当作测试集成验收，不能将测试历史合入开发分支。
- [2026-10-17 对 5c4c7fc35 的 review 复现记录](/Users/leslie/Documents/Playground/output/sandeval-pr2564-review-20261017/review-results.json)：代码与隔离 fake-port/mock 复现入口，覆盖退回与原 Sand 操作的并发准入、明确拒绝后仍锁定旧请求、逐批串行读取；具体结果以固定 head 和同目录脚本为准。本次仅 review，未修复业务代码，未核验生产。
- 本次新入口的代码 owner：`quality/application/management/package_self_check_service.py`、`package_decision.py`、前端 `quality/management/PackageSelfCheck.tsx`；精确流程和验收以同 PR 的 `docs/subsystems/quality-center.md`、角色使用文档及 `test_package_self_check.py` 为准。尚未部署或核验生产行为。
- 并发与恢复核查：沿上述 service 的 `_freeze/_publish/_complete/recover` 及同 PR 流程测试定位。先检查旧批次整改是否仍需原 Sand 复验，再核对完整退回意图、所有相关检查停止、原保留保存的精确续做，以及“已登记子批次但尚未开始自查”时的重启恢复；完成回执不能让后续必要步骤失去恢复入口。
- 复查方法：在前置检查与持久化意图之间交错执行原有批次退回或最终验收，验证共享原子准入；前端区分“确定未写入的拒绝”与“结果未知或已持久化待恢复”，再决定是否保留原请求；多批次详情需核对实际运行装配中的逐批查询数，不能只看表格分页或遗漏新增注入服务的旧 fixture。
- 入口前提：`quality/application/resolution/manual_return_service.py::assert_returnable/_return`、`quality/api/resolution/resolution_handlers.py::return_supplier_batch`、`quality/api/router.py`、前端 `quality/management/PackageDetail.tsx`。
- 离职交接：`quality/application/management/work_handoff_service.py::_load/_transfer`、`app/services/facts/work_handoff.py::require_owner`、`app/repositories/task_assignments.py::transfer_correction_cards`；配套测试 `tests/quality/application/management/test_work_handoff.py`，分别看进行中和待重检状态。
- 无效原检查人及负责人：`quality/application/resolution/direct_return_service.py::_lead_actor/_delegate`、`resolution_service.py::auto_assign_reinspections`。区分留待负责人处理与已成功创建新人待办。
- 完成语义：`quality/domain/inspection/review_rules.py::calculate_result` 与正式验收/处置闭环；整包范围和正式重新交接看 `quality/application/management/aggregation_service.py` 与 `leader_query_service.py`。
- 2026-10-17 已获用户实施授权：全包全部批次自查，原供应商质检员不可用时由供应商空间负责人重新分配，全部自查整改验收完成后显式整包重交 Sand。扩展到部分 Sand 质检时，旧未完成任务停止、封存报告保留历史，重交后全部重新分配；整包最终验收后的重新打开不走此入口。“整包范围”与“100%全检”仍应区分，不从前者推导新的抽检比例。
