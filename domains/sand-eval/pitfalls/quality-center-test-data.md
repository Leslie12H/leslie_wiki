---
name: sand-eval-quality-center-test-data
type: pitfall
created: 2026-09-17
updated: 2026-10-10
tags: [sand-eval, testing, quality-center]
links: []
---

# Sand Eval 质量中心测试数据入口

**Why:** 2026-09-17 构造待质检测试数据时，任务内 QcCard 的空间质检队列不能证明题目已进入质量中心。用户需要在质量中心查看并执行质检，验收必须针对该中心的分配、检查任务和冻结题目详情。

**How to apply:** 先读 `sandai-data-smith/sand-eval/docs/subsystems/quality-center.md`。沿来源任务公开契约确认完整应交份数、已作答的标注批次，再通过质量中心 PolicyService 和 BatchAllocationService 做规则登记、预览和正式分配。不要以任务内 QcCard 分配代替中心送审。测试环境也应校验独立 Holo 与 OSS 写前缀。

排查指针：`platform/backend/app/services/facts/task_assignments.py` 的 `_quality_context` 校验完整应交人数，`list_submission_scopes` 从 assignment waves 生成可送审批次。仅使用旧派题 CLI 后若没有批次，先核对真实分配事实，再按官方 `backfill-assignment-waves` 的 dry-run / apply 流程限定本次任务补齐，保留其推断标记。

验收指针：`quality/application/management/leader_query_service.py` 的管理列表；`quality/application/inspection/review_query_service.py` 的本人待办、详情与冻结题目。核对待质检数量、检查人、可执行动作、无阻断以及题目内容可读。管理与质检链接在 `platform/frontend/src/routes/quality.tsx`，root 用户的管理页默认 Sand 阶段，供应商批次需显式选择 `space_qc`。

2026-09-21 构图待质检验收：当前批次门禁、标注员主动提交质检及实际工作台证据见 `/Users/leslie/Documents/Playground/output/sandeval-composition-qc-20260921/report.md`。完成数量不等于已交接；复用脚本时检查当前 `can_allocate` 和阻断原因，再走 `my_tasks.py` 的批次交接接口。

2026-09-23 生产排查：负责人工作台的“代交接”请求若返回 500，先按质量任务号和 `/leader/batches/<scope>/handoff` 查 SLS 的同秒 stderr。`management_handlers.hand_off_annotation_batch` 曾调用不存在的 `runtime.allocations`，而组合根实际只暴露 `runtime.batch_allocations`，请求会在进入 `hand_off_batch` 和来源门禁前抛 `AttributeError`，因此服务端不会产生 `QualityError code`。

同日产品口径恢复为：负责人可直接分配题目已全部完成且尚未分配的批次，标注员主动交接保留为本人确认和锁定事实，不再作为 `can_allocate` 前置条件。负责人页面不显示“代交接”；确认分配时由质量中心冻结实际送检答案版本和责任范围。修复分支 `codex/fix-quality-handoff-allocation`，本地提交 `2bff1030a`，尚未发 PR 或部署。

2026-09-24 生产排查：管理页的分配扩展记录只是计划/执行进度，不能单独证明质检员账号里已有同数目的真实待办。一次分配若中途停止，管理页仍可能保留已选检查人和全部计划批次，但本人列表只读取已经创建、属于当前提交链的 `eval_quality_review_task`。数字不一致时，按质量任务分别核对分配记录中的 `submission_id` / `group_id`、真实检查任务、当前提交版本和本人工作台；恢复未完成分配后再同时复验管理页与检查人页面，不把跨数据包总数或仅有计划行的数量当作已下发任务数。

