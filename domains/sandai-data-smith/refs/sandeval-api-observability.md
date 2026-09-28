---
name: sandeval-api-observability
type: reference
created: 2026-09-18
updated: 2026-09-28
tags: [sand-eval, observability, latency, sls]
links: [sandeval-sql-lock-diagnosis, sandeval-review-performance]
---

# Sand Eval 接口观测入口

**Why:** 监控不能成为业务请求的新依赖。已有 Nginx main 访问日志含 rt，
在 SLS 分析已入库副本可避免新增业务埋点、队列、采集器及数据库查询。

**How to apply:** 先核实日志格式和来源，再从离线生成器复现看板；
解析率只针对识别出的候选日志，不等于全部流量采集率。分位数不能跨 Pod 或时间求平均。
不要因看板无异常行宣称业务健康；同时检查日志新鲜度和覆盖范围。

## 权威指针

- 代码仓库：`world-sim-dev/sandai-data-smith`；2026-09-18 本地实现提交
  `03bc9dc8a`，分支 `codex/eval-log-dashboard`，尚未发布PR或部署业务。
- 实现：`sand-eval/platform/scripts/api_observability/dashboard.py`，仅本地生成 JSON/SQL。
- 口径、生成、导入与回退：`sand-eval/docs/operations/api-observability.md`。
- 验证样例：同目录 `test_dashboard.py`；线上SQL需从控制台现场核实。
- 日志来源：`sand-eval/platform/k8s/nginx.conf.template`；特别检查 location 级 access_log 覆盖。
- [生产 SLS 看板（2026-09-25 新集群）](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/dashboard/dashboard-1790304848380-487363?slsRegion=cn-shanghai)。[当前 Eval 日志库](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/sandeval-prod?slsRegion=cn-shanghai)；如再次迁移，先核对当前 ACK 生产 Deployment 和 SLS 采集映射。

2026-09-25 复核：生产已迁至上海 ACK `sandai-sh`，原集群 Eval Deployment 缩为 0。旧看板仍查询旧 SLS Project `k8s-log-c7a4a4cf4049c494ca6dea4aaf1e7f9b9` 的 `data-operator-log`，因此无实时数据。新项目 `k8s-log-c9838d6fa878b43c59a6d37586f0c0747` 的 `sandeval-prod` 已有 Web 访问日志与 transaction_trace；从旧看板跨项目导入并替换 Logstore 后，新看板的 QPS、耗时趋势、事务阶段、接口排名及异常分布均显示最近 15 分钟数据。项目和库名是这次的时间点证据，不是永久配置。

2026-09-18 在控制台保存并回读生成配置，四面板有真实数据；这是看板验收，
不代表业务代码部署或全接口覆盖证明。仅 SLS 查询侧新增开销，未修改业务运行配置。

## 2026-09-18 设计阶段记录与 2026-09-24 补充

以下保留设计阶段的检查入口；其中“尚未部署”描述的是该阶段，SLS 看板后续验收与迁移见上文对应日期。

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

## 检查保存的后续核验入口（2026-09-24）

上文是 2026-09-18 的方案背景，不能据此判断当前保存路径没有子 span。检查 `quality/application/inspection/trace_timing.py`、`review_service.py` 和 `quality/api/inspection/inspection_handlers.py` 的 ARMS 接线与计时边界，详见 [检查读取与保存性能](sandeval-review-performance.md)。源码存在不证明目标部署及 exporter 已采集；普通保存与修订 handler 的覆盖也须分别核对。
