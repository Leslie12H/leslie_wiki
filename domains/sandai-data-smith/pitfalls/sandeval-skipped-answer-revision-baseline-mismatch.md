---
name: sandeval-skipped-answer-revision-baseline-mismatch
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, caption-refine, correction, skip, revision]
links: [sandeval-caption-refine-skip-defer-handoff]
---

# 已跳过答案恢复修订时的同步保护误判

**Why:** 工作流跳过的正式答案只保存问题理由，服务端执行回执仍可保留 caption 正文与结构元信息供后续修订。两者可以指向同一个 response，却有不同用途的字段。直接比较这些字段会将已跳过答案判为“尚未同步”，进入修订后持续禁用保存；同版本不能推出两份字段必须相同，等待或重复读取也不能消除这种语义差异。

**How to apply:** 由准确整改单找到本人接收人、work unit、派生答题卡与 assignment，分别读取正式 response.kind / 字段、执行回执的 skipped / fields / metadata、当前 execution.base_response_id。按实际部署的 declaredFieldsOnly 与 executionMatchesLatest 复算进入修订条件；过滤 skip_reason 后正式字段为空而执行回执仍有 caption 时，须核对跳过恢复语义，不能直接当作副本滞后。整批 ready_for_resubmission 与单题可修订分别验证，不通过代提交或删除跳过历史来掩盖问题。生产滚动发布期间须在新 Pod 重做同参数读取；原生只读服务加实际前端条件能定位拦截，仍不等同本人浏览器实际保存验收。

- 2026-10-15 黄超指定整改单、同 response 的 skip/执行回执、两题双次读取、排查中新旧生产部署及构建脚本对照：[只读核查报告](/Users/leslie/Documents/Playground/sandeval-huangchao-sync-20261015/report.md)。具体账号、版本、实时状态与后续修复均以报告和现场回读为准；本次未修复业务代码或生产数据。
- 源码指针：`sand-eval/platform/frontend/src/pages/myTasks/QuestionWorkPage.tsx` 的 executionMatchesLatest / needsRevisionSync / enterRevision / submitDisabled，`frontend/src/domain/answerPrefill.ts::declaredFieldsOnly`，`backend/app/services/facts/answer_execution.py::snapshot` 与 `backend/app/repositories/answer_execution_snapshot.py`。按部署 SHA 读取，不保存漂移中的实现正文。
- 相邻语义：[Caption Refine 跳过、待定与整批交接](sandeval-caption-refine-skip-defer-handoff.md)。


## 2026-10-15 单案恢复边界

**Why:** 正常保存服务可以从跳过时保留的可信 caption 追加新答案，但把该内容发布为普通正式答案会改变最新答案的业务含义，不能把它说成仅同步或仅恢复按钮。既有 TaskReworkService.request 按 task + account 作用于整批，并非单题恢复入口，可能把另一题也变成欠重做。

**How to apply:** 优先修正已跳过答案恢复修订时的基线选择，让本人确认、编辑和保存；若需应急追加普通版本，先获得对精确正文和 skip 到正常作答这一变化的明确确认，保留旧 skip、非目标题与质检历史，走原生守卫/幂等/发布并独立回读。只读通过 annotation_write_gate 与 workflow.validate_submission 只证明当下权限和结构可用，不证明人工认可、完整提交成功或复验通过。

- 本次真实本人权限、同一基线纯计算校验、无 pending claim、精确候选内容与两种处理范围：[单案恢复建议与预检](/Users/leslie/Documents/Playground/sandeval-huangchao-sync-20261015/recovery-plan.md)。没有执行生产写入，也没有实施建议代码；具体版本与实时状态重新核验。
