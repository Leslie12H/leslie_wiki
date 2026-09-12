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

**How to apply:** 先读[飞书完整方案](https://j0yswlgboxz.feishu.cn/wiki/FXkdwOqIpiSfrNka96vc07jnnFc)及 Adapter 的 `docs/stateless-adapter.md`，再按下表追到对应 PR 和契约文件。飞书正文已回读至 revision 135；部署决策仍须核对最终提交、实际部署与运行证据。不要把 Executor PostgreSQL 当作部署前提，也不要因移除代码依赖就删除旧库或真实数据。

## 状态归属

| 归属 | 负责内容 | 查证入口 |
| --- | --- | --- |
| Maxwell EVOLVE | Case、冻结 baseline/Variant、Attempt 调度与请求、远端句柄、预算、判分及比较 | Maxwell PR #286；既有 limits_json、Attempt.request_hash 与 ObjectStore |
| Zeus / AION | 账号权限、额度计费、产品与原生 Thread 绑定、消息、运行状态、产物及 checkpoint | Zeus PR #523、AION PR #1754；既有 Thread/context 和产品创建链路 |
| Git / Plugin 发布 | 源 commit、Work 分支、候选完整包与公共依赖版本、DEV 完整 release 树及发布回执 | Adapter 候选模块、Plugin PR #1832 |
| 无库 Executor | A2A 协议适配、身份/冻结验证、产品 API 调用、受认证加密句柄及取证转换 | Adapter PR #1；没有独立任务数据库、持久队列或租约 Worker |

Git 持久目录保存源码、版本和准备 ref；发布回执保存安装产物身份。它们不能扩展成隐藏 KV 任务系统。候选控制面需持久 Git root、单写入实例；进程内锁不代表多副本互斥。部署边界见 `docs/candidate-control-api.md`。

## 实现与验证入口

以下是 **2026-09-12 前序草稿切片的交付指针**；最新 runtime 交付见文末。五个 PR 未合并、未部署，当前提交和外部状态仍需实时读取。

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
- Plugin 草稿将 main 的旧 DEV reset/pull 路径改走新工作流，staging/prod 行为不变；**历史分支仍可能持有旧 Aliyun 权限**。必须在外部撤销旧凭据对 DEV 的 RunCommand 权限，并限制新 DEV 身份/Environment。代码无法替代 IAM 撤权，未完成此项不能宣称消除旧入口绕过。
- 共享文件系统锁/原子操作、只读运行挂载、实际 PV quota、保护分支与版本 pins、首次 bootstrap 和 AION 联动部署均为尚未执行的启用前置。发布成功只证明安装字节；不证明 Agent 已加载、读取或执行。

## 原生节点续跑与证据边界

- recreate 从原输入重新开始；restore-checkpoint 会改原 Thread；export-timeline 排除原生历史且可能初始化文档。本轮路径是固定来源只读导出、冻结 source product/AION Thread ID、checkpoint/full commit、manifest/archive hash，再导入新的 DEV Thread，显式 activate 后发送新消息。私有字节以有界、立即 unlink 的临时文件流转，不进公开静态目录或 LLM 工具输出。
- 专用源读取凭据、固定源 HTTPS origin、账号校验与固定 GET/HEAD 路径约束由 Adapter 执行；**产品 token 未新增只读 scope**。该凭据在 Adapter 外的权限不能被描述成天然只读。身份以实际账号与产品权限为准，Token 本身不提供分支/执行隔离。
- `runner_authenticated` 只表示通过 Runner 身份提交的进度。同一 Runner/工具环境仍可能伪造该请求，不能升级成不可伪造的 `model_input_observed` 或最终生成证明。startup-resolved、model-read、tool-executed 三层必须分别验收，缓存存在或 SHA 回显不等于已加载/执行。
- 本轮草稿由 AION 在新 Thread 导入时读取真实 ArtifactManager 内容，冻结 `inherited_output_sha256`，Zeus 透传；Adapter 已在脱敏前比较原始 artifact 字符串 hash，拒绝将原样继承产物判为新成功，并匹配本次实际 native message ID 与进度。该防护不证明换 URL 后的媒体字节是新生成，也不消除 Runner 自报局限；只有另行完成 catalog/runtime 清单独立核验才报告 `applied=true`。具体落地和回归看 PR 与 `docs/native-checkpoint-adapter.md`。
- 创建/输入响应未知时不能自动重发；已知新 Thread 通过查询恢复观察，不能假设 exactly-once 或在改变账号/配置后复用旧句柄。AION 全量 context JSON 写入须防止并发覆盖输入预留与进度，修复切口在 `native_checkpoint.py` 和通用 Thread 更新的行锁/fresh merge；验收需检查最终版本及回归。
- AION 消息单页升序、分页从新到旧，多页需恢复全局顺序，旧 timestamp 可能为空。取消不能依赖历史/产物取证；原生路径也不能绕过本次输入边界，把旧完成状态降级当成功。

## 尚未完成的验收

截至 2026-09-12，本轮只进行了源码核对、本地集成/契约测试和草稿推送；没有 DEV 发布、业务空间登记、真实生成或节点 A/B 闭环。无库 binary 通过 Maxwell checker、marker probe 通过均不证明候选应用。

可信 catalog、固定 DEV candidate、实际启动清单与 Maxwell 比较入口已完成本地跨实现核验，见下节最新指针。仍缺真实部署及完整任务/节点 A/B 媒体质量验收。启动包证据不等于 model-read/tool-executed。大 snapshot 可恢复准备仍未实现：当前短 A2A 预算包含全量下载、导入和启动，HEAD 也读验全包；不能只放宽大小/超时或加隐藏 Adapter 库。下一步应核对产品拥有的准备阶段、映射落库屏障与只读 GetTask；源凭据迁移和 capture 对象语义以最终方案/代码为准。

## 2026-09-12 可信发布目录与运行回执交付

**Why:** 发布包、实际启动清单和 Maxwell 接收预算属于不同合同。单仓通过或 Plugin ID 回显不能证明链路可以接收、执行和比较。

**How to apply:** 先阅读 Adapter `docs/approved-release-execution.md` 和 `releasecatalog/testdata/README.md`，运行 `scripts/contract-fixtures/finish`，再按 Maxwell `docs/external-candidate-control.md` 核验实际解析/比较入口。fixture 的 Git/cache 字节来自真实本地实现，产品与媒体元数据为测试数据；不要当成上游提交或部署证明。

本次实际推送并回读的 runtime slice：Adapter [9b971d0](https://github.com/world-sim-dev/vidmuse-executor/commit/9b971d0847a7d93bf51fabec1d790cf3bd6f857e)、Maxwell [5a22b7bc](https://github.com/world-sim-dev/maxwell-ai/commit/5a22b7bcf036b0b875d419070623e2242426b3f0)、AION [c5e045b5](https://github.com/world-sim-dev/aion/commit/c5e045b5fc4c3a0d29d663ef77a9f283960edc77)、Zeus [27f0e9c2](https://github.com/world-sim-dev/vidmuse-zeus/commit/27f0e9c21868b7f743883b05202d5dbffa662563)、Plugin [e910f6d](https://github.com/world-sim-dev/vidmuse-plugins/commit/e910f6dfcee251df91c26cf6802b9c1c35303afd)。五个 PR 仍为 OPEN Draft；更早提交是历史切片。飞书正文已精确回读至 revision 132，第 6 章原画板已更新并检查云端实际显示；两张主架构图保留。

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
