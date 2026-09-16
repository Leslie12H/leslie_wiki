---
name: nextplay-runner-thread-preset-binding
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [maxwell, evolve, nextplay, runner, judge]
links: [nextplay-benchmark-import-audit-20260915]
---

# Nextplay 外层完成不等于业务评测完成

核验入口：[失败 Trial 所属 Run](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_b45e0eedb5fdce022c574e0528524c13)；外层执行器任务 `run-6429237a997a33dc518e2cba056a6f12`，Thread `thr_01M2J0C7NKKTZQPNAWMXMDYK38`，影游 a2a 业务。此处存历史核验指针，最新状态需重新读取。

**Why:** 外层 Agent 可以正常结束并交付结构化失败结果；不能把外层 TASK_STATE_COMPLETED 或 EVOLVE Run 结束视作被测业务成功。2026-09-16 查到的该次 result.json 在创建内层 Thread 时返回 HTTP 400，traceId `166cc0bef07f4a9a667d012b2c0126be`，尚未开始业务执行。Maxwell 提交 `f8504478f` 的 runtime/application/threads.go 要求创建时绑定 Preset；nextplay-eval `a6c52f6` 的 CandidateRunner 缺少绑定，而普通 Executor 路径已绑定。

**How to apply:**

- 对照 nextplay-eval 的 `maxwell-runtime/src/nextplay_runtime/runner.py`、`executor.py` 和 `maxwell-cli` ThreadService，核对创建请求的 clientMetadata.presetId 必须是物化后的临时 Preset。不能依靠后续消息中的 presetId 覆盖 Thread 绑定。
- 从外层 result.json、内层 Thread/Run、证据完整性到 Trial 判卷逐级核验；保留原错误记录和未完成采集的资源。离线修复测试通过还需更新外层实际使用的运行包并重新运行，不能用服务部署替代 Runner 包生效证明。
- 从上述 Work 冻结的 `artifact_c0eef3b78bacd2213b04d72783624962` 读取 JudgeSpec，并对照 nextplay-eval `datasets/storyline-6x6-v1/evaluation-catalog.yaml` 的 `manual-eval-d1-d5-v1`。维度、尺度、权重、critical、证据与聚合必须一起对齐；仅 finalState 评分不能代表轨迹检查。
- 方法库能力存在不等于该 Work 调用了它：从业务知识、discovery_report、coverage_plan、critique 与 judge_calibration_report 的产物/调用记录审计。schema-fingerprint 是结构校验，不能替代语义出题和人工判卷校准。


## 2026-09-16 旧业务 Skill 导致能力误判

核验入口：[截图对应会话](https://agent.sandaii.cn/evolve/agent/agent_session_9848b06564887cb64011b9f8b954bcf4?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263)，展开 11:43:30 的 SKILL_LOAD `call_67dccecbdd184975a706d64f`。该次激活 target-recon 的 scope=business、owner=当前业务、stage=main、updatedAt=2026-09-09T11:24:05Z。instructionHash 与 Maxwell 提交 f3dea511 的 `agent-resources/skills/target-recon/SKILL.md` 完全一致，6137 bytes；此为历史调用证据，后续生效版本需重新核对。

**Why:** 旧 Skill 明确教 Agent 按预检第 4 步判断 level、把 receiptKind=none 推成仅 /text，并断言 external_a2a 没有 resolve_baseline；服务代码和 main 资源已演进，在线业务 Skill 未同步会把正确的连接检查结果解释错。服务发布成功不等于数据库或业务命名空间中的 Agent 资源更新成功。

**How to apply:** 对照当前 `executorprobe/probe.go`、`commands/baseline.go`、`runner_baseline.go`、`business_basis.go` 与 target-recon/optimization-strategy/evolve-tuning-agent 资源。区分外部受信控制端点的源码发现、Runner prepare-baseline 的快照捕获与 runner 参数的绑定生成；不能从 kind 或 unknown 推断不能调优，也不能从代码支持推断当前配置和真实候选已经验证。更新时核对实际 scope 和解析优先级，并在会话中重新激活后读取 instructionHash；仅更新共享同名资源不证明这个业务调用生效。截图中的错误选项不应由用户替平台判断技术能力来补救。


## 2026-09-16 修复与资源同步核验

源码入口：[nextplay-eval PR #6](https://github.com/world-sim-dev/nextplay-eval/pull/6)，修复提交 `b76b2fd96727dddf79523b4d4142c08c88138053`。创建内层 Thread 时绑定本次物化 Preset；11 个基准单测和打包测试通过。在线 Runner Skill 位于影游 a2a 业务，资源 ID `a306e625-b822-408c-a1ee-9190d11088eb`；当次导入只改变 assets/runtime.zip，导出回读的五个文件与部署输入一致，runtime.env 原样保留。此为资源部署证据，不是新一次业务执行成功证据。

**Why:** EVOLVE 会话中的“当前业务”可能是调优 Agent 的共享资源业务，不能从用户当前打开的 Nextplay 页面推断资源归属。此次确认实际调优资源归属“Agent 调优”业务 `74d72fe4-e4f0-46ad-958a-da68d9fdd651`，Preset `746f0d19-f019-4b04-b09e-78305744e603`。其 10 个 Skills 与核心 Prompt 已按当次 main 的 agent-resources 同步，37 个 Skill 源文件通过导出逐字节核验，Prompt 经重新加载比对通过；名称、Slug、资源身份与 Preset 引用保持。

**How to apply:** 优先从真实执行 Preset 的资源引用定位命名空间，再按同 Slug 覆盖并导出核验；不要只更新业务目标页面下的同名资源。线上 Runner 带部署配置时先私下备份，并只向同一 Skill 原样保留配置，不写入 Git 或交付包。已加载旧指令的会话需重新激活 Skill，完整 Prompt 以新会话复测为准；不能用资源保存证明历史模型上下文已被改写。后续须用新 Run 核验内层执行、正式证据及判卷，旧失败 Run 和冻结 Judge 不会因资源更新自动补跑或切成 D1–D5。
