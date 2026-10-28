---
name: sandeval-view-answer-version
type: reference
created: 2026-10-28
updated: 2026-10-28
tags: [sand-eval, answer-history, quality, browser]
links: [sandeval-roles-and-workflow, sandeval-saved-version-vs-browser-display]
---

# “看答案”的版本来源核验入口

**Why:** 标注员详情中的“看答案”包含当前展示与历史版本两部分。不能仅凭页面归属是标注详情，就断言正文始终为原标注，也不能仅凭质检结论断言浏览器正文已换版。

**How to apply:** 只读打开具体卡片，核对“最新一版答案”与“历史记录”的版号、时间和各级质检标签；原标注沿最初版本核验，质检保存沿相应后续版本核验。有后续标注或质检时重新查，勿沿用旧版号和时间。

- 路由分流入口：`sand-eval/platform/frontend/src/routes/taskDetail.tsx`；相同 URL 可按角色选择 `AnnotatorCardsPage` 或 `SpaceAnnotatorCardsPage`，先确认实际角色与展示。
- 正文选版入口：`sand-eval/platform/frontend/src/pages/answerCards/AnswerCardReadOnly.tsx`；历史展示：`AnswerHistoryShell`。固定当前提交重新核对版本排序和 latest 取值。
- Sand 侧版本查询入口：`sand-eval/platform/backend/app/repositories/ev3_answer_cards.py` 的 `VERSION_IDS_SQL`、`versions_sql`；字段与归属校验沿 `ev3_single_card.py`。空间侧另读 `repositories/my_space_tasks.py`，不要混淆隐藏 Sand 结论和隐藏答案版本。
- 本次只读核验的[原页面](https://eval.sandaii.cn/spaces/linkezhihua-annotation/tasks/59c07735-5583-5351-80ae-ab528c75acf9/annotators/7683f8a4-6f5d-57fe-b06f-84026d69abc8)。页面内容随业务变化；本页仅保存复查入口，不固化当前人员、版号、时间或质检结论。
