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
- 外部 Method 的真实闭环回归见 `application/evaluation/processor_registered_provider_test.go` 与 `judge_registered_contract_test.go`：结构解码允许外部绑定，并不替代冻结、准入和 Worker 的业务注册校验；测试须走 Confirm → Freeze → StartRun → Worker，而不只单测注册表。
- Studio 旧版 Benchmark 的回归见 `apps/studio/src/products/evolve/benchmarks/benchmarkRunSelection.test.mjs`：用只有新版资产的索引作为输入，检查按旧引用读取 id/hash/kind 与内容后，实际提交仍保持所选版本。

这些位置是排查和复验入口，不代表任何环境已经修复或发布。


## 2026-09-15 DEV 发布复验入口

发布源为 PR #299 合并提交 `15340e7bc6c9bc8cfb868f26619e3872c0d0e4f9`。版本与运行状态会变化，复用时读取以下证据，不将本页当作当前在线版本声明。

- [EVOLVE 发布 34939248547](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34939248547)：逐版本迁移日志、API/Worker rollout、实际镜像相等检查、NAS/healthz/鉴权 MCP 的核验入口。本次日志在 2026-09-15 明确记录 0001–0007 already applied、0008–0010 applied。
- [Studio 构建 207](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34938526645) 与 [发布 34939494276](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34939494276) 关联同一源 SHA。发布后默认 agent.sandaii.cn 索引引用 `/build/maxwell/studio/207/`；后续仍须回读线上索引。这里验证的是发布，不代表真实评测或历史数据修复。

**Why:** 手动发布的 ref 形式、组件各自的发布结果和数据库迁移是不同证据。raw SHA 直接传 workflow_dispatch 本次被 HTTP 422 拒绝；多组件 workflow 整体取消也可能已有组件发布成功；前端发布不等待后端迁移会产生版本不一致窗口。

**How to apply:**

- 用固定到已验收提交的分支或标签触发工作流，再核对 run.headSha。本次定位分支为 `codex/deploy-pr299-15340e7b`，不可将分支名自身当作不可变版本证明。
- 按组件读取 Job 及 rollout 日志，不只筛选 workflow 总状态。例如 [旧 DEV EVOLVE Job](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34843466688/job/103974420844) 成功，而父 workflow 为 canceled；[旧迁移 Job](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558733197/job/103136863807) 是迁移到 0007 的独立证据。数据库现状以后仍以台账/checksum 为准。
- 带数据库变更时先完成已获授权的 EVOLVE 迁移与运行核验，再发布同源 Studio。顺序来源见 `.github/workflows/maxwell-cicd.yml` 的独立 deploy_evolve/deploy_studio 依赖；按文件事务提交的迁移不会被后续 Job 失败自动撤销。
