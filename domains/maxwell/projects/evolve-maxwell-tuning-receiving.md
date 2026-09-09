---
name: evolve-maxwell-tuning-receiving
type: project
created: 2026-09-09
updated: 2026-09-09
tags: [maxwell, evolve, tuning, variant, adapter]
links: [maxwell, evolve-tuning-agent-loop-audit-20260909, evolve-agent-preset-business-scoped]
---

# EVOLVE 对 Maxwell 目标的调优接应（进行中）

背景：2026-09-09 拍板 Maxwell 内 Preset 将支持按次运行应用 Variant（agent-server 侧做 Adapter），EVOLVE 侧要提前把接应链路做齐。实施分支 `codex/evolve-domain-upgrade-20260909`（maxwell 仓库 worktree `.tmp/evolve-domain-upgrade-20260909`），第一轮由子 agent 实施：确认时校验 payload、llm-rubric panel、judge calibrate、case-from-failure、覆盖矩阵、maxwell_preset 预检按能力声明判级、Variant 通道契约文档、compare 按回执判 comparable、Skill/SP 加深。

已拍板（2026-09-09，Leslie）：
- **基准由 EVOLVE 自己获取**：给 EVOLVE 加读 Preset 内容的权限，EVOLVE 读取 Prompt/Skill 内容并冻结 hash，随执行请求传给 Adapter。否决了"由目标侧回执返回基准 hash、EVOLVE 只存指针"的替代方案。
- level 一律由预检决定，代码/Prompt/Skill/文档里不许有 maxwell_preset ⇒ l0 的常量。
- 候选资源不用累计 patch，VariantManifest 携带每个资源完整内容 + hash，Adapter 幂等覆盖；超限才用引用。

第一轮交付后追加（待做）：trial-evidence 回执结构化 applied 块 + Run 级 baselineHash/variantApplied + 跨 Trial 漂移检测；VariantManifest resources 内容模型；EVOLVE 读取 Preset 内容的权限与获取实现；Dispatch 前按能力声明校验 apply 操作；Studio 目标草稿"允许修改范围"与 Run 详情实际执行版本。

**Why:** 仅改 EVOLVE 无法让调优跑通（Variant 应用在 agent-server 侧），但接口先就位可以用假执行器验证，agent-server 交付后即可对接；基准由 EVOLVE 获取是为了让冻结内容与 hash 掌握在评测方手里，不依赖目标侧自报。
**How to apply:** 追加第二轮任务时，先读子 agent 写的 `docs/evolve-maxwell-variant-apply-contract.md`，回执字段、资源模型必须与它一致，不要另定一套；权限方案要和 agent-server 团队确认 Business API Key 能否授予 Preset 读权限。
