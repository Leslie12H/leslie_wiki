---
name: vidmuse-stateless-adapter-implementation
type: project
created: 2026-09-12
updated: 2026-09-12
tags: [maxwell, vidmuse, a2a, adapter, checkpoint, dev-release]
links: [vidmuse-executor-p1, vidmuse-executor-candidates, vidmuse-a2a-executor, workflow-catalog-thread-plugin]
---

# VidMuse 无独立数据库 Adapter 实施指针

**Why:** 用户明确指出 Zeus/AION 已保存 Thread 与业务数据，Maxwell 已拥有调优调度状态。P1 把独立任务库、租约 Worker 和证据副本放入 Executor 扩大了适配层职责。当前方案复用状态拥有方；去掉独立库仍需处理创建响应未知、身份绑定与版本核验。

**How to apply:** 先读[飞书完整方案](https://j0yswlgboxz.feishu.cn/wiki/FXkdwOqIpiSfrNka96vc07jnnFc)及 Adapter 的 `docs/stateless-adapter.md`，再按下表追到对应 PR 和契约文件。飞书正文已按章节更新并回读；合并与部署决策仍须核对当前 PR、工作流和运行证据。不要把 Executor PostgreSQL 当作部署前提，也不要因移除代码依赖就删除旧库或真实数据。

## 状态归属

| 归属 | 负责内容 | 查证入口 |
| --- | --- | --- |
| Maxwell EVOLVE | Case、冻结 baseline/Variant、Attempt 调度与请求、远端句柄、预算、判分及比较 | Maxwell PR #286；既有 limits_json、Attempt.request_hash 与 ObjectStore |
| Zeus / AION | 账号权限、额度计费、产品与原生 Thread 绑定、消息、运行状态、产物及 checkpoint | Zeus PR #523、AION PR #1754；既有 Thread/context 和产品创建链路 |
| Git / Plugin 发布 | 源 commit、Work 分支、候选完整包与公共依赖版本、DEV 完整 release 树及发布回执 | Adapter 候选模块、Plugin PR #1832 |
| 无库 Executor | A2A 协议适配、身份/冻结验证、产品 API 调用、受认证加密句柄及取证转换 | Adapter PR #1；没有独立任务数据库、持久队列或租约 Worker |

Git 持久目录保存源码、版本和准备 ref；发布回执保存安装产物身份。它们不能扩展成隐藏 KV 任务系统。候选控制面需持久 Git root、单写入实例；进程内锁不代表多副本互斥。部署边界见 `docs/candidate-control-api.md`。

## 实现与验证入口

以下是 **2026-09-12 前序草稿切片的交付指针**；最新 runtime 交付见文末。这部分记录当时的交付，不代表当前 PR/部署状态；当前状态以文末合并核验入口实时读取为准。

- [Maxwell PR #286](https://github.com/world-sim-dev/maxwell-ai/pull/286)：`docs/evolve-nonreplayable-adapter-contract.md`。复用既有状态承载，冻结原始请求并禁止不安全重发；无新表/列。最新控制面含 `prepare_publication`、`inspect_checkpoint_sample`，已推送 [d737c659](https://github.com/world-sim-dev/maxwell-ai/commit/d737c65981cb982aa76536b23df51f9cad7389d5)。
- [Adapter PR #1](https://github.com/world-sim-dev/vidmuse-executor/pull/1)：`internal/modules/execution/application/{handle,service}.go`、`infrastructure/zeus/{client,checkpoint,snapshot}.go`；见 `docs/stateless-adapter.md`、`docs/native-checkpoint-adapter.md`。本轮 publication/原生导入/继承产物防护已推送 [b226112](https://github.com/world-sim-dev/vidmuse-executor/commit/b226112f09fcd7f71b57ac9589773aabcea6890d)，全量 Go race、vet、Linux build 通过；仍按草稿核对，不作为已部署能力。
- [Plugin PR #1832](https://github.com/world-sim-dev/vidmuse-plugins/pull/1832)：已推送提交 [c97f7bb](https://github.com/world-sim-dev/vidmuse-plugins/commit/c97f7bb1b158e17d2d36e385eabb95bded4bdffe)。真实可执行入口为 `.github/workflows/dev-candidate-release.yml` 与 `scripts/dev_release/`，部署合同、外部前置及复现命令见该目录 README。16 项离线 Git/真实 verifier 集成测试与 actionlint 通过；没有触发真实发布。
- [AION PR #1754](https://github.com/world-sim-dev/aion/pull/1754)：checkpoint 字节清单见 `packages/checkpoint_manager/README.md`；本轮原生续跑草稿切口为 `native_replay.py`、Manager `service/native_checkpoint.py` / `plugin_release.py`、Runner `native_checkpoint_startup.py` 及 DEV overlay。原生实现见 [a5afa323](https://github.com/world-sim-dev/aion/commit/a5afa323)，Manager/package 405、Runner 140、最终合同/Git/K8s 66 项本地回归通过。旧 snapshot 的 `ready_to_run=false` 与新增原生运行准入应分开核对；历史缺失资产不会被新捕获能力补齐。
- [Zeus PR #523](https://github.com/world-sim-dev/vidmuse-zeus/pull/523)：`docs/checkpoint-product-relay.md` 与 `CheckpointTransfer` / `AgentService`。已推送并回读 [4ffa2003](https://github.com/world-sim-dev/vidmuse-zeus/commit/4ffa2003018304e76cd97064d87e701880985406)，含进度等级和继承产物摘要。复用产品鉴权、权限/额度、Thread 映射与既有 outbox；没有新表。

候选准备合同见 Adapter `docs/candidate-publication-preparation.md` 与 `docs/dev-candidate-bundle.md`。`prepare-publication` 的完整包和 descriptor 进入独立 Work commit，明确 `prepared=true`、`published=false`、`applied=false`。源 commit、候选 commit、实际 DEV release commit 是三个不同身份；不能拿准备回执代替已发布观测。

## 已核验的协议细节

- A2A SDK 的 map 序列化会改变冻结 JSON 字节或数值精度；协议用 `rawContentBase64` 保留原文并比较精确语义，明确 `applied=false` 不能进入旧 hash 回退。见 Maxwell PR #286 与 Adapter contracts。
- Zeus Thread 的实际 JSON 所有者字段是 `owner`，不是 Java 成员名 `isOwner`；查看 `AgentThreadVoCreateContractTest`。账号来自 `/api/v1/user/profile`，实际 Plugin 来自 Thread options。
- 认证加密句柄仍受 Maxwell 500 字符约束，完整上下文归 Maxwell；保留在用密钥与配置。存量 Attempt 未冻结原始请求对象时不能声称具备新的重试保证。
- 当前资产路径可能被覆盖或混入后续节点资产；不能用当前目录证明旧节点。文件清单、恢复闭包和运行准入分别核验。私有目录必须检查真实 Caddy/PVC 映射，增加摘要不会改变公开路径的访问权限。见 AION checkpoint README。
- 飞书两张架构图的源文件与实际云预览验证指针：`/private/tmp/vidmuse-node-audit/diagrams/2026-09-12T180000/verification.json`；正文与图以实际回读为准。

## DEV 发布与版本隔离

- 每个候选有完整独立 `eval-*` Plugin ID；公共 Skill/workflow 冻结到候选专属不可变版本并重写候选引用。候选发布不改源分支、普通 Plugin、DEFAULT/latest 或在用候选。普通 main 更新仍可修改其普通资源，但必须完整保留已发布候选。规则与实际重建验证以 Plugin publisher README 和 Adapter `docs/dev-candidate-release-contract.md` 为准。
- DEV Manager 使用 PVC subPath 挂载，直接替换挂载目录不能保证现有 Pod 看到新 inode。因此保留稳定父目录 `/work/aion-plugin-base-dev`，仅在其内部原子切换 `current` 到保留的完整不可变 release。AION 必须在创建/导入时解析一次，冻结真实 release/root，后续 config、archive、Skill 与 Runner 挂载沿用该绑定；不能重选 HEAD。
- 正常 main DEV 刷新与候选发布使用同一可信 publisher、目标锁和 CAS。可信程序来自受保护的完整 commit，候选只作为待验证数据。实际文件/完整树验证后的 `devReleaseCommit` 才是发布身份；`inspect` 已接通可信 catalog 导出，Adapter 加载后解析固定运行版本。受控产物交付是信任边界，布尔标记或 SHA 本身不是认证。
- Plugin #1832 曾将 main 的旧 DEV reset/pull 路径改走新工作流；后续 [#1844](https://github.com/world-sim-dev/vidmuse-plugins/pull/1844) 在 publisher 未初始化时恢复普通 DEV 路由，保留候选 workflow 供后续启用。当前普通 DEV 更新不能被当作候选隔离发布已经接管。**历史分支仍可能持有旧 Aliyun 权限**；必须在外部撤销旧凭据对 DEV 的 RunCommand 权限，并限制新 DEV 身份/Environment，代码不能替代 IAM 撤权。
- 共享文件系统锁/原子操作、只读运行挂载、实际 PV quota、保护分支与版本 pins、首次 bootstrap 和 AION 显式启用固定路径仍为启用前置。发布成功只证明安装字节；不证明 Agent 已加载、读取或执行。

## 原生节点续跑与证据边界

- recreate 从原输入重新开始；restore-checkpoint 会改原 Thread；export-timeline 排除原生历史且可能初始化文档。本轮路径是固定来源只读导出、冻结 source product/AION Thread ID、checkpoint/full commit、manifest/archive hash，再导入新的 DEV Thread，显式 activate 后发送新消息。私有字节以有界、立即 unlink 的临时文件流转，不进公开静态目录或 LLM 工具输出。
- 专用源读取凭据、固定源 HTTPS origin、账号校验与固定 GET/HEAD 路径约束由 Adapter 执行；**产品 token 未新增只读 scope**。该凭据在 Adapter 外的权限不能被描述成天然只读。身份以实际账号与产品权限为准，Token 本身不提供分支/执行隔离。
- `runner_authenticated` 只表示通过 Runner 身份提交的进度。同一 Runner/工具环境仍可能伪造该请求，不能升级成不可伪造的 `model_input_observed` 或最终生成证明。startup-resolved、model-read、tool-executed 三层必须分别验收，缓存存在或 SHA 回显不等于已加载/执行。
- AION 在新 Thread 导入时冻结继承产物身份，Zeus 透传，Adapter 匹配本次实际 native message ID 与进度。最终视频通常覆盖同一路径，因此不能用路径字符串 hash 判断媒体是否更新；内容摘要和原始引用绑定的修正见文末三仓合同。该证据仍不消除 Runner 自报局限；只有另行完成 catalog/runtime 清单独立核验才报告 `applied=true`。具体落地和回归看 PR 与 `docs/native-checkpoint-adapter.md`。
- 创建/输入响应未知时不能自动重发；已知新 Thread 通过查询恢复观察，不能假设 exactly-once 或在改变账号/配置后复用旧句柄。AION 全量 context JSON 写入须防止并发覆盖输入预留与进度，修复切口在 `native_checkpoint.py` 和通用 Thread 更新的行锁/fresh merge；验收需检查最终版本及回归。
- AION 消息单页升序、分页从新到旧，多页需恢复全局顺序，旧 timestamp 可能为空。取消不能依赖历史/产物取证；原生路径也不能绕过本次输入边界，把旧完成状态降级当成功。

## 尚未完成的验收

合并与自动 DEV 发布的核验入口见文末；业务空间登记、真实生成或节点 A/B 闭环仍未完成。无库 binary 通过 Maxwell checker、marker probe 通过均不证明候选应用。

可信 catalog、固定 DEV candidate、实际启动清单与 Maxwell 比较入口已完成本地跨实现核验，见下节最新指针。仍缺真实部署及完整任务/节点 A/B 媒体质量验收。启动包证据不等于 model-read/tool-executed。大 snapshot 可恢复准备仍未实现：当前短 A2A 预算包含全量下载、导入和启动，HEAD 也读验全包；不能只放宽大小/超时或加隐藏 Adapter 库。下一步应核对产品拥有的准备阶段、映射落库屏障与只读 GetTask；源凭据迁移和 capture 对象语义以最终方案/代码为准。

## 2026-09-12 可信发布目录与运行回执交付

**Why:** 发布包、实际启动清单和 Maxwell 接收预算属于不同合同。单仓通过或 Plugin ID 回显不能证明链路可以接收、执行和比较。

**How to apply:** 先阅读 Adapter `docs/approved-release-execution.md` 和 `releasecatalog/testdata/README.md`，运行 `scripts/contract-fixtures/finish`，再按 Maxwell `docs/external-candidate-control.md` 核验实际解析/比较入口。fixture 的 Git/cache 字节来自真实本地实现，产品与媒体元数据为测试数据；不要当成上游提交或部署证明。

本次实际推送并回读的 runtime slice：Adapter [9b971d0](https://github.com/world-sim-dev/vidmuse-executor/commit/9b971d0847a7d93bf51fabec1d790cf3bd6f857e)、Maxwell [5a22b7bc](https://github.com/world-sim-dev/maxwell-ai/commit/5a22b7bcf036b0b875d419070623e2242426b3f0)、AION [c5e045b5](https://github.com/world-sim-dev/aion/commit/c5e045b5fc4c3a0d29d663ef77a9f283960edc77)、Zeus [27f0e9c2](https://github.com/world-sim-dev/vidmuse-zeus/commit/27f0e9c21868b7f743883b05202d5dbffa662563)、Plugin [e910f6d](https://github.com/world-sim-dev/vidmuse-plugins/commit/e910f6dfcee251df91c26cf6802b9c1c35303afd)。这些提交记录合并前的历史切片；当前状态以 PR 和文末核验入口为准。飞书正文已精确回读至 revision 132，第 6 章原画板已更新并检查云端实际显示；两张主架构图保留。

- Publisher 的 `inspect` 已输出可信只读 catalog，Adapter 启动时验证并按 Work/Variant 选择固定 release；无执行请求自动发布，无热更新。保留原发布绑定，不随 current 改变或重启切换。
- AION 缓存有 local Skill 副本、common 覆盖和 `.resolution.json`，必须比较完整缓存。缺少真实 `@workflow` 声明的包可能通过发布测试但被 AION 拒绝。
- 无变化发布不能覆盖首次成功回执，否则丢失候选与实际 release 的追溯绑定。核对 Plugin publisher 的 retained/no-op 回归。
- 合法长路径经 JSON 转义会突破 Maxwell 64 KiB receipt，现按真实 Finish 和最大晚到字段在 catalog 加载时预算拒绝。素材 URL 按 Zeus 的 UTF-16/序列化总长在 POST 前拒绝，避免错误记成创建未知。见 `receipt_budget_test.go`、`release_input_validation_test.go`。
- `runner_authenticated` 是启动包实读和绑定证据。普通及原生任务只有完整清单验证后才可报告 `applied=true`；它不是模型逐文件阅读、工具实际执行或媒体质量证明。
- Maxwell `inspect_publication` 先调用同一控制目标的 baseline；只读 catalog 副本不能代替这个 MCP 前置。控制写入保持单实例，A2A 副本不需要 Git writer。
- 飞书画板本地 SVG 正常而云端背景遮图时，检查生成 payload 的顶层 `z_index`。本次按 SVG 顺序显式设置后，云端文字/节点及预览均通过；不要把白色加载占位图当作视觉验收。证据曾保存于 `/private/tmp/vidmuse-node-audit/diagrams/2026-09-12T135331/verification.json`，当前效果以文档第 6 章重读为准。

## 2026-09-12 容器交付与产品准备预留

**Why:** 无库 Adapter 仍需可部署镜像入口；长快照不能在一次 A2A 请求里完成下载和恢复。准备意图应归产品持久状态，不能移到 Executor 的隐藏队列。映射确认与重 IO 是两个不同动作。

**How to apply:** 查看 Adapter [03c26d9](https://github.com/world-sim-dev/vidmuse-executor/commit/03c26d90d18016c88c94e778f5b2b478f72865aa) 的 `docs/container-deployment.md`，以及 AION [e02c7251](https://github.com/world-sim-dev/aion/commit/e02c725144e011edd565ffc1e51997973e7de8ad) 的 `docs/checkpoint-prepare-reservation.md`。这两个提交是后续草稿切片，实际启用需核对最终 PR、默认关闭的配置和缺失阶段。

- 容器分 execution 和单 Git writer control，均为 non-root。Linux 双架构编译、真实上下文过滤与 BuildKit 静态检查已做；Docker daemon 不可用，未 build/run 镜像，不作为部署证明。句柄密钥、只读 catalog 和 Git 版本目录需保留；任务数据仍不在 Adapter。
- AION 预留在既有 Thread/Task 同事务保存完整 intent 和 `checkpoint_prep` 阶段；同账号/项目/request 重复必须匹配完整 hash。小 JSON reserve/query/confirm/cancel 默认关闭，确认只到 queued，prepared/dispatched 为 false，message ID 未产生。27 项新测试及相关回归的命令/边界见文档；没有新表、字段或外部迁移。
- Zeus 已有 `AgentThreadPostCreateOutbox` 能覆盖产品映射事务提交后、确认响应丢失的窗口：新增独立确认事件并同事务校验完整 binding，consumer 短调用 AION；无需另造反向 mapping-proof API。该 producer/consumer 尚未实现。先部署可解析新 enum 的消费者，再启用写入，重复 event key 不应掩盖不同 payload。
- 采样 capture 可为内部 AION 对象，不创建普通 Zeus Thread 或奖励事件；但必须一起实现普通列表/计数/消息/文件/Runner 隔离，不能仅靠“没有 Zeus 行”。当前代码只预留运行目标，capture 与后台 materializer 未实现。
- Maxwell 既有 `inspect_checkpoint_sample` 是立即返回小冻结引用的只读动作；异步采样需要独立 prepare/query。Adapter 既有同步 handle 要求真实 message hash，异步预留不能用空/假 hash 兼容；应绑定 frozen intent，并只读核验后续真实输入接受与进度。上述异步接入仍待实现，不能把预留测试算成节点 A/B 闭环。
- 飞书第 8.1 节记录当前准备合同与缺失阶段，第 11 节补充容器交付及镜像未验证边界。源码与正文应按当前提交/局部回读核对，不沿用旧“必须部署 Executor PostgreSQL”的前置。

## 2026-09-12 合并与自动 DEV 发布核验

**Why:** main 合并可能触发既有 DEV CI/CD；源码合并、发布准备和真实调优是不同完成条件。全套 CI 会共同收集 Manager/Runner 测试，单目录通过不能证明导入隔离。发布器未初始化时直接切换普通创建路径会使 DEV 创建报 503。

**How to apply:** 读取上方五个 PR 的当前 merged/head/checks 状态，并核对 [Plugin DEV 发布](https://github.com/world-sim-dev/vidmuse-plugins/actions/runs/34684779648)、[Zeus DEV CI/CD](https://github.com/world-sim-dev/vidmuse-zeus/actions/runs/34684802492)、[Maxwell main CI](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34684756801) 和 [AION 当前 PR 检查](https://github.com/world-sim-dev/aion/pull/1754/checks)。不能把“已合并”当作“调优可用”。

2026-09-12 最终合并核验：上述五个原始 PR 与内容证据配套 [Executor #2](https://github.com/world-sim-dev/vidmuse-executor/pull/2)、[Zeus #524](https://github.com/world-sim-dev/vidmuse-zeus/pull/524) 均已合并。AION #1754 在当前 head 的 24 条审查线程全部解决、自动审查完成、[四项必需检查通过](https://github.com/world-sim-dev/aion/actions/runs/34694638228)后合并；后续 [AION DEV 流程](https://github.com/world-sim-dev/aion/actions/runs/34695481128)的发布结果须单独读取。Zeus 最新 DEV 结果见下方 #524 记录。Executor 部署、候选 publisher 初始化、异步 materializer/outbox/接入及真实 A/B 尚未完成，不因源码合并而归档项目。

- AION 测试隔离修复见 [4ce2a49d](https://github.com/world-sim-dev/aion/commit/4ce2a49d58f34f627a2eb8c97519f731ed4a4bb4)：运行时导入进入可恢复的 module fixture，SQLite 路径按模块隔离。Manager/Runner/checkpoint 混合 644 项通过、1 项跳过；最终全套结论看当前 CI。
- AION [1ab12abf](https://github.com/world-sim-dev/aion/commit/1ab12abfa091736f69b770c27749d9ef1fab7bbc) 将 `current` 和私有 checkpoint 卷改为显式启用的 `patch-native-checkpoint-release.yml`，默认 DEV kustomization 不引用。先完成 publisher/IAM/bootstrap，验证目录与保留版本，再启用补丁；配置缺失时固定候选应拒绝，不能退回 mutable HEAD。默认与启用后 manifests 均已本地渲染，Plugin/runtime 16 项通过、1 项跳过。
- Plugin 发布器四项必填变量的配置入口在受保护 `vidmuse-plugin-dev-publisher` Environment：`DEV_PLUGIN_PUBLISHER_COMMIT`、`DEV_EXECUTOR_COMMIT`、`DEV_PUBLISHER_INSTANCE_ID`、`DEV_PUBLISHER_REGION`。还须核对 DEV 专用权限、可信凭据及旧入口撤权；不能只补 pins 就宣称完成发布隔离。上述发布 run 在初始化校验退出，隔离候选发布需先完成这些前置。
- 后续普通路由恢复见 [Plugin #1844](https://github.com/world-sim-dev/vidmuse-plugins/pull/1844)；[main 普通 DEV run](https://github.com/world-sim-dev/vidmuse-plugins/actions/runs/34688810320) 已成功。因此上一条失败仅描述 #1832 当次运行，不能继续当作当前普通发布不可用。2026-09-12 再查该 Environment 变量列表仍为空，候选隔离发布必须先初始化，再协调主路由接管及 AION 固定路径启用。
- Maxwell 的通知工作流与产品 CI 分开核对：[合并通知 run](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34684756800) 曾在连接 `agent.sandaii.cn` 时超时；通知失败不等于 CI 失败，不自动重发可能非幂等的产品请求。

## 2026-09-12 原生续跑审查与完整 CI

**Why:** 输入预留、Redis 入队和异步工具完成不是同一时刻；把所有异常视为已投递会永久卡住尚未入队的输入，普通消息入口又可能绕过冻结输入。快照中安全的相对路径也未必可由 USTAR 编码，直接写证明文件则可能跟随源工作区里的链接。

**How to apply:** 读取 AION [b8bea025](https://github.com/world-sim-dev/aion/commit/b8bea025091fa4b97ddb2fdbd7576ed65efd6e70) 和 [该提交完整 CI](https://github.com/world-sim-dev/aion/actions/runs/34686758563)，并在 PR #1754 重读实际审查线程状态；不要用旧 review 当作新 head 已通过审查的证据。

- 只有明确发生在入队前的容量拒绝可重试原预留；改变输入冲突，未知投递不重发。普通入口须经过专用预留校验。原生成功终态在远程工具结束后上报，等待期间不持 Runner 锁；STOP 的失败终态见下方停止边界，不能被无法取消的工具阻塞。
- 捕获阶段验证最终 USTAR 路径（包括补充文件前缀）；证明文件通过目录描述符、独占临时文件及原子替换发布，现有或竞态符号链接不能改写目标文件。回归覆盖真实 Redis 容量竞态、远程完成/中断与链接目标不变。
- GitHub 完整 CI 曾暴露 3 个启动 fixture 失败和 14 个共享 namespace 导入错误；修复测试上下文及 fixture 恢复，不能弱化运行时校验。相关回归 340 项通过、1 项跳过，最终终态 5 项通过；完整套件以当前 CI 为准。
- 运行中 Actions 日志下载可能只返回冻结前缀。判断失败应优先取完成后的 JUnit artifact/check annotations；看到日志停在某个百分比不等于进程卡死。

## 2026-09-12 入口隔离与第二批审查

**Why:** 第一批修复通过完整 CI 后，自动审查在等待期间又提出新问题；只盯 CI 会漏掉真实的合并阻塞。冻结用户输入也不能阻止工具调用、账号事件或开启 auto-mode 向同一 Thread 注入额外工作。

**How to apply:** 同时轮询 head、必需 checks 与未解决 reviewThreads；审查的新发现应在 CI 运行时就处理。入口/快照修复见 AION [c526d1ac](https://github.com/world-sim-dev/aion/commit/c526d1ac78cfa595f4ddd566b9debf6395c46abf) 及[对应 CI](https://github.com/world-sim-dev/aion/actions/runs/34688339426)，最新合并事实仍读 PR #1754。

- 原生导入拒绝普通工具与账号事件，控制信号只允许取消类；检查必须先于任务写入、Redis 和 Runner 重启。准备中 Thread 的项目/账号列表在 SQL 分页前过滤 marker，context 保持延迟加载；取消/过期不释放 marker。测试是实际 SQLite 查询，不是 MySQL 执行计划或线上负载验证。
- 必需的结构化路径（包括裸文件名和截断输出指针）必须解析到已捕获目录；DSL 必须为 JSON 对象。捕获为两份 replay 元数据预留文件额度，导出复核最终数量。运行清单与终态均使用既有有界幂等重试，永久 4xx 不重试。相关回归及最终控制入口检查的复现证据放在 PR，不将这些检查当作真实 DEV 调优证明。

## 2026-09-12 准备失败与完整传输预算

**Why:** 进入模型步骤前也可能失败，不能为了满足状态机而伪称模型已处理输入；原始文件字节上限也不是 tar 归档上限，元数据、header、padding 和结束块都占上传额度。

**How to apply:** 阅读 [466d95d0](https://github.com/world-sim-dev/aion/commit/466d95d0e2d103a7bb9a3c149137dffadd6e4dc0) 的 `record_progress`、`native_capture_limits` 与真实缩小预算的导出/导入测试。准备失败仅在冻结目标 USER/DONE 已持久化后可直接 failed；completed 仍需匹配 processing。捕获提前扣除传输开销并限制每份元数据，导出再核对完整归档，不能靠扩大上传上限掩盖预算差异。

完整 CI 的队列时间戳测试还暴露了缺少 context 的 Mock，修复仅补真实 Thread 形状，见 [de732d27](https://github.com/world-sim-dev/aion/commit/de732d2765fbe9cb37f88848d14a1708523e75d6)；该文件 33 项通过，不能弱化业务入口检查。最终合并须读取 PR 当前 head 的 CI 与审查状态。

## 2026-09-12 STOP 与不可取消的远程工具

**Why:** 已运行的 Future 无法由取消排队任务的方法停止。成功终态需要等待结果，但把同一等待条件用于 STOP，会让已停止的续跑一直停留在 processing。步骤内部也可能先消费并清除 STOP 信号，不能只在 finally 检查 Event。

**How to apply:** 阅读 [8a0fa24a](https://github.com/world-sim-dev/aion/commit/8a0fa24a7c275b918c28904ebb7c4d19c653885d) 的运行循环与真实 Future 回归；STOP 在终态等待前或期间到达，或已在 step 内消费，都应及时报告失败并执行停止收尾。失败报告不代表外部媒体任务已物理取消；普通成功仍需等待远程工具。119 项相关测试通过，完整结论看[该 head 的 CI](https://github.com/world-sim-dev/aion/actions/runs/34690070894)及 PR 当前状态。

## 2026-09-12 准备工作区与处理前取消

**Why:** 准备预留的空 working_dir 经文件系统工厂拼接后会指向共享根目录，仅限制启动/消息不足以隔离文件接口。STOP 又可能取消尚未生成 USER/DONE 的原生输入；此时不能用“缺少已处理消息”拒绝真实取消，也不能伪造处理记录。

**How to apply:** 阅读 [11c9ce09](https://github.com/world-sim-dev/aion/commit/11c9ce09f42b3f231d903be3aed9e7fa11a17a4a)：公共权限路径先拦截准备预留，文件系统工厂拒绝空目录；原生失败终态接在 Manager 已确认的消息取消事务中，Thread 在消息行之前加锁，回滚及保留的 inbox 快照重试同时覆盖两者。Runner 保留已消费的中断标记，后续失败报告可幂等确认，不能改成成功。相关 555 项和公共调用方 300 项回归的完整验证入口为[该 head CI](https://github.com/world-sim-dev/aion/actions/runs/34690984868)；不新增 Adapter 数据库或伪造 USER/DONE。

## 2026-09-12 完整请求身份与导入工作区边界

**Why:** 仅比较 Plugin commit 无法证明同请求号重试仍是同账号、Prompt、选项和素材。准备预留受保护后，已激活的原生导入仍可能被普通文件编辑污染。工作区发布与数据库提交又不是同一个原子操作，清理必须区分未提交和提交响应丢失。

**How to apply:** 阅读 [87016fed](https://github.com/world-sim-dev/aion/commit/87016feda8715cdb15fb9af31477f2896a5056cb) 及 [1a109884 部署说明](https://github.com/world-sim-dev/aion/commit/1a10988496e7a668f7872ea90d5e7192403d3689)。首次创建同事务保存完整规范化请求 hash，同项目/请求的控制发布在既有共享 runtime 卷上串行；比较成功后才可返回旧 Thread。普通 artifact/file/document 写入拒绝原生导入，typed read 不创建缺失的 free canvas。导入捕获到异常后回滚并重新查回执，只有确认没有落库才删除本次发布目录；数据库不可查或已提交时保留，进程崩溃遗留仍需人工恢复。相关 520 项通过、1 项条件跳过；完整结论看[最终完整 CI](https://github.com/world-sim-dev/aion/actions/runs/34694638228)及 PR 当前状态。

同组入口复核还包括普通 `recreate_thread` / `reactive_thread`：它们会重新创建状态或以调用方选择的 auto_mode 启动，不能供原生导入使用。补充围栏见 [e37f82cb](https://github.com/world-sim-dev/aion/commit/e37f82cb1c12847a2cc8ee215140b5b3ac19f4be)，308 项相关检查通过；专用 activate/send_input 继续直接使用受控 claim/start 链路。该提交完整 CI 的唯一失败是已有子进程测试读到刚创建但未写入 PID 的空文件，修复见下节；最终结果读 PR 当前 head。

## 2026-09-12 视频内容身份与流式输入合同

**Why:** `FinalResultArtifact.save` 默认覆盖已有版本，`get_content()` 返回路径字符串。路径 hash 会误拒绝同路径的新视频，也会把换路径的旧视频当作新结果。普通流式消息另有独立入队实现，不能只保护非流式入口。

**How to apply:** 同时读取 [AION #1754](https://github.com/world-sim-dev/aion/pull/1754)、[Zeus #524](https://github.com/world-sim-dev/vidmuse-zeus/pull/524) 和 [Executor #2](https://github.com/world-sim-dev/vidmuse-executor/pull/2) 的当前合并状态。合同实现见 AION [09535528](https://github.com/world-sim-dev/aion/commit/095355288ca0e281c9b817f58b0b6a472641a1b8) 及 `NATIVE_REPLAY.md`、Executor `docs/native-checkpoint-adapter.md`：准备时冻结视频字节和精确脚本文本摘要，完成后返回带版本的当前内容摘要及原始引用摘要；Executor 先绑定实际返回引用，再比较内容。旧版或缺失的完成证据应拒绝，不能回退路径比较。Zeus 接受原生明确入队前容量拒绝的 retryable 状态，不自行重发。

视频摘要由 AION 对目标工作区稳定普通文件流式计算，Executor 不下载媒体或保存任务库。普通流式入口复用冻结输入校验，先于订阅、持久化和 Redis。相关 AION 181 项、Executor 全套 Go 通过；Zeus 补入当前 AION 真实 FastAPI/SQLite/Git 回执后，23 项契约测试全部通过。已有 PID 测试改为原子发布文件，10 项子进程测试通过。全套 AION 结果看[当前 PR 检查](https://github.com/world-sim-dev/aion/pull/1754/checks)，不能用这些本地结果替代部署或真实 A/B。

## 2026-09-12 原生请求所有权与脚本读取限额

**Why:** 普通创建只校验 Plugin runtime 会把原生预留/导入当作同 request_id 的旧结果，甚至跨账号返回冻结 Thread。普通删除又会留下确定性工作区却删除回执，使后续恢复永久冲突。视频流式 hash 修复后，脚本也不能再整文件读入 Manager 内存。

**How to apply:** 阅读 AION [57280d3b](https://github.com/world-sim-dev/aion/commit/57280d3bd6f9dbef0f3e070753f96d360c2ca9cc)。普通创建在旧 Thread 返回前拒绝原生所有权；普通删除拒绝原生导入，协调清理应属于独立产品生命周期。脚本使用实际 Artifact 版本文件，限额 1 MiB UTF-8 源字节，以与既有文本读取相同的换行语义流式计算；缺失版本、超限、编码错误、符号链接和读取中变化不能形成完成证据。相关 350 项通过、1 项条件跳过；最新全套 CI 和审查仍以 PR 当前提交为准。Zeus 配套合同的合并与 DEV 自动发布见 [#524](https://github.com/world-sim-dev/vidmuse-zeus/pull/524) 和[发布 run](https://github.com/world-sim-dev/vidmuse-zeus/actions/runs/34694297095)。
