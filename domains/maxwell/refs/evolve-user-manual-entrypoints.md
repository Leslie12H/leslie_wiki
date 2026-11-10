---
name: evolve-user-manual-entrypoints
type: reference
created: 2026-11-09
updated: 2026-11-10
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
