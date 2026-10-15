---
name: sandeval-package-status-filter-summary-schema-drift
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, quality, filtering, summary, schema]
links: [sandeval-quality-sampling-return-map, sandeval-review-performance]
---

# 数据包状态筛选与摘要版本漂移

**Why:** 摘要生产端升级版本后，候选 SQL 若仍硬编码旧版，就会在分页前排除新摘要；数量接口可能走不同过滤路径，从而同时出现“列表为空”和“总数非零”。仓储夹具也使用旧版时，现有测试可以继续通过。

**How to apply:** 对同一账号、关键词和状态分别核对列表、总数与分页。固定生产部署和运行源码摘要，再核验生产端当前 schema、SQL 准入版本及测试夹具版本；只读对照旧版与新版的匹配数量，不用页面空列表推断没有业务数据。版本应共用权威来源，回归应使用当前版而不是跟着旧 SQL 造旧数据。

## 核验入口

- `sand-eval/platform/backend/quality/application/management/package_summary.py`：摘要生产版本。
- `app/repositories/quality_leader_candidates.py`：状态条件触发的 SQL 版本准入。
- `quality/application/management/leader_package_query.py::_index`：数量入口是否关闭候选阶段状态过滤，及投影时的版本判断。
- `backend/tests/test_quality_leader_candidates.py`：当前版、旧版、非 ready 世代及分页前过滤的仓储覆盖。

## 2026-10-15 生产只读证据

[诊断报告](/Users/leslie/Documents/Playground/output/sandeval-package-filter-20261015/report.html) 保存“纸面 + Sand 未质检”浏览器复现、部署和运行源码哈希、两次独立只读数据库对照、引入提交和修复范围。版本数字、数量及运行态均以该固定报告为准，不从本页推断当前仍有故障。

本次完成诊断，未修改业务代码、未发布或写生产；修复状态需查看后续 PR 与部署证据。
