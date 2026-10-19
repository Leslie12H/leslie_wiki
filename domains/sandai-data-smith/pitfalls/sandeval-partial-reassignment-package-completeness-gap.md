---
name: sandeval-partial-reassignment-package-completeness-gap
type: pitfall
created: 2026-10-15
updated: 2026-10-19
tags: [sand-eval, quality, package, reassignment, scope]
links: [sandeval-handoff-duplicate-scope, sandeval-remediation-scope-change-stale-handoff, sandeval-reassignment-scope-and-batch-responsibility]
---

# 部分转派后页面已通过，整包却漏入保留成员

**Why:** 当前来源按实际作者投影批次，普通转派后只有部分题由新持有人重新作答，旧作者批次会缩小。页面若按原 scope_key 继续显示旧通过报告，而拼包仅接受完全相同的 scope_version，就会出现页面全部通过、整包少一部分成员。旧送审整体放回又可能与新作者已通过批次重复。完整性拒绝本身是必要保护，缺口在展示与实际交接共用的范围接续证据。

**How to apply:** 先读取来源实际完整应交集合，不按任务名里的道数推定。比较页面批次、正式当前送审和 live 聚合批次三个集合；精确列出遗漏工作项，再核查其转派、最新实际作者、正式质检修订链与供应商验收。只证明旧批已经通过不足以重新加入旧批全部成员。应形成旧冻结范围到当前有效保留子集的可验证接续，让展示、拼包、交接执行、Sand 后续和结果准入共用同一精确集合；历史快照和报告保持不可变，禁止靠减小应交数或放宽完整性消除阻断。

2026-10-15 生产案例的任务身份、部署 SHA、真实负责人只读调用、当前缺项与修订证明见 [单案排查报告](/Users/leslie/Documents/Playground/sandeval-package-block-20261015/report.md)。该次确认页面6批合计20条已通过，聚合只认5批19条；缺失1条仍有合法正式质检修订及原验收。旧批原2条整批放回会得到21条并重复1条，保留其中当前仍有效的1条才能覆盖20个唯一工作项。数字和运行状态是该时间快照，后续重新读取证据。

现有“已完成整改换作者”接续不能自动覆盖普通转派：先核对 persisted resolution_execution 的准确 source/target submission，不能借另一个批次的整改执行证明本批变化。正式修订证明也只能证明答案接续，不能单独当作新交接范围已生成。

代码与交付指针：[修复 PR #2488](https://github.com/world-sim-dev/sandai-data-smith/pull/2488)，目标为 main；以 PR 的最终提交、Gate 和部署记录判断生效状态。成员接续由 `quality/application/management/reassigned_batch_scope.py` 证明，`FrozenAggregateEvidence.source_member_ids` 封存原成员身份子集，`SubmissionService.execution_items` 供后续执行共用；负责人选项还须同步到原正式版本，否则拼包成功后仍无法分配 Sand。修订/整改继承链继续走原受控接续，不能借子集掩盖链中已失效答案。复用旧 Sand 检查时也须比较两版包的成员子集。

2026-10-15 生产调查仍限只读，代码 PR 不代表已合并或已部署；未修复生产数据、未触发推进或提交 Sand。单案候选规则验证、最终 CI 和 code review 证据见上述本地排查目录的 `candidate-readonly.json`、`review-findings.json` 及 PR。review 后的修复复验见同目录 `review-fix-verification.json`。Gate 通过不能替代回交范围和必检预览的单独复现；是否可合并以 PR 的最终提交、检查和未决项为准。

成员子集引入后，所有再次封存的交接类型都须携带同一选择，单批回交还须核对原退回工作项，不能自动扩大或缩小。必检数量也须按所选固定成员统计，并对照实际抽样验证普通及批量预览；仅把最终数量夹到题数上限会掩盖被移走题目仍参与必检计数的问题。

2026-10-19 同版本、已完成整改的扩展案例见[整改冻结分区与当前作者批次重叠](sandeval-remediation-frozen-overlap-same-scope-version.md)及[PR #2602](https://github.com/world-sim-dev/sandai-data-smith/pull/2602)。新分支从 main 复用本页 PR #2488 的原始提交，补充已闭环整改边与承接范围证明；不能将 test 历史带回开发或发布分支。旧普通转派能力和该新分支都应以最终代码、Gate、统一部署与业务回读判断是否生效。
