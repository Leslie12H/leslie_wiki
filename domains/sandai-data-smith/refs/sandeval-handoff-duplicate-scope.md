---
name: sandeval-handoff-duplicate-scope
type: reference
created: 2026-09-22
updated: 2026-09-28
tags: [sandeval, quality, handoff, reassignment]
links: [sandeval-inspection-detail-source-mismatch]
---

# 整包提交与重新分批重复范围

**Why:** 页面当前批次按来源最后归属投影，质量汇总若只按各 scope 的 revision 取最新，可能保留已被重新分批替代的旧 scope。同一工作项重复会触发完整性或范围一致性失败，不能把通用“不完整”提示直接解释成漏答。

**How to apply:** 对比页面当前批次数、来源当前 scope、正式送审版本数、叶子总数、整包冻结子批次及唯一工作项数；查 inspection_advancement 阻塞码，追溯重复项的 wave 历史。保留历史证据，修复当前范围选择，不绕过完整性门禁。

- 生产案例和只读核验记录：`/Users/leslie/Documents/Playground/output/quality-handoff-20260922/report.md`。状态会变，使用前重查。
- 代码入口：`app/services/facts/task_assignments.py::_quality_projected_waves`、`quality/application/management/submission_service.py`、`aggregation_service.py::_vendor_package`、`InspectionContextService._aggregate_execution`、`ResultEligibilityService.qualify`。
- PR `world-sim-dev/sandai-data-smith#1673` 与 `#1678` 已统一整包生成、负责人可提交判定、提交事务校验和落库前校验，但未覆盖正式交接前的执行证据校验。
- 2026-09-23 复核 `main@1b8a4be7`：生产已运行该主线对应构建；`InspectionContextService._aggregate_execution` 仍用未过滤的 `current_annotator_batches` 比较整包子批次，返回 `SOURCE_SCOPE_CHANGED`「供应商包未包含当前全部正式标注批次」。`_sand_batch_predecessors` 与 `ResultEligibilityService.qualify` 也保留相同口径。
- 修复应把 live batch 集合放在单一 owner，让整包生成、落库、交接执行、Sand 批次续跑和成果资格共同复用。
- 2026-09-23 进一步代码复核确认：live batch 不能只按 `scope_key` 匹配。同一个 wave/owner 的成员变化会保留 key、更新 `scope_version`；当前批次须同时满足 annotator 类型及 `scope_key + scope_version` 相等，否则旧答案可能被误认成当前答案并写入整包交接回执。PR #1706 已明确完成批次可由负责人直接分配，因此 `submitted_for_qc` 不是该集合的门禁。修复已通过 Gate 并合并到 `main@c85f11886`；该 PR 的生产部署步骤为 skipped，部署及线上恢复仍须单独核验。
- 2026-09-23 生产复核发现整包交接还有独立的延迟故障：34 个子批次会串行重复展开同一批不可变报告，30 秒来源观察凭证会在交接回执落库前过期，浏览器约 60 秒超时且不会留下回执。排查此类故障时要先只读确认 `request_id` 无回执，再分别测来源范围读取与完整 `validate_execution`，不能把超时归因于范围变化。
- PR #1711 在单次提交命令内复用相同报告读取，并把彼此独立的报告组、前置包及子批读取限制为最多 8 路并发；保留原范围、完整性、报告与凭证门禁。`main@fddde5d6` 的生产 Gate/发布 run `35826743529` 成功，镜像 digest 为 `sha256:03c21b3790d39d4c714fee712d046444d8e6c74961818bdc8d35d8d9bbe62eae`；同一生产包的只读校验从超过 60 秒并报凭证过期，降至 14.154 秒并通过（34 子批、38 成员、68 报告）。这些运行值会变，复用时应重新测量。
- 2026-09-24 生产案例：列表按验收数显示“待提交 Sand”，但当前完整范围由两名供应商负责人验收，任务又没有显式 `task_reviewer_config.return_recipient_id`，`aggregation_service._vendor_package` 因 `RECIPIENT_UNRESOLVED` 无法生成 `vendor_package`，详情只能退化为 `PACKAGE_NOT_READY`。紧急恢复通过显式配置接收人完成，PR #1792 的长期规则保持单一验收负责人原归属，仅在多人验收仍无法定责时使用最近一次状态为 `ready` 的供应商质检下发人；失败/中断分配不参与，既有整包的冻结接收人不改写。排查时以持久化推进记录里的 QualityError code 为准，不用按钮状态反推服务端根因。

## 2026-09-22—23 早期排查记录（历史）

以下保留当时的代码位置、修复候选与转派审计指针；“尚未创建 PR、未部署”是早期快照，后续修复及发布进展见上文。

- 代码入口：`app/services/facts/task_assignments.py::_quality_projected_waves`、`quality/application/management/submission_service.py::_current_batches`、`aggregation_service.py::_vendor_package`、`quality/domain/management/submission.py::completeness`。
- 修复入口：PR `world-sim-dev/sandai-data-smith#1673` 引入 `AggregationService.live_annotator_batches`，供整包冻结、负责人可提交判定和提交校验剔除已被替代的旧 scope。
- 2026-09-22 21:07（Asia/Shanghai）复核固定 `main@cf550b68`：`aggregation_service.py::_persist` 的 vendor package 持久化前校验仍直接调用 `current_annotator_batches`，与已过滤的冻结依据比较后会返回 `SOURCE_SCOPE_CHANGED`。排查同类问题时要核对整包生成、持久化前校验、页面判定和提交校验四个检查点是否共用同一集合；页面状态会变，使用前重查。
- 2026-09-23 复核最新 `main@1b8a4be7`：生产已运行该主线对应构建，但 `InspectionContextService._aggregate_execution` 仍在正式交接前用未过滤的 `current_annotator_batches` 比较整包子批次，直接返回 `SOURCE_SCOPE_CHANGED`「供应商包未包含当前全部正式标注批次」；`_sand_batch_predecessors` 与 `ResultEligibilityService.qualify` 也保留相同口径。修复时应把 live batch 集合下沉为单一 owner，并让整包生成、落库、交接执行、后续 Sand 批次及成果资格共同复用，而不是继续逐点复制过滤条件。本地修复入口：分支 `codex/fix-quality-package-submit-scope`、提交 `aae468940`；尚未创建 PR、未部署。
- 2026-09-22 后续审计已核实同一工作项转出再转回、形成新 wave，且两次送审引用不同答案版本；时间线与 audit 证据见报告后续章节。转派历史保留与当前汇总范围应区分；同一工作项不等于相同答案版本。
