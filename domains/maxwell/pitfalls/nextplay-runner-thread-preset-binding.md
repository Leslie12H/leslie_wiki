---
name: nextplay-runner-thread-preset-binding
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [maxwell, evolve, nextplay, runner, judge]
links: [nextplay-benchmark-import-audit-20260915]
---

# Nextplay 外层完成不等于业务评测完成

核验入口：[失败 Trial 所属 Run](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_b45e0eedb5fdce022c574e0528524c13)；外层执行器任务 `run-6429237a997a33dc518e2cba056a6f12`，Thread `thr_01M2J0C7NKKTZQPNAWMXMDYK38`，影游 a2a 业务。此处存历史核验指针，最新状态需重新读取。

**Why:** 外层 Agent 可以正常结束并交付结构化失败结果；不能把外层 TASK_STATE_COMPLETED 或 EVOLVE Run 结束视作被测业务成功。2026-09-16 查到的该次 result.json 在创建内层 Thread 时返回 HTTP 400，traceId `166cc0bef07f4a9a667d012b2c0126be`，尚未开始业务执行。Maxwell 提交 `f8504478f` 的 runtime/application/threads.go 要求创建时绑定 Preset；nextplay-eval `a6c52f6` 的 CandidateRunner 缺少绑定，而普通 Executor 路径已绑定。

**How to apply:**

- 对照 nextplay-eval 的 `maxwell-runtime/src/nextplay_runtime/runner.py`、`executor.py` 和 `maxwell-cli` ThreadService，核对创建请求的 clientMetadata.presetId 必须是物化后的临时 Preset。不能依靠后续消息中的 presetId 覆盖 Thread 绑定。
- 从外层 result.json、内层 Thread/Run、证据完整性到 Trial 判卷逐级核验；保留原错误记录和未完成采集的资源。离线修复测试通过还需更新外层实际使用的运行包并重新运行，不能用服务部署替代 Runner 包生效证明。
- 从上述 Work 冻结的 `artifact_c0eef3b78bacd2213b04d72783624962` 读取 JudgeSpec，并对照 nextplay-eval `datasets/storyline-6x6-v1/evaluation-catalog.yaml` 的 `manual-eval-d1-d5-v1`。维度、尺度、权重、critical、证据与聚合必须一起对齐；仅 finalState 评分不能代表轨迹检查。
- 方法库能力存在不等于该 Work 调用了它：从业务知识、discovery_report、coverage_plan、critique 与 judge_calibration_report 的产物/调用记录审计。schema-fingerprint 是结构校验，不能替代语义出题和人工判卷校准。
