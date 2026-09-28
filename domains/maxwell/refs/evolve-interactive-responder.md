---
name: evolve-interactive-responder
type: reference
created: 2026-09-10
updated: 2026-09-10
tags: [maxwell, evolve, a2a, input-required, responder, multi-turn]
links: [maxwell, vidmuse-a2a-executor, evolve-tuning-agent-loop-audit-20260909, evolve-maxwell-tuning-receiving]
---

# EVOLVE 长程任务确认环节自动应答（Interactive Responder）方案指针

2026-09-10 方案草案，未拍板、未实施。核对基线 maxwell worktree `.tmp/evolve-audit-20260901`（`58c7a104`）。

## 去哪看

- 飞书文档（2026-09-10 同步，内容会变，以回读为准）：https://j0yswlgboxz.feishu.cn/docx/Zz6qduQAMoCFqWx6XqbcBtsrnWf ，父目录“Maxwell自迭代&AtoA”：https://j0yswlgboxz.feishu.cn/wiki/So33wJG4biIGcGklx9rc7HEsnvf 。
- 方案全文：maxwell 仓库 `services/evolve-server/docs/evolve-interactive-responder-plan-20260910.md`（仅在上述 worktree 未提交；合入后以 main 为准）。
- 现状核对点（相对 `services/evolve-server/`）：`internal/app/integration/a2a/registry.go` 的 `mapState`/`errorForTerminalState`/`dispatchTurns`；`internal/modules/evolve/application/evaluation/live.go` 的 `liveApplyObservation`；`execution/contract.go` 的 `ParseTurns`。

## 结论（2026-09-10 时点）

- A2A 协议本身支持 `input-required` + 同 taskId/contextId 续发；EVOLVE 侧对该状态一律判失败（注释 "V1 treats it as terminal"）。
- 现有 `case.input.turns` 是预写剧本，不读目标提问，不能替代动态应答。
- 调优 Agent 只在 Run 前后通过 MCP 参与，Run 期间没有回传通道。

**Why:** 长程任务 Agent 的确认点不可预知，预写台词走不通；让调优 Agent 实时应答又会破坏可复现性并与会话强耦合。方案推荐把应答者做成与 judge 同级的固定 Method（`responder/persona-llm@1` + `responder/scripted@1`），case 里声明 persona，Run 冻结 hash，交互记录进证据供判卷。

**How to apply:** 讨论"目标停下来评测就挂"时先看是否 case 未声明 interaction、执行器是否真的用 `input-required` 表达暂停（而非 completed 返回一句反问）。实施前读方案 §6 的状态机与 §8 分期；Maxwell 内置 Preset 通道的 `input-required` 映射是跨团队依赖，不要从方案推断已存在。


## 2026-09-10 v2 修订（取代上文第 5、6 章的答案库思路）

- v2 方案：maxwell worktree `.tmp/evolve-plan-20260910`（origin/main `828e7d87`）的 `services/evolve-server/docs/evolve-capability-upgrade-plan-20260910.md`，未提交；飞书 https://j0yswlgboxz.feishu.cn/docx/Fzjid4GzkoFdKHxevXicN1sMnFd 。
- 用户反馈：答案库让 Agent 失去意义；case 生成与 judge 维度过于简单不贴业务；优化策略不足。v2 主线：业务知识包（BKP）与 DiscoveryReport v2 成为一等产物、覆盖按业务流程分区、新增 reference/trajectory/pairwise/external 四种判法、结构化 DiagnosisReport 驱动按失败类型选改法与多候选搜索、调优 Agent 以冻结 ResponderContext 按问调用作为第一道应答者。
- Why：main 上 Method 目录只有校验类方法（schema-fingerprint、normalize-profile、offline-compare 等），生成全靠 Agent 手写；judge 只看 evidence.output，toolEvents 无人读。How：讨论出题/判卷/优化质量时先看 v2 §2 现状表定位到 Method 缺口，不要先怪 Prompt。
