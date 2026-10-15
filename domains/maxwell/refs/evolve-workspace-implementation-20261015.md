---
name: evolve-workspace-implementation-20261015
type: reference
created: 2026-10-15
updated: 2026-10-16
tags: [maxwell, evolve, studio, ui, validation]
links: [evolve-commercial-ui-20261015, evolve-continuous-workspace-layout-20261015]
---

# EVOLVE 连续工作区实装与验证入口

2026-10-15，用户授权按原型的布局在 Maxwell 项目中开始实施，明确要求融合项目 token，不逐像素照抄原型。此前关于暖色、边框与投影的反馈仍有效；实施授权不等于最终视觉认可。

**Why:** 原型只能说明组织方式。落地要让已有 Case、Benchmark、Run、指标修订和候选证据在同一阅读路径中工作，并保持 Maxwell 的表面、文字、控件和阴影层级。

**How to apply:** 从当前代码和下方验收记录核实实现范围；采用同一外层工作面、上方趋势与下方记录、指标分组内比较运行。用冻结身份关联结果，不凭相同名称合并指标或用例。统计未读到不能写成没有运行，缺失值不能补零。任务当前草稿的 Case 清单也不能替代历史 Benchmark 的冻结用例。

## 指针

- 本轮实现与真实浏览器验证：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-layout-implementation-20261015/README.md`。截图、检查命令、受测记录、范围限制和本地服务入口均在该记录；可变状态以现场为准。
- 视觉系统：`apps/studio/src/styles/tokens.css`、`src/components/composite/TableFrame/TableFrame.tsx`、`src/products/evolve/v3/workspace.css`。
- Benchmark 综合趋势与汇总读取：`src/products/evolve/benchmarks/BenchmarkMetricsOverview.tsx`、`BenchmarkOverviewStore.ts`、`benchmarkOverview.ts` 及相邻测试。
- 指标分组与冻结用例回归：`src/products/evolve/v3/matrix/MetricVersionMatrix.tsx`、`matrixMetrics.ts`、`matrixModel.ts` 及相邻测试。
- 对象趋势与记录、任务上下文切换：`src/products/evolve/v3/lineage/EvolutionMetrics.tsx`、`src/products/evolve/v3/ledger/TaskSidePanel.tsx`。

本轮为前端本地实装验证，真实服务数据仅只读浏览；未新建评测、发送 Agent 消息、应用候选或部署。不要把截图中的旧 Run 当成本轮执行结果。

## 2026-10-15 用户否定首版后的纠正

用户明确否定首版实装：保留旧顶部导航、把用例与评分合并、Benchmark 空列表占据整页，都没有实现已讨论的原型。不能将接口接通、检查通过或局部上下排列称为整个布局落地。

**Why:** 借鉴 LangSmith / Opik 的重点是对象归属、持续的页面上下文和汇总到证据的阅读路径。只换外框和 token 会让领域关系继续零散。

**How to apply:** 原型左侧五个一级入口按用户明确顺序保持：接入对象、Benchmarks、调优任务、用例库、评分资产。前三项属工作区，后两项属评测资产。用例库内含用例与用例集，评分资产内含指标、评分标准与评分方法；不能再次合并成用例与评分。Benchmark 内看评测记录、冻结用例、评分标准与版本；调优任务内看基线、候选和验证证据。Maxwell 的颜色和控件 token 与这些信息架构决策分开处理。

- 本次纠正的实现范围、截图、验证和限制：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-layout-correction-20261015/README.md`。以此记录和当前代码核实状态，不将本次截图视为用户最终认可。
- 导航归属入口：`apps/studio/src/products/evolve/v3/EvolveNavigation.tsx`、`routes.ts`、`library/LibraryPage.tsx`。
- Benchmark 冻结内容：`apps/studio/src/products/evolve/benchmarks/BenchmarkContentsStore.ts`、`v3/library/BenchmarkContentsPanel.tsx`。现有契约没有独立产物的反向查找，读取只做有界目录/历史修订解析；无法定位时保留引用并显示不可读，不能用最新修订替换冻结版本。


## 2026-10-15 先推导布局，再制作交互原型

