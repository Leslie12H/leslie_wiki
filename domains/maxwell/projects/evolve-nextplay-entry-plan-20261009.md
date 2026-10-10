---
name: evolve-nextplay-entry-plan-20261009
type: project
created: 2026-10-09
updated: 2026-10-10
tags: [maxwell, evolve, nextplay, interaction, judge, import]
links: [nextplay-benchmark-import-audit-20260915, evolve-runtime-judge-review-20260916, evolve-design-review-self-iteration-20261009]
---

# EVOLVE 通用工作台与 Nextplay 接入方案

完整问题、三阶段方案、验收与契约评审范围见[本轮方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-nextplay-integration-plan-20261009.md)。2026-10-09 为设计方案，未实现、未执行真实评测、未部署。源码锚点及线上只读页面范围均在方案开头；不可将线上页面与本地 main 默认视为同一部署版本。

**Why:** 用户明确纠正：EVOLVE 是通用平台，从零生成 Case 与接入已有 Case 同等重要，Nextplay 只是一个业务。原方案把导入主线误设为平台主线，已在原文修正。Case 和评分方式分别支持生成、导入和复用，并在同一工作台混合使用；业务紧急需求不改变平台定位。发布与回滚后置。

**How to apply:**

- 先核对方案第 1 节的线上页面观察与 Studio 当前源码；向导完成状态、评分方法类别、Work 前置与首次启动是否连成一条路径，不能只看单页完成标记。
- 从 Nextplay `evaluation/judge.py` 的工厂、`agentic_judge.py`、`judge_bundle.py` 与 `composite.py` 确认当前真实评分实现，再看 `evolve/export.py`；不要从旧 exporter 推断现有 Judge 仍是普通 rubric。
- 从 EVOLVE `ports/judge_aggregate.go` 与 `evaluation/judge_provider_method.go` 对照协议声明和实际执行链路，分别验证浮点、聚合责任、逐项 incomplete、原 overall verdict 是否保留。
- 数据数量、split、执行和评分状态会变化，应重新读源 manifest 和实际报告；本轮清单统计不代表执行通过。开发反馈与最终测试用途在迭代前明确，不能静默改源标签和可见性。
- Nextplay 接入场景沿用原 Runner/Judge 包接通可运行闭环；托管包入口的依赖、取消、幂等、证据与结果读取需要独立验收，不能把历史评审方案称为已有能力。
- 实施前按项目规则提交完整 API/结果协议及必要表结构、配置变更清单；现阶段方案不构成具体接口或 DDL 的实施批准。

## 2026-10-09 用户评审纠正

通用平台的交互和一期验收以[修订方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-nextplay-integration-plan-20261009.md)第 1 节及实施顺序为准。从零生成、已有资产接入、混合使用同等验收；Case 来源与评分方式来源独立组合。生成能力不能被降为事后辅助，评测包和试跑也不能成为所有任务的强制起点。Nextplay 源码发现只作为该接入场景的依据。

## 2026-10-09 资产归属与持续维护

用户进一步明确 Case、Judge 不应绑定 Work，并要求历史差异、指标增删改查、Benchmark 新建与扩充。具体模型和交互见[方案第 4 至 6 节](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-nextplay-integration-plan-20261009.md)。这是设计要求，尚未完成解耦或迁移。

**Why:** 任务来源与资产所有权混用会阻断跨任务复用；只有版本分数曲线不能说明题目、指标或判卷规则发生了什么变化。

**How to apply:**

- 核对 Case revision、Artifact Work 约束、metric_import 写 Judge 草稿、Benchmark 创建/成员读取及 Run 准入，不能仅移除页面 Work 选择器。
- Case/Metric/Judge/Benchmark 按业务级身份和版本管理，Work/Run 引用精确版本，来源 Work 只作追溯；分清指标定义、评分实现和 Benchmark 使用策略。
- 参照方案的版本 diff 与 CRUD 语义，区分成员移除、资产归档、物理删除；新版本不能静默改写已有 Benchmark/Run。
- Benchmark 新建与扩充继续同等支持生成、导入和混合使用。历史口径不同的总分不能直接当提升，增量运行不能冒充全量重跑。
- 具体 DDL、唯一键/关系和 OpenAPI 变更实施前按项目规则确认；同名历史 Case 不自动合并，保留历史 ID、内容与授权边界。

