---
name: evolve-self-authored-edit-claims
type: pitfall
created: 2026-11-03
updated: 2026-11-03
tags: [maxwell, evolve, candidate, diagnosis, evidence]
links: [evolve-resource-content]
---

# 自己写的修改说明不能证明实际差异

**Why:** 2026-11-03 实际模型请求已包含当前候选与父版本的完整提示词，编辑却仍用父版本原句匹配当前资源。局部编辑被正确拒绝后，模型改用整份草稿保存；原件只发生近义措辞变化，说明仍声称完成了当前版本早已有的行为修正。辅助核对读取两份草稿后，后续搜索全部落在它自己写的最新说明中，继续把说明当作旧版本原文。这不是保存层丢改动，也不能继续归因为信息未送达。

**How to apply:** 沿实际提交参数、持久化 payload、冻结资源 hash 和完整 diff 定位错误发生在哪层；作者说明与原件分开取证。检查复核者究竟读取旧资源正文还是只搜索新说明。找不到待替换原句与原句不唯一需要不同恢复方向，保持原权限、哈希和唯一匹配校验，只区分现有错误说明。修复加载、实际反馈消费、自主修订与业务质量分别验证；辅助纠正不能覆盖初次失败，未经质量验收的稿不当作有效新候选。

源码入口：Maxwell `services/evolve-server/internal/modules/evolve/application/resourcecontent/edits.go`、`application/commands/resource_edit.go` 与 `internal/app/transport/mcp/handler.go`。真实请求、全文差异及后续复核状态沿 `/Users/leslie/Downloads/sandai-code/maxwell-ai/.tmp/evolve-unified-1019/.tmp/autonomous-diagnosis-20261103/` 和根工作区 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的 2026-11-03 记录回查；不在本页固化易变分数、部署或验收结论。


## 2026-11-03：原件差异作为证据，而不是新增行为限制

**Why:** 全新上下文仍可能重复作者的错误版本对照；仅展示版本哈希，不能替代正文差异，完整资源已送达也不证明模型正确比较。另一方面，未冻结稿可能仍含不完整资源引用：诊断正确与最终保存可用必须分开验收。

**How to apply:** 在现有草稿读取/保存回执中，以持久化父版本和本版本为明确比较边界，沿原资源权限与SHA校验生成有界正文对照；不要用说明稿计算差异，也不要把父版本关系自动当成当前候选关系。单侧声明不等于运行时文件删除，文件对照不代表执行覆盖。保留截断、未读取和依赖失败的未知状态；不增加保存门槛，不把缺少证据改写成无变化。沿实际providerRequest确认消费，再独立比较保存payload、Skill哈希与最终陈述；同一已知场景恢复通过不代表业务质量普遍改善。

源码入口：Maxwell `services/evolve-server/internal/modules/evolve/application/queries/draft_resource_diff.go` 与 `internal/app/toolcaller_profile_history.go`；验收原件与后续结论沿 integration `.tmp/draft-original-diff-natural-20261103/` 和主 journal 回查。

## 2026-11-03：正文可读性先看模型视图预算

**Why:** 同一真实工具结果可能同时包含 MCP 的 JSON 文本后备和 structuredContent。Runtime 已有无损去重，但若先按原始封装计算模型内联阈值，就会把去重后足够小的完整正文提前隐藏成回执，诱发额外回读与复制哈希错误。不能把这类时间开销归为“模型不会推理”，也不能把所有反复读取都归因于此。

**How to apply:** 沿原始事件→模型视图→实际providerRequest对齐字节预算；用原始事件离线回放精确复现。阈值只计算现有无损视图，不改变持久化原件、读取窗口版本、原始哈希或权限；独立说明和去重后仍超限的正文继续按原机制读取。再验证真实模型请求包含完整正文，功能恢复与任务总耗时改善分开统计。

源码入口：Agent Runtime `toolprojection/projection.go`、`toolprotocol/result.go`、`model/multimodal.go`。证据沿 integration `.tmp/model-view-budget-replay-20261103.json`、`.tmp/model-view-budget-natural-20261103/` 和主 journal；无损转换、首次/历史消费及大结果回执须作为同一问题簇检查。
