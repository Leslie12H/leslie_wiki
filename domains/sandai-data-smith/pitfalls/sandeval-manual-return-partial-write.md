---
name: sandeval-manual-return-partial-write
type: pitfall
created: 2026-10-15
updated: 2026-10-27
tags: [sand-eval, quality, rework, manual-return, autocommit]
links: [sandeval-inspector-rework-round-list-and-editability, sandeval-direct-return-interrupted-by-leader]
---

# Sand Eval 退回标注员失败后只留下停止检查

**Why:** 退回动作跨检查状态、上级整改执行、退回处置和命令回执。逐语句 autocommit 下，先停止检查、再更新整改进度的流程遇到后续条件更新失败，会留下已停止但标注员未收到退回的状态。列表展示“待质检员整改”不能证明仍有可执行任务。2026-10-15 J王珍/J刘子嘉个案通过两次生产 Leader 回读和同一数据库 session 的 SQL 实参确认了这种部分落库；该单最初走供应商负责人路线，不应套用旧的直接整改重复退回结论。

**How to apply:** 固定质量任务、当前轮次、Sand route 和负责人子处置；核对逐题保存事实、实际账号资格、detail.available_actions 与 assert_returnable。对失败退回，用请求时间/Pod/request_id 关联 hg_query_log，并核对 query_detail 中精确 review/执行 ID、session_id 和 affected_rows，区分停止成功、进度更新失败、处置缺失。UPDATE 0 的条件同时包含版本、固定 context 和 pending 状态；没有事发 before-image 时，不要把某个后台并发或副本滞后认定为已证实原因。恢复必须覆盖中断步骤、父责任、幂等回执及标注员实际待办，不能只放开按钮或把 stopped 改为可编辑。

- 2026-10-15 只读取证、精确对象、SQL 实参、失败请求、当前部署和证据边界：[报告](/Users/leslie/Documents/Playground/output/wangzhen-rework-20261015/report.md)。诊断没有修复生产；后续状态须重新核验。
- 源码指针：quality/application/resolution/manual_return_service.py::_return；resolution_service.py::capture_manual_annotation_return；quality/infrastructure/persistence/resolution_execution_repository.py::update；quality/application/inspection/review_query_service.py::detail 与 inspector_display_status。先核对实际部署，不能将当前 main 当成事发版本。

- 2026-10-15 用户授权此单恢复；精确预检 hash、现有业务服务执行、原轮次与父责任保全、本人列表 source_available 及完整整改清单的独立验收见 [恢复报告](/Users/leslie/Documents/Playground/output/wangzhen-rework-20261015/repair-report.md)。这仅证明个案已恢复为可处理状态，实际整改、复验与验收须另行读取。修复根因的代码见 [main PR #2470](https://github.com/world-sim-dev/sandai-data-smith/pull/2470)；[测试 PR #2468](https://github.com/world-sim-dev/sandai-data-smith/pull/2468) 保留测试分支集成入口。main PR 从最新 main 仅挑入本任务原始提交；是否可合并、Gate、业务验收及部署必须现场核验。
- 恢复命令应在首个业务写入前保存完整不可变意图，绑定检查版本、原发起身份、接收人、原意见、精确执行上下文和责任版本；重放只能接续自己的已提交步骤。只有执行关联完成后才能发布给标注员；已发布后缺回执不得覆盖标注工作。只模拟事务回滚会掩盖真实的逐语句提交故障，回归应注入每个提交前缀的中断。实现位置查 PR 中的 manual_return_intent.py，不据知识页认定已上线。
- 操作审计不能只 fsync 在临时 Pod：并行滚动发布可能销毁该文件，应实时输出并由操作者本机保存。写后对象比较还须区分数据库时间精度截断与业务字段漂移；出现校验失败先独立读取，不能盲目再次 apply。只读探针对大批参数化 SELECT 的解析预算不足时，可提高该探针进程的 parser token budget，但须保留并验证 DML 拒绝，不能据探针限制认定本人工作台失败。

## 2026-10-27 后续复验轮次仍关联祖先整改执行

**Why:** 合法手动复验可以建立后续检查轮次，而原整改执行的 followup 仍指向同批祖先组。退回标注员的捕获阶段若仅接受空指针或当前组，即使来源、接收人和父责任全部一致，也会在停止检查已提交之后拒绝。冻结退回意图存在但整改单尚未发布，列表可能回落为“待质检员整改／进入整改”，实际工作台因 stopped 无法修改。版本核对只检查后续正式答案，不能修复缺失的整改单。

**How to apply:** 同时核对不可变退回意图、停止检查版本、原执行 followup 和正式 previous/attempt 继承链。只有 pending 执行指针仍与原意图一致，精确祖先组属于同批同关卡，且当前轮能沿正式链证明承接该组与原执行责任时，才接续原捕获；新 worker 指针、无关组、断链和跨批次仍拒绝。通过原有命令恢复保留逐题判断及历史，实际发布后还要独立核验原定标注员的整改待办、完整题目和提交动作。修改及正式提交由标注员完成，再交质检员复验；不能直接把 stopped 改成可编辑。

实现、正反例及精确 CI 沿 [main PR #2894](https://github.com/world-sim-dev/sandai-data-smith/pull/2894) 查询；现场原意图、真实只读上下文、内存候选捕获和上线后验收项目见[纸面18整改报告](/Users/leslie/Documents/Playground/output/paper18-correction-20261027/report.md)。候选只读验证、PR 合并发布、后台重放、本人可编辑及实际完成整改是不同完成层，使用前重新核验。
