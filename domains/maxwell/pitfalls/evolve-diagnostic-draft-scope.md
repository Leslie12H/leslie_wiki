---
name: evolve-diagnostic-draft-scope
type: pitfall
created: 2026-10-27
updated: 2026-10-27
tags: [maxwell, evolve, agent, cases, evidence]
links: [evolve-runtime-payload-and-terminal-recovery]
---

# 独立诊断题范围与草稿真实性

**Why:** 补少量诊断题不等于重建原题集。要求草稿列全本次选题的说明若没有区分独立新增与完整题集，容易诱导 Agent 重写大量旧内容；长工具调用遗漏一个字段后还需重新生成。保存回执只证明草稿落库，不能证明旧题未变、评分契约正确或已能执行。读取了可比较的历史 Run，也不能把其他候选的成绩归给当前方案。

**How to apply:** 先确定本次草稿范围，独立新题只保存新题；正式旧 Case、冻结题集和历史评分继续保留。确需复用旧题时，按原记录比较输入、评分与版本来源，不相信标题或 Agent 自述“未改”。对比结论须关联真实候选和冻结配置。逐项区分自然首答、追问后的恢复、保存成功和可执行性验证；失败应保留，不以补充提示后的成功覆盖。遇到漏填工具字段，先定位校验发生在模型运行端还是服务端，避免仅在下游补默认值却声称修复。

