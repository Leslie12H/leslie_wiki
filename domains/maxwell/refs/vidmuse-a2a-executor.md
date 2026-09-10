---
name: vidmuse-a2a-executor
type: reference
created: 2026-09-09
updated: 2026-09-10
tags: [maxwell, evolve, vidmuse, a2a, evaluation]
links: [maxwell-quality-eval, vidmuse-zeus, vidmuse-aion]
---

# VidMuse 接入 EVOLVE 的执行器契约指针

2026-09-09 为设计讨论，未实现或验证在线接入。检查的是 Maxwell 本地工作树 `.tmp/evolve-flow-repair-20260908`（42b19a73），不能代表线上或最新主干。

## 去哪看

相对该工作树的 `services/evolve-server/`：
- `docs/executor-kit/README.md`：执行器接入、登记、预检与评测/调优级别。
- `docs/executor-kit/schemas/execute-trial.v1.json`、`trial-evidence.v1.json`：请求与回执。
- `internal/modules/evolve/application/execution/contract.go`：实际请求、证据验证、幂等标识；文档与实现冲突时重新核对代码。
- `internal/app/integration/a2a/registry.go`：协议绑定、任务观察、交互要求状态映射。
- `docs/executor-kit/skeletons/external_a2a.ts`：最小示例；异步长任务需补持久化、真实查询和取消，不能直接当生产服务。

**Why:** A2A 解决跨服务调用；可信评测还需要明确任务完成条件、运行证据和版本归属。调优还要求候选配置真正进入被测运行，预检 marker 回显不能单独证明这一点。

**How to apply:** 建议在 VidMuse 边界实现确定性适配器，对接产品任务 API，返回 EVOLVE 结构化证据。先完成固定版本评测，再讨论隔离的候选配置注入。具体 API、媒体 Judge 能力及上线状态需要单独核验；方案不是已确认产品决策。


## 2026-09-09 深入核对指针

本次 fetch 后按远端主干源码核对：AION 20d68572、Zeus b2cd14d9、Maxwell b5918c86；不是线上验证。详细设计草案：`/private/tmp/vidmuse-a2a-design-20260909/vidmuse-a2a-executor-design.md`（临时文件，不作为永久事实源）。

- 业务 plugin 仓库：https://github.com/world-sim-dev/vidmuse-plugins 。核对 commit 34d6efb7cbd3a9636ed07aa51423684133230670；以后重查 DEFAULT.txt、目标 plugin/config.json 和 .github/workflows/deploy.yml，不能从仓库默认推断线上默认。
- AION `packages/revisioned_skills_cache/src/revisioned_skills_cache/cache.py`：固定 Git SHA 的归档、公共 Skill/Workflow 解析、只读缓存。
- AION `apps/manager/runner_wrapper/kubernets.py`：共享缓存 revision 选择及启动开关；核对指定镜像是否绕过此路径。
- AION `apps/manager/service/agent_thread.py`：创建时配置快照、Skills 物化、request_id 去重。Manager 和 Runner 必须读取同一冻结版本。
- AION `apps/runner/shared_skills_startup.py`、`agent/planner/interact_agent.py`：缓存绑定、SYSTEM/config/subagent Prompt 读取；请求回显不等于实读证据。
- Zeus `modules/domain/src/main/java/co/sandai/zeus/domain/agent/service/AgentService.java` 的 createThread 分支：普通/App plugin 参数和 request_id 传递不同，适配前逐分支核验。
- Maxwell `internal/app/integration/a2a/registry.go`（相对 evolve-server）：dispatchTurns 复用 invocationId，不能按它对每一轮独立去重；协议方法以 SDK 和 executor-kit 当前示例为准。

建议外层确定性 A2A 服务负责持久化 Task、下游恢复及证据；候选使用隔离 commit 缓存，避免借共享环境发布流程切换 A/B。仍为建议，未授权实施或部署。


## 2026-09-09 飞书完整方案交付

