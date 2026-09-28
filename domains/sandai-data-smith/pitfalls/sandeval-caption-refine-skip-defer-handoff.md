---
name: sandeval-caption-refine-skip-defer-handoff
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sand-eval, caption-refine, annotation, handoff, quality]
links: [sandeval-roles-and-workflow]
---

# Caption Refine 的跳过、待定与整批交质检口径不一致

**Why:** Caption Refine 工作流题的首次作答页提供“有问题，跳过”，但提交服务的工作流分支拒绝 `skipped`，返回“此题型需要完成整题修订，不能跳过”。“进入待定”只保存作答快照和待定回执，不生成正式答案；标注批次交质检只认有最新正式答案且未待定的成员。页面待定弹窗却称素材不会进入后续标注、质检，容易让人误以为该题已从整批交卷门槛移除。2026-09-28 只读核对任务 `a38415e6-5d21-54e8-be17-748ac89e11ad`、批次 `ae4470c6-899d-578a-b0c7-139e8bbf7de7:cfad9891-f924-571d-ba0d-da3f878aeb67`：6 张卡中 5 张有正式答案、1 张待定且无答案，批次无交质检记录。这是当日快照，之后须重新核验。

**How to apply:** 先用生产 `/health` 固定部署 SHA，再按任务、`assignment_id` 和批次键读 `ev2_task.rule_version`、`ev3_assignment`、`ev3_response`、`eval_answer_execution_receipt` 的 `annotation_defer`、`ev2_assignment_wave_item` 与 `eval_annotation_batch_handoff`。区分按钮可见、请求被拒、待定回执写入和正式答案写入；不要把待定当作已交，也不要为凑交卷虚构答案。代码入口：`sand-eval/platform/frontend/src/pages/myTasks/QuestionWorkPage.tsx`、`backend/app/services/facts/my_tasks.py::submit_answer`、`backend/app/services/facts/task_assignments.py::_quality_result_available` 与 `submit_annotation_batch_for_qc`。修复前要明确业务选择：让工作流跳过成为可质检的正式版本，或让经授权排除的待定卡不占交卷分母，并同步页面提示、交接清单及后续质检口径；此页不代表该选择已确定或已上线。

2026-09-28 修复范围核查：不能仅删除跳过拒绝条件后套用普通答案写路。工作流题的质检修订在 `backend/app/services/facts/answer_amendment.py::prepare` 读取对应固定作答上下文；缺回执会在后续质检报错。`backend/app/repositories/result_delivery.py::candidates` 只取非跳过答案，`backend/app/services/facts/result_delivery.py::_answers` 又要求主任务全题有完整固定答案。放开跳过送审时应同时核对修订恢复、正式结果交付和异常清单口径；批准跳过不应直接等同于产出有效 Caption。上述路径随代码变化，复用前重新读取。

## 历史定位（2026-09-28 核查）

- 工作流跳过拒绝来自 [2026-09-14 的 Caption Refine 工作流提交](https://github.com/world-sim-dev/sandai-data-smith/commit/579df401d426f64ffb1eebb3f94a3c8b32fd0dbf)：在原通用提交路径之前增加工作流分支，并直接拒绝跳过。2026-09-17 整题化提交 `7a7272e31388432e7e3e76569f308fd14deffccb` 延续该限制，仅调整拒绝文案。通用跳过能力与新题型工作流没有对齐。
- 待定首次实现 [2026-09-21 的提交](https://github.com/world-sim-dev/sandai-data-smith/commit/8c977cbedaa2e0fce92c45e9c89c7567cef455e5) 就将待定排除出完成数和送审候选，同时保留应交分母、让前端批次保持标注中。[测试环境 PR #1548](https://github.com/world-sim-dev/sandai-data-smith/pull/1548) 也明确列出不允许整批送审的验收项；后续确认弹窗却表达为不进入后续标注、质检，形成使用预期冲突。
- 上述是提交历史日期，不代表生产部署日期。此次未找到同一链路早期允许待定后整批送审的代码证据，也未复现用户记忆中的旧版本；不能据此否认用户曾观察到可流转，更不能把已有实现或测试当成已获确认的业务规则。

**How to apply:** 回答“为什么以前能用”时分别追溯通用路径、新题型特判和批次门禁；修复应使待定处置、实际交接范围及质检清单一致，并保留异常记录。不要仅删除后端拒绝条件、放开前端按钮或把待定伪记为有效答案。

2026-09-28 开始修复后形成的工程边界：工作流跳过复用 `local_answer_commit` 的幂等、基线和发布协议，答案表只存问题理由，固定作答上下文保留质检修订所需的服务端基线。待定排除同时落在批次及整包来源清单，普通未答和未派份次仍需覆盖；原登记义务身份保持稳定，精确生效成员由批次版本、答案清单摘要与来源证明绑定。已交接批次仍整体禁止自行编辑。实现指针为任务分支 `codex/annotation-exception-handoff` 的工程决定 `sand-eval/.agents/notes/implemented/bug-fix/2026-09-28-annotation-exception-handoff.md`；交付及后续修订看 [PR #2147](https://github.com/world-sim-dev/sandai-data-smith/pull/2147)，CI 证据看该 PR 的最新 head 与 Platform Gate，不能视为上线或生产修复完成。

## 待定恢复后的整包资格审查（2026-09-28）

**Why:** PR #2147 的 `9f7ddf6e` 保持登记范围版本稳定，却让有效成员随待定变化。代码审查发现需补核对的场景：一个批次全部待定，其他批次按 Sand 单批链路通过；待定批次恢复作答但尚未正式交接时，`live_annotator_batches` 仍只包含旧正式批次。`ResultEligibilityService.qualify` 比较的仍是旧批次集合，单批 `InspectionContextService._sand_batch_predecessors` 不重验整包当前应交清单。历史整包路径的 `_aggregate_execution` 有 `check_completeness`，不能将其覆盖范围推广到单批路径。本次是源码调用链审查，未做该场景的运行时复现，非生产故障认定。

**How to apply:** 合并前给最终整包资格核验补充当前应交清单与冻结叶子的精确比较，保留单个未变化批次独立质检的能力；回归应覆盖全待定兄弟批次恢复、未正式交接、之后补齐质检的状态变化。现有 `test_annotation_exception_handoff.py` 使用 `pass_quality` 整包路径，不能替代按批次路径的证据。修复状态以 PR 最新差异及测试为准。

2026-09-28 修复指针：[追加提交 `086ed1559`](https://github.com/world-sim-dev/sandai-data-smith/commit/086ed1559275b7ea8562ab2082b81c4f0a7f2078) 在 `ResultEligibilityService.qualify` 复用 `SubmissionService.check_completeness`，比较当前应交清单与全部冻结批次叶子，旧凭证复验沿用该检查。`tests/quality/application/management/test_result_eligibility.py` 的恢复待定回归覆盖首次资格、旧凭证、未变化批次独立检查，以及恢复批次完成质检后新包可用；[Platform Gate #36412820402](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36412820402) 验证该提交成功。CI 使用来源投影夹具与真实质量服务，非浏览器或生产验收；是否合并上线须另查 PR 与部署状态。
