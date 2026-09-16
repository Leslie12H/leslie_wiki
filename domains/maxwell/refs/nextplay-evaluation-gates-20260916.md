---
name: nextplay-evaluation-gates-20260916
type: reference
created: 2026-09-16
updated: 2026-09-16
tags: [maxwell, evolve, nextplay, benchmark, tuning, d1-d5]
links: [nextplay-runner-thread-preset-binding, nextplay-benchmark-import-audit-20260915]
---

# Nextplay 评测与调优验收入口

2026-09-16 的完整核验记录在 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evaluation-gates-20260916.md`，包括真实 Run 标识、源码锚点、未验收门槛和本轮终态。最新状态从 [Work](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263) 与 [Runner 修复 PR](https://github.com/world-sim-dev/nextplay-eval/pull/6) 重新读取，不复用历史状态。

**Why:** 允许启动、真实执行、证据充分、业务评分、候选应用与统计比较是不同验收。平台已具有的方法或已同步的 Skill，不证明当前 Work 使用了它们。把结果不完整统称远端失败，会让业务交付不足无法进入质量评分。

**How to apply:**

- 查 Nextplay `maxwell-runtime/src/nextplay_runtime/runner.py` 的 captureComplete/status/cleanup/ok，以及 `evidence.py` 的 applied 和 bounded_trajectory；区分采集故障、业务未交付与清理问题，按当次证据逐一归因。
- 从冻结 JudgeSpec 核对维度和 evidencePath；D1–D5 权威源为 nextplay-eval `datasets/storyline-6x6-v1/evaluation-catalog.yaml`，保留 criterion、权重、critical、硬门槛和 incomplete 语义。过程维度需完整参数/结果；轨迹索引不能当正文。
- 从 Work 资产审计业务依据、coverage_plan、critique 与 judge_calibration_report，避免把技能存在当作方法已运行。原评分器与平台评分器须对同一证据校准，不能用字段映射代替语义等价。
- 同条件调优先确认实际候选物化、应用回执与配置哈希；更换 Judge 后两侧重判或重跑，不直接比较不同标准的分数。外部目标能力未知应实证验证，不按 external_a2a 标签断言不可调优。
