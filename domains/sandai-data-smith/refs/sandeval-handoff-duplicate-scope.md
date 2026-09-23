---
name: sandeval-handoff-duplicate-scope
type: reference
created: 2026-09-22
updated: 2026-09-23
tags: [sandeval, quality, handoff, reassignment]
links: [sandeval-inspection-detail-source-mismatch]
---

# 整包提交与重新分批重复范围

**Why:** 页面当前批次按来源最后归属投影，质量汇总若只按各 scope 的 revision 取最新，可能保留已被重新分批替代的旧 scope。同一工作项重复会触发完整性失败，不能把通用“不完整”提示直接解释成漏答。

**How to apply:** 对比页面当前批次数、正式送审当前版本数、叶子总数及唯一工作项数；查 inspection_advancement 阻塞码，追溯重复项的 wave 历史。保留历史证据，修复当前范围选择，不绕过完整性门禁。

- 2026-09-22 生产案例和只读核验记录：`/Users/leslie/Documents/Playground/output/quality-handoff-20260922/report.md`。状态会变，使用前重查。
- 代码入口：`app/services/facts/task_assignments.py::_quality_projected_waves`、`quality/application/management/submission_service.py::_current_batches`、`aggregation_service.py::_vendor_package`、`quality/domain/management/submission.py::completeness`。
- 修复入口：PR `world-sim-dev/sandai-data-smith#1673` 引入 `AggregationService.live_annotator_batches`，供整包冻结、负责人可提交判定和提交校验剔除已被替代的旧 scope。
- 2026-09-22 21:07（Asia/Shanghai）复核固定 `main@cf550b68`：`aggregation_service.py::_persist` 的 vendor package 持久化前校验仍直接调用 `current_annotator_batches`，与已过滤的冻结依据比较后会返回 `SOURCE_SCOPE_CHANGED`。排查同类问题时要核对整包生成、持久化前校验、页面判定和提交校验四个检查点是否共用同一集合；页面状态会变，使用前重查。

- 2026-09-23 复核最新 `main@1b8a4be7`：生产已运行该主线对应构建，但 `InspectionContextService._aggregate_execution` 仍在正式交接前用未过滤的 `current_annotator_batches` 比较整包子批次，直接返回 `SOURCE_SCOPE_CHANGED`「供应商包未包含当前全部正式标注批次」；`_sand_batch_predecessors` 与 `ResultEligibilityService.qualify` 也保留相同口径。修复时应把 live batch 集合下沉为单一 owner，并让整包生成、落库、交接执行、后续 Sand 批次及成果资格共同复用，而不是继续逐点复制过滤条件。本地修复入口：分支 `codex/fix-quality-package-submit-scope`、提交 `aae468940`；尚未创建 PR、未部署。

- 2026-09-22 后续审计已核实同一工作项转出再转回、形成新 wave，且两次送审引用不同答案版本；时间线与 audit 证据见报告后续章节。转派历史保留与当前汇总范围应区分；同一工作项不等于相同答案版本。
