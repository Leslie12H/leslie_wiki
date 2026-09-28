---
name: nextplay-runner-thread-preset-binding
type: pitfall
created: 2026-09-15
updated: 2026-09-28
tags: [maxwell, evolve, nextplay, runner, judge, runtime, contract]
links: [nextplay-benchmark-import-audit-20260915, nextplay-real-run-contract-review-20260914, evolve-demo-runbook-20260914]
---

# Nextplay Runner 创建 Thread 遗漏 Preset 绑定

## 2026-09-15 历史失败与证据入口

本次有界基准在创建临时 Preset 后、保存内层 Thread 前失败：`POST /api/runtime/threads` 返回 HTTP 400 / `invalid request`。EVOLVE 记录 `remote_failed`，没有质量分数；内层 Thread/Run 均未创建，`applied=false`、`captureComplete=false`，没有目标文件产物。不能把这次失败解释为 Nextplay 创作质量差、Judge 不通过或候选未改善，也不能据此前成功运行断言当前链路兼容。

- [本次 Work / Run](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_b45e0eedb5fdce022c574e0528524c13)：2026-09-15 约 15:44（Asia/Shanghai）启动；Trial `trial_4794e8ff7a5bb6e2fca114e54ec266fb`，Attempt 1。
- 授权外层 UI 回读：Thread `thr_01M2J0C7NKKTZQPNAWMXMDYK38`、Run `run-6429237a997a33dc518e2cba056a6f12`；HTTP traceId `166cc0bef07f4a9a667d012b2c0126be`。
- 外层原始文件入口：`evolve-results/00d916271c73a27b906ec65af7228563d5488a2afac0892dc97b29f90a8764f0/trial-evidence.json`。本次回读证据摘录在 `/private/tmp/nextplay-e2e-20260915/baseline-failure-evidence.json`，授权、冻结条件和验收范围在同目录 `acceptance.md`。文件路径是历史定位线索，后续应回到原 Work/外层文件核实可读性。
- 详细源码因果、本地修复及恢复边界：同目录 `thread-create-root-cause-and-fix.md`；它记录的是本地可审查修复，不能作为共享 Runner 已发布或真实恢复成功的证据。

本次未另行提取失败 HTTP 请求的原始 body，也未重复 POST 复现；诊断依据为上述真实失败、已核对 Runner 的实际发包代码与服务端对应拒绝分支。

## Why

**Why:** Runtime 将 Preset 固定为 Thread 创建时的身份，独立 CandidateRunner 仍沿用只传用途、模式和候选标识的旧创建方式。临时资源物化成功不代表 Thread 已绑定到它们；后续消息携带 Preset 也不能补救一个已在创建入口被拒绝的 Thread。Dataset 执行器与独立 Runner 分别组装创建参数，前者已带绑定，不能用它的成功覆盖后者。

