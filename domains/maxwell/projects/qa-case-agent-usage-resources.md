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
