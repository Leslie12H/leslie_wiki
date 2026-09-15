---
name: nextplay-runner-thread-preset-binding
type: pitfall
created: 2026-09-15
updated: 2026-09-15
tags: [maxwell, evolve, nextplay, runner, runtime, contract]
links: [nextplay-real-run-contract-review-20260914, evolve-demo-runbook-20260914]
---

# Nextplay Runner 创建 Thread 遗漏 Preset 绑定

## 2026-09-15 历史失败与证据入口

本次有界基准在创建临时 Preset 后、保存内层 Thread 前失败：`POST /api/runtime/threads` 返回 HTTP 400 / `invalid request`。EVOLVE 记录 `remote_failed`，没有质量分数；内层 Thread/Run 均未创建，`applied=false`、`captureComplete=false`，没有目标文件产物。不能把这次失败解释为 Nextplay 创作质量差、Judge 不通过或候选未改善，也不能据此前成功运行断言当前链路兼容。

- [本次 Work / Run](https://agent.sandaii.cn/evolve/tasks/work_f3bc66b38eb27fc777d927aaa1aeef67?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_b45e0eedb5fdce022c574e0528524c13)：2026-09-15 约 15:44（Asia/Shanghai）启动；Trial `trial_4794e8ff7a5bb6e2fca114e54ec266fb`，Attempt 1。
- 授权外层 UI 回读：Thread `thr_01M2J0C7NKKTZQPNAWMXMDYK38`、Run `run-6429237a997a33dc518e2cba056a6f12`；HTTP traceId `166cc0bef07f4a9a667d012b2c0126be`。
- 外层原始文件入口：`evolve-results/00d916271c73a27b906ec65af7228563d5488a2afac0892dc97b29f90a8764f0/trial-evidence.json`。本次回读证据摘录在 `/private/tmp/nextplay-e2e-20260915/baseline-failure-evidence.json`，授权、冻结条件和验收范围在同目录 `acceptance.md`。文件路径是历史定位线索，后续应回到原 Work/外层文件核实可读性。
- 详细源码因果、本地修复及恢复边界：同目录 `thread-create-root-cause-and-fix.md`；它记录的是本地可审查修复，不能作为共享 Runner 已发布或真实恢复成功的证据。

本次未另行提取失败 HTTP 请求的原始 body，也未重复 POST 复现；诊断依据为上述真实失败、已核对 Runner 的实际发包代码与服务端对应拒绝分支。

## Why

**Why:** Runtime 将 Preset 固定为 Thread 创建时的身份，独立 CandidateRunner 仍沿用只传用途、模式和候选标识的旧创建方式。临时资源物化成功不代表 Thread 已绑定到它们；后续消息携带 Preset 也不能补救一个已在创建入口被拒绝的 Thread。Dataset 执行器与独立 Runner 分别组装创建参数，前者已带绑定，不能用它的成功覆盖后者。

本次审计锚点是 Maxwell `15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9`、Nextplay `a6c52f63febc2c64fec4b1e97fb2ad20e4266a46`；它们不是永久在线版本声明。强制创建时绑定由 Maxwell [提交 f8504478](https://github.com/world-sim-dev/maxwell-ai/commit/f8504478f15e0392151acde0ec4a9270d88e4351) 于 2026-09-15 08:43:49 +08:00 引入，已包含在本次 Maxwell 审计提交中。

代码从以下入口核对，不在 Wiki 复制实现：

1. Nextplay [CandidateRunner 创建 Thread](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-runtime/src/nextplay_runtime/runner.py#L93-L104)：先物化并获得临时 Preset，再创建 Thread；该提交未传 `client_metadata.presetId`。
2. [ThreadsService.create](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-cli/src/maxwell_cli/services/threads.py#L25-L34) 原样放入 HTTP `clientMetadata`；[Dataset executor](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-runtime/src/nextplay_runtime/executor.py#L88-L98) 可对照其已绑定物化 Preset 的路径。
3. Maxwell [threadCreationMetadata](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/modules/runtime/transport/http/controller.go#L169-L185) 将 `clientMetadata.presetId` 提升为规范绑定；[ThreadAgentPresetID](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/modules/runtime/domain/thread.go#L50-L56) 只读取该绑定。
4. [CreateThread 准入](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/modules/runtime/application/threads.go#L61-L82) 在持久化前拒绝缺失 Preset；[HTTP 错误映射](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/foundation/httpapi/response/status_error.go#L30-L31) 将其输出为通用 400 / `invalid request`。既有入口回归见 [runtime_api_test.go](https://github.com/world-sim-dev/maxwell-ai/blob/15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9/services/agent-server/internal/app/api/http/runtime_api_test.go#L1077-L1092)。

## How to apply

**How to apply:**

- 遇到“已建临时资源、尚无内层 Thread”的 400，先关联精确 trace/Attempt，再核对调用方创建 payload 和部署版本的创建契约。不要先改业务 Prompt、Judge 或扩大重试。
- 修复调用方时，绑定本次物化得到的临时 `agent.preset_id`，保留用途/模式/候选标识；不能使用源基准 Preset 或外层 A2A Preset 代替。聚焦回归同时覆盖 baseline 和 candidate 两条创建路径，并核对后续派发仍使用同一临时 Preset。
- 发布/替换共享 Runner 是独立步骤，须按当轮授权执行并导出核对正式包与版本；本地测试、ZIP 构建或平台部署成功都不能代替真实恢复验收。
- 本次没有可 resume 的内层 Thread/Run。恢复能力从 Nextplay [CLI 的 start/run/status 分支](https://github.com/world-sim-dev/nextplay-eval/blob/a6c52f63febc2c64fec4b1e97fb2ad20e4266a46/maxwell-runtime/src/nextplay_runtime/cli.py#L39-L86) 核对；不得删除失败 result/process/lease 强迫同一 invocation 重跑，或手建 Thread 冒充原 Attempt。沿平台支持的新 Attempt/Run 路径重试，保留失败历史。
- 失败后保留的临时资源须按同次 result/lease 清点并核对引用，清理需另有授权；不能依据标题或“临时”字样删除源基准、外层 Preset 或证据 Thread。
- 恢复后重新验证内层 Thread/Run、实际配置应用回执、产物全文和判卷，再用固定 CaseSet/Judge/运行策略做真实 candidate 比较。此次历史证据归档时，恢复基准、候选比较及 DecisionReport 均未完成，不能标为已修复上线或闭环通过。

相关背景见 [2026-09-14 真实评测契约复核](nextplay-real-run-contract-review-20260914.md) 与 [演示讲稿的验收边界](../refs/evolve-demo-runbook-20260914.md)。
