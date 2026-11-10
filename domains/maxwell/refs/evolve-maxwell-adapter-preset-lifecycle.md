---
name: evolve-maxwell-adapter-preset-lifecycle
type: reference
created: 2026-11-09
updated: 2026-11-10
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

## 2026-11-09 原生接入缺口复查

**Why:** 统一入口并不能证明候选可运行、隔离或可比。冻结 Skill 的配置与运行可见目录不是同一集合，新 Thread 也不会隔离 Preset 分区状态。旧的 Nextplay 输入覆盖不能代表 Maxwell Agent 通用输入覆盖。

**How to apply:** 以 Maxwell `10ab8808f1aa5508d9f76341bd3523c0904f7b3c` 为本次只读源码锚点，后续复核以下边界。

- 通用输入与工作流：查 EVOLVE 的 `maxwellexecutor/input.go`、`commands/logical_executor.go`、`commands/tuning_baseline.go` 和 `resourcecontent/source_runner.go`，把原生能力落实到准备、资源编辑、候选执行和比较。核对现有任务保存的身份；分析可从会话开始，重放与评测是后续条件。
- 快照与授权：查 `maxwellpreset/client.go`、`baseline.go` 的托管 Key 与资源读取权限差异，以及逐份捕获一致性和 Skill 正文是否实际加载。可信服务应绑定 Business、Preset、冻结资源与执行身份。普通 Thread 元数据不授予候选应用权限。
- 生效与隔离：查 Agent Server 的 `runtime/extensions/skillloader/middleware.go` 是否仍合入动态来源，及 `app/integration/runtime/storeadapter/runtime.go` 的 Preset 分区。验收需证明 Skill 解绑后实际目录/读取符合语义、同一业务普通会话看不到候选状态，并单独核对工具、子 Agent 和外部副作用。
- 恢复与比较：查 EVOLVE `maxwellexecutor/adapter.go` 的 checkpoint、`application/comparison/receipts.go` 的候选证明与现有采纳门禁。续行、响应丢失、取消和切换后的历史重放按冻结执行身份；基线候选采用同一评测条件。生效、验证、持久应用和回滚各有独立证据。上述为方案缺口审查，未实施。

## 2026-11-09 临时 Preset 原生试跑方案

**Why:** Nextplay 的物化顺序可复用。新 Preset ID 隔离现有按 Preset 分区的状态，但原生复制也复制工具配置，且软删除不会自动清理 Store。统一原生入口需要额外的租约归属、执行权限与回收边界，才能对正常、异常和在途试跑作同一解释。

**How to apply:** 只读锚点为 Maxwell `10ab8808f1aa5508d9f76341bd3523c0904f7b3c` 与 Nextplay `5408ebc5a264db463d4435743993c154bae0479c`。查 Nextplay `materializer/service.py`、`runner.py` 与 Maxwell 的 Preset Copy/SoftDelete、Runtime Thread 删除和 Store Binder。方案在 Maxwell Agent 的同一登记下保留普通评测，调优的每个基线/候选 Attempt 持有独立临时 Preset、私有 Thread 及资源。EVOLVE 管冻结输入、调度与证据，Agent Server 管受限物化、实验执行策略和精确回收；继承可写外部工具配置需阻断或使用获授权测试目标。

待评审契约为 Agent Server `PUT/GET /api/internal/evolve/trial-environments/{invocationId}` 与 `POST .../release`，同业务托管执行身份用专用试跑权限，另提一张持久租约表保护物化和异常回收。原生调优复用 EVOLVE 现有登记与 Run 入口，增加读取侧 readiness 及 Skill 绑定提案能力；旧任务按原冻结路径，新任务冻结原生试跑协议版本。验收分别覆盖自然入口、SP/Skill 实际消费、状态与外部写入隔离、取消/重启/收证失败、旧 Nextplay A2A 恢复和历史读取。具体接口、权限和 DDL 须在实施前确认，本节不表示已修改或上线。

## 2026-11-09 复用现有管理接口的 EVOLVE 试跑租约

**Why:** 用户询问把租约、恢复与清理归 EVOLVE，避免给 Agent Server 新增租约 HTTP 和表。现有资源管理操作已能创建和回收已确认 ID 的临时资源；需要单独区分丢失创建回执、可见性、广域写权限与 Store 回收。

**How to apply:** 首期推荐复用 Nextplay 调用的原生 CRUD，在 EVOLVE `maxwellexecutor/journal.go` 所在持久存储用同一业务与 invocation 身份记录写入意图、响应和逐资源清理进度，配合现有跨进程锁与新增受限巡检。核对 EVOLVE `composition.go` 和 Worker 卷在目标环境是否持久且共享。沿 Agent Server 的 Prompt `Save`、Skill `Import` transport 以及 Preset 活跃名称唯一索引核对恢复：Prompt 与新导入 Skill 由服务端分配 ID，不能假设客户端给 ID 或重发即幂等。发出前保存可回查归属标记；响应未知时通过同业务、精确标记及内容哈希查证，无法唯一归属则保持待核对。Thread 与消息分别复用已有创建幂等键和 actionId。

试点须由业务授权独立 Key 的现有读写权限，并限制外部副作用。普通 CRUD 的业务级写范围、业务目录可见性和按 Preset 分区 Store 的回收，与新增服务端租约方案的强保证不同。不能以名称作为授权或删除依据，不能把 Preset 软删除回执称作 Store 全部回收；只有实测缺口需要服务端强制约束时再评审针对性接口或权限改动。此处是替代方案建议，未实施。

## 2026-11-09 EVOLVE 平台系统身份

**Why:** 用户希望原生 Maxwell Agent 默认面向全部业务，EVOLVE 由隐藏的系统身份执行，免逐业务创建或授权执行 Key。隐藏指普通业务成员和 Key 管理界面，建议保留运维及安全审计身份。全业务覆盖与一次任务的资源权限应分层。

**How to apply:** 当前按业务发 Key 的路径查 Agent Server `studio_evolve_executor_key.go` 与 EVOLVE `commands/executors.go`。主线 Agent Server `auth_guard.go`、`business_access.go` 及 `sandbox_auth.go` 已有受限 Service principal、按 operation 的校验及业务绑定，可复用规则接入独立 EVOLVE 受信身份；现有 sandbox 凭据的签发范围不等于 EVOLVE 写权限。建议发起者按原权限批准具体任务，后台调用绑定同一 Business、Preset、Work/Attempt、允许动作和资源归属。临时资源归属要用服务端可验证标记，不能只靠客户端命名。可沿用现有资源 API，租约留在 EVOLVE，但服务鉴权与授权必须新增受限分支。旧任务沿原冻结执行身份恢复。身份覆盖是用户方向，令牌、归属和权限细节是建议，未实施。

## 2026-11-10 EVOLVE 系统身份改造范围

**Why:** 平台身份可以覆盖全部业务，每次委派仍需绑定单业务。现有操作白名单与业务判定可以复用，Thread 和临时资源写入还需各自的归属校验。完整免 Key 与仅原生 Agent 执行免 Key 的交付边界不同。

**How to apply:** 源码锚点为 Maxwell `f146431129a5f6907044a03e475349b3da08720a`。沿 Agent Server `auth_guard.go`、`business_access.go`、`thread_access.go` 与 `a2a_api.go` 查统一 Bearer、按操作拒绝、Service 的 Business 检查和 Thread/A2A 的独立鉴权。沿 EVOLVE `integration/executorsource/source.go`、`maxwellpreset` 基线读路径及 `maxwellexecutor/client.go` 查旧 Business Key 依赖与 Worker 接入。短凭据按任务续签时，检查 `integration/a2a/configuration.go` 的 bearer 摘要是否参与冻结比较；新路径应绑定稳定主体和授权范围，旧任务按原协议恢复。

另查 `integration/llmjudge/maxwell.go` 与 `commands/model_settings.go`。内置 Maxwell 模型判卷仍读取 Business Credential；若产品要求从执行到判卷均免 Key，须独立设计受限模型调用授权。现有 A2A 路由仅接受 API Key，若新原生执行使用 Runtime HTTP，可避免把系统身份扩到外部 A2A。方案仍待确定发行信任、临时资源归属、接口安全声明与验收，未实施。

## 2026-11-10 执行与判卷统一使用当前授权

**Why:** 用户明确要求执行与判卷统一走默认鉴权授权，凭据轮换不算配置变化，也不按任务创建时间分流。此节取代先前按旧凭据路径恢复的建议。可复现性依赖目标、输入和评判条件，运行中则由当前授权决定能否继续操作。

**How to apply:** Maxwell 只读源码锚点为 `f146431129a5f6907044a03e475349b3da08720a`。沿 EVOLVE `integration/a2a/configuration.go`、`http_jobs.go`、`runner_preparation.go`、`evaluation/live.go` 和 `queries/executor_verification.go` 核对执行快照、归档及比较。执行快照含 Bearer 摘要，影响派发、HTTP 批量取消、准备链路和执行验证。沿 `judgeprovider/measurements.go`、`recovery.go`、`evidence_auth.go` 及 MeasurementJob 仓储核对判卷调用、恢复、取消和证据授权。判卷绑定摘要含 CredentialRef。执行器的 Token PATCH 会更换引用并清掉连接验证；判卷登记不走该 PATCH，重复登记同一端点也不会写入新凭据。仅改 HTTP Header 不足以贯通轮换。

