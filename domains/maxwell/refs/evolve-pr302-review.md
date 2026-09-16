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


## 2026-09-16 修复回归入口

PR amend 修复锚点：[041f5135](https://github.com/world-sim-dev/maxwell-ai/commit/041f5135a7d90c70a77435c117f2f04c6ea87939)。后续是否通过 CI、合并或发布仍以 [PR #302](https://github.com/world-sim-dev/maxwell-ai/pull/302) 和 [该提交 CI](https://github.com/world-sim-dev/maxwell-ai/actions/runs/35050925318) 为准。

- `reports/caseTroubleRequest.test.mjs` 验证真实 Axios 参数编码；`internal/app/transport/http/case_trouble_test.go` 验证同一参数契约经过 HTTP 和工具 schema 后仍保留全部 Run。
- `platform/EvolvePlatformStore.test.mjs` 验证活动 Run 同版本重读、终态版本缓存、状态变化、旧响应竞争和失败重试。
- `panels/ObjectiveVerdictCard.test.mjs` 与 `panels/objectiveVerdict.test.ts` 验证运行中、失败、取消以及终态覆盖缺口的结论边界；未评分守护维度不能改判为调优目标未达标。
- `targets/TargetExecutionVerification.test.mjs` 验证配置核验保留未知原因；不将禁用造成的当前不可解析写成历史快照丢失。
- `internal/app/case_trouble_test.go` 通过完整 ToolGateway 验证绑定 Work、跨 Work/业务和隐藏 lineage；查询聚合前必须完成整组 Run 的授权。

前端测试由现有 `check-evolve-platform-ia.mjs` 接入通用 check，Go 测试由包测试发现；不能以测试文件存在代替实际执行结果。


## 2026-09-16 合并后 main 发布核验入口

- [main 合并提交 bd69eefe](https://github.com/world-sim-dev/maxwell-ai/commit/bd69eefe7ac4b5069b6a4bbcbd31d20b3cc4f8d2) 与已测试 amend 提交的 Git tree 一致；复用时仍要重新核对目标 main，不把旧提交当作当前版本。
- [DEV 发布工作流](https://github.com/world-sim-dev/maxwell-ai/actions/runs/35051417361) 直接由 main ref 触发，选择 Studio 与 EVOLVE，数据库迁移关闭。读取工作流 headBranch/headSha、API/Worker rollout、实际镜像相等以及 NAS、健康检查、认证 MCP 和公网路由检查，不能只看 dispatch 被接受。
- [Studio 212 子构建](https://github.com/world-sim-dev/maxwell-ai/actions/runs/35051426916) 以该 main SHA 为 source；核对线上默认入口 https://agent.sandaii.cn/ 的静态资源构建编号。本次发布后入口引用 `/build/maxwell/studio/212/`，此数值只作为发布记录锚点。
- 本 PR 没有新增迁移、环境变量或 Agent 资源变更，因此沿用已有数据库结构且只部署 Studio 与 EVOLVE API/Worker。服务发布和只读页面验收不代表新真实评测、历史数据修复或 Prompt/Skill 同步。
