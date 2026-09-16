---
name: evolve-pr302-review
type: reference
created: 2026-09-16
updated: 2026-09-16
tags: [maxwell, evolve, review, reports, objective, executor]
links: [evolve-generic-platform-review, evolve-pr300-deployment-boundaries]
---

# EVOLVE 报告与结果语义审查指针

来源：[PR #302](https://github.com/world-sim-dev/maxwell-ai/pull/302)，2026-09-16 审查锚点为 `4a3891b9134e4518a5f78cb386eb9bbef8e9c0b0`。修复状态和 main 基线会变化，复用时重新读取 PR 当前 head、diff 与 CI。

**Why:** 新结果页面即使通过类型检查、OpenAPI 生成一致性和包级测试，也可能在数组传输、共享 Agent 授权、运行中统计缓存及结论措辞处失真。

**How to apply:**

- 逐题报告从 `apps/studio/src/products/evolve/api.ts` 的 `getEvolveCaseTrouble` 追到生成 Axios 客户端和 `services/evolve-server/internal/app/transport/http/benchmarks.go`；用真实 serializer 核验数组是否是服务端读取的重复 `runRef`，再走 HTTP schema 验证，不能只测查询函数。
- 共享 Agent 的 `case_trouble` 同时核对 `internal/app/transport/mcp/schemas.go` 与 `internal/app/toolcaller.go` 的 `authorizeAgentSessionWork`。先测 schema 合法参数，再测会话绑定 Work；修复时必须保持 Run 归属校验，不能通过豁免授权解决不可调用。
- 达标展示从 `panels/ObjectiveVerdictCard.tsx` 追到查询 `Statistics` 和 domain Objective assessment；保留 1 条评分、99 条 pending 的运行中场景，检查界面是否把阶段达标写成最终结论。
- 报告通过率检查 `platform/EvolvePlatformStore.ts` 的 `loadRunStatsFor` 与 `reports/ReportsPage.tsx` effect 依赖；同一 Run 由 running 变 completed 后应读取新统计，不能只以 ID 作为永久缓存键。
- 执行器配置状态从 `targets/executionEvidence.ts` 追到 `queries/executor_verification.go`、`executorsource.Source` 和执行 Registry；用“先成功执行再禁用”的场景区分当前配置无法解析与历史快照真正缺失。`unverified` 本身不是快照丢失原因。

本页提供排查与回归入口，不表示 PR 已修复、合并或部署。与 [通用平台审查](evolve-generic-platform-review.md) 和 [配置快照及部署边界](evolve-pr300-deployment-boundaries.md) 结合使用。
