---
name: sandeval-settlement-performance
type: reference
created: 2026-09-27
updated: 2026-09-28
tags: [sandai-data-smith, sandeval, settlement, performance, sls, arms]
links: [sandeval-sql-lock-diagnosis, sandeval-api-load-and-auth-diagnosis]
---

# Sand Eval 结算明细性能核验入口

**Why:** 页面分页与预览截断可能发生在完整结算计算之后，不能据展示行数推断后端成本。客户端断开与后台计算结束也可能相隔较长时间，应用记录 200 不代表用户收到结果。

**How to apply:** 从月份/供应商选择事件追到结算预览、完整报表和质检读取；对齐实际部署 SHA，以 request_id 关联 app 与 Nginx，再用相同 trace 的 SQL 模板数量与时间线确认读取放大。按任务批量并发不等于跨请求预算；累计 DB 客户端耗时不能当关键路径时间。

## 核验指针

- 2026-09-27 只读诊断、冻结源码、SLS Complete 查询、app/edge 对账及完整脱敏 ARMS trace：`/Users/leslie/Documents/Playground/output/settlement-performance-20260927/report.md`。具体耗时、请求数量与部署仅代表报告中的绝对窗口；没有重放生产请求或实施优化。
- 前端：`sand-eval/platform/frontend/src/pages/dataDashboard/SettlementReport.tsx` 与同目录 `api.ts`。核对 onChange 是否触发生成、AbortController 的边界，以及 Table 是否仅在预览集合中分页。
- 接口：`sand-eval/platform/backend/app/api/all_space_tasks.py` 的 `supplier_settlement_preview`、`supplier_settlement_export`；核对 month/space_id/report_id 与分页契约。
- 报表：`app/services/interpretation/settlement_export.py` 的 preview/report/csv。区分导出快照、重复预览复用和进行中任务合并；不能因存在 Redis 就声称生成已缓存。
- 质检：`app/services/interpretation/settlement_quality.py` 与 `app/repositories/settlement_export.py` 的 source_members；核对任务/批次/成员范围、日期过滤所在层和重复详情读取。通用详情入口为 `quality/application/management/task_detail_reader.py`。
- 优化边界：CT 的完整批次有效性及通过率、QT 的同答案版本两级判断须保留；只收窄无关任务/批次，不能截掉月外成员再重算整包通过。历史月份可能因整改和质检变化而改变，缓存与投影需定义失效来源。
- 观测：先查当前 Performance Profile 是否已收录结算接口；未声明规模/预算时报告缺口，不用相邻人效接口预算代替。

## 优化方案复核入口（2026-09-27）

**Why:** 只读 handler 容易漏掉应用注册时的统一权限门禁；只读 OSS 调用容易漏掉读取上下文内的复用。删除版本校验或通用详情中的所有包版本逻辑，会把性能优化变成结算口径变化。

**How to apply:** 方案见 `/Users/leslie/Documents/Playground/output/settlement-design-20260927/plan.md`，其中保存当前主线冻结源码。该方案尚未实施，数值配置属于建议，不能当作现行能力或已批准 SLO。

- 权限沿 `app/main.py::include_router` → `require_area` → `RoleService.can_access_area` → `access.py::root_only/clamp_nodes` 核验，不能凭 handler 没有 is_root 分支判定越权。
- 快照沿 `OssSnapshotStore.read` 的 `reuse_report_read` 和 `report_read_scope` 核验；跨请求缓存还需引用范围校验、hash 校验、返回对象隔离及按字节限容。范围快照只在 active_inspection_scope 存在时读取。
- 批次复用入口为 `SubmissionService.current_batches_many`，保留当前版本链检查；Sand 历史结果沿用仍需 `AggregationService.sand_batch_sources` 的上游变化判断。
- 共享结果应拆分条件到最新 report_id 的指针和不可变报表，入口每次鉴权；历史月份可能因后续整改变化，不能仅按月份结束就长期缓存。
- 版本改为前后分块批量比较，不能末尾只查一次或删除。普通 cutoff 不保证所有读取来自同一数据库时点。
- `bulk allocation` 的进度流不是持久作业队列；`DispatchWorker` 有固定 kind 路由，新结算作业需验证领取隔离、租约、恢复和发布边界。

## P0 提交评审核验入口（2026-09-28）

**Why:** 同条件合并不能单凭存在 Redis 锁判断成立；失去租约后的发布、其他计算入口和完成时间判断都会影响最终效果。缓存 key 与查询条件的规范化若不同，还会造成范围错配。

**How to apply:** 指定提交的评审、四个隔离 Fake Redis 复现及定向检查日志见 `/Users/leslie/Documents/Playground/output/settlement-p0-review-20260928/review.md`。评审结论只绑定报告中的提交；后续是否修复或发布，应重新查 Git 和运行证据。

- 沿 `_build_once` → `_build` → `RedisStore.lock/LockLease` 检查续期丢失是否取消工作、发布是否原子验证 owner，以及退出异常是否被吞掉；锁的自动续期不等于发布被保护。
- 分开计算起点 cutoff 与完成时间；防连点若承诺完成后冷却，就用完成时间，复现必须覆盖耗时长于冷却窗口的构建。
- 检查 preview 和不带 report_id 的 csv 是否经过同一计算入口；同时检查所有进程的总预算，而非只看某个 worker 的 Semaphore。
- 查询参数、缓存 key、快照元数据和导出匹配必须使用同一个规范化 scope；覆盖 None、空字符串、非法全局标记及真实供应商。
- 页面修改时间与任务数展示时，除组件测试外还要核对 DataDashboardPage 的关联断言；后端通过不代表前端 Gate 已通过。

## P0 修复验证入口（2026-09-28）

**Why:** 共享缓存需要所有在线计算入口受同一预算约束；局部测试通过后还应分清业务回归、生成物与整仓结构门的证据。

**How to apply:** 修复提交、定向测试日志及未完成的 CI/运行态验证见 `/Users/leslie/Documents/Playground/output/settlement-p0-review-20260928/fix-summary.md`；是否推送、创建 PR 或部署以当前 Git 和运行态为准。

- 原子发布 owner 位于 `platform/backend/app/infra/settlement_report_store.py`，构建入口、完成时间及全局名额位于 `services/interpretation/settlement_export.py`；回归覆盖接管 token、续期失败、跨 worker 构建和完整导出。
- 题型树扫描报退役目录缺 pack/README 时，先核对 Git tree 和目录内容；目录可能只剩忽略的 __pycache__，不能据此补造旧题型。清理前验证无源码，并保留可恢复备份。
