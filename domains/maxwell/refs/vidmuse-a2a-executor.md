---
name: vidmuse-a2a-executor
type: reference
created: 2026-09-09
updated: 2026-09-09
tags: [maxwell, evolve, vidmuse, a2a, evaluation]
links: [maxwell-quality-eval, vidmuse-zeus, vidmuse-aion]
---

# VidMuse 接入 EVOLVE 的执行器契约指针

2026-09-09 为设计讨论，未实现或验证在线接入。检查的是 Maxwell 本地工作树 `.tmp/evolve-flow-repair-20260908`（42b19a73），不能代表线上或最新主干。

## 去哪看

相对该工作树的 `services/evolve-server/`：
- `docs/executor-kit/README.md`：执行器接入、登记、预检与评测/调优级别。
- `docs/executor-kit/schemas/execute-trial.v1.json`、`trial-evidence.v1.json`：请求与回执。
- `internal/modules/evolve/application/execution/contract.go`：实际请求、证据验证、幂等标识；文档与实现冲突时重新核对代码。
- `internal/app/integration/a2a/registry.go`：协议绑定、任务观察、交互要求状态映射。
- `docs/executor-kit/skeletons/external_a2a.ts`：最小示例；异步长任务需补持久化、真实查询和取消，不能直接当生产服务。

**Why:** A2A 解决跨服务调用；可信评测还需要明确任务完成条件、运行证据和版本归属。调优还要求候选配置真正进入被测运行，预检 marker 回显不能单独证明这一点。

**How to apply:** 建议在 VidMuse 边界实现确定性适配器，对接产品任务 API，返回 EVOLVE 结构化证据。先完成固定版本评测，再讨论隔离的候选配置注入。具体 API、媒体 Judge 能力及上线状态需要单独核验；方案不是已确认产品决策。
