---
name: sandeval-cross-stage-frozen-answer-superseded
type: pitfall
created: 2026-09-29
updated: 2026-09-29
tags: [sandeval, quality, amendment, frozen-answer, cross-stage]
links: [sandeval-stopped-review-amendment-conflict, sandeval-amendment-lookup-recovery]
---

# 跨质检关卡的后续修订使旧轮次冻结答案只读

**Why:** 质检轮次检查固定送审版本；其他关卡后来对同一作答工作项完成质检修订，会向来源追加更晚的答案。旧轮次仍展示其冻结答案，编辑保护发现来源最新 `response_id` 不同，就提示“该答案已有后续版本，本轮仍检查冻结版本，不能再代改”。历史抽屉只列截至本轮冻结答案的版本，因此其中的“最新”不代表来源当前最新。这和同关卡前序轮次修订继承、修订索引缺失、标注员再次提交分别核查，不能只凭提示归因。

2026-09-29 生产只读实例：[空间质检第 3 轮检查项](https://eval.sandaii.cn/quality/inspection?task=QT-fad9cdd208ae5b4584b5144f0b0d5298&review=RT-648d638a978655dc8137d777bf16a563&item=RI-de82c5bbda935c13a620d48dc0602e18)。石羽宁的本轮冻结答案对应陈晚霞于 2026-09-23 16:25（北京时间）提交的第 2 版；陈晚霞答题卡操作历史另有曾玉贵于 2026-09-28 11:36（北京时间）写入的“质检修订”。质检管理页将曾玉贵显示为该批 Sand 质检员。页面当时仍允许石羽宁对本轮冻结答案作“合格 / 不合格”判断，但禁止继续代改。页面状态及负责人下一次送审情况会变化，复用时须重新回读。

**How to apply:** 从精确 task / review / item 定位冻结答案及同一 `assignment_id` 的最新来源答案；再核对标注答题卡操作历史、修订者所属关卡和时间。不能因冻结历史抽屉把第 2 版标为“最新”就断言来源没有第 3 版。若业务需要检查当前最新答案，由负责人按当前版本重新送审并进入对应新质检轮次；旧轮次只能依据其冻结版本作判断，不直接改写冻结引用或绕过最新版本保护。是否另有交接问题，按当前轮次、报告、处置和重新送审事实单独核查。

代码和产品指针：`sand-eval/platform/backend/app/services/facts/answer_amendment.py::verify_current`；`app/repositories/answer_cards.py::quality_versions_through`；`quality/application/inspection/review_history_service.py`；`platform/frontend/src/pages/quality/inspection/StructuredAnswer.tsx`；`app/usage_docs/content/inspector/complete-inspection-task.md`。实际部署以 `/health.deploy_sha` 现场核对。
