---
name: evolve-layout-research-20261016
type: reference
created: 2026-10-16
updated: 2026-10-16
tags: [maxwell, evolve, interaction, langsmith, opik]
links: [evolve-workspace-implementation-20261015]
---

# EVOLVE 成熟产品交互研究与差距入口

2026-10-16，用户要求先研究 LangSmith、Opik 的基础概念串联、整体布局和状态流转，明确差距后再实施；本次研究没有新增业务代码。

**Why:** 把已有功能分别放进图表、候选区、标签页和折叠表单，并不能形成连续工作。只覆盖完成态的原型也无法规定首次评测、部分结果和无候选时的内容，容易导致重复空态与概念堆叠。

**How to apply:** 先确定当前对象范围与状态，再定义默认工作面、选择联动、阅读与编辑边界。保留现有五项导航分类和 Maxwell tokens；页面不使用概念教学式问句或引导口号。当前实现与拟议调整应分别说明，不把局部检查通过当成设计获认可。

## 指针与边界

- 研究证据、官方来源、当前源码差距、状态提案、调整顺序与验收场景：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/research-20261016.md`。
- 原型及已确认交互：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-continuous-prototype-20261015/README.md`。
- 前序实现边界：[连续工作区实装指针](evolve-workspace-implementation-20261015.md)。

研究使用官方文档、官方界面截图、用户截图、本地只读页面和源码；没有在竞品付费工作区执行完整实验。版本、导航与现有实现会变化，应沿指针现场核对。设计推导不等于竞品已验证行为，也不等于 EVOLVE 已实现。

## 工作区与评分配置实施指针

- 五类对象的职责、横向导航的工作区/资产分组、版本关系、默认工作面和方法能力边界：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/workspace-and-evaluator-design-20261016.md`。
- 任务状态、评分阅读/编辑、定义检查及未保存草稿的浏览器证据：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/task-states-20261016/README.md`。

**Why:** LLM Judge 的 Prompt、模型、评分标准和运行策略不能仅因竞品放在一个编辑器内就混为同一持久化对象；只做布局翻译会产生保存位置和版本采用的歧义。

**How to apply:** 先查当前契约和方法实际消费字段，再给常用配置表单；以精确方法版本控制能力。定义 preflight、样本试评、真实运行出分和部署验证分别记录。引用读取失败不能变成“无引用”，未部署接口也不能靠前端占位宣称已经可用。当前支持范围和遗留问题沿上述验收记录现场核对。


## 新版优先与历史证据阅读

2026-10-16 用户明确：旧实现与最新版框架、布局冲突时采用新版。当前改动、截图、检查及尚未统一的旧入口，继续查上述 `task-states-20261016/README.md` 的追加记录，不在知识库保存易变的实现清单。

**Why:** 历史评分与新版聚合可能使用不同分母；截断证据可能包含完整正文但没有完整过程。只更换呈现形式，不能把旧评分换算成新结论，或把预览当完整交付。

**How to apply:** 核对冻结修订、统计口径及完整性标记后再显示；阅读/返回保留当前筛选、历史评测与基线。界面遵循新版，原始数据与业务文本保留。局部页面验收不代表全站统一或 Agent 闭环通过。


## 评测记录的业务身份

2026-10-16 用户指出，重复的“执行并评分 + 时间”不是有用的记录名称。

**Why:** 执行方式属于配置；把它提升为主标题会遮蔽 Benchmark、被测版本和候选的实际关系，形成看似完整但无法辨认的目录。

**How to apply:** 优先使用真实业务对象名称，版本和时间分别呈现。历史记录缺失关联时保留缺失事实，不编造名字或用当前定义替代冻结版本。具体读取策略、截图和测试沿上述 `task-states-20261016/README.md` 的“评测目录名称与冻结运行配置”追加记录核对。


## 比较身份与阅读范围

**Why:** 业务名称便于辨认，但不能用于合并不同冻结修订；只按已加载名称筛选会把未读内容误判为不匹配。

**How to apply:** 比较入口、指标列和同题证据共用稳定列标识；数据仍按冻结 Case 修订与执行序号对齐。搜索和改善统计明确实际范围，未知结果不变成零。页面返回保留所选基线、过滤和证据位置。具体契约限制与真实阅读证据见上述验收记录的“横向比较的连续阅读”。


## Benchmark 范围内的记录与对象筛选

**Why:** 全局目录需要辨认 Benchmark，进入固定 Benchmark 后则需要辨认被测对象与版本；同一种配置标签不能承担两种上下文的身份。接入对象目录标识与历史 targetRef 也不能按外观相似互换。

**How to apply:** 标题按当前对象范围组织，时间单列，跨页面比较保持同一条记录身份。对象筛选从实际评测记录取得 targetRef，名称从明确的接入目录关联解析；部分读取如实标注范围，缺失关联不猜测。2026-10-16 的实现与真实只读验证见上述验收记录的“Benchmark 范围内的记录身份”。


## 用例表单与未完成输入

**Why:** 从原始字段改成表单时，数值未填完和新字段尚未添加都属于用户草稿；仅保存已解析内容会在刷新或提交时悄悄丢失输入。带适配器完整性校验的输入也不能只改正文而保留旧校验。

**How to apply:** 将未完成输入和所处编辑分区纳入原有草稿恢复，完成或取消前禁止漏项保存；保存仍保留精确修订与原始未知字段。受校验保护的执行输入应通过对应接入工具重新生成。2026-10-16 的表单、草稿恢复、浏览器截图与剩余边界，见上述验收记录的“用例编辑表单与草稿恢复”。


## 被测对象、评分方法与服务连接分工

2026-10-16 用户要求结合 PR #358 的执行器归并，重新考虑被测对象与接入管理在新版前端的归属。本轮为设计提案，未改业务页面、契约或连接关系。

