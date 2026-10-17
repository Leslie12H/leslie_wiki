---
name: sandeval-correction-evidence-and-deferred-lineage
type: pitfall
created: 2026-10-17
updated: 2026-10-17
tags: [sand-eval, quality, correction, defer, autocommit, recovery]
links: [sandeval-partial-submission-freeze, sandeval-correction-defer-reinspection, sandeval-historical-correction-stale-base]
---

# 整改封存缺凭证与待定后批次接续失败分开核验

**Why:** 同样发生在整改后的阻断可能来自不同层。本人工作台显示准备完成，不证明正式封存和执行已完整发布；历史快照有成员和正确摘要，也不证明独立冻结凭证存在。另一方面，明确冻结的待定排除会合法缩小下一轮有效成员；作者换接续若仍要求整条历史链成员完全相同，会把已完成复验的批次当作损坏，连带负责人数据包详情查询失败。

**How to apply:** 对缺凭证，核对原始不可变提交 intent、已发布父记录、全部成员、重算摘要、凭证稳定键、责任版本占用及下游消费；补历史证据只能复用精确原 intent，不能用当前来源生成的凭证冒充旧依据。后续重试的答案可能已更新，补凭证与接续最新答案分开处理，不能清版本占用或替换原意图。对待定接续，逐条验证直接前置身份、规则声明、冻结完整性与累计排除，成员只能减去该轮新增且属于前置的排除；历史待定后来恢复或转派，不重新推翻已发布事实。未声明删减、越界、重复成员、错误版本、无完成执行仍须拒绝。

- 2026-10-17 两条生产反馈的具体对象、检查时间、本人工作台、待定来源、第二副本恢复预览与精确证据：[现场报告](/Users/leslie/Documents/Playground/output/quality-two-cases-20261017/report.md)。其中个人供应商复验通过、个人整改关闭、负责人验收及整包/Sand 完成分别判断，不能混为一个“已通过”。当前状态从原生服务重新读取。
- [修复 PR #2571](https://github.com/world-sim-dev/sandai-data-smith/pull/2571)；[独立完整 Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39014301745)。合并、冲突、验证和发布状态以实时链接为准。测试分支冲突不能通过将测试历史合入开发分支解决。
- 源码指针：`quality/application/management/submission_service.py::save_prepared` 的发布顺序、`remediation_batch_scope.py::continued_remediation_batches` 的历史成员校验，以及 `resolution/resubmission_intent.py` 的不可变命令与责任版本占用。正式父记录应在成员和凭证持久化后发布；顺序修复不自动修复已有历史缺口。
- 验证边界：独立只读进程内替换函数可以验证真实生产数据下的查询结果，不能描述为线上已修复。浏览器打不开、Git Gate 通过、PR 可合并与生产恢复各自需要单独证据。
