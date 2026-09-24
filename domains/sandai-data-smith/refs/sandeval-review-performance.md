---
name: sandeval-review-performance
type: reference
created: 2026-09-24
updated: 2026-09-24
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
