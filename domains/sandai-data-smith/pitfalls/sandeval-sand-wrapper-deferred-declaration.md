---
name: sandeval-sand-wrapper-deferred-declaration
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [sand-eval, reinspection, deferred, submission, recovery]
links: [sandeval-completed-review-followup-round]
---

# Sand 包装送审须沿子批次核对待定声明

**Why:** 2026-10-19 的单例取证发现，整改子批次已冻结合法待定工作项并排除其正式答案，Sand 包装送审却未传播该声明。只看包装层，原生复验映射会将它解释为遗漏原工作项。不能因此清除原样本、修改已冻结历史或直接把处置改为通过。

**How to apply:** 对齐原送审、Sand 后继、其唯一子批次、原始与当前稳定 work_unit_id 全集及冻结 annotation_deferred_work_unit_ids。只有缺失集合精确等于已有合法待定声明、当前七项来源和原责任仍有效时，才能在明确单例授权与摘要锁定的 operator 路径传入原生排除参数并续做原请求。保留所有原生授权、来源、责任、版本与派单校验。无证据或有其他缺项时停止；不得把单例恢复脚本扩成任意缺项豁免。

## 核验入口

- 原生服务：quality/application/management/reinspection_service.py 的 validate_target、_mapping、_create；reinspection_sampling.py 的 rejected_lineage_members；aggregation_service.py 的 Sand 包装送审与子批次关系。源码可能变化，使用当次部署版本核验。
- [2026-10-19 单例报告与可审计脚本](/Users/leslie/Documents/Playground/sandeval-reinspection-20261019/report.md)：确切目标、部署、dry-run/apply 摘要、原生回执和独立 Pod 回读；实际状态以实时页面与正式检查任务为准。
- 单例恢复不证明产品缺陷已修复；本次未部署产品代码。检查执行快照与实际任务投影的差异可参考 [已检完却显示新一轮零进度](sandeval-completed-review-followup-round.md)。


## 根因与覆盖断点（2026-10-19）

**Why:** 聚合层按整包规则快照创建 Sand 包装，实际成员却从冻结子批次展开；复验只从外层策略字段取待定声明，成员与排除依据来源不一致。2026-10-14 整改待定改动覆盖了标注子批次与其直接复验，既有实际派单回归的 fixture 使用 SPACE_QC，没有经过完整包和 Sand 包装，因此不能验证跨层证据传播。

**How to apply:** 用部署 commit 对齐生产源码，做同一原生映射的只读对照：外层空声明失败、唯一冻结子批次精确声明成功；核对缺失集合与合法声明完全相等。修复应统一冻结成员与排除证据解析，补跨完整包、Sand 包装、自动/手动复验及旧请求重试回归，保留未声明缺失的拒绝。本次是单例恢复，不代表全局产品缺陷已修改或发布。

- [详细根因、北京时间线、部署源码副本及只读对照](/Users/leslie/Documents/Playground/sandeval-reinspection-20261019/root-cause.md)。版本、对象、日志和当前状态只在原始证据与实时回读中核验，不从本页推断。


## 修复与影响复审入口（2026-10-19）

**Why:** 修复包装证据读取时，若把新加的全部祖先凭证核验无差别用于个人 SPACE_QC 复验，会让原来有效的已发布声明因更早历史凭证缺失而新增阻断；公共成员读取若默认展开历史，也会扩大查询成本。

**How to apply:** 包装复验和单批回交显式解析、核验冻结子批次证据；直接个人复验保留原契约，普通 execution_items 不开启待定历史读取。测试应覆盖外层伪造声明无效、未声明缺失拒绝、个人历史兼容、普通读取不增加凭证查询和真实完整链路。没有冻结依据的包装仍阻断，不能承诺自动修复全部历史缺口。

- 修复与 Review 指针：[测试 PR #2637](https://github.com/world-sim-dev/sandai-data-smith/pull/2637)、[开发分支直接向 main 的 PR #2641](https://github.com/world-sim-dev/sandai-data-smith/pull/2641)、[本机影响 Review 与验证入口](/Users/leslie/Documents/Playground/sandeval-reinspection-20261019/review.md)。main PR 于 2026-10-19 按明确要求发起，测试环境未验收的事实已写入正文；最终代码、Gate、可合并性和发布状态分别实时核验。
- 测试集成分支与 main 有无关分歧时，任务分支仍来自 main，只将本任务原始提交送入测试 PR；独立完整 Gate 不能代替最终测试合并树的 Gate 和环境验收。
