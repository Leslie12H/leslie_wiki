---
name: nextplay-benchmark-final-plan-20260914
type: project
created: 2026-09-14
updated: 2026-09-14
tags: [maxwell, evolve, nextplay, benchmark, a2a]
links: [evolve-judge-authorization-decoupling]
---

# NextPlay 基准接入最终计划

方案全文：`/private/tmp/nextplay-evolve-final-plan-20260914.md`。状态为计划，未实施新一轮改造。核验 nextplay-eval main 1182275、已上传本地修复 08cd798、Maxwell main e4693dbb；当前版本需从远端重新读取。

**Why:** 已有包装 Preset 就是执行适配层，无需另起 A2A 服务；缺口是轻量 Runner 未复用 Dataset 的状态恢复/续答，以及 EVOLVE 不会自动回读文本中的文件清单。仅上传包不能证明真实初评和可信比较闭环。

**How to apply:** 复用 `eval-runner/execution/maxwell.py` 到共享 maxwell-runtime；新增受控结果文件读取与严格回执绑定。公共 JudgeSpec 加 Case-specific criteria，避免按每条 rule 单独建 JudgeSpec。Benchmark 版本与 Work/目标实验线分离，A/B/C 候选各自绑定基准。转换器保留完整来源与 train/val/test，执行包不带参考答案。按全文六阶段与验收实施。

关键源码指针：`maxwell-runtime/materializer/service.py` 的 copy 策略检查源 Preset recordHash；源漂移不能偷偷换基准。`evolve-server/app/integration/a2a/registry.go` parseParts 只认 Evidence DataPart，否则退回纯文本；`methods/judge/caseaware.go` 支持公共维度合并 Case criteria。路径均需展开为仓库的 src/internal 下实际文件，见方案索引。
