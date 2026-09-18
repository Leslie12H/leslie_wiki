---
name: sandeval-api-observability
type: reference
created: 2026-09-18
updated: 2026-09-18
tags: [sand-eval, observability, latency, sls]
links: [sandeval-sql-lock-diagnosis]
---

# Sand Eval 接口观测设计入口

**Why:** 接口分位数需要明确请求边界；网关失败、应用异常与数据库阶段日志不能直接相加。2026-09-18 的请求为实现方案，尚未部署或确认生产采集配置。

**How to apply:** 先检查以下代码及线上采集配置，再确定 SLS 看板接入。按 method + 路由模板聚合；测试与生产、普通 API 与媒体传输分开。分位数不可直接跨时间或 Pod 求平均。采集故障须优先保护业务，同时显式展示数据缺失。

## 代码与验证指针

仓库根：`/Users/leslie/Downloads/sandai-data-smith`。

- `sand-eval/platform/k8s/nginx.conf.template`：检查 main 日志的 rt/urt、location 级覆盖、媒体专用审计与内部重定向；不能假设改 http 级 access_log 就覆盖所有请求。
- `sand-eval/platform/k8s/start.sh`：核实 Uvicorn worker 数量及日志配置；进程内队列与指标必须覆盖所有 worker。
- `sand-eval/platform/backend/app/main.py`：检查 FastAPI 入口与异常处理，特别是多个异常映射到同一 503 的分类缺口。
- `sand-eval/platform/backend/app/infra/uvicorn_logging.json`：核实同步 handler，不能把 stdout 当作天然非阻塞传输。
- `sand-eval/platform/backend/app/infra/transaction_trace.py`：检查现有 trace ID 与阶段记录；HTTP request ID 关联应另行核验，保留禁止记录 SQL 参数的边界。
- 历史日志定位参考 [SQL 与锁诊断](sandeval-sql-lock-diagnosis.md)，其中 Logstore 映射须现场复验。

## 方案边界

建议先复用 SLS，使用网关请求记录统计流量与耗时，应用完成事件补充异常分类与关联诊断；ALB 故障另列，不能与应用请求重复计数。此为待实施建议，不代表已采纳的工程决定或现网能力。
