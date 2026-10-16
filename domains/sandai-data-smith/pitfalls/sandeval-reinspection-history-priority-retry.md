---
name: sandeval-reinspection-history-priority-retry
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sand-eval, reinspection, sampling, idempotency]
links: [sandeval-quality-sampling-return-map, sandeval-reinspection-sampling-lineage]
---

# 复验重试复用冻结计划，必入样与实际应判分别核验

**Why:** 固定随机种子只能稳定同一输入的排序。历史优先级会随当前复验提交及另一关卡形成新结论而变化；在同一操作的重试中重新读历史，可能生成与已持久化组不同的样本。此外，样本进入冻结计划并不证明它实际被判断，显式检查范围可能把它豁免。

**How to apply:** 先从前端与真实 API 追踪完整调用链，验证外层是否已经复用或跳过已就绪组，不能把直接调用内部方法的异常等同于用户可触发的问题。固定部署提交，以同一处置/请求分别在新轮次创建后、正式提交后和负责人验收前重试，逐一比对 group、成员与 plan hash。已存在的轮次在校验身份、权限、关联与版本后应复用其不可变快照，准备中断也从该快照恢复。另独立核对范围开关、exempt 集合、实际判断和正式报告，明确“历史必入样”是否同时要求“本轮必须产生有效结论”；不从必抽数直接推断已完成复验。

## 权威入口与证据

- 源码入口：`quality/application/resolution/manual_return_service.py::restart`、`quality/application/management/reinspection_service.py::_create`、`reinspection_sampling.py::historical_priority_members`；冻结校验与恢复看 `inspection/review_plan_service.py` 和 `domain/inspection/review_task.py::validate_group`。
- 入口保护核验：退回按钮与后台恢复沿 `ManualReturnService.submit/recover` 追踪；“安排复验”沿 `BatchReviewTable.reinspect`、管理 API 的 `create_review_plan`、`AssignmentService.create` 与 `ReinspectionService._create` 追踪。前端失败后的再次确认与后台恢复是不同路径，逐一验证，勿相互推断。
- 范围开关：`quality/application/inspection/inspection_scope_service.py::enable`；已有零实际检查可提交场景在 `tests/quality/application/inspection/test_inspection_scope.py`。两者分别核验，不能仅按新抽样规则推断实际检查义务。
- [2026-10-16 只读审查报告](/Users/leslie/Documents/Playground/output/sandeval-sampling-audit-20261016/report.md) 保存测试环境健康/部署核验、固定提交代码链接、重试前后对照、领域服务夹具复现、规则交互与验证限制；同目录有脚本和结构化结果。是否修复须重新读当前源码与部署，不从本页推断实时状态。

本次仅审查与本地夹具复现，未改业务代码、部署或数据库。
