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

- 原任务与候选执行入口：[Nextplay Work / Run #5](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_e251ccddd62ae257f6a28636e42361c1)。候选 live 执行与重判沿用这一 Work；当前状态读取 Run/Trial，不由任务阶段或启动记录推断。
- baseline 可通过 Nextplay SDK 的 `AgentSnapshot.capture` 稳定读取完整 Preset、Prompt 与 Skill 包，再与冻结 `expectedSnapshotId` 比对。源码指针：nextplay-eval `maxwell-runtime/src/nextplay_runtime/snapshot/service.py`。凭据仅用已有业务授权，不写入知识库；不把 live latest 内容直接冒充原冻结版本。
- 正式比较门槛指针：maxwell-ai `services/evolve-server/internal/modules/evolve/application/queries/compare_runs.go` 与 `commands/optimization_methods.go`。核对 evaluationMode、执行器、Case/Judge、冻结模型配置、重复与聚合等。`evidence_only` 和 `a2a_live` 不可直接正式比较。
- 若复用两侧产物进行同口径重判，须分别保留产物来源的 live Run、冻结 Variant 和应用回执。evidence-only 比较通过不代表它验证了实际候选应用；仍要检查源 live EvidenceSet 的 applied、配置哈希和快照漂移。
- Work 一旦进入 tuning，启动要求 Candidate；Candidate Variant 又不能等于 base Variant。需要新 live baseline 时，应在切换前准备好，或明确处理工作流能力缺口，不伪造不同 Variant/候选记录来绕过。
- 本次单题三维 baseline 已满分，候选只是固化交付回读行为的回归守卫。样本量一条且没有业务失败，不能把同分、登记成功、Run completed 或缺失输出说成优化有效。

本轮候选、完整 Prompt 和启动元数据的本地审计目录：`/private/tmp/nextplay-candidate-loop-20260916/`。权威最终状态以平台运行记录为准，临时目录不作为长期依赖。

## 2026-09-16 后半程核验发现

**Why:** 同一候选产物的 live 判卷与重判得分不同，而“写入回读一致”只证明保存的内容未变，不保证业务内容自身正确。执行、Judge 可靠性与决策报告落库需要分别验收。

**How:**

- 执行证明入口是源 live Run #5 的 Trial/Attempt 与外层 Thread `thr_01M2N04PZBZYFGRPTC2KFMSQST` 文件。用 `trial-evidence.json` receipt 的 applied、Variant/Case/input/invocation/snapshot 绑定，交叉核验实际临时 Preset 的 Prompt 和 `result.json` captureComplete/cleanup；内层临时 Thread 清理后 404 不能单独当执行失败。
- 对比入口：[候选重判 Run #6](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_b11ec9dd5af24fb7670022a6d8d59b1b)，与 baseline Run #4 `run_7a4a394283944d9226d2c7ef054d8a67` 同为 evidence_only。重判只读原证据；任何加分都不意味着目标缺陷已修复。
- 此次 `reference_consistency` 在同一证据上 4→5。直接读取源 `route.json` 能核实成功结局 episode-004 的 metadata.previous_nodes 与入边冲突；调优 Agent 曾错误解释成另一个节点，必须以字段原文纠正。保留两次判卷，未校准 Judge 与单样本不能支持优化有效结论。
- 过程结果不能只读 Runtime 工具 success/进程 exitCode=0：Nextplay 写入脚本曾返回业务 status=rejected；需读 committed/errors、官方校验及正式产物。初始化 schema 错误和事务拒绝虽由目标自行恢复，仍应计入过程质量观察。
- 通用 Agent 若只能读取 Trial assessment 投影，不能对其重复查询不存在的 EvidenceSet execution 字段。用 compare_runs 的源 live variantApplication 摘要验证 appliedAttempts/attemptCount/proven/drift；原始 receipt 使用授权外层文件读取。应补通用 Artifact/Attempt 内容入口，避免假称已读 CAS。
- 决策报告实际冻结错误与修复入口：[maxwell-ai PR #305](https://github.com/world-sim-dev/maxwell-ai/pull/305)。根因在 `application/evaluation/processor.go` 给 Scorecard 写顶层 usage，而 `application/commands/optimization_methods.go` 的严格 frozenScorecard 结构未接收；不是 Judge strictJudgeOutput 嵌套内容坏了。保留原冻结产物，修复读取契约后重试报告，无需修改分数或重跑目标。
