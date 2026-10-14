---
name: evolve-resource-content
type: reference
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, evolve, resources, tuning, evidence]
links: [evolve-http-resource-proposals, evolve-original-evidence-and-report-recovery]
---

# EVOLVE 大候选文件、授权引用与应用证据

源码工作树、实际改动、失败复现、验证与未完成项见[2026-10-14 本地复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-resource-content-review-20261014.md)。运行状态、测试数量和发布情况只查记录，不在知识库固化为当前事实。

**Why:** 大资源超出内联预算后，裸 CAS 哈希只有内容身份，没有业务 / Work 阅读授权。分段预览不能替代持久原件和实际准备的完整字节。另一个独立风险是把调用方填写的 prepared 身份与哈希，当作“候选已经在执行中生效”的证据。

**How to apply:**

- 查 `application/resourcecontent`、`commands/resource_edit.go` 和 `docs/evolve-resource-content.md`：从已授权冻结 Variant / Artifact 读取，校验身份、字节数与完整哈希；文本编辑校验原哈希和唯一、非重叠匹配。隐藏来源不能经作者入口公开。
- 查 Variant 冻结、`resource_changes.go` 与 Artifact 祖先继承：文件引用必须随候选留存，后续调优 Work 可以继承已授权原件；资源准备读取完整字节。原始结果文件、候选文件、模型上下文和 HTTP 包装是不同预算，不用扩大预览上限替代传输设计。
- 查 `ResourceContentReader` / Store、OpenAPI 资源窗口接口：只保留当前阅读段，复用生成客户端，校验页边界和身份，迟到响应不可覆盖新记录。原件已保存与当前只加载部分内容同时说明。
- 查 MCP / HTTP 的候选入口及 `resource_content_test.go` / `toolcaller_test.go`：不能开放调用方自填证明获得生效结论。内部回执核对须来自可信执行路径；materialized、实际 Run 生效、发布是不同事实。
- 查新类型迁移和本机数据库集成测试：复用 Artifact/CAS 不等于免于校验 producer、权限、幂等与跨 Work 继承。回滚保留历史引用与原件。
- 本地确定性执行器、Judge、浏览器 fixture 和数据库测试各有边界；它们不能代替真实模型评分、自然 Agent 场景或远端发布验收。
