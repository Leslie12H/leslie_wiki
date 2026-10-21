---
name: evolve-benchmark-unified-plan-review
type: reference
created: 2026-10-20
updated: 2026-10-21
tags: [maxwell, evolve, benchmark, split, subject, executor, adapter, visualization]
links: [evolve-benchmark-run-subset]
---

# Benchmark 补齐方案专项复审入口

当前统一入口为 [Benchmark 补齐最终方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-unified-plan-20261020/final-proposal.md)。下文此前方案与复审记录为历史来源，实施范围以最终方案为准。

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

## 2026-10-20 最终方案入口

用户要求将几轮结论整合成一版最终方案，明确保留 split、列清接口/数据库和实施顺序，先不实施。文档已落在上方统一入口，旧方案文件已标注历史状态。

**Why:** 需要让实施方只沿一个范围执行，避免把历史版本中的 Subject 表、版本目录或任意快照恢复混入首期。已有接口与存储可复用，但准备状态、配置生效和业务展示仍需分别完成。

**How to apply:** 从最终方案查看对象/preset/执行连接关系、split 与 CaseSet 修订、Adapter 物化职责、API/DDL 清单和验收顺序。HTTP /runs 当前已使用 202；工具 stop 的现有路由与公开 OpenAPI 需一并核对。先对齐契约，再依次整合 split、可靠准备、双端 preset/模型执行、可视化及联合验收。方案定稿不构成代码、DDL、发布或真实运行授权。

## 2026-10-20 Split 可编辑与历史冻结

用户追问 LangSmith split 是否可变，以及本方案是否禁止修订。最终方案 Split 规则已澄清：split 可编辑并保存新修订，同一身份不变；不可原地改写的是历史修订及运行已采用的题集。未修改业务代码或接口。

**Why:** 将“历史修订不可变”简称为“split 不可变”会造成禁止维护题组的误解。题组维护与历史成绩可复核需要同时满足。

