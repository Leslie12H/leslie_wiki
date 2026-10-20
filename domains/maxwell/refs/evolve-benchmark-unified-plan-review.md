---
name: evolve-benchmark-unified-plan-review
type: reference
created: 2026-10-20
updated: 2026-10-20
tags: [maxwell, evolve, benchmark, split, subject, executor, adapter, visualization]
links: [evolve-benchmark-run-subset]
---

# Benchmark 补齐方案专项复审入口

2026-10-20 用户要求复审可视化通用性、split 逻辑和 Subject/Executor/Adapter 职责。本轮只修订方案，未实施。

**Why:** 共享 Adapter 可以服务多个被测对象；当前连接关联不能代替历史业务身份。平台 Work 停止不等于远端准备已取消；业务展示需要独立的数据 schema、展示器版本和受控读取规则。

**How to apply:** 接口/结构、七项发现及处理沿方案核对。实施前检查多对多关联、Work 的固定归属、两端重试/取消、split 全量归一和展示降级，不能把设计修订当作真实运行验收。

- 方案：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-unified-plan-20261020/proposal.md`；七项发现与证据见同目录 `review.md`。精确接口和结构清单以修订方案为准。
- EVOLVE 源码：`domain/executor/routing.go`、`application/execution/runner_binding.go`、`runner_preparation.go`、`commands/work.go` 与 PostgreSQL `CommitWorkStop`；保留已有 Work 行锁与活动 Run 屏障，不把拟新增准备取消当成现有事实。
- 昨日选题工作区：`/Users/leslie/.codex/worktrees/benchmark-case-selection/maxwell-ai`；`commands/case_selection.go` 全选返回原全量，`domain/evaluation/selection.go` 的 Selection 仅表示真实子集。
- 展示入口：Studio `rendering/evidenceRenderers.ts` 和 EVOLVE `domain/artifact/display_hints.go`；业务原件、schema 解释和展示器职责分开，证据归属/完整性统一由平台处理。

## 2026-10-20 三表必要性复审与精简替代

用户进一步要求避免过度设计，复用现有对象、执行器和版本机制，明确先不实施。当前推荐改为 [精简方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-unified-plan-20261020/simplified-proposal.md)；原 proposal.md 和首轮 review.md 保留历史输入，Subject 三表及其接口不再是实施候选。

**Why:** Studio 的对象目录本来以执行器登记为基础，Work.target_ref 与实际 executorRef 已有职责区分；Variant/Candidate/Run 和 Artifact Work membership 已承担版本与复用。共享 Adapter 可以由多次运行明确引用，并不必然需要一套可编辑关联目录。

**How to apply:** 先核对当前 ObjectsDirectory、direct_run.go、TargetProfile、ListArtifactsByAccess 和 membership，再判断缺的是查询、编排还是实体生命周期。精简方案取消独立 Subject/版本/关系表和新默认路线字段，保留既有逻辑关联或本次明确选择；精确接口/结构清单沿新方案，不在知识库复制易变数量。版本跨 Work 聚合必须授权后分页，来源 preset 不能被对象默认值覆盖。

## 2026-10-20 必要性与落地门槛复审

用户再次要求只 review 必要性与可行性，并明确保留 split。当前首期取舍与源码证据沿 [可行性复审](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-unified-plan-20261020/feasibility-review.md)；较完整目标设计保留在 simplified-proposal.md，不可将两者混作首期范围。

**Why:** 复用表和接口不等于已经具备运行能力。普通接入 Variant 可以只记录注册描述；现有 Runner 准备有调优来源门禁，模型候选与历史快照执行也要核对两端实现。不能把参数透传或已有快照文件当成配置生效与可重放的证明。

**How to apply:** 先沿 EVOLVE direct_run.go、commands/runner_preparation.go、execution/runner_binding.go 与 Nextplay maxwell-runtime 的 request.py、candidate.py、runner.py、materializer/service.py 重查当前代码。split 复用 CaseSet 修订，保留明确产品/API 语义；普通评测准备、模型替换与通用/业务产物阅读按闭环验收。版本目录和任意历史恢复单独立项，不作为运行选 preset 的隐含前提；精确接口/结构和阶段以复审文档为准，本次未实施。
