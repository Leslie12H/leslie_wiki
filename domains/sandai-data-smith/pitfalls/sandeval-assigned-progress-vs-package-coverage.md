---
name: sandeval-assigned-progress-vs-package-coverage
type: pitfall
created: 2026-10-22
updated: 2026-10-22
tags: [sand-eval, assignment, progress, package-coverage]
links: [sandeval-space-membership-and-personal-distribution, sandeval-overview-handoff-scope-mismatch]
---

# 已派答题卡完成率与整包应交范围

**Why:** 空间列表的标注完成率、人员批次进度和供应商整包完整性可能采用不同范围。已派答题卡全部完成，不能证明来源任务的每个应交工作项都已派出并进入送审包；质检通过也只证明本次质检覆盖范围通过。数量相等前，还须核对工作项集合。任务状态与包控制状态彼此独立，终止中或已终止的数据包仍可能保留 active 任务状态。

**How to apply:** 先固定任务与部署版本，对齐来源下发计划、冻结题包、实际派题卡、正式答案及质检包成员。用原生 `check_completeness` 获取应交、已交、缺失、范围外及重复集合，再按稳定工作项 ID 将缺失成员映射回未派题。分开解释“已派完成率”和“完整包覆盖率”；已有答案与质检记录应保留，补派或恢复须走真实权限和流程，不能靠改状态或放开交接按钮消除缺失。完整应交范围无法证明时显示“进度待核对”，不得退回已派卡分母；补派告警须同时核对任务与包控制状态，操作入口还须核对派题权限，不能仅凭任务 active 催促已终止的包继续派题。

## 2026-10-22 核验入口

- [只读取证报告](/Users/leslie/Documents/Playground/output/sandeval-wuzijie-package-20261022/report.md)：本次截图任务、生产部署、不同 Pod 独立回读、冻结题包及缺失工作项逐项映射。现场数量与状态仅查该报告和原始证据，后续重新读取，不把历史快照当作当前结果。
- 以下源码链接固定到本次生产提交；后续行为须重新对齐部署。
  - [空间列表](https://github.com/world-sim-dev/sandai-data-smith/blob/fe75ee2dc4aa6825864f626f139f8cea8371b7a1/sand-eval/platform/frontend/src/pages/mySpaceTasks/SpaceTaskListPage.tsx)：核对完成率分子、分母，以及“未派题”提示是否只覆盖零派题，遗漏部分派题。
  - [列表计数仓储](https://github.com/world-sim-dev/sandai-data-smith/blob/fe75ee2dc4aa6825864f626f139f8cea8371b7a1/sand-eval/platform/backend/app/repositories/my_space_tasks.py)：核对空间成员派题卡计数与正式答案聚合，避免将答案版本数当成题数。
  - [完整应交工作项](https://github.com/world-sim-dev/sandai-data-smith/blob/fe75ee2dc4aa6825864f626f139f8cea8371b7a1/sand-eval/platform/backend/app/services/facts/task_assignments.py)：核对来源完整范围是否保留未派题，以及稳定工作项 ID 的生成规则。
  - [供应商整包聚合](https://github.com/world-sim-dev/sandai-data-smith/blob/fe75ee2dc4aa6825864f626f139f8cea8371b7a1/sand-eval/platform/backend/quality/application/management/aggregation_service.py)：核对完整性检查与包生成阻断，区分人员批次通过和整包可交接。
  - [包详情](https://github.com/world-sim-dev/sandai-data-smith/blob/fe75ee2dc4aa6825864f626f139f8cea8371b7a1/sand-eval/platform/frontend/src/pages/quality/management/PackageDetail.tsx)：核对标题“条答案”是否实际绑定应交数，不能仅凭文案认定已有相同数量的答案。

## 2026-10-22 实现与验收指针

- [main PR #2757](https://github.com/world-sim-dev/sandai-data-smith/pull/2757)：整包标注口径、未知范围展示、列表和详情补派引导的实现及回归入口。完整 Platform Gate、合并与部署分别沿 PR 和发布回执核验；提出 PR 不代表 Gate 通过或已经上线。

相关：[个人派题核验](sandeval-space-membership-and-personal-distribution.md)、[概览与交接范围](sandeval-overview-handoff-scope-mismatch.md)。