方案统一在调用时解析当前凭据。Maxwell 原生目标和内置模型判卷默认走隐藏的 EVOLVE 系统主体，按 Business、任务和 operation 约束。外部执行器及判卷服务继续使用各自登记连接的有效凭据，判卷取证绑定活动 invocation 与已归档证据。冻结业务、连接及执行目标、协议、资源版本、判卷模型和规则等有效语义，保留任务和远端 ID。凭据、其摘要、轮换版本和认证错误归独立运维状态；真实的授权撤销仍阻止后续调用。租约、恢复和清理继续归 EVOLVE。

Nextplay 源码锚点为 `5408ebc5a264db463d4435743993c154bae0479c`。核对 `eval-service/src/eval_service/api.py` 的判卷入站认证与 `evidence_pull.py` 的出站证据客户端。两方向使用 EVAL_API_TOKEN，证据客户端在构造时固定 Header。只轮换 EVOLVE 端不足以证明在途证据拉取继续，联调需保留原 invocation 并协调两端切换。

已存执行快照验原哈希及归属后，可投影到不含凭据的比较形状，保留原证据。已存判卷绑定可能只剩摘要。优先保留现有 CredentialRef 作为稳定槽位、原位轮换密文，或在首次切换前核实并留存不含凭据的绑定证据。检查 `postgres/executors.go` 已有原位更新入口及其并发约束。绑定缺证要单独报告；不能把当前登记无条件追认为历史，也不能重发已受理的远端执行或付费判卷。验收含在途轮换加重启、原 ID 续行、判卷取证与取消、未授权拒绝、真实配置变化以及已完成证据可回读。以上为设计方案，未实施。

## 2026-11-10 临时试跑的存储归属和实际回收

**Why:** 用户明确要求 Runtime 只承担执行所需存储，EVOLVE 保存评测元数据和原件。Nextplay 的临时资源生命周期可复用；调用删除接口、从目录消失、释放执行环境以及物理存储回收是可分别观测的事实。以目录消失替代回收验收会掩盖历史、文件与 Store 的累计增长。

**How to apply:** 源码锚点为 Maxwell `f146431129a5f6907044a03e475349b3da08720a` 与 Nextplay `5408ebc5a264db463d4435743993c154bae0479c`。沿 Maxwell `maxwellexecutor/adapter.go` 查当前业务可见、可写的评测 Thread 及 metadata 搜索恢复，沿 `evidence.go` 查证据归档和 EVOLVE staging 清理。该原生执行器未调用 Runtime 删除 Thread。沿 Runtime `application/threads.go`、`infrastructure/threadstore/sql.go` 和 `infrastructure/historyretention/delete.go` 分别核对停机、释放后端、软删除以及保留引用保护下的物理清理；不要将现有物理删除 helper 当成普通删除链路的效果。Preset 与 Prompt 删除为软删；按 Preset 隔离的中间件 Store 查 `app/integration/runtime/storeadapter/runtime.go`。Nextplay 物化与释放的顺序、保留失败、精确 404 判定沿 `materializer/service.py`、`cleanup.py` 查。

建议在 EVOLVE 现有持久 journal 记录每次创建意图、精确 ID、待清理资源和回执，证据与评分通过 EVOLVE 归档读取。Runtime 只写运行必需的执行状态、有限且服务端可信的临时归属与创建幂等身份。沿 Runtime `transport/http/controller.go` 核对已有 idempotencyKey 和非账号主体仅能创建业务可见 Thread 的限制，系统身份需补受限可见性；不能用 clientMetadata 或名称授权删除。沿 `ports/runtime_control.go` 核对现有内联 Skill 快照；完整 Case、冻结资源包、评分和租约应避免进入 Runtime metadata。仅在需要更改配置或隔离 Preset 级写入时物化临时 Preset，状态型基线和候选的隔离条件相同。未变化且可验证版本的资源允许引用，临时资源只清理明确归属的 ID。

清理以执行停稳及可回读的 EVOLVE 归档为门槛，可与异步判卷并行。先释放 Thread 和依赖后端，再按精确归属回收临时 Preset、Prompt、Skill、文件及 Store。评测成功与清理积压分别记录；故障后从原 lease 重试，并监控超期残留。若原删除接口只保证逻辑删除，需要 Runtime 受限清除重型历史和试跑独占资源的能力，复用已有引用保护及防复活幂等记录，租约仍归 EVOLVE。验收分开量化目录残留与实际保留行数、字节、Store/文件/沙箱，在目标规模和重复批次验证达到保留窗口后不线性增长。保留历史和普通资源，清理后重判从 EVOLVE 原件读取。当前为只读方案复审，实际保留期和环境容量尚未核实。

## 2026-11-10 EVOLVE Adapter 首版回收范围

**Why:** 用户希望首版达到 Nextplay 的正常自动回收水平，并收敛额外防御机制。首版以停机、留证、删除临时资源和记录异常为验收。上一节关于物理历史和 Store 清理的建议改为依据实际残留另行评估。

**How to apply:** Nextplay 源码锚点 `5408ebc5a264db463d4435743993c154bae0479c`。查 `maxwell-runtime/src/nextplay_runtime/runner.py` 与 `materializer/service.py` 的采集、停机和 Thread → Preset → 本次导入的 Skills → Prompt 删除。物化失败会尽量回收已经记下 ID 的资源。停机、取证或删除失败保留 lease 与错误，`nextplay-a2a/skills/maxwell-candidate-runner/SKILL.md` 说明按原 lease 处理。查 `eval-service/src/eval_service/execution_worker.py` 区分 Worker 接管时的远端停机和资源清理。CLI 的 recapture 是原件未齐时的诊断取证，不改历史结果。历史单次验收见 2026-09-16 回执；未核对本次线上实际回收比例。

建议首版复用 Maxwell Agent 登记和 EVOLVE `maxwellexecutor` 的 journal、归档及重启恢复。普通评测沿现有路径；配对调优的基线和候选各用独立试跑资源，支持 SP 替换与 Skill 绑定增删，解绑不删除源 Skill。每次创建记录本次拥有的 ID，Thread 使用现有幂等键，Runtime 只保留执行必需状态和最小关联。隐藏 EVOLVE 系统身份使用现有操作，执行和判卷在调用时取当前凭据，历史协议与任务 ID 保持。Agent Server 复用已有 CRUD 和停机释放能力。

正常或失败后停稳、证据已存时用现有接口清理，判卷从 EVOLVE 读归档。停机或取证未确认、删除失败时保留待清理 ID，已有 Worker 恢复路径可重试同一释放，异常可按记录补收。执行/判卷结果与清理结果分别记录。首版沿用软删及现有存储保留策略，无新增租约接口或表、独立巡检、物理清理协议；试点记录软删历史、文件和 Store 的实际残留，再决定是否扩范围。验收覆盖普通评测、基线与 SP/Skill 候选、成功自动清理、失败留证与恢复、删除后从 EVOLVE 重判。此处是待实施方案。

## 2026-11-10 保留试跑 Thread 的边界

**Why:** 用户询问首版能否保留 Thread，只删除临时 Preset。Nextplay 已有同类用法。会话历史、续跑、Sandbox 文件访问和后端回收各有独立依赖。

**How to apply:** Nextplay `5408ebc5a264db463d4435743993c154bae0479c` 的 `eval-runner/scripts/run_local_project_eval.py` 显式设置 `agent.lease.keep_threads`，之后仍调用 `agent.close()`。在 `materializer/service.py` 中，此开关只跳过 Thread 删除，保留删除本次临时 Preset、Skill 和 Prompt 的步骤。A2A CandidateRunner 正常清理内层 Thread 的行为按各自的 materialization lease 核对，勿将继承 Executor 的 keep_threads 与 lease 开关混为一谈。

Maxwell `f146431129a5f6907044a03e475349b3da08720a` 中，Preset 软删不级联 Thread。Thread 和历史 Run/事件的读取按 Runtime `transport/http/controller.go` 与事件存储核对；续跑和非托管 Sandbox 文件按 `application/runs.go`、`thread_files.go` 核对仍需可解析的 Preset 或已有受信快照。 `application/threads.go` 的 Thread 删除会运行后端释放，且配置化 Sandbox 释放会解析 Run Preset；先软删 Preset 可能使后续删除跳过该配置的 Sandbox 释放。删 Preset 也不回收其 Store 分区。

2026-11-10 用户确认正常 Thread 可以保留。首版在执行停稳且证据归档后默认保留 Thread，清除本次创建的临时 Preset 与独占 Prompt/Skill。按历史回看验收，文件和重判从 EVOLVE 归档取；保留 Thread 会保留 Runtime 历史。对明确要求立即释放 Sandbox 的试跑，继续用 Thread 先删、Preset 后删的现有路径。当前核对为源码，未实施或实跑。

