---
name: sandeval-completed-review-followup-round
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [sand-eval, quality, reinspection, direct-return, progress]
links: [sandeval-inspector-rework-round-list-and-editability, sandeval-review-performance]
---

# Sand Eval 已检完却显示新一轮零进度

**Why:** 标注整改复验的正式完成与上级委派责任的复验衔接是两条路径。2026-10-19 只读核验中，上一轮已有完整正式报告，直接整改流程随后仍对同一送审版本安排了新的检查组，列表显示更新轮次的零进度。不能把它解释成质检员漏保存、漏提交，也不能把列表摘要“待确认”当作零进度证据。

**How to apply:** 按质量任务、scope_key、submission_id 与 revision、stage、group_id、attempt、previous_task_id 对齐前后轮次；核对逐题 verdict、报告 submitted_at、DIRECT_CHILD_REINSPECT 冻结回执、resolution_execution 与当前摘要。特别检查新轮次是否在已完成报告之后创建、是否仍绑定同一送审版本。若已形成新 pending 执行，代码新增恢复分支并不证明存量个案已恢复；保留旧报告及冻结责任，先判断能否接续既有正式报告进入负责人验收，避免直接清零或代填通过。

## 核验指针

- 当次只读报告与双 Pod 证据：[2026-10-19 本机报告](/Users/leslie/Documents/Playground/output/inspection-progress-20261019/report.md)。实际人员、轮次、提交时间、部署 SHA 和当前摘要状态以该证据及后续实时回读为准。
- 自动路径：`sand-eval/platform/backend/quality/application/resolution/direct_return_service.py::_reinspect_child/_accept_child/_accept_legacy_correction`，以及 `leader_resolution_service.py` 的安排复验与 `resolution_service.py` 的执行登记。使用实际部署源码核验，工作目录旧分支可能缺少恢复逻辑。
- 列表路径：`app/repositories/quality_inspector_summaries.py` 与 `quality/application/inspection/inspector_list_projection.py`；旧轮次可被当前组隐藏，完成记录仍保留。
- 摘要边界：`quality/application/task_list_summary.py::projection` 与 `frontend/src/pages/quality/inspection/SupplierInspectionList.tsx`。分别报告截图未知状态、实时摘要与实际逐题事实；当前 ready 无法还原旧截图的摘要不可用原因。

诊断阶段只读；后续已获用户明确授权进入修复。实现、Gate、部署与逐例恢复以[2026-10-19 交付证据](/Users/leslie/Documents/Playground/output/quality-all-cases-20261019/report.md)和对应原生审计为准，不能以代码合并推定业务已闭环。


## 两层整改责任的衔接检查（2026-10-19）

**Why:** 上层质检员整改执行可在再次退回标注员时中断；下层标注整改执行随后自动复验并通过，并不自动使上层执行进入等待验收。若自动服务只按上层处置查执行，下层的通过报告就不会被其代验收逻辑接到；随后“子整改全部闭环且本层无 pending”的条件反而再发起复验。请求级幂等不能阻止不同整改路径各自安排一次同版本检查。

**How to apply:** 在上述本机报告核对上层旧执行的 MANUAL_ANNOTATION_RETURN、下层 resolved 执行和正式通过报告，再沿 `_accept_child` 的 for_disposition 读取边界、`_reinspect_child` 的触发条件，以及 `LeaderResolutionService.execute` 的新 LRA 派单逐步对齐。修复应核验同版本、冻结范围、报告有效性和责任谱系后接续负责人验收；只改列表计数不能闭环。当前源码含恢复分支也须检查已有 pending 执行是否使其前置返回，不能假定存量已处理。


## 审计恢复与持久化查询一致性（2026-10-19）

**Why:** 同一检查仓储的单批查询与批量查询可能各自选择“最新组”。只在批量查询排除有审计标记的已撤销重复组，会让列表恢复而命令仍选中新轮次；内存 fake 若已实现排除规则，领域流测试也可能漏掉真实 SQL 的差异。已写入审计和停止标记后的部分失败必须续做原计划，不能删组或另起轮次。

**How to apply:** 让单批与批量共用当前组选择；用真实 SQL 执行覆盖撤销组、普通停止组、仍活动但有同名标记的组，以及历史组读取，核对边界。新组已有判断时，必须对齐同一冻结样本、版本、实际质检员、判断、备注和证据，完全相同才允许保留并记入审计；有冲突、修订或候选时拒绝自动恢复。每次应用以冻结摘要与原生 CAS 复核，独立连接比对原报告、原逐题记录及新组保留工作；原生验收、回交与 Sand 实际复验分别报告。

