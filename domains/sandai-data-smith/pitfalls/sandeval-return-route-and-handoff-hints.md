---
name: sandeval-return-route-and-handoff-hints
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [sandeval, quality, remediation, handoff, testing]
links: [sandeval-direct-remediation-and-batch-handoff, sandeval-whole-package-reinspection-wait]
---

# Sand 退回路线与整包交接提示须分开判读

**Why:** 2026-09-28 测试环境的直接整改后，Sand 质检员列表仍提示要重新交接完整包；默认路线整包提交后，数据包详情短暂同时显示已提交和前置退回阻断；列表与工作台两处退回弹窗在取消后重开时路线选择不同。前两处提示不能直接用来判定交接失败，后一处有误选下游处理路线的风险。

**How to apply:** 核对退回处置证据里的路线、目标批次回交记录、最新完整包交接回执和 Sand 实际新轮次。列表等待文案需按退回路线投影；整包详情要区分已交接事实与当前复验/完成校验，若复现短暂阻断，保存包版本、处置 ID、Sand 批次和接口读取时间后再定根因。取消工作台弹窗只影响本地表单；再次打开时应明确默认路线，并核对最终提交请求中的路线。

- 测试样本和时间线：`/Users/leslie/Documents/Playground/sandeval-direct-remediation-20260928/测试环境实测报告.md` 的“其他观察”第 2、3、5 点。测试环境最终 3/3 通过，不能据短暂提示倒推整包提交失败；该次提示的具体根因未确认。
- 代码入口（核对运行版本）：`quality/application/inspection/inspector_list_policy.py::inspector_list_actions`、`quality/application/management/allocation_list_projection.py::pending_returns` 的等待文案；`quality/application/resolution/manual_return_service.py` 的路线证据；`quality/application/management/leader_query_service.py::_package` 与 `aggregation_service.py::sand_package_passed_for_read` 的交接/完成判定；前端 `SupplierInspectionList.tsx` 与 `ReviewWorkspace.tsx` 的取消处理，以及 `PackageDetail.tsx` 的标签和提示。2026-09-28 测试部署曾核对 SHA `ac961c955c5ed1398b383a2c325fe575c9861abb`，后续须重新核对当前部署。
