---
name: evolve-maxwell-adapter-preset-lifecycle
type: reference
created: 2026-11-09
updated: 2026-11-09
tags: [maxwell, evolve, a2a, adapter, preset]
links: [evolve-user-manual-entrypoints]
---

# Maxwell 通用 A2A Adapter 与 Preset 生命周期

> 2026-11-09 用户修正方案：Maxwell Agent 使用既有原生接入，同时具备评测和调优。外部 A2A Runner 是历史接法；新方案见末节。

**Why:** 一套 Adapter 可以复用 Maxwell 的目标发现和运行机制。按次候选替换、创建或修改持久 Preset、将新配置切到真实入口分别影响实验、配置和流量。连接可用、候选回执、人工采纳及真实入口读回分别提供不同的证据。

**How to apply:** 2026-11-09 只读分析基于 Maxwell 主线 `74cd1eb2e35b242828130954baeebe215ca29aff`。若继续推进，先核对以下代码入口与对应环境的发布版本，再决定正式契约及授权范围。

- 普通 A2A 与内部评测分别查 Maxwell 的 `services/agent-server/internal/app/api/http/a2a_api.go`、`internal/app/integration/runtime/a2a/card.go`（同服务）及 `services/evolve-server/internal/app/integration/maxwellexecutor/adapter.go`。核对 Agent Card 声明、执行凭据和候选拒绝分支。EVOLVE 接收端协议沿 `docs/evolve-maxwell-variant-apply-contract.md` 与 `services/evolve-server/internal/app/integration/a2a/runner_preparation.go`；区分草案、客户端已具备的能力与接收侧落地。
- 按次替换优先复用 Maxwell 的受信执行快照，查 `services/agent-server/internal/modules/runtime/ports/runtime_control.go`、Runtime 的 Prompt 与 SkillLoader，以及续行/重试路径。确认模型和 Skill 实际消费的是冻结内容，并另查 Preset 级 Store、外部工具及渠道的写入隔离。冻结运行配置与变更建议、评分分别留证。
- 持久配置沿 `services/agent-server/internal/modules/studio/agentpreset/transport/http/routes.go` 与同模块 `application/service.go` 核对现有复制、窄绑定修改、并发版本检查、锁定及软删除保护。复制 Preset 仍可引用共享资源，候选编辑前应先隔离资源或用不可变快照。真实入口的路由归入口所有者，例如飞书查 `services/channel-server/providers/feishu/management/preset_routing.go`。采纳、打包和安装的证据边界查 `services/evolve-server/internal/modules/evolve/application/commands/candidate_publication.go`。
- 设计讨论方向为一个授权的 Maxwell 候选 Runner 复用 EVOLVE 的 A2A 准备和执行契约，先完成 Prompt/Skill 隔离复测，再由 Maxwell 管理面提供独立授权的预览、应用、读回与回滚。扩到模型、工具、后端或删除前分别查依赖、凭据和副作用。此处记录设计推导与查证入口，实施和验收状态以具体执行记录为准。

## 2026-11-09 Nextplay 候选 Runner 实现对照

**Why:** Nextplay 的隔离试跑会真正创建目标业务内的临时资源。A2A 外层 Thread 负责交付和留证，内层目标 Thread 使用独立 Preset。需要按两层分别核对清理，候选资源的删除也不能推断为源 Agent 配置被回滚。

