---
name: monitoring-sls-pagination-budget
type: pitfall
created: 2026-11-27
updated: 2026-11-27
tags: [vidmuse, monitoring, maxwell, sls, pagination]
links: [monitoring-thread-scan-pagination-exhaustion, monitoring-report-vs-chat-output]
---

# 告警调查的 SLS 重读消耗 Runtime 预算

**Why:** 告警调查中的日志结果大小会随记录内容变化。同一个 SLS 窗口出现大结果时，通用 Skill 的首页重试会和 Admin 固定分页契约冲突。`offset`、`limit`、响应时间戳和整页证据 ID 都会改变，按完整调用和响应比较预算进展会误把重读当作新证据。工具的通配字段探测提示还可能与具体事故禁止宽查的规则冲突。

**How to apply:** 先在 Studio Trace 用 Thread 及 Run ID 找到真实用户输入、工具执行和失败终态。逐条关联 `agent.tool.call`、`agent.tool.result` 及其 `resultRef`，用稳定 `recordRefs` 对比不同页及重开前后的重复记录。SLS 按事故批准的查询范围取证。超大普通页只返回能传输的连续前缀，沿首条未返回记录的 offset 续读，保持逻辑查询和请求 limit。单条超限需要如实记录证据缺口。区分主循环模型调用、摘要调用、成功压缩与失败压缩。

- [2026-11-27 Maxwell 运行追踪](https://agent.sandaii.cn/threads?businessId=b020d1a5-f7c1-400b-8ade-f6132ebd5138&threadId=thr_01M8C138Y29YPPP1D9GDSQY3C1&tab=trace)。实际 Run `run-3729635b0053edb3a059ecb7b8f8226c`，使用该 Run 的事件详情核对调用次数和时间。Studio 汇总的压缩次数不含失败的压缩尝试时，应以事件分类和节点结果为准。
- 代码入口为 Admin 的 `monitoring-incident-root-cause/SKILL.md` 与 `_complete_sls_page_chain_groups`，监控 MCP 的 `SLSConnector.Query` 与证据响应限长，Maxwell 的 `adjustExecutionBudget` 与 Runtime checkpoint。可用性以实际部署及回归结果复核。
- [监控历史会话扫描上限](monitoring-thread-scan-pagination-exhaustion.md) 讨论的是 Admin 建会话前的 Thread 列表分页。本文讨论的是 Run 内的 SLS 原始日志分页。
