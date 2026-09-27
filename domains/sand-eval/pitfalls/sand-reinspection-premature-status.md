---
name: sand-reinspection-premature-status
type: pitfall
created: 2026-09-27
updated: 2026-09-27
tags: [sandeval, quality, reinspection, state-projection]
links: [sandeval-auto-reinspection-verification]
---

# Sand 待复验展示与供应商验收边界

**Why:** 2026-09-27 对指定生产批次的排查发现，上级 Sand 退回处置处于 processing 时，供应商子整改仍可能未完成负责人验收。处理中只表明整改链已启动，不能单独证明 Sand 已收到可执行的新复验。

**How to apply:** 沿标注员整改 → 供应商质检 → 负责人验收 → 回交 Sand 核对父子处置及正式回执。分别读取旧 Sand task、后继 task 和最新 Sand submission，区分展示标签提前与实际派单提前。

- 现场报告及对象指针：`/Users/leslie/Documents/Playground/output/sand-reinspection-order-20260927/report.md`；状态会变，按报告 ID 重新回读。
- 展示入口：`sand-eval/platform/backend/quality/application/inspection/inspector_list_projection.py::manual_return_display`；详情和列表共同调用。核对是否仍把所有 processing 无条件投影成 pending_reinspection。
- 自动回交入口：`quality/application/resolution/leader_resolution_service.py::recover_supplier_handoffs`，事实选择器 `quality/infrastructure/persistence/disposition_repository.py::handed_off_supplier_returns`。核对 supplier_accepted 及后续交接回执，不以标签证明自动派单已发生。
- 改动验收须覆盖供应商整改未完成、质检通过但负责人未验收、负责人验收未回交、已回交并派出 Sand 新轮次四个边界。

## 嵌套整改后的负责人验收

**Why:** 再次退回标注员会中断原负责人整改执行。新质检通过与子整改闭环，不代表验收入口已重新接上原负责人验证范围；普通推进回溯历史报告时仍可能被待验收父责任拦住。

**How to apply:** 对比当前质检 group、原执行 followup group、子执行 verification stage、祖先处置版本与精确 permit，确认验收入口能恢复负责人上下文。不要通过清空 blocker 或提前关闭 Sand 退回来消除报错。

- 2026-09-27 只读现场与具体对象指针：`/Users/leslie/Documents/Playground/output/sand-reinspection-order-20260927/acceptance-report.md`。
- 代码指针：`resolution_service.py::prepare_lead_verification`、`aggregation_service.py::_unblocked`、`manual_return_service.py::authorized_returns`；核对嵌套 delegation 子处置是否沿已闭环子执行恢复。

- 修复与验证指针：`/Users/leslie/Documents/Playground/output/sand-reinspection-order-20260927/acceptance-change.md`，原方法复现证据见同目录 `acceptance-baseline-reproduction.log`。
- 接续跨越新答案版本时，应从已闭环子整改的直接执行组建立新的负责人验证执行；不可修改旧执行的固定上下文，也不可放宽通用报告继承校验。验收关闭已完成的委派责任后，不再重复安排同一质检。
- 交接边界仍由现有路径决定：直接供应商验收回执与委派子整改关闭是不同事实。检查自动恢复候选 SQL，不要假定所有手动提交后的退回都会自动派单。
