---
name: evolve-benchmark-unified-plan-review
type: reference
created: 2026-10-20
updated: 2026-10-20
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
