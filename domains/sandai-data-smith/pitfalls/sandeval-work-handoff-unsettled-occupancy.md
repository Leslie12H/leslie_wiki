---
name: sandeval-work-handoff-unsettled-occupancy
type: pitfall
created: 2026-10-16
updated: 2026-10-21
tags: [sand-eval, handoff, assignment, hologres, locks, recovery]
links: [sandeval-sql-lock-diagnosis, sandeval-reassignment-scope-and-batch-responsibility]
---

# 质检转交失败后的任务占用与通用冲突提示

**Why:** 转交质检会同时更新当前质检员、分配事实与成功回执，必须保持一致。2026-10-16 的只读排查发现，一次转交写成功回执时遭遇数据库锁超时；来源任务的分配操作进入待核对状态，随后其他批次的转交也被同一任务占用拦住。界面把忙碌和待核对都提示为“任务正在分配或归属已变化，请刷新后重试”，无法从文字判断是否真的有人改变了归属。

**How to apply:** 以准确部署 SHA 阅读报错翻译与占用作用域，关联原 task_id、operation_id、请求号、HTTP request_id 和数据库 query_id。分别核对当前 assignee、版本、handoff_history、成功回执、Redis active 指针及执行租约。候选读取成功不代表转交可执行，499 不代表后端已经结束，租约不存在也不单独证明在途 SQL 停止。恢复须通过正式原事务结案流程，在证明完整提交或回滚及旧执行器/SQL 停止后登记结果；不直接删除占用键。

## 证据与代码指针

- [2026-10-16 只读排查报告](/Users/leslie/Documents/Playground/output/quality-handoff-20261016/report.md)：精确对象、当时状态、请求时间线、原转交失败 SQL、部署证据及未执行恢复的边界。会变化的状态以该报告和后续实时读取为准。
- 以报告记录的部署 SHA 读取 `app/services/facts/work_handoff.py`、`app/repositories/task_assignments.py`、`app/infra/assignment_operations.py`：确认 busy / needs_review 的错误翻译、按来源任务的占用及冻结后异常退出行为。
- `quality/application/management/work_handoff_service.py`、`quality/infrastructure/client/work_handoff_client.py`、`quality/infrastructure/persistence/unit_of_work.py`：确认显式事务、成功回执及候选读取边界。
- `sand-eval/docs/operations/assignment-recovery.md` 的“原事务操作结案”：核对生产对应版本的正式操作条件。只读排查不自动授权结案或重新转交。
- [SQL 与锁诊断入口](../refs/sandeval-sql-lock-diagnosis.md)：数据库异常原文与 owner / waiter 证据要求。相近时间的其他接口异常栈不能直接归给原请求；本案未完整还原锁竞争链，未认定死锁或最初持锁业务。

## 关键经验

将“客户端连接断开”“后端请求结束”“数据库事务结果已核实”“操作占用已结案”分别取证。同一请求的 Nginx 与应用结束时间可能相差数分钟；先定位失败 SQL，再解释持续冲突，不能把刷新建议当作恢复方案。

## 2026-10-16 经授权的原事务结案

用户在诊断后明确授权手动恢复线上数据。正式 operator CLI 按原计划哈希将该操作按 rolled_back 结案；写入前冻结、跨 Pod 复核、原会话/请求结束证据、执行回执与写入后独立核验见 [恢复报告](/Users/leslie/Documents/Playground/output/quality-handoff-20261016/recovery/recovery-report.md)。结案 succeeded 仅表示人工核对完成，实际事务结果仍以 result.resolution 区分；不代表原转交成功。此次没有重放转交或修改当前质检人，具体时点状态只从报告和后续线上读取判断。


## 2026-10-16 石东亮整改转交的独立实例

[两案核查记录](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/report.txt) 保存该批次的完整冻结七卡、当前整改责任、同一任务的 needs_review 占用、原 499 与应用延后结束、对应数据库锁等待证据及跨 Pod 读回。此为与前述质检员交接不同的任务，不沿用前案已结案的状态或写入授权。用户随后明确要求手动处理，按本单独立冻结计划通过原生 CLI 将原事务按 rolled_back 结案，解除占用；跨 Pod 读回确认业务快照和原审计保留，未重放转交或替用户选择接手人。详见[恢复报告](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/recovery/report.txt)。处理人和操作状态仍须现场核验。

