---
name: sandeval-auto-reinspection-verification
type: reference
created: 2026-09-20
updated: 2026-09-20
tags: [sandeval, quality, reinspection, production, acceptance]
links: [sandeval-correction-fixtures, sandeval-e2e-acceptance]
---

# Sand Eval 自动复验派回验收入口

**Why:** 2026-09-20 的生产测试说明，发布成功、开关开启、整改提交成功都不能证明原质检员已收到复验。手动“退回标注员”与正式驳回报告的事实形态不同，取人时只读正式报告会漏掉合法停止的原检查。

**How to apply:** 用独立测试批次完成原质检员退回与标注员整改提交，提交后不人工安排复验。对照新旧检查任务、受派人、轮次、原任务引用和自动派单请求标识；结合后台日志与浏览器待办。列表“待复验”仅覆盖未开始保存判断的复验，已作答需查质检中或具体任务。

- 2026-09-20 生产场景、身份、逐阶段回执和根因证据：`/Users/leslie/Documents/Playground/output/prod-auto-reinspection-20260920/report.md`；运行状态会变化，现场回读 `state.json` 对应对象。
- 自动取人与完整性判据：`sand-eval/platform/backend/quality/application/resolution/resolution_service.py::_auto_assign_reinspection`。
- 正式报告与合法手动退回的读取边界：`sand-eval/platform/backend/quality/application/inspection/report_service.py::group_result`、`returned_inspection`。
- 后台接线与周期：`sand-eval/platform/backend/quality/infrastructure/runtime.py`。周期和开关需查当前部署，不把固定等待两分钟作为成功保证。
- 修复验证须分别覆盖正式报告驳回和“退回标注员”停止原检查两条路径，保留完整组、资格、授权和幂等校验。是否已修复以当前代码及新运行证据为准。

## 整改后的抽题验收入口

**Why:** 只确认复验总数和接收人，无法证明上轮不合格题被纳入；整改后答案版本变化，直接对比旧新样本 ID 也会误判。

**How to apply:** 按稳定的 work_unit_id 或答题卡身份比对两轮集合；记录不合格题是否全部命中、补抽数、与上轮合格题的交集。先明确补抽允许旧合格题再次入选，还是要求全部未见题，再核查当前算法。

- 必检题提取及新答案映射：`sand-eval/platform/backend/quality/application/management/reinspection_service.py::_rejected_members`。正式报告路径应以生效结论为准；手动退回路径核对已保存判断。
- 必检集合与补抽候选集合：`sand-eval/platform/backend/quality/domain/management/sampling.py::assign_samples`。以当前代码和现场冻结计划为准。
- 2026-09-20 的 50 题 / 抽检 10 题 / 3 题不合格生产独立场景与两轮逐题对照：`/Users/leslie/Documents/Playground/output/prod-reinspection-sampling-20260920/report.md`；状态与回执在同目录。

- 2026-09-20 测试环境“Sand 手动退回 → 供应商直接验收 → 重新交接”断点证据：`/Users/leslie/Documents/Playground/output/test-yundu-reinspection/report.md`。核对 `AggregationService.submit_package` 与 `ResolutionService.auto_assign_reinspections` 的执行登记接线；支持 sand_qc 枚举不足以证明每个回交入口都会生成复验执行。

- 2026-09-20 生产 1000 题未改答案复验的 SUBMISSION_SCOPE_EXISTS 证据：`/Users/leslie/Documents/Playground/output/prod-scope-conflict/report.md`。先区分已冻结快照与已登记复验执行，再核对当前 `UnitOfWork` 是否真正提供回滚；首次中断异常仍须查历史日志。

- 2026-09-20 Caption 直接验收回交核验：`/Users/leslie/Documents/Playground/output/caption-resubmit-20260920/report.md`。缺失自动复验执行不等于手工入口不可用；结合 `LeaderQueryService.detail` 的 remediations、`BatchReviewTable` 的 `BatchRemediationActions` 和包详情旧状态投影一起核查。当前是否可操作须按实际 Sand 身份回读。

- 2026-09-20 两条修复候选的代码入口：分支 `codex/reinspection-return-routing`，提交 `1c3f66687`；`ResolutionService.resubmit` 区分自动收集的共同责任与已验证祖先，并提前完成责任校验；`LeaderResolutionService.recover_supplier_handoffs` 从直接验收和新交接事实接回原 Sand 检查员。验证入口为 `test_resolution_workflow.py::test_interrupted_recheck_inherits_old_return_without_joint_resubmission` 和 `test_cross_space_remediation.py::test_handoff_recovers_same_sand_inspector_without_leader_click`。候选是否合入、Gate 是否通过以及实际部署状态必须查 PR/CI，不把代码存在当作已上线。已有部分写入的生产送审仍须单独按恢复流程处理。
