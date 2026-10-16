---
name: evolve-native-routing-vs-candidate-runner
type: pitfall
created: 2026-10-15
updated: 2026-10-16
tags: [maxwell, evolve, nextplay, a2a, candidate]
links: [nextplay-independent-benchmark-entry, evolve-preset-evaluation-entry]
---

# 内部执行分流与既有候选 Runner 的能力边界

**Why:** 新的内部执行入口不支持候选，不能据此断言整个系统没有替换复测能力，也不能否定之前的 A2A 验证。A2A 传输、外层 Candidate Runner 和 Agent Runtime 是不同层次；禁止修改 Runtime 内核，与禁止通过既有管理 API 创建临时资源，也不是同一个约束。

**How to apply:**

- 先查 Nextplay Eval 的 `nextplay-a2a/README.md`「恢复与验证范围」：它保留了此前 A2A 隔离运行及 SP 替换已验证的历史记录，并单独记录原 Benchmark 单题的 Judge 限流边界。该记录不能扩展为当前部署或全部 65 题已完成验收。
- 查同仓库 `nextplay-a2a/skills/maxwell-candidate-runner/scripts/run.py`、`maxwell-runtime/src/nextplay_runtime/runner.py` 与 `materializer/service.py`：确认旧 Adapter 实际如何替换、创建临时 Prompt/Skill/Preset、执行、回收证据并清理，而不是把发送 Variant 当作应用成功。
- 查 [Maxwell PR 355](https://github.com/world-sim-dev/maxwell-ai/pull/355) 的 `services/evolve-server/internal/app/integration/a2a/registry.go`、`maxwellexecutor/adapter.go` 与验证记录：核对识别结构化 Case 后是否提前进入内部执行分支，以及该分支如何处理候选/旧 Runner 快照。不能因为普通 A2A 分支仍在，就声称新路径已继承其候选能力。
- 调整路由前，应保持基线与候选的初始化、资源版本、执行语义、证据及评分条件一致。仅将候选改走另一条路径，不足以证明结果可比。优先衔接既有 Adapter；2026-10-15 用户已明确允许 Adapter 管理临时 Preset，仍禁止改动 Agent Server Runtime。

## 2026-10-15 两条入口与本地交接

用户确认普通批量评测直接调用内部 Nextplay Agent；需要替换 SP / Skill 的调优，基线与候选均走已登记的 A2A Candidate Runner。来源评测可用于诊断，更换执行条件后须重建配对基线。

实现及验证入口：Maxwell 工作树 `/private/tmp/evolve-internal-agent-20261014/docs/verification/2026-10-15-candidate-runner-handoff.md`；跨语言测试 `services/evolve-server/internal/app/integration/a2a/candidate_handoff_test.go`；Nextplay `maxwell-runtime/src/nextplay_runtime/request.py` 与 `tests/test_frozen_request.py`。检查请求冻结原文、完整 SP / Skill、实际绑定和先采集后清理；SDK / 模型替身不是真实评分证明。

自动衔接的具体接口清单在 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-runner-handoff-contract-review-20261015.md`。确认状态与当前代码需回到任务 / PR 核验，不能把分工确认或交接测试通过当作自动准备、65 题真实取分、大原件和取消清理全部完成。未部署。

## 衔接后的恢复与资产归属检查

**Why:** 新调优 Work 关联了来源 CaseSet，不等于运行仓储已经允许读取其中仍归属原 Work 的 Case；同样，已派发的远端任务可能在调用方断线后丢失本地编号。只验证 JSON 形状或内存仓储，会漏掉真正的恢复和事务边界。

**How to apply:** 顺着 Maxwell `commands/runner_preparation.go`、`runner_tuning_run.go`、PostgreSQL `works.go` / `runs.go` 及 `runner_handoff_integration_test.go` 核对：精确来源集合授权、实际准备回执、已知远端编号的有界持久化、未知接收不重发、首次基线的事务限制。协议到执行用跨语言测试，数据库 CAS 与资产归属用隔离 PostgreSQL；两者均不能代替真实 Agent / Judge 验收。

2026-10-15 已获仅本地实施授权。实现清单、逐项测试与未验收的大原件 / 取消 / 65 题真实评分边界，统一查上方 `2026-10-15-candidate-runner-handoff.md` 验证记录；PR、提交和部署状态需另行核验。


## 2026-10-16 三条连接与长期待验证的排查指针

**Why:** 接入列表的每行是执行连接，同一业务对象在迁移中可能保留内部 Agent、HTTP 批次和 A2A Runner 多条登记。连接检查、声明能力与真实运行证据不是同一状态；将声明未知写成“执行能力待验证”，会让用户误以为存在后台验收任务，或误以为历史执行没有发生。

**How to apply:** 沿 `executorRegistration.ts` 的展示条件、`domain/executor/capability_level.go` 的级别推导、`commands/executors.go` 的预检持久化查清字段来源，再对照具体 Run。不能从声明级别推断评分成功，也不能仅为压缩列表删除历史执行器。对象与连接的归属应显式管理，不能按业务名称硬编码归并。

准确登记身份、dev 页面只读证据、源码版本和建议见[三条连接状态诊断](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-executor-status-diagnosis-20261016.md)。这是 2026-10-16 的诊断记录；继续操作前刷新实际登记与引用，不以本页推断当前部署或运行状态。


## 2026-10-16 单一执行器的本地实现指针

**Why:** 同一个被测 Agent 可以有普通评测与候选验证两条技术路径。只隐藏 Runner 的列表行，会让旧候选选择器丢失执行身份；只改连接标签，也不能说明实际执行与评分状态。合并展示不能修改历史 Run 或在重试时重新选择路径。

**How to apply:** 以显式同业务归属聚合连接；新调优任务冻结实际 Runner 与内层目标；重复创建沿用已保存路线；旧候选和历史查询保留物理执行器标识。关联变更属于展示与未来路由元数据，不应影响已开始任务的执行配置；比较含指针的配置结构时按值比较，避免从数据库重新读取后误判变化。

代码、具体契约和本地验证记录查 `/Users/leslie/.codex/worktrees/evolve-logical-executor/maxwell-ai/docs/verification/2026-10-16-logical-executor.md`。检查 `domain/executor/routing.go`、`commands/logical_executor.go`、PostgreSQL `executor_routing_integration_test.go` 与 Studio `executor/executorRouting.ts`。本轮仅本地，页面测试数据、隔离 PostgreSQL 和技术回归不能替代 dev 关联生效、真实 Case 执行或评分验收；PR 与发布状态须另行核对。
