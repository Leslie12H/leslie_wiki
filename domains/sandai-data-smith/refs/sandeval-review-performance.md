---
name: sandeval-review-performance
type: reference
created: 2026-09-24
updated: 2026-09-25
tags: [sand-eval, quality, performance, inspection, arms]
links: [sandeval-api-observability, sandeval-sql-lock-diagnosis]
---

# Sand Eval 检查读取与保存性能核验入口

**Why:** 单题接口可能沿整个交接包读取前置报告；写入校验还承担实时权限、完整来源范围和前置报告资格检查。降低查询次数必须保留这些不同的正确性边界。

**How to apply:** 固定 main SHA 与部署版本，分别检查冻结报告追溯、当前执行资格、HTTP 响应后处理；先合并重复读取，再讨论跨请求缓存或来源范围版本。不能从请求超时推断写入失败，也不能从代码有 span 推断生产已采集。

## 代码指针

仓库根：`/Users/leslie/Downloads/sandai-data-smith`。2026-09-24 只读核验基线：`dd7e3a30bcb7c23bb579fdcafdd141b9c4f7a269`；以下指针使用前重新核对。

- `sand-eval/platform/backend/quality/application/management/inspection_context_service.py`：核对 `_frozen_sand_batch_reports` 中报告、唯一 bundle 与汇总回执的读取粒度；包总报告数不等于参与该循环的报告数。批量改造仍须保留原始 ID 顺序、缺失/跨任务/未封存/哈希错误语义。
- 同文件 `_sand_batch_predecessors` 与 `aggregation_service.py::sand_allocation_package`：核对筛选本批次发生在 `group_result` 前还是后。`_sand_group_index` 是命令作用域的 ContextVar，不是数据库索引；将昂贵的索引构造搬到每次保存不能消除全包工作。
- `quality/infrastructure/persistence/{submission_repository,review_task_repository,unit_of_work}.py`：检查已有批量接口与分块上限，不从旧分析重复新增 `get_many`。批量定位减少往返，仍有全包元数据量，不能声称整个请求只剩三条查询。
- `quality/application/management/quality_task_service.py::require_with_scopes` 与 `app/services/facts/task_assignments.py::_quality_context/_submission_scopes`：核对完整授权与批次枚举是否重复计算同一范围。读取的是题目身份与答题卡槽位，不应描述为下载全部题面/答案正文；`metadata_only` 和 `summary` 不提供写入所需范围证明。
- `quality/application/inspection/report_read_scope.py` 与 `quality/infrastructure/client/snapshot_store.py`：区分一次读取阶段的复用与跨请求缓存。缓存候选是经过 hash 验证的冻结成员、汇总依据和 OSS 快照；动态权限、当前报告轮次、阻断与复验授权必须保持实时校验。缓存 key 必须包含存储/任务/版本身份，不能仅凭一个成员 hash 复用报告资格。
- `quality/application/inspection/{review_query_service,answer_amendment_service,inspection_scope_service,review_history_service}.py`：沿 `item_detail → items_page` 检查单题窄读取、修订可见性、复验阻断及有仲裁权限时的组结果读取。修订记录非空且无法由本人修订短路时，可能先追溯再得出“无可继承修订”。
- `quality/api/inspection/inspection_handlers.py` 与 `quality/application/inspection/trace_timing.py`：核对普通保存的 `quality.review.save` 与后续 `post_save_detail` 为相邻阶段；修订 handler 的外层覆盖须另查。用同一请求的 HTTP 根 span 计算比例，不能拿不同样本的 p95 相除或重复累加嵌套 OSS span。
- `frontend/src/api/client.ts`、`frontend/src/pages/quality/inspection/ReviewWorkspace.tsx` 与 `platform/k8s/nginx.conf.template`：核对前端超时、同 payload 重试 request_id、网关等待以及写后详情失败。取消连接不证明服务端停止；用 trace 终态与回执关联验证。

## 证据边界与验证

2026-09-24 的初始基线分析仅核验源码与测试定义，没有复核用户案例的原始 ARMS trace、生产部署、107/105 条规模或约 220 次查询。实现依据与验证入口见仓内 `sand-eval/.agents/notes/implemented/simplification/2026-09-24-sand-batch-predecessor-reads.md` 及其链接的 subsystem owner；是否合入、测试和部署通过须另查 Git/CI，不能把源码改造视为线上收益证据。

实现时优先约束机制：增加无关批次不能增加重型组校验次数；缺报告、跨任务、证据 hash 不符仍拒绝；同批前置新轮次/撤权/阻断必须立即生效；历史读取不能改用最新报告。冷缓存、热缓存分别采样，并将普通保存、修订和单题读取分开统计。


## 批量定位方案的复核边界（2026-09-24）

