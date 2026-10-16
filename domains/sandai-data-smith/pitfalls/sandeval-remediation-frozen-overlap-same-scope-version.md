---
name: sandeval-remediation-frozen-overlap-same-scope-version
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sand-eval, quality, remediation, package, scope, duplicate]
links: [sandeval-handoff-duplicate-scope, sandeval-remediation-scope-change-stale-handoff, sandeval-partial-reassignment-package-completeness-gap]
---

# 整改冻结分区与当前作者批次重叠

**Why:** 整改保留原冻结工作项边界，而普通来源分批按当前实际作者投影。整改后的送审范围版本即使等于当前来源版本，冻结成员也可能多于该来源分组；新作者另有正式批次时，两批可同时直接命中 live 选择并重复覆盖同一工作项。仅对额外接续候选检查重叠，覆盖不到直接命中的批次之间的冲突。完整性拒绝也可能源于重复，通用“未覆盖应交范围”不能直接解释为缺项或漏验收。

**How to apply:** 比较来源精确成员、正式冻结成员、所有选中批次的成员总数与唯一工作项数，再区分缺项、越界、重复；核验重复两端的实际答案身份、作者、已完成整改 source/target 边和正式通过报告。范围版本相等不是成员一致的充分证据。修复要证明每个工作项只进入一次且沿用有效验收依据，不能任意按ID去重、修改历史快照或放宽完整性保护；组包、交接和Sand后续执行应复用同一精确范围。

2026-10-16 临科智华20261010_03单案的任务身份、生产SHA、两个Pod只读核验、黄超/朱炜范围冲突及原生完整性结果见[排查报告](/Users/leslie/Documents/Playground/sandeval-linke-package-block-20261016/report.md)。运行状态和数字保留在报告，使用前重新读取。该次只读诊断未修复业务代码、生产数据或触发Sand提交；与2026-10-15普通转派后漏入保留成员的案例属于不同具体分支，不能复用其单案恢复计划。

2026-10-16 后续修复指针：[main PR #2510](https://github.com/world-sim-dev/sandai-data-smith/pull/2510)。仅排除由已完成整改边解释、全部成员完全覆盖且当前答案相同的普通新批次；该普通批次还须已正式通过空间质检，且没有未结退回或召回。部分重叠、独有成员、不同或后续答案仍保持阻断。代码、只读候选范围、精确head与完整Gate的验收记录均见上述报告。用户明确同意将并行的整改转交/个人批次修复保留在同一PR；PR不代表已合并、发布或完成真实Sand提交。
