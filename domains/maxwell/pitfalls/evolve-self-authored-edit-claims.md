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
