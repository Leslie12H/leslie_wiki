---
name: evolve-benchmark-unified-plan-review
type: reference
created: 2026-10-20
updated: 2026-10-22
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


## 2026-10-21 候选交接与再次运行修复入口

用户授权修复前节的两项 P1 和一项 P2。实际实现、内部 v3 增量、最终测试与未完成边界沿 [实施记录最新修复节](/Users/leslie/.codex/worktrees/benchmark-split-execution/maxwell-ai/docs/verification/2026-10-20-benchmark-split-execution.md#2026-10-21-候选交接与再次运行修复) 核验；前节为修复前审查，不作为当前未修状态。

**Why:** 冻结资源正文必须经授权和哈希校验送入 Adapter，实际回读证明不能来自请求回显。来源配置和复制时会重生成的 Skill 管理元数据需要保留原件，但不能混作可执行资源或要求临时元数据逐字相同。修正新请求的准备职责时，也要保留历史 Run 的原始恢复策略。

**How to apply:** 联查 EVOLVE `evaluation/runner_resources.go`、`execution/contract.go`、`runner_result.go`、`commands/optimization_candidate_run.go` 与 Nextplay `configuration_resources.py`、materializer 的实际 Prompt/Skill 回读。验证正文不改冻结 Variant、总大小限制、缺件/篡改/裸 CAS 拒绝、只读元数据、源配置不改、临时资源清理，以及准备 ready/failed/canceled 后的同执行器再次运行。内部 v3 增量需双端部署；本地合成依赖测试、远程 CI、环境 DDL 和真实业务闭环仍分别核验，不把知识库录入当作发布。


## 2026-10-21 最终复审与配套 PR 入口

用户要求继续复审、无问题后发起 PR，并明确同意“仅登记清单并发起 PR，不执行迁移或部署”。本轮评审入口为 [Maxwell PR #381](https://github.com/world-sim-dev/maxwell-ai/pull/381) 与 [Nextplay Adapter PR #24](https://github.com/world-sim-dev/nextplay-eval/pull/24)；最新代码、CI 和合并状态沿 PR 核验。最终影响面矩阵及本地测试证据见 Maxwell PR 中的 `docs/verification/2026-10-20-benchmark-split-execution.md` 最新节。

**Why:** 仅保存迁移文件与登记后续部署执行清单是不同的授权范围；同意发起 PR 也不等于同意环境 DDL、部署或合并。内部 v3 两端需要共同核验，单独发布平台代码不能证明目标端已支持模型或 SP/Skill 应用。

**How to apply:** 复查 0045 SQL 只放宽两个已有 CHECK，以及部署 action 和迁移 Job 各一行登记；实际迁移前另核验环境和授权。复审或接续时同时读取两个 PR 的具体提交与检查，确认 v3 显式启用、模型/资源实际回读和原件封存完成时序；真实 Postgres、双端部署与普通用户浏览器验收分别记录，不把技术测试、PR 创建或 mergeable 当作业务发布完成。

## 2026-10-21 合并、dev 发布与 JSON 文件协商验收

用户明确授权合并、部署并开始验证。两端来源沿 [Maxwell #381](https://github.com/world-sim-dev/maxwell-ai/pull/381) 与 [Nextplay #24](https://github.com/world-sim-dev/nextplay-eval/pull/24)；首次 dev Web、EVOLVE API/Worker 和 0045 的真实发布回执沿 [工作流 39557759118](https://github.com/world-sim-dev/maxwell-ai/actions/runs/39557759118)。0045 回执与已应用迁移分别核对，不能将迁移清单登记当作环境执行证明。Adapter 必须同步实际在线 Skill/SP，保留原 runtime.env，不部署无关 eval-service。

**Why:** 小范围 split 的真实准备暴露 A2A 文件容量不一致：平台按最大可能请求判断远端能力，测试桩又跟随该常量，遗漏实际 Agent 的较小容量。准备接纳、派发确认、Run、评分和业务视图仍是不同证据层；缺少远端身份的未知请求不能自动重新执行。dev 还可能有其他发布同时推进，页面读取失败不能直接归因于本次实现。

**How to apply:** 沿 [修复 PR #382](https://github.com/world-sim-dev/maxwell-ai/pull/382) 和其中 `docs/verification/2026-10-21-benchmark-json-file-negotiation.md` 核对协商实际文件容量、两端上限、超限零派发及真实依赖一致性测试；沿远端 PR/工作流查当前合并和部署状态。真实验收的凭据、导出包、原请求和页面证据仅保留本地 `.tmp/benchmark-release-20261021/`，不要提交或在知识库复制回执正文。验证需要核对实际 Preset/模型回读、split 已冻结修订、封存原件和最终评分；未知准备、连接检查通过或技术测试通过都不构成业务闭环通过。

### 2026-10-21 补丁发布与受阻准备的接续

容量协商补丁和实际 dev rollout 沿 [PR #382](https://github.com/world-sim-dev/maxwell-ai/pull/382) 及 [工作流 39562288696](https://github.com/world-sim-dev/maxwell-ai/actions/runs/39562288696) 核对。本轮事实、前后 SHA、真实技术 Thread、split r2/旧请求 r1 的回读以及未完成项，沿本地工作区 `.tmp/benchmark-release-20261021/report.md` 与 `release-verification.json` 接续；这些文件含真实运行身份，不复制到知识库或 PR。

**Why:** 远端配置捕获 ready 仍需平台逐份读取并校验原件，才能建立正式 Run；包装 Agent 所用模型也不能替代被测模型生效证明。本轮平台原件读入与授权可用性受阻，尚无正式 Run/分数，不能因为修复已发布或准备任务完成而宣布业务闭环通过。

**How to apply:** 先保留原请求、冻结 split 和已捕获资源，定位授权服务及具体资源读取错误，再恢复同一准备。不要重新派发未知 v4 请求，或把不同 Benchmark/Case 修订的独立试验作正式 A/B。最终模型、原件封存、清理、分数与业务视图须分别取得真实回执。


## 2026-10-21 配置准备恢复与 Split 可见入口

用户要求先修复配置原件/授权阻断，再验证模型、评分与业务视图，并指出 split 配置不可见。实现与检查沿 [PR #383](https://github.com/world-sim-dev/maxwell-ai/pull/383) 及其 `docs/verification/2026-10-21-benchmark-preparation-recovery.md` 核验；发布和验收状态沿 PR/工作流及本地忽略目录继续确认。

**Why:** 远端捕获完成后，平台仍需独立读入每份原件。单步骤截止与整包从头重试叠加会阻碍真实大配置完成；不同文件正文相同时，内容寻址去重也要求父引用去重。准备状态页代替原运行表单后，藏在运行表单内的 split 入口不易发现。

**How to apply:** 沿 `commands/direct_preparation.go` 核对独立回执固定、紧凑资源引用 checkpoint、分步接续和原任务零重发；保持现有 JSON 大小、权限、完整性、租约和取消边界。沿 `direct_run.go` 核对重复正文保留所有路径但去重父引用。沿 Benchmark 的 Split 页签与 CaseSelectionStore 生命周期核对当前/历史修订维护和运行冻结展示。授权错误需要关联实时账号查询和调用方截止，不将上下文取消直接认定为底层数据库根因，也不以放宽鉴权掩盖故障。真实模型回读、最终评分、原件/业务视图和清理仍须取得端到端证据。

## 2026-10-21 Split 成员管理交互修正

- **Why:** 用户反馈 Split 入口应直接查看和编辑成员，不能仅移植运行表单及名称列表。
- **How to apply:** 核对分支 `codex/benchmark-split-members` 及 `docs/verification/2026-10-21-benchmark-split-members.md`；查看成员、新建选题、增删题目、历史修订和运行传递须分别验证。界面合成预览不代表真实 Run 或业务验收通过，发布状态沿 PR 查证。
- **参考入口:** [LangSmith 官方 Split UI](https://docs.langchain.com/langsmith/manage-datasets-in-application#create-and-manage-dataset-splits)。业务原件读取沿 Maxwell 的 `a2a/runtime_result.go` 和 Agent Runtime `application/thread_files.go` 核对；排障用 Workbench 上传与业务文件通道分开取证。

## 2026-10-21 集中闭环与编排大正文排查

用户要求停止逐个症状向 main 合并，先在同一分支查清完整链路并完成真实验收，再统一 PR。当前证据、代码和未完成项沿分支 `codex/benchmark-runtime-closure` 的 [集中验收记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/.tmp/auth-account-pool-observation-20261021/docs/verification/2026-10-21-benchmark-runtime-closure.md) 接续，不由历史 PR 的合并或诊断发布推断已闭环。

**Why:** 配置准备完成、正式 Run 创建和题目实际执行是不同边界。真实单题暴露了 JSON 附件进入 Runtime 命令后的 Temporal/gRPC 大小限制；Task 命令内重复携带消息会进一步放大正文。同时 A2A REST SDK 对 JSON MIME 的兼容遗漏会将服务端失败压成笼统错误，数据库里的短错误不足以定位根因。共享 Benchmark 草稿和 React 延迟 updater 还会让独立编辑、变更预览出现错误，但不能据此推断已保存的 CaseSet 成员被改写。

**How to apply:** 从验收记录核对 HTTP Trace、同 Pod 时间窗、精确 Attempt 的只读回查及真实模型/分数/业务产物；先确认错误发生在哪个传输和接纳边界，再修复。沿 Runtime `application/task_commands.go`、`durable_commands.go`、`infrastructure/temporalruntime/client.go` 查命令及回执两方向的大正文，保持原始 user.action、接纳事务、幂等与 Worker 恢复；不要只抬传输上限或将仅供 Inbox 的附件规范化前移后覆盖历史原件。沿 EVOLVE `integration/a2a/registry.go` 与 SDK REST 错误解码核对 MIME、分类和禁重派，不直接展示未经脱敏的错误原文。单题、10 题 Split、完整基线依次验收，Preset/模型执行回执仍需与实际 Provider 请求分开核对。


## 2026-10-21 共同题集比较与来源展示入口

用户确认最小可选交集比较扩展，并将 Preset/Adapter 灵活性交由另一会话处理。接口、实现、真实数据与未验收项沿上述集中验收记录的「共同题集比较与来源投影」及「闭环验收清单」接续；不要根据知识库推断分支已发布或已经取得65/10题评分。

**Why:** 完整Benchmark与Split的整体均值覆盖不同样本，不能直接显示改善差值；缺失与错误样本也不能补零。来源元数据若未进入全局列表的查询投影，已有Benchmark子集可能被误标为独立评测，前端增加标签不足以修复。

**How to apply:** 沿 EVOLVE `queries/run_intersection.go` 核对稳定资产身份、行为指纹、冻结评分定义、逐Run授权与每侧自身Variant证明；核对同指标有效样本集合后才显示差值。原strict与候选采用保持独立。沿 PostgreSQL `run_overview.go` 及Studio来源读取核对selection过滤/投影，保持分页前授权与计数。页面设计沿本机 `benchmark-closure-design-20261021/design-spec.md` 及用户选定记录，不把预览占位当真实评分，也不重复另一会话负责的Preset工作。


## 2026-10-21 统一 PR 与正式组件验证入口

集中实现与交付沿 [Maxwell PR #387](https://github.com/world-sim-dev/maxwell-ai/pull/387) 及其中 `docs/verification/2026-10-21-benchmark-runtime-closure.md` 的最终复审矩阵、技术截图和真实验收边界查证。用户选择 B 总体布局加 C 业务评分/平台采集分区，并授权后续自主决策、统一准备 PR；不得由本页推断已合并、部署或取得新评分。

**Why:** 指标来源（业务评分/平台采集）与运行范围（完整/Split/临时选题）是两条独立维度，只换名称无法提供可读成员与比较。生成题集保存输入生产 Method provenance，手工子集投影可能没有同一来源；这不等于共同题的实际评分方法改变。异步名称映射还需要视图订阅，任务摘要不能替代原始需求。

**How to apply:** 核对 Split 目录/冻结成员/修订检查器、当前与历史修订运行传递、来源查询在分页前的过滤和授权。共同题集仅在共同 Case 行为、有效评分 binding/Outcome 及每侧自身执行证明一致后归一临时输入生产来源；严格整集和候选门禁保持各自语义。沿 PR 里的真实生产组件合成 fixture 证据核对窄屏、加载/失败、冻结规则和门槛编辑，但单题、Split、完整基线、模型生效与业务产物仍需独立真实验收。Preset/Adapter 灵活性由用户指定的另一会话处理，接续时先查其成果，避免重复配置或覆盖共享 dev。

## 2026-10-21 PR 后复审与生命周期补测入口

用户要求完成后继续 review 并修复。范围、修复和技术证据沿 [PR #387](https://github.com/world-sim-dev/maxwell-ai/pull/387) 的验收记录「PR #387 完成后的独立复审与修复」核验；当前 CI、发布和真实取分状态仍从 PR 与实际环境读取，不由知识库断言完成。

**Why:** 接纳成功后的大回执读取若再次依赖活跃 Thread，后续删除可能把成功误报为失败；私有正文引用自身携带的 Business 也不能充当授权。检查器的静态截图可读，不代表长列表或堆叠布局下点击后看得见、焦点能回来。内存替身不能证明 JSONB 原文字节及实际 CAS 行为。

**How to apply:** 沿 Runtime `durable_commands.go` 核对接纳前真实归属快照、临时读取恢复、跨业务引用拒绝和无 Thread 的 inline 清理；命令接纳与已提交回执采用各自正确的生命周期边界。沿 Studio 三处检查器核对挂载聚焦、离屏滚动、同项重复点击和关闭返回。实际 PostgreSQL 验证使用隔离临时数据库，检查 JSONB/TOAST、响应丢失、并发 CAS 和重建；正式组件点击使用全新浏览器技术 fixture，不能将这些证据替代真实模型、评分或业务产物验收。

## 2026-10-21 一句话合并说明与 dev 验收入口

用户明确要求 PR 描述和合并说明均只有一句话；实际 PR、squash 提交和后续发布沿 [PR #387](https://github.com/world-sim-dev/maxwell-ai/pull/387)、[合并提交](https://github.com/world-sim-dev/maxwell-ai/commit/8e54238dccf3e5dd64855a28750e00f73579aa96) 与 [dev 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/39623189428) 核对，浏览器回读及未验收项在本地 `.tmp/pr387-merge-acceptance-20261021.md` 接续。

**Why:** squash 的默认正文可能拼接分支所有提交说明；PR 描述压缩不能自动保证合并通知同样简短。合并与部署又是不同动作，不能把 main 已包含代码当作用户页面已更新。

**How to apply:** 先压缩 PR body，再以 expected head SHA 合并，用一句话 commit title 和显式空 commit message，独立读取最终提交全文确认没有自动追加正文；测试详情保留在现有验收记录。发布锁定实际 main SHA，沿标准 Worker→API→Evolve→Web 顺序且按本轮范围关闭迁移，分别核对真实 poller、镜像和 Web build ID，再检查 Split 成员/修订、指标来源和目录行为。保留原十题 Split 和历史请求，用独立资产做编辑验收；真实模型、取分与大批量运行仍需各自证据。


## 2026-10-22 目录恢复与 Split 来源版本运行

本轮代码、测试与边界沿 [PR #388](https://github.com/world-sim-dev/maxwell-ai/pull/388) 及 `docs/verification/2026-10-22-benchmark-entry-recovery.md` 核验；真实完整题集的目录恢复与浏览器证据仅在同工作树 `.tmp/benchmark-entry-acceptance-20261022.md` 接续。合并、部署和评分完成均须从实际状态独立确认。

**Why:** 详情可读不等于默认目录可发现：目录可能隐藏已归档对象。草稿恢复也不应隐含打开编辑器；跨版本展示的 Split 若主入口只禁用，会把来源版本切换成本留给用户。真实登录回调还可能固定返回已部署站点，不能由企业登录成功推断本机分支已验收。

**How to apply:** 先核对业务、筛选与目录状态，经现有精确恢复/CAS入口处理，保留题目与历史。编辑内容在后台恢复，显式编辑/限定目标的一次性管理返回才打开。Split 主入口明确切到来源版本，带精确资产与可选历史修订；分页外仍读现有资产 head 核归档状态，非法历史定位拒绝降级，未知运行请求不覆盖。技术合成组件、真实目录操作和实际运行取分分别验收；不为可发现性追加全表扫描或逐行下载正文。


## 2026-10-22 PR #388 完整复审与旧回归遗漏

用户再次要求 review，本轮只读完整差异与调用链，未修改业务实现；范围与命令结果见本地 `.tmp/pr388-review-20261022.md` 和 `.tmp/pr388-review-benchmark-tests-20261022.json`，代码/后续修复沿 [PR #388](https://github.com/world-sim-dev/maxwell-ai/pull/388) 查证，不能把本条当成永久未修状态。

**Why:** 改变草稿隐藏语义时，新测试可通过但相邻旧测试仍可能坚持旧语义；默认 CI 的成功也不能证明未纳入入口的领域回归已执行。

**How to apply:** 修改 Store 的生命周期方法后，检索所有调用方与测试断言；发现遗漏时扩展到相关模块现有测试，区分真实实现缺陷、过期断言与未覆盖验收。重点沿 `SharedBenchmarkEditorStore.suspend`、`benchmarkPolicyEditing.test.mjs` 和新 entry 生命周期测试核对：路由退出隐藏视图，保存/未知请求身份继续保留，界面关闭操作仍受保存状态保护。生产回归修复与 CI 覆盖扩大分别论证，不通过恢复错误交互让旧断言变绿。
