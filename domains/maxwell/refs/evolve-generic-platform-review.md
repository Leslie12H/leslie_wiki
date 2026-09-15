---
name: evolve-generic-platform-review
type: reference
created: 2026-09-15
updated: 2026-09-15
tags: [maxwell, evolve, review, benchmark, retention, external-judge]
links: [maxwell, evolve-usage-accounting, evolve-error-policy-fail-breach]
---

# EVOLVE 通用平台审查指针

来源：[PR #299](https://github.com/world-sim-dev/maxwell-ai/pull/299)。2026-09-15 审查锚点为 `4dc6025c61b970b5df2fcc302a57f166b8c280d3`；后续修复与 CI 状态以 PR 当前 head 为准。

**Why:** 通用接口和单元测试通过并不证明真实编排保留了身份、评分与证据。特别需要核对准入、Worker 重建依赖以及长期保留时的引用闭包。

**How to apply:**

- 证据引用授权从 `internal/app/integration/evidenceresolve/resolver.go` 追到普通 `FreezeArtifact` 导入入口。引用自报的业务 binding 不是可信归属；测试必须用两个真实业务，在普通 Artifact 查询拒绝后，再验证导入引用和窗口读取仍不能按已知全局 CAS 哈希获得另一业务正文。
- Benchmark 结果从 `services/evolve-server/internal/modules/evolve/application/commands/benchmark.go` 的 `RecordBenchmarkResult` 追踪到 HTTP/MCP；验证终态、冻结 Scorecard、真实 executor 和完整运行策略，不能只检查 CaseSet/Judge 引用。回归应包含尚在 queued 且没有 Scorecard 的 Run。
- 保留清理从 `infrastructure/postgres/retention.go` 和 `application/retention/sweeper.go` 追到 `application/evaluation/live.go` 的 `freezeLiveEvidence`。冻结 EvidenceSet 的 `outputRef`/`references` 可以指向已 committed Attempt 的响应正文；需要验证其正文仍可读，不能只确认 artifact 元数据和顶层 CAS 对象存在。用实际 CAS 加过期时间推进复现，再走详情或重评读取。
- 外部注册 Method 从 `commands` 的业务 registry 追到 `application/evaluation/processor.go` 的 Worker registry，验证同一个 provider 在两处均绑定；评分转换还要验证 0.6/1 和超出 maxScore 的非整数值不被静默取整。
- Studio 的 Benchmark 预检应追踪到真正 StartRun 请求中的目标、基准版本、CaseSet、Judge 和策略；仅跳转页面不能证明配置被带入。
- OpenAPI 验收同时运行客户端生成差异检查和类型检查；PR 中的验证描述不能替代该 head 的 CI 日志。

这些位置是排查和复验入口，不代表任何环境已经修复或发布。
