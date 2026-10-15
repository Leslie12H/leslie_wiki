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


## 2026-10-16 目录筛选、个人视图和任务返回

**Why:** 界面中的“搜索全部”必须对应分页前的服务端筛选；旧说明和前端包装可能落后于已有契约。保存视图也必须区分筛选、分页、资产选择与未提交输入，避免跨业务复用或恢复到过期游标。旧路径重定向是返回上下文常见的丢失点。

**How to apply:** 先核对生成客户端再接入查询；筛选变化回到第一页，返回链接携带业务范围与原目录参数。个人视图只持久保存白名单筛选，按账号、业务、目录隔离；存储失败和其他页面已修改不能伪报成功。受控 Popover 的开关回调需要保持稳定，避免输入时重跑聚焦逻辑。

- 查询与返回：`apps/studio/src/products/evolve/api.ts`、`v3/tasks/TasksPage.tsx`、`taskDirectoryNavigation.ts`、`taskDirectory.test.mjs`；旧矩阵/报告/讨论入口保留路由状态。
- 视图与隔离：`apps/studio/src/products/evolve/library/CatalogViewsStore.ts` 及测试、`src/business-components/evolve/CatalogViews.tsx`。持久化只指个人筛选视图，不能称为资产草稿恢复。
- 浏览器任务筛选、视图恢复、键盘输入、窄屏和检查日志：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 对应日期记录。
- Benchmark 目录新增搜索/排序需要独立契约确认，清单在同目录 `benchmark-directory-contract-plan.md`；以会话中的明确答复作为实施授权，不把提交清单当作同意。迁移/部署与 Agent 自然闭环仍需独立验证。


## 2026-10-16 资产草稿刷新恢复与未确认提交

**Why:** 正文恢复不能替代完整编辑会话恢复。历史原件、已知当前修订、冻结引用与写请求身份若在刷新时被重新推导，会造成意外升级、版本冲突误处理或重复保存。浏览器记录失败时仍显示“已保留”，也会让用户在刷新时丢失修改。

**How to apply:** 按账号、业务、编辑器隔离版本化本地检查点，保留未完成输入与原始修订；写请求发出前记录同一次提交身份，未知结果只允许显式重试，不自动提交或取最新替代。保存确认/放弃清理，账号信息延迟到达时重新绑定同一编辑器，同账号 token 轮换不丢稿，退出与账号切换清理。浏览器配额、损坏记录与其他页面变化必须显式说明，不能将内存内容称为已持久化。

- 草稿与账号生命周期：`apps/studio/src/products/evolve/library/LocalDraftRecovery.ts`、`persistentEditorSession.ts` 及相邻测试。
- 业务快照：`CaseEditorStore.ts`、`StandardEditorStore.ts`、`benchmarks/SharedBenchmarkEditorStore.ts`。冻结 Agent 产物保留原 ID/hash 和来源，不重新序列化替代。
- 界面：`src/business-components/evolve/DraftRecoveryNotice.tsx`、三个资产编辑 Dialog 与 `CaseEditorDialog.css`；标题与操作区固定，长内容滚动。
- 2,001 项技术样例、未确认请求重试、真实页面用例/用例集/指标/Benchmark 刷新恢复、桌面/窄屏截图与验证边界，见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 对应日期记录。浏览器本地保留不等于服务端保存或跨设备同步；接入密钥不持久化，临时选择/页码不等于资产内容。实际服务写入、Agent 自然闭环、迁移和部署仍须独立验证。

## 2026-10-16 接入登记草稿与回执恢复

**Why:** 登记响应丢失不代表创建失败，连接检查读取失败也不代表登记失败。自动重发无幂等标识的创建会产生重复对象；旧检查成功不能覆盖正在进行的新检查。独立页面和对话工具卡片共享表单，却需要不同的草稿身份。

