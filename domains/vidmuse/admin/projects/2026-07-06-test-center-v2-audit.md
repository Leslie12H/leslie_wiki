---
name: 2026-07-06-test-center-v2-audit
type: project
created: 2026-07-06
updated: 2026-07-06
tags: [vidmuse, admin, test-center-v2, audit, credits, fact-metrics]
links: [vidmuse-admin, vidmuse-admin-harness, test-center-v2-mcp-direct-tool-call]
---

# 2026-07-06 Test Center V2 全链路审查(主要发现)

对 vidmuse-admin Test Center V2(fact/metric/credits/quality/artifact)做的一次全面只读审查。完整报告在当日 Claude Code 会话输出;本页只存 P0 结论 + 指针。

## P0 结论(截至 2026-07-06,分支 codex/test-center-token-cache-breakdown)

1. **fact_result_v2 去重 migration 在 MySQL 上跑不过**:`2026_06_30_test_center_v2_result_upserts.sql` 和 `2026_07_04_test_center_v2_fact_result_signal_dedupe.sql` 的 DELETE 对临时表 `tmp_fact_result_v2_rank` 自连接两次,命中 MySQL ER 1137 "Can't reopen table"。修复 commit `b6729a509`(ROW_NUMBER 改写)只在 `codex/latency-experiment-intelligence` 分支,未进 main。**含义:生产库的去重+唯一键可能从未成功执行**,这解释了代码里大量"防御历史重复行"的逻辑仍然必要。
2. **credits 覆盖门控不对称**:`thread_metrics.overlay_thread_token_metrics` 里 tokens 走 `force_tokens=True` 强制覆盖,credits 只在"无任何旧别名数值且 credit_source 为空"时覆盖;而 `benchmark_checkpoint_assembler.py:289` 会写 `credit_source="zeus_live"`,`normalize_worker_metrics` 又把 `credit_cost_sum/mean` 扩散成 `credits/credits_consumed/credit_cost` —— 两者都会永久堵死 thread_analytics 覆盖。这是"重聚合后积分仍是旧值"的结构性根因。**在线全量 fact 重算路径至今仍有此问题**,只有 backfill 脚本的 credit-only 快路径(`--recompute-facts --fact-semantic-key core_credits_used`,且必须精确单键)绕开了它。
3. **cancel_run 触发整 job 全量 fact 重算**:`worker_service.cancel_run:689` 调 `evaluate_job(db, job)` 默认 `recompute_facts=True`,此时其它 run 的 artifact_json 已是 observation pointer,重算走降级 observation。`preserve_existing_higher_signal` 只保护数值/tool fact,布尔 fact(True/False 同信号分,新者胜)无保护 → compact 污染路径仍活着。
4. **quality 读路径版本过滤不一致**:`quality_scores_for_runs` 只认当前 scorer_version,`quality_inspection_for_run` 不过滤版本 → scorer 升级后同一 run 上方卡片"未上报"、下方面板有旧分。这是"UI 与 fact 明细不一致"的直接根因之一。
5. **触发率口径**:`true_rate/scoreable_rate/count` 分母 = 全部 fact 行(含 missing);`pass_rate` 分母 = passed+failed。quality fact 缺分时仍写一行 passed=None → "fact 全 pass 但触发率低"是两种分母并排展示的产物,不是数据错。

## 其它高价值点

- metric 聚合查询不按 binding 的 fact_version 过滤,fact 版本推进后新旧版本行同时进分母(潜在雷)。
- `write_metric_results` 不过滤 run 状态,failed/cancelled run 的 fact 全部进聚合分母(产品口径待定)。
- backfill 快路径与在线路径多 thread 口径不一致:快路径只取 target_thread_id 单值,在线路径对多 thread 求和。
- MySQL 原生 upsert 分支(on_duplicate_key_update)在测试里零覆盖,CI 全 SQLite。
- 结构化观测 8 张表仍是 DELETE+INSERT(1205 锁等待同构模式);checkpoint_id 可空使 4 张表复合唯一键对 NULL 失效。
- `backfill_test_center_v2_metric_results.py` 无 workflow 入口(纯手动)、无任何测试。
- UI 不展示 fact evidence source(thread_analytics_precompute vs artifact.metrics)。

**Why:** Test Center V2 连续发生积分口径错误、fact 重复行、quality UI 不一致等事故,需要系统性定位根因而非逐个打补丁。

**How to apply:** 修积分/fact 相关 bug 时先看本页 P0 清单——尤其:① 任何"重算后还是旧值"先查 credit_source 门控与 normalize 别名扩散;② 任何去重/唯一键操作先确认 b6729a509 是否已合入、migration 是否真的在生产执行成功(跑 `audit_test_center_v2_uniqueness.py` 验证);③ 不要在 pointer artifact 状态下触发全量 fact 重算(cancel_run 路径)。