**How to apply:** 源码对照 [Nextplay 主线 5408ebc](https://github.com/world-sim-dev/nextplay-eval/tree/5408ebc5a264db463d4435743993c154bae0479c)。沿 `nextplay-a2a/README.md`、`maxwell-runtime/src/nextplay_runtime/materializer/service.py`、同目录树的 `candidate.py`、`configuration_resources.py`、`runner.py` 与 `recapture.py` 检查两套凭据、独立 Prompt/Skill 导入、Preset copy 后换绑、哈希与实际绑定回读，以及停稳并保全原件之后的租约清理。区分已有 Skill 包替换和 Preset 的 Skill 成员增删；v3 冻结文件替换支持已有 Skill 目录下声明的文件，缺项不表达删除。

复核结束状态时看 `result.json` 的 `captureComplete`、`cleanup` 与 `.state/leases`，不要从 A2A 外层文字回复判断。停机或取证未确认会保留内层 Thread 及配置；清理 API 出错保留资源 ID 和错误，不能视为回收完成。正常路径的临时 Preset 删除语义沿 Maxwell Preset Controller 的 `SoftDelete` 核对。历史真跑例见 [2026-09-16 Nextplay 单题回执](/Users/leslie/Downloads/nextplay-evaluation-20260916/loop-verification.md:29)，当前部署版本和单次试跑资源状态须独立回读。

## 2026-11-09 通用 Runner 抽取与 Skill 绑定改造方案

**Why:** Snapshot、SDK、临时资源和生命周期可以脱离 Nextplay。Case 解析、项目文件、媒体、判卷和展示仍有业务语义。现有冻结资源是覆盖层，省略文件会继承原 Skill，无法表达解绑。

**How to apply:** 源码对照 Nextplay `5408ebc5a264db463d4435743993c154bae0479c` 与 Maxwell `cbb755d7fbfcba1fbafbd6980787966711275cfb`。抽取边界沿 Nextplay `snapshot/`、`materializer/`、`executor.py`、`request.py` 和 `evidence_bundle.py` 查；保留 Nextplay 包装入口，通用入口先跑带独立输入摘要的文本 Case。EVOLVE 的 `application/execution/runner_result.go` 从 Case 对象读取摘要，`integration/a2a/runtime_result.go` 校验 v3 证据包；不能靠改名字把原生文本输入或 Nextplay 业务投影视为通用接入。

建议复用 `preset-runtime.json` 表达冻结的最终 Skill 组件列表，用既有授权资源原件提供新增 Skill 包，回读实际临时 Preset 绑定与包内容后才记录应用回执。兼容旧 Variant 的缺字段行为，区分显式空列表与省略；移除仅限目标副本绑定。检查 `candidate.py`、`configuration_resources.py`、`runtime_config.py`、物化及回执联动，按选入的最终组件导入而非始终遍历源快照。EVOLVE 的 `application/resourcecontent/source_runner.go` 当前将 preset_config 视为只读，首期可用现有人工确认的 Variant 草稿入口，自动创作另验授权与能力声明。该节是设计，尚未实施。

## 2026-11-09 通用 Adapter 的源码和部署归属

**Why:** 通用候选生命周期依赖 Maxwell 管理 API，适合由 Maxwell 维护；Nextplay 的 A2A Skill、批跑 CLI 和评测服务镜像都是现有 Python 代码的消费者，直接移动整棵目录会同时改变多个入口。

**How to apply:** 查 Maxwell 的 `tools/maxwell-cli/maxwell.py` 与 `docs/operations/agent-tools-release.md`，区分桌面 CLI/安装器和候选 Runner 构建。查 Nextplay 的 `nextplay-a2a/build.py`、`eval-runner/pyproject.toml`、`eval-service/Dockerfile` 和 `eval_service/execution_worker.py`，确认三条消费路径使用的代码及版本。建议以 Maxwell 仓库的独立工具包承载共享 Python 核心和通用包装，继续以受限 Maxwell A2A 包装 Preset 运行，业务凭据独立配置。Nextplay 保留业务层，在构建期消费固定 Maxwell 版本及摘要，切换前回归 A2A、批跑和服务镜像。此处是归属建议，当前包仓与部署事实以对应版本核对。

## 2026-11-09 EVOLVE Preset Runner 命名与目录建议

**Why:** 用户希望避免以 Maxwell Adapter 泛称这套能力。它的主职责是供 EVOLVE 执行 Preset 基线及候选、留存应用证据和回收临时资源；基线也走 Runner。

**How to apply:** 现建议叫 EVOLVE Preset Runner，代码在 `services/evolve-server/preset-runner/` 同域独立打包，更新前节工具目录建议。沿 `services/evolve-server/docs/executor-kit/README.md` 查执行连接与合约，沿 `Dockerfile.release` 和现有 `internal/app/integration/maxwellexecutor` 核对服务端 Go 执行与独立 Runner 的边界。Runner 通过 `external_a2a` 接入，继续由授权的包装 Preset 运行，真实 Preset 资源归 Maxwell 管理面；Nextplay 在构建期锁定共享包版本。命名和目录是方案建议。

## 2026-11-09 Maxwell Agent 原生评测与调优

**Why:** 用户明确要求所有 Maxwell Agent 使用同一个 Maxwell Agent 接入类型，评测和调优都是平台原生能力。独立登记 A2A 调优 Runner 的方案与这个产品入口冲突。

**How to apply:** 沿 Maxwell 主线 `10ab8808f1aa5508d9f76341bd3523c0904f7b3c` 查 `maxwellexecutor/adapter.go` 的候选拒绝分支、`a2a/runner_preparation.go` 的 external_a2a 门槛与 Studio 的 `executorRouting.ts` 和 `ExecutorPathsPanel.tsx`。建议扩展现有原生执行器，在同一登记下处理当前 Preset 普通运行、同冻结基线与候选的隔离运行。复用 `maxwellpreset/baseline.go` 的资源读取及 Runtime 受信执行快照，补安全应用通道、实际回执、隔离范围和原生能力投影。普通调用身份保留既有权限边界；临时管理和正式采纳须分开。旧 A2A 路线与历史/在途证据按原冻结身份读取。此处是用户修正后的产品目标及实施建议，未改业务代码。