## 2026-11-10 首版启动与授权评审

**Why:** 用户要求建立目标并开始开发。正常完成的 Thread 默认保留。目标是 Maxwell Agent 单入口完成普通评测及隔离的 SP/Skill 候选试跑，EVOLVE 留证、判卷与清理独占临时配置。

**How to apply:** 本地工作树 `/Users/leslie/.codex/worktrees/evolve-maxwell-agent-v1/maxwell-ai` 基于 `f146431129a5f6907044a03e475349b3da08720a`。已启动 EVOLVE 侧实现，沿 `maxwellexecutor/adapter.go` 查创建幂等与旧 journal 恢复，沿 `integration/a2a/configuration.go`、`llmjudge/maxwell.go` 和 `judgeprovider/source.go` 查执行快照 v2 与判卷凭据按调用加载。2026-11-10 在该工作树运行 EVOLVE 服务全量 Go 测试通过。工作树改动尚未提交、发布或真实环境验收。新格式切换要保证 API 与 Worker 都可读；旧 Runner preparation 只存 v1 摘要时，缺历史快照且当前摘要无法证明绑定，应保留原任务并报告绑定不可验证。

Agent Server 下一阶段仅评审现有接口的鉴权扩展，现有请求/返回字段、调用方权限和错误状态沿用。拟允许隐藏 EVOLVE 系统身份调用以下路径。

- 配置读取 `GET /api/agent/preset/detail`、`GET /api/prompt`、`GET /api/skill/detail`。配置写入 `POST /api/agent/preset/copy`、`PUT /api/agent/preset`、`POST /api/agent/preset/delete`、`POST /api/prompt`、`POST /api/prompt/delete`、`POST /api/skill/import`、`POST /api/skill/delete`。写操作限本次试跑物化资源。
- Runtime `GET|POST /api/runtime/threads`、`POST /api/runtime/threads/{threadId}/messages`、`GET /api/runtime/threads/{threadId}/runs`、`GET /api/runtime/threads/{threadId}/events`、`GET /api/runtime/threads/{threadId}/events/{eventId}`、`GET /api/runtime/threads/files`、`GET|HEAD|PUT /api/runtime/threads/files/content`、`GET /api/runtime/models` 和 `POST /api/runtime/model-completions`。正常试跑保留 Thread。
- 如需接管在途 Maxwell A2A，按原身份归属验收 `GET /api/a2a/{agentId}/.well-known/agent-card.json`、`GET /api/a2a/{agentId}/tasks/{id}` 和 `POST /api/a2a/{agentId}/tasks/{id}:cancel`。保留原任务 ID。

建议在现有 Bearer/Service principal 上加入独立 EVOLVE 信任与短期授权，限制 Business、任务、动作及资源范围。部署签名密钥按环境单独注入、缺省不启用该身份；请求范围及有效期用代码规则。权限风险是跨 Business 或对正式配置写入，验收应覆盖错误范围拒绝。回退可停用此身份，既有调用路径和 EVOLVE 归档仍可读取。鉴权扩展与候选物化尚待实施。正式 doc-hub 配置路径在本机未找到，本轮以已确认的对话范围推进内部代码。

## 2026-11-10 原生试跑物化与回收首轮验证

**Why:** 首版复用 Nextplay 的临时配置办法。清理须等 EVOLVE 完成取证，正常 Thread 可以留作历史。成功归档与清理成功分别记录，清理失败可以在同一个 invocation 上重试。

**How to apply:** 沿本地 Maxwell 工作树的 `maxwellexecutor/frozen_preset.go` 核对冻结源版本与清单、试跑独占资源的物化和回收。复用现有 Preset、Prompt、Skill 接口，按冻结目录实际应用 SP 和 Skill 绑定，再沿 `evidence.go` 查 Run 记录对实际 Business、Thread 和 Preset 的核验。清理只使用 journal 已确认归属的 ID。创建请求结果不明时留存创建意图。只有带恢复标记的 journal 可以补查，规则见下文。取消时已有工作区但缺文件归档证据，则保留配置供补取。首版删除沿用现有资源接口的生命周期语义。

沿 `commands/baseline.go` 查大资源的 Work Artifact 引用。只有历史裸 CAS 哈希时，需重新冻结或补齐经授权的资源引用。冻结资源经 Worker JSON 持久化后应使用已校验的原字节见证，避免 JSON 排版变化破坏内容校验。

本地 HTTP 集成测试覆盖同一入口路由、基线及 SP 与 Skill 增删、归档、清理错误后恢复和保留 Thread。测试使用替身 Runtime，产品代码留在工作树。隐藏系统身份待授权确认，真实运行、生产回收及完整判卷链路待联调。

原生隔离路径沿 `a2a/native.go` 和 `maxwellexecutor/input.go` 同时接受 Nextplay 准备输入及现有 Maxwell 文本、结构化和标准多轮输入。共用单轮文本解析，保留结构化业务字段。沿 `evaluation/live.go` 查远端受理前冻结的传输方式，普通历史请求继续沿原路径，避免重复派发。按 `commands/optimization_candidate.go` 检查连续调优授予的精确路径，原生 Skill 文件可增删，基线 Preset 配置不可借此改写。后续的调优入口接线见下节。

## 2026-11-10 普通评测进入原生调优

**Why:** 来源评测应保留原分数、版本和执行路径。隔离对照须绑定本任务准备的配置，基线和候选各自物化。任务创建可以先进入分析，配置读取暂时失败时留给同一任务恢复。

**How to apply:** 沿 Maxwell 工作树的 `commands/tuning_baseline.go`、`native_tuning_baseline.go`、`runner_tuning_run.go` 检查同一个 Maxwell Agent 执行器、按 Work 寻址的冻结 Variant 和运行准入。资源内容继续入 EVOLVE。Artifact 在业务内按内容去重，平台冻结的 Variant 用同 Work 的固定 ID 和带 Work 标识的说明，区别两个配置相同的独立任务。恢复读已冻结 Variant；从本 Work 的隔离结果重判时，沿 `comparison.ExecutionSource` 找回原执行归属。已有 Runner 任务和明确选择 Runner 的任务继续使用原连接。

沿 Studio `RunTuningStore.ts`、`StartRunDialog.tsx` 及 `LedgerLineage.tsx` 核对默认执行器和候选基线选择，空目标创建仍要发送幂等键。沿 `agent-resources/skills/target-recon/references/target-connection.md` 查原生准备后的资产读取方法。命令层集成测试覆盖普通评测、隔离基线、候选、固定配置重放、快照失败后恢复和重判无需再次派发。EVOLVE 全量 Go 测试及 Studio check 通过。代码仍在工作树，未部署。隐藏系统身份授权及真实环境验收待完成。

## 2026-11-10 Skill 发现语义与清理后归档重判

**Why:** Runtime 的 Skill 目录包含名称、描述及 Preset 绑定。只复制 SKILL.md 文件会改变模型发现 Skill 的信息，且临时 ID 不能充当可比较的配置摘要。重判需要从已授权的 EVOLVE 原件恢复，覆盖临时配置已删除的情况。

**How to apply:** 沿 `maxwellpreset/baseline.go` 核对冻结 Preset 目录、Skill 名称、描述和绑定顺序。沿 `maxwellexecutor/frozen_preset.go` 核对已有 Skill 的元数据回读、新增 Skill 按包派生，以及移除仅作用于临时绑定。旧快照缺少 Skill 元数据时，按源 Preset 的已有绑定 ID 读取当前元数据。有效配置摘要排除临时资源 ID，执行回执记源 Preset 版本。

沿 `maxwellexecutor/frozen_preset_test.go` 和 `frozen_preset_regrade_test.go` 查本地集成证据。替身 Runtime 执行后轮换 Bearer，原 invocation 补删并保存成功回执。随后真实 EVOLVE Worker、归档 Resolver 和原 Trial 授权读取原件，再从独立 Work 重判，同一份 EvidenceSet 只派发一次目标。评分模型使用替身。Agent Server Preset、Prompt、Skill 的应用层及 HTTP 包测试通过，真实环境和隐藏身份仍待验收。

鉴权以 Agent Server `auth_guard.go`、`business_access.go` 及 `studio_evolve_executor_key.go` 为准。Studio 控制器的 `currentActorID` 可取 API Key 主体 ID，是否允许仍由已认证主体、Business 和操作权限决定。默认签发的受管 EVOLVE Key 只有运行权限，隐藏身份授权仍按前述评审清单单独确认。

## 2026-11-10 取消试跑后的取证与回收

**Why**

取消可以发生在首个完整回合之前，工作区仍可能已经写入证据。保留 Thread 也不能替代 EVOLVE 归档，Runtime 部分工作区路径仍依赖绑定的 Preset 解析后端。

**How to apply**

沿 `maxwellexecutor/cancel.go` 检查停止回执，沿 `goal_cancel.go` 检查文件原件、运行事件和已有配置快照入归档后的回收顺序。普通历史任务沿原取消流程。隔离试跑复用执行归档的文件范围，嵌套项目使用试跑 journal 中的项目根。读取或归档失败时，原 invocation 的临时配置暂留给现有 `evaluation/cleanup.go` 重试，已确认的停止动作不会重发。归档可读后删除试跑拥有的配置并保留 Thread。