## 2026-10-09 多套 Benchmark 与交互设计稿

用户明确要求同一业务可维护效果、性能、成本等多套 Benchmark，并要求结合现有 Maxwell 风格提供可用的前端设计。当前代码已具备业务级多 Benchmark 版本基础，开工缺口与边界见[实施准备](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/implementation-readiness.md)。

**Why:** 将所有评测都压成一套质量分会丢失性能/成本的单位、运行条件与缺失语义；仅改界面不能解开已有 Work 与 rubric 执行限制。

**How to apply:**

- 用途作为可扩展标签/模板，Benchmark 分别锁定资产与运行条件；性能/成本可由执行数据计算，不要求 LLM Judge。
- 一次多选建议展开为多个 Run，在前端汇总。2026-10-09 后续交互评审纠正：普通评测不应前置迭代 Work；历史后端容器约束应内部兼容。证据复用需条件一致，不另造套件资产。
- 以[原型说明](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/README.md)及[设计 QA](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-qa.md)查看本地原型、12 个 SVG/Figma 导入画板与验证边界。全部为演示数据；原生 Figma 插件未在编辑器内执行，没有在线 Figma 文件。
- 实施前完成精确资产迁移、API/结果契约和 Nextplay 原 Judge 同证据验收清单；产品讨论和原型不构成接口/DDL 的批准。发布/回滚继续后置。


## 2026-10-09 用户路径、评分两层与完整性纠正

**Why:** 用户连续指出导航和对象割裂，明确 Judge 分为通用方法与由其派生的业务指标，并要求从零/已有 Case 与 Judge 导入、历史、人工修正结果和指标迭代形成完整交互。把对象逐个做成列表并不能替代用户路径。

**How to apply:**

- 此前设计以[用户路径与完整交互规范](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/user-journeys.md)为准，尤其第二轮严谨性复核。主工作在同一 Benchmark 上下文内完成；资产管理和 Agent 接入提供跨集复用，普通评测不要求先建迭代任务。
- 核对通用方法、业务指标规则/参数与固定版本关系；一个原程序可产生多项指标，不能强制一指标一次 Judge 调用。Case 来源与评分来源独立组合，导入/生成同等重要。
- 已有评分方案应区分规则配置导入、原程序/服务接入和已登记方案复用；原始逻辑、原生裁决及缺失状态需要保留。当前代码能力回到正式 Studio ConnectPage/Library 和 Provider 执行链路核验，不能从原型推断已接通。
- 人工复核、修订指标后的重新评分、新 Agent 版本重跑是三种操作；分别保留原始结果、追加记录与计算版本。人工修改不能伪造原执行成功或证据，规则升级不静默刷新历史分数。
- 以[设计验证](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-qa.md)查看实际覆盖。此处记录 V5 历史边界；后续 V7 本机原型已补齐导入、复核、重评、草稿保护和模拟权限，当前状态须看下方 V7 指针，不能视为真实业务验收通过。

## 2026-10-09 产品文案纠正

**Why:** 用户明确反对把 1/2/3 教学编号和「怎样判断好坏」「测哪个版本」等解释性问句写入工作台，认为不符合真实产品设计。

**How to apply:** 配置界面使用明确的功能名、字段名和动作，如「测试用例」「评测指标」「被测对象」「评分方法」「评分标准」；删除评审讲解、流程口号和重复提示。仅在影响操作决定时保留帮助信息。交互路径通过布局、状态和操作承接表达，不能靠教程文案弥补。当前视觉以本地设计稿及 design/ui-copy-refinement.jpg 为准，旧截图保留为历史。


## 2026-10-09 参考产品后的动线审查

审查证据和下一版结构建议见[交互与视觉审查](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/audit-20261009/design-audit.md)，其中保存本轮原型截图、复现路径及 Linear/Langfuse 官方界面、Braintrust 文档参考的证据边界。

**Why:** 删除教学文案未解决 Benchmark 维护、运行配置和结果分析混排；是否连贯必须实际走完进入、执行配置、结果和返回路径，不能只按页面功能齐全度判断。

