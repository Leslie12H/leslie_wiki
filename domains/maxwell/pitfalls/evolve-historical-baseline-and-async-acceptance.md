---
name: evolve-historical-baseline-and-async-acceptance
type: pitfall
created: 2026-10-23
updated: 2026-10-24
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

## 2026-10-24 执行器默认值、存储续接与目录读取

**Why:** Work旧画像不等于历史Run的实际执行器；省略选择时退回画像会拒绝合法续接。产物存储额度与Trial额度分别耗用，增加运行次数并不能解除大文件存储阻塞。工具每次调用全量读取所有Provider的schema还会掩盖真正的MCP耗时。

**How to apply:** 默认从经授权的历史执行来源解析执行器，明确选择不覆盖，冻结Grant重放用自身绑定。额度调整后核对累计用量与独立验证预留；停止空闲旧许可并创建新许可不等于原地续期，准备轮计数仍须独立回读。精确MCP选择可复用现有Provider范围读取，同时保留未选择的configRef owner、即时权限/禁用检查和错误传播；旧别名与混合选择继续完整读取，不能靠跨请求缓存忽略撤权。测试通过后仍需实际Runtime加载与延迟对照。

- 指针：`application/commands/optimization_start.go`及`optimization_executor_default_test.go`；Agent Server `internal/modules/tools/catalog/service.go`与`selected_configs_test.go`。真实候选、评分及发布状态继续查验收记录，不能以草稿冻结或Run接纳代替真实应用和质量提升。

## 2026-10-24 工作区趋势与候选目录的同源读取

**Why:** 主Work运行清单不含独立验证子Work；只绘主清单会让十题验收消失。反过来为补趋势展开全部目录和Trial会增加读取负担。轮询清空当前选择还会让同口径曲线短暂变成另一组数据。

**How to apply:** 复用候选检查器已授权读取的精确Run与历史基线，统计按每条Run实际Work读取；目录元数据不自动全量展开。测量趋势可以展示同评分口径的重评分，但必须标注，不能计成独立执行。选择变化立即清空并隔离晚响应，同一选择轮询保留旧结果及加载状态，重叠请求合并。绘图失败不能当零，比较结果和统计失败分开。到期/搜索结束也不能代替候选或验收完成；核对真实Run状态。

- 核验指针：`CandidateResultsStore.ts`、`v3/ledger/taskReading.ts`、`TaskOptimizationView.tsx`、`BenchmarkMetricsOverview.tsx`和相邻测试；实际样本与布局截图结论查验收记录。

## 2026-10-24 采纳恢复、预留与并发证明

**Why:** 只检查应用层的历史基线复用，会漏掉事务层仍要求耗尽预留的矛盾；早期失败记录若在选最新独立执行之前就拒绝，也会使修复后重测永远无法采纳。重评分可能只更新根预算epoch而保留Search revision，单独依赖Search版本会漏掉核验后新产生的测量。

**How to apply:** 对全部已授权记录按实际执行去重、选择最新约定轮次，再回放同口径评分；旧失败保留，最新失败和未完成不能回退挑旧高分。预留是容量而非必须消耗的次数，复用历史基线不应被迫重跑。应用层发出的内部采纳证明需同时绑定根usage epoch及Search版本，根锁内只验证小元数据；真实判卷和正文读取在锁外。验收轮次与预留Run数分开核对，不能将一对基线/候选当两次候选执行。

- 检查 `optimization_manual_decision.go`、`optimization_decision.go`（commands/postgres）及内部 `OptimizationDecisionProof`；具体真实运行/提交/发布状态仍沿本页验收记录指针查证。测试夹具需同步现有候选授权证明，不能把缺证明的夹具失败当成业务门禁应移除的理由。

## 2026-10-24 事务故障测试的真实触达

**Why:** 增加内部范围证明后，旧集成夹具可能在事务准入处就失败；只断言“返回任意错误”的故障测试仍然会绿，却不再验证计数与授权回滚。真实 PostgreSQL COPY 还会把构造器错误封装为数据库错误，不保证保留 Go sentinel 身份。

**How to apply:** 给成功与故障夹具都提供当前合法的内部授权证明；对注入错误核对真实故障来源，再回读累计计数、执行状态与幂等回执。完整存储包在独立临时 schema 上运行，保留失败日志；不能通过放松生产校验来迁就缺证明的测试，也不能把 mocked 成功称为实际候选质量通过。

- 指针：`optimization_consent_integration_test.go`、`optimization_control_integration_test.go`及验收记录中的完整PostgreSQL回归；候选实际应用与评分结果分开核验，具体状态仍沿原验收记录查询。


## 2026-10-24 人工答复后的会话恢复与候选原件复核

**Why:** AskUser 答复被接纳时，客户端可能仍停留在旧 waiting checkpoint；若只在 running 状态补读，就会漏掉后续回复。终态状态更新也不能代替持久化正文。候选方面，说明声称移除限制不代表资源真的改变；将未确认资源的 hash 配回旧冻结 Variant，会造成可恢复的精确编辑错误。

**How to apply:** 在接纳用户答复后保留同步目标，旧等待状态不能提前解除；收到终态后补读有界历史，使用服务端时间与微秒排序，保留会话切换隔离，异步工具等待不要反复加载正文。对候选逐段核对实际 diff、所属冻结版本和每个资源 hash，出错时从已授权原件恢复，不能重复询问业务方向或放松完整性验证。

- 前端指针：`EvolveAgentConversation.tsx`、`conversationRecovery.ts` 与相邻测试；实际复现和修复后验收状态沿主验收记录查询，不能仅凭单测宣称真实 AskUser 路径通过。
- 原件指针：`application/resourcecontent/source.go`、`edits.go` 及 `commands/resource_edit_test.go`；错误中的正确 hash 只能在原有授权检查通过后返回，不返回正文或替用户自动接受新内容。
- Agent 指针：`agent-resources/prompts/evolve-tuning-agent.md`、`skills/optimization-strategy/SKILL.md`；源码更新与隔离/共享运行时加载要分开核对。