本地 `cancel_recovery_test.go` 覆盖停止后读取失败、重建 Adapter 和轮换凭据、归档可读后清理及保留 Thread。真实环境验收时，应将 Thread 历史与可继续运行分开验证，后者依赖仍有效的 Preset；原始评测文件以 EVOLVE 归档为准。

## 2026-11-10 普通 Agent 的文件证据

**Why**

同一原生入口接受普通 Case 后，固定项目目录不能代表这个 Agent 的产物。清理临时配置前，从 Runtime 的显式产物引用获取原件，归档后判卷可在当前授权下读取。

**How to apply**

沿 `maxwellexecutor/agent_files.go` 核对持久的助手输出 Parts 和工具结果声明的 ResourceLink。新建的普通隔离试跑沿本次 Business 与 Thread 的文件接口取证，文件以工作区相对路径入归档。文本中的普通链接保留在事件原件内。Nextplay 准备输入沿原目录与媒体规则；普通评测和历史任务沿原执行路径。

沿 `frozen_preset_test.go` 与 `frozen_preset_regrade_test.go` 核对非 Nextplay 的 Markdown、CSV 和 JSON 原件。测试使用替身 Runtime 和评分端点，真实 EVOLVE Worker 通过同一 EvidenceSet 给评分方法传归档文件，重判复用原件和归属校验，目标 Agent 只执行一次。

## 2026-11-10 创建响应丢失后的临时资源恢复

**Why**

Preset、Prompt 和 Skill 的现有创建接口由服务端分配 ID。创建已经提交而回执丢失时，EVOLVE 需要找回原 ID 才能继续隔离试跑或回收，避免重复创建。

**How to apply**

沿 `maxwellexecutor/frozen_preset.go` 核对每次创建前保存的随机标记。现有 Preset、Prompt 的描述和 Skill 的来源名用于关联，Skill 的模型可见名称和描述仍来自冻结配置。沿 `preset_recovery.go` 查同一业务、当前主体「我创建的」目录以及精确匹配。只认唯一命中的 ID，成功登记后再执行后续动作。取消时匹配暂缺或不唯一，现有 EVOLVE 终态清理继续重试，已确认归属的资源仍可回收。

凭据轮换沿当前授权读取，恢复要求 Agent Server 将新凭据识别为同一创建主体。若换成不同主体，或历史 journal 未保存标记，缺失回执的资源仍需核对归属。沿 Agent Server `auth_guard.go` 核对 actor 身份，沿各 Studio 资源目录查创建者过滤。替身 Runtime 测试覆盖提交后响应丢失、换凭据后重启、接回原 ID、不重发创建、同名或多匹配时保留待回收记录。

## 2026-11-10 已归档试跑的后台回收

**Why**

成功试跑一旦进入终态，现有远端取消扫描不会再选中它。回收需要独立于判卷重试，才能覆盖管理接口暂时失败和 Worker 重启。

**How to apply**

沿 `maxwellexecutor/evidence.go` 核对归档原件、登记待回收项和写终态 journal 的顺序。队列只有本次 invocation 的 journal 键。沿 `archived_cleanup.go` 查同一把锁下的终态与资源归属校验，再沿 `a2a/native.go` 查每次使用当前执行器授权。`worker/worker.go` 的现有清理循环处理有限批次。成功删除后 journal 留存回执，队列移除，Thread 与归档按原规则保留。

本地 `frozen_preset_test.go` 和 `frozen_preset_regrade_test.go` 覆盖第一次删除失败仍可完成判卷、后续多次失败后用当前凭据补删、保留原件并重判。沿 `worker/evidence_cleanup_test.go` 查清理循环失败后继续推进。此前已经结束且没有登记待回收项的实验 journal，需要再次观察或单独核对；旧普通评测本身没有该类临时资源。

## 2026-11-10 复制 Preset 时核对执行设置

**Why**

Agent Server 的复制接口会按当前工具目录重新校验，可能裁掉旧工具或更新 agent-mode 对工具的引用。只比较副本绑定 SP 和 Skill 前后的值，无法看到复制步骤已经引入的差异。

**How to apply**

沿 Agent Server `studio_api.go` 查复制时的工具和 agent-mode 调整。沿 EVOLVE `maxwellexecutor/frozen_preset.go` 查源 Preset 与副本的执行字段核对，处理旧记录中空集合的等价表示。源和副本的模型、工具、中间件或后端声明有差异时，在新建 Prompt、导入 Skill 或创建 Thread 前停止，按已登记的副本 ID 清理。合法试跑仍按源版本冻结并只调整 SP 和 Skill 绑定。

`frozen_preset_test.go` 覆盖复制结果裁掉工具后的早停与回收。Agent Server 的真实 HTTP handler 技术测试覆盖正常复制、业务 API Key 边界以及删掉绑定 Preset 后的行为。真实浏览器和 Temporal Worker 验收需先用 `make check` 与 `make status-agent-worker` 核对同源 API、Worker 和 Studio。2026-11-10 本轮本机检查时没有配套服务，已有 Worker 属于另一工作树，未切换。

## 2026-11-10 单次调用内的凭据轮换

**Why**

执行和判卷在调用前读取当前凭据。一次试跑包含多个 HTTP 请求，轮换后旧凭据若在中间被撤销，首次 401 仍可能使本次试跑或判卷提前结束。

**How to apply**

沿 EVOLVE `safehttp/bearer_refresh.go` 核对一次调用的凭据使用。仅在同源请求收到 401、当前 Bearer 已改变且请求可完整重发时，使用当前 Bearer 重发一次，同一调用后续请求沿用新凭据。沿 `a2a/native.go` 查刷新前的业务、执行器及 Preset 身份检查，沿 `llmjudge/maxwell.go` 查模型校验和判卷。请求原件、invocation 和配置冻结口径沿原规则。

现有 Agent Server 签发的受管 Key 初始只含 `runtime_run`。EVOLVE 注册流程沿 `commands/key_permissions.go` 和 `maxwellpreset/client.go` 在现有授权下补齐 `runtime_read` 与 `preset_read`；隔离试跑对 Prompt、Skill 和配置写入的授权继续由现有业务权限决定。新的隐藏系统身份仍待单独确认。

本地 `frozen_preset_test.go`、`a2a/connection_test.go` 和 `llmjudge/maxwell_test.go` 覆盖复制过程中轮换、目标 Preset 变更时拒绝重发、判卷重发保持请求字节、403 或凭据未变时保留原错误。

## 2026-11-10 普通评测和隔离试跑的判卷输出

**Why**

普通 Maxwell 评测从 A2A Task 的正式产物读取最终回复。直接拼接隔离 Thread 的助手事件会把过程说明混入回答，并遗漏结构化结果和旧评分规则需要的逐轮字段。

**How to apply**

沿 EVOLVE `internal/app/integration/a2a/output/output.go` 查两个入口共用的输出选择和判卷结果格式。A2A SDK 的依赖集中在 `integration/a2a`。沿 `maxwellexecutor/turns.go` 查隔离试跑使用当前凭据，通过现有 A2A Task 读取本轮正式结果。异步工具接续时使用发出终态事件的子 Run。EVOLVE 将每轮已读结果写入本地 journal，读取中断后的恢复只补读结果。沿 `evidence.go` 核对 Run、Thread 和临时 Preset 的绑定。单轮判卷保留结果对象，多轮沿普通评测的 `output.text` 和 `output.turns`。结构化原件随逐轮执行证据归档，已归档历史结果和 Nextplay 准备输入的判卷格式沿原路径读取。

`frozen_preset_test.go` 与 `frozen_preset_regrade_test.go` 使用替身 Runtime 验证两轮子 Run、读结果返回 502 后重启、每条用户消息只执行一次，以及清理临时 Preset 后由 EVOLVE Worker 读取同一份归档重判。Agent Server 的现有 A2A Handler 测试覆盖 Runtime Run 地址映射及业务 Key 权限。正式环境仍需核对同源服务和业务授权后验收。

## 2026-11-10 现有管理接口的真实 Handler 回归

**Why**

EVOLVE 试跑的替身测试可以验证编排顺序。业务 Key 能否通过 Agent Server 的真实权限检查，以及目录和删除接口是否支持故障恢复，需要从注册的 HTTP 路由独立验证。更新 SP 和 Skill 时，工具配置详情中的空数组可能只是脱敏投影，回写会重建原配置。

**How to apply**

沿 Agent Server `app/api/http/evolve_trial_resources_test.go` 查真实路由、当前业务 Key 权限和跨业务拒绝。测试使用进程内存储和临时 Skill 文件目录。它实际复制 Preset，发布新 Prompt，导入同 slug 的独立 Skill，更新绑定，从当前主体的三份资源列表找回 ID，并按真实删除结果核对重复清理。清理后从原路由读回原 Preset、原 Prompt、两个源 Skill 和试跑 Thread。Prompt 的 SQL 所有者与关键词过滤另见 `modules/shared/query/agent_content.sql` 的 `ListOwnedAgentContents`。

