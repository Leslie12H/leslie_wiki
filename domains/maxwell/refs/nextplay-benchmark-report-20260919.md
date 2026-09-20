---
name: nextplay-benchmark-report-20260919
type: reference
created: 2026-09-20
updated: 2026-09-20
tags: [maxwell, evolve, nextplay, benchmark, d1-d5, 评测协议]
links: [maxwell, nextplay-evaluation-gates-20260916, nextplay-benchmark-import-audit-20260915, evolve-generic-platform-review]
---

# 影游 Agent Benchmark 综合评测报告（2026-09-19）与 EVOLVE 的对照入口

报告：[影游Agent Benchmark 综合评测报告 9.19](https://j0yswlgboxz.feishu.cn/docx/CyvJdv5MXoDc5dxGgzycucjJnew)。它把 9.9 人工交互评测（A，94/112 已评，45 通过）与 9.11 机跑+人工修正（B，固定 47 题 × GPT/GLM/DeepSeek/Kimi）重新核算，结论：约九成失败落在 D4 内容质量 / D5 交付；四模型总分接近但做对的题不同（39/47 至少一个模型通过）；15 题含 AI 补分，纳排会改变排名。

报告对"下一轮"提出的协议要求（是 Benchmark 能否成立的硬条件）：冻结输入（Case、完整 Query、初始文件快照、故事/分支/前置依赖、最后授权范围）；冻结系统（模型 API 版本、SP/Skills/工具版本、权限模式、采样参数、预算/超时/重试）；统一采样（固定纳排、同快照、预定义异常计法、不得按结果重跑）；每题每模型 ≥3 次重复；两名独立评审盲评 + 校准样本 + 仲裁留痕；证据保全；主报同题配对差；效率与可靠性（耗时、费用、工具调用、重试、缺项；首次尝试 vs 预算内成功分开）；消融 E0 冻结基线 → E1 约束清单 / E2 交付核验 / E3 内容验收 → E4 联合；另备未参与调试的新题集。

**Why:** 这是业务方对"可信 Benchmark"的定义，EVOLVE 的能力评估要对着这张清单，而不是对着"有没有页面"。报告本身也强调 completed ≠ 通过、平均维度数 ≠ 通过率、A/B 不能直接比。

**How to apply:**
- 对照时分三层：协议层（冻结/重复/错误分离/消融/定版/趋势）EVOLVE 已具备且是设计核心；评分层部分具备（llm-rubric / deterministic-assertions / calibrate / 异议 / 标准循环），缺双盲人评与仲裁留痕的正式流程；执行层（nextplay 执行器真实执行、故事 checkpoint 连续、文件快照读取、交付可访问性核验）是业务 runner 的责任，截至 2026-09-16 未打通（见 [[nextplay-evaluation-gates-20260916]]）。
- 47 题 + B 的修正分是现成的校准集：先用 calibrate 方法对齐平台判卷与人工分，再定版为 Benchmark v1，E1–E3 作为候选逐项对比。
- 报告要求的"同题配对差 + 按故事分组"平台只有配对矩阵，没有依赖分组统计与 McNemar；需要导出原始逐题分离线算。
- 不要把报告里的百分比搬进平台当基线：题集、快照与评分来源都不同。
