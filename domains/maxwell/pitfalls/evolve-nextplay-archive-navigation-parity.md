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