沿 EVOLVE `maxwellexecutor/frozen_preset.go` 核对更新请求按 `providerId` 和 `toolName` 提交 `configured` 标记。Agent Server 使用副本已经保存的完整工具配置，详情脱敏字段只用于回读核对。沿 `agentpreset/application/tool_config_detail.go` 查已有保留语义，沿 EVOLVE `frozen_preset_test.go` 查脱敏数组的请求回归。

隐藏 EVOLVE 身份的现有接口清单还需覆盖找回资源使用的 `GET /api/agent/preset`、`GET /api/prompts`、`GET /api/skills`。新隔离试跑的正式结果也使用 `GET /api/a2a/{agentId}/tasks/{id}`，并依赖该试跑的 Business、Preset、Thread 与 Run 归属。实际跨业务系统身份仍待接口授权审查。本机 `make check` 未发现本工作树的 API 或 Studio，`make status-agent-worker` 查到另一工作树的全局 Worker；未切换实例，也未将 Handler 回归计入真实环境端到端验收。

## 2026-11-10 普通 A2A 多轮与历史原件的凭据轮换

**Why**

一个多轮 Case 在单次派发中发送多条消息。轮询每次读登记，但下一轮沿用开跑时的客户端会继续带旧凭据。若登记指向另一个 Agent，单凭当前连接又可能把原 Task ID 发给替换目标。历史 Runner 已产出的证据分片也可能在读取期间遇到旧凭据撤销。

**How to apply**

沿 EVOLVE `integration/a2a/registry.go` 与 `turn.go` 核对同一执行配置下读取当前登记。凭据轮换不改变冻结配置。后续轮次、轮询和超时清理沿同一业务与执行配置。连接更换时不向替换目标发送原 Task ID，并保留取消未确认的状态。注册型 A2A 客户端在原端点收到 401 时沿 `safehttp/bearer_refresh.go` 尝试一次当前凭据。超时和其他传输失败沿原派发语义处理。

沿 `runtime_result.go` 核对历史 Runner 的结果清单和分片读回。一次归档共用同源凭据刷新，成功更新后后续分片沿用当前凭据，原 Thread、invocation 和校验哈希继续绑定。`turn_test.go` 验证两次轮换、两次实际用户发送和变更目标后的无请求；`runtime_result_test.go` 验证首片读取遭 401 后原件完整归档。测试使用本地 HTTP 替身，真实环境和隐藏系统身份仍沿前述验收前提。

## 2026-11-10 Worker 重启后沿用已接纳任务的连接

**Why**

普通评测的异步 Task 可跨 Worker 进程继续。旧任务的轮询、续答和取消需要同时使用本次登记授权和已接纳连接。用最新登记直接寻址，会在执行器被换成别的 Preset 时把旧 Task ID 送到新目标。轮询间隔、执行限额和凭据本身不决定原 Task 的位置。

**How to apply**

沿 EVOLVE `application/evaluation/live.go` 和 `live_interaction.go` 查看从 Attempt 持久化快照传入轮询、续答、取消与取消后取证的内部字段。沿 `integration/a2a/configuration.go` 查快照哈希、业务、执行器、端点、Preset 和结果通道校验。快照格式 v1 和 v2 复用同一对象读取逻辑，验证原件后忽略认证变化。带摘要但无法核验快照的历史任务会留下原 Task ID 和连接不可验证的结果。未保存摘要的更早任务沿已有地址处理。Maxwell A2A 结果进一步校验 Task ID 和已知 Context ID。

沿 `integration/a2a/configuration_test.go` 查 Registry 重建后的两代快照、历史缺证、变更目标零请求和新 Key 的 HTTP 验证。沿 `application/evaluation/live_configuration_test.go` 及 `live_interaction_test.go` 查 Worker 重建后传递原摘要的轮询、续答和取消。2026-11-10 本机仍由另一工作树占用全局 Worker，同源真实环境验收待执行。

## 2026-11-10 逐个确认临时资源回收

**Why**

回收请求有单次时间预算。若每轮都从 Preset 开始，即使接口每次都能完成一项，后面的 Skill 和 Prompt 也可能一直轮不到。Worker 重启后同样需要接回已确认的进度。

**How to apply**

沿 `maxwellexecutor/frozen_preset.go` 查看 EVOLVE journal 的逐资源回执。成功删除和目标接口确认资源已不存在分别留存。只有写入回执后才推进，后续重试跳过已确认项。原拥有的 ID 留存，回收仍先 Preset 再 Skill 和 Prompt。沿 `cancel.go` 查看未创建 Thread 的取消也进入后台回收队列，沿 `evidence.go` 查归档发布后仅在归档中保留原事件和文件索引。

`archived_cleanup_test.go` 用本地替身让每轮回收只来得及确认一项，重建 Adapter 后继续直到四项全部确认。`cancel_recovery_test.go` 覆盖尚未创建 Thread 时，由后台队列找回创建回执并回收；`frozen_preset_test.go` 核对归档、判卷、Thread 保留和回执。本地渲染 dev、staging、prod 的 EVOLVE 部署清单，API 和 Worker 各自在同一 NAS 声明和对象目录下读取 journal。沿 `app/composition.go` 核对跨进程的 PostgreSQL advisory lock。环境真实存储与端到端执行仍需按部署验收步骤核对。

## 2026-11-10 已受理判卷在 Key 轮换后续作

**Why**

评分请求受理后，EVOLVE 要继续查询原 invocation，评委也可能尚未读取归档。若 Key 在读取当前授权和发出请求之间轮换，旧 Key 的 401 会中断原任务。归档请求和截止时间属于任务，凭据属于连接的当前授权。

**How to apply**

沿 `judgeprovider/source.go`、`measurements.go` 和 `recovery.go` 查当前登记、业务、角色、端点和评委版本检查。收到同源 401 且取得不同的新 Key 时，沿 `safehttp/bearer_refresh.go` 重试同一 HTTP 请求一次。已受理任务继续 GET 原 invocation，取消继续 DELETE 原 invocation。沿 `evidence_auth.go` 查证据入口使用当前授权和原请求哈希，旧 Key 被拒绝。旧绑定包含 CredentialRef 的任务可在引用保持不变时继续。普通 Executor PATCH 拒绝判卷登记，重复判卷登记也不会更新 Key。现有 `cmd/evolve-credential-rotate` 用于重新加密存储密文，和替换评委实际使用的 Key 是不同操作。

沿 `evidence_pull_test.go` 查受理后轮换、原请求哈希和截止时间、原归档回读与篡改拒绝。沿 `recovery_test.go` 查旧绑定在同一槽位轮换后的取消回执。设置 `NEXTPLAY_EVAL_ROOT` 可在本机用 Nextplay `cc664e06c9cc61d6b1c81340dae30cfa754ac81c` 的实际下载器和新 Key 读取同一 24 MiB 归档。Nextplay 客户端在构造时读 Key，这个验证使用重新构造的客户端；在途 Nextplay 进程热切换 Key 仍待联调。

## 2026-11-10 历史 Preset 快照与隔离试跑的执行选择

**Why**

历史 `ResolveBaseline` 已生成带 `preset://`、`baselineHash` 和资源目录的 Variant。只凭这个形状选择隔离执行，会使升级时仍排队的旧普通评测改走临时 Preset，影响原执行条件。

**How to apply**

沿 `commands/tuning_baseline.go` 查看创建 Maxwell 调优 Work 时保存的执行器和原生 Preset 选择。独立候选验证沿 `commands/candidate_validation.go` 将该选择写入已验证的派生 Work 计划。沿 `execution/frozen_preset.go` 和 `evaluation/live.go` 核对 Worker 使用 Work 保存的路径，再由 `integration/a2a/native.go` 和 `maxwellexecutor/adapter.go` 进入隔离试跑。历史 Variant 原件与协议保持可读取，普通评测沿原 A2A；已派发任务沿原 ID 恢复。路径记录归 EVOLVE。

`native_tuning_baseline_test.go` 覆盖普通评测、隔离基线、归档重判、独立候选和同形状历史 Variant 的 Worker 派发。`native_inspection_test.go` 用同一份 Variant 验证普通路径向 A2A 发送一次，隔离路径只创建 EVOLVE 执行预留。这些测试在本机执行，真实 Runtime 验收仍需同源 Worker。

## 2026-11-10 Agent Server 正式结果与 Thread 留存回归

**Why**

临时配置删除前要取回正式结果。Runtime 事件历史与 A2A Task 投影的读取条件不同，业务 Key 可访问现有接口也不能证明隐藏系统身份已经接入。

**How to apply**

沿 Agent Server `app/api/http/evolve_trial_resources_test.go` 运行本地 Handler 集成测试。使用现有业务 Key、真实 Preset/Prompt/Skill Handler 与 Runtime 引擎，在进程内 `DriveDurable` 和确定性模型下核对候选收到替换 SP、保留及新增 Skill，源 Skill 从候选目录移除。Runtime 发起的 Run 从临时 Preset 的 A2A Task 返回正式结果，同一个 Run 用源 Preset 读取返回 404。删除独占配置后，临时 Preset 的 A2A 路由返回 404，Runtime Thread 仍可读完成事件和答复。再以同一个 Key 从源 Agent 发起普通 A2A 评测，核对原 Prompt 和独立终态。该测试未接入外部模型、真实 Temporal Worker 或实际共享存储。

