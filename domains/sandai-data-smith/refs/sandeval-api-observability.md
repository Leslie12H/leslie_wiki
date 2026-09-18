---
name: sandeval-api-observability
type: reference
created: 2026-09-18
updated: 2026-09-18
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
- [生产 SLS 看板](https://sls.console.aliyun.com/lognext/project/k8s-log-c7a4a4cf4049c494ca6dea4aaf1e7f9b9/dashboard/dashboard-1789715001140-510770?slsRegion=cn-shanghai)。

2026-09-18 在控制台保存并回读生成配置，四面板有真实数据；这是看板验收，
不代表业务代码部署或全接口覆盖证明。仅 SLS 查询侧新增开销，未修改业务运行配置。
