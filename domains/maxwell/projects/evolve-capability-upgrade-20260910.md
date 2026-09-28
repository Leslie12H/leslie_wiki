---
name: evolve-capability-upgrade-20260910
type: project
created: 2026-09-10
updated: 2026-09-11
tags: [maxwell, evolve, casegen, judge, optimization, responder, a2a]
links: [maxwell, evolve-interactive-responder, evolve-tuning-agent-loop-audit-20260909, evolve-maxwell-tuning-receiving]
---

# EVOLVE 能力升级 P1–P4 实施（2026-09-10 进行中）

方案：飞书 https://j0yswlgboxz.feishu.cn/docx/Fzjid4GzkoFdKHxevXicN1sMnFd ；仓库 `services/evolve-server/docs/evolve-capability-upgrade-plan-20260910.md`，已提交在分支 `feat/evolve-capability-upgrade-20260910`（ca5cc800，基于 origin/main 828e7d87）。

拍板（2026-09-10，Leslie）：
1. 允许 EVOLVE 直接拉 Maxwell 会话流量，但要控制性能（异步导出、先抽样后脱敏、并发/速率上限、缓存）。
2. pairwise 作为候选对比默认判法。
3. 应答者走 agent-server 的调优 Preset 本体（按问新建独立 thread、request_id 幂等、只读工具），不用 EVOLVE 裸模型端点。
4. search/iterative 默认预算暂不拍板，先用可配置默认值（3 轮 × 2 候选 × 200 Trial）。
5. P1 试点目标不验证，直接做 P1–P4。

实施方式：子 agent 并行，worktree 在 maxwell 仓库 `.tmp/`：
- P1 业务依据 → 分支 `feat/evolve-p1-business-basis`，worktree `evolve-p1-20260910`
- P2 判卷 → `feat/evolve-p2-judge`，`evolve-p2-20260910`
- P4 交互式 Run → `feat/evolve-p4-interactive`，`evolve-p4-20260910`
- P3 优化（依赖 P2 的 pairwise 与 DiagnosisReport）等 P2 完成后启动。
合并顺序建议 P1 → P2 → P4 → P3，registry.go / schemas.go 预期有小冲突。均未 push。

**Why:** 三个问题（出题不贴业务、判卷维度简单、优化策略不足）根源相同：main 上 Method 目录只有校验类方法，生成全靠 Agent 手写；先把 BKP/DiscoveryReport/DiagnosisReport/ResponderContext 做成一等产物。
**How to apply:** 追加任务前先看各分支最终报告与 registry.go/schemas.go 改动点；P5（流量拉取权限、input-required 映射、外部 judge 执行器）是跨团队项，不要从分支存在推断已接通。


## 2026-09-11 P1–P4 实施完成（单提交，未 push）

分支 `feat/evolve-capability-upgrade-20260910`（worktree `.tmp/evolve-plan-20260910`），基于 origin/main `828e7d87`，squash 为单个提交并 rebase 到最新 main，已开 PR #281 https://github.com/world-sim-dev/maxwell-ai/pull/281（191 文件，+16916/-1225）。四个子 agent 分支已合并并删除。

验证：`go build ./... && go vet ./... && go test ./...` 全绿；`pnpm typecheck:studio` 与 `pnpm --filter @maxwell/studio check` 通过；`node --test agent-resources/tests/evolve-orchestration.test.mjs` 8/8。

落地内容：P1 BKP/DiscoveryReport v2/Case basis/coverage-plan/critique；P2 JudgeSpec 权重·关键维度·证据声明·多判法组合 + reference-compare/pairwise/trajectory-rubric/anchor-refine + 判卷质量指标；P3 闭集 cause 的 DiagnosisReport + skill-edit/config-edit/contrastive-edit + search/iterative 预算循环·回归守卫·HypothesisLedger；P4 `remote_waiting_input` 状态与同 taskId 续发、ResponderContext、responder/scripted 与 agent-context、interactions 证据与泄露检查、`evolve_run wait/reply`。

**未完成/需人工**：迁移已合并为单个 `0007_evolve_capability_upgrade.sql`（草稿对象与产物类型扩容、evolve_cases 两列、evolve_trial_attempts 三列与状态扩容、evolve_optimization_searches 建表），需确认后部署。合并原因：四阶段各自重建同一组 Artifact kind / draft object CHECK，分开会留下回退式中间态，且若前一个已上线并产生数据，后一个 ADD CONSTRAINT 会直接失败。agent-server 侧 `input-required` 映射、真实 Variant 应用、会话流量拉取权限（thread_read）与外部 judge 执行器属 P5 跨团队，均未接通；`responder/agent-context` 的真实 HTTP 调用未经真实环境验证。合并时统一了 interactions 类型（判卷侧 Interaction 扩为 P4 记录的超集）与 Method 计数断言。

**How to apply:** 继续这条线时先读单提交的 diff 与方案 §11 的 P5 行；不要从分支存在推断 agent-server 已接通。


## 2026-09-11 评审与 PR

PR #281（分支 `feat/evolve-capability-upgrade-20260910`，142 文件 +16490/-408）。

坑（两个，都已修）：
1. **squash 时 origin/main 已前移**：worktree 建于 828e7d87，`git reset --soft origin/main` 时 origin/main 已到 3f414a83，导致单提交里回退了他人两个提交（多出 47 文件、1225 行删除，误改 agent-server）。修法：`reset --soft` 到真实基线重新提交再 rebase。**教训：squash 前先核对 worktree 基线与 origin/main 是否同一 commit。**
2. **code-review skill 在会话 cwd 跑**：默认审了会话目录所在的 `feat/evolve-executor-onboarding`（58c7a104），不是目标分支。要审别的 worktree 必须显式指定目录与 diff 范围。

评审修掉的三个阻塞（均为并行子 agent 的接缝问题）：MCP schema 声明了 `expected`/`milestones` 但网关解码结构体漏了（`DisallowUnknownFields` 直接拒绝，reference-compare 整条不可用）；P2 判卷侧交互记录上界小于 P4 worker 可写入量导致交互式 Run 永远冻结不了证据；pairwise 走 EvidenceSet 不过 `ListTrialsByAccess` 导致隐藏用例泄露给 visible 作用域。

**How to apply:** 多子 agent 并行实现同一模块时，合并后必须专门审「schema 声明 vs 解码结构体」「各方各自定义的上下界」「新查询路径是否复用了既有访问过滤」三类接缝。
