---
name: evolve-candidate-editable-baseline-and-regrade-comparison
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [maxwell, evolve, nextplay, candidate, baseline, comparison]
links: [evolve-runtime-judge-review-20260916, nextplay-runner-thread-preset-binding]
---

# 候选需可编辑基线，证据重判需同口径比较

**Why:** 2026-09-16 续办 Nextplay 原任务时，EVOLVE Agent 能读满分判卷和执行证据，却读不到完整 baseline systemPrompt。冻结 Variant 只含 Runner 的 Preset/快照身份；业务产物不等于可编辑配置。另一方面，真实执行成功但 Judge 报错的 Run 与成功的 evidence-only 重判是两条不同运行记录，不能合并叙述成一条成功基线，也不能直接与新 live Run 宣称同条件可比。

**How to apply:**

- 原任务与候选执行入口：[Nextplay Work / Run #5](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_e251ccddd62ae257f6a28636e42361c1)。2026-09-16 19:37 CST 该候选已启动；是否执行、实际应用及评分成功，必须重新读 Trial/Attempt，不由启动记录推断。
- baseline 可通过 Nextplay SDK 的 `AgentSnapshot.capture` 稳定读取完整 Preset、Prompt 与 Skill 包，再与冻结 `expectedSnapshotId` 比对。源码指针：nextplay-eval `maxwell-runtime/src/nextplay_runtime/snapshot/service.py`。凭据仅用已有业务授权，不写入知识库；不把 live latest 内容直接冒充原冻结版本。
- 正式比较门槛指针：maxwell-ai `services/evolve-server/internal/modules/evolve/application/queries/compare_runs.go` 与 `commands/optimization_methods.go`。核对 evaluationMode、执行器、Case/Judge、冻结模型配置、重复与聚合等。`evidence_only` 和 `a2a_live` 不可直接正式比较。
- 若复用两侧产物进行同口径重判，须分别保留产物来源的 live Run、冻结 Variant 和应用回执。evidence-only 比较通过不代表它验证了实际候选应用；仍要检查源 live EvidenceSet 的 applied、配置哈希和快照漂移。
- Work 一旦进入 tuning，启动要求 Candidate；Candidate Variant 又不能等于 base Variant。需要新 live baseline 时，应在切换前准备好，或明确处理工作流能力缺口，不伪造不同 Variant/候选记录来绕过。
- 本次单题三维 baseline 已满分，候选只是固化交付回读行为的回归守卫。样本量一条且没有业务失败，不能把同分、登记成功、Run completed 或缺失输出说成优化有效。

本轮候选、完整 Prompt 和启动元数据的本地审计目录：`/private/tmp/nextplay-candidate-loop-20260916/`。权威最终状态以平台运行记录为准，临时目录不作为长期依赖。
