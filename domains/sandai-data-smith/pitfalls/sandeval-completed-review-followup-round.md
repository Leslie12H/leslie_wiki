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