长期修复指针：[PR #2510](https://github.com/world-sim-dev/sandai-data-smith/pull/2510)。事务内业务失败与 COMMIT 已开始后的确认丢失必须分开；只有回滚及连接模式重置均确认成功时才可自动解除占用，结果未知仍需核对。精确提交、Gate、部署和原单验收以本单报告为准。


2026-10-16 部署后验收入口：[原单只读验收报告](/Users/leslie/Documents/Playground/output/correction-two-errors-20261016/postdeploy-report.txt)。报告独立保存 PR Gate、生产合并 SHA、全部副本、实际下发前端资源及多 Pod 原生查询；同时区分占用解除、列表状态、真实整包与正式提交，不能把源码或候选计算通过等同于业务交接完成。后续状态须实时读取。


## 2026-10-21 整批退回修复遇到质检转交占用

**Why:** 持有人分裂的一张卡接回方案可以预览通过，实际改派仍可能被同来源任务的质检转交占用拦住。事务占用的冻结记录可能只有任务号，缺少原转交的具体业务计划；不能把它自动归因于最近一条普通改派审计，也不能只凭 HTTP 409 或租约不存在结案。

**How to apply:** 先按生产 SHA 追溯所有创建该类事务占用的入口；本次从操作者身份形式和宿主适配定位到 work-handoffs，再用质量任务号、原 Pod 和精确时间窗获取 HTTP request_id。应用失败日志的 SQL 原文 SHA256 可与 Hologres 查询历史精确匹配，再取真实 session_id、trans_id、绑定参数及事务内完整语句。应用 backend_pid 与数据库历史 pid 可能不相同，不能只按前者查不到便认定没有数据库证据。若原事务在业务写入前的读取阶段失败，仍须结合原会话结束、原责任人/分配/历史未变和成功回执缺失来核验结果。按原生事务结案协议保存 rolled_back 回执后，重新验证原卡片计划，独立检查目标与非目标卡、答案历史、冻结送审和质检意见，并以真实质检员权限只读核验唯一整改接收人。

本次完整查证、原事务结案、唯一卡片接回及跨 Pod 独立回读见[处理报告](/Users/leslie/Documents/Playground/output/qc-holder-20261021/report.md)。该报告区分旧转交回滚结案、持有人统一与正式整批退回三个结果；现场状态和执行脚本仅供对应个案审计，复用前必须重新取证。


## 2026-10-21 只读转交失败与过早冻结的工程边界

**Why:** 事务包装器若对所有 execute 都冻结业务意图，初始化 SET 就会制造“可能已写入”的记录。随后只读校验超时且清理回执不完整，也会被保留为需要人工核对。同时，active 质检并不使用待重检的后继组，但统一加载仍在事务内查询它，扩大读取和锁暴露。

**How to apply:** 只让完整匹配的单条事务控制命令绕过业务意图冻结和变更通知；真正业务 DML 尝试前仍必须冻结。测试要分别覆盖未尝试写入的读取失败、实际写入后回滚确认、提交/回滚确认丢失及复合 SQL 不能绕过保护；不能把安全释放只读失败扩展成未知写结果自动清锁。按状态缩小读取时保留 current-group、版本、保存完成和待重检后继准备的守卫。没有历史 owner/waiter 图时，不将 statement timeout 或 mixed-DML 锁语义当成已证明具体阻塞事务或死锁。

修复与验证入口：[测试 PR #2718](https://github.com/world-sim-dev/sandai-data-smith/pull/2718)、[根因与验证报告](/Users/leslie/Documents/Playground/output/qc-holder-20261021/handoff-timeout-root-cause.md)。报告保留精确 SQL 指纹/绑定参数、同一真实批次的新旧只读对照、CI 和测试分支冲突；代码、合并、环境发布及真实转交分别核验。


## 2026-10-23 正式待定排除后的整改转交范围冲突

**Why:** 同一批次多轮整改仍未闭环时，转交服务可能同时读取早期完整成员与后续排除正式待定题后的成员。即使当前责任人唯一、旧执行均完成且没有任务级操作占用，逐轮完整成员相等校验仍会返回 HANDOFF_SCOPE_CONFLICT，不能沿用本页前述“占用待结案”的恢复方案。

**How to apply:** 对齐 scope 下所有 active dispositions、每条原 submission 的完整 work_unit 集、正式 policy_snapshot.annotation_deferred_work_unit_ids 与 execution 状态，再在强制只读数据库连接和 observation_readonly 下调用原生转交 options。区分成员缺失、合法待定排除、责任人分歧和真实执行中；按冻结的生产 SHA 查 WorkHandoffService._load 的成员比较。修复需保留旧冻结提交和责任链，识别被正式证明的范围缩减；不直接删历史、不改旧快照、不无条件放宽集合保护。

- [2026-10-23 双生产副本只读诊断](/Users/leslie/Documents/Playground/output/li-renxuan-handoff-20261023/report.md)：保存同一批次 5→4 的正式待定差异、原生 options 精确拦截、部署源码及未执行生产写入的边界。当前状态须重新读取。
- [冻结转交源码](https://github.com/world-sim-dev/sandai-data-smith/blob/dbc99d80ad6b28c0fcc61ac08e982a3348b2bc38/sand-eval/platform/backend/quality/application/management/work_handoff_service.py#L49)：多条未结整改逐份读取成员，在第 71–72 行比较完整集合；同一 scope 与同一责任人不代表每轮冻结集合相同。
