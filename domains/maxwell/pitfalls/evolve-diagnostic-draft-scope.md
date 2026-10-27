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
