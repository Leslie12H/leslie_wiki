---
name: sandeval-manual-return-partial-write
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, quality, rework, manual-return, autocommit]
links: [sandeval-inspector-rework-round-list-and-editability, sandeval-direct-return-interrupted-by-leader]
---

# Sand Eval 退回标注员失败后只留下停止检查

**Why:** 退回动作跨检查状态、上级整改执行、退回处置和命令回执。逐语句 autocommit 下，先停止检查、再更新整改进度的流程遇到后续条件更新失败，会留下已停止但标注员未收到退回的状态。列表展示“待质检员整改”不能证明仍有可执行任务。2026-10-15 J王珍/J刘子嘉个案通过两次生产 Leader 回读和同一数据库 session 的 SQL 实参确认了这种部分落库；该单最初走供应商负责人路线，不应套用旧的直接整改重复退回结论。

**How to apply:** 固定质量任务、当前轮次、Sand route 和负责人子处置；核对逐题保存事实、实际账号资格、detail.available_actions 与 assert_returnable。对失败退回，用请求时间/Pod/request_id 关联 hg_query_log，并核对 query_detail 中精确 review/执行 ID、session_id 和 affected_rows，区分停止成功、进度更新失败、处置缺失。UPDATE 0 的条件同时包含版本、固定 context 和 pending 状态；没有事发 before-image 时，不要把某个后台并发或副本滞后认定为已证实原因。恢复必须覆盖中断步骤、父责任、幂等回执及标注员实际待办，不能只放开按钮或把 stopped 改为可编辑。

- 2026-10-15 只读取证、精确对象、SQL 实参、失败请求、当前部署和证据边界：[报告](/Users/leslie/Documents/Playground/output/wangzhen-rework-20261015/report.md)。诊断没有修复生产；后续状态须重新核验。
- 源码指针：quality/application/resolution/manual_return_service.py::_return；resolution_service.py::capture_manual_annotation_return；quality/infrastructure/persistence/resolution_execution_repository.py::update；quality/application/inspection/review_query_service.py::detail 与 inspector_display_status。先核对实际部署，不能将当前 main 当成事发版本。
