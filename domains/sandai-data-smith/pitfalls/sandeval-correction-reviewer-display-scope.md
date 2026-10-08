---
name: sandeval-correction-reviewer-display-scope
type: pitfall
created: 2026-10-05
updated: 2026-10-08
tags: [sandeval, quality, correction, identity, frontend]
links: [sandeval-repeated-return-feedback-lineage]
---

# Sand Eval 整改意见姓名的展示覆盖

**Why:** 2026-10-05 排查一条标注整改截图时，生产原记录的检查员账号及昵称都完整，但“最新质检”卡片不显示姓名。核对当次部署版本发现，答案历史/质检历史与整改摘要使用不同 DTO 和组件；历史记录已增加姓名，不代表整改顶部意见也已覆盖。仅以“功能以前上线过”或“批次较老”归因会漏查真实接口和组件。

**How to apply:** 用截图中的整批意见和逐题说明精确定位处置，核对接收人、处置发起人 `created_by`、原报告执行人 `assignee_id` 及账号 `display_name`；从公开 health 取得部署 SHA，再检查该版本的整改清单、完整预览和卡片渲染，以及独立的历史链路。逐题质检员与整批退回发起人分别从对应原事实取值；不使用当前负责人替代历史操作人。只有原身份事实缺失才讨论回填。

## 核验与代码指针

- [2026-10-05 只读排查与部署源码快照](/Users/leslie/Documents/Playground/output/sandeval-missing-reviewer-20261005/report.md)：含目标处置、截图匹配、操作人及当前状态回读、部署 SHA、字段与渲染证据；历史排查不代表后续修复或上线状态。
- 整改投影：`sand-eval/platform/backend/quality/application/resolution/dto.py::AnswerCorrectionInspection`、`answer_correction_service.py`；分别核对清单与完整预览投影。
- 整改卡片：`sand-eval/platform/frontend/src/pages/quality/resolution/AnswerCorrectionPanel.tsx`。
- 已有查名路径：`quality/application/inspection/review_history_service.py` → `quality/infrastructure/client/reviewer_client.py::account_labels` → `app/services/facts/spaces.py::account_summaries`。
- 历史渲染：`sand-eval/platform/frontend/src/pages/quality/inspection/AnswerVersions.tsx`。原功能提交指针：`38852ca1173843c094261c9b0aa987aada21cc39`。

复查时重新核对生产版本及实际数据；以上是原始只读定位的证据，不代表后续部署状态。

## 修复与验收指针

