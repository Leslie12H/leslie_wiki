---
name: evolve-benchmark-run-subset
type: project
created: 2026-10-19
updated: 2026-10-19
tags: [maxwell, evolve, benchmark, subset, tuning, langsmith]
links: [evolve-candidate-loop-decision-boundaries, evolve-conversation-tuning-workspace-plan, evolve-nextplay-ten-case-acceptance-20261015]
---

# Benchmark 选择部分题目评测与调优

2026-10-19 用户要求评测与调优都支持从 65 题中自选 10 题，先提交具体实现、接口与数据库变更清单，并参考 LangSmith 的实现与管理方式。此前概念建议由本轮[待确认方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-subset-plan-20261019/proposal.md)细化；具体字段、存储、兼容、回滚及验收以该方案为准。业务代码、DDL、环境发布及真实评测未在本轮执行。

**Why:** 临时选题需要保留来源 Benchmark 和实际冻结范围；仅按题数比较会把不同题目或不同评分的结果混在一起。评分计划也绑定 CaseSet，不能只缩短题集。已有评测可作调优来源，但隔离 Runner 仍可能要求在准备快照上建立自己的比较基线。

**How to apply:** 单纯评测只创建所选范围的一次 Run；调优继承或明确重选范围，并区分来源结果和实际可用基线。候选、比较和正式决策共用范围与应用证据检查；未选题不记零、不算失败，子集不冒充全量验收。用户进一步明确常用子集须从一开始设计清楚；待确认方案将其纳入首版管理，覆盖基于 CaseSet 的来源绑定、命名修订、并集去重、归档、父 Benchmark 升级及历史引用。具体接口和结构以待确认方案为准，随机抽样仍未纳入。

LangSmith 官方资料入口：
- [UI 中管理数据集](https://docs.langchain.com/langsmith/manage-datasets-in-application)：样本选择、Split 管理及筛选。
- [读取指定样本](https://docs.langchain.com/langsmith/manage-datasets-programmatically)：example_ids 与 metadata 过滤。
- [版本和子集评测](https://docs.langchain.com/langsmith/manage-datasets)：特定版本、Split 或过滤结果作为评测输入。
- [公开 Client](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/client.py)：list_dataset_splits 的 as_of 及按 split_name 添加／移除 example_ids 的公开协议。
- [评测 SDK](https://github.com/langchain-ai/langsmith-sdk/blob/main/python/langsmith/evaluation/_runner.py)：Example.metadata.dataset_split 的读取与实验元数据；不据此推断服务端数据库。
- [比较](https://docs.langchain.com/langsmith/compare-experiment-results)及[Chat](https://docs.langchain.com/langsmith/chat)：逐题分析与 Prompt 迭代入口。

代码核对入口均在 Maxwell 的 services/evolve-server/internal/modules/evolve/application 下：commands/direct_run.go、run.go、candidate_validation.go、runner_tuning_run.go、benchmark_result.go；对应来源、计划绑定、基线复用和正式结果门禁。HTTP 路由见 internal/app/transport/http/business_runs.go。后续实施先重读当前源码，不将本页当作已上线事实。

接口与结构变更仍待用户确认。正式 SPEC 配置指向的 /Users/shatang/Project/nexus-os/doc-hub 在本机不可用，本地方案不替代该处正式执行包。

## 2026-10-19 过度设计复审

用户要求继续 review，强调清晰、简洁和有效。本轮沿现有 CaseSet 修订、冻结 Run、材料采用与 Runner 策略存储核对，发现独立范围身份、重复关系投影及自动兼容修订选择增加了不必要成本。当前推荐以[精简复审与替代清单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-benchmark-subset-plan-20261019/review.md)为准，原 proposal.md 保留为审查输入，两版均未获得实施确认。

**Why:** 现有 CaseSet 已保存成员及版本，Run 已固定实际题集与评分产物；新增身份系统不能替代必要的来源关联。

**How to apply:** 常用子集的创建、成员修改、历史与归档保留首版；复用 CaseSet 和既有 Work.policy_json，来源字段与迁移清单查精简方案。特别核对选中根的材料采用及 Runner 准备更新是否保留固定输入，不能只减少表就宣称链路闭环。具体审查位置、接口及结构取舍存复审文件，不在知识库复制易变清单。
