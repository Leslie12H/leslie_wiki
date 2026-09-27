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
