---
name: sandeval-repeated-correction-ancestor-blocker
type: pitfall
created: 2026-09-30
updated: 2026-09-30
tags: [sand-eval, quality-center, remediation, reinspection, responsibility]
links: [sandeval-transferred-correction-task-visibility, sandeval-roles-and-workflow]
---

# 子整改闭环后再次退回丢失上级责任授权

**Why:** 上级负责人退回和下级标注整改有独立闭环。子整改质检通过后，上级责任仍可能处理中；若质检员随后再次退回标注，新退回需要承接真实上级授权。2026-09-30 只读实例确认：新单没有父处置和中断执行记录，工作台显示答案已有更新且可提交，但提交沿报告/送审版本继承链仍查出旧上级未结处置，本次授权集合缺少它，命中 `REVIEW_BLOCKED`。答案准备度和完整责任授权是两个不同门禁。

**How to apply:** 固定来源任务、质量任务、接收人、处置版本和部署 SHA。先读本人工作台的版本更新及准备度，再沿报告的 `previous_task_id` 和送审的 `previous_submission_id` 查未结责任；对比新单 `parent_disposition_id`、父版本证据、中断执行和实际 `_ancestors`。若子整改执行已完成，不能期望只扫描 pending 执行恢复其上级授权；也不能将页面“可提交”或新答案版本视作整条责任链已授权。修复必须恢复真实继承关系并保留上级独立验收，禁止直接关旧单或扩大用户权限。

- [2026-09-30 只读报告](/Users/leslie/Documents/Playground/output/wuqiuyu-correction-20260930/report.md)：含生产身份投影、两张阻塞单、时间线、门禁表达式重放和对应 409 日志；实例状态会变化，使用时重新核验。
- 本次部署源码入口：`sand-eval/platform/backend/quality/application/resolution/manual_return_service.py::_return`、`reinspection_authorization_service.py::manual_parent`、`resolution_service.py::_ancestors / capture_manual_annotation_return / resubmit`；完整阻塞范围扩展在 `quality/application/management/inspection_context_service.py::expand_disposition_targets`。源码属于可变指针，修复或发布后应重读。
- 当次 `manual_parent` 仅定位直接上一轮 group 的负责人退回，实例的旧负责人责任位于更早轮次，结果为空；`capture_manual_annotation_return` 仅捕获 pending 执行，而保存旧上级授权的子整改执行已 completed。具体对象与 SHA 保存在报告，本页不作为当前生产状态证明。
- 原始请求响应正文未保存在应用日志；本次通过同部署的只读阻塞查询、校验表达式和 212 字节响应大小交叉确认拒绝分支，没有为取证执行提交。浏览器未登录，本人工作台事实来自生产服务按当前身份的只读投影。
