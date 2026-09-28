---
name: evolve-error-policy-fail-breach
type: pitfall
created: 2026-09-15
updated: 2026-09-15
tags: [maxwell, evolve, 协议与质量边界, 聚合, 兼容]
links: [maxwell, evolve-usage-accounting, evolve-received-evidence-before-run-freeze]
---

# EVOLVE aggregationPolicy.errorPolicy="fail" 把执行错误变成质量结论

2026-09-15 在 `evolve/generic-platform-v21`(HEAD 7204e300)确认：结果契约层辛苦建立的"业务缺陷才进质量分、协议/执行错误永不进",在聚合层被一个调用方就能打开的开关绕过。

事实链(代码位置去仓库看,不抄):

- 聚合的 outcome 判定有一条 `ErrorCount > 0 && ErrorPolicy == "fail" → OutcomeFail` 的分支,两处实现(批量 `Aggregate` 与流式 `BoundedAggregateAccumulator`)各一份,必须同时改同时保。
- `errorPolicy` 是**外部可设**的:MCP `evolve_run` `start` 的 `aggregationPolicy` 一路流进 `StartRunInput`,HTTP 的 confirmed run 走同一条 `prepareRun`。
- 默认值是 `"error"`(Run 不传 aggregationPolicy 时平台自己填),所以默认行为一直是对的;破口只在调用方显式传 `"fail"` 时打开。
- 后果:派发失败、证据无效、远端超时、判卷不可用这 12 类 AttemptError,会被当成"候选答得差"计入质量 FAIL。

修法(2026-09-15 已实现,未提交):**不删枚举值,只在 Run 准入处拒绝新 Run**。
`AggregationPolicy.AdmitForNewRun()` = 原 `Validate()` + 拒绝 `"fail"`;`prepareRun` 把它 join 进 `ports.RunTrialPlan.NewRunAdmissionError`——这是仓库既有的"只拦新 Run、不拦历史同 hash 回放"的机制(和超大 Variant、Judge 不可用共用一条)。聚合里的 `"fail"` 分支原样保留并加注释。MCP schema / openapi 只加 description 文字,枚举值一个不删。

**Why:** 枚举值在 origin/main 已存在,删除是破坏性变更,而且已冻结的历史 Run 每次重算 Scorecard 都要再走一次那条分支——删了就等于悄悄改写历史 Run 的结论。同时"新 Run 不许再用"必须是**协议拒绝**(Run 根本不存在,不产生 trial/分数/结论),而不是让它跑完再给一个坏结论。

**How to apply:** 再碰到"某个取值会让平台替业务下质量结论"的开关,按这三步:(1) 值留着,读路径留着,加注释说明它只服务已冻结的历史;(2) 拒绝点放在准入(prepareRun/StartRun 这类),错误文案要说清"为什么不是质量结论"+"可用取值是哪些";(3) 用仓库既有的 new-run-only 拦截通道,别在早期直接 return——否则历史 Run 的幂等回放会一起被拒。验收必须有两个测试:新 Run 被拒且不花预算/不动 Work 版本,历史 Run 回放拿到同一个 Run 且聚合结果逐字节不变(JSON + 两条聚合路径都钉死)。
