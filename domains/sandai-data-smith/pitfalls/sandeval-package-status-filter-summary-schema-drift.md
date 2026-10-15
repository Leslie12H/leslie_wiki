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

诊断阶段的只读证据保留在报告；后续修复及发布证据见下方固定指针。

## 引入归因与修复核验补充

2026-10-15 继续核验 GitHub PR 元数据及不可变 Git 历史，直接引入 PR 与后续部署 PR 的区别、提交差异和合入时间已追加到上方诊断报告，并另存同目录 `pr-attribution.json`。后续修复已形成独立 PR；当前运行状态以对应提交和部署核验为准。

**How to apply:** 摘要升级要同时核对生成器、投影读取器、SQL 前置过滤与仓储夹具；修复让它们共用当前版本来源，同时保留 ready、请求/发布世代一致和版本一致性。用当前版数据覆盖两侧列表、状态筛选、总数与分页，旧版及未完成刷新不得伪装成当前确认结果。已有有效新版摘要无需因读取缺陷回退或删除。

## 2026-10-15 修复与验收指针

[修复 PR #2494](https://github.com/world-sim-dev/sandai-data-smith/pull/2494) 保存版本来源统一与两侧状态筛选、旧版/未来版/升级中摘要和分页回归。测试完整检查与部署见 [38742013376](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38742013376)，main PR Gate 见 [38742365289](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38742365289)，对应生产发布见 [38743014293](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38743014293)。实际运行提交、全部可用副本镜像及“纸面 + Sand 未质检”两页验收保存在上方诊断报告同目录的 `production-rollout.json`、`production-ui.json` 与 `release-progress.json`；这些是固定时间证据，不代表后续实时部署。

**How to apply:** 共享测试分支有冲突时不得把它带入干净任务分支；依据独立测试环境 runbook 验证候选提交。上线以生产发布完成、实际提交/镜像一致和原始用户场景恢复三项共同确认，不能仅凭 PR 合并或 CI 通过宣称修复生效。
