---
name: evolve-tuning-agent-loop-audit-20260909
type: pitfall
created: 2026-09-09
updated: 2026-09-10
tags: [maxwell, evolve, tuning-agent, system-prompt, draft-layer, mcp]
links: [maxwell, evolve-agent-preset-business-scoped, evolve-original-design-vs-current]
---

# EVOLVE 调优 Agent 运行逻辑审计（2026-09-09，origin/main `16dcff24`）

对照 `docs/evolve-tuning-agent-playbook.md`（System Prompt 全文）、`internal/app/transport/mcp/schemas.go`（Agent 实际看到的工具契约）、`commands/{service,draft,freeze_draft,run}.go`、Studio `drafts/DraftsPanel.tsx` / `workspacePresentation.ts` 得出的结论。代码会变，只记结论和去哪核。

**Why:** 调优 Agent 的行为几乎全靠一份 ~100 行的 System Prompt 兜住，而工具 schema 里所有产物 `content`/`payload` 都是无形状的 `object`；服务端和 Studio 又各自持有一条冻结路径。结果是"Agent 能不能正确调 method 出 case 判卷"取决于 Prompt 是否被逐字遵守，而 Prompt 自身有互相矛盾的指令。

主要不合逻辑点（2026-09-09 时点）：

1. **双冻结路径，且用户确认后 Agent 收不到通知。** Studio 确认草稿后提示"点『生成正式资产』"由系统冻结；Prompt 却要求 Agent 看到 `confirmed` 后自己 freeze。用户确认时 Studio 不向会话发自动消息（只有『要改』和执行目标登记会发），Agent 只能靠用户再说一句才知道。Prompt 内部还同时写了"轮询等待期间可以做别的"和"不要持续轮询、结束本轮"。
2. **确认不校验 payload。** `ConfirmDraft` 只对 `cases` 做 normalize，goal/base/judge/profile 的 payload 结构错误要到冻结才报错，用户会"确认了一份冻不了的草稿"。
3. **产物形状对 Agent 不可见。** TargetProfile/ObjectiveSpec/VariantManifest/CaseSetManifest 的字段只写在 playbook；`describe_method` 只覆盖 judge。Prompt 因此专门写了"猜字段失败就停止"的止损条款。
4. **Case 输入与判卷依据混放。** Prompt 要求 context/fixtures 不发给目标，但 playbook §4.5 示例把 `context` 放在 `input` 里；`maxwell_input.go` 对多键对象整体 JSON 序列化后发给 Preset，判卷依据会原样进入被测方输入。
5. **阶段名与流程不符。** 服务端阶段为 case_engineering→judge_engineering 线性推进，Prompt 却要求 cases/judge/profile 一起草拟一起确认；`profile` 只有一条版本线，基线与候选 Variant 共用，候选一 put 基线草稿即 superseded。
6. **Method 目录名不副实。** casegen 只做指纹/去重/coverage，optimization 只有 offline-compare；"出题""提候选"全是 Agent 手写，Method 只是校验器。
7. **文档残留旧路径。** playbook §1/§2.2 仍写 `remote_agent`（a2a-agent 中间件）探索，Prompt 正文已改为 `evolve_run explore`。
8. **L0 目标的沉默无差异**（见 [[evolve-agent-preset-business-scoped]]）现已通过 `compare.comparable` + Run admission 拦住，但 `maxwell_preset` 永远只能评测，调优要业务自建 Adapter，这一点用户入口处仍容易误解。

补记（2026-09-09 同日）：线上 Preset `746f0d19…` 的 Prompt 已换成 orchestration-v4（60 行）+ 7 个 Skill（target-recon/case-design/judge-design/evidence-diagnosis/optimization-strategy/eval-meta-check/evolve-workspace-view），源码在 maxwell 仓库 worktree `.tmp/evolve-flow-repair-20260908`（分支 `codex/evolve-flow-repair-20260908`）**未提交**。V4 用 Skill 承载产物形状（解第 3 点）、明确 context 不自动发目标（解第 4 点的文字面）、两条冻结路径都允许但优先 Studio（第 1 点变成"双路径可选"，仍无确认通知）。第 2、5、6 点未变。

**How to apply:** 讨论"Agent 为什么没按流程走"时，先分清是 Prompt 矛盾（1）、schema 缺形状（3）、还是双路径归属（1/2）；不要先怪模型。改动优先级建议：确认时校验 payload → Studio 确认后向会话发一条自动消息或 Prompt 明确"冻结只由 Studio 做" → 把产物 JSON Schema 暴露进 `describe_method`/工具 schema → 修 playbook 示例的 context 位置。核对时以 `schemas.go` 和 `draftGateObject`/`FreezeDraft` 为准，不以文档为准。

## 2026-09-10 复核

origin/main `f3dea511` 的 `commands/draft.go:ConfirmDraft` 已调用 `validateDraftForFreeze`。上文第 2 项“确认不校验 payload”已不适用，保留为历史记录。当前稳定性缺口与复现入口见 [全流程审计](../refs/evolve-evaluation-blockers-20260910.md)。