- 接口计数：若 `aggregate_evidence_many` 自己批量读取送审，再由调用方预读一遍会产生重复查询。要得到三次定位查询，应让它接收已读送审，或直接返回送审及证据；核对 `submission_repository.py::get_many` 的 500 条分块，不能承诺任意规模恒定三次。
- PR-C 的行为差异：`inspection_context_service.py::_sand_batch_predecessors` 先定位后调用 `group_result` 时，不再因无关批次的 OSS/计划/明细校验异常阻塞本批次。旧路径并非因为兄弟批次“未通过”就必然拒绝；它先执行组校验，但通过/最新轮次判断在批次筛选之后。方案评审应准确区分这两者。
- 定位完整性：核对 `review_task_repository.py::groups_for_ids` 返回空组、组内送审身份不一致以及 `unit_of_work.py::CommandReceipts.get_many` 缺项/指纹冲突；无法可靠定位的组不能静默当作无关组。不要在全包定位阶段套用 `reports_many` 的正式报告状态门槛，否则可能引入新的兄弟批次阻断。
- 错误顺序：批量加载依赖前先核对报告身份、关卡与循环引用；否则一个指向标注批次的错误报告可能先触发“缺汇总依据”，掩盖原来的 `SNAPSHOT_CORRUPT`。核对上述 Note 指向的循环引用回归用例。
- 语义依据与验证：`inspection_context_service.py::_sand_batch_predecessors` 的批次依赖说明，以及 `tests/quality/application/resolution/test_sand_supplier_return.py` 中 sibling/current/full-package 三类用例。新增性能测试同时检查 SQL 次数与重型 `group_result` 调用范围；另补无关组快照损坏不阻断、本组损坏/过期仍拒绝、定位缺失不放行。

## 发布后回归核验入口（2026-09-24）

**Why:** 整体接口分位数同时受代码、请求参数和共享资源竞争影响。优化自身减少读取，不保证不同负载下的总体延迟下降；上线后变慢也不能单凭时间先后认定优化回退。

**How to apply:** 对齐部署 digest 与排除 rollout 的固定窗口，按 stage、任务及 include_page_index 等参数分组；同时核对同一检查任务的完整 trace 工作量和其他同进程长请求。SLS 仅解析 Nginx access log，避免重复计入 Uvicorn；完成请求数不能直接当入站负载。

