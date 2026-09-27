---
name: sandeval-api-load-and-auth-diagnosis
type: reference
created: 2026-09-27
updated: 2026-09-27
tags: [sandai-data-smith, sandeval, performance, auth, sls]
links: [sandeval-sql-lock-diagnosis, sandeval-review-performance]
---

# Sand Eval 压测流量与认证请求归因入口

**Why:** 生产接口耗时看板会混合带压测标记的请求、客户端断开和多个部署版本。只看总体 p95 容易将压测拥塞解释成普通访问持续慢；auth/me 请求数也不能当作登录人数。

**How to apply:** 先固定绝对窗口，按 load_run_id、deploy_sha 分层；用 request_id 关联应用与 Nginx，499 的边缘路由元数据可能为空，需从应用补回真实路由。沿同一 OTel trace 下钻 SQL，并发累计耗时不可相加为请求时长。数据库历史查询为空时，先核对实际实例、计算组、查询身份和 pg_read_all_stats，不能当成没有慢 SQL。

## 指针

- 2026-09-27 五类接口与 auth 请求量对账报告：`/Users/leslie/Documents/Playground/output/api-slow-20260927/report.md`。目录保存 SLS Complete 结果、app→edge JOIN、ARMS SQL 模板及数据库可见性检查脚本；数值仅代表报告中的绝对时间窗。
- 认证前端触发入口：`sand-eval/platform/frontend/src/contexts/AuthContext.tsx`。核对挂载、focus、登录与续期失败后的 refresh，不能凭请求量断言 focus 的实际占比。会话续期入口为独立 renew API，当前行为须读部署提交。
- 个人任务投影入口：`sand-eval/platform/backend/app/services/facts/inspections.py::owned_projections`；关注有归属来源的任务数，以及是否逐任务展开完整答题卡矩阵。
- 发布范围复核：`app/services/facts/dispatch_publish_confirmation.py` 与 `app/repositories/material_dispatch_history.py::SUPPLIER_COUNTS_SQL`，即使 202，受理前也可能同步执行耗时读取。
- 整改封存：`quality/application/resolution/answer_correction_service.py::prepare` 和 `quality/application/management/submission_content_service.py::read_frozen`；同时核对题数、变更数、SQL 与 OSS I/O，不能只找单条慢 SQL。
- 批量质检分配：`quality/application/management/bulk_allocation_service.py` 与 `quality/api/management/management_handlers.py::_bulk_stream`；分开流式首字节和全部业务完成。