隐藏身份的鉴权评审需覆盖现有 A2A Agent Card、`POST /api/a2a/{agentId}/message:send`、`GET /api/a2a/{agentId}/tasks/{id}` 和 `POST /api/a2a/{agentId}/tasks/{id}:cancel`。普通评测使用发送与恢复，隔离试跑还依赖正式结果读取。沿 `a2a_api.go` 查当前仅接受业务 Key，沿 `auth_guard.go` 和 `sandbox_auth.go` 查可复用的服务主体、业务及操作校验。Sandbox 委派范围面向已有 Sandbox 能力。EVOLVE 的 `EVOLVE_AGENT_MCP_BEARER_TOKEN` 用于 Maxwell 调用 EVOLVE MCP。两者各自保留当前信任用途。系统身份的接口授权仍待确认。

## 2026-11-10 主线工作区改版后的首版验收基线

**Why**

主线 #423 已改用 `EvolveSelect` 并调整评测弹窗。调优首版也修改同一入口，需要保留主线选择器行为与调优默认执行器、冻结基线及手动选择约束。

**How to apply**

2026-11-10 通过远端分支指针核对主线 `7d35be0e8bd4b4c43f37031ac506c4a40eafde05`。首版工作树从 `f146431129a5f6907044a03e475349b3da08720a` 更新到该基线。沿 Studio `products/evolve/dialogs/StartRunDialog.tsx` 核对 `event.currentTarget` 与原生调优分支，按文件哈希核对其余本地改动。重新运行 Studio check、EVOLVE 全量 Go 测试及 Agent Server HTTP、A2A、Runtime application 测试，均通过。

该主线仍使用业务 Key 读取 A2A，EVOLVE 原生执行和内置模型判卷仍读取 Business Credential。系统身份范围沿上节和首版授权评审，真实环境验收前用 `make status-agent-worker` 核对当前代码目录。

## 2026-11-10 原生调优首版的权限、取消与恢复审查

**Why**

从普通 Maxwell Agent 评测进入调优时，已有业务连接的健康度、临时配置写入权限、Case 在 Runtime 中的可见范围、远端停止与归档回收各有独立的事实来源。测试若手动赋权或总能在下一次查询找到临时资源，会漏过默认入口和进程重启的缺口。

**How to apply**

- 审查自动选路时，对照 EVOLVE 的 `commands/native_tuning_baseline.go`、`tuning_preflight.go`、`maxwellpreset/client.go` 与 Agent Server 的 `app/api/http/evolve_trial_resources_test.go`。分别走默认业务 Key 和已具备临时配置能力的身份，再确认未满足能力时已有 Runner 的选择行为。保留普通 Thread 时，交叉检查 `maxwellauth/resolver.go`、`maxwellexecutor/adapter.go` 和 `app/api/http/thread_access.go`。用同一业务的 Runtime 读权限验证 hidden Case 原文与普通 Thread 历史各自的可见范围。
- 对照 `maxwellexecutor/cancel.go`、`goal_cancel.go` 和 `evaluation/live.go`，分别注入远端已停止后清理返回 503、慢速弱 ETag 文件。记录停止回执、归档和清理三个状态。该轮在基线 `7d35be0e8bd4` 上的首版工作树复现了停止确认被清理错误掩盖。也在 `frozen_preset.go` 保存创建意图后、发送之前的状态做了重启复现，空目录查询和后台回收都无法推进；修复时同时保留响应丢失后找回已创建资源的校验。
- 查外部 Runner 旧准备记录时，沿 `a2a/configuration_test.go` 的旧摘要轮换用例分别验证有无历史快照。仍可验证旧摘要时先保全对应快照；找不到原配置凭证的记录需要显式重做准备，历史结果另行保留。真实验收仍须在同源 API 与 Worker 上连跑默认注册、普通评测、隔离调优、取消、归档和回收。

## 2026-11-10 原任务配置读取与隔离试跑恢复

**Why**

评测能运行只证明业务 Key 有执行能力。首次准备真实 Case 时还要读预设关联的系统提示词和技能。原生调优需要另一组临时资源写权限。Studio 的授权修复按钮曾只有组件测试，目标详情没有挂载入口。

**How to apply**

- 在 Studio 执行目标详情打开「修复业务执行授权」，沿 `v3/library/ObjectDetailDrawer.tsx`、`executor/ExecutorBusinessAuthorizationRepair.tsx` 和 EVOLVE `maxwellpreset/client.go` 查同一个目标的登记重放。补权仍由当前具备密钥管理和可授予读取权限的业务管理员完成。通过同一个 Key 复测 `evolve_executor.resolve_baseline` 读取预设、系统提示词和技能，回到原任务继续。配置读取权限与隔离试跑写权限分开。后者沿 `commands/native_tuning_baseline.go` 用已有 Business 详情核对实际授权，能力不足时沿用关联 Runner。
- 保留正常试跑 Thread。沿 `commands/run.go` 和 Worker `evaluation/live.go` 核对 hidden Case 的接纳与执行检查。沿 `maxwellexecutor/cancel.go`、`archived_cleanup.go` 检查停止确认、异步归档和独占配置回收。回归须覆盖删除返回 503、慢速弱 ETag 和 Worker 重启。临时资源创建意图存在但目录为空时，试次可以结束并重新发起，后台降频查找晚到资源。
- 沿 `a2a/configuration.go` 查可验证的 v1 摘要见证回填，沿 memory 与 postgres 的 `retention.go` 查 Runner 准备和准备历史的引用扫描。凭据已经轮换且原配置见证缺失时，恢复原绑定或以来源评测重新做调优准备，保留历史。隐藏系统身份涉及现有接口的授权变更，仍需独立确认与真实环境验收。

## 2026-11-10 EVOLVE 系统身份读取原 Agent 配置

**Why**

业务 Key 能发起评测时也可能缺少系统提示词与技能读取权限。旧会话已经进入等待确认时，应让原任务重新读取已登记目标，并避免逐业务补权。当前授权范围是配置读取。

**How to apply**

- 沿 EVOLVE `commands/baseline.go` 与 `maxwellpreset/system_baseline.go` 查当前读取身份。服务按已登记 Business 和 Preset 签发短期凭据，不把凭据加入历史执行配置或结果哈希。沿 Agent Server `app/api/http/evolve_config_read_auth.go` 查公钥验证、三个现有 operation、Business 和 Preset 绑定。Prompt 和 Skill 必须仍关联到该 Preset。关联的公开 Skill 可在业务范围查不到时走现有公开详情分支。
- 按 Maxwell `docs/operations/agent-server.md` 配置每个环境的密钥。先上线 Agent Server 公钥，再启用 EVOLVE API 和 Worker 的签名种子。逐业务没有配置或迁移步骤。停用签名可恢复原业务 Key 路径。执行、配置写入和判卷的授权由各自入口决定。
- 验收使用已登记目标与缺读取权限的原 Key。重放同一 Work 的基线读取，核对快照内容和 Work/Key 未变化。检查无关联资源、其他业务、列表和写操作拒绝。本地通过 EVOLVE 客户端对接真实 Agent Server Handler 的跨服务测试。生产会话可按原会话继续提交当前卡片，线上验收以部署后真实工具回执和草稿进度为准。

