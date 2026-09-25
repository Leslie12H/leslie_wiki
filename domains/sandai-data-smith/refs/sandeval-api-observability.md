---
name: sandeval-api-observability
type: reference
created: 2026-09-18
updated: 2026-09-25
tags: [sand-eval, observability, latency, sls]
links: [sandeval-sql-lock-diagnosis]
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
