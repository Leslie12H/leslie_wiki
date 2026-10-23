---
name: sandeval-manual-return-passed-status-handoff-gap
type: pitfall
created: 2026-10-16
updated: 2026-10-23
tags: [sand-eval, manual-return, reinspection, handoff, state]
links: [sandeval-work-handoff-unsettled-occupancy]
---

# 人工退回后保留通过状态，导致重检与转交入口断开

**Why:** 2026-10-16 的原单只读核验确认，负责人退回记录已存在，但管理页仍绑定第一轮已通过的检查；人工退回摘要的“待原质检员重检”是默认投影，不能当作独立新轮次已准备好的证据。前端转交按钮按当前行状态显示，后端只转交未结束的当前人工检查，两者不能通过放开历史报告转交来补洞。

**How to apply:** 分别核对封存报告、未结人工退回责任、后继重检任务及其准备回执。以实际部署 SHA 阅读 `leader_query_service._batch_remediation` 的 manual_return 分流、`leader_resolution_service.for_scopes` 的摘要默认值、`BatchReviewTable` 的按钮条件以及 `WorkHandoffService._load` 的当前轮次保护。准备失败必须呈现真实阻断和同事项恢复入口；可执行的新轮次只能按其真实身份转交，不能改写历史已提交报告。当前查看者的资格错误不能直接归给原质检员；要用实际部署的原生资格查询独立核实接收人。若原接收人已失去资格，转交未启动的重检责任应保留封存报告作者和被评价主体，只改变当前责任，并在新计划中分别绑定原报告与接手成员。准备失败需要保存转交回执并按原请求恢复，不能换人重新创建轮次。

## 核验入口与边界

- [2026-10-16 原单只读报告](/Users/leslie/Documents/Playground/output/quality-return-handoff-20261016/report.txt)：保存用户给定任务/分配、Chrome现有会话页面与API字段、9个退回流水、限定SLS查询和部署源码指针。会变化的具体状态从报告及后续实时读取确认。
- 同目录 `deployed-source.json` 固定部署源码身份；`sls-returns.json` 与 `return-requests.json` 区分9次成功响应和同一轮次后续两次冲突。退回接口200可以携带重检未就绪的blocking_reasons，不等于复验就绪。
- 2026-10-16 后续原生只读预检补齐深层原因证据：同目录 `recovery/qualification.json`、`preflight-details.json` 和 `recovery-contracts.json` 分别固定接收人当时角色、九批准备校验及实际部署契约。具体资格与状态会变化，重试前重新读取；初版报告中的“原因未核实”仅对应较早取证阶段。
- [待重检责任转交修复 PR #2522](https://github.com/world-sim-dev/sandai-data-smith/pull/2522) 保存实现、测试、Gate、合并与发布状态入口。原单未做成员角色变更，也未代选接手成员；发布、按钮可操作及真正转交是独立验收层。
- [另一个转交故障机制](sandeval-work-handoff-unsettled-occupancy.md) 是任务级待核对占用。不能因为都表现为“转不了”就直接清占用或复用另一单的恢复授权。

## 2026-10-23 恢复与代码复查入口

**Why:** 退回与后继创建有独立边界，写入退回前应核验目标质检员资格；历史报告通过不能覆盖未结退回，列表和包详情的摘要缓存也必须失效重算。

**How to apply:** 原人员合格时保留原责任，资格变更才按明确授权换人。超时后先独立确认事务结果和执行器是否结束，再复用冻结请求继续；验收必须同时核对唯一后继、实际和计划接收人、本人待办与原报告不变，已停止的后继不算恢复成功。

- 权限复查应区分沿原人员重检与更换人员：原负责人退回只需保留既有验收权限并核验原质检资格，不能额外要求派检权限；更换质检员才要求派检权限。用真实 ReviewerService 覆盖只有 review 而没有 assign_reviews 的负责人。
- [本次恢复与复查报告](/Users/leslie/Documents/Playground/output/kemeng25-blocker-20261023/recovery-result.md) 指向两实例回读、原生冻结计划和持久审计；生产状态会变化，继续操作前重新读取。
- [根因与展示修复 PR #2781](https://github.com/world-sim-dev/sandai-data-smith/pull/2781) 是当前代码、使用文档及 Gate 状态入口；PR、合并、部署和业务重检完成仍需分别核验。
