---
name: evolve-layout-research-20261016
type: reference
created: 2026-10-16
updated: 2026-10-18
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

## 2026-10-16：评分资产发布与生成契约核验

**Why:** 在一个编辑面板中配置评估器与多个指标时，逐个保存会留下部分成功的资产；前端重试还可能改用更新后的版本。有效 OpenAPI 形状也可能超出当前客户端生成器的支持，不能以手改生成文件掩盖问题。

**How to apply:** 共享目录身份、修订与精确依赖采用原子发布；未知响应保留原操作及版本。CAS 物化与目录提交分别说明，不能把目录回滚说成没有任何物理内容写入。接口先更新 canonical OpenAPI，再实际生成、检查和测试恢复路径。

实现、当前生成器的互斥输入/布尔枚举注意项、真实测试及未验收边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/task-states-20261016/README.md` 的“评估器与输出指标的一次保存”。接口说明见同仓库 `services/evolve-server/docs/evaluator-publication.md`。内存/路由测试通过不替代 PostgreSQL 实际事务、完整编辑工作面或真实试评验收。


## 2026-10-16：Benchmark 历史版本编辑与比较

**Why:** 资产可更新与历史可复现同时成立。历史版本页如果直接打开最新内容，或更新并发保存基准时覆盖历史适用范围，会让用户以为在编辑所选版本而实际采用另一份配置。

**How to apply:** 将编辑内容来源与当前保存基准分别保留；名称、组成和元数据采用所选版本，提交检查当前头。比较入口保留精确版本上下文，未解析的引用明确不可读，不替换成最新定义。

实现、聚焦测试、完整 Studio 检查和只读浏览器证据，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/task-states-20261016/README.md` 的“Benchmark 独立版本的查看、比较与历史编辑”。记录同时保留一个真实历史用例集的目录解析缺口；版本阅读/未提交草稿验证不等于新版关联、实际发布或评测完成。


## 2026-10-16：独立版本的未知保存结果

**Why:** 第一次保存未收到确定结果后，后续重试被拒绝不等于原请求未提交；解除编辑锁可能让用户以另一组资产版本再保存，产生重复或错误修订。

**How to apply:** 待确认的原操作应保留幂等键、编辑内容来源、各资产并发基准和精确引用；后续拒绝与刷新均不重新取最新版本，成功恢复回执后再清除草稿。首次明确拒绝与已有未知请求分别处理。

评分发布的当前修正、六类后续拒绝回归与完整前端检查，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/task-states-20261016/README.md` 的“独立版本与未知保存结果”。这是保存恢复边界，不代表独立关联、Benchmark 更新采用或真实发布闭环已完成。


## 2026-10-16：单一 LLM Rubric 与可编辑 Prompt

**Why:** 整数、小数和不同业务 Prompt 不应成为不同底层方法；否则用户被迫理解协议版本而无法直接建立业务评估器。Prompt 修改也不能自动改写独立指标或既有 Benchmark 的评分口径。

**How to apply:** 用户从同一 LLM Rubric 入口配置 Prompt 和输出指标；具体规则版本属于评估器，指标保留独立身份与修订。历史请求继续按冻结协议执行，新测量结果按原类型保存，缺失不补零。模型选择、输入映射、试评和 Benchmark 编译分别核验，不以表单、配置检查或受控 Endpoint 测试代替真实评分闭环。

当前源码、目录与编辑器、业务模型准入测试、隔离组件截图和未完成范围：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/task-states-20261016/README.md` 的“单一 LLM Rubric 与自定义 Prompt”；批准范围及最新统一方法澄清见同目录 `evaluator-metric-set-contract-plan-20261016.md`。沿指针现场核对能力，不把本条视为已部署或已完成试评。


## 2026-10-17：直接落地正式评估器创建流程

**Why:** 用户明确要求直接进入正式前端；独立原型或组件模拟页无法证明目录入口、资产版本、恢复和实际服务已连通。

