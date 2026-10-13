---
name: sandeval-allocation-frozen-execution-context
type: pitfall
created: 2026-10-13
updated: 2026-10-13
tags: [sandai-data-smith, sandeval, quality, hologres, frozen-answer]
links: [sandeval-workbench-context-404-evidence, sandeval-dispatch-follower-command-read]
---

# 质检分配冻结 execution 缺失与失败状态残留

**Why:** 质量分配需要固定答案、答案字段和同一 response 的不可变 execution 回执。普通 Follower 若先看见答案而尚未看见回执，来源服务会抛出“固定答案缺少作答上下文”。质量元数据或最终写步骤使用 Leader，并不会把独立 AnnotationClient/result_service 的读取一起绑定过去。批次可能在送审和检查组创建前失败；此时页面 0/0 是未生成检查执行的默认进度，不是标注未完成。后续回执可见，也不等于已持久化的 needs_attention 自动恢复。

**How to apply:** 固定 QT、QA、scope_version、部署 SHA 和时间窗口。读取该 allocation 的 group/submission/error 事实；只读调用原 scope_version 的 list_submission_results，得到确切 response_ids，再逐一对照 Leader/Follower 的答案和 execution 回执。调用只读 read_response_versions 验证当前前置条件，不调用 freeze/create/resume 作为诊断。对历史 trace 的 allocation_freeze_source member_count 和精确 SQL 指纹，按毫秒 SQL span 对齐 hg_query_log 的查询形状、仓库、calls/result_rows；绑定参数未记录时，明确说明只能通过唯一时间匹配建立关联，不能指出具体历史缺失 ID。核实 production quality_allocation_recovery_enabled；恢复应复用原 allocation 的继续分配入口，不新建批次或让标注员重新作答。当前来源读取成功不替代快照、送审、检查计划的真实续跑验收。

## 核验指针

- 2026-10-13 第 6 批次的只读调查：[报告与精确证据](/Users/leslie/Documents/Playground/sandeval-qc-context-20261013/report.md)，[脱敏读数和 trace 对齐](/Users/leslie/Documents/Playground/sandeval-qc-context-20261013/evidence.json)。包含 8 次冻结失败、7 次唯一回执 SELECT 返回 2 行、随后同范围版本 3/3 来源读取成功与自动恢复开关；固定日期调查不代表未来运行状态，未执行生产续跑。
- 来源正文读取：`sand-eval/platform/backend/app/services/facts/qc_verdict.py::read_response_versions`；`AnswerExecutionRepository(self.repository.client).for_responses` 与 execution 缺失分支。
- 回执读取：`app/repositories/answer_execution.py::for_responses`，必须 task-bound 且非空 response_ids；核对 client 实际连接，不从外层 UOW 推断。
- 冻结与分配：`quality/application/management/submission_content_service.py::freeze`、`batch_allocation_service.py::_resume/_submission`；失败时 batch 的 error 持久化，group_id 未生成。
- 页面状态：`quality/application/management/leader_query_service.py` 无 review summaries 分支把 sample_count/completed_count 置 0，并将 batch.error_message 投影为 blocked；前端 `batchReviewColumns.tsx` 显示“待处理”。
- 恢复开关：`quality/infrastructure/runtime.py::_recover_cycle`，仅在 quality_allocation_recovery_enabled 开启时调用 allocations recovery。读取实际部署配置，不把源码默认值当运行状态。
- 同类权威读和主任务发布误报的范围：[工作台 404 证据边界](sandeval-workbench-context-404-evidence.md)、[主任务 Follower 命令读](sandeval-dispatch-follower-command-read.md)。每个新批次独立核验，不能只凭相同提示套用旧根因。
