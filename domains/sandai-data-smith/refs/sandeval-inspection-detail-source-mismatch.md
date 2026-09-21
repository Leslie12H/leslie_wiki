---
name: sandeval-inspection-detail-source-mismatch
type: reference
created: 2026-09-21
updated: 2026-09-21
tags: [sandeval, quality, legacy, detail]
links: [sandeval-auto-reinspection-verification]
---

# 质检详情与质量中心取数不一致

**Why:** 任务列表使用质量中心正式通过判据，而旧任务质检详情可能仍读 QcCard/QcRound，导致已通过任务显示待派；有少量改后通过记录也不证明完整报告已接通。

**How to apply:** 固定 source task 与 quality task 映射，核对正式报告、推进回执与旧卡/轮次数量，再追踪两页面的读取入口。原始 review_item.verdict 不代替最终有效结论。

- 2026-09-21 生产22题案例与原始回执：`/Users/leslie/Documents/Playground/output/task-inspection-mismatch-20260921/report.md`。运行状态变化时重新查询。
- 列表通过判据：`quality/application/management/task_stage.py::TaskStageReader`。
- 详情入口：`frontend/src/pages/allSpaceTasks/InspectionPage.tsx`、`backend/app/api/all_space_tasks.py::inspection_progress`。
- 修复应统一新版读模型，兼容历史任务；不靠补写旧卡或重复质检消除空展示。
