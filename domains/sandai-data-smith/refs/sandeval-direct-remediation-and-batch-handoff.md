---
name: sandeval-direct-remediation-and-batch-handoff
type: reference
created: 2026-09-27
updated: 2026-09-27
tags: [sandeval, quality, remediation, handoff]
links: [sandeval-roles-and-workflow, sandeval-auto-reinspection-verification, sandeval-cross-stage-feedback]
---

# Sand 直达整改与按批交接核验入口

**Why:** 2026-09-27 用户提出 Sand 退回跳过供应商负责人、供应商质检后直接回 Sand、包内任务独立提交。评估必须拆开退回路由、整改验证关卡、正式交接与整包完成；改变接收人或按钮不足以证明新路线闭环。

**How to apply:** 先确认“任务”指来源任务、分配记录、标注批次还是单个质检报告。固定 main 与运行版本，沿原批次、原质检员、父子责任和交接回执核查。建议和现状分别表述；判断自动回交流程时，还须核查 QC 报告 passed 与逐题合格是否同义。

- 本次代码、截图任务生产只读证据、时间线、逐步卡点和建议范围：`/Users/leslie/Documents/Playground/output/sandeval-direct-qc-analysis-20260927/report.md`。实时状态按该目录 `read_prod.py` 和 `production.json` 的对象重新读取，不复用旧统计。
- 退回路由和接收人：`sand-eval/platform/backend/quality/application/resolution/manual_return_service.py::assert_returnable`、`_return`；候选范围与标注整改可操作性：`disposition_query_service.py::candidates` 及 answer_rectification 投影。
- 原 Sand 意见能否传到整改人：`disposition_issue_service.py`；改路线时检查其父子委派、原报告与工作项映射前提，不能仅验证有待办。
- 固定关卡、包完整性和正式交接：`quality/application/management/aggregation_service.py::_bundle`、`_vendor_package`、`submit_package`；来源权限与应交范围在 `app/services/facts/task_assignments.py`。
- 报告结果语义：`quality/domain/inspection/review_rules.py::calculate_result` 与 `tests/quality/domain/inspection/test_review_rules.py`。是否使用不合格率、passed 能否含 rejected 题必须查当前代码，不能按标签名称设计自动回交。
- 回流目标和恢复条件：`leader_resolution_service.py::_target`、`recover_supplier_handoffs` 与 `disposition_repository.py::handed_off_supplier_returns`。未受影响批次沿用规则查 `AggregationService.sand_batch_sources`。
- 验收应包含两批同时退回但只完成一批、同批多报告、旧轮次只读、新轮次原人待办、重复请求和中断恢复。区分已完整交接包的单批整改回交与首次未齐包的逐批送审；两者改动范围不同。本次仅分析，未实施业务代码。
