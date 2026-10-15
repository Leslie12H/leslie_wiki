---
name: evolve-nextplay-ten-case-acceptance-20261015
type: reference
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, evolve, nextplay, acceptance, permissions]
links: [evolve-nextplay-dev-release-20261015, evolve-native-routing-vs-candidate-runner]
---

# Nextplay 原题十题抽样验收入口

**Why:** 部署就绪和 Agent Card 探测通过不能证明实际内部执行接口权限、原件归档与评分链路可用。必须保留每次真实运行及失败，而不是覆盖结果或把基础设施错误当作质量未通过。

**How to apply:**

- 授权、选题、冻结修订、执行连接、Provider、Run、逐题错误和前端刷新核验见[本轮验收记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/plan.md)。此为 2026-10-15 的历史实验，不代表当前服务状态。
- 记录附十题原始页面诊断及截图；需要继续验收时先沿原 Run 核对具体拒绝接口和权限，再决定修复与新运行，不能仅凭通用 execution_unavailable 错误扩大授权。
- 连接检查与内部执行路径的实现分别查 `services/evolve-server/internal/app/integration/a2a/connection.go` 和 `maxwellexecutor/adapter.go`；这些路径会变化，以对应部署 SHA 为准。
- 上一轮发布证据见[dev 发布核验入口](evolve-nextplay-dev-release-20261015.md)。本轮仅发起十题验收，没有额外部署；原 65 题 Benchmark 保留。
