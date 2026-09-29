---
name: sandeval-cross-workbench-question-order
type: pitfall
created: 2026-09-28
updated: 2026-09-29
tags: [sandeval, quality, remediation, testing]
links: [sandeval-direct-remediation-and-batch-handoff]
---

# 同一标注批次跨工作台不能靠题号定位整改题

**Why:** 2026-09-28 测试环境直接整改中，同一批的 0:09 和 0:10 视频在标注端与 Sand 质检队列的显示次序不同。测试者按“第 1 题”跨界面定位，首次改了 0:09；Sand 下一轮看到真正退回的 0:10 仍是第 1 版。按素材重新定位并将 0:10 改为第 2 版后，Sand 复验才看到新答案。本次是测试定位误差；仅凭这次观察不能认定系统把答案交错。

**How to apply:** 跨标注、供应商质检与 Sand 质检核对整改时，以题目 ID、素材标识或视频本身作为关联键，记录答案版本和各轮质检报告；界面“第 N 题”只用于当前工作台导航。检查新答案时同时核对原问题对应素材、版本历史及 Sand 新轮次，避免把改错题误判为自动回交失败。具体样本和导出指针见 [Sand 直达整改核验入口](../refs/sandeval-direct-remediation-and-batch-handoff.md)。

**2026-09-29 生产复现：** `QT-6349e42ebb285ab0a726e873b75d729c` 的关小琪第 3 轮质检队列按视频分别是篮球、美妆、露营、徒步；姜姗姗同批整改单的“报告退回涉及的答案”却是徒步、篮球、露营、美妆。关小琪的整批退回意见以 `01–04` 编号，在整改详情每题旁原样重复，因此整改页题号不能用来解释这四段意见。按视频标识核对，四个视频仍能一一对应，没有从这次只读页面证据发现答案或逐题判断串到其他视频。生产页面入口见 `https://eval.sandaii.cn/quality/inspection?task=QT-6349e42ebb285ab0a726e873b75d729c&review=RT-0194cadc806756879750c6943ecf502e` 及同任务 `DISP-94d19337436558bd8bede69676bd30be` 整改详情；实时状态须重新查看。

**Why / How to apply：** 当前主线的质检队列从 `sand-eval/platform/backend/quality/infrastructure/persistence/review_task_repository.py::queue_items` 按检查项 `item_id` 排序；本人整改预览和手工退回问题列表分别通过 `answer_correction_service.py::_read_state`、`disposition_issue_service.py::page` 读取送审成员，底层 `submission_repository.py::items` 按送审项 `item_id` 排序。两种 ID 的生成规则见 `quality/domain/inspection/review_task.py::FrozenReviewPlan.item_index` 和 `quality/application/management/submission_service.py`；它们不能充当跨页面题号。修复时保持按工作项/视频关联逐题判断，并让接收页呈现原质检位置或同源稳定顺序；不能只交换前端数组或用自由文本编号重连答案。
