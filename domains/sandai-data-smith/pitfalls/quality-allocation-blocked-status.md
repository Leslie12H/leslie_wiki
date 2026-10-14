---
name: quality-allocation-blocked-status
type: pitfall
created: 2026-09-25
updated: 2026-10-14
tags: [sand-eval, quality, allocation, status]
links: [sandeval-bulk-allocation-latency]
---

# 质检待处理与质检中状态判读

**Why:** 数据包批次里的分配人名、正式送审对象、真实检查任务和已检查题数属于不同事实。显示姓名或存在 submission 不足以证明任务创建成功；“质检中”也不保证检查员已经检查第一题。

**How to apply:** 从 `platform/frontend/src/pages/quality/management/batchReviewColumns.tsx` 的标签映射追到 `backend/quality/application/management/package_progress.py::batch_status`，再联查 `eval_quality_extension` 的 batch_allocation、当前 submission 链、`eval_quality_review_task` 和 `eval_quality_review_item`。核对实际 error_code，不按中文标签猜流程。

2026-09-25 核查源码主线 `52d2240af5b7537cb8c3926da489d2012e0b4fc6`：批次无真实检查任务且有分配错误时展示“待处理”；首轮检查任务未交卷时展示“质检中”。该观察是当时实现，后续以源码和页面为准。

来源检查凭证过期时，先核对 `dto.py::ExecutionEvidence.assert_valid` 和失败阶段，不直接归因于数据库。恢复入口看 `AllocationDetail.tsx` 的“继续完成分配”、`available_actions` 以及 `batch_allocation_service.py::_resume`；后者按未完成批次续跑，成功批次应保留。查询原因不授权执行恢复；刷新页面本身不代表已重试。

本次只读证据指针：`/Users/leslie/Documents/Playground/output/sandeval-qc-status-20260925/report.md`。其中包含任务标识、批次错误、真实检查进度和未执行恢复的边界。当前数据及按钮权限需重新查询，不在知识库固化活跃状态。

## 2026-10-14 固定答案上下文门禁恢复后续跑原分配

**Why:** 答案已提交和批次已流转不保证质检任务已生成。指定三批的原分配记录均为 SOURCE_RESULT_INVALID / 固定答案缺少作答上下文，group/submission 尚未登记；当前精确答案、不可变上下文回执及原生内容读取均已有效，失败分配仍需完成。当前存在回执不能倒推历史读取缺失的具体原因，也不能把一次原生恢复当永久代码修复。

**How to apply:** 定位明确来源任务、姓名、scope 和既有 allocation，先核对真实错误和当前来源读取。若上下文读取已通过，不补造回执或重交答案；经恢复授权、完整备份/读回、摘要和实时资格再校验、互斥租约，对精确既有 allocation 调用 BatchAllocationService.resume。保留已成功批次的 group/submission；每笔保存原生结果并独立核验。完成要求三层证据：allocation ready、真实 active 轮次及样本、实际非 root 质检员本人 todo 列表和可用题目入口。仅管理页状态变化或 root 可以查看不够。

- [2026-10-14 临科 02 三笔分配恢复报告](/Users/leslie/Documents/Playground/output/sandeval-three-feedback-20261014/report.md)：王星灿、韩易呈、宋梦莹的精确对象、原错误、当前作答上下文、摘要和完整备份、原生续跑、已成功批次保护、两名真实质检员本人待办及页面验收。实例状态、人员与部署会变化，后续引用重新核验。
- 来源读取门禁指针：app/services/facts/qc_verdict.py::read_response_versions 与 app/repositories/answer_execution.py::for_responses；当前权威读取和部署边界按现行源码核验，不把外层质量元数据连接当所有来源上下文均一致的证明。
- 本次是指定存量恢复，未改平台代码、来源答案或作答上下文。用户已收窄为第一项，其余一次性错误不据此继续改动。

## 2026-10-14 历史 SQL 实参与自动接续补证

**Why:** 一次恢复只能证明当前任务恢复，不能解释为何最初冻结失败或保证不再发生。后续补证将原 allocation 的送审阶段 error 与对应零行 SQL、同任务及旧答案实参匹配；来源 execution/context 用普通 fetch，外层质量主节点读取不会自动覆盖它。当前 allocation recovery 开关关闭，失败单不会由该循环自动续建。回执 created_at 早于失败仍不单独证明历史实际提交/可读时间，不能把底层复制延迟当已确认。

**How to apply:** 用 allocation/request/phase/部署绑定原失败，再读取 hg_query_log 的 calls、result_rows 和 query_detail，排除相同时段其他任务及嵌套 SQL。来源版本选择、精确正文/字段和执行上下文要贯穿权威读取，保留历史冻结版本与责任门禁；在分类、退避、上限和幂等保护下接续原分配，不能直接给所有 SOURCE_RESULT_INVALID 无限重试。当前代码和开关须现场核验，数据恢复与长期代码修复分别交付。

- [2026-10-14 三笔分配根因补证与长期修复设计](/Users/leslie/Documents/Playground/output/sandeval-three-feedback-20261014/root-cause.md)：精确失败时点、零行实参、历史/当前部署读取边界、恢复开关及仍未知的数据库机制。该报告补充前一恢复报告的历史未知项；没有新增业务写入、代码改动或配置发布。
- 精确实现入口：TaskAssignmentRepository.quality_submission_owners、QcVerdictService.read_response_versions、AnswerExecutionRepository.for_responses、HoloClient.fetch / _read_pool / answer_read_chain，以及 QualityRuntime 的 allocations recovery。独立答案连接池不自动等于主节点读取，真实缺失仍须明确拒绝。


## 2026-10-14 来源读取边界与请求内有界重试

**Why:** 外层质检 UoW 的 Leader 连接和 answer GET 专用连接池都不会自动约束来源服务自己的 fetch。冻结所需的最新提交归属、精确答案正文/字段和同版本执行上下文必须由来源 owner 明确声明权威读取。瞬时连接错误可以重试，真实答案缺失不能按相同类别循环重试。

**How to apply:** 用仅在来源读取期间生效的 ContextVar 选择 Leader，正常列表和并发请求保留自己的读取策略，不改写共享客户端，不替换冻结引用。请求内 SOURCE_UNAVAILABLE 最多尝试 3 次，每次重新核验实时权限，复用原分配及原幂等身份、跳过成功批次；时间预算耗尽或权限/范围/真实缺失失败后保留可处理的错误。这个机制不等于打开后台 allocation recovery，重启后的恢复仍按当前配置和原生续跑入口判断。

- [来源一致读与瞬时失败重试测试 PR #2431](https://github.com/world-sim-dev/sandai-data-smith/pull/2431)：代码、回归与角色使用文档指针；是否合并、验收或上线需查看 PR 和部署记录。
- [修复分支 Platform Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38507305702)：测试 PR 若因其他领域的 main/test 差异无法合并，分支验证须先核对构建和部署 job 的 main ref 条件。单独分支 CI 不替代测试分支集成或生产验收；不得把测试分支历史带回开发分支。
