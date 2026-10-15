---
name: sandeval-caption-refine-skip-defer-handoff
type: pitfall
created: 2026-09-28
updated: 2026-10-15
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

## 误点待定且已交卷的继续作答恢复（2026-10-14）

**Why:** “没有正式答案”与“没有保存内容”是两个事实。`local_edit_v1` 的待定回执保存完整字段、结构操作与元数据，但不产生正式 response；管理答题详情因此可同时显示待定和“还没有作答”。原批次确认提交后，写入门禁覆盖待定卡；仅打开待定题不能绕过交卷锁。未冻结、未分配质检的个人交卷可以作为受控管理恢复候选，不需要虚构质检退回或替标注员提交答案。

**How to apply:** 用原生 `ev3_answer_card_id(assignment_id)` 查询作答回执，不能把稳定 assignment ID 当成派生答题卡 ID。先核对本人账号、当前持有人、原 wave 成员、交卷轮次/请求、待定 checkpoint、另一题正式答案，以及冻结提交和质检分配（包括 preparing）；任何已经冻结或已分配的范围都不适用本次管理撤回。受控 operator 默认 dry-run，冻结计划并显式 apply，使用 producer 提交 lease 和写时未分配/交卷/归属/答案条件；复用交卷 retirement 与原生审计，不删除待定回执、答案或原交卷历史。没有真实质检处置时，不向 `reopened_by_disposition_id` 伪填处置单，原因和实际操作者留在明确的管理 requested/completed 审计里。不同 Pod 的主库回查须证明只有交卷 reopen 时间改变，原生作答 fence 已解除，原生快照读取确实选入未变的 checkpoint。恢复资格后仍可显示待定，标注员需从待定入口核对内容并正式提交，之后再确认提交批次；入口恢复不等于本人提交成功。

- 本次限定实例、operator、运行方案、五项保护测试、生产 EXPLAIN、apply 回执与独立快照验收：[2026-10-14 处理报告](/Users/leslie/Documents/Playground/output/deferred-ailingling-20261014/report.md)。状态会变化，复用前重查；本次没有新增普通用户自助撤回能力，也没有修改线上平台代码。
- 当前实现指针：`backend/app/usage_docs/content/annotator/start-and-finish.md` 的待定说明；`backend/app/api/annotation_write_gate.py::_correction_work_unit_if_fenced`；`backend/app/repositories/annotation_batch_handoff.py`；`backend/app/repositories/annotation_qc_allocation.py`；`backend/app/repositories/answer_execution_snapshot.py`。部署、后续本人正式提交和整包质量资格分别核验。


## 2026-10-15 待定题与质检题号的同题核验

**Why:** 用户反馈“标注第 1 题已经待定，质检第 1 题仍可见”时，两处题号可能属于不同队列。成功的待定回执与真实的质检记录可以同时成立，但对应不同工作项；仅凭相同题号或质检员备注中的“已待定”，不能认定待定排除失效，也不能直接归责标注员。

**How to apply:** 由质检链接的 `quality_task_id + review_task_id + item_id` 追到冻结送审成员的 `work_unit_id`，再与原 wave 成员、原始 seq、派生答题卡、`annotation_defer` 回执和正式 response 精确关联。核对整份送审成员清单和当前原生卡状态，确认真正待定的题是否被排除；历史反馈题号与当前页面的原题号投影要分别核验。跨工作台编号背景见[原题号与历史映射](sandeval-cross-workbench-question-order.md)。

2026-10-15 单案只读证据指针：[石羽宁反馈的工作项映射与时间线](/Users/leslie/Documents/Playground/output/sandeval-shiyuning-defer-20261015/evidence.json)。归档含部署 SHA、两张卡的身份、待定/提交回执、原生状态以及完整送审和检查成员；实时状态与上线情况须重新读取。本次没有修改生产数据或平台代码，未执行用户当时的浏览器点击，也不以持久化取证断言其当时为何使用该题号。