用户进一步明确：需要融合 LangSmith 与 Opik 的优点，而非概念映射或局部补丁；导航也可重新考虑，出发点是所有内容可管理、可修改且路径明确。随后要求先思考，再交付可点击原型。五个入口因此是待验证的导航提案，不是不可调整的约束。

**Why:** 整体性来自同一对象范围下的汇总、选择、记录与证据相互解释。可编辑资产、冻结评测口径、目标版本和结果证据各有生命周期，不能通过平铺菜单或独立卡片代替这些关系。

**How to apply:** 设计依据、官方来源、导航提案、版本关系、原型源码和浏览器验收见[连续工作台原型记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-continuous-prototype-20261015/README.md)。重点核对两条路径：趋势/比较→退步用例→证据→带基线创建调优；资产修订→更新用例集或评分标准→显式更新 Benchmark。颜色和投影直接复用 Maxwell tokens。比较、谱系和评测记录作为工作视图，管理入口提供集合、详情、修订与引用；这是一份待评价提案，不代表业务 UI 已完成。

本次原型使用本地示例数据，可保存资产修订、组合与任务草稿；不会执行真实评测、评分或应用候选。公开产品资料只读研究与本地原型交互验收分别记录，不能互相替代。


## 2026-10-15 原型图表的比例问题

**Why:** 固定 SVG viewBox 配合非等比铺满容器，会把图中的文字和圆点一起拉伸；只在单一窗口检查无法发现超宽屏的失真。

**How to apply:** 图表几何坐标按容器实际尺寸计算，字体、点径和线宽保持 CSS 像素大小；验证正常、窄屏和宽屏下的字体、圆点比例与选择联动。具体实现与测量证据见上述连续工作台原型 README 的“图表比例修复”部分。修复只属于原型，不代表业务图表已经同步修改。


## 2026-10-15 用例集规模化管理原型

**Why:** 将集合成员直接等同于弹窗复选框，无法承载大量用例的检索、跨页选择、修订更新与差异核对；重新从最新资产收集勾选项还可能隐式升级旧成员修订。

**How to apply:** 将用例集管理放入完整连续表格页，区分批量操作的行勾选与集合成员；明示本页选择、全部筛选结果以及筛选外的勾选数量。修订更新必须显式选择，草稿统一核对后保存，历史 Benchmark 快照保持不变。具体原型、300 条模拟用例的浏览器验证、快照隔离测试及服务端能力边界见连续工作台原型 README 的“大规模用例集管理”部分。原型不构成正式服务端分页或批量能力的交付。


## 2026-10-15 导航固定、Agent 融合与详情阅读

用户后续明确现有导航和分类无需再变；这条新约束覆盖前文“导航可重新考虑”的探索阶段描述。接入对象、Benchmarks、调优任务、用例库、评分资产及其现有子分类保持稳定。

**Why:** 调优对话也会产出 Case 和评分标准，但来源不同不代表需要另一套资产分类；被测 Agent 的执行接入和产品提供的调优 Agent 会话也不能混成同一对象。查看评测与用例长内容需要保持列表上下文，居中短弹窗不足以承载持续调查。

**How to apply:** 全局探索、资产协助、任务持续会话作为现有页面的协作入口；打开仅准备输入，任务复用会话。草稿审阅入库后回到原分类，并保留来源、版本和引用；Benchmark 显式采用新版本。被测对象登记执行通道与版本，连接 / 执行 / 应用状态分别验证。目录、选择器和引用表统一考虑搜索、分页、跨页勾选与归档。评测和 Case 的长内容采用右侧详情面板，在同一面板中看逐题结果、输入输出、评分及轨迹，并携带证据进入协作；保存确认仍可用短弹窗。

