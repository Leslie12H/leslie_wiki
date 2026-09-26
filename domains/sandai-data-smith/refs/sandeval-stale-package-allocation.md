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

2026-09-26 证据与当时状态见 `/Users/leslie/Documents/Playground/output/kemeng-sand-qc-20260926/report.md`；其中保留三条前后继检查链、正式工作台和管理查询结果、部署身份及限定 SLS 查询。动态状态留在事故证据，后续处理须重新读取。该段对应初始只读调查；随后用户授权的恢复和最终验证另见同目录 `恢复结果与根因方案.md`，动态结果以该报告及其验证工件为准。

2026-09-26 页面核查补充：`tab=allocation&task=...` 实际是数据包详情抽屉，默认批次进度。按页面请求一并核查 package、batch_options、dispatches；尤其检查包级 blocking_reasons 是否为空、分配记录的 dispatched_at 是否仅来自计划创建时间，以及同名标注员的不同批次是否被混淆。详细字段和本次状态见上述事故报告的 tab 补充节。

2026-09-26 恢复核查补充：首个 PREREQUISITE_STALE 不是全部恢复前置；还需执行 `require_supplier_acceptance` 并枚举未结范围。检查 `BatchAllocation.package_submission_id` 是否固定旧版本，以及 resume 是否确有重校验/重绑定路径；不能承诺做完已定位的几批复验就会自动恢复。动态计数与当前缺口见事故报告“恢复前置的进一步校正”。

2026-09-26 选择范围校正：给恢复建议前，必须将 selected allocation 的 scope_key 与失效报告/未结整改范围求交，不能只按同一质量任务或同名标注员推断业务依赖。若没有交集，应明确区分“当前实现按整包拦截”和“所选批次业务前置未完成”；先评估有版本保护的按批次隔离修复，而不是要求用户处理无关批次。整包重新交接是另一路径，不应自动成为所有局部派发事故的恢复要求。证据与性能设计约束见事故报告末节。

2026-09-26 受控恢复补充：区分 **完整包历史封存证据** 与 **单批实时执行依赖**。`_sand_batch_predecessors` 的当前报告检查范围为本批，但 `_frozen_sand_batch_reports` 要求单批记录的历史 source_group_ids/required_report_ids 与父包完整一致，再定位本批历史报告；仅缩短持久化数组虽可能通过创建及详情验证，却会让队列/正文报 SNAPSHOT_CORRUPT。产品修复需保持历史协议，同时收窄创建、未结处置和落库前检查的实时依赖，不把现有记录直接改成不兼容格式。最终验收必须覆盖真实账号入口、列表、详情、队列、全部正文和保存前置；通过任务数量/详情不等于能开始检查。

操作审计指针：上述事故目录中的 `RECOVERY_RUNBOOK.md`、`recover_selected18.executed_v1.py`、`repair_created_evidence.py`、`verify_recovery.py`、`final_comparison.json`。本次新增证据的兼容修正保留逐条不可变前后审计并用 payload/version CAS；旧数据不做备份覆盖。独立验证和零写重放证据见 `恢复结果与根因方案.md`。执行途中遇到其他发布时，应拒绝旧脚本跨部署直接写入；复核新版本差异后重新验收。
