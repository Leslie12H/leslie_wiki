---
name: sandeval-e2e-acceptance
type: reference
created: 2026-09-17
updated: 2026-09-17
tags: [sandeval, acceptance, assignment, quality]
links: [sandeval-local-startup, sandeval-roles-and-workflow]
---

# Sand Eval 多角色验收与派题回读入口

**Why:** 2026-09-17 实际多角色验收发现，派题卡落库不代表派题成功，也不代表已建立质量中心所需的标注批次。时间精度差异可能在写卡后回读时触发冲突，形成可提交答案但无法质检的半成品。

**How to apply:** 验收同时核对操作回执、卡、wave 和质检可选批次。出现 needs_review 时先按原操作只读核对；不要删卡重派或绕过比较，已提交的答案必须保留。存储时间精度与冻结计划比较需有一致契约。后续代码可能已修复，先核对提交和运行事实。

- 历史实测记录及复现对象：`/Users/leslie/Documents/Playground/output/sandeval-e2e-20260917/execution.md`（基线 e9af2fb9f；实测停在空间质检入口，未完成全流程）。
- 派题冻结、写卡、回读及 wave 创建：`sand-eval/platform/backend/app/repositories/assignment_persistence.py`。
- 官方只读核对与原计划恢复：`sand-eval/platform/backend/app/cli/assignment_recovery.py`；先 inspect，按实际恢复前置条件处理。
- 质量入口及批次查询：`sand-eval/platform/frontend/src/pages/quality/QualityManagementPage.tsx`、`sand-eval/platform/backend/quality/api/management/management_handlers.py`。
