---
name: sandeval-correction-reviewer-display-scope
type: pitfall
created: 2026-10-05
updated: 2026-10-05
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
