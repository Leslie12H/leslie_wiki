---
name: evolve-nextplay-archive-navigation-parity
type: pitfall
created: 2026-10-18
updated: 2026-10-19
tags: [maxwell, evolve, nextplay, evidence, judge, parity]
links: [evolve-native-routing-vs-candidate-runner, nextplay-independent-benchmark-entry]
---

# 原评分已产出不代表原 Judge 取证完整

**Why:** 原事件已保存、文件哈希正确、测量状态为 measured，只能分别证明保存与评分产出，不能证明 Judge 导航到了执行证据。EVOLVE native Adapter 从 Runtime API 采集的归档采用 `runtime/<turn>/`；Nextplay 原 Runner 还保留独立 `persisted/` 扫描。仅索引后者会让 native 路径的消息和工具目录为空，即使原件实际存在。自动用户应答的提示词、公开上下文或实际回复记录漂移，也会破坏执行可比性。

**How to apply:**

- 对照权威 Nextplay `maxwell-runtime/src/nextplay_runtime/{executor,reply}.py`，检查输入恢复、AskUser、可选目标续行及默认停止条件。不要为提高分数自动打开原 Case 未声明的续行，也不向模拟用户注入隐藏评分规则。
- 追踪 `eval-runner/src/nextplay_eval/evaluation/judge_bundle.py` 的实际 `trace/index.json`，核对调用参数、返回正文、用户消息和真实终态。检查 `resultRef`、哈希、大小和中断恢复；缺失证据按 partial/unavailable 保留。
- 原评分转换复用 `maxwell_events.validate_tools`；按文件读取引用正文，不把整个归档加载进内存。优先使用原 Runner 独立 persisted 扫描，native 路径 fallback 到已有 runtime API 原事件，避免两份副本重复计数。
- 验证分开记录：冻结输入/规则相同、模拟用户请求相同、原 Judge 文件导航完整、真实评分完成、业务交付正确。前几项技术测试通过不能代替真实模型验收。

## 2026-10-18 修复与证据入口

审查报告及两仓库改动、回归、发布边界见 `/Users/leslie/Downloads/sandai-code/maxwell-ai/docs/verification/2026-10-18-nextplay-execution-parity.md`；逐题原件回放与冻结规则核验见同仓库 `output/evolve-execution-parity-20261018/`。原件位于 `output/evolve-two-round-acceptance-20261017/`，不要改写旧分数。

Nextplay 修复工作树为 `/Users/leslie/.codex/worktrees/nextplay-evidence-parity/nextplay-eval`，原 Judge 导航转换与回归在 `evaluation/archived_maxwell_events.py`、`tests/test_archived_maxwell_events.py` 及 `eval-service/tests/test_grading_evidence.py`。Maxwell 交叉校验在 `services/evolve-server/internal/app/integration/maxwellexecutor/reply_test.go` 与 `testdata/verify_nextplay_original.py`。

本次发现推翻了“全部 measured 就足以排除评测链路问题”的推论。新代码的提交、部署、Provider 版本及真实重评状态以报告、Git 和运行回执独立核验，不能由知识库日期推断已经上线。被测 Preset 的媒体阶段限制也须与原题适用性分开核对，见 [执行入口边界](evolve-native-routing-vs-candidate-runner.md)。

## 2026-10-18 发布后原十题复验入口