**How to apply:** 下一轮用稳定 Benchmark 页头和内容页签保持上下文，运行参数集中在新建评测中；Case/指标/方法仍独立复用。先修操作重复、返回状态和逐题复核，再处理视觉权重。参考产品只借鉴适用的结构，不引入其固定输入格式或所有权限制。本轮是局部原型审查，未修改实现；提案与已验收能力必须继续区分。


## 2026-10-09 Maxwell 组件复用与 V6 布局修订

**Why:** 用户指出下拉框未使用 Maxwell 系统组件，整体设计仍不统一。只复制颜色、边框或重新绘制控件，不能保证尺寸、焦点态与交互一致。

**How to apply:** 原型通过 [ui.jsx](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/src/ui.jsx) 直接引用 Studio 的 Select、Button、Tabs、TableFrame，样式编译入口为同目录 maxwell.css。Benchmark 使用稳定页头与内容页签，Agent/版本配置集中在新建评测。当前结构、截图与验证边界回到 [README](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/README.md) 和 [设计 QA](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-qa.md) 查看，不从旧 Figma 导出推断当前状态。V6 当时引用的 base/Select 封装原生 select；用户后续截图确认其展开菜单仍不符合目标。V7 改用现有 EVOLVE EvolveSelect，详见下节，不能把同名组件引用当成菜单样式已经一致的证据。正式 Studio、后端和接口未改；组件统一不等于人工复核、重新评分等完整链路已经实现。


## 2026-10-09 V7 完整体验与展开菜单纠正

**Why:** 用户截图显示 V6 的原生灰色弹出菜单仍与 Maxwell 不一致，并要求以完整产品体验交付信息架构、操作动线、异常状态、设计系统、可点击原型与实际验收。用户确认业务负责人、开发者及调优同学共同使用，同一业务多人调优不同 Skill，调优同学需要复核平台判定。

**How to apply:**

- 优先读当前 [V7 体验方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/experience-plan-v7.md)、[设计系统](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/.interface-design/system.md) 和 [实际验收](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-v7/acceptance.md)，不要从旧 SVG/Figma 导出判断现有交互。
- Maxwell 具有不同选择组件：基础 Select 是原生菜单；本次复用来源是 [EvolveSelect](/Users/leslie/Downloads/sandai-code/maxwell-ai/apps/studio/src/products/evolve/v3/EvolveSelect.tsx) 的页面内 listbox。验收必须展开菜单，并检查焦点、方向键、Tab/Esc 与辅助语义；仅检查 import 不足。本轮只在正式组件补齐键盘行为，业务流程改造仍是隔离原型。
- 对齐完整任务路径，避免把概览、资产目录、结果目录堆在一起。默认进入 Benchmark，多种来源在同一集内组合；共享 Case/业务指标/通用方法独立维护，Agent/Skill 版本在新建评测时选择，迭代任务不前置。
- 人工复核要同处提供任务输入、预期、输出、冻结评分标准、方法版本和原始/当前判定，并追加理由与版本；执行失败、质量低分、尚未复核是独立条件。标准修订、旧证据重评、新 Agent 执行必须分开追溯。
- 趋势比较必须限定可比口径，取消、部分执行和明确排除用例的子集不能悄悄混入完整测试曲线。方法详情应从方法版本追到派生指标版本及 Benchmark 引用。
- 本轮实际覆盖和可变状态只存上述验收指针。所有执行/生成/评分为本地模拟，真实 Nextplay 等价性、多用户同步/鉴权/并发与自动迭代未接通；原型负责人字段不等于服务端身份权限模型。没有新增接口/DDL，也没有业务代码发布。

## 2026-10-09 对话协作、候选来源、谱系与可比趋势

**Why:** 用户要求当前阶段聚焦整体交互，明确从零开始、与 Agent 对话生成 Case/Judge/候选、谱系和趋势变化均不能遗漏。助手若单独成为聊天页，生成内容和后续评测仍会割裂；由共同基线或对话顺序推断来源，又会制造错误谱系。

**How to apply:**

