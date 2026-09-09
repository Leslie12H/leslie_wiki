---
name: vidmuse-a2a-executor
type: reference
created: 2026-09-09
updated: 2026-09-09
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