**How to apply:** 空白与模板入口共用正式评估器编辑器；模板只预填同一 LLM Rubric 的业务配置，不新增公开方法或复用新指标身份。配置、样本材料预览、真实模型试评与正式发布分开验收，保留版本和草稿恢复边界。

LangSmith 当前创建流程核查入口为 [Evaluators](https://docs.langchain.com/langsmith/evaluators) 与 [LLM-as-a-judge](https://docs.langchain.com/langsmith/llm-as-judge)。EVOLVE 的正式前端源码、用户登录后的实页交互证据、当前服务不可用和真实试评未完成范围，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/evaluator-create-flow-20261017.md`。以后复用须重新核对运行服务与接口，不把材料预览当作模型试评，也不把本条视为发布完成。

## 2026-10-17：评估器配置与实际执行的验证边界

**Why:** 前端热更新不能证明新增后端已运行；能保存 Prompt 和输出约束也不能证明计算调用消费了这些配置。

**How to apply:** 验收先核对当前前端代理指向的服务，再分别验证精确指标读取、配置编译、真实调用和发布回读。配置编译须保留独立指标修订，将范围、类别和材料映射送入同一计算协议；受控 endpoint 测试不能替代真实模型试评。

本轮代理定位、正式页面分类编辑、编译器测试及尚未接入的持久试评/Benchmark 边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/evaluator-create-flow-20261017.md` 的续接记录。环境地址和测试状态沿记录现场复核，不固化为产品能力。


## 2026-10-17：持久试评与未知执行恢复

**Why:** 试评同样会调用收费模型。请求丢失、Worker 崩溃或取消后迟到回执，若沿用普通评分的自动重试或直接清空草稿，会造成重复调用、状态倒退和错误归因。

**How to apply:** 在请求发出前保留操作身份，接收时冻结评估器、独立指标修订、样本和模型；恢复原请求优先于读取新的默认配置。未知执行不自动重跑，取消与租约失效阻止旧 Worker 覆盖结果。正式评分与编辑器试评分开记账和验收，样本阅读、受控 Endpoint、真实模型、数据库事务与部署分别提供证据。

当前接口、前后端实现、正式页面与键盘交互证据、未执行的迁移和剩余样本/Benchmark 能力，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/evaluator-create-flow-20261017.md` 的“持久试评、模型配置与结果阅读”。不能以源码及内存测试通过推断当前远端服务可用。


## 2026-10-17：材料选择与实际试评范围

**Why:** 编辑器隐藏未选材料却继续提交，或将最后一项取消后解释为采用全部材料，会改变实际评分依据。历史配置的空映射语义也不能因新增选择控件被静默重写。

**How to apply:** 材料配置、样本编辑、请求和预览采用同一范围。未选文字保留草稿但不提交；显式选择至少保留一项，缺材料阻止新调用，旧映射按原含义读取。手动文本不自动变成结构化输入；未知试评恢复原冻结请求，不重新取当前选择。

当前正式页面、请求裁剪、旧草稿兼容与实际方法消费测试，以及尚未完成的结构化样本和 Benchmark 编排，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/evaluator-create-flow-20261017.md` 的“正式评分材料配置与试评一致性”。界面已能选择材料不等于远端模型或资产发布已可用。


## 2026-10-17：指标集精确组合与跨页编辑

**Why:** 评估器输出组合如果隐式采用最新版本、跳转目录后丢失编辑状态，或用旧评分标准冒充指标集，会再次把独立资产和运行口径混在一起。热更新中的旧 Store 实例也不能代替完整页面加载验收。

**How to apply:** 指标集采用明确的评估器修订与输出指标修订，读取不改变采用；组合调整在草稿内完成，保存为集合新修订。从编辑器进入目录时保留草稿和返回上下文，恢复未知保存仍用原请求。正式页面、受控 Gateway、后端目录与真实发布分别验收；账号未恢复不能误报为浏览器存储故障。

当前正式入口、测试、截图、服务不接受新资产类型的实际边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/metric-set-management-20261017.md`。独立 Case—指标关系的待确认接口/存储清单见同目录 `independent-case-metric-contract-plan-20261017.md`；不得将已批准的指标集实施扩大为该关系方案已获批，也不得把前端目录当成完整 Benchmark 编排已完成。


## 2026-10-17：评估器的未完成输入

**Why:** 表单中显示的数值或分类与真正提交的声明可能不同。即时数值转换会丢掉未完成输入，未添加分类仅保存在组件内则会随切换消失；按钮变灰也必须让用户看见原因。

**How to apply:** 原始字段输入与有效声明分开保存到同一编辑草稿，保存、检查和新试评共同阻止遗漏；恢复时核对可见有效值与提交值一致。切换输出保留尚未添加的分类，切换模型保留用户参数，明确移除或改类型才清理不适用的输入。未知请求仍恢复原快照。

当前正式页面、数值和分类恢复、固定操作栏、窄屏证据与尚未运行真实模型的边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/evaluator-create-flow-20261017.md` 的“未完成输入与统一提交边界”。这不是完整发布或 Benchmark 验收证明。


## 2026-10-17：资产编辑抽屉与保留关闭

**Why:** 长资产编辑继续使用遮罩弹窗，关闭就等同放弃，会打断目录往返；把操作栏和复杂表单一起塞入多层滚动区，还会截断底部入口。只替换容器不足以保证连续编辑。

**How to apply:** 长编辑复用非模态 Drawer 的固定标题、独立内容滚动和固定操作栏。关闭与放弃分开，目录保留继续编辑入口；进入另一长编辑面先收起原草稿，历史内容基准与写入并发基准保持独立。写入中禁用关闭，未知结果继续同身份恢复。短归档和放弃确认保留模态。

正式源码、三类资产的历史草稿恢复测试、指标集浏览器往返与窄屏证据，以及真实服务未验收边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/asset-editor-drawer-20261017.md`。此记录不代表整个 EVOLVE 已完成或用户已认可视觉效果。


## 2026-10-17：独立指标编辑与评估器采用

**Why:** 新旧流程并存时，指标目录仍可能将用户带回旧评分标准；不同编辑面若重置或保留了错误汇总，还会使可见配置与真实结果不一致。复用指标不能暗中更新其内容或采用最新修订。

**How to apply:** 指标目录与评估器编辑连接同一精确引用流程。新建采用所选修订，加入已有草稿保留 Prompt、模型、样本和原输出；超限或无效批量全部拒绝，未知请求保持冻结。类型切换仅替换已知不兼容的内置汇总，扩展配置保留；表单名称同步定义，冻结登记与显式源编辑分开处理。保留关闭与明确放弃继续分离，查看关联资产携带返回编辑器的上下文。

正式实现、交互与测试证据、空指标目录及新版服务未就绪的验收边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/metric-evaluator-editing-20261017.md`。本条不是发布、模型试评或完整 Benchmark 链路完成证明；独立 Case—指标关系仍沿原批准流程核对。


## 2026-10-17：评分资产导航与方法用途

**Why:** Runtime 方法目录的 judge 分类包含计算、比较、校准和改进；把它们全部当作指标计算器，或让实现能力与日常资产占据同级入口，会继续增加理解成本。仅匹配方法标识还会将当前服务错误关联到历史版本。

**How to apply:** 日常管理围绕评估器、指标、指标集；底层方法与外部服务作为辅助入口。按真实用途筛选方法，创建操作受精确方法版本及能力约束。恢复相同方法草稿而不覆盖 Prompt、样本和未知请求；历史服务按方法与版本共同关联。校准进入配置后返回时保留筛选、所选方法与外层上下文。

正式前端、用途筛选、嵌套返回、草稿恢复与测试证据见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/scoring-navigation-20261017.md`。当前服务能力及发布/试评限制沿该记录现场核对；本条不是部署或端到端完成证明。


## 2026-10-17：Benchmark 编辑抽屉与运行规则输入

**Why:** 长配置表单仍放在模态窗口或折叠区，会割裂资产管理与版本编辑；数值即时转换会让空输入与实际提交不一致。已有评分配置也不能因新版指标集出现而被静默改称同一概念。

**How to apply:** Benchmark 编辑延续资产抽屉的固定标题、单一内容滚动和固定操作栏；关闭保留、放弃确认、提交中保护分开处理。跨目录操作携带精确返回上下文。数值草稿与有效请求配置分离并共同恢复，未知保存保持同一操作身份。当前评分配置与尚待批准的独立关联方案分别验收。

正式源码、浏览器关闭/刷新/目录往返、窄屏与聚焦测试证据，以及空资产目录和真实运行未验收边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/benchmark-editor-drawer-20261017.md`。本条不代表新的 Benchmark 关联模型或完整 EVOLVE 已完成。


## 2026-10-17：Benchmark 目录的业务名称与冻结入口

**Why:** 内部引用不能代替可读名称；长调优目标会撑高列表行。按执行连接筛选也不能代表按真实被测对象筛选，进入历史内容时更不能悄悄采用最新版本。

**How to apply:** 当前页来源名称按业务与任务身份读取、限制并发并隔离过期响应；名称限行保留详情，筛选只使用服务真实支持的范围。组成入口固定当前 Benchmark 版本，任务往返保留筛选和外层上下文；读取失败独立显示，不用新内容填补旧快照。

正式代码、真实目录筛选/返回与桌面证据见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/benchmark-directory-reading-20261017.md`。该记录保留历史冻结用例集未读通、对象筛选仍由任务选择及全目录搜索未实现的边界，不代表完整链路验收。


## 2026-10-17：冻结内容读取的错误边界与分页返回

**Why:** 将前端已经确认的修订不一致、目录解析未命中与服务读取失败统一压成一个错误，会掩盖真实断点；只按 Case ID 复用缓存也不足以保证采用内容一致。已加载内容搜索不能代表完整冻结集合搜索。

**How to apply:** 本地可控错误与远端错误分开处理，前者可提供明确原因，后者保留安全业务提示；缓存和历史读取共同核对精确版本与内容身份。分页与所选用例进入返回上下文，切换 Benchmark 版本清除旧位置。查不到采用修订时保留失败，不补最新内容，不判定为空数据。

当前实现、受控分页测试、真实页面修订往返、未解析历史用例集及服务读取失败边界见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/benchmark-frozen-reading-20261017.md`。现有有界目录扫描不是完整反查；错误展示修复不等于历史数据或后端故障已经修复。


## 2026-10-17：候选验证抽屉与证据往返

**Why:** 验证候选需要在固定基线、冻结用例和评分配置之间往返。若选择器要求内部 ID、返回时切换列表/谱系、浮层被抽屉覆盖或关闭状态与草稿分离，局部组件可渲染也不代表完整流程可用。

**How to apply:** 用真实目录筛选选择基线，结构化展示冻结配置，保留精确内容入口；把候选、基线、目录范围、视图和打开状态放入恢复/返回上下文。固定操作栏须在窄屏和长内容下验证，公共浮层复用层级 token。新增 Store 方法后还要完整刷新并验证持久草稿恢复，不能只依赖热更新实例。

代码、受控测试与实际页面读取证据见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/candidate-validation-drawer-20261017.md`。本轮未启动真实评测；读取曾失败后重试成功，不代表服务故障或完整调优闭环已验收。


## 2026-10-17：重新评分的连续工作面

**Why:** 重新评分依赖原执行证据，却需要跨配置、用例列表和逐题证据往返。把表单直接堆在结果正文上、翻页时卸载提交状态、换模型时静默重置参数，都会破坏用户对同一评分操作的理解。

**How to apply:** 同一抽屉切换配置、选择和阅读，操作栏固定且共用同一持久草稿。分页仅替换结果页，来源身份保持；结果返回优先回到来源评分上下文，再回上级任务或 Benchmark。模型选择保留明确的原参数；冻结读取失败可重试，不能换成最新修订。

本轮代码、真实浏览器读取、窄屏证据、测试与未提交新评分的边界见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/rescore-workspace-20261017.md`。新结果的回执和返回路径由受控测试覆盖，不能当作真实运行出分证明。


## 2026-10-17：主线交付、独立关系授权与性能验收

**Why:** 局部抽屉、输入恢复和受控测试持续通过，仍不能证明 Case—指标独立关系、Benchmark 冻结及运行消费已形成完整产品；默认页面连接的服务可能与本地新契约不一致。用户要求按完整能力说明进度，且每页接口性能与加载速度必须纳入交付。

**How to apply:** 优先实现独立关系 → Benchmark 精确快照 → 运行消费，再验证真实服务与同一实例的完整链路。记录接口耗时、请求数量和页面可操作时间；列表先筛选分页，避免逐行补请求和全库浏览器扫描，次要引用不得阻塞主内容。不得用局部样式检查、假数据或浏览器自动化等待时间代替交付或性能证据。

授权范围、当前完成/未完成和后续顺序以 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/README.md` 的当前交付状态为准。用户于2026-10-17明确批准同目录 `independent-case-metric-contract-plan-20261017.md`；仅授权列明接口及三张表迁移文件/测试，未授权 dev/生产迁移、回填、部署。旧记录中的待确认状态为历史记录，查当前清单。

调优入口的同抽屉证据往返、统一任务记录路由、草稿恢复及本轮真实读取/受控提交边界见同目录 `tuning-entry-workspace-20261017.md`。新关系、真实运行与性能验收仍须按当前源码与证据核对，不能从本页推断已上线。


## 2026-10-17：独立关系的精确来源与批量读取

**Why:** 同一评估器可以有多个输出指向同一指标。只用指标集依赖索引中的评估器/指标引用无法证明选中了哪个输出；逐条读取来源也会把大批量选择放大成重复请求。

**How to apply:** 从精确指标集内容校验条目及 outputKey，事务内复核不可变来源和依赖。关系历史与资产内容各自版本化；重试先恢复原回执并重新核验权限。按精确引用/内容去重、批量读元数据并限制内容读取并发；查询次数验证与真实数据库耗时分别记录。

源码、四个关联接口、三张表迁移文件及受控测试入口见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/independent-association-implementation-20261017.md`。当前部署、双向 UI、Benchmark 消费与实际性能是否完成，以该记录和 README 为准，不能据此推断已上线。


## 2026-10-18：Benchmark 组成采用与历史来源

**Why:** 用例库的当前关联和 Benchmark 的冻结关联是两种读取意图。采用失败后的重试若改读历史快照，会把旧组成伪装成采用成功；保存冲突后的最新版本号也不能代替原组成来源。

**How to apply:** 将未完成的采用意图纳入草稿恢复和未保存修改，重试保持同一来源；旧组成和元数据完整时允许明确保留。组成的历史来源与乐观保存基准分离，历史恢复直接读取选定版本，重复读取共用在途请求。旧草稿缺少可证明的历史来源时显示错误，不回退当前库。

实现、兼容与技术回归入口见 Maxwell `services/evolve-server/docs/evolve-evaluator-workspace.md` 的「Benchmark 组成读取的采用意图与历史来源」及 [PR #362](https://github.com/world-sim-dev/maxwell-ai/pull/362)。实际发布、浏览器与真实评测状态须另行核对，不能用这些源码测试替代。