2026-09-24 生产排查：整包列表显示“待提交 Sand”、详情按钮仍禁用时，不要只看 `43/43` 验收数。服务端真正的判据是每个负责人复核报告的 `inspection_advancement.blocking_reasons`。当当前批次由多名供应商负责人验收，且任务没有显式 `task_reviewer_config.return_recipient_id` 时，整包生成持续阻断为 `RECIPIENT_UNRESOLVED`（供应商完整包需要明确承接及唯一质检负责人）。此时核对当前 43 批的最新 `vendor_review` 报告执行人，再通过人员配置明确整包退回接收人；后台恢复会重试待推进记录。列表“待提交”只按验收数归类，详情又因尚未生成 `vendor_package` 退化为 `PACKAGE_NOT_READY`，会隐藏上述真实阻断码；页面排查必须回读持久化推进记录。

2026-09-27 骆沙展账号复核：区分“某次质检任务已通过”与“整个数据包可交接”，并复核多名负责人验收时的唯一整包接收人门禁。当前数据、部署 SHA、正式复核报告和页面证据见 `/Users/leslie/Documents/Playground/output/quality-handoff-luoshazhan-20260927/report.md`；历史快照不作为后续当前状态，重新排查仍读最新报告与推进阻断码。

2026-09-27 受控恢复指针：`/Users/leslie/Documents/Playground/wuzijie-package-recovery-20260927/report.md` 与同目录 `recover_config.py`。**Why:** 补齐配置后仍需证明后台生成整包且指定负责人本人具有提交权限。**How to apply:** 取得本次生产恢复授权后，默认 dry-run 备份目标报告和配置、校验实时人员资格；显式 apply 复用 `ReviewerConfigService.put` 的版本比较和审计回执；回读报告摘要、整包及待推进记录，再以指定负责人身份核对 `submit_to_sand` 并浏览器验收。恢复到可交接状态与正式提交 Sand 分别核验。

2026-09-27 PR 复核指针：[PR #1792](https://github.com/world-sim-dev/sandai-data-smith/pull/1792)，核验版本 `a84bf1f13c3a6a84fbc3ec370b07a6dabb83261d`。**Why:** 负责人兜底能解除多人验收的生成阻断，但不能证明任意被选人当前仍具备交接权限；前端“整包生成中”也不能证明后台只是短暂延迟。**How to apply:** 在原任务无显式配置的条件下，对照来源指定接收人、唯一验收人、最近 READY 供应商质检下发人三个来源，并以最终接收人实时身份核对来源 `submit` 权限；`PackageDetail.tsx` 忽略 `PACKAGE_NOT_READY` 时，需要沿 `LeaderQueryService.package` 回读真实 advancement 阻断，检查显式空配置和无可用下发记录是否被误报为生成中。合并状态、Gate 和生产部署分别实时查询。

2026-10-10 视角排查指针：`/Users/leslie/Documents/Playground/sandeval-awaiting-handoff-20261010/read-only-findings.md`。**Why:** 未带 `stage` 的管理链接会随账号空间选择视角；同一个包在 Sand 视角显示“整包生成中”，供应商视角却可能已提供提交按钮。缺少供应商动作不能据此认定后台正在生成。**How to apply:** 先确认反馈的数据包和操作账号，再核对 `QualityManagementPage.tsx` 的 stage 选择、`PackageDetail.tsx` 的提示分支和 `LeaderQueryService._package` 的提交资格。列表进度、详情权限、正式提交成功分别核验；抽查其他包和 root 按钮可用不能代替指定供应商负责人的现场结论。

2026-10-10 纸面 08 包历史退回阻断指针：`/Users/leslie/Documents/Playground/sandeval-awaiting-handoff-20261010/paper-findings.md`。**Why:** 当前四批质检及验收完整通过，仍可能被连续复验链中的旧标注退回拦截；历史执行 completed/rejected 和后继 completed/resolved 不证明祖先责任已关闭。**How to apply:** 用指定负责人实时身份读取 package DTO，调用只读 `_unblocked` 取得准确处置 ID，再核对原执行、后继报告、related 与 ancestor 责任集合，以及 `ResolutionService._close/recover` 和 `ManualReturnService.capture` 的边界。区分祖先授权与关闭依据，不做全局自动关祖先；恢复必须保留原报告和审计。该次结论来自两个生产 Pod 与部署 SHA 对齐，尚未修复或提交。
