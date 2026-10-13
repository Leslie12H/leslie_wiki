---
name: sandeval-correction-handoff-stale-response
type: pitfall
created: 2026-10-13
updated: 2026-10-13
tags: [sandeval, correction, frozen-answer, version-consistency]
links: [sandeval-reassigned-answer-frozen-review-conflict, sandeval-stopped-review-amendment-conflict, hologres-replica-sync-lag-20261013]
---

# 整改回交选入旧答案，导致新轮质检无法代改

**Why:** “已有后续版本，本轮检查冻结版本”可能限制的是单题代改，而非整个检查任务。后续来源答案也可能在新送审建立之前就存在，不能仅以“质检期间标注员又改了”解释。原送审成员、不可变回交意图和来源最新 response 是三个分别持久化的事实；刷新检查页不会替换旧引用。

**How to apply:** 按精确 task/review/item 读取 object_ref 和稳定 work_unit，再核对所有来源响应的作者、普通 submit/inspector_amend 回执、逐卡改派日志、新送审时间和回交 intent.prepared.items。区分转派、停止轮次代改继承、以及回交自身选版滞后。用第二个生产实例对照普通读取、Leader 与正式整改来源查询；现时一致不能反证历史无延迟。需要历史部署、请求、SQL 与计算组证据才能将副本延迟判为根因。恢复保留旧送审与已保存判断，经完整批次范围及下游检查后走受控后继送审，不绕过最新版本写入保护。

- 2026-10-13 关小琪第 7 轮实例的浏览器提示、两次来源提交、原始回交意图、独立回读及未执行恢复的边界：[只读诊断报告](/Users/leslie/Documents/Playground/output/guan-qc-frozen-20261013/report.md)。动态业务 ID、时间线、部署 SHA 和原始事实留在证据目录。
- 提示与写入保护：sand-eval/platform/backend/app/services/facts/answer_amendment.py::verify_current；quality/application/inspection/answer_amendment_service.py::candidate；frontend/src/pages/quality/inspection/StructuredAnswer.tsx。
- 回交版本验证与不可变意图：quality/application/resolution/answer_correction_service.py::prepare、resubmission_intent.py；当前来源查询：app/repositories/task_assignments.py::quality_submission_owners。部署对应实现须现场核验。
- [转派后版本冲突](sandeval-reassigned-answer-frozen-review-conflict.md)和[停止轮次代改继承](sandeval-stopped-review-amendment-conflict.md)是其他原因，不能按相同页面提示直接套用。
