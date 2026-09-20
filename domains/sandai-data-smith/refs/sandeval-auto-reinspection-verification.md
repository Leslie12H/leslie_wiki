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
