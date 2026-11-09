---
name: evolve-maxwell-adapter-preset-lifecycle
type: reference
created: 2026-11-09
updated: 2026-11-09
tags: [maxwell, evolve, a2a, adapter, preset]
links: [evolve-user-manual-entrypoints]
---

# Maxwell 通用 A2A Adapter 与 Preset 生命周期

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
