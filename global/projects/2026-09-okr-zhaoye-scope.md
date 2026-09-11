---
name: 2026-09-okr-zhaoye-scope
type: project
created: 2026-09-11
updated: 2026-09-11
tags: [okr, planning, maxwell, vidmuse, nextplay, monitoring]
links: [evolve-maxwell-tuning-receiving, vidmuse-a2a-executor, monitoring-daily-brief-evidence-loss, monitoring-problem-title-vs-incident-report, vidmuse-executor-p1]
---

# 2026 年 9–10 月 OKR 中「照野」的责任范围

团队 OKR 共三个 O。照野（Leslie）的归属如下，来源为 2026-09-11 Leslie 在会话中贴出的 OKR 原文，不是内部 OKR 系统回读。

- **O2 整体 owner**：落地 Maxwell A2A 调优。KR1 跑通 A2A 调优 + Nextplay Adapter 联调 + 调优前后效果对比；KR2 VidMuse Adapter 接入 + 至少一条核心链路评测 + 候选版本可独立运行。KR3（评测四个环节各接 3 个以上业界通用 method）挂在王银松、不二名下，但 O owner 需兜底。
- **O1-KR4 独担**：报警分级与去重、Nextplay 接入报警分析 Agent、支持人工发起修复 PR、跟进回归与上线验证。
- **O1-KR1 共担**（王银松、不二）：统一测试结论与发版检查模板、质量度量与运营机制、VidMuse 质量双周报。
- **O3-KR3 共担**（王银松）：Agent 分析 PR、匹配已有用例、建议补测并执行定点测试。两条业务线合计 10 个 PR，用例推荐认可率 80%。

原文中 O3 出现两个「KR4」（Sisyphus 可用性稳定性、Computer Use 试点），编号重复，两项均不在照野名下。

**Why:** O2 是照野唯一整体负责的 O，且 KR1/KR2 的关键路径依赖 agent-server 团队的 Variant 应用能力，不是本人可独立交付的工作。分不清「独担 / 共担 / 兜底」会在周期末把共担项的缺口算到自己头上，也会漏掉 O2-KR3 的兜底责任。

**How to apply:** 排期时把 O2-KR1 的跨团队阻塞（card 声明 `ai.maxwell/evolve-variant@1`、幂等覆盖资源、`evolve.variant-receipt/1` 回执、`preset_read/prompt_read/skill_read` 凭据）当作最早要推的事项，详见 [EVOLVE 对 Maxwell 目标的调优接应](../../domains/maxwell/projects/evolve-maxwell-tuning-receiving.md)。O2-KR2 先按 [VidMuse A2A 执行器契约](../../domains/maxwell/refs/vidmuse-a2a-executor.md) 修正 Variant 事实源冲突再开工。O1-KR4 在 Nextplay 接入前先处理 VidMuse 侧已知的报警聚类与日报证据缺陷，否则等于把缺陷复制到第二条业务线。OKR 文本会调整，以内部 OKR 系统回读为准。