**How to apply:** 将未提交内容、待确认请求和已接受对象 ID 分开保留。普通字段按账号/业务/入口隔离，Token 与带鉴权/查询信息的 URL 不落盘；恢复后明确补填，不静默删除参数后使用新地址。未知创建结果先核对目录，已接受 ID 仅通过 GET 恢复最新状态；检查与结束本地进度都是明确动作。恢复的用户编辑优先于 Agent 原建议，状态迟到不能复活已结束流程。

- 状态与字段保留：`apps/studio/src/products/evolve/executor/ExecutorRegistrationStore.ts`、`executorRegistrationSession.ts`；独立入口 `v3/onboard/ConnectPage.tsx` 与对话入口 `ExecutorRegistrationCard.tsx`。
- 结果显示与鉴权：`ExecutorRegistrationForm.tsx`；无需鉴权由用户明确选择，缺失检查结果、检查中与读取失败分别呈现，不能仅按 probe 是否为空显示转圈。
- 行为、账号隔离和回执恢复测试：同目录 `ExecutorRegistrationStore.test.mjs`、`executorRegistrationRecovery.test.mjs` 与 `library/persistentEditorSession.test.mjs`。
- 真实浏览器未提交草稿、桌面/窄屏截图、检查日志及剩余范围：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 对应日期章节。技术注入回执不等于真实登记；本轮没有发送 Agent 消息、执行服务写入、迁移或部署。


## 2026-10-16 直接评测的版本选择与请求恢复

**Why:** Benchmark 最新版会变化，表单打开时的口径必须明确。历史版本读取失败而保留旧选择，不能等同用户同意继续运行旧版；响应未知后换请求编号也可能重复创建评测。浏览器无法保存编号时，应停在发送前，不能声称能够刷新恢复。

**How to apply:** 打开运行设置即固定 Benchmark 版本，先通过现有接口读取能力匹配并核对身份，显式选择能力覆盖。历史配置读取失败要求重试或保留旧选择；保留原请求体与幂等编号，未知结果限制改动、显式重试，已接受回执与实时运行结果分开。按账号/业务/Benchmark 版本隔离，来源与目录返回携带原上下文，窄屏使用同一连续工作面与内部表格滚动。

- 请求、版本选择与恢复：`apps/studio/src/products/evolve/benchmarks/DirectRunStore.ts`、`DirectVersionStore.ts`、`directRunSession.ts` 及相邻测试；账号生命周期见 `library/persistentEditorSession.test.mjs`。
- 正式入口与嵌入布局：`v3/library/BenchmarkDetailPage.tsx`、`DirectBenchmarkRun.tsx`、`v3/ProposalCard.tsx`；记录目录返回见 `v3/catalog/RecordsPage.tsx`。
- 浏览器未提交草稿、刷新和来源返回、桌面/窄屏截图与检查结果：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 对应日期章节。技术注入请求/回执不等于真实执行；任务候选入口、Agent 自然闭环、实际迁移与部署仍须分别验收。


## 2026-10-16 任务版本运行的选择与请求身份

**Why:** 任务选择器不能把第一页当完整目录，加载失败也不能显示为没有任务。任务内候选评测使用所属任务的预算与当前 Benchmark；独立候选验证继承指定基线的口径，两者不能混成一个未经说明的提交动作。响应未知时更换请求编号会产生重复运行风险。

**How to apply:** 用已有目录 API 做分页前搜索与类型筛选，选择完成后收起为摘要，翻页不清除选择。草稿按账号/业务/Benchmark 版本隔离，普通恢复重新预检，未知提交只重试已保存的原请求；存储失败停在发送前。保留任务内运行和独立基线验证的不同归属，跳转后携带原 Benchmark 返回上下文。