本次审计锚点是 Maxwell `15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9`、Nextplay `a6c52f63febc2c64fec4b1e97fb2ad20e4266a46`；它们不是永久在线版本声明。强制创建时绑定由 Maxwell [提交 f8504478](https://github.com/world-sim-dev/maxwell-ai/commit/f8504478f15e0392151acde0ec4a9270d88e4351) 于 2026-09-15 08:43:49 +08:00 引入，已包含在本次 Maxwell 审计提交中。

代码从以下入口核对，不在 Wiki 复制实现：

1. Nextplay [CandidateRunner 创建 Thread](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-runtime/src/nextplay_runtime/runner.py#L93-L104)：先物化并获得临时 Preset，再创建 Thread；该提交未传 `client_metadata.presetId`。
2. [ThreadsService.create](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-cli/src/maxwell_cli/services/threads.py#L25-L34) 原样放入 HTTP `clientMetadata`；[Dataset executor](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-runtime/src/nextplay_runtime/executor.py#L88-L98) 可对照其已绑定物化 Preset 的路径。
3. Maxwell [threadCreationMetadata](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/modules/runtime/transport/http/controller.go#L169-L185) 将 `clientMetadata.presetId` 提升为规范绑定；[ThreadAgentPresetID](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/modules/runtime/domain/thread.go#L50-L56) 只读取该绑定。
4. [CreateThread 准入](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/modules/runtime/application/threads.go#L61-L82) 在持久化前拒绝缺失 Preset；[HTTP 错误映射](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/foundation/httpapi/response/status_error.go#L30-L31) 将其输出为通用 400 / `invalid request`。既有入口回归见 [runtime_api_test.go](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/app/api/http/runtime_api_test.go#L1077-L1092)。

## How to apply

**How to apply:**

- 遇到“已建临时资源、尚无内层 Thread”的 400，先关联精确 trace/Attempt，再核对调用方创建 payload 和部署版本的创建契约。不要先改业务 Prompt、Judge 或扩大重试。
- 修复调用方时，绑定本次物化得到的临时 `agent.preset_id`，保留用途/模式/候选标识；不能使用源基准 Preset 或外层 A2A Preset 代替。聚焦回归同时覆盖 baseline 和 candidate 两条创建路径，并核对后续派发仍使用同一临时 Preset。
- 发布/替换共享 Runner 是独立步骤，须按当轮授权执行并导出核对正式包与版本；本地测试、ZIP 构建或平台部署成功都不能代替真实恢复验收。
- 本次没有可 resume 的内层 Thread/Run。恢复能力从 Nextplay [CLI 的 start/run/status 分支](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-runtime/src/nextplay_runtime/cli.py#L39-L86) 核对；不得删除失败 result/process/lease 强迫同一 invocation 重跑，或手建 Thread 冒充原 Attempt。沿平台支持的新 Attempt/Run 路径重试，保留失败历史。
- 失败后保留的临时资源须按同次 result/lease 清点并核对引用，清理需另有授权；不能依据标题或“临时”字样删除源基准、外层 Preset 或证据 Thread。
- 恢复后重新验证内层 Thread/Run、实际配置应用回执、产物全文和判卷，再用固定 CaseSet/Judge/运行策略做真实 candidate 比较。此次历史证据归档时，恢复基准、候选比较及 DecisionReport 均未完成，不能标为已修复上线或闭环通过。

相关背景见 [2026-09-14 真实评测契约复核](nextplay-real-run-contract-review-20260914.md) 与 [演示讲稿的验收边界](../refs/evolve-demo-runbook-20260914.md)。

## 2026-09-16 后续核验：外层完成与业务评测边界

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


## 2026-09-16 线上单条回归：绑定恢复，目标行为另有问题

核验入口：[Run #2](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_78442622b7187d29a30ce175fa6aac4d)。本次沿用原冻结用例、基准 Variant 和三维 Judge；外层任务 `run-5144b89ac560fb2f38ad0587a7d31193`，Thread `thr_01M2MAE789G04YGGNH0KJGDTYF`。

**Why:** 线上导出包通过 11 个契约/生命周期测试后，仍需真实执行验证创建链路。本轮内层 Thread `thr_01M2MAH514VDYSQKBD0HJK1TT0` 成功创建并绑定临时 Preset `77b5c09f-3548-410a-97ae-167af74d0ca9`；基准 snapshot 与首次失败 Run 相同，内层 Run `run-7a2510bbccf3f365f7d1af12ae31c1db` 真实执行，原 HTTP 400 未复现。

目标随后违反题目明确的文字限定，于 13:23:55–56 提交三个 media 图像生成调用。Codex 在发现后停止内层运行，终态为 TASK_STATE_CANCELED，三调用均记录 user_stopped_run；这不能证明供应商侧已提交任务未产生费用或产物。Runner 最终 ok=false、captureComplete=false、terminationReason=run_canceled，正式五文件均未捕获，按既有失败保留策略留下本轮临时资源。EVOLVE Trial `trial_e556be9dd15408a56b43409d35b59b28` 记录 remote_failed、未判卷，不能声称整轮评测成功。

**How to apply:** 判断“修复是否生效”和“业务评测是否成功”必须分层：本次绑定故障已用真实内层 Thread/Run 证明恢复；后续文字范围违反应根据目标输入、工具参数和回执处理，不能归咎于已修复的创建契约，也不要静默修改固定基准或原 Case 让结果看起来通过。先确认运行已停止，再处理保留资源；不在检查中删除原现场。
