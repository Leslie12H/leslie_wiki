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

- 2026-09-21 兼容方案与固定 main 审查基线：`/Users/leslie/Documents/Playground/output/inspection-compatibility-plan-20260921/plan.md`。先验证规范质量配置，再区分当前归属与旧执行历史；配置存在但无报告不能回退旧页。方案未实施。
- 2026-09-21 第二个生产案例：`/Users/leslie/Documents/Playground/output/task-inspection-mismatch-20260921/second-report.md`。新版 amendment 与旧 amended 行的答案ID、质检员、时间已逐条对应；旧结论非空不代表走过旧流程，分类审计要排除这种来源写入。

- 2026-09-21 用户将概览与答题卡分析纳入同一兼容方案，见上述 plan.md 扩展章节。性能核查指针：CaseAnalysisPage全量卡后浏览器筛选分页、useBoardFilter全量取值索引、概览_task_and_cards、TASK_TIMELINE_SQL未区分质检修改。方案要求聚合summary、服务端筛选分页、精确facet口径与有界媒体读取，尚未实施或压测。
