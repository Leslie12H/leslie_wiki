---
name: evolve-v3-work-executor-mapping
type: pitfall
created: 2026-09-19
updated: 2026-09-19
tags: [maxwell, evolve, studio, 前端, 分页]
links: [maxwell, evolve-workbench-v22, evolve-usage-accounting]
---

# EVOLVE v3 前端：任务→执行器不是 targetRef，会话列表 N+1

2026-09-19 验收 EVOLVE Studio v3（谱系与账本 IA，origin/main f344191f）时发现两处让页面"看起来没数据"的坑，修复在分支 `codex/evolve-v3-usable`（工作树 `/private/tmp/maxwell-evolve-ui-20260919`，未 push），说明见 `docs/evolve-studio-v3-progress.md`「可用性整改（2026-09-19）」。

**坑 1：`Work.targetRef` ≠ 执行器 id。** `targetRef` 是任务声明要测的东西（被测对象，自由引用如 `xxx-baseline`）；真正跑它的执行器记录在 TargetProfile 产物的 `executorRef`（Studio 直评建的任务则在 `strategy.executorRef`）。服务端 `commands/run.go resolveExecutorRef` 就是这样解析的。v3 概览/谱系用 `work.targetRef === executor.id` 关联，结果执行器卡片永远"0 个任务"、谱系永远"没有任务"。

**坑 2：会话列表慢在前端。** 后端 `ListAgentSessions` 是单条 SQL（有游标、`q`、`state`、`executorRef`）；慢的是前端每页 50 条会话逐条再拉一次会话事件取"首条用户消息"当标题，并额外拉 works，全部完成才渲染。另外后端 `executorRef` 参数实际按 `w.target_ref` 匹配，前端传执行器 id 永远匹配不到。

**Why:** v3 方案把"对象"定义为执行器，但任务实体上没有执行器字段；设计时默认二者同名。会话标题规则（首条用户消息）是产品要求，实施时直接在列表页逐条读事件。

**How to apply:**
- 前端任何"按执行器分组任务"的地方，用 `products/evolve/v3/objects/workExecutors.ts`（strategy → TargetProfile，按 artifact id 缓存，有界并发），不要比 `targetRef`。
- 给后端提需求时优先要 `GET /works` 直接投影 `executorRef`（sessions 已有 `workTargetRef` 先例），以及 works 列表筛选参数、会话首条消息落库更新 `title`。
- 会话列表：一次请求渲染；只对泛化标题（服务端默认「和 Agent 的会话」或 `… · 会话`）后台补读，规则在 `sessionsModel.isGenericSessionTitle`。
- 会话"对象"筛选传的是 `targetRef` 值，不是执行器 id，除非后端改语义。
- v3 视觉要跟 Studio 其他模块一致：Inter、2px 强边框、像素阴影、tokens；不要另起字体/氛围层（这次已回收 Instrument Serif 与光晕点阵）。
