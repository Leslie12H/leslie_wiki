---
name: evolve-nextplay-ten-case-acceptance-20261015
type: reference
created: 2026-10-15
updated: 2026-10-16
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

## 2026-10-16 只读诊断指针

- ACK 内嵌应用日志检索、本次调用身份与时间窗、实际拒绝接口及代码解释见[十题诊断记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/diagnosis-20261016.md)。这是历史证据，不表示权限已修复或新运行已通过。
- **Why:** 通用 HTTP 403 无法区分 Preset 读取、Thread 创建和后续文件访问；Card 检查成功不能替代这些实际调用。
- **How to apply:** 先用 Run 时间及 Worker 来源关联独立 HTTP 请求，再按实际部署 SHA 查权限要求；凭据元数据核对、权限修复与新运行分别授权和验证。ACK 容器日志的最近行数不足时可在其日志中心限定业务日志库和时间窗，无需转入集群终端。
