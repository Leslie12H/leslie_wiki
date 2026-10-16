---
name: sandeval-space-reinspection-older-sand-amendment-gap
type: pitfall
created: 2026-10-16
updated: 2026-10-16
tags: [sand-eval, reinspection, amendment, sand-qc, frozen-answer]
links: [sandeval-cross-stage-frozen-answer-superseded, sandeval-sand-reinspection-summary-revision-amendment-conflict, sandeval-reassigned-answer-frozen-review-conflict]
---

# 空间复验只接最近 Sand 退回，遗漏更早的正式代改

**Why:** 同一固定标注成员的 Sand 第 1 轮已保存代改，随后整批退回；顶层汇总换版后建立 Sand 第 2 轮并再次退回，再建立空间复验。若空间跨关卡继承只接到最近 Sand 第 2 轮，而未覆盖早期保存修订的第 1 轮，修订 lookup 即使完整也不会被选中。来源最新答案已是代改版，页面却仍读原标注版，最新版本保护便拒绝再次代改。仅看到 previous_task_id 相连不能代替完整继承与封存判据。

**How to apply:** 从精确检查项追到不可变叶子成员及稳定工作项，分别核对所有正式来源版本、执行回执、修订 lookup、修订所在轮次/计划/版本、两次退回与负责人委派。强制只读调用部署版 visible_amendment、_sand_return_basis、_sand_return_chains 与 verify_current，记录真正选中的基线和遗漏轮次，再从独立 Pod 复核。不要只说“负责人重新送审”，因为负责人可能已经安排过复验；不要直接替换冻结引用、选任意来源最新或解除版本保护。

## 现场与代码指针

- [2026-10-16 徐咏晴指定题只读报告](/Users/leslie/Documents/Playground/output/xuyongqing-qc-frozen-20261016/report.md)：精确对象、代改前后选项、两轮 Sand 退回、页面基线、当前已提交状态及双 Pod 函数核验。具体状态会变，以报告时点与后续读取为准；修复代码、CI 与生产生效边界见下方修复指针。
- 部署 SHA 与源码入口见报告；核心为 quality/application/inspection/answer_amendment_service.py 的 visible_amendments / _sand_return_chains、quality/domain/inspection/amendment_lineage.py 和 app/services/facts/answer_amendment.py 的 verify_current。
- [相邻问题：再次交接 Sand 的汇总换版继承](sandeval-sand-reinspection-summary-revision-amendment-conflict.md)；本案回到空间复验，不能把两个读取入口混为同一验收。
- 当前链接若已经提交通过，需要区分历史截图的可编辑状态、通过所依据的本轮旧基线与后续新答案；不能从“已通过”推断最新版已被这一轮复验。

## 受控修复指针

- [测试 PR #2503](https://github.com/world-sim-dev/sandai-data-smith/pull/2503)：仅从实际委派的最近退回，沿同一原批次的连续 Sand 汇总版本追溯更早停止轮次。每一跳校验正式退回、停止版本、送审前置契约及冻结成员摘要；读取、候选与资格共用该路径，不选任意来源最新。
- [2026-10-16 修复报告](/Users/leslie/Documents/Playground/output/xuyongqing-qc-frozen-20261016/repair/report.md)：后续 Sand 的真实数据只读候选验证、原修订归属与空间封存证明，以及精确提交、CI、集成阻塞和发布状态。候选加载到一次性只读进程，不是线上部署。
- 已验收报告下游仍在检查时，先核对依赖，再确定是否允许新轮次。原来源版本、修订 lookup 和退回事实都完整的读取缺口，没有可补齐的缺失数据字段；不要为手工恢复把旧修订改绑成当前轮代改，或更改已冻结成员引用。本案用户选择保留已验收记录，只修后续继承；代码发布、数据写入和候选验证分别取证。
