---
name: sandeval-settlement-performance
type: reference
created: 2026-09-27
updated: 2026-09-27
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
