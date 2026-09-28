---
name: sandeval-slow-panels
type: reference
created: 2026-09-19
updated: 2026-09-19
tags: [sandeval, sls, observability]
links: [sandeval-sql-lock-diagnosis]
---

# Eval慢接口与事务SQL观测指针

**Why:** 接口端到端慢不代表已有trace中的单条SQL慢；用户要求保持业务零新增采集负担。

**How to apply:** 使用现有SLS日志做离线聚合。慢接口按method与归并路径呈现全部超过阈值的接口，不限质检。事务/SQL仅统计finish事件并标注选择性覆盖；不要宣称全库慢SQL覆盖。分位数为近似值，不平均或相减归因。

2026-09-19查询窗口、异常堆栈与复现入口见本机报告 `/Users/leslie/Documents/Playground/output/eval-log-audit-20260919-10h.md`；这是固定窗口证据，不是持续健康结论。

实现入口：`/Users/leslie/Documents/Playground/eval-log-dashboard/sand-eval/platform/scripts/api_observability/dashboard.py`。操作说明同工作树 `sand-eval/docs/operations/api-observability.md`，含生产看板链接。当前状态和统计数以SLS重新查询为准。
