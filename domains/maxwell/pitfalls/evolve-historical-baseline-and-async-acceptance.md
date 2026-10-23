---
name: evolve-historical-baseline-and-async-acceptance
type: pitfall
created: 2026-10-23
updated: 2026-10-23
tags: [maxwell, evolve, a2a, comparison, recovery]
links: [evolve-runtime-payload-and-terminal-recovery]
---

# 历史评分基线与异步接纳的边界

**Why:** 评测用于观察系统变化，不应要求旧系统可重现才能使用已经完成的历史评分。接纳回执、远端执行、证据取回和评分也不是同一个超时窗口；长任务不应被等待任务编号的短超时截断。协议演进后只检查旧回执字段，或假定旧请求正文一定被保留，会错误拒绝真实生效的候选。

**How to apply:** 用户于2026-10-23再次明确：已有Benchmark Run及其评分直接作为基线；同case与评分标准只运行修改后的系统；新增case或改变指标计算才补同口径双方结果。保持历史来源和评分口径，不为缺旧配置或旧回执而要求重跑。候选则验证自己的实际配置、输入与输出回执。对后续候选，界面应展示授权祖先中的原基线，不能仅允许直接父候选。

A2A发送应先返回已接纳任务编号，再持久化跟踪长任务；短HTTP调用期限不代表任务执行期限。发生接纳响应丢失时，先核对同一任务，不将未知当成已取消，也不盲目重复派发。长任务回归分别覆盖接纳、冻结执行时限、观察恢复和最终结果，时钟推进测试不能冒充真实长任务验收。

## 核验指针

- `services/evolve-server/internal/app/integration/a2a/registry.go` 的异步发送配置、`acceptance_timeout_test.go`；`application/evaluation/live_configuration_test.go` 的冻结执行期限恢复。
- `application/comparison/receipts.go` 与 `execution/runner_result.go`：比较复用运行时的精确资源回执；无旧请求正文时只能沿已授权Run的不可变Variant/CaseSet/Case验证，不能取当前Preset补历史。拒绝跨业务、损坏hash及不匹配资源，读入保持有界。
- `apps/studio/src/products/evolve/CandidateResultsStore.ts` 与相邻测试：祖先关系、同Work/业务、逐级资源摘要核对；服务端比较和授权仍为权威。
- 实施和真实完成情况：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/flexibility-acceptance-20261022.md`。测试通过、回执确认、完整评分、指标改善与采纳分别查证，不将本页视为已发布声明。

## 2026-10-23 测量来源与执行来源分离

**Why:** 历史基线可能属于另一Work和旧执行器，重新判卷可能属于新的独立Run；若把当前目标/画像、旧执行回执和新评分绑定到同一记录，准入、比较、目录及采纳会在不同层重复拒绝合法操作。将已预留额度理解为必须用完，还会无意义地强制重跑历史基线。

**How to apply:** 明确保存所选历史测量和候选实际执行的关系；新Run验证当前授权，比较保持同口径评分，重评沿授权SourceRun链读取原实际应用回执和成本约束。独立验证按不同实际执行计数，不能将一次执行及其重评分算作两轮。历史分数重用不返还累计用量、不读取未授权隐藏题。审查需覆盖命令层、数据库事务准入、目录分页、比较和最终采纳，不能只修前端选择或提示词。

- 回查 `application/commands/optimization_manual_decision.go`、`optimization_decision.go`、`runtime_metrics.go` 与 `application/comparison/execution_source.go`；当前测试和真实结果继续查上面的验收记录，不把本页作为发布完成证明。
- 对话确认表单的长选项标题与输入框不能在不可换行的单行中争用宽度；真实窄工作区核对 `apps/studio/src/pages/chat/AskUserCard.tsx`，看见textbox语义不代表它拥有可操作的宽度。

## 2026-10-23 System-wide tuning and recovery consistency

**Why:** The tuning Agent prompt, MCP, Skills, admission preparation, transactional commit and result UI form one product. A prompt workaround cannot repair contradictory prepare/commit state rules. Viewing old results must not hide a still-running candidate measurement.

**How to apply:** The user explicitly authorizes changing the tuning Agent SP, MCP tools and Skills for EVOLVE as a whole. Share recovery rules between preparation and commit, and recheck pending dispatch, unresolved actions and cumulative usage under the root lock. Preserve selected score identity separately from original execution identity. Select latest measurements deliberately, never count rescoring as another execution. Show score coverage beside rates, and derive candidate activity from run metadata independently of the selected historical detail.

- Inspect `infrastructure/postgres/optimization_reused_baseline.go` and its integration tests; recursive comparison/adoption queries should project needed metadata rather than historical JSON bodies.
- Inspect `CandidateResultsStore.ts`, `v3/ledger/LedgerLineage.tsx` and `v3/lineage/LineageNodeDetail.tsx` with both completed and running measurements.
- Changed Skill/MCP source is not proof of runtime activation. Read back effective tools and Skill content, then verify a fresh unguided conversation.

## 2026-10-23 声明、配置选择与观测一致性

**Why:** 后端已支持授权内运行，MCP 描述仍称永不执行，会与 SP/Skill 相互矛盾。不能仅凭页面说明推断目录过期，应比对源码、持久目录与真实模型请求。历史来源包含冻结 Preset，也不意味着后续调优必须使用同一 Preset。

**How to apply:** 默认继承原配置，显式选择新配置时保留历史测量身份并单独准备新执行；覆盖创建、准备检查、幂等重放及同 key 改参拒绝。工具声明与实际调用路径共同回归，发布后再次核对模型实际收到的说明。界面合并同一 Run 的详情和目录时按服务端版本选新记录；混合 UTC 与带时区时间应比较实际时间，不能用字符串排序。

- 核对 `application/commands/tuning_baseline.go`、`tuning_preflight.go`、`direct_preparation_test.go`，以及 `internal/app/transport/mcp/schemas.go`、`agent-resources/tests/evolve-orchestration.test.mjs`。
- 状态与时序回归位于 `apps/studio/src/products/evolve/CandidateResultsStore.test.mjs` 和 `conversationInterleave.test.ts`；真实运行及发布状态仍查验收指针。

## 2026-10-23 候选目录与重评分详情的关联投影

**Why:** 候选目录可通过来源链显示重评分所属候选，但原始 Run 详情仍没有直接 candidateId；前端若再次只按直接字段筛选，会把服务端已授权的合法评分丢掉。目录元数据和原执行记录表达的是不同事实。

**How to apply:** 保留重评分自身的身份、sourceRunRef 和 evidence_only，用已有候选目录或有界来源链确认关联；比较按原执行绑定的基线与当前所选评分发起，不把重评分复制成新执行。分页外的明确选择只追踪该来源，覆盖错候选、循环和旧版本覆盖，避免扫描全部历史。回归与真实页面证据查 CandidateResultsStore 及上面的验收记录。
