---
name: sandeval-four-api-repeated-read-evidence
type: reference
created: 2026-10-07
updated: 2026-10-07
tags: [sand-eval, performance, hologres, evidence]
links: [sandeval-runtime-profile-evidence]
---

# Sand Eval 整改、代改、标注列表与提交的重复读取取证入口

**Why:** 单次请求总耗时不能说明数据库锁、连接池或外部负载是根因；窄查询条件也不保证能按表的分片与聚簇布局裁剪。工作区和部署代码不同会使优化候选失真。

**How to apply:** 先按 request_id 精确对齐网关和应用，用不可变部署提交追调用链；完整分页读取 ARMS，再以 SQL 模板、实际 warehouse、开始时间和耗时查 Hologres。没有 QueryID贯通时保留候选匹配边界。并发 SQL 的累计时间不能当关键路径占比；EXPLAIN 与实际扫描量分别记录。

- 2026-10-07 四接口证据、部署身份、逐请求规模、SQL次数、耗时与计划保存在[完整报告](/Users/leslie/Documents/Playground/sandeval-four-api-evidence-20261007/report.md)，使用时重新查询同口径窗口。该调查只读，尚未实施优化或验收性能收益。
- 整改责任历史与列表摘要的源码入口：`quality/infrastructure/persistence/resolution_execution_repository.py::for_disposition/for_dispositions`；核对JSON责任关系查询是否重复、是否能按同QT批量准备，以及读取是否与分片/聚簇键一致。写前/写后的版本和授权仍需实时检查。
- 改答的源码入口：`app/services/facts/qc_verdict.py::read_response_versions`、`app/repositories/answer_execution.py::for_responses/for_response`。核对批量reader是否填入一次代改准备scope，以及单条reader是否重复读同一原始result/context。复用原始回执时不能把已变成inspector角色的执行上下文缓存为来源事实。
- 提交快照入口：`app/services/facts/local_answer_commit.py::submit`、`app/repositories/answer_execution_snapshot.py`；按baseline、最终写前、返回的具体语义评估复用，保留最新状态、转派/撤销和CAS。start_query_cost高不直接证明CPU打满或锁排队。
- 先复核[运行取证规则](sandeval-runtime-profile-evidence.md)，不要将2026-09-30外部Flow争用结论套用于新窗口。易变数字、SHA和QueryID仅存证据报告，wiki存方法与指针。

## 无数据库变更的方案审查入口

- [完整修复方案与业务影响评审](/Users/leslie/Documents/Playground/sandeval-four-api-evidence-20261007/repair-plan-no-schema-change.md)保存逐项采用门槛、owner、回归矩阵和发布边界；阶段与收益以该报告和后续验证为准。
- **Why:** 重复SQL可能处于不同权威时点；处置版本不代表执行进度版本，回执存在也不代表正式答案已发布。共享scope守卫的影响面必须按全部调用者审查。
- **How to apply:** 原始回执仅在一次prepare内隔离复用；完整历史可按QT批量用于本人列表，但写前和恢复阶段继续现读。精准授权先选每批最新处置，再筛成员；三次snapshot按准备、写前、写后职责评估。应用回退不撤销已经产生的业务写入。禁止数据库变更时只采用现有键过滤和应用读取组织，不隐含新增索引或lookup表。