**Why:** 被测对象和外部 Judge 都可经网络调用，但业务用途不同；同一 Agent 的两条执行路径也不应成为两个待比较对象。把未暴露可用方法的 Provider 当作评分方法行，会混淆连接状态和评分能力。

**How to apply:** 保留五类导航；被测对象管理效果与运行能力，评分资产管理方法／标准／指标，初版曾建议低频连接维护放辅助设置，已被下方用户复核取消；评分配置归属也以最新用户澄清为准。PR 的显式归属、冻结选路和历史规则可复用，旧页面结构不覆盖新版。评分与执行登记／凭据边界保持独立。

设计方案、PR 精确提交、当前源码差距、页面布局、返回路径和待补契约：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/target-and-connections-design-20261016.md`。PR 当前状态须重新读取；不能以提案表示已合并或部署。


## 2026-10-16：唯一连接归属与指标内配置评分（后续已澄清对象归属）

**Why:** 同一个执行连接出现在设置和被测对象会造成双重管理；把业务指标、底层方法和 Prompt 配置分散到多个创建步骤，也不符合用户心智。用户明确希望直接创建“稳定性”“剧本完整性”指标，选 LLM Judge 并写自己的 Prompt。

**How to apply:** 执行连接唯一归属被测对象的接入配置，外部评分服务归评分资产的方法管理范围。业务指标编辑应整合名称、含义、计算方式、Prompt、模型、输出与样本试评；底层定义/绑定的拆分不成为多个前置创建步骤。评分标准组合精确指标配置版本，历史不随修改漂移。模型配置及真实试评当前契约边界须回源码确认，不把前端表单当作完整实现。

- 官方概念、用户澄清、现有源码与待补能力：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/metric-evaluator-management-20261016.md`。此方向取代本轮早先将每个 Prompt 配置独立放到评分方法目录的建议；尚未实现新契约。
- 连接归属的已实现范围、聚焦检查、Studio check 及真实只读页面验证：同目录 `task-states-20261016/README.md` 的“连接管理的归属与方法目录分离”。PR #358 归并和完整指标试评不在本轮已完成范围。
- 竞品刷新入口：[LangSmith Evaluators](https://docs.langchain.com/langsmith/evaluators)、[LLM Judge](https://docs.langchain.com/langsmith/llm-as-judge)。Evaluator 是可执行配置，可以多输出；Feedback key 对应结果指标，不把 LLM Judge 类型本身当成业务指标。


## 2026-10-16：评估器实例、指标集与证据范围

**Why:** 用户再次指出现有方法列表是底层能力；把指标与配置好的评估器合并，或仅把评分标准改名，仍未解决 case 证据如何进入计算并形成可比较指标的问题。

**How to apply:** 以最新用户模型为准：方法/类型提供算法，评估器实例保存 Prompt/模型/规则/输入输出配置，指标关联输出并定义解释与汇总，指标集组织多项指标。Benchmark 还要固定用例与评估器的证据范围和运行配置。一个评估器允许多输出；区分逐例汇总与多例联合评估。旧指标内 calculation 草案已被取代、未获批准，不可据此开始接口实现。

目标关系、LangSmith 官方依据、当前逐 Trial 实现差距及前端名称修改撤回边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/metric-evaluator-management-20261016.md`。本节取代上一节关于 Prompt 持久化对象归属的方案；唯一连接归属仍有效。历史 JudgeSpec 不能通过改名被视为已经迁移到指标集。


## 2026-10-16：由 Case 关联推导 Benchmark 指标

**Why:** 用户指出指标集属于复用用的中间概念；同时维护 Case 的指标关联和 Benchmark 的另一份必选指标集，会造成重复编排与范围不一致。

**How to apply:** Case 关联指标或指标集，Benchmark 按采用的 Case 及其关联汇总指标与适用范围；用例视图与指标视图是同一份关系的两个视角。指标集保留为可选批量复用资产，不能作为创建 Benchmark 的强制前置层。精确版本、集合展开、计算口径和证据范围一起冻结，不能按名称合并不同评估器，或让库更新改变历史。

当前目标模型、原清单批准记录、后续契约细化边界及是否实际实现，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/metric-evaluator-management-20261016.md` 与同目录 `evaluator-metric-set-contract-plan-20261016.md`。本节优先于此前关于必选独立指标集的编排方向；原接口批准不自动扩大到未列出的 Case 字段或数据库变更。

## 2026-10-16：独立关联与资产版本演进

用户进一步明确：Case 与指标解耦，各自可编辑、可选择关联；Benchmark、Case 和指标都能持续更新并保留自己的版本。此澄清优先于把新关系嵌入 Case 内容修订的短期方案。

**Why:** 把关系存成 Case 内容会让增删关联制造无关内容版本，也使指标侧难以独立管理；把历史快照解释成资产不可更新，又会阻断长期 Benchmark 的维护。

**How to apply:** 独立资产、双向关联、版本采用分别处理。关系变更不修改 Case 或指标内容；Benchmark 修改组成或采用资产更新时保存新版本，历史运行继续读取原版本组合。库中改动与当前 Benchmark 的局部编排分别标明作用范围；跨版本趋势标出用例与评分口径的变化。

最新目标、版本矩阵和编辑动线见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/metric-evaluator-management-20261016.md`。旧 Case 补充清单的批准与取代记录、代码撤回范围和当前实现/验证边界，分别查同目录 `case-metric-association-contract-plan-20261016.md`、`evaluator-metric-set-contract-plan-20261016.md` 与 `task-states-20261016/README.md`。不要把目标模型当成已部署行为，也不能将被取代的 Case 字段授权扩展成未列明的独立关系接口或表结构。