本次两仓库发布、精确 Provider 版本、十题单轮 Run、冻结输入/规则对照及最终结论统一查 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-parity-release-20261018/report.md`。代码回执为 [Maxwell #363](https://github.com/world-sim-dev/maxwell-ai/pull/363) 与 [Nextplay #23](https://github.com/world-sim-dev/nextplay-eval/pull/23)；动态结果以报告和真实 Run 为准。

**Why:** Provider 的版本绑定属于冻结身份。部署新实现后，直接在旧 Benchmark 上运行可能与已冻结服务版本不符；更新绑定也不能顺便改输入、续行策略或评分条款。共享 SP 的媒体阶段限制是被测配置的一部分，不能为产生分数临时放开。

**How to apply:** 只更新 method.version，逐字段回读新旧 Case，重新冻结 CaseSet/Benchmark，并核对原 JudgeSpec、runPolicy 和 Nextplay 的原输入及完整 grading_material。对新运行下载的原件执行同一 bundle 转换，与线上每个原 Judge 报告的 bundleHash 比较；这个核验不调用模型、不重评、不改分。媒体题同时查当次 model.request 的阶段边界与真实产物，不能仅凭 mutable Preset 当前内容或质量通过率宣称已生成媒体。

输入包和原 Judge 策略哈希匹配，证明的是接入一致性，不能代替原判对当前业务阶段的适用性。若原判将“仅交付文字”归因为 Agent 自行缩小任务，应对照当次 model.request 和配置原件复核实际 SP 限制，将原分、限制归因与真实媒体交付分开记录；保留原判，不以删题、改分或放宽阈值消除冲突。动态实例和逐项原件仍查上述复验报告。


## 2026-10-18 停止条件和冻结输入展示

**Why:** `continuation.mode=llm` 的 maxReplies 约束 AskUser 应答次数，不等于普通回复后自动继续相同轮数。原 Runner 在 COMPLETED 且未配置 goal 时结束；SP 的“真实用户另行改变阶段”也不能由模拟用户根据低分自行补造授权。另一个独立展示陷阱是 Trial 的精简 Case 引用不含完整 input；已读取完整冻结 Case 却继续渲染精简引用，会误报“未填写”。

**How to apply:** 比较同一 Case 的冻结 continuation、当次 SP、真实 AskUser/终态和原 `maxwell-runtime/src/nextplay_runtime/executor.py`，再判断是漏回复还是按约结束。若验收完整媒体制作，将真实阶段授权与 goal 续行作为新的冻结版本，原 Runner/EVOLVE 同配，保持原规则，不能覆盖旧结果。Trial 详情优先显示 caseRef 对应的完整冻结 input/context/fixtures，读取中保留加载状态，并校验身份避免切题串值。展示修复见 [Maxwell #364](https://github.com/world-sim-dev/maxwell-ai/pull/364)，代码入口为 `apps/studio/src/products/evolve/v3/matrix/TrialDetailPanel.tsx`；发布和同一 Trial 的页面回读仍查上述复验报告。


## 2026-10-18 相同回复上下文仍不代表相同实验条件

**Why:** 自动回复的指令与公开上下文一致，不等于模拟用户的模型及采样请求一致。部署提交中的 EVOLVE native Adapter 从当前 Preset 取模型来生成回复，并设置输出预算；原生 `LLMReplyModel.from_model` 接受独立 REPLY_MODEL，显式请求 temperature=0。文档建议的默认模型不能当作某次运行的实际值；同一执行重建的 Judge bundleHash 匹配，也不能证明另一条 CLI 执行与之等价。

**How to apply:** 分开核对执行 Agent、模拟用户、Judge 三种角色的实际模型与参数，并定位真实发生 AskUser 的题目；无 AskUser 的媒体题不能由回复模型差异解释。比较实际 SP、Skill 内容和阶段授权，再比轨迹与关键条款。原生 direct 模式虽捕获 Snapshot，随后仍执行源 Preset；不要将有快照自动解释为隔离执行。只拿到单侧原件时，明确记录未确认最新 Run、缺少原生配对记录及不可量化的因果边界。

本次只读分析、实际原件统计、部署提交与代码入口查 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-nextplay-gap-analysis-20261018.md`，逐题证据摘要查同目录 `evolve-nextplay-gap-evidence-20261018.json`。这是单侧诊断指针，不是新的评测、评分或修复发布回执。


## 2026-10-19 原生历史记录逐题配对取证入口

**Why:** 原 Judge 输入/分数转换一致不代表被测 Agent 相同。原生历史十题混合多个 Preset 和 SP/Skills 版本；独立创作 Preset 的文字阶段限制与完整媒体题的交付目标冲突。仅比较名称、终态或总分，容易把阶段授权、模型角色、交互分支、初始状态及评分版本差异误归为工作台执行器故障。

**How to apply:** 从 nextplay-eval 的原生 Runs 追到关联 Batch、Snapshot 和 before/after；独立核对执行 Agent、模拟用户、Judge 三种模型，区分“关联快照”与“实际 model.request 正文”。direct 模式捕获快照后仍运行源 Preset，不能假定隔离执行。Skills 应比对内容与 CLI 文件，不能只看同名。无 AskUser 的媒体任务不能由回复模型差异解释；maxReplies 也不是普通 COMPLETED 后主动续聊预算。历史 run.json 未归档完整 continuation 时保留未知。

本次原生配对报告、逐题模型/配置表、附件哈希与实时 dev 回执统一查 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-native-paired-20261019/report.md`；机读表为同目录 `comparison.json`、`comparison.csv`。原生权威入口为 [Runs](https://j0yswlgboxz.feishu.cn/base/JFF7b76mLa2JqzsH0vzcrMK2nse?table=tblYqwX9WKsqcDfe)、[Snapshots](https://j0yswlgboxz.feishu.cn/base/JFF7b76mLa2JqzsH0vzcrMK2nse?table=tbluNW4ngn4fPMp0)、[Batches](https://j0yswlgboxz.feishu.cn/base/JFF7b76mLa2JqzsH0vzcrMK2nse?table=tblFL6FMRLjOXKwp)。动态 Run 状态和逐题分数只存回执指针，不从本页日期推断当前状态。

已验证的归因边界：原生封面真实出图、工作台已完成轮只交付 prompt，必须结合实际阶段 SP；大纲实际模拟用户选择不同视角/画风，后续需求分叉；修改剧集初始时间线和评分 prompt 版本不同，不能直接比较总分。其余九题有效评分配置在规范化默认字段后相同。原生缺完整评分的主记录与较早有分/补评记录分别列出，不填零、不挑高分。原生旧 Snapshot 存在 ZIP 容器登记哈希不符但逐文件哈希通过的例外；最新请求正文私有 offload 未读取，均保留证据限制。
