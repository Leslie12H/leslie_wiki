---
name: sandeval-qc-reject-threshold-not-enforced
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sandeval, quality, threshold, sampling]
links: [sandeval-direct-remediation-and-batch-handoff]
---

# Sand Eval 质检不合格阈值与实际判定脱节

**Why:** 2026-09-28 核查建任务的「空间质检不合格阈值（%）」时，发现表单名称表达不合格率上限，但截至当日 `origin/main` 的质检报告判定没有读取这个配置。报告的「通过」可包含逐题「不合格」；因此配置值或报告标签不能直接解释为任务已达到某个合格率。默认输入值和历史填写值也不能代替业务对字段语义的确认。

**How to apply:** 回答或设计质检合格率时，分别核对抽样比例、逐题合格率、整份报告结果、负责人退回与验收。先固定代码和部署版本，再查 `sand-eval/platform/backend/app/services/facts/dispatch_masters.py::QC_SCHEMA`、`app/domain/dispatch_masters.py::QcConfiguration.policy_values`、`quality/domain/inspection/review_rules.py::calculate_result` 及对应测试；抽样看 `quality/domain/management/sampling.py` 和 `batch_allocation.py`。业务确认阈值到底是「不合格率上限」还是「合格率下限」及分母、边界前，不要直接启用自动判退或将存量配置批量重释。

- 业务仓的决策待定与 2026-09-22 历史生产证据：`sand-eval/.agents/notes/proposed/bug-fix/2026-09-22-qc-reject-threshold-has-never-been-read.md`。这里存核查入口；实际判定和生产状态应重新验证。