**How to apply:** 产品编辑继续复用 CaseSet 修订；沿最终方案的 10 题变 12 题示例核对，旧 Run 不随新 split 成员变化。LangSmith 当前行为请沿官方 [UI split 管理](https://docs.langchain.com/langsmith/manage-datasets-in-application#create-and-manage-dataset-splits)、[update_dataset_splits](https://reference.langchain.com/python/langsmith/client/Client/update_dataset_splits) 与 [数据集版本](https://docs.langchain.com/langsmith/manage-datasets#version-a-dataset) 核对；不要由此推断其内部存储与 Maxwell 相同。运行默认选最新还是要求精确修订属于独立的 API 选择策略，不等于 split 能否修改。

## 2026-10-20 Split 默认当前修订的已确认方案

用户明确要求调整最终方案：split 可编辑；运行默认取当前修订并冻结；revision 可选，选择历史题组时再指定；同步接口清单，先不实施。规则与示例已合并到 [最终方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-unified-plan-20261020/final-proposal.md)。

**Why:** 默认使用可维护的当前 split，同时保留历史分数可追溯；不能因客户端重试、排队或后台恢复而重新解释“当前”。

**How to apply:** 沿最终方案的请求意图/解析计划分离、接纳并发、响应精确引用、调优继承和验收条件核对。首次接纳持久化已解析修订，同键重试恢复它；新键省略 revision 才读取当前头部，历史新运行显式给 revision。请求可选不代表响应/冻结引用也可省略，客户端不能把解析结果回填成原键的新请求。数据库结构清单未因本次选择策略增加，接口契约与业务代码尚未实施。


## 2026-10-20 实施授权与资产独立归属修正

用户在确认 split 默认当前修订并冻结后明确“开始”，随后两次强调资产和 Benchmark 不归属于 Work。本条覆盖此前精简方案中将新配置资产继续放入 Work membership 的解释：资产独立版本化，Benchmark 冻结组合，Work 只引用资产并编排准备/执行；旧数据保留兼容不等于为新资产建立 Work 归属。

**Why:** 若配置资产必须依赖源 Work 才能保存、读取或复用，就会把业务资产生命周期错误地绑定到一次执行。仓储放开空 work_id 仍不充分，查询投影、批量读取和引用校验也可能残留归属判断，需要一起核对。

**How to apply:** 当前实现与验收范围沿 [本地实施记录](/Users/leslie/.codex/worktrees/benchmark-split-execution/maxwell-ai/docs/verification/2026-10-20-benchmark-split-execution.md) 核验；其中列出 Maxwell/Nextplay 隔离分支、契约、迁移与验证证据。重点查 commands/configuration_assets.go、queries/service.go、两种仓储的 artifact_read 与引用校验，确认新配置资产无 WorkID、按业务与可见性授权；执行结果仍保留自己的运行上下文。

用户另行书面同意仅修改 evolve_artifacts 的两个既有 CHECK，使 target_profile、variant_manifest、resource_content 可不带 work_id；无新表/列/索引、不改写旧数据，仅编写迁移文件。迁移清单登记、环境 DDL、业务代码发布与真实评测须分别核对授权和回执，不可由本地测试推断上线。旧 v1/v2 保持兼容；v3 模型物化、原件保留和可选展示声明仍需真实业务验收，任意历史源环境恢复不在首期。

## 2026-10-21 实施分支契约与完成时序复审

**Why:** 独立资产的仓储权限调整不能代替共享资源读取契约核对；执行完成也不能先于正式证据封存。Store 测试通过不能证明轮询期间 React 视图保持可读。本次仅审查与本地复现，未修业务代码或执行环境变更。

**How to apply:** 沿下列实现指针重查最新分支，不把本页当作当前修复状态。补测真实资源读取/候选冻结、延迟或中断封存时的并发状态查询，以及相同证据刷新后的视图保留；静态和本地技术测试不替代真实双端验收。

- Maxwell 工作区与实施边界沿 [实施记录](/Users/leslie/.codex/worktrees/benchmark-split-execution/maxwell-ai/docs/verification/2026-10-20-benchmark-split-execution.md)。核对 `commands/configuration_assets.go` 的资源 schema 与 `application/resourcecontent/content.go` 的 Metadata/ValidateReference，以及查询和候选冻结调用方，保留独立资产、旧私有资产的授权边界。
- Nextplay 分支位于上述工作区 `.tmp/nextplay-adapter`。核对 `maxwell-runtime/src/nextplay_runtime/cli.py` 的 run→封存顺序、`runner.py` 的 result/trial-evidence 写入和 status 查询；再对照 EVOLVE `integration/a2a/runtime_result.go` 的 v3 正式原件要求。终态应与封存成功一致，中断恢复不能重新执行题目。
- 可视化核对 Studio `TrialPresentation.tsx` 的 effect 依赖、`PresentationStore.close`，以及 `v3/catalog/RecordsPage.tsx`、`RunRecordStore.refresh` 的详情更新。应按不可变证据身份管理生命周期，不能因同内容的新响应对象清空阅读状态。

## 2026-10-21 专项审查修复入口

用户授权修复本页前述三个发现。实际修复、测试函数、回归结果及未验证项以 [实施记录的专项审查修复节](/Users/leslie/.codex/worktrees/benchmark-split-execution/maxwell-ai/docs/verification/2026-10-20-benchmark-split-execution.md#2026-10-21-专项审查修复) 为准；代码仍在两仓库独立分支，不能由本条推断已提交或发布。

**Why:** 修复读写契约需要同步生产者和共享消费者；将完成状态推迟到原件封存后，也必须覆盖封存前后异常、检查点后的状态写入失败和重复恢复。可视化应围绕不可变证据身份管理生命周期。

**How to apply:** 沿实施记录核对独立资源读取与候选冻结、同字节旧私有资产隔离、v3 原请求摘要和仅封存恢复、完成恢复不重写原件块，以及模块/资源身份的刷新连续性。数据库清单登记沿既有独立授权边界；真实数据库、双端运行和浏览器验收仍需单独取得证据。

## 2026-10-21 三条链路梳理与比较残留

用户要求按当前实现梳理 split 维护/单独运行/结果比较、业务可视化、preset 与模型替换。产品路径、实现边界沿 [实施记录](/Users/leslie/.codex/worktrees/benchmark-split-execution/maxwell-ai/docs/verification/2026-10-20-benchmark-split-execution.md) 及其链路梳理追加节核验，不由本条推断已部署。

**Why:** 共享比较 gate 使用规范化的测量预算，并不保证外层查询也沿用同一语义。选择来源审计和执行政策共用 JSON 字段时，比较整个 JSON 会把默认/显式修订或临时/命名选题的差异误作执行预算变化。本次通过临时 Go overlay 复现同实际题目、同 Judge、同测量预算仍出现预算差异警告；未修业务代码。

**How to apply:** 沿 EVOLVE `queries/compare_runs.go`、`application/comparison/gate.go` 和 `domain/evaluation/optimization_context.go` 核对所有消费方；补测不同选题入口解析到相同实际范围的完整查询结果，不能只检查共享 gate 或“接口无错误”。具体证据和当前待修项见实施记录；可视化专用范围与模型覆盖支持边界以当前前后端和 Adapter 源码为准。


## 2026-10-21 比较修复与整合核对入口

用户授权“修复 整合”，前节比较残留已进入修复与回归。最新代码基线、恢复依据和各项检查退出结果沿 [实施记录的整合节](/Users/leslie/.codex/worktrees/benchmark-split-execution/maxwell-ai/docs/verification/2026-10-20-benchmark-split-execution.md#2026-10-21-比较修复与最新-main-整合) 核验；本页历史条目的“未修”仅描述当次取证状态，不作为当前状态。

**Why:** 冻结预算内的选择/优化审计来源不改变实际测量条件，但规范化预算也不能替代题目、Judge 和 Variant 应用证明。工作分支整合到最新 main、提交后 CI、合并、环境迁移和真实双端验收是不同的证据层。

**How to apply:** 核对 `queries/compare_runs.go` 与共享比较 gate 是否都使用 `evaluation.MeasuringBudget`，并沿 `case_selection_test.go` 的完整查询回归验证：审计差异无误报，真实预算/题目/Judge 差异仍保留限制，缺少应用证明仍不可正式比较，冻结原文不被改写。再对照实施记录的两仓库基线和实际检查，不把任务分支对齐当成已发布；迁移清单登记仍沿独立授权处理，真实数据库/模型应用/浏览器验收须另行取得证据。


## 2026-10-21 整合后候选交接与再次运行复审

用户要求继续审查遗漏项。完整范围、两项候选交接 P1、一项再次运行 P2、合成复现及现有测试边界，沿 [实施记录最新复审节](/Users/leslie/.codex/worktrees/benchmark-split-execution/maxwell-ai/docs/verification/2026-10-20-benchmark-split-execution.md#2026-10-21-整合后完整复审与新增遗漏) 核验；本轮未修改业务实现，不由此前局部检查通过推断可合并。

**Why:** 冻结 Variant.resources 的 SP/Skill 改动必须真正进入 Adapter 的 typed Candidate；把新的 variantHash 回显到 receipt 不能代替实际资源生效。Runner 执行中物化与平台 ResourceProvider 预准备是不同协议。准备状态退出到编辑态，也必须重新触发能力核对，不能只清空 Store。

**How to apply:** 联查 EVOLVE `commands/optimization_candidate_run.go`、`optimization_candidate.go`、`run_target_state.go` 与 Nextplay `request.py`、`candidate.py` 的资源组包，再核对实际物化哈希及回执。前端沿 `DirectRunStore.startAgain` 和 `DirectBenchmarkRun` 的 inspect effect 检查 ready/failed/canceled 三类终态后的同执行器再次运行。后续回归必须越过“候选已创建”的边界；最小查询投影、Store 或合成组包测试不替代真实双端与浏览器验收。当前缺陷是否已修及迁移授权/CI 边界，以实施记录最新节和代码为准。
