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

2026-09-24 本次仅核验源码与现有测试定义；没有复核用户案例的原始 ARMS trace、生产部署、107/105 条规模或约 220 次查询，也没有性能改动、压测或部署。SLS CLI 在本次 shell 不可用。

实现时优先约束机制：增加无关批次不能增加重型组校验次数；缺报告、跨任务、证据 hash 不符仍拒绝；同批前置新轮次/撤权/阻断必须立即生效；历史读取不能改用最新报告。冷缓存、热缓存分别采样，并将普通保存、修订和单题读取分开统计。
