---
name: evolve-native-routing-vs-candidate-runner
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, evolve, nextplay, a2a, candidate]
links: [nextplay-independent-benchmark-entry, evolve-preset-evaluation-entry]
---

# 内部执行分流与既有候选 Runner 的能力边界

**Why:** 新的内部执行入口不支持候选，不能据此断言整个系统没有替换复测能力，也不能否定之前的 A2A 验证。A2A 传输、外层 Candidate Runner 和 Agent Runtime 是不同层次；禁止修改 Runtime 内核，与禁止通过既有管理 API 创建临时资源，也不是同一个约束。

**How to apply:**

- 先查 Nextplay Eval 的 `nextplay-a2a/README.md`「恢复与验证范围」：它保留了此前 A2A 隔离运行及 SP 替换已验证的历史记录，并单独记录原 Benchmark 单题的 Judge 限流边界。该记录不能扩展为当前部署或全部 65 题已完成验收。
- 查同仓库 `nextplay-a2a/skills/maxwell-candidate-runner/scripts/run.py`、`maxwell-runtime/src/nextplay_runtime/runner.py` 与 `materializer/service.py`：确认旧 Adapter 实际如何替换、创建临时 Prompt/Skill/Preset、执行、回收证据并清理，而不是把发送 Variant 当作应用成功。
- 查 [Maxwell PR 355](https://github.com/world-sim-dev/maxwell-ai/pull/355) 的 `services/evolve-server/internal/app/integration/a2a/registry.go`、`maxwellexecutor/adapter.go` 与验证记录：核对识别结构化 Case 后是否提前进入内部执行分支，以及该分支如何处理候选/旧 Runner 快照。不能因为普通 A2A 分支仍在，就声称新路径已继承其候选能力。
- 调整路由前，应保持基线与候选的初始化、资源版本、执行语义、证据及评分条件一致。仅将候选改走另一条路径，不足以证明结果可比。优先衔接既有 Adapter；若仍有禁止临时 Preset 的约束，应明确现有 Runner 的冲突，不能静默恢复创建。

2026-10-15 本次只核对源码和历史验证记录，没有重新执行真实候选、修改业务代码或部署。后续状态回到 PR、当前源码及真实运行证据核验。