- 完整方案：https://j0yswlgboxz.feishu.cn/wiki/FXkdwOqIpiSfrNka96vc07jnnFc 。父目录“Maxwell自迭代&AtoA”：https://j0yswlgboxz.feishu.cn/wiki/So33wJG4biIGcGklx9rc7HEsnvf 。文档内容会变，以回读为准。
- 用户明确选择：每次调优新建 Git 分支，从指定现有分支冻结 commit 开始；在隔离 checkout 编写 plugin；每轮候选固定 commit，保护原 ref、原工作目录和共享部署。
- 用户先要求在 Maxwell / VidMuse 业务空间实现，随后明确要求“实现之前出完整方案写飞书”。截至本次交付仍为方案评审阶段，未实现、注册、迁移或部署。
- 为什么：分支隔离不能单独防止共享目录切换影响运行；可信调优还需要 Manager/Runner 同源版本和实读回执。应用方式：实施前读飞书第 5–9 章，按第 12–13 章拆分接口与验收；不要从登记意图推断已经存在在线执行器。


## 2026-09-09 独立仓库与接口复用范围修订

- 用户要求执行器采用独立仓库 `vidmuse-executor`；Maxwell 保留 VidMuse 业务空间的逻辑登记与评测集成。原 `services/vidmuse-executor` 建议已被替代。
- Why：外层任务管理可独立交付，Zeus 现有产品身份、权限与计费不应重复实现。基础任务创建、续跑与查询优先复用已有 API。
- How：在飞书方案第 3、6、8、12 章核对最新范围。当前部署 plugin 评测与新分支 commit 执行分开验收；后者需核定隔离 Manager/Runner 环境，或受控版本引用扩展。只 checkout 执行器目录不能改变 AION 版本；隔离部署可行性和实读证据仍须验证。
- 用户要求补系统边界、候选版本承载、执行与评测证据链架构图。图和实施状态以飞书回读为准；未创建代码仓库或部署。


## 2026-09-10 方案评估：Variant 合同冲突

按 Maxwell `origin/main`（a2a-go v2.4.0）核对 `services/evolve-server/docs/executor-kit/README.md`、`schemas/execute-trial.v1.json`、`schemas/trial-evidence.v1.json`、`application/evaluation/variant.go`、`application/execution/contract.go` 的 `VariantApplied`。

- EVOLVE 侧 Variant 已定型：`variant.content` 是 VariantManifest，`resources[]` 携带每个文件的**完整内容 + contentHash**；回执要 `applied=true` 且 `variantHash == request.variant.contentHash`，否则 `evidence_query compare` 判 `comparable=false`，候选 Run 不可比。
- 飞书方案第 7 章拟把 `variant.content` 改成 `vidmuse.plugin-revision/v1`（仅 commit SHA 引用），回执只有 `requestedCommit/loadedCommit`，没有 `applied/variantHash`。两边直接对接会出现：EVOLVE 无法生成这种 Variant，也不承认这种回执。
- Agent Card 的 `ai.maxwell/evolve-variant@1` 扩展可声明 `pathPrefixes/resourceKinds`，天然对应方案第 5 章的 plugin 文件白名单；方案未提及。
- 探针 `probe:true` 必须回显 marker 但不应真实生成视频；方案未写。

**Why:** 方案把"候选内容的事实源"放到执行器的 Git 控制面，而 EVOLVE 已把事实源放在自己冻结的 VariantManifest。两个事实源会让 diff、可比性和回执校验各说各话。

**How to apply:** 以 EVOLVE 的 `resources[]` 为内容事实源；执行器把 resources 物化成 Work 分支上的 commit（同 variantHash → 同 commit，幂等），回执同时带 `applied/variantHash` 和 `requestedCommit/loadedCommit`。方案第 8 章的 workspaces/candidates 内部接口退化为执行器内部步骤，不需要调优 Agent 直接调 Git 工具。交给 Codex 时先做 P1（当前部署 plugin、l0_evaluate、通过 `evolve-executor-check`），P3 的 A/B 承载先做 spike 再决定 P2。
