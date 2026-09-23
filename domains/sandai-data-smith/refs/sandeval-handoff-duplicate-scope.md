---
name: sandeval-handoff-duplicate-scope
type: reference
created: 2026-09-22
updated: 2026-09-23
tags: [sandeval, quality, handoff, reassignment]
links: []
---

# 整包提交与重新分批重复范围

**Why:** 页面当前批次按来源最后归属投影，质量汇总若只按各 scope 的 revision 取最新，可能保留已被重新分批替代的旧 scope。同一工作项重复会触发完整性或范围一致性失败，不能把通用“不完整”提示直接解释成漏答。

**How to apply:** 对比页面当前批次数、来源当前 scope、正式送审版本数、整包冻结子批次及唯一工作项数；保留历史证据，修复当前范围选择，不绕过完整性门禁。

- 生产案例和只读核验记录：`/Users/leslie/Documents/Playground/output/quality-handoff-20260922/report.md`。状态会变，使用前重查。
- 代码入口：`app/services/facts/task_assignments.py::_quality_projected_waves`、`quality/application/management/submission_service.py`、`aggregation_service.py::_vendor_package`、`InspectionContextService._aggregate_execution`、`ResultEligibilityService.qualify`。
- PR `world-sim-dev/sandai-data-smith#1673` 与 `#1678` 已统一整包生成、负责人可提交判定、提交事务校验和落库前校验，但未覆盖正式交接前的执行证据校验。
- 2026-09-23 复核 `main@1b8a4be7`：生产已运行该主线对应构建；`InspectionContextService._aggregate_execution` 仍用未过滤的 `current_annotator_batches` 比较整包子批次，返回 `SOURCE_SCOPE_CHANGED`「供应商包未包含当前全部正式标注批次」。`_sand_batch_predecessors` 与 `ResultEligibilityService.qualify` 也保留相同口径。
- 修复应把 live batch 集合放在单一 owner，让整包生成、落库、交接执行、Sand 批次续跑和成果资格共同复用。
- 2026-09-23 进一步代码复核确认：live batch 不能只按 `scope_key` 匹配。同一个 wave/owner 的成员变化会保留 key、更新 `scope_version`；批次交接撤回也会令 `submitted_for_qc=false`。当前正式批次须同时满足 annotator 类型、`scope_key + scope_version` 相等且 `submitted_for_qc=true`，否则旧答案可能被误认成当前答案并写入整包交接回执。修复已追加到 PR `world-sim-dev/sandai-data-smith#1706`，提交 `81ba588cf`；是否合并、部署及线上恢复仍须分别核验。