- 实现指针：`quality/application/resolution/completed_report_reuse.py`、`quality/infrastructure/persistence/review_task_repository.py::for_submission/for_submissions` 与 `app/cli/completed_report_recovery.py`。
- 交付指针：[PR #2603](https://github.com/world-sim-dev/sandai-data-smith/pull/2603)、[生产验收补充 PR #2604](https://github.com/world-sim-dev/sandai-data-smith/pull/2604)。状态及个案数量以本机交付报告和在线原生事实为准。


## 来源凭证与最后一次慢读取（2026-10-19）

**Why:** 在读取当前有效分区之前续取来源凭证，后续分区展开仍可能耗尽凭证时限，导致每次重试在同一落库点失败。只挪动过期检查的位置也不能替代重新核验当前人员、精确冻结成员与权限。

**How to apply:** 在最后一次慢来源/分区读取之后、写事务之前，沿原生验证器对同一 actor 和成员重新取证；保留 TTL，权限撤销或范围变化仍拒绝。写事务继续复核正式批次身份、报告组与阻断。实现与定向时钟测试指针：[PR #2605](https://github.com/world-sim-dev/sandai-data-smith/pull/2605)。

## 预留编号与有效分区的后续消费者（2026-10-19）

**Why:** 整包退回需要预留尚未派检的 Sand 编号以阻止并发派检，但编号尚未对应真实送审，不能直接展开其责任谱系。另一方面，整包汇总接入有效分区后，退回路径若仍用所有历史批次比较，会拒绝新生成的合法包。正式代改分属并行批次时，来源版本可解释也不代表一份旧报告拥有全部新版本的资格。

**How to apply:** 分别保留全量派检围栏和真实送审责任链；真实报告缺失、未结整改仍严格阻断。分区改动必须连同整包提交、单批回交、整包退回、再质检与成果导出逐一检查，并对每个有效成员保留实际报告所属批次。不能用跨批次代改存在性替代报告资格。可梦原问题修复指针：[PR #2607](https://github.com/world-sim-dev/sandai-data-smith/pull/2607)；消费者与并行代改分区的取证、修复及验收以[2026-10-19 review 证据](/Users/leslie/Documents/Playground/output/quality-all-cases-20261019/review-20261019.md)及后续原生回读为准。


## 并行代改保留各自报告归属（2026-10-19）

**Why:** 一个完整整改批次转给新作者后，原作者范围可能消失；当前答案的正式代改还可能分别属于原整改批次和并行普通批次。只核验原整改成员的后继会漏掉并行批次的有效成员；直接承认所有跨批次代改又会错误借用报告资格。整包退回也不能把全部历史批次重新当成当前包。

**How to apply:** 先沿已完成整改的精确 source/target 边解释作者变化，再按每个冻结成员自身的正式代改 ledger 寻找当前版本的唯一归属。只有缺口完整覆盖且无歧义时才接续子集，各被选批次仍须分别通过当前质检、负责人验收与完整来源校验；其他重叠历史批次有未结责任时拒绝。退回冻结同一有效分区和完整本地批次版本，准入只重读本地快照拒绝并发漂移，保留尚未落地编号的派检围栏。验收必须覆盖退回、原请求重试、标注修订、复验、负责人验收、整包重交、所有 Sand 批次重新检查及成果资格。

- 实现指针：`quality/application/management/parallel_amendment_partition.py`、`SubmissionService.live_annotator_partition`、`PackageSelfCheckService._freeze/_admit`。
- 回归指针：`tests/quality/application/management/test_parallel_amendment_partition.py` 与 `test_package_return_admission.py`。交付及当前运行态查 [PR #2607](https://github.com/world-sim-dev/sandai-data-smith/pull/2607) 和[本机交付报告](/Users/leslie/Documents/Playground/output/quality-all-cases-20261019/report.md)。


## 已完成范围迁移与单批回交（2026-10-19）

**Why:** 整改把原批次的部分答案转给新作者后，合法的新批次可有不同范围版本，同时仍包含原退回的全部固定题目。直接比较原 Sand 批次与当前批次的 scope_version 会把已通过复检、验收的正规整改误判成额外业务漂移，导致上层责任已闭环而单批回交停住。普通范围版本相等和题目集合相等也不是可以互换的资格凭据。

**How to apply:** 版本不同时，仅沿原 Sand 冻结子批次自身的 previous_submission_id 链接续；要求末端整改执行已完成且 resolved，每条前驱边有完成记录，逐级核验受控范围迁移声明、质量规则和固定题目集合。当前来源分区、精确原退回题目、当前质检和负责人报告、权限与交接写入校验全部保留。缺失、未完成、驳回或来自其他送审的末端不能放行；无需改原报告或历史答案。新增回归应真实完成单批回交、Sand 复验与验收，并验证失败前无交接写入。

- 代码与回归指针：[PR #2610](https://github.com/world-sim-dev/sandai-data-smith/pull/2610)，`AggregationService._completed_batch_continuation`、`test_migrated_batch_handoff.py`。合并、部署与真实存量恢复状态以[本机交付报告](/Users/leslie/Documents/Playground/output/quality-all-cases-20261019/report.md)和原生审计为准。


## 执行快照与真实派单投影（2026-10-19）

**Why:** 恢复后执行表快照可能仍是 awaiting_assignment，而原生 `_assigned_execution` 已从实际检查组投影出 rechecking；单看快照会误判未派单。整包已经退回后，原报告停止也会让再次对旧包直接调用私有冻结预检失败，这不等于原退回未完成。

**How to apply:** 独立回读正式交接回执、原生执行投影、真实 review_task 的组、关卡、处理人与状态，再判断是否需要恢复。原生自动派单发现已有检查组而返回 false 是避免重复的正常结果。已有整包退回决定用 `PackageSelfCheckService.detail`、同请求回执和页面自查任务核验，不把创建新决定的私有 `_freeze` 当成已退回事项的状态接口。运行证据查同页本机交付报告及 `eight-runtime-final.json`、`kemeng-production-real-return-readonly.json`。
