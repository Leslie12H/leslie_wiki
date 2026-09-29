---
name: sandeval-cross-stage-frozen-answer-superseded
type: pitfall
created: 2026-09-29
updated: 2026-09-29
tags: [sandeval, quality, amendment, frozen-answer, cross-stage]
links: [sandeval-stopped-review-amendment-conflict, sandeval-amendment-lookup-recovery]
---

# Sand 退回前代改使后续空间复验轮次冻结旧答案

**Why:** 质检轮次检查固定送审版本。Sand 质检员先代改同一作答工作项，向来源追加更晚的答案，随后退回供应商整改；新安排的空间复验轮次仍冻结原送审答案。编辑保护发现来源最新 `response_id` 不同，就提示“该答案已有后续版本，本轮仍检查冻结版本，不能再代改”。Sand 的退回轮次没有正式通过的报告，不能按已封存前驱修订直接继承；当前修订资格规则也不跨关卡。历史抽屉只列截至本轮冻结答案的版本，因此其中的“最新”不代表来源当前最新。这和同关卡前序轮次修订继承、修订索引缺失、标注员再次提交分别核查，不能只凭提示归因。

2026-09-29 生产只读实例：[空间质检第 3 轮检查项](https://eval.sandaii.cn/quality/inspection?task=QT-fad9cdd208ae5b4584b5144f0b0d5298&review=RT-648d638a978655dc8137d777bf16a563&item=RI-de82c5bbda935c13a620d48dc0602e18)。陈晚霞 2026-09-23 16:25（北京时间）提交第 2 版；石羽宁第 2 轮于 16:47 提交通过报告；供应商负责人李文博 17:28 验收通过，2026-09-24 15:34 提交 Sand。Sand 质检员曾玉贵于 2026-09-28 11:36:01 代改、11:36:13 退回供应商；李文博于 20:10:44 才把空间质检第 3 轮派给石羽宁。因此 Sand 进入的是已通过的上一轮，不是尚未审核的第 3 轮。第 3 轮仍冻结第 2 版、不能代改，表明 Sand 退回后的版本衔接尚未完成。页面状态会变化，复用时须重新回读。

**How to apply:** 从精确 task / review / item 定位冻结答案及同一 `assignment_id` 的最新来源答案；对照整改流水中的上一轮报告、负责人验收、提交 Sand、Sand 修订和退回、供应商新轮派单时间。不能因冻结历史抽屉把第 2 版标为“最新”就断言来源没有第 3 版；也不能把当前第 3 轮未审核误解为当初未经供应商质检就提交 Sand。本例负责人已在 Sand 退回后安排新一轮，重复要求重新送审不足以解除冲突。应先明确未封存的 Sand 代改在后续供应商复验中的受控去向，再修复版本衔接；保留来源答案、修订和退回审计，不直接改写冻结引用或绕过最新版本保护。

代码和产品指针：`sand-eval/platform/backend/app/services/facts/answer_amendment.py::verify_current`；`app/repositories/answer_cards.py::quality_versions_through`；`quality/application/inspection/review_history_service.py`；`quality/application/inspection/answer_amendment_service.py::visible_amendments`；`quality/domain/inspection/amendment_lineage.py::sealed_by`；`platform/frontend/src/pages/quality/inspection/StructuredAnswer.tsx`。实际部署以 `/health.deploy_sha` 现场核对。