- 任务选择、模型、版本与候选状态：`apps/studio/src/products/evolve/benchmarks/TaskBenchmarkRunStore.ts`、`taskBenchmarkRunSession.ts`、`taskBenchmarkRun.test.mjs`。
- 请求身份、预检与回执恢复：`benchmarks/BenchmarkRunStore.ts` 及 `benchmarkRunSelection.test.mjs`；账号生命周期仍在 `library/persistentEditorSession.test.mjs`。
- 连续表单与返回：`v3/library/BenchmarkRunProposal.tsx`、`v3/ledger/LedgerPage.tsx`。真实 API 语义分别查 `services/evolve-server/internal/modules/evolve/application/commands/run.go` 与 `candidate_validation.go`。
- 桌面/窄屏、只读目录搜索、未提交草稿刷新与候选往返、检查结果及剩余验收范围：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 对应日期章节。技术注入回执不是实际新 Run；独立候选验证状态、Agent 自然场景、实际迁移和部署仍须分别核验。


## 2026-10-16 独立候选验证的基线选择与未知请求

**Why:** 大量历史记录需要可核对的列表与固定口径；未知提交后改设置可能重复创建验证。后续一次认证或权限拒绝，也不能反向证明早先未收到响应的请求没有执行。

**How to apply:** 将候选、基线和请求身份分开保留。普通草稿恢复重新核对基线，未确认请求只能显式核对原请求；接受回执按冻结引用验证，实时进度通过评测记录读取。选中基线后收起列表，侧栏记录将时间放在记录编号下方以保留基线关系。

- 状态与校验入口：`apps/studio/src/products/evolve/candidates/CandidateValidationStore.ts`、`validationSession.ts` 和 `candidateValidationFlow.test.mjs`。继承与独立预算的服务语义查 `services/evolve-server/internal/modules/evolve/application/commands/candidate_validation.go`。
- 列表/摘要/执行选项与返回：`candidates/CandidateValidationPanel.tsx`、`v3/catalog/RecordsPage.tsx`；只使用既有分页/状态/精确 ID 读取，不等同于全目录名称搜索。
- 恢复、账号生命周期、浏览器未提交草稿、窄屏截图与剩余范围：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 的对应章节。未知结果测试不等于真实验证执行；调优创建/重评分、长任务头部及自然 Agent 闭环继续按证据分别验收。


## 2026-10-16 任务工作区长内容与滚动边界

**Why:** 旧顶栏的固定高度会在新导航布局下浪费空间；长任务说明与阶段、动作挤在同一行，会压缩主要工作区。左右共用滚动时，长决策内容又会带走候选上下文。

**How to apply:** 以父容器剩余空间组织工作区。任务说明提供有界摘要与完整阅读入口；阶段和页签有固定位置。宽屏候选列表/谱系与详情独立滚动，窄屏恢复单列阅读；协作窄屏在对话/进展之间切换，保留对话实例。验收必须覆盖实际长内容、焦点返回、键盘切换与导航断点，不能只看空页面。

- 布局与上下文入口：`apps/studio/src/products/evolve/v3/TaskPageHeader.tsx`、`TaskPageHeader.css`、`workspace.css`、`ledger/TaskSidePanel.tsx`、`LedgerPage.css`、`LedgerLineage.tsx` / `.css`；公共页签键盘行为在 `components/base/Tabs/Tabs.tsx`。
- 桌面、760px / 600px、抽屉返回焦点、独立滚动、分栏键盘调整和源码检查的证据：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 的对应章节，以及 `task-workspace-layout.png`、`task-candidate-scrolling.png`、`task-workspace-narrow.png`。
- 此处仅证明本轮布局与只读交互。真实 Agent 闭环、运行写入、PostgreSQL 迁移与部署分别验收；完整实施目标仍在进行。


## 2026-10-16 调优创建与重评的请求恢复

**Why:** 内存表单无法在刷新后核对已发送请求；网络断开不能称为未创建，后续一次拒绝也不能反证早先未执行。本地请求编号写入失败仍提交，会使恢复承诺失真。

**How to apply:** 按账号、业务和来源评测保留原请求与输入，未知结果只显式核对同请求，发送前检查本地持久化成功。接受回执验证来源及冻结证据，只持久保留入口，不恢复旧实时状态。大量选择统一累计去重上限，标准/模型先显示选择摘要，调优与重评互斥展开并保留各自草稿。

