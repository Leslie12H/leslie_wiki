---
name: sandeval-reassignment-refactor-review-20261012
type: reference
created: 2026-10-12
updated: 2026-10-12
tags: [sandeval, reassignment, quality, lifecycle, refactor]
links: [sandeval-transferred-correction-task-visibility, sandeval-reassigned-answer-frozen-review-conflict, sandeval-cross-workbench-question-order, sandeval-sand-reinspection-summary-revision-amendment-conflict, sandeval-orphan-card-reclamation, sand-eval-quality-center-test-data]
---

# Sand Eval 改派、换人与多轮复验的重构审查入口

**Why:** 换人改变当前责任、改派改变人员批次、复验改变汇总版本，但稳定答题卡、答案历史和已有报告仍是同一业务链。若门禁和定位只使用当前账号、批次、顶层送审 ID 或页面序号，会暴露重复送审、错误权限、修订丢失、旧意见编号冲突或祖先责任未闭环。2026-10-12 的复盘还发现处理中队列换序与相邻保存推进的衔接缺口。并非所有现象都由改派直接触发，多轮退回与独立提交中断也会产生相同断点。

**How to apply:** 先分别核对稳定工作项、原作者、当前持卡人、当前处理责任、实际操作人、冻结来源版本、原题位置及正式报告/退回链。复盘与重构建议全文见 [2026-10-12 审查文档](/Users/leslie/Documents/Playground/sandeval-reassignment-refactor-review-20261012.md)。该文档固定当日 main 源码作只读核验；重构部分是建议，尚未批准或实施。动态 PR、部署和真实操作状态须从对应交付入口重新读取。

## 问题分类与证据路由

- 进行中整改/质检安全转交、保留历史判断人与拒绝旧处理人： [PR #2383](https://github.com/world-sim-dev/sandai-data-smith/pull/2383)；当前入口 `quality/application/management/work_handoff_service.py`，范围与资格说明见 `sand-eval/docs/subsystems/quality-center.md` 的离职作业转交。
- 转派后冻结保护及跨批次重复送审：见 [工作项冻结冲突](../pitfalls/sandeval-reassigned-answer-frozen-review-conflict.md) 与 [PR #2379](https://github.com/world-sim-dev/sandai-data-smith/pull/2379)。绿色开发分支 Gate 不代表 TEST 或生产交付。
- 无空间账号未答卡、身份 guard 和题池回收：见 [卡回收](../pitfalls/sandeval-orphan-card-reclamation.md) 与 [PR #2381](https://github.com/world-sim-dev/sandai-data-smith/pull/2381)。代码上线和限定生产回收是两种独立证据。
- 跨轮次题号、历史文字编号、抽样进度与保存后继续：见 [跨工作台顺序](../pitfalls/sandeval-cross-workbench-question-order.md) 与 [PR #2386](https://github.com/world-sim-dev/sandai-data-smith/pull/2386)。最大原题号不等于样本量；新批次从头顺做与旧处理中批次重排有不同触发路径。
- 新 Sand 汇总丢失早期合法修订：见 [连续修订链](../pitfalls/sandeval-sand-reinspection-summary-revision-amendment-conflict.md) 与 #2386；不能无条件取来源最新，也不能改写历史冻结引用。
- 验收后祖先退回未闭合、独立提交后恢复：见 [质量中心入口](../../sand-eval/pitfalls/quality-center-test-data.md)、[PR #2364](https://github.com/world-sim-dev/sandai-data-smith/pull/2364) 与 [PR #2391](https://github.com/world-sim-dev/sandai-data-smith/pull/2391)。正式报告、子责任结束、祖先关闭、包生成和真正交接分别证明。
- 换轮复验图文及合格题备注上下文： [PR #2376](https://github.com/world-sim-dev/sandai-data-smith/pull/2376)、[PR #2392](https://github.com/world-sim-dev/sandai-data-smith/pull/2392)。历史只读意见与本轮结论、整改问题范围分别保留，图片按原题授权。

## 重构建议的固定边界

1. 任务内答题卡/工作项身份与当前持有人分离，版本追加且每版记作者；素材可以多份标注，素材 ID 不等于唯一作业身份。业务规则以 `sand-eval/knowledge/DECISIONS.md` 的 2026-09-04 卡身份裁决为准。
2. 同轮换人保留冻结样本、顺序、答案来源和既有判断；新复验可按规则重新抽样。原题编号、旧轮编号、本轮检查进度各自有明确语义。
3. 版本继承、读取、代改资格和有效送审成员使用相同正式谱系解释；责任转交、普通改派、重新送审与复验分别是有版本校验的命令。
4. 当前持卡人、当前整改接收人、当前质检员、历史作者、实际判断人与流转管理员分别记录，列表与真实命令共用当前资格判据。旧页面及延迟请求受服务端责任版本保护。
5. 退回对象显式承载范围、来源版本、正式验收和父子责任。可原子提交的窄命令使用事务；独立提交用持久意图、步骤回执和幂等恢复，不用“某一步已通过”推定全流程完成。
6. 保存并继续寻下一道本轮未判断题，跨页并回找遗漏；上轮合格不跳过本轮待检。冻结时可保存顺序/谱系索引，分页不反复重建整任务；实时权限和写前版本不能因缓存省略。

先明确多持有人历史批次的责任拆分、各阶段允许转交的操作、未提交草稿交接及多负责人整包承接规则，再落实现有服务。新旧投影只读对账、限定范围迁移、缺失历史保留未知；不要猜题号、作者或父责任。是否事件溯源或拆服务另行评估。

验收至少覆盖改派后正式整改与跨批次重复送审、质检中途换人、旧标签页及并发保存、同名不同账号/同素材多份答案、连续三轮修改不同题、每步中断后原请求重试、失效成员资格与未答卡回收、旧处理中批次升级、跨页保存及大批次真实 Hologres 成本。新任务正常、绿色 Gate 或 mock 通过不能替代这些证据。
