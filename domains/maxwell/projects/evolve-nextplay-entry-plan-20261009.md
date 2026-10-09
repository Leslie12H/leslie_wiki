---
name: evolve-nextplay-entry-plan-20261009
type: project
created: 2026-10-09
updated: 2026-10-09
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
