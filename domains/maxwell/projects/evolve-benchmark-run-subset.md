---
name: evolve-benchmark-run-subset
type: project
created: 2026-10-19
updated: 2026-10-19
tags: [maxwell, evolve, benchmark, subset, tuning, langsmith]
links: [evolve-candidate-loop-decision-boundaries, evolve-conversation-tuning-workspace-plan, evolve-nextplay-ten-case-acceptance-20261015]
---

# Benchmark 选择部分题目评测与调优

2026-10-19 用户要求评测与调优都支持从 65 题中自选 10 题，先提交具体实现、接口与数据库变更清单，并参考 LangSmith 的实现与管理方式。最初概念建议由[原方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-subset-plan-20261019/proposal.md)细化；随后经下文精简复审并获准实施。当前实现、验证与未执行范围以文末实施记录为准，原方案保留为历史审查输入。

**Why:** 临时选题需要保留来源 Benchmark 和实际冻结范围；仅按题数比较会把不同题目或不同评分的结果混在一起。评分计划也绑定 CaseSet，不能只缩短题集。已有评测可作调优来源，但隔离 Runner 仍可能要求在准备快照上建立自己的比较基线。

**How to apply:** 单纯评测只创建所选范围的一次 Run；调优继承或明确重选范围，并区分来源结果和实际可用基线。候选、比较和正式决策共用范围与应用证据检查；未选题不记零、不算失败，子集不冒充全量验收。用户进一步明确常用子集须从一开始设计清楚；精简后首版保留 CaseSet 来源绑定、命名修订、成员编辑、历史、归档与恢复，以及明确的跨版本重选；并集、自动兼容修订与随机抽样未纳入。具体接口和结构以精简方案及实施记录为准。

LangSmith 官方资料入口：
- [UI 中管理数据集](https://docs.langchain.com/langsmith/manage-datasets-in-application)：样本选择、Split 管理及筛选。
- [读取指定样本](https://docs.langchain.com/langsmith/manage-datasets-programmatically)：example_ids 与 metadata 过滤。
- [版本和子集评测](https://docs.langchain.com/langsmith/manage-datasets)：特定版本、Split 或过滤结果作为评测输入。
- [公开 Client](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/client.py)：list_dataset_splits 的 as_of 及按 split_name 添加／移除 example_ids 的公开协议。
- [评测 SDK](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/evaluation/_runner.py)：Example.metadata.dataset_split 的读取与实验元数据；不据此推断服务端数据库。
- [比较](https://docs.langchain.com/langsmith/compare-experiment-results)及[Chat](https://docs.langchain.com/langsmith/chat)：逐题分析与 Prompt 迭代入口。

代码核对入口均在 Maxwell 的 services/evolve-server/internal/modules/evolve/application 下：commands/direct_run.go、run.go、candidate_validation.go、runner_tuning_run.go、benchmark_result.go；对应来源、计划绑定、基线复用和正式结果门禁。HTTP 路由见 internal/app/transport/http/business_runs.go。后续实施先重读当前源码，不将本页当作已上线事实。

最初接口与结构方案曾待确认，后续授权见下文。正式 SPEC 配置指向的 /Users/shatang/Project/nexus-os/doc-hub 在本机不可用，本地方案不替代该处正式执行包。

## 2026-10-19 过度设计复审

用户要求继续 review，强调清晰、简洁和有效。本轮沿现有 CaseSet 修订、冻结 Run、材料采用与 Runner 策略存储核对，发现独立范围身份、重复关系投影及自动兼容修订选择增加了不必要成本。当前推荐以[精简复审与替代清单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-subset-plan-20261019/review.md)为准，原 proposal.md 保留为审查输入；精简版本随后获得实施确认，见下一节。

**Why:** 现有 CaseSet 已保存成员及版本，Run 已固定实际题集与评分产物；新增身份系统不能替代必要的来源关联。

**How to apply:** 常用子集的创建、成员修改、历史与归档保留首版；复用 CaseSet 和既有 Work.policy_json，来源字段与迁移清单查精简方案。特别核对选中根的材料采用及 Runner 准备更新是否保留固定输入，不能只减少表就宣称链路闭环。具体审查位置、接口及结构取舍存复审文件，不在知识库复制易变清单。

## 2026-10-19 精简方案获准实施与 Review

用户明确授权接口变更、三个可空字段的迁移文件及首版完整常用子集管理，同时禁止执行环境迁移和发布。实现位于 `/Users/leslie/.codex/worktrees/benchmark-case-selection/maxwell-ai`，基于开始实施时原工作区的有效源码隔离本功能增量。当前代码、完整影响面 Review、测试边界、专用补丁与源码哈希清单统一查[实施记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-subset-plan-20261019/implementation.md)。该记录不代表已上线；业务代码未提交，环境迁移及真实外部评分未执行。

**Why:** 选题必须同时冻结实际题集与绑定评分计划；来源 Run 不能替代重选后或新 Runner 准备后的实际基线。仅有 Run 元数据读取权也不代表可以读取其完整输入和隐藏证据谱系。

**How to apply:** 复用 CaseSet 精确修订、已有实际产物引用和 Work 策略固定输入；比较与正式决策先授权实际输入/证据，再核对有效题目、评分及执行条件。未知提交保留原精确选择与请求键；内容寻址竞争恢复必须授权重读且有界。常用子集历史标签按精确修订保存，不自动采用当前名称。代码、模拟评分与假 API 浏览器验收分别记录，不能替代 PostgreSQL、真实对象存储和自然 Agent 环境验证。