- 说明与实现入口：Maxwell `agent-resources/skills/case-design/SKILL.md`、EVOLVE `application/commands/draft.go` / `confirmed_draft.go` / `case.go`；Agent Runtime `ports/tool_validation.go`。不改变原版本保护或权限来掩盖模型改写。
- 自然场景、真实草稿逐字段差异、用量、隔离 Skill 更新与后续恢复状态：`output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的 2026-10-27 natural49 记录，以及集成工作区 `.tmp/natural49-visible-coverage-20261027/`。本页不表示自然验收或发布完成。

## 2026-10-27：评分方法配置混用

**Why:** 新题范围正确仍不代表可执行。自然场景实际读取了完整外部评分目录和模板，却沿用旧草稿里的内置 llm-rubric 参数；精简并按需拆分 Skill 后，新会话仍可能照抄错误配置。不能把失败都归因于工具信息缺失，也不能仅因新提示词被消费就称修复有效。

**How to apply:** 对照实际模型请求、工具回执和提交正文，分别核对方法身份、版本、配置形状、逐题规则与输入契约。保存不完整草稿与物化校验应分开；检查保存回执是否只报告写入成功，以及 Agent 有没有把它错误解释为结构兼容。说明优化的因果效果必须以独立自然产物验证，失败后不要循环堆提示词或重复相同输入。

- 实际两次自然适配失败、按需说明安装与消费证据：上述验收记录的 natural50/51，以及集成工作区 `.tmp/natural50-diagnostic-contract-20261027/`、`.tmp/natural51-diagnostic-adaptation-20261027/`。
- 只读代码核对入口：`application/commands/provider_case.go`、`confirmed_draft.go`、`internal/app/toolcaller.go` 的 draft put/get；当前可编辑保存与确认校验的边界以源码为准，不在本页固化运行状态。


## 2026-10-27：保存与静态反馈分离

**Why:** 强制草稿完整才允许保存会损失迭代空间；只回保存成功又容易让 Agent 错判兼容性。真实会话收到保存后的静态错误后，能修正外部评分配置和缺字段，但依然可能在格式错误后过早停止，或只更新结构化内容而留下过时说明。

**How to apply:** 复用已有只读检查，为可编辑草稿提供有界、脱敏、非阻塞反馈；检查失败不回滚保存，依赖不可用不改成写入失败，历史冻结内容不按新目录重判。静态成功不能表示执行、评分或效果通过。独立核对落库 payload、正文和最终答复的一致性，分别保留首答失败与自然追问恢复；技术解析不能替代真实执行。

- 源码入口：EVOLVE `application/commands/draft_check.go`、`internal/app/toolcaller_draft_feedback.go`、`internal/app/transport/mcp/handler.go`；原结构化回执与附加文本的边界以当前代码为准。
- 红绿、实际模型消费、保存恢复及尚存正文不一致证据：上述验收记录的 natural52，以及集成工作区 `.tmp/natural52-draft-feedback-20261027/assessment.json`。本页不表示自然自主闭环已通过。


## 2026-10-27：私有可见题集不等于隐藏题集

**Why:** 未发布为共享标准的 Work 私有题集，可能全部由本任务可见题组成。正文读取一律要求 hidden 权限会阻止 Agent 核对正确冻结成员；但元数据可见也不能直接放行所有正文。

**How to apply:** 保留原资产与任务血缘授权，读取有界且哈希一致的冻结清单，逐批核对每个成员当前的业务、任务、可见性与精确摘要。隐藏、缺失、摘要不符或越权成员仍拒绝，不返回部分清单；覆盖跨页最后一项和元数据只读分支。UI 读取、模型实际读取与自然计划交付分别留证。

- 指针：EVOLVE `application/queries/service.go`、`case_set_content_test.go`；红绿权限回归和自然54结果见主验收记录及 `.tmp/natural54-scoring-coverage-20261027/`。

## 2026-10-27：规则总分不等于登记测量

**Why:** rubric 的加权总分和通过条件，与平台 metricBindings 分属不同内容。Agent 只读规则就声称已补齐，可能没有修改或有效计划；新草稿即使保存成功，也可能混入不支持的规则字段。

**How to apply:** 非阻塞反馈列出每题实际登记的项，明确公共 Judge 和调优目标尚待核对，不把不同题的绑定并集当全覆盖。错误原版身份继续拒绝，只有授权检查通过后才给精确恢复引用。分别核对保存动作、payload、正文与计划，不以技术反馈替代自然验收；实际模型未选用正确新题引用时，应保留失败而非反复提示答案。

- 指针：`application/commands/draft_check.go`、`optimization_candidate_scope.go` 及相邻测试；natural54 实际调用、新旧草稿和未消费反馈的边界见主验收记录。


## 2026-10-27：删去非法字段可能改变判定语义

**Why:** 格式错误修复后能够保存，不代表原规则被保留。模型可能为通过静态检查删去整题判定策略，从按指定业务指标判定切回默认策略；把不同题维度并成公共评分，也会让额外维度应用到每一题。错误草稿的格式问题若遮住评分项清单，会使这些独立缺项更难发现。

**How to apply:** 在格式失败时仍提供有界的草稿声明说明，但明确未校验通过；取消或超时则不继续检查。反馈应解释实际公共绑定合并与省略字段的默认行为，不能替用户改策略。核对最终正文、结构、绑定合并结果及默认判定，不能因静态通过或“仍未运行”的免责声明就判自然修复成功。

- 指针：`internal/app/toolcaller_draft_feedback.go`、`application/commands/draft_check.go`、`domain/metric/binding.go`、`domain/evaluation/native_scores.go`；natural55 的实际原始失败、三次保存尝试及最终结构风险见主验收记录。


## 2026-10-27：反馈生成不等于反馈完整送达

**Why:** 草稿列表返回完整最新内容却没有单份读取的检查反馈，Agent 可能不再读取单份草稿，漏掉配套资产的错误。另一个独立缺口是把用户可读说明套用日志错误的短字节预算：源码生成了评分范围和默认判定解释，MCP 文本却可能在中途静默截断。只验证生成函数或某个关键词出现不足以证明模型收到了完整结论。

**How to apply:** 核对实际工具回执和下一次模型请求。列表与单份读取在授权完成后提供一致的非阻塞反馈，整次列表共用有界检查预算，不追加写入或扩大权限。用户反馈采用独立有界展示预算，完整执行敏感内容排除后再按 UTF-8 边界截断，并明确提示截断；结构化原回执保持不变。分别验证格式失败、历史冻结、取消、空列表、超长说明和敏感词在截断点之后的情况。技术传输通过不等于 Agent 已修好跨资产语义。

- 源码指针：EVOLVE `internal/app/toolcaller_draft_feedback.go`、`internal/app/transport/mcp/handler.go` 与对应测试。红绿及实际自然消费证据见主验收记录 2026-10-27 natural56 和集成工作区 `.tmp/natural56-paired-scoring-20261027/`；当前验收结论以该记录为准。


## 2026-10-27：组合事实送达后仍须核验实际修复

**Why:** 分别列出题内绑定与公共绑定，仍需模型自行推演组合关系。复用执行侧合并函数能提供确定的逐题继承事实，但即使完整预览进入实际 Provider 请求，Agent 也可能只改说明文字，误把新版本号或保存成功当成配置修复。

**How to apply:** 组合预览必须明确是假设配套，限定同业务、同任务的可编辑草稿，不隐式选用、不重判历史；用真实 MergeBindings 计算同名覆盖与公共继承，不凭名称猜测评分。验收应定位至 providerRequest 中的具体消息，再比较前后保存 payload、修订归属和判定策略。若内容未变且原拒绝仍在，保留自然失败；不能反复增加反馈说明来宣称可靠性。

- 源码：EVOLVE `application/commands/draft_check.go` 的 EditableDraftPairingNote、`domain/metric/binding.go`；技术边界测试与 natural57 真实结果见主验收记录及 `.tmp/natural57-pairing-repair-20261027/assessment.json`。


## 2026-10-27：外部评分配置与平台判定契约分层

**Why:** 外部 Provider 的配置和逐题规则模板不包含平台原生 Judge 的整题判定语法。只把 outcome 写成可选项、把公共绑定误当目录，会让模型猜测阈值字段或删掉策略；但补齐语法后，模型仍可能只改正文，说明文档缺口不是自然修复失败的充分解释。

**How to apply:** 分别提供评分服务契约和平台判定结构，明确公共绑定应用于每题、题内同名覆盖与指定指标判定的边界。将文档JSON交给真实解析器和判定函数校验，再检查实际 Provider 请求消费及最终持久化差异。模型承认一份草稿未修好，不能抵消它对另一份草稿可用性的失实判断；保留失败，不反复用相同请求重试。

- 指针：Judge/Case Skill入口、EVOLVE application/evaluation/contracts.go 与 domain/evaluation/native_scores.go；主验收记录2026-10-27 13:09及集成工作区 .tmp/natural58-native-policy-20261027/assessment.json。文档与技术验证通过不表示自主修复或发布完成。

## 2026-10-27：运行参数实验与产物分层判定

**Why:** 信息完整送达后仍不修复结构，不能继续把失败归因于缺提示；请求缺省推理参数也不能证明供应商关闭了推理。一次显式参数实验可能修好了真实结构，同时仍误解用户措辞。模型调用次数与记录用量次数不一致时，完成状态不代表成本完整。

**How to apply:** 从原UI与实际Provider请求核对当前参数，隔离预设单次受控修改、事后恢复并独立回读。对照持久化payload与冻结原件、实际公共绑定与outcome，再单独评价正文和最终回答。记录上下文差异，不能将一次结果当干净A/B或普遍可靠；对缺失用量保留已知合计和缺失数，不猜测收费或恢复原因。

- 实验/恢复/结构比较与部分自然结论入口：Maxwell验收journal 2026-10-27 14:26及集成工作区 `.tmp/natural59-reasoning-control-20261027/`。最新运行参数必须重新查询，不从本文推定。


## 2026-10-27：重复审核相同内容与不可变来源

**Why:** 内容寻址资产会复用相同正文，但不同草稿版本和确认人的来源记录不同。若把新的确认记录当作对旧资产元数据的重写，正常的再次确认会停在“已确认、等待保存”；简单放宽全局幂等比较又会丢失来源约束。

**How to apply:** 仅在正式确认保存入口，核对同 Work、同对象、同规范化内容哈希的早期冻结草稿与精确资产关联，复用原资产的来源记录；新的审核人和版本保留在新草稿及审计中。仍通过原原子提交校验最新审核、内容、权限和引用；普通 freeze 不接受来源改写。验证应覆盖同内容新版本、不同确认人、原资产逐字段不变、未审核/变更内容拒绝，以及原 UI 失败后恢复和独立数据库回读。

- 实现入口：EVOLVE `application/commands/freeze_draft.go` 与 `freeze_draft_test.go`；不可变元数据和最新确认围栏沿原 `artifactwrite` 与仓储事务核验。
- 真实故障、红绿、回归与恢复证据：集成工作区 `.tmp/draft-repeat-confirm-*-20261027.log`、`.tmp/diagnostic-confirmation-proof-20261027.jsonl`、`.tmp/diagnostic-confirmation-case-hash-20261027.json`；验收记录 2026-10-27 本批确认恢复小节。草稿冻结不等于运行计划或质量验收通过。

## 2026-10-27：恢复事件与缺失账单分别核验

**Why:** 请求之后出现 runtime_continue 只能证明运行继续，不能单独证明供应商超时、Worker 崩溃或重复收费。失败的模型流可能经过既有持久重试恢复，但没有收到用量仍然是未知账目。

**How to apply:** 关联原生 Run 的模型事件、唯一 Worker 的结构化错误和恢复日志、Temporal Activity 实际 attempt/typed failure；区分正常主模型重试、Worker 重放和用户取消。确认恢复成功也不推算缺失调用成本，不修改旧账单或延长超时冒充修复。

- 入口：Agent Server `runtime/core/nodes/model_retry.go`、`runtime/infrastructure/temporalruntime`，以及本批 `.tmp/natural59-model-recovery-20261027.json`、`.tmp/natural59-temporal-history-20261027.json`、`.tmp/natural59-recovery-regression-20261027.log`。实际私有原件不复制进知识库。


## 2026-10-27：原生评分的保存与运行准入必须一致

**Why:** 原生 Judge 是绑定声明，保存不执行评分方法；若运行入口仅按 producer=agent 要求编译调用记录，会拒绝合法的人审产物。用手工导入评分构造的测试可能漏掉这条真实 Agent 草稿链路。

**How to apply:** 将真实草稿确认/冻结产物送入准入函数，核对无需伪造编译历史；实际评分方法、版本、业务权限和配置仍在测量准入检查。传统 Agent Judge 与 CaseSet 的编译依据要求保持。草稿静态通过和正式冻结不能替代实际计划受理。

- 入口：EVOLVE `commands/service.go` 的 `invokeJudgeSpecMethod`、`commands/run.go` 的 `frozenRunMethods`、`native_draft_test.go`；红绿和完整回归沿 `.tmp/native-reviewed-admission-*-20261027.log`，真实计划恢复沿 natural60 验收记录。
