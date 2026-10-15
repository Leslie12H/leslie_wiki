---
name: runtime-observation-hooks-provenance
type: reference
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, runtime, observability, evolve]
links: [evolve-usage-accounting, evolve-native-routing-vs-candidate-runner]
---

# Runtime 观测钩子的来源核查入口

**Why:** 架构图把多类 Runtime 观测口列在一起，不能据此归因为 EVOLVE 实施新增。区分接口引入、后续接入及评测侧独立记账，避免把平台监控当作评测侵入 Runtime 的证据。

**How to apply:** 在 Maxwell 仓库以 `git log --reverse -S 'type <接口名>' HEAD -- services/agent-server` 找到当前分支祖先中的引入提交，再用 `git show <提交> -- <文件>` 核对实际新增行与提交范围。当前接口位置查 `services/agent-server/internal/modules/runtime/ports/runtime_facts.go` 和 `model_retry.go`；装配查 `internal/app/composition/runtime.go`。此页保存不可变历史指针，不代表当前部署状态。

2026-10-15 核对截图中七类观测接口的引入来源：

- `RunTerminalRecorder`：[2026-08-18 平台集成与 Runtime 观测，79eae66f](https://github.com/world-sim-dev/maxwell-ai/commit/79eae66f)。
- `RunLifecycleRecorder`、`ToolOperationRecorder`、`MessageAppendRecorder`、`ContextCompactionRecorder`：[2026-08-26 上下文与工具架构收敛，bfa2491f](https://github.com/world-sim-dev/maxwell-ai/commit/bfa2491f5e19e6a54991c2e9301c2321c0523233)。
- `ToolTraceReporter`：[2026-08-28 租户 LangSmith 追踪，a50454b0](https://github.com/world-sim-dev/maxwell-ai/commit/a50454b0ff35a983c465d98b461df8ddc2aa6ab7)。
- `PrimaryModelRecoveryRecorder`：[2026-10-09 Runtime 模型恢复与资源交付，4fd92233 / PR 335](https://github.com/world-sim-dev/maxwell-ai/commit/4fd922333c4796332ab79100c21929b78d52b280)。

这些引入提交属于 Runtime / 平台观测工作。截图七类均非 EVOLVE 实施新增；后续字段调整、其他 Runtime 变更仍需按具体提交另查。EVOLVE 自身用量记账见 [EVOLVE 模型用量记账口径](evolve-usage-accounting.md)，既有 Candidate Runner 与 Runtime 边界见 [内部执行分流](../pitfalls/evolve-native-routing-vs-candidate-runner.md)。


## 2026-10-15 ARC Services 与独立服务的统计边界

**Why:** `AgentRuntimeContext.Services` 是 Runtime 能力依赖集合，独立后端服务是进程/领域部署边界；二者都叫 service，但不能混算。

**How to apply:** 先读 `services/agent-server/internal/modules/runtime/ports/runtime_context.go` 的 `RuntimeServices` 定义，再对比目标提交前后的字段集合。独立服务归属查 `services/evolve-server/README.md` 开头和 `go.mod`；API / Worker role 不等同于两个 ARC 能力。

历史核对锚点：[首次引入 EVOLVE 的 6a13e39c / PR 236](https://github.com/world-sim-dev/maxwell-ai/commit/6a13e39c0f23cfc9e46832684d654d61e831809a) 前后，`RuntimeServices` 都有 26 个字段。后续 [EVOLVE 工作台实现 6c09a025](https://github.com/world-sim-dev/maxwell-ai/commit/6c09a02554b03c657285a4af0e9f6ee2db5cf5bd) 没有改动 Agent Server。核对结论是 EVOLVE 没有为 ARC 新增专属 service；新增的是独立 `evolve-server`。当前字段数和后续其他 Runtime 改动须从目标 revision 重新计算，不把本次计数当永久清单。
