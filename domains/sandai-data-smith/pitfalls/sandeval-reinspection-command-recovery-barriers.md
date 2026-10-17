---
name: sandeval-reinspection-command-recovery-barriers
type: pitfall
created: 2026-10-17
updated: 2026-10-17
tags: [sand-eval, reinspection, idempotency, autocommit, recovery]
links: [sandeval-manual-return-version-claim-conflict, sandeval-manual-return-partial-write, sandeval-reinspection-history-priority-retry, sandeval-correction-evidence-and-deferred-lineage]
---

# 复验接收、发布与关闭须分别验证恢复屏障

**Why:** 复验链路跨退回意图、责任版本占用、答案封存、报告封存、授权执行与责任关闭。某个阶段已有恢复意图，不代表相邻阶段也能接续；普通 autocommit 下，一个 `async with uow()` 不代表整段可回滚。父报告已提交、责任已关闭等局部成功，可能反过来触发下一次重试的不可编辑或旧版本保护。2026-10-17 整体审查在真实应用服务和逐语句提交夹具中复现了多个不同故障窗口，具体结论与最新合并状态留在现场报告。

**How to apply:** 对每个用户动作分别固定接收身份、不可变命令、可被下游消费的发布屏障和收尾屏障。逐个注入已提交前缀中断，再从真实公开入口用原请求、重开页面请求及后台恢复验证；已属于同一意图的完成步骤应保留，其他身份、范围、版本和答案变化继续拒绝。补丁合入、实际部署和历史卡单恢复分开读取；复验抽样已有组时复用冻结计划，不重新用可变历史推导它。不能靠删除占用、放宽指纹或回滚代码替代历史数据恢复。

- [2026-10-17 复验全链路审查报告](/Users/leslie/Documents/Playground/output/quality-workflow-review-20261017/report.md)：生产基线、最新 main 补审、各问题的触发/影响/修复要求、故障注入脚本与证据、范围豁免和报告通过语义的独立口径风险。时间性判断和未修/已合入边界从报告及后续现场核验读取。
- [整改提交两笔只读取证](/Users/leslie/Documents/Playground/output/quality-submit-20261017/report.md)：两副本、原版本占用、未发布执行、多个后续意图及答案版本变化。没有截图原页面链接时，不把日志候选直接认定为截图对象；没有首次异常证据时，不把回滚或某个并发认定为已证实原因。
- [PR #2584](https://github.com/world-sim-dev/sandai-data-smith/pull/2584) 是整改提交换请求号接续与窄恢复入口；是否发布、已有卡单是否恢复须另读回。它不能代替报告提交、责任关闭、退回占用无意图间隙与人工安排复验重试的各自验证。
- 代码入口：`quality/application/resolution/{resubmission_intent,resolution_service,manual_return_service}.py`；`quality/application/inspection/{review_service,review_plan_service,inspection_scope_service}.py`；`quality/application/management/reinspection_service.py`；`quality/infrastructure/persistence/unit_of_work.py`。先固定部署/提交再读，不把本页当成当前实现快照。
