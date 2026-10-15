---
name: sandeval-partial-reassignment-package-completeness-gap
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [sand-eval, quality, package, reassignment, scope]
links: [sandeval-handoff-duplicate-scope, sandeval-remediation-scope-change-stale-handoff, sandeval-reassignment-scope-and-batch-responsibility]
---

# 部分转派后页面已通过，整包却漏入保留成员

**Why:** 当前来源按实际作者投影批次，普通转派后只有部分题由新持有人重新作答，旧作者批次会缩小。页面若按原 scope_key 继续显示旧通过报告，而拼包仅接受完全相同的 scope_version，就会出现页面全部通过、整包少一部分成员。旧送审整体放回又可能与新作者已通过批次重复。完整性拒绝本身是必要保护，缺口在展示与实际交接共用的范围接续证据。

**How to apply:** 先读取来源实际完整应交集合，不按任务名里的道数推定。比较页面批次、正式当前送审和 live 聚合批次三个集合；精确列出遗漏工作项，再核查其转派、最新实际作者、正式质检修订链与供应商验收。只证明旧批已经通过不足以重新加入旧批全部成员。应形成旧冻结范围到当前有效保留子集的可验证接续，让展示、拼包、交接执行、Sand 后续和结果准入共用同一精确集合；历史快照和报告保持不可变，禁止靠减小应交数或放宽完整性消除阻断。

2026-10-15 生产案例的任务身份、部署 SHA、真实负责人只读调用、当前缺项与修订证明见 [单案排查报告](/Users/leslie/Documents/Playground/sandeval-package-block-20261015/report.md)。该次确认页面6批合计20条已通过，聚合只认5批19条；缺失1条仍有合法正式质检修订及原验收。旧批原2条整批放回会得到21条并重复1条，保留其中当前仍有效的1条才能覆盖20个唯一工作项。数字和运行状态是该时间快照，后续重新读取证据。

现有“已完成整改换作者”接续不能自动覆盖普通转派：先核对 persisted resolution_execution 的准确 source/target submission，不能借另一个批次的整改执行证明本批变化。正式修订证明也只能证明答案接续，不能单独当作新交接范围已生成。

代码指针：`quality/application/management/submission_service.py::live_annotator_batches`、`remediation_batch_scope.py::continued_remediation_batches`、`aggregation_service.py::_vendor_package`、`batch_allocation_service.py` 的展示选择。实现、PR 和部署会变，复用前固定 SHA 重新核对。本次只有只读诊断和集合预演，未修复生产数据、未触发推进或提交 Sand。