- 对话是各对象页的就地协作入口：空业务准备整套资产，用例/指标页生成草案，结果/任务页生成候选。先审阅可编辑内容，再显式保存共享资产或候选。手工新建和导入保持并列，Case/通用方法/业务指标不依赖 Work。
- 历史对话恢复对应任务类型；切换协作任务开启新对话。采用后不覆盖既有资产版本；保存位置切回当前 Benchmark 时必须恢复入口对象 ID，不能沿用此前选过的其它对象。
- 每次候选验证固定所选基线的题集与评分版本，并独立保存 baselineRunId。从较早候选继续修订时显式传 parentCandidateId，不能把同一对话最新候选当作来源。
- 谱系用于打开实际对象、源对话、证据与版本；边必须来自明确的来源引用。共享基线不代表某任务生成了该候选。当前原型按所选记录展示一条关联链，不宣称全局网络布局已完成。
- 趋势除完整执行、Benchmark/指标版本与 Agent/Skill 范围一致外，还要区分有效评分题目集合；覆盖数量相同但缺失题不同，也不能连成同口径趋势。规则/题集变动可并列结果但不计算收益，人工复核不静默改原始趋势。
- 可变实现与实际覆盖继续回到 [V7 体验方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/experience-plan-v7.md)、[验收记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-v7/acceptance.md) 和 [增量 harden](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-v7/harden-review.md)。对话、生成和候选验证为明确模拟，未接真实模型/Agent/Judge；没有接口或数据库改动。


## 2026-10-09 布局连续性与背景动效偏好

