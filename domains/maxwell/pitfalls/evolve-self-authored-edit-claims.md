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

## 2026-11-03：恢复了读取与保存，归因仍可能失败

**Why:** 真实自然诊断已完整消费当前资源及新旧 Variant 身份，却仍从旧搜索状态的 activeRunRef 选取历史运行，未比较参评资源就用于当前候选。检索通用失败状态并读取 runtime.completed 只能证明停止，不能说明原因；归档里相邻的 runtime.failed 实际记载模型内容拒绝。存在文字文件也不能证明文件完整、可交付或可以绕过原拒绝。

**How to apply:** 保存作者声明、实际工具选择、原件全文与终止事件，分别判断读取、正确归因、编辑、保存和质量。把错误归因的新稿保留未确认，不能用随后编辑成功覆盖失败。核对已消费的冻结身份与真正读取的事件；已有 Skill 已说明版本适用性和失败原因时，不再用追加相同规则解释问题。

另一个工程边界：既有草稿续改分支仅允许授权原件引用，内联正文需要原有冻结来源路径；将内联拒绝误报为裸 CAS 会误导恢复。准确区分现有错误并提示原路径，无需增加许可或改变接受集合。源码 `resourcecontent/source_draft.go`，真实自然调用随后自行使用冻结来源成功；这仅证明原恢复能力存在。证据沿 integration `.tmp/model-view-budget-natural-20261103/{assessment,model-proof,persisted-proof,old-visible-failure-originals}.json` 和主 journal，不在知识页保存活跃身份或变动分数。

## 2026-11-03：版本纠错与合理修复方向分别验收

**Why:** 已完整扫描的归档可能仅返回字面匹配，导致终止状态可见而真正错误事件难以定位；另一次真实复验在相邻测量身份说明下纠正了旧候选归因，并恢复实际原件，但自然续问即便读到原始安全拒绝，仍把“文件存在而未交付”说成已证实的次级缺陷。找到直接错误不等于证明恢复交付或改派工提示合理。

**How to apply:** 对已有授权、有界读取的完整JSON事件提供真实位置，不自动选根因，不扩大读范围或改变查询匹配；原错误正文仍由原件读取。把已参评身份放在同一回执中，避免只依赖跨调用记忆。验收分别记录版本适用性、直接原因、次级因果、实际修改与质量；附注没有在实际窗口发出就记未覆盖，不能把离线回放当模型消费。恢复成当前候选原件的草稿不算新增质量候选，不为制造提升而重复评测或绕过原拒绝。

源码入口为 `queries/evidence_event_navigation.go`、`app/toolcaller_evidence_navigation.go`；当前实际SP/Skill配置、原始请求、保存比对和后续质量状态沿根工作区 `output/evolve-unified-20261019/evidence-navigation-acceptance-20261103.md` 与 integration `.tmp/evidence-navigation-natural-20261103/` 回查。


## 2026-11-03：完整时序会否定最先发现的错误归因

**Why:** 继续独立检查同一历史归档后发现，较早的子任务错误后来已经恢复，父任务也真实读取了恢复产物；最终失败发生在后续父任务自己的模型调用。此前仅凭早期错误原文就称“直接原因已查明”不成立，上一节的历史初步判断不能替代这次完整时序。另一处误读把带 `modelFinishReason=tool_calls` 的过程消息当成最终答复。新自然会话还会从草稿作者复盘加最终状态重复该解释，甚至没有读取原始恢复与终止事件；因此不能泛称“全部相关证据都已读到但模型仍错”。

**How to apply:** 以原运行、调用关联和时间串起被恢复的中间失败与实际终止事件，用后续动作检验初始解释。事件目录和字面命中旁保留原始时间、执行身份、工具调用及消息控制属性，不自动选根因、不复制参数或扩大授权。核验实际模型请求：工具能力存在、模型使用入口、读取对应事件、正确解释是不同验收项。若只是复述作者说明，应改进诊断方法及入口组织，而不是继续叠加相同禁令；精简方法的实际效果仍由新会话验证，不因安装成功而宣布有效。

源码入口仍为 `queries/evidence_event_navigation.go` 与 `queries/evidence_text.go`；Skill 入口为 `agent-resources/skills/evidence-diagnosis/SKILL.md`。事件复建、两次原配置失败、新配置验收及未知边界沿 integration `.tmp/causality-natural-20261103/independent-chronology.json`、`.tmp/search-event-context-natural-20261103/`、`.tmp/diagnosis-entry-natural-20261103/` 和根工作区 `output/evolve-unified-20261019/causal-diagnosis-acceptance-20261103.md` 回查。
