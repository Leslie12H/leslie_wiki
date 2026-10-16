---
name: sandeval-manual-return-passed-status-handoff-gap
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sand-eval, manual-return, reinspection, handoff, state]
links: [sandeval-work-handoff-unsettled-occupancy]
---

# 人工退回后保留通过状态，导致重检与转交入口断开

**Why:** 2026-10-16 的原单只读核验确认，负责人退回记录已存在，但管理页仍绑定第一轮已通过的检查；人工退回摘要的“待原质检员重检”是默认投影，不能当作独立新轮次已准备好的证据。前端转交按钮按当前行状态显示，后端只转交未结束的当前人工检查，两者不能通过放开历史报告转交来补洞。

**How to apply:** 分别核对封存报告、未结人工退回责任、后继重检任务及其准备回执。以实际部署 SHA 阅读 `leader_query_service._batch_remediation` 的 manual_return 分流、`leader_resolution_service.for_scopes` 的摘要默认值、`BatchReviewTable` 的按钮条件以及 `WorkHandoffService._load` 的当前轮次保护。准备失败必须呈现真实阻断和同事项恢复入口；可执行的新轮次只能按其真实身份转交，不能改写历史已提交报告。当前查看者的资格错误不能直接归给原质检员。

## 核验入口与边界

- [2026-10-16 原单只读报告](/Users/leslie/Documents/Playground/output/quality-return-handoff-20261016/report.txt)：保存用户给定任务/分配、Chrome现有会话页面与API字段、9个退回流水、限定SLS查询和部署源码指针。会变化的具体状态从报告及后续实时读取确认。
- 同目录 `deployed-source.json` 固定部署源码身份；`sls-returns.json` 与 `return-requests.json` 区分9次成功响应和同一轮次后续两次冲突。退回接口200可以携带重检未就绪的blocking_reasons，不等于复验就绪。
- 本次仅证实状态和操作入口之间的断点；没有拿到原退回响应中的准备错误，未断言原质检员资格失效、版本漂移或计划损坏，也未恢复或修改生产数据。
- [另一个转交故障机制](sandeval-work-handoff-unsettled-occupancy.md) 是任务级待核对占用。不能因为都表现为“转不了”就直接清占用或复用另一单的恢复授权。
