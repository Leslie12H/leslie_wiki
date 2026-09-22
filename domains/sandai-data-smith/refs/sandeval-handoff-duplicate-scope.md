---
name: sandeval-handoff-duplicate-scope
type: reference
created: 2026-09-22
updated: 2026-09-22
tags: [sandeval, quality, handoff, reassignment]
links: [sandeval-inspection-detail-source-mismatch]
---

# 整包提交与重新分批重复范围

**Why:** 页面当前批次按来源最后归属投影，质量汇总若只按各 scope 的 revision 取最新，可能保留已被重新分批替代的旧 scope。同一工作项重复会触发完整性失败，不能把通用“不完整”提示直接解释成漏答。

**How to apply:** 对比页面当前批次数、正式送审当前版本数、叶子总数及唯一工作项数；查 inspection_advancement 阻塞码，追溯重复项的 wave 历史。保留历史证据，修复当前范围选择，不绕过完整性门禁。

- 2026-09-22 生产案例和只读核验记录：`/Users/leslie/Documents/Playground/output/quality-handoff-20260922/report.md`。状态会变，使用前重查。
- 代码入口：`app/services/facts/task_assignments.py::_quality_projected_waves`、`quality/application/management/submission_service.py::_current_batches`、`aggregation_service.py::_vendor_package`、`quality/domain/management/submission.py::completeness`。
- 本轮仅诊断；未实施修复。
