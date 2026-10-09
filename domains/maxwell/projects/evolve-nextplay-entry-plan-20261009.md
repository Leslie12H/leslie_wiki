---
name: evolve-nextplay-entry-plan-20261009
type: project
created: 2026-10-09
updated: 2026-10-09
tags: [maxwell, evolve, nextplay, interaction, judge, import]
links: [nextplay-benchmark-import-audit-20260915, evolve-runtime-judge-review-20260916, evolve-design-review-self-iteration-20261009]
---

# EVOLVE 通用工作台与 Nextplay 接入方案

完整问题、三阶段方案、验收与契约评审范围见[本轮方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-nextplay-integration-plan-20261009.md)。2026-10-09 为设计方案，未实现、未执行真实评测、未部署。源码锚点及线上只读页面范围均在方案开头；不可将线上页面与本地 main 默认视为同一部署版本。

**Why:** 用户明确纠正：EVOLVE 是通用平台，从零生成 Case 与接入已有 Case 同等重要，Nextplay 只是一个业务。原方案把导入主线误设为平台主线，已在原文修正。Case 和评分方式分别支持生成、导入和复用，并在同一工作台混合使用；业务紧急需求不改变平台定位。发布与回滚后置。

**How to apply:**

- 先核对方案第 1 节的线上页面观察与 Studio 当前源码；向导完成状态、评分方法类别、Work 前置与首次启动是否连成一条路径，不能只看单页完成标记。
- 从 Nextplay `evaluation/judge.py` 的工厂、`agentic_judge.py`、`judge_bundle.py` 与 `composite.py` 确认当前真实评分实现，再看 `evolve/export.py`；不要从旧 exporter 推断现有 Judge 仍是普通 rubric。
- 从 EVOLVE `ports/judge_aggregate.go` 与 `evaluation/judge_provider_method.go` 对照协议声明和实际执行链路，分别验证浮点、聚合责任、逐项 incomplete、原 overall verdict 是否保留。
- 数据数量、split、执行和评分状态会变化，应重新读源 manifest 和实际报告；本轮清单统计不代表执行通过。开发反馈与最终测试用途在迭代前明确，不能静默改源标签和可见性。
- Nextplay 接入场景沿用原 Runner/Judge 包接通可运行闭环；托管包入口的依赖、取消、幂等、证据与结果读取需要独立验收，不能把历史评审方案称为已有能力。
- 实施前按项目规则提交完整 API/结果协议及必要表结构、配置变更清单；现阶段方案不构成具体接口或 DDL 的实施批准。

## 2026-10-09 用户评审纠正

通用平台的交互和一期验收以[修订方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-nextplay-integration-plan-20261009.md)第 1 节及实施顺序为准。从零生成、已有资产接入、混合使用同等验收；Case 来源与评分方式来源独立组合。生成能力不能被降为事后辅助，评测包和试跑也不能成为所有任务的强制起点。Nextplay 源码发现只作为该接入场景的依据。
