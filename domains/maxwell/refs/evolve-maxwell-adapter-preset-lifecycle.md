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