- 状态与调用：`apps/studio/src/products/evolve/tuning/RunTuningStore.ts`、`reviews/RescoreRunStore.ts`、对应 session/Panel；共用账号生命周期仍在 `library/persistentEditorSession.ts`。
- 拒绝与本地存储边界：`benchmarks/DirectRunStore.ts`、`BenchmarkRunStore.ts`、`SharedBenchmarkEditorStore.ts`、`library/CaseEditorStore.ts`、`StandardEditorStore.ts`；恢复与请求测试见 `reviews/runActionRecovery.test.mjs`、`library/localDraftRecovery.test.mjs` 及相邻测试。
- 真实浏览器草稿恢复、修订/勾选保留、窄屏抽屉、取消返回、截图和完整检查结果：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 对应日期章节。
- 浏览器只读及未提交输入不能替代真实任务创建、重评分或 Agent 自然闭环；未执行迁移和部署。整体实施仍按验收记录逐项推进。


## 2026-10-16 汇总语义与对比证据

**Why:** 未返回汇总不等于零样本，读取失败不等于没有指标；比较口径漏掉聚合策略会把不同规则的评分归入同一趋势。只有图表、表格和证据使用同一基线身份，用户才能持续调查差异。

**How to apply:** 用冻结用例/评分/执行/聚合配置判断观察口径，规范化配置键序；未知、整理、失败与明确判定分别显示。比较图与表按同一 Run 标识联动，逐题结果核对身份并提供局部重试。真实执行报错且没有输出时，只说明已知错误与证据缺失，不推断仍在执行。

- 源码入口：`apps/studio/src/products/evolve/benchmarks/runComparisonModel.ts`、`benchmarkOverview.ts`、`BenchmarkMetricsOverview.tsx`、`RunComparisonWorkspace.tsx`、`../RunComparisonStore.ts` 及相邻测试。
- 证据与后续范围：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 的“汇总语义与对比联动”。真实既有异常记录的浏览器检查、数值组件测试和真实新执行应分别核验；视觉截图不代表已有候选应用或生产部署。


## 2026-10-16 全目录比较与多指标历史

**Why:** 只在单个 Benchmark 内比较会遗漏历史未绑定和跨基准记录。表格分页也不能代表完整时间趋势；不同指标逐 Run 拉取正文会在真实规模下放大请求。比较提示若没有冻结配置可核对，用户无法解释口径差异。

**How to apply:** 将有限数量的比较选择和基线保留在 URL，筛选、详情和返回沿用同一上下文；配置明细仅显示 Run 冻结事实。主时间轴与用户关注的精确指标分别按既有历史接口分页，共用运行坐标，保留单位、缺失、局部失败和读取边界。曲线标签按固定像素绘制，窄屏滚动且固定指标名称，不缩放文字。尺寸观察随实际容器绑定并立即测量；必须验证窄屏恢复桌面后的坐标与渲染宽度一致，单向缩小正常不能证明往返正常。

- 目录比较与上下文：`apps/studio/src/products/evolve/v3/catalog/RecordsPage.tsx`、`benchmarks/RunComparisonSelectionBar.tsx`、`runComparisonSelection.ts`、`RunComparisonContext.tsx` 及相邻测试。
- 多指标历史：`benchmarks/BenchmarkTrendStore.ts`、`BenchmarkHistoryStore.ts`、`BenchmarkMetricsOverview.tsx`、`BenchmarkResultsPanel.tsx` 和 `benchmarkTrend.test.mjs`；以当前实现核对并发、分页及选择上限。
- 真实既有记录的筛选/刷新/抽屉返回、数值历史、窄屏比例与验证范围：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-frontend-implementation-20261015/interaction-audit.md` 的“全目录比较与多指标历史”。浏览器不足一页的数据与技术分页测试分别记录；没有新建评测或生产写入，整体完成状态以最新验收记录为准。