**Why:** 用户进一步关注整个页面是否顺畅，并明确喜欢 [VidMuse 波纹背景参考](https://vidmuse-record-waves.katliyue.chatgpt.site/)。功能路径可执行不等于高频操作连贯；独立评审与浏览器检查发现趋势返回口径丢失、谱系来源返回与滚动起点问题，以及助手审阅叠层和首屏信息权重问题。

**How to apply:**

- 当前证据与具体调整回到 [布局、连续操作与动效方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-v7/motion-layout-review.md)。该文为审查和提案，不能标成已经实施；真实模型等待、多人并发和帧率尚未验收。
- 先验证对象跳转、返回、筛选/口径/所选节点及滚动锚点的连续性，再叠加动效。助手与长草案应保持来源和审阅上下文；谱系详情应与所选节点同屏。
- 参考背景采用缓慢扩散与空间层次；设计提案将其限制在空状态和助手局部，Maxwell 暖色及稳定的数据阅读表面继续保留。持续背景提供暂停和减少动态支持；具体风格与参数仍需在新原型验收，用户喜欢参考不代表已批准换成黑色视觉系统。
- 以现有 Maxwell motion tokens 统一反馈，并测试快速中断、回焦和历史消息不抢滚动。不要把背景运动、自动递增进度或装饰连线当作真实执行/提升证据。


## 2026-10-09 完整产品组织、通用对象与 A2A 职责对齐

**Why:** 用户明确被测对象还可以是外部 HTTP 系统，要求保留原有「评测与调优」整体产品；同时强调 Benchmark 是核心能力，不能每次纠正一个入口便遗漏此前的资产、对话、版本、复核、趋势、谱系和动效。

**How to apply:**

- 后续从 [完整产品体验与业务接入路径](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/business-journeys.md) 和 [交互增量验收](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-v7/interaction-refinement-acceptance.md) 进入。这两份文件集中记录整体职责、路径、分支、设计系统、源码/PDF依据、当前模拟能力与真实接入缺口；旧文档和截图保留历史，不逐条拼成当前完成结论。
- Benchmark 组织可复用的版本化标准；评测产生冻结执行与评分事实；调优组织目标、候选和验证。被测对象、调优 Agent、执行 Agent/适配器职责不同，Case/Judge 仍是业务共享资产。维护全局目录与 Benchmark 内入口的同一对象关系，不复制另一套结果或任务。
- 被测对象包括 Maxwell 预设、A2A 服务和 HTTP 系统，Skill 选填。是否能应用候选由真实能力与本次回执决定，不能由 A2A/HTTP 协议名称推断。当前实现核对回到 [Executor Kit](/Users/leslie/Downloads/sandai-code/maxwell-ai/services/evolve-server/docs/executor-kit/README.md)、[对象入驻设计](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-executor-onboarding-design.md) 和体验方案内源码指针；较早 A2A 文档中的类型数量和 probe 门槛不是当前事实。
- 用户要求有动效但不必复制参考网站。以连续操作与稳定阅读为先：紧凑工作区、对话/审阅同屏、谱系详情同屏，持续动效仅在空状态局部、可暂停并尊重 reduced-motion。
- 任务/运行/Benchmark 对话应按实际来源隔离；无基线候选不能默认关联第一套 Benchmark。保护未保存编辑时不能覆盖历史条目，浏览器 Forward 回到原页须撤销过期离开回调。修复与定向证据回到验收文件，不以此宣称所有浏览器分支或多人协作通过。
- PDF 原临时文件在本次工作中已失效，使用前次审查保留的逐页文本及截图，留存位置与范围见体验方案。独立评分、冻结版本、多维指标、预算和候选应用证据用于约束设计；发布回滚按用户决定后置。原型模拟通过不代表 Nextplay 原 Judge、VidMuse 媒体证据或真实候选应用已经接通。


## 2026-10-10 全链路复审与通用性约束

**Why:** 用户要求从负责人/调优人员实际走完从零、既有资产、复核与候选，并再次明确不能为 Nextplay 改写通用平台。候选验证影响普通评测默认版本、仅保存原文却未明确评分绑定、导入成功没有后续入口都会误导用户判断是否已完成。

**How to apply:**

- 完整职责、原型联包格式与真实后端契约的区别、当前源码问题和待确认实施范围见 [2026-10-10 复审](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-v7/workflow-backend-review-20261010.md)。会变化的代码和运行结论以该证据及当前源码为准。
- 通用规则是可选的 Case→业务规则→输出指标关联，不是 Nextplay 专属 evaluation.profile/rules 字段。源 YAML、目录与多轮流程由业务适配器处理；独立导入、生成和混合复用平等保留。
- 查候选到对象版本默认值的副作用；临时验证版本不能变成下次普通评测的默认对象。Skill 也不能因为接入登记而自动成为评测范围。
- 评分的 not_applicable、未采集、原始值和人工复核分开；复核反馈与人工有效结论投影不能混称已有能力。完整原评分保留需验证数值、缺失和聚合责任，不以导入成功代替。
- 本轮验收、独立 A/B 评审及明确未覆盖分支见 [验收记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-prototype-20261009/design-v7/workflow-acceptance-20261010.md)。只有前端模拟与源码核验，没有真实 Judge/候选应用或后端契约变更。


## 2026-10-10 原型确认后进入正式实施评审

**Why:** 用户确认原型、要求从最新 main 开分支实施并增加 YAML 导入；同时要求说明旧接口调整、DDL、性能与通用性。产品确认不替代仓库要求的精确接口/迁移确认；用户对第一批清单的追问不能当作批准。

**How to apply:** 以[正式实施设计与修订清单](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md)为入口，核对其中当前进度与批准状态。新旧入口应复用领域命令与可见性逻辑；Case/Judge 共享不意味着候选、运行和证据失去 Work 授权。修改 Artifact 来源可空时必须检查已有 membership 触发器；不能仅修改列。业务目录需要数据库筛选、可见性在分页前处理、轻量投影和固定查询次数；导入应按本批来源键查最新修订，不能把 Work 历史扫描扩大到全业务。真实查询计划与性能结果单独验收，静态发现不等于已测延迟。YAML 通过前端序列化适配进入既有 JSON 契约，不为格式单独增加业务 API；业务字段适配与原 Judge 等价运行仍是不同能力。


## 2026-10-10 实施授权与 EVOLVE 域边界

**Why:** 用户明确批准按修订方案完整实施，同时要求只改造 EVOLVE 域、旧接口兼容、查询性能与通用性；迁移只写文件，不执行。此前待确认记录是当时状态，不能继续用来阻止已经批准的第一批工作，也不能把整体目标当作未列明契约/DDL 的无限授权。

**How to apply:** 先核对[实施设计](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md)中的域边界、批准清单、补项和当前证据。前端在 EVOLVE 页面/业务组件及专用生成客户端内实现；后端在 evolve-server 内实现；需要导航时复用共享路由已提供的入口，不静默修改 Maxwell 公共组件、Agent Runtime 或通用鉴权。基于最新代码逐条核查，不用原型模拟结果替代正式验证。

- 业务级目录不等于 Agent 会话有权跨 Work；在新 HTTP 目录保留受信会话绑定，再做业务/hidden 过滤和分页。
- 列表、定义与正文读取分开：元数据页不逐行拉证据，不为显示来源名称加载全部任务；选择记录/用例后才读取正文。取最新 Benchmark 定义不能把历史成绩一起读回后丢弃。
- 内容参与 hash 不代表已经持久化；检查 memory 与 Postgres 字段往返的一致性。来源依据字段补项与极长 Unicode 来源索引的风险见实施设计的补充确认节，不能重算旧 hash 或静默截断来掩盖问题。
- 浏览器技术替身、内存 HTTP 回归、Postgres 真实计划和 Agent 自然场景分别记录。迁移未执行时，静态 SQL 检查与绿色单测不能被描述为数据库上线或性能验收已完成。


## 2026-10-10 用例维护与异步编辑验收

**Why:** 纯 Store 测试不能发现 render prop 中 MobX 读取未被响应式跟踪造成的受控表单显示落后；关闭确认若复用第二次关闭事件，会让再次 Escape 绕过用户明确放弃。文件读取中导航离开还可能留下永久 reading 锁。

**How to apply:** 回到 [实施设计第 7.2 节](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md) 核对当前正式实现与验收边界。编辑器回调视图需在自己的 Observer 内读取状态；关闭、遮罩和 Escape 使用同一未保存保护，只有明确放弃按钮丢弃内容；异步读取离开页面须失效迟到结果并释放锁。保存失败按原请求身份重试，退出登录使未完成响应失效。CSV input 文本与 inputJson 结构化输入分开，防止前导零和数字含义被自动推断改变。浏览器替身验收只能证明交互与客户端行为，不能代替真实数据库持久化、评分等价性或完整 Agent 链路。


## 2026-10-10 共享标准与 Benchmark 原子修订

**Why:** 共享标准需要从人工采用、目录和版本管理一直贯穿 Run 准入、事务入队与实际判卷；只让 Artifact.WorkID 可空会留下“能创建、不能运行”的断点。旧按名称+组合去重的 Benchmark 唯一键还可能把更新回放到其它身份，或吞掉仅修改适用范围的操作。

**How to apply:** 先核对[实施设计第 7.3、7.4 节及第 8 节补充确认单](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md)的当前批准和实现状态。修订应以明确身份和 expectedVersion 原子追加；Postgres 新旧写入口共享锁序，锁后以 READ COMMITTED 重读，精确重试定位 expectedVersion+1，不能全量读历史。名称去重的存储限制应明确返回冲突，不能伪装为已保存；修改唯一键仍需要精确 DDL 确认。按代码中的实际调用路径核对准入、仓储、worker 判卷及详情的 Case.WorkID 限制，候选和执行证据继续保留 Work 隔离。共享引用批量 SQL 的 jsonb_to_recordset 字段名必须与 Go JSON tag 一致，特别是带引号的 contentHash；SQL 字符串单测不证明数据库实际执行。当前数据库迁移、回填与查询计划仍未执行，不把内存 HTTP 或 race 测试当作数据库验收。


## 2026-10-10 共享标准采用与评测权限闭环

**Why:** 将 Case.WorkID 改成可空后，权限不能简单删除 Work 判断。执行阶段必须采用冻结标准，结果读取依赖已授权 Run/Trial 的精确引用；共享标准的祖先可见性与祖先在当前 Work 的直接访问是不同问题。若遍历缓存忽略 Work 范围，还可能把共享路径的可见结果错误复用于私有路径。

**How to apply:** 从[实施设计第 7.4 节](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md)核对当前链路与技术验收。标准采用应与 Run 图创建同事务提交，重试先判断已有 Run，来源不改写；Case 正文按小批精确 ID 读取而非逐题 SQL 或全量保留。Worker 仍核对冻结 hash，详情/反馈/比较从已授权 Trial 读取，旧 Work Case 接口保持原边界。成对比较必须命中两边 Run 的 Trial，不能凭 EvidenceSet 中的 Case ID 取任意正文。共享标准祖先仍做业务/hash/hidden 检查但不自动添加任务关联，遍历缓存区分范围；取消/停止依据实际 Trial 覆盖的 Case 检查隐藏权限。内存仓库与本地对象存储闭环、SQL 结构测试和 race 结果不替代真实数据库计划、候选应用或自然 Agent 场景；公共标准管理入口与存储补项的批准状态另查实施设计。


## 2026-10-10 候选验证上下文与比较开销

**Why:** 候选的历史决策与后来验证记录不是同一结论；切换候选或 Run 时复用上一份分数会造成错误归因。旧页面为显示评分质量自动调用比较接口，而该接口默认可以触发模型成对判卷，仅打开页面便产生外部调用。

**How to apply:** 从[实施设计第 7.5 节](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md)核对正式组件与浏览器替身证据。以明确候选、精确 Variant ID/hash、Run 和基线恢复上下文；旧决策单列，未选基线不推断收益。逐题详情返回须保留所选 Run、基线和目录筛选，加载/失败不沿用旧分数。普通浏览只读已冻结 Scorecard；LLM 比较必须由明确操作触发。成对比较先限定双方授权 Trial 交集及上限，再按小批读取 Case 正文并复用完整上下文；不要因复用缓存留下 nil Case，或先读取所有输出再截断。浏览器 mock 与技术测试不证明真实 Agent 或数据库链路。

## 2026-10-10 共享标准补项获批与元数据仓储

**Why:** 用户明确批准实施设计第 8 节和第 6.1 节，但继续限定 EVOLVE 域及迁移文件权限。名称/组合不能充当通用 Benchmark 的身份；Case 内容参与 hash 的来源依据也必须在真实仓储往返。

**How to apply:** 以[实施设计第 7.6、8 节](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md)核对当前进度和迁移边界。新建用请求身份保证重试，修订用明确对象和 expectedVersion；同名独立资产、恢复旧组合与历史结果各自保留。共享标准仅存身份/修订元数据并引用 Artifact，CaseSet 用精确成员索引做权限和有界查询；不要复制正文或引入每题 SQL。缺失成员/祖先索引不得默认为可见；新管理接口、旧冻结读取与历史回填需要一起验收。Case basis 缺失不能靠重算历史 hash 修复。迁移尚未执行，SQL 替身的固定查询次数与静态约束检查仍不是实际数据库计划或性能证据；第 6.2 节长 Unicode 索引补项另行确认。


## 2026-10-10 共享标准交互与最小前置条件

**Why:** 用户再次要求通用平台避免过多门禁。资产维护与实际执行就绪是不同职责；强制先建 Work、先接入对象、先预检，或禁止从历史版本继续修订，会制造无必要的使用顺序。共享标准只有目录读写也不够，生成结果采用与 Benchmark 选择必须能衔接。

**How to apply:** 从[实施设计第 7.7 节](/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/evolve-workspace-implementation.md)核对当前代码和证据。预检保持可选，保存自己检查结构与引用；方法专属配置原样保留，环境就绪在执行时判定。采用冻结产物保留精确 ID/hash，编辑正文则生成新定义并保留来源；草稿跨页面恢复，返回保留业务和来源上下文。历史内容可以作为新修订基础，expectedRevision 取当前头来保护并发，不用名称合并身份。版本对比仅按需取上一正文；目录不预读全部正文或任务。趋势必须保留后端被测版本分段，Benchmark 来源 Work 不能充当每条 Run 的归属。维护工具默认只读、索引与目录分阶段、按业务和 ID 有界推进，当前执行边界见[维护说明](/Users/leslie/Downloads/sandai-code/maxwell-ai/services/evolve-server/docs/standard-maintenance.md)。数据库迁移与回填未执行；浏览器内存替身、HTTP 内存测试、构建通过不能证明真实评分、数据库性能或完整候选闭环。
