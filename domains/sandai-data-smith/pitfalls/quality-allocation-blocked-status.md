---
name: quality-allocation-blocked-status
type: pitfall
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, quality, allocation, status]
links: [sandeval-bulk-allocation-latency]
---

# 质检待处理与质检中状态判读

**Why:** 数据包批次里的分配人名、正式送审对象、真实检查任务和已检查题数属于不同事实。显示姓名或存在 submission 不足以证明任务创建成功；“质检中”也不保证检查员已经检查第一题。

**How to apply:** 从 `platform/frontend/src/pages/quality/management/batchReviewColumns.tsx` 的标签映射追到 `backend/quality/application/management/package_progress.py::batch_status`，再联查 `eval_quality_extension` 的 batch_allocation、当前 submission 链、`eval_quality_review_task` 和 `eval_quality_review_item`。核对实际 error_code，不按中文标签猜流程。

2026-09-25 核查源码主线 `52d2240af5b7537cb8c3926da489d2012e0b4fc6`：批次无真实检查任务且有分配错误时展示“待处理”；首轮检查任务未交卷时展示“质检中”。该观察是当时实现，后续以源码和页面为准。

来源检查凭证过期时，先核对 `dto.py::ExecutionEvidence.assert_valid` 和失败阶段，不直接归因于数据库。恢复入口看 `AllocationDetail.tsx` 的“继续完成分配”、`available_actions` 以及 `batch_allocation_service.py::_resume`；后者按未完成批次续跑，成功批次应保留。查询原因不授权执行恢复；刷新页面本身不代表已重试。

本次只读证据指针：`/Users/leslie/Documents/Playground/output/sandeval-qc-status-20260925/report.md`。其中包含任务标识、批次错误、真实检查进度和未执行恢复的边界。当前数据及按钮权限需重新查询，不在知识库固化活跃状态。
