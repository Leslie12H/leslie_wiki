---
name: sandeval-stale-package-allocation
type: reference
created: 2026-09-26
updated: 2026-09-26
tags: [sand-eval, quality, allocation, reinspection]
links: [sand-eval-quality-center-test-data]
---

# Sand 质检分配与过期整包报告

**Why:** 管理页上的交接标签和人员计划不能证明实际创建了检查任务。2026-09-26 可梦任务的限定只读调查发现，旧交接包依赖的部分空间质检报告已有未提交的新复验，完整包前置验证阻止了新的 Sand 分配；与单纯漏写任务、权限错线或快照半写入须分别处理。

**How to apply:** 先按 allocation_id 核对 group_id、submission_id、error_code 和真实 review_task，再读取 package_submission_id 的冻结汇总依据，逐层追踪 source_group_ids 及各关卡最新检查组。比较直接 previous_task_id、轮次、报告提交状态，不将“有历史通过报告”当作当前仍有效。通过真实账号和明确 stage 调用正式工作台查询，避免用 root 可见性代替实际检查人待办。

代码指针：`quality/application/management/inspection_context_service.py::_aggregate_execution` 执行当前报告组比较；`aggregation_service.py::sand_allocation_package` 决定本次分配是否先验证整包；`batch_allocation_service.py::options_many/_resume` 分别负责轻量选项与实际执行。使用事故部署 SHA 阅读，后续可能变化。

界面指针：`frontend/src/pages/quality/management/AllocationDetail.tsx` 的交接标签读取 handed_off；`batchReviewColumns.tsx` 的 blocked 文案和说明控件应与实际准备/失败状态一同核对。

恢复边界：新复验尚未正式完成时，不得替人判通过或删除版本保护。取得当前有效验收依据后，还需检查原分配固定引用的包版本和 scope 占用，再决定受控恢复方式。单纯重复创建或继续执行旧计划不能修正旧报告链。

2026-09-26 证据与当时状态见 `/Users/leslie/Documents/Playground/output/kemeng-sand-qc-20260926/report.md`；其中保留三条前后继检查链、正式工作台和管理查询结果、部署身份及限定 SLS 查询。动态状态留在事故证据，后续处理须重新读取。本次只读调查没有执行恢复或部署。