- 负责人列表全量页码入口：`quality/application/management/live_leader_package_query.py::page` 的 include_page_index 分支，以及 `leader_package_query.py::_contexts/_metadata`、`batch_allocation_service.py::authorize_list`。核对 page_size 是否仅用于生成页码、候选是否遍历完才返回；检查员 count 删除并不等于这个负责人统计入口消失。
- 对比发布 diff 时检查上述路径及前端 `quality/management/PackageList.tsx`，而非把同属 quality 的变更视为同一调用链。请求内 semaphore 不是全进程共享预算。
- ARMS GetTrace 要分页取全，并核验 complete；查询 32 位 trace ID 时核对时间范围。SQL span 包含 SET setup，计数须区分 SELECT 与初始化；并发子 span 耗时不可直接相加作为请求耗时。已写自定义 span 但样本缺失时，只报告采集缺口。
- 2026-09-24 核验指针：[PR #1839](https://github.com/world-sim-dev/sandai-data-smith/pull/1839)、[本机固定窗口报告](/Users/leslie/Documents/Playground/sandeval-pr1839-performance-review-20260924.md)。报告分别记录已确认现象、共享连接竞争推断及未执行回滚 A/B 的因果边界；不要将当次负载和指标当作当前状态。

## Leader 详情与逐包进度的区分（2026-09-24）

**Why:** `/{id}/leader`、`/{id}/leader/progress` 与 `/leader/tasks` 不是同一个统计入口。live 模式下，逐包进度会实时计算；“每个请求只有一个包”不代表整页并发成本有界。

**How to apply:** 沿 `leader_query_service.py::_package` 核对详情的完整授权与交接资格；沿 `live_leader_package_query.py::_live_rows` 核对 `authorize_summary(summary=False)` 后再次调用 `list_submission_scopes` 的完整来源读取。对照 `app/services/facts/task_assignments.py::_submission_scopes` 及已有上下文和 scopes 联合读取机制，避免复用时删除动态授权。

- 前端 `quality/management/PackageList.tsx` 的 progress effect：检查当前页未缓存行是否同时发请求、是否使用统一 AbortController；后端请求内 semaphore 不限制不同 HTTP 请求。同步 499 可来自整页取消，不能一律归为服务器超时。
- 相同请求的数据库子 span 区间并集与根 span 差值只能称未覆盖时间。若大空档位于 setup SET 前，再结合 pool_wait 信号收窄连接获取/调度等待；没有请求级 acquire span 时不要精确摊成池等待百分比。
- 当日证据入口：[Leader 两接口报告](/Users/leslie/Documents/Playground/sandeval-leader-current-20260924/report.md)。报告对齐最后一个发布前稳定窗口，并用全量目标 access 记录计算精确分位数；新 rollout 的性能需要另取稳定窗口。


## 提交链证据与恢复重试核验（2026-09-25）

**Why:** 提交报告、提交后处置归并、后续推进属于不同阶段；HTTP 499 不证明服务端停止。pending 记录总量只能证明积压，不能单凭快照认定重试周期或每条记录的执行频率。

**How to apply:** 对齐 Nginx 完成时间窗口和 ARMS 根 span，用完整分页取 trace；分开记录 PostgreSQL 读取、写入与 SET。从 `quality/application/inspection/review_service.py::submit` 定位 `_change → resolution.after_report → advancement.after_submit`，没有独立 span 时只能用 SQL 序列给出近似边界，并注明路由鉴权可能计入首段。

- 包规模核验：`eval_quality_extension` 中 `task_quality_config.payload.source_task_ref` 映射源任务；再按 task_id 聚合 `ev3_assignment` 的题数与槽位数。不要猜测存在 `eval_quality_task` 表。运行后的规模查询不等于历史 trace 逐条返回行数。
- 四类整包语句指针：`app/repositories/task_assignments.py::{quality_requirement_questions,quality_assignment_slots,quality_submission_owners}` 及 `app/repositories/assignment_wave.py::members_by_wave`。最后一个方法包含 wave IDs 和成员两条查询，分别统计；`quality_submission_owners` 若带 assignment_ids 参数，不能仅凭方法名叫它无条件整包扫描。
- 恢复核验：检查 `quality/infrastructure/runtime.py::_recover` 的循环末尾等待、`review_advancement_repository.py::pending` 的筛选/排序/claim，以及 `advancement_service.py::recover/after_submit` 的 attempts 写入。循环末尾等待 30 秒不表示每条记录恰好每 30 秒执行。用两次按 extension_id 对齐的快照记录 attempts 差值，同时标明它们不是历史请求窗口的状态。
- SLS 检索覆盖：2026-09-25 回查时发现 `_pod_name_: sandeval*` 前置检索遗漏历史 Pod 记录，即使响应 Complete。应以 namespace/container 精确筛选、SQL 中严格 Pod regex 为对照验证；Complete 只证明所选输入查询完成，不证明通配覆盖完整。此次重新核对前次三个接口原始样本集合一致。
- 409 错误码：Nginx 状态码和响应长度、ARMS HTTP 状态不能单独证明业务 code。即使长度与 `ANNOTATION_WRITE_BUSY` 响应吻合，也应标为推断，或补 `error.code` 后确证。
- 本次只读证据：[2026-09-25 提交接口证据包](/Users/leslie/Documents/Playground/sandeval-submit-evidence-20260925/report.md)。窗口、规模、积压和 trace ID 均在报告中，不作为当前运行状态缓存。

## 质检员任务列表实时计数（2026-09-25）

**Why:** 上海生产部署 `a27019c1ae5a5ff5261a392ab748db3d121c497f` 的 `GET /api/quality/inspector-tasks` 在 18:48 左右仍有 6–8 秒请求。SLS 同窗口的应用记录显示 88–111 次数据库调用、连接池等待通常仅数毫秒。ARMS trace `dddd440163a09cfb70fc4c5252cdf5d3` 中，8.49 秒根 span 先有一次约 1.6 秒的候选任务 SELECT，再有约 20 条同形的 `quality_inspector_batch_metadata` 成员计数 SQL 并发执行，每条约 4.2–5.0 秒。这证明该请求走了 `live` 计数路径；并发 SQL 的耗时不可相加成请求耗时。未取得 Hologres 执行计划，不能把单条查询变慢的数据库内部原因定论为锁或缺索引。

**How to apply:** 在对应部署 SHA 的 `review_query_service.py::_inspector_labels` 核对 `summary_mode` 向来源服务传入 `include_counts=False` 的分支；在 `app/repositories/quality_inspector_batch_metadata.py` 核对实时成员计数与摘要时的名称查询。该部署的 `QUALITY_INSPECTOR_TASK_LIST_QUERY_MODE` 默认 `live`，实际生效值仍应从生产配置和进程回读；trace 已证明这个请求没有走摘要分支。优化或切换前按 `quality-package-summaries.md` 先核对摘要补建、后台 worker、筛选与权限正确性，再对齐发布版本、角色和批次规模验收前后数据。不要通过调大连接池或把并发子 span 耗时相加来解释此例。