当前原型代码、现有产品能力源码指针、规模样例与验证记录见[连续工作台原型记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-continuous-prototype-20261015/README.md)的“全域规模检查与 Agent 协作”和“长内容详情抽屉”。公开交互证据以 [LangSmith 比较详情面板](https://docs.langchain.com/langsmith/compare-experiment-results#expand-details-panel) 和 [实验分析](https://docs.langchain.com/langsmith/analyze-an-experiment#view-the-traces) 为指针。原型预置回复、待执行计划和示例评分都不代表真实 Agent 调用、业务 UI 完成或生产执行。


## 2026-10-15 正式前端与已批准接口增量

**Why:** 规模化管理不能把已加载页当完整目录，恢复接口也不能绕过已有数据库触发器；图表、表格和 Agent 产物链接必须携带精确证据身份。相同冻结内容可能对应多个资产修订，不能把内容命中误报为独立的采用修订证明。

**How to apply:** 当前实现、批准的契约/约束计划、测试命令、浏览器截图及未完成的环境验收统一见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/README.md`。先核对本地代理目标，再决定哪些浏览器操作是只读，不能把旧线上后端的返回当成新接口验收。用户授权仅编写恢复约束迁移及测试，不包括 dev/生产执行；真实部署与数据库状态须现场核对。

- 目录与精确选择：`apps/studio/src/products/evolve/library/CatalogSelection.ts`、`CatalogCursor.ts`、`CaseRevisionUpdates.ts` 及相邻测试。检查新修订与采用新修订是不同操作。
- 趋势与证据：`benchmarks/BenchmarkHistoryStore.ts`、`runComparisonModel.ts`、`v3/matrix/matrixMetrics.ts`。历史分页独立于记录表；每页指标退步统计不能冒充全量。
- Agent 事实到产物：`v3/WorkspaceAgent.tsx`、`agentFactNavigation.ts`、`ledger/DraftReviewDrawer.tsx` 与 `drafts/freezeDraft.test.mjs`。单个草稿的确认/保存只作用于明确选中的版本，不顺带冻结其他已确认内容。
- 恢复与引用：`services/evolve-server/internal/app/transport/http/openapi.json`、`internal/modules/evolve/application/ports/asset_directory.go`、`asset_references.go`、`migrations/postgres/0032_evolve_standard_restore.sql`。以实现记录核对状态幂等、内容身份引用、游标变化及 PostgreSQL 验收边界。

截图是正式前端读取已有数据的证据，不是本轮执行了评测、Agent 生成或候选应用的证据，也不等于用户最终认可视觉设计。


## 2026-10-15 编辑状态和规模交互验收

**Why:** 大型组合编辑器的可用性不仅是分页。取消确认或编辑模式切换若卸载组件，会丢失筛选和跨页勾选；嵌套搜索框的 Enter 可能误提交外层表单；只限制单次全选也挡不住跨筛选累加超限。评分标准把每个指标的完整配置都展开，同样无法承载大量指标。

**How to apply:** 明确区分未保存草稿、目录选择、当前编辑对象和整体判定引用；取消继续时保留编辑实例，搜索事件阻止外层提交，所有选择入口统一检查累计去重上限。大量指标使用分页列表与单项配置，移除其他行不能让配置或整题判定串到别的指标。技术规模样例不等同于服务端或 Agent 自然场景验收。

- 逐项审计、浏览器草稿样例、截图和仍未完成范围：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md`。
- 编辑状态与选择边界：`apps/studio/src/products/evolve/dialogs/DialogShell.tsx`、`library/CatalogSelection.ts`、`library/caseSetChanges.ts` 及相邻测试。
- 组合工作面：`apps/studio/src/business-components/evolve/CaseSetComposer.tsx`、`CaseCompositionPreview.tsx`、`NativeJudgeEditor.tsx` 及规模渲染测试。

当前环境与验收结果以记录和现场为准；同会话状态保留不能称为刷新后持久恢复，旧线上代理也不能证明新查询/恢复接口已上线。


## 2026-10-15 接入目录与向导的真实入口

**Why:** 同名页面文件不一定是当前路由的挂载入口；复用已有配置编辑器也必须提供可发现的详情入口。目录到历史、任务与运行再返回，应保留最初的筛选上下文。方法可用、资产存在、连接通过、实际执行与候选应用属于不同证据，读取失败不能冒充空目录。

**How to apply:** 先沿实际路由确认组件，再统一目录搜索/分页、详情编辑和返回上下文。向导按真实资产分别读取存在状态，区分使用中/不存在/读取失败；配置只读投影不含地址和凭据时，不能伪造原值。既有组件的 embedded 变体还要检查外层容器是否仍残留独立卡片阴影。

- 正式对象目录、配置抽屉与返回状态：`apps/studio/src/products/evolve/v3/library/ObjectsDirectory.tsx`、`ObjectDetailDrawer.tsx`、`objectDirectoryModel.ts`、`v3/lineage/historyNavigation.ts`。
- 真实资产向导与失败/竞态测试：`apps/studio/src/products/evolve/v3/onboard/OnboardStatusStore.ts`、`OnboardStatusStore.test.mjs`、`OnboardPage.tsx`。
- 浏览器只读/未保存草稿证据、当前测试结果及未完成的新建接入与 Agent 执行范围，见上述 `output/evolve-frontend-implementation-20261015/interaction-audit.md` 的“接入对象与向导检查”。不要把目录和配置入口的验证写成已经登记、保存、预检或运行。


## 2026-10-15 接入草稿与方法版本衔接

**Why:** 接入类型共用隐藏字段会把地址、凭据或执行限制提交到另一种协议；登记已经被接受后，检查超时不能再次创建对象。评分领域的方法也不全是逐题评分器，校准、对比和锚点改进不能仅因 domain 相同就成为评分标准。目录摘要、精确方法详情和当前服务登记的版本/协议可能不同，不能相互替代。

**How to apply:** 每类接入分别持有草稿，提交只取当前类型字段；凭据离开即清除，接受回执与检查状态分开。读取方法采用已生成契约的精确版本选择，并核对返回身份、可用性与能力；只在服务方法 ID 和版本一致时使用服务的协议声明。跨服务读取采用请求序号隔离，跨页返回保留原筛选和选择。

- 接入状态与规模/竞态测试：`apps/studio/src/products/evolve/executor/ExecutorRegistrationStore.ts`、`executorRegistrationSession.ts`、`ExecutorRegistrationStore.test.mjs`。
- 方法目录、精确版本与标准草稿：`apps/studio/src/products/evolve/v3/library/MethodsDirectory.tsx`、`MethodDirectoryStore.ts` 及相邻测试；来源返回见 `library/standardNavigation.ts`。
- 服务读取竞态：`apps/studio/src/products/evolve/v3/onboard/JudgeProviderStore.ts`、`judgeProviderFlow.test.mjs`。
- 浏览器只读/未保存证据、旧校准页未过滤标准引用的已知问题及剩余真实闭环范围，见前述 `interaction-audit.md` 的“接入草稿与方法目录”。内存草稿恢复不等于刷新持久化，技术注入的登记/轮询结果不等于真实接入成功。


## 2026-10-16 校准精确归属与评分维度工作面

**Why:** 方法不是标准修订，按方法入口汇总所有任务报告会造成跨标准混流。报告目录只读到部分任务或反馈过滤后的某页为空，也不能证明没有记录。旧式 rubric 把每个维度完整展开，在规模增加后会失去当前编辑对象和批量操作范围。

**How to apply:** 从标准具体修订携带冻结 ID/内容哈希进入校准页，核对报告正文身份，反馈查询使用运行时冻结标准。显示任务/产物读取范围，错误与空结果分开，跳转证据后保留反馈页和外层标准修订。大型定义以分页列表和单项配置呈现，翻页不截断完整定义，未编辑的权重、关键项、方法分组及评审配置保留。

- 归属、分页和异常读取：`apps/studio/src/products/evolve/v3/library/CalibrationStore.ts`、`CalibrationPage.tsx`、`CalibrationStore.test.mjs`。
- 反馈到 Run 和返回：`apps/studio/src/products/evolve/library/standardNavigation.ts` 及测试、`v3/catalog/RecordsPage.tsx`。
- 评分维度编辑与规模验证：`apps/studio/src/business-components/evolve/RubricJudgeEditor.tsx`、`RubricJudgeEditor.test.mjs`；共享编辑外壳继续保留取消和模式切换状态。
- 只读校准页、未保存草稿的跨页操作、完整定义回读、窄屏截图、检查结果及剩余范围，见上述 `output/evolve-frontend-implementation-20261015/interaction-audit.md` 的对应日期记录。空校准页和注入测试不能代替真实校准执行或 Agent 自然场景，实际迁移/部署授权边界未改变。