2026-10-05 用户授权修复后，从重新 fetch 的 main 创建 `codex/correction-reviewer-names`，提交指针：[d001cfbb67b4687a5466f639b5d3fa296a9daebb](https://github.com/world-sim-dev/sandai-data-smith/commit/d001cfbb67b4687a5466f639b5d3fa296a9daebb)。接口与展示覆盖、回归用例和本地验证边界见上方排查报告。是否创建 PR、Gate 是否通过、测试验收及上线状态均须现场核对，不将分支推送当作发布证据。

## 展示分支与刷新核验

**Why:** 姓名字段接通后，意见仍可能经过多个状态分支展示；只验证可编辑工作台会遗漏待复验和已完成界面。可降级的人员读取还需要验证服务恢复后用户刷新是否能拿到新字段。

**How to apply:** 逐一核对所有仍展示意见的状态是否使用署名字段；追踪页面刷新所更新的 DTO 是否与署名绑定的 DTO 一致。字段放在 detail、刷新仅更新 manifest 时，新增展示可能无法随刷新恢复。2026-10-05 的源码 review 与具体验证边界见 [review 记录](/Users/leslie/Documents/Playground/output/sandeval-missing-reviewer-20261005/review.md)；修复和验收状态须重新核对代码与 CI。


**刷新草稿边界：** 将局部 manifest 刷新改成整台 workspace 刷新，会卸载子组件；除了答案编辑状态，还要检查弹窗取消或提交失败后留在组件中的整改说明。刷新会丢弃这些输入时先确认，拒绝后保留原草稿；不能仅靠禁用提交中的按钮保护取消后的输入。

2026-10-05 的补修指针为业务分支 `codex/correction-reviewer-names` 本地提交 `e92221efb0c149cffa14e7e9612ca8675b7844cd`；入口是 `MyCorrectionPage.tsx`、`AnswerCorrectionPanel.tsx` 和 `MyCorrectionPage.test.tsx`。非编辑署名、完整工作台刷新和草稿确认的实现及验证边界见 `/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/review-fixes.md`，后续发布与验收状态以 Git、CI 和浏览器为准。


**刷新定位边界（2026-10-05）：** 全工作台重载还会卸载题目队列，使子组件本地 selected 恢复默认首题；刷新失败保留旧 DTO 后重挂，也可能丢当前位置。Why：署名刷新覆盖与编辑器重挂是两个独立验收点，姓名更新成功不能证明长批次核对连续性。How to apply：按稳定 work_unit_id 保留刷新前题目，覆盖成功、失败和题目退出范围；测试不要只断言每题相同的姓名或状态。静态发现的代码版本、调用链与验证边界见 [第二轮 review](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/review-2.md)，修复及上线状态重新核查。

**刷新定位修复指针（2026-10-07）：** 业务仓库本地提交 `9b94a882df4bdff109b203b1115fde698cf7e0ed`；实现与验证边界见 [第二轮 review 修复记录](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/review-2-fixes.md)。**Why:** 完整工作台重载会卸载题目面板，因此当前题身份必须由卸载边界之外持有。**How to apply:** 按质量任务和整改单隔离稳定 work_unit_id，在成功或失败重载后重新定位；清单重排和 issue ID 更新不应改变当前题，目标退出清单才回首题。继续保留未保存答案与整改说明的丢弃确认，回归同时断言当前题身份、跨单隔离与失败重试，不能只检查姓名更新。代码入口为 `MyCorrectionPage.tsx`、`AnswerCorrectionPanel.tsx`，回归入口为 `MyCorrectionPage.test.tsx`；该提交尚无 CI 或浏览器验收通过证据，发布状态须另查。

**PR 核验入口（2026-10-07）：** [测试 PR #2241](https://github.com/world-sim-dev/sandai-data-smith/pull/2241) 由 `codex/correction-reviewer-names` 指向 `sandeval-test-only`。四条任务提交已从原 main 基线更新到 `afd72cda8d10`，生成文档由原生成器处理冲突，业务补丁的 range-diff 核对记录见 [PR 准备记录](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/pr-status.md)。CI、合并与部署状态读取 PR 和对应 run，不能由历史本地提交推定。

**Main PR 指针（2026-10-07）：** 用户授权后由干净开发分支创建 [main PR #2246](https://github.com/world-sim-dev/sandai-data-smith/pull/2246)，五条补丁更新到最新 main 后经 range-diff 确认等价。前序测试 PR #2241 的合入与测试部署证据、准确 base/head、main Gate 及浏览器/生产验收边界见 [main PR 记录](/Users/leslie/Documents/Playground/output/sandeval-resubmit-20261005/main-pr-status.md)；后续状态以对应 PR/run 回读为准。

## 质检复验页的上游 Sand 意见（2026-10-08）

**Why:** 标注整改卡片与供应商质检复验页的上游 Sand 意见使用不同的身份事实、DTO 字段和组件。原作者已存在且标注整改页已增加署名，也不能证明 `SandFeedbackNote` 的整批或逐题意见已展示作者。顶部批次后的 `producer_name` 是标注员，不是质检人；当前复验任务 `assignee_id` 也不能代替原 Sand 意见作者。

**How to apply:** 从当前复验的目标送审和报告继承链找到明确委派子处置，再沿 `parent_disposition_id` 读取 Sand 原父处置的 `created_by` 与原报告检查人；分别核对意见作者、当前复验人和标注员。检查 `upstream_return_note` 是否具有对应的作者投影及组件渲染；现有 `return_author_name` 对应本地整改摘要，不能直接作为上游 Sand 原作者。姓名读取沿已授权的精确意见事实批量取值，不借用账号切换或放宽权限来补展示。

取证与修复方案见 [2026-10-08 质检复验页缺名报告](/Users/leslie/Documents/Playground/output/sandeval-inspection-feedback-author-20261008/report.md)，包含精确链接、截图意见匹配、生产身份链、部署源码快照及未实施方案。入口为 `quality/application/resolution/delegated_feedback.py::delegated_sand_return`、`quality/application/inspection/review_query_service.py`、`ReviewTaskDetailResponse`、`frontend/src/pages/quality/inspection/ReviewWorkspace.tsx` 与 `SandFeedbackNote.tsx`。后续修复、部署和浏览器验收状态现场回读，不由该只读诊断推定。