2026-11-10 将首版工作树的改动合入 [Maxwell PR #424](https://github.com/world-sim-dev/maxwell-ai/pull/424) 的源分支，保留同一 PR 的冻结试次评分字段改动。沿提交 `4067b86ab` 查本轮集成范围，发布与线上旧会话验收按实际服务版本另行核对。

## 2026-11-10 Dev 发布与原会话草稿的边界

**Why**

部署、系统身份读到真实配置、会话用新回执完成草稿，是三件事。原会话可能把历史权限错误写成当前结论。保存带可执行 payload 的草稿会即时做结构校验，只有 Markdown 的审阅稿可以先保存。编排可按需前进，实际执行仍需冻结精确输入。

**How to apply**

- 查 [Dev 发布 42777186409](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42777186409) 和合并提交 `7f2b3633c`。使用上海 ACK 的 Agent API/Worker、EVOLVE API/Worker，以及 `agent.sandaii.cn` 的 Studio 静态构建确认生效。补配环境级系统身份配对密钥，沿 Agent Server 的 `auth_method=evolve_config_read` 核对请求，跳过数据库迁移。用真实已登记目标探测 Preset、关联 Prompt 和 Skill，再验跨业务、非关联资源、列表、写入和过期凭据。
- 在原会话提交自然语言重试后，2026-11-10 15:57（北京时间）的回复沿用了旧权限判断，当轮记录仅有计划和待办。明确要求本轮实际调用 `evolve_run resolve_baseline` 后，15:58 的回执和 Agent API 日志确认目标配置可读。原 Work 保存了评测目标、4 个 Cases、Judge 及 base 文字审阅稿；Benchmark 仍是会话里的烟测提案，未正式创建或执行。
- 沿 EVOLVE `commands/draft.go`、`confirmed_draft.go` 查保存时仅在有 payload 的情况下校验、确认时要求可执行 payload。沿 `targetmodel/target_model.go` 查 base 的目标和接口来源，沿 `evaluation/variant.go` 查 profile 资源正文或可校验引用。原会话两次校验分别缺 `targetRef` 的来源和首项资源正文或引用。`resolve_baseline` 返回经过服务端校验的完整 `profilePayload`，按原结果透传即可避免手抄资源摘要时丢字段。
- 沿 `agent-resources/prompts/evolve-tuning-agent.md` 查按需补齐资产的编排。沿 `commands/benchmark.go` 查 Benchmark 定义的冻结 CaseSet/Judge 引用，沿 `commands/run.go` 查运行阶段的 TargetProfile 与 Variant 要求。评测草稿先给用户审阅，准备正式资产时才补与实际入口有关的冻结依赖。

## 2026-11-10 草稿入参错误的恢复信号

**Why**

Dev 原会话给 `evolve_draft put` 传了缺来源的 `base` 和缺资源正文或引用的 `profile`。业务校验正确拒绝了输入，但 Runtime 将两次失败显示为 `ProviderPermanent / choose_another_tool`，会引导模型离开仍可修正的操作。校验返回的恢复动作与失败原因应一致。

**How to apply**

- 沿 EVOLVE `app/toolcaller.go` 的 draft put 分支查应用校验错误，沿 `transport/mcp/handler.go` 查 `ErrCorrectableInput` 到 `invalid_input` 的既有映射。Agent Server 的 `modules/runtime/toolprotocol/result.go` 将参数错误映射为 `correct_arguments`。若修复，仅标记确定的草稿入参错误，保持权限、存储和网络故障的原有语义。
- 原会话重试与纯草稿交付优先在 `agent-resources/prompts/evolve-tuning-agent.md`、`skills/target-recon` 修正。重试以新工具回执为依据。保存真实可执行快照时优先复用服务端生成的完整 payload，并保持原业务、Work 和基线身份。若做代码传递，明确区分基线读取与草稿写入授权，保留人工确认。

## 2026-11-10 草稿错误和基线转交修复

**Why**

共享目标侦察 Skill 中曾要求遇到读取权限错误后不重试，并转向业务管理员补权。该规则与当前环境的 EVOLVE 系统身份冲突。较大的基线结果还会在模型视图裁剪，模型手工拼回 VariantManifest 容易丢正文或资源引用。

**How to apply**

- 回查 [Maxwell PR #427](https://github.com/world-sim-dev/maxwell-ai/pull/427) 的提交 `7930b9802` 及 `agent-resources/prompts/evolve-tuning-agent.md` 与 `skills/target-recon/references/target-connection.md`。旧 Work 重试以实际重调后的回执为准。先交用户要求的评测草稿，按需准备正式 Run 的依赖。
- 沿 `commands/draft.go`、`app/toolcaller.go` 与 MCP `draftSchema` 查 `evolve_draft put object=profile` 的可选 `baseline` 参数。使用同一业务和 Work 的 executorRef、presetVersion、baselineHash，沿用基线读取与草稿写入权限。服务端重取或读回固定的原生快照，核对版本和哈希后写待确认草稿。格式错误沿既有可纠正入参映射，读取故障保留原错误。
- 验收入口为 `TestDraftToolMarksOnlyInvalidDraftContentCorrectable`、`TestDraftToolSavesFullMaxwellBaselineWithExistingPermissions` 及 `agent-resources/tests/evolve-orchestration.test.mjs`。测试覆盖现场两种无效结构、长配置完整保存、版本变化与授权边界。线上旧会话验收须分别核对服务版本和实际加载的调优 Prompt、Skill。

## 2026-11-10 PR #427 与全新业务 Dev 实验

**Why**

Studio 和 EVOLVE 发布成功后，另一个分支部署的 Agent API 仍可能缺少系统读取鉴权。新业务可读已接入的配置并创建评测资产，默认 Judge 与隔离试跑权限仍是独立前提。

**How to apply**

- [Studio 与 EVOLVE API/Worker 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42787265940) 对应主线 `3d6a7be2`。原 Dev 的 [Sandbox Agent API/Worker](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42781532136) 来自未包含 #424 鉴权的 `c2635bb86`。对照实际 Agent API 源提交，而非只看 EVOLVE 部署。用合并两边的 `d99bc8ce5` [配套发布 Agent API/Worker](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42789319498)，保留 Sandbox 验证。未执行迁移。
- 共享调优 Preset 在线绑定 orchestration-v4 和内嵌说明的 target-recon。现有 GitHub 来源目录为空，本次仅在原资源中更新 #427 的重读与基线转交说明，保留其它线上规则。原 Vidmuse Work 在配套发布后实际读取到了 Preset、Prompt 与 Skill。自然语言恢复仍走手工回填并遇到资源哈希错误。明确使用工具的 `baseline` 字段后，原 Work 读回可确认的执行方案 v3。已有 Cases/Judge 仍在，未运行原任务。
- [新业务 Benchmark v1](https://agent.sandaii.cn/evolve/library/benchmarks/bench_ed10eccb270ee9ddfc2c7983080b30dd?businessId=8a0b2684-7779-4aca-883d-77086656b20e) 是实际验收入口。选本业务 Preset 完成注册，Agent 写 3 题、3 维 Judge 和 Benchmark。聊天中确认后，在用例库回读正式用例。冻结 Judge 另存共享后进入评分目录，零运行页回读首跑卡。
- 新业务用默认评分模型提交时缺模型设置，运行前需选择可用模型。首次 DeepSeek 运行重复请求模型未得到完整回复，取消后保留记录。选 Gemini 后 [复验记录](https://agent.sandaii.cn/evolve/library/records?businessId=8a0b2684-7779-4aca-883d-77086656b20e&run=run_a9f453e676074b2fba56bebd0898f50e) 回读 1 通过、1 失败、1 执行错误。澄清题触发目标提问而 Case 未声明 `input.interaction`，不能计作客服答错。取消题真实输出声称已代办，权限边界维度为 0/5。
- [从复验创建的调优任务](https://agent.sandaii.cn/evolve/tasks/work_2fabc9e1e1c882deb4fe1aabffa81cfa?businessId=8a0b2684-7779-4aca-883d-77086656b20e) 继承评测来源。实际预检明确缺原生隔离试跑和关联 Runner。沿 `maxwellpreset/client.go` 核对注册时受管 Key 只补基础执行及可读权限，原生试跑还校验 Preset/Prompt/Skill 写权限。#424 的系统身份授权只限三项配置读取。Agent 基于真实取消题失败保存了可审阅的系统 Prompt 候选 v1。候选复测、应用证明和临时资源回收尚未验收。

## 2026-11-10 新业务默认判卷与草稿指标入库

**Why**

用例确认和冻结已经调用正式用例目录。旧式 Judge 的维度只存在于 Rubric 与旧式试次分数中，另存该 Judge 也不会产生独立指标。Maxwell 原生消息若转发完整的交互题输入，模拟用户答案会在首条消息里暴露给被测 Agent。

**How to apply**

- 在 Maxwell 的 `application/evaluation/judge_config.go` 查新评测的模型选择优先级。已有显式选择或冻结模型按原运行使用，未设业务默认才回落到平台默认。通过 `native_llm_admission_test.go` 验收业务配置优先、运行快照和重试。
- 按 `agent-resources/skills/judge-design` 起草原生指标。Studio 确认并冻结后，在 `commands/reviewed_judge_metrics.go` 查独立 MetricSpec 发布、Judge 引用及目录重试。验收要同时检查用例库、指标的评分依据、Run 记录的同一指标修订。沿同名测试查本地替身端到端；已冻结旧 Judge 不回写。
- 交互题按 `skills/case-design/examples/case.interactive.yaml` 写模拟答复；沿 `maxwellexecutor/case_text.go` 核对首次只给真实用户输入，`live_interaction.go` 在收到提问后才使用应答规则。
- 区分系统身份覆盖的业务与 Agent Server 接受的操作。沿 `evolve_config_read_auth.go` 查现有签名身份的三项读取能力，沿 `native_tuning_baseline.go` 查隔离试跑仍消费的权限。复用同一个系统身份，签名有效期属于服务端凭证机制，不需要每次试跑由业务方审批。调整现有路由鉴权时遵循项目变更治理。

## 2026-11-10 原生隔离调优与系统身份的试跑范围

**Why**

业务能读取配置、普通评测能执行，不代表原生候选能创建并回收副本。隔离调优的目的，是在同题同评分口径下验证候选配置，避免影响正式 Preset 和其资源的引用关系；不等于复制目标的外部数据或工具写入空间。

**How to apply**

- 从 [Maxwell PR #428](https://github.com/world-sim-dev/maxwell-ai/pull/428) 的 `maxwellexecutor/frozen_preset.go`、`archived_cleanup.go` 和 Agent Server 的 `evolve_config_read_auth.go` 追踪授权、落地回读和释放。复用 EVOLVE 已有签名身份，沿原有接口按业务、源 Preset 和试跑归属创建及更新试跑副本。旧任务按其已有凭证路径恢复，不以凭证变化重算配置版本。试跑停稳且证据已归档再清理该次独占 Preset、Prompt、Skill；Thread 按现有保留策略。正式配置切换是后续独立操作。
- 验收同时核对 Dev 的 [Agent API/Worker 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42809011460) 和 [EVOLVE/Studio 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42809489260)。前者的 `b39bf370` 包含主线 `6c55cfd7`，另有 Sandbox 改动；同环境按发布队列串行。首次完整发布卡在 Worker 镜像层推送，未进入集群切换即取消。后者成功后读回 CDN 的 Studio 版本 `cicd-42809489260-1`。合并、构建、发布和实跑分别取证。
- 代码仓库有新 Skill 不代表当前 Preset 会加载。Dev 的共享调优 Agent `746f0d19-f019-4b04-b09e-78305744e603` 没有配置 GitHub 来源，按实际已绑定的资源发布 Prompt 和 Case/Judge Skill，保留既有安装 slug 以及引用。用全新业务分别验证公开指标入库、基线和候选同题分数、试跑回执、临时配置回收以及正式配置保持。发布回执不等于实跑成功。
- [新业务自然验收会话](https://agent.sandaii.cn/evolve/agent/agent_session_e3ca33dfd084cc3fde8b6ef52600b1e8?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c) 先用本业务 Preset 无密钥接入，再确认真实基线读取和草稿。首条对话只交文字提案；补充正式规则、明确保存后产生三题和三项指标。交互题使用三条独立匹配；复合正则必须用约定的斜杠包裹，否则按字面值匹配。独立 critique 返回模型服务 HTTP 500，继续保存草稿并单独验证正式评分。确认后从用例库、指标目录读回各三项，指标下展开评分配置的具体指标可查 Prompt、证据路径和分值区间；[正式 Benchmark](https://agent.sandaii.cn/evolve/library/benchmarks/bench_2f2475cbb3be7da107abb44fc8aae8cc?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c) 由 Agent 生成。首轮从 Benchmark 发起且未覆盖业务默认模型。


## 2026-11-10 新业务实跑：判卷温度、候选清单与交互回收

**Why:** 一次运行没有分数不必然是权限故障。评分的必填证据、模型请求参数、候选冻结的配置清单、交互应答和回收是不同阶段，错误需按原件区分。

**How to apply:**

- 原 Judge 对非交互题要求不存在的 `/interactions`。改成实际归档的 `evidence`/`caseData` 后，同一 GPT-6.1 Sol 在[旧证据重判，温度 0](https://agent.sandaii.cn/evolve/library/records?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&run=run_bb9bcd61d8c4c84e11a224929a0896d6)无分；[三题新跑，温度 1](https://agent.sandaii.cn/evolve/library/records?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&run=run_27343b5fa9fdde6e64ce8fa31659ae11)有 9/9 项分数。两次的原件不同，当前 GPT-6.1 Sol 的上游拒绝正文未取得；参数判因参见 [Judge 参数排查](../pitfalls/evolve-judge-model-parameter-rejection.md)。[PR #430](https://github.com/world-sim-dev/maxwell-ai/pull/430) 仅调整未配置业务的新判卷默认值（GPT-6.1 Sol、温度 1），不回写显式业务设置或历史冻结参数。
- 候选只改 Prompt/Skill 也需要保存完整冻结配置。首个候选被 `frozen Preset requires its complete configuration inventory` 拒绝，未创建副本。沿 #430 `commands/native_tuning_baseline.go` 和 `commands/draft.go` 核对如何从同任务的冻结基线补回遗漏的 `preset.json`，并用清单摘要保护基线版本。已冻结的无效候选用新修订。
- [补齐后的隔离试次](https://agent.sandaii.cn/evolve/library/records?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&run=run_fc40b99d383a5badb7effeedd05afff5) 的原件确认 `isolated_preset`、`applied=true` 和 `runtimeVerified=true`。临时 Preset 曾在目录可见，运行停稳后从目录消失，独占 Prompt 和 Skill 在各自目录无残留。正式配置仍在，[执行 Thread](https://agent.sandaii.cn/threads?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&threadId=thr_01M72R561QZYM7SZKWN5CMHJFQ&tab=trace)可回看。这个旧试次没有有效评分，不能当提升对照。
- 同一试次的中断原件有实际提问，但脚本记录 `question:""` 和 `basis:"default"`。Maxwell Runtime 的新问卷用 `title` 存问题；沿 #430 `maxwellexecutor/reply.go` 查 `title` 优先、兼容旧 `question` 的修复。验收要在运行交互原件确认匹配规则和提交值，不能只看 Thread 成功。
- [#430 Dev 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42820880073) 的 Evolve API 和 Worker 滚动完成，Studio CDN 读回 `cicd-42820880073-1`，主线 `0778c515`。随后在共享调优 Preset 绑定的 `judge-design` 上读回可选证据说明和更新后的原生指标示例。此前授权与 Agent API/Worker 版本沿 #428 的发布回执核对。
- 新版本用未配置模型的业务从 Studio 启动[隔离基线](https://agent.sandaii.cn/evolve/library/records?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&run=run_1811d56fe3e5d4aa8e2d0d32af2b9d0c)，冻结回执为 GPT-6.1 Sol、温度 1、每题 1 次；三个用例各有三项分数。自然调优 Agent 依据实际失分提出 Prompt/Skill 候选，从新版 Studio 以同一题集和评分配置启动[隔离候选](https://agent.sandaii.cn/evolve/library/records?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&run=run_6224babee33ec67c8c2098cf4b307bab)，仍有 9/9 项分数。
- 候选的交互题原件实际 `question` 为「预约编号」，`basis` 为 `rules[2]`，返回合成编号，最终回复带编号指引去服务台。候选三个临时 Preset 在途可见，结束后全部从目录消失；试跑 Prompt 搜索无匹配，Skill 搜索只保留正式项，[候选 Thread](https://agent.sandaii.cn/threads?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&threadId=thr_01M72SFMS30DK57DC84REA6Q6P&tab=trace) 仍能回读真实工具应答。以上验收目录回收和正常 Thread 留存，不用于推断物理存储删除。
- [调优任务](https://agent.sandaii.cn/evolve/tasks/work_06f2c154fabcda3434948b5eaa6e492a?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&candidate=candidate_73f1c368c16dd58a7e7f1516479466a2&candidateRun=run_6224babee33ec67c8c2098cf4b307bab) 的「评估与采纳」确认比较口径一致并判定未达标：交互题澄清从 0/2 到 2/2，通用期限题的办理指引从 2/2 到 1/2，未采纳。另存了冻结报告，详情抽屉未渲染可读摘要，数值和结论从「评估与采纳」读取。数值评测按 `outcome.mode: none` 不产生整题通过率，不能将「判卷通过率暂缺」解释为未出分。

## 2026-11-10 同原件重判与候选回退归因

**Why:** 温度是判卷调用参数，试跑质量是目标输出与冻结判据的比较。换一批输出做温度对照无法排除证据变化。候选某一项加分，也不能覆盖另一项约束退步。

**How to apply:**

- 从[温度 0 的重判](https://agent.sandaii.cn/evolve/library/records?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&run=run_bb9bcd61d8c4c84e11a224929a0896d6)查冻结模型、输出上限、原 CaseSet、Variant、EvidenceSet、JudgeSpec 和聚合条件。`POST /api/evolve/v1/runs/{runRef}/rescores` 现有契约接受 `judgeConfig.temperature`。保持其余参数，追加 `evidence_only` Run 并核对来源回执；Studio 的原重判表单只让换模型，保留原温度。业务级的人类重判命令与 Agent 会话绑定的 `evolve_run` 授权范围不同，历史记录能在目录打开不等于当前会话能跨 Work 读取。
- 在[候选任务](https://agent.sandaii.cn/evolve/tasks/work_06f2c154fabcda3434948b5eaa6e492a?businessId=83ee4fb8-cc20-4d97-a286-78b201f44e0c&candidate=candidate_73f1c368c16dd58a7e7f1516479466a2&candidateRun=run_6224babee33ec67c8c2098cf4b307bab) 展开初次候选草稿前的工具组。直接查询失败包含参数缺失与跨 Work 拒绝，随后 `evolve_evidence_query baseline` 三次逐题返回成功。期限题完整回执 `call_oeCQQfzMuklsO8jrDgsbtzsq` 含基线答复和服务台指引的 2 分理由，不能归因为该证据没送到分析 Agent。候选 Prompt 和 Skill 都增加通用题直接回答的分支，但将服务台引导写在收到预约号的分支，未把已通过题的关键行为列成候选回归约束。逐题对照证实候选答了 3 天、自动释放与重新预约，少了服务台办理路径，冻结 Judge 因此给办理指引 1 分。逐题判据对通用期限问答是否强制补服务台属于口径选择，应区分实际答复变化与评分定义是否合适。
