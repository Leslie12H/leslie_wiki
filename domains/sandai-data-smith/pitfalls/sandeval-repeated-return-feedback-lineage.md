---
name: sandeval-repeated-return-feedback-lineage
type: pitfall
created: 2026-09-25
updated: 2026-09-28
tags: [sandeval, quality, feedback, reinspection]
links: [sandeval-correction-fixtures, sandeval-auto-reinspection-verification]
---

# Sand Eval 多轮退回的上游意见链

**Why:** 2026-09-25 的 PR #1913 Gate 发现，Sand 退回并委派供应商复验后，质检员首次退回标注员可以显示 Sand 整批及逐题意见；标注员整改、再次复验、质检员再次退回时，同样的意见消失。第二次手动退回的处置可以没有直接 `parent_disposition_id`，因此用这个字段作为显示意见的必要条件会误丢合法反馈。前端测试另因历史记录 mock 没有返回 Promise 而在组件挂载时崩溃；API 精确响应断言也未包含新增的可空字段。

**How to apply:** 从本轮手动退回的 `source_review_task_id` 找当前检查任务，核对检查员、整包 submission、标注员接收人，再沿已授权复验执行与 `previous_task_id` 找唯一的 Sand 委派父处置；若处置另有直接父 ID，也核对它与找到的委派链一致。逐题意见仍按整包范围和稳定 `work_unit_id` 过滤。验收至少覆盖“首次退回→整改→再次复验→再次退回”及无关题隔离，分别用质检工作台和标注整改页确认。

2026-09-28 的测试数据复现再次暴露此依赖：只复制当前质检任务、上一轮退回处置和委派子处置，遗漏 Sand 原始父处置时，详情的 `upstream_return_note` 为空，页面的“Sand 质检退回意见”随之隐藏。补齐父处置并以当前质检员身份回读后，原始意见恢复。构造同类测试场景时要闭合父处置及复验执行链，并核对详情的 `upstream_disposition_id`、`upstream_return_note`；前端还要求登录账号是该轮检查任务的 `assignee_id` 才显示意见。页面入口见 `review_query_service.py::detail` 与 `ReviewWorkspace.tsx`，实际部署行为仍需现场核对。

- 实现与回归指针：[PR #1913](https://github.com/world-sim-dev/sandai-data-smith/pull/1913)；`sand-eval/platform/backend/quality/application/resolution/disposition_issue_service.py::upstream_for_annotation`、`delegated_feedback.py::delegated_sand_return`、`backend/tests/quality/application/resolution/test_sand_supplier_return.py::test_delegated_inspector_and_annotator_see_the_same_sand_return_feedback`。PR 合并、Gate 与部署状态须现场核对。
