---
name: qa-case-agent-usage-resources
type: project
created: 2026-09-11
updated: 2026-09-11
tags: [maxwell, qa, prompt, skills, knowledge]
links: [evolve-maxwell-tuning-receiving]
---

# QA Case Agent 正式使用资源

**Why:** 2026-09-11 使用准备检查发现，旧 Prompt 限定恰好两次 skill_load 且禁止其他工具，阻断已配置的知识检索；旧 Skills 把具体测试数据也视作臆造。绑定的共享知识库只有验收样例，样例中的退款规则不应成为业务事实。

**How to apply:** Prompt 管交付与事实边界，Skills 管按需工作方法，知识库保存有来源和适用范围的资料。可以明确标注合成测试数据，不能把合成数值变成产品限制；资料未读取不能声称已覆盖。隔离测试文档，不直接清空共享知识库。更新后从正常 API/UI 保存并回读内容、核对绑定，再实际测试知识召回和用例交付。Skill 的 version 元数据可能未递增，应检查内容 hash 或快照。

## 当前配置入口

- DEV QA Preset：`bc709e3b-2c98-4c90-82f8-6a7d382e4f8c`；Studio `/agents/<presetId>`。
- 可维护资源：maxwell-ai 工作树 `.tmp/evolve-result-details-20260911/agent-resources/qa-case-agent/README.md`；本次源文件尚未提交，后续以实际代码位置核实。
- 原共享库未删除，仅 QA 改绑专用库；具体绑定、Prompt 内容和 Skills 以当前 Studio 为准。
- 冒烟证据会话：`thr_01M27PAKZMSZ27Q0G9PHJRS7KN`。单轮检索与 4 条虚构需求用例成功交付，不代表完整 PRD 与长任务运行稳定性已验收。

PRD 入口索引不等于正文知识。加入实际规则必须记录来源、版本与批准状态；过期规则退出检索。EVOLVE 历史基线保持原快照，新评测应捕获更新后完整资源和知识范围。

## 长任务验收边界

**Why:** 放大执行预算只能解决提前超时，不能证明任务能够跨进程恢复。2026-09-11 的本地修复用模拟时间分别验证长时间运行后按远端任务 ID 恢复、预算耗尽取消，以及不隐式重派；这些测试不等于线上连续运行数小时的验收。

**How to apply:** 检查 `services/evolve-server/internal/modules/evolve/domain/executor/executor.go` 与 `internal/app/integration/a2a/config.go` 的预算及重试默认值，再检查目标的实际 limits。已有目标不会因代码默认值变化自动更新。异步单任务恢复与进程内多轮编排要分开验收；后者需单独验证逐轮状态持久化。测试指针为 evaluation 下 `live_test.go` 的 `TestLongLiveRun*` 及 `processing_window_test.go`。预计两小时的任务应配置大于预计耗时的预算，并明确允许多少次完整重试。

## 配置归属与同步核验

2026-09-11：PR #282 移出新增 QA 配置副本，保留线上 Studio 配置；后续以 Studio 当前资源为准。调优 Agent 的官方 manifest 与业务实例 ID 不同，核验须从 Preset 实际绑定出发，逐项比较正文和 Skill 附属文件，不能只比较名称或版本。审计入口：maxwell-ai 工作树 `.tmp/evolve-result-details-20260911/.tmp/tuning-preset-audit/report.md`。该审计发现内容与绑定漂移，未执行线上覆盖。
