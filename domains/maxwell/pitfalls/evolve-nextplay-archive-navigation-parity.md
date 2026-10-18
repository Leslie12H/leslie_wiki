---
name: evolve-nextplay-archive-navigation-parity
type: pitfall
created: 2026-10-18
updated: 2026-10-18
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
