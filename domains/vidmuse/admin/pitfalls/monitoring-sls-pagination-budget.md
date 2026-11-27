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

## 2026-11-27 取证范围与卡片边界

**Why:** 通配小样只能探测字段形态，不能证实字段已索引或把下游记录归到同一事故。对接方不一定传播调用方 trace。证明清单的指针和哈希供机器核验，放进消息卡会掩埋直接故障和待确认项。外部 SLS 根消息归源机器人所有，人工认领需要自己的可更新卡片。

**How to apply:** 首先用事故已审核的 ERROR 条件、错误签名或实际可关联的请求 ID。只有已关联请求确实需要时才读其他日志级别，无法关联就保留证据缺口。验证证据契约时在 Admin 读取持久报告，飞书卡只检查结论、直接故障、缺口和人工操作。分别回读仓库 Skill，以及 V4 Preset 实际引用的线上 Skill。同步时保留线上现有的报告协议。

- 实现入口：[Maxwell #487](https://github.com/world-sim-dev/maxwell-ai/pull/487)、[监控 MCP #74](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/74)、[Admin #1036](https://github.com/world-sim-dev/vidmuse-admin/pull/1036)。合并、镜像和同窗复验从实际回执核对。

## 2026-11-27 发布探针与重跑状态

**Why:** 业务取证拒绝通配后，发布探针如果仍用 `*` 就会被同一入口拦截。不同 Logstore 的错误字段索引不一定一致。重分析工作流启动的轮询进程也可能先于已经提交的 Runtime Run 退出。

**How to apply:** 发布探针复用各 Logstore 已审核的精确谓词，从探针回执和最新生产就绪度分别判断证据源与部署状态。重分析编排中断后，先用已持久化的事故 Generation、Thread 和 Run 判断现有任务是否还在执行。Run 继续推进时，跟踪同一次执行及 Admin 的结论回写，避免重复排队。

- [SLS 探针按 Logstore 复用审核查询](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/pull/76)。
- [重分析编排回执](https://github.com/world-sim-dev/vidmuse-admin/actions/runs/45963216208)与[同一事故只读检查](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/actions/runs/45964150028)。
