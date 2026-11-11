---
name: evolve-user-manual-entrypoints
type: reference
created: 2026-11-09
updated: 2026-11-11
tags: [maxwell, evolve, user-guide, benchmark, a2a]
links: [evolve-benchmark-unified-plan-review, evolve-preset-evaluation-entry, evolve-trial-review-boundaries]
---

# EVOLVE 使用手册与环境查证入口

**Why:** 第一次使用、线上问题诊断和已有基线的候选验证是不同入口。还需区分用例资产、执行连接、实际运行配置、评分来源和业务发布。连接成功不能证明执行、判卷或候选应用完成；源码有入口也不等于目标环境已发布。

**How to apply:** 用户操作手册在 Maxwell 工作区 `docs/evolve-user-manual.md`（2026-11-09 初稿；是否已进入业务仓库主线须核对 Git）。按「接入 → Case → 评分 → Benchmark → 运行 → 候选验证」查页面，只有原会话时先走诊断入口。具体按钮与能力回查实际版本的 `EvolveNavigation.tsx`、`BenchmarkDetailPage.tsx`、`RecordsPage.tsx`、`RuntimeTuningPage.tsx`；开发者按 [Executor Kit](https://github.com/world-sim-dev/maxwell-ai/tree/main/services/evolve-server/docs/executor-kit) 与 [原生指标评分服务](https://github.com/world-sim-dev/maxwell-ai/blob/main/services/evolve-server/docs/native-grading-provider.md) 回查执行与评分两个契约。

核对线上版本：读取对应环境的 Studio HTML，比较其中 `cicd-<run_id>-<attempt>` 的静态构建路径，再按 Actions 的实际作业核对 Web、EVOLVE、Agent API、Worker 是否分别发布。入口域名或发布标题不足以区分环境与服务。2026-11-09 取证入口：[日常 Studio](https://agent.sandaii.cn/evolve)、[DEV HTML](https://static.sandcdn.com/deploy/maxwell/dev/studio/index.html) 和 [DEV 回执](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42591994053)；另比对 [生产 HTML](https://static.sandcdn.com/deploy/maxwell/prod/studio/index.html)、[生产 Web 回执](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42182539731)、[生产 EVOLVE 回执](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42171569360)。此为只读查证，不能替代当前部署或业务实跑。

## 2026-11-10 Case 导入和评分从零到一

**Why:** 手工表单最小输入、导入协议和评测准备是三个条件。Case 可以先保存，正式运行仍需匹配执行器的输入和可出分的评估器。独立指标描述值的口径，评估器的输出绑定提供实际计算方式。

**How to apply:** 以 Maxwell `f146431129a5f6907044a03e475349b3da08720a` 为查证锚点。用户可把统一导入包交给外部 Agent 生成，页面文件和 HTTP 包装分别沿 `caseImportSource.ts`、`CaseImportStore.ts` 和 OpenAPI 的 `SharedCaseImportRequest` 核对。核对共享目录的预检、确认写入权限、来源键和冲突规则，另读 `case_catalog.go` 和 `toolcaller_benchmark.go` 区分 Studio 人类身份与 Work 内 Agent 工具。评分沿 `EvaluatorEditor.tsx`、`EvaluatorSamplePreview.tsx`、`plan_processor.go` 和 `CaseMetricAssociations.tsx` 查试评材料、原子保存、正式参考答案来源及 Benchmark 采用关系。手册中的 YAML 由该提交的实际解析器读取验证，评分示例为步骤说明。

## 2026-11-10 表单完整样例与计算方法的配置位置

**Why:** Case 的上下文和准备数据需要执行器明确消费；给评分看的参考答案来自冻结 Case。模板、评估器输出类型与目录里的计算方法是不同维度。

**How to apply:** 完整退款题和三类型指标示例回查 Maxwell 手册。当前主线的 `CaseEditorDialog.tsx` 对应表单，`execution/contract.go` 及各执行器输入解析区分输入、上下文和准备数据；正式参考答案沿 `evaluation/plan_processor.go` 查。模板沿 `evaluatorTemplates.ts` 和 `evaluatorEditing.ts` 核对默认材料与输出，方法的实际配置入口沿 `MethodsDirectory.tsx` 检查。旧版确定性断言的 JSON 路径针对实际输出根，另查 `evaluation/judge_dispatch.go` 和 `methods/judge/caseaware.go`；证据取值按它自身的材料路径。手册样例通过导入解析，三项评分预期用于人工对照。

## 2026-11-10 按方法配置可验收指标

**Why:** 同一业务诉求可拆为答复表述、真实执行顺序和实际写入事实，三者需要不同证据。单次业务查询耗时的判断和 Benchmark 端到端耗时门槛也有不同分母。

**How to apply:** 七个完整配置入口见 Maxwell 手册的「每种方法配一个可用指标」。以同日主线锚点回查 `NativeJudgeEditor.tsx`、`RubricJudgeEditor.tsx` 与 `BuiltinMetricRows.tsx`。`methods/measurement/evidence.go` 按指标键匹配 selector，数值路径缺失保留 missing；旧版断言路径相对实际输出根。参考答案对比的扣分公式见 `judge/refcompare/refcompare.go`，过程证据与里程碑见 `judge/trajectory/trajectory.go`。本地以手册原件核对证据取值的通过、失败、缺失以及字段断言的 1/0，两个 Judge 现有离线测试通过。外部业务审计与实际线上模型分回到目标环境验证。

## 2026-11-10 评分配置入口与证据字段的可发现性

**Why:** 旧版标签是 Studio 的评分资产入口，方法本身仍按冻结版本执行。逐题页面的展示对象和评分方法收到的材料不同，样例字段不能被当作平台默认产出。

**How to apply:** 按 Maxwell 手册「为什么有旧版评分配置」和「到哪里找证据字段」定位。沿 `supportsEvaluatorEditor`、`MethodsDirectory.tsx`、`StandardsTab.tsx`、`SharedBenchmarkEditorStore.ts` 核对 LLM 编辑入口及从旧评分资产发起 Benchmark 的方式。沿 `queries/evidence.go`、`attempt_evidence.go`、`TrialDetailPanel.tsx` 和 `evidenceReading.ts` 区分逐题输出投影、原件和格式化显示。自定义 `metrics` 由执行器上报，详情投影不单列；核对归档回执或执行器输出契约。比对 `evaluation/judge_dispatch.go`、`native_processor.go` 与 `plan_processor.go` 确定 JSON Pointer 的根。平台 `runtimeMetrics` 与业务自定义 `metrics` 分开核对。核对锚点沿上方 2026-11-10 主线记录。

## 2026-11-10 从冻结试次发现评分字段

**Why:** 逐题详情的输出预览可能截断，也不单列执行器自定义指标。配置时应按实际冻结材料确认字段。单条试次说明该次有上报，覆盖率、业务含义和单位还需要确认。

**How to apply:** Maxwell `evolve-evidence-fields` 工作区的 `docs/plans/evolve-scoring-field-discovery-20261110.md` 有操作步骤和接口边界。沿 `queries/scoring_fields.go` 和 `evaluation/evidence_output.go` 查单试次授权、冻结证据与评分路径。Studio 在「读取执行证据」绑定中从评测结果选择字段，在逐题详情按需查看并复制；代码入口为 `ScoringFieldPicker.tsx` 和 `TrialScoringFields.tsx`。自定义指标从执行器上报的 `metrics` 取值，平台运行指标、Case 参考答案和附件仍各走既有入口。版本及发布状态分别查业务 Git 和目标部署。

## 2026-11-10 草稿入库与评分依据展示

**Why**

Agent 保存草稿、任务生成正式资产、发布共享评分标准是不同阶段。指标修订描述结果和汇总口径，评估器或 Judge 修订持有实际 Prompt 与规则。零运行时展示已配置的内容有助于首跑准备，逐行放在结果表里容易被误读为已有测量。

**How to apply**

- Case 草稿通过确认与生成正式资产后沿 `commands/freeze_draft.go` 写正式 Case 修订，可从用例库按来源任务查找。任务里的冻结 Judge 可沿 `ArtifactDrawer.tsx` 和 `StandardAdoptionButton.tsx` 另存共享评分标准，再到评分资产的「旧版评分配置」查看。独立指标与评估器各走对应目录。
- 回查 [Maxwell PR #427](https://github.com/world-sim-dev/maxwell-ai/pull/427) 的 Studio 提交 `b2d731f3063b8d5ac8fb2aaa736fcc597e353506`。指标详情沿 `StandardsTab.tsx`、`AssetReferences.tsx` 读取引用该精确修订的评估器或旧版评分配置，展开后按引用修订查询现有详情。逐题绑定仍沿「关联用例」查，具体 Benchmark 以其采用的冻结配置为准。
- Benchmark 的「当前版本指标与趋势」沿 `BenchmarkResultsPanel.tsx` 区分加载、请求失败、过滤为空和完整题集零运行。零运行用 `BenchmarkDetailPage.tsx` 的首跑卡概览业务评分和平台采集，评分配置仍可直接打开。2026-11-10 本地浏览器用样例验证了首跑卡、窄工作区单列、评分配置入口与精确修订 Prompt。
- 会话工作台随同一 PR 提交。沿 `EvolveWorkspace.tsx`、`SessionWorkbench.tsx` 与 `EvolveWorkspaceStore.ts` 核对绑定任务的会话入口、当前版本草稿的人工确认和正式运行确认边界。绑定任务的会话须把 Work 引用传给聊天，否则资料引用入口失去任务范围。合并后的代码通过本地 Studio 检查，目标环境的会话实跑需按部署版本另行核对。

## 2026-11-10 会话分析的执行者与证据范围

**Why:** UI 写「分析 Agent」容易被理解为有一个独立部署的诊断服务。分析会话的创建、来源读取成功、实际诊断质量需要分别确认。运行里记录的错误也不等同于后台服务日志。

**How to apply:** 从 Maxwell 的 `ConversationDiagnosisStore.ts` 追踪新建分析会话、绑定原会话和提交默认消息；从 EVOLVE `agentsessions/service.go` 核对复用的共享调优 Preset。从 `schemas_diagnostics.go` 和 Runtime `application/diagnostics/service.go` 查各类证据与明确不可用项；文件目录的时点另查 `resources.go`。实际结论是否引用运行证据，回看 `docs/acceptance/conversation-diagnosis-20261109.md` 的自然场景与缺口。原能力部署按本页 Web、EVOLVE、API 和 Worker 各自回执核查；入口布局或模拟提交不能替代已部署环境的模型实跑。

## 2026-11-11 任务工作台的就绪详情与评分说明

**Why:** 用户希望任务工作台的就绪项能展开查阅，也明确要求评分标准尚未校准时去掉警告图标。比较口径、评分校准和候选应用回执各有独立依据。任务中的 Variant 既可能是基线，也可能属于候选，不能按资产类型直接把候选版本当作基线展示。

**How to apply:** 沿 Maxwell 的 `LedgerPage.tsx`、`TaskReadiness.tsx` 查冻结引用与原文入口，优先使用任务绑定的用例集和评分标准。基线出处不唯一时保留状态详情，避免猜测原文链接。沿 `LineageNodeDetail.tsx` 查校准说明与实际读取失败、重试入口。逐题对比和报告分别从 `MatrixPage.tsx`、`ReportPage.tsx` 回查，区分各轮评分范围及选中报告的冻结身份。

## 2026-11-11 从任务追踪评测执行和评分

**Why:** Agent 会话和评测 Run 有各自的状态。会话已空闲时，后续评测完成可能只出现在系统时间线上。评测完成也可能全部已评分但无通过或不通过判定。父任务运行列表会返回关联的候选验证 Run，验证产物和统计仍由子任务持有。把子任务产物当作父任务资产读取，会导致 404，并可拖垮整次任务记录加载。

**How to apply:** 先按会话详情和持久消息确认 Agent 是否空闲。计划回执以「加载并验证结果」取得原件，再核对候选引用和是否存在实际 Run。沿任务列表的 `Run.workId` 读取对应统计，分别核对执行、已评分和判不出次数；查看完整运行用评测记录中的精确 Run。前端在 `EvolveWorkspaceStore.ts` 保留父任务可读的运行列表，仅从父任务补齐其自身产物，子任务统计按真实归属读取。进度入口和回看路径沿 `LedgerPage.tsx`、`TaskRunTable.tsx` 和 `RunProgressReading.tsx` 查证。当前状态和部署版本均以对应环境回读为准。

工作台排查补充：顶部「部分内容刷新失败」和候选区「任务内容读取失败」曾消费同一个 Store 错误。遇到同文案时，先按实际构建与请求核对是否是同一次错误。任务页面仅在读取失败的工作区提供重试，并保留已取得的评测及统计。会话头部从 Runtime 检查点区分「等待消息」「Agent 正在处理」「等待你确认」；任务的「进行中」是独立状态。刷新范围与可点击的历史记录沿 `LedgerPage.tsx`、`EvolveAgentConversation.tsx` 和 `TaskRunTable.tsx` 回查。

## 2026-11-11 首次评测与报告下钻的交互查证

**Why:** 连接成功只说明对象可选，首次评测仍取决于该对象、用例与实际评分配置能否连续交接。报告的判定数量属于特定的冻结运行范围。若下钻落到按最近运行默认选中的比较页，即使显示了有效数据，也无法用来解释原报告的数字。

**How to apply:** 首次评测沿 `v3/onboard/OnboardPage.tsx`、`OnboardStatusStore.ts` 核对向导跳转和评分就绪来源，再沿 `executor/ExecutorRegistrationResult.tsx`、`v3/library/ObjectDetailDrawer.tsx`、`BenchmarkDetailPage.tsx` 核对是否能从刚接入的对象直达首跑，并带上对象和当前 Benchmark 版本。报告沿 `typed/ScorecardView.tsx`、`v3/report/ReportPage.tsx`、`v3/matrix/MatrixPage.tsx` 对照点击承诺、选中报告、精确运行引用、判定筛选和返回路径。用早于最近四次运行的一份报告回归，并分别核对原始评分和当前采用的判定范围。发现使用旧版评分资产检查或丢弃筛选时，以当前源码和相同构建的实际页面复核。
