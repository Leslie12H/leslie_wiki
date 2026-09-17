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

- 自动化入口（PR #1287，合并状态需现查）：`sand-eval/platform/acceptance/README.md`、`scenarios.json`、`run.py`；真实测试资源只读核验使用同目录 `live.py`、`storage_probe.py`。隔离测试与真实端到端证据必须分开解释。
- 2026-09-17 自动化执行记录：`/Users/leslie/Documents/Playground/output/sandeval-automation-20260917/report.md`；失败回归不应改成 xfail 来掩盖产品缺陷。

- 真实 HTTP 多角色 E2E：`sand-eval/platform/acceptance/e2e/README.md`、`cases.json` 与 `run.py`。入口数不是完整性证据，先读 README 的未实现变体，再读具体运行结果；故障注入必须有专用进程所有权。
- 2026-09-17 真实运行与 UI 断言：`/Users/leslie/Documents/Playground/output/sandeval-complete-e2e-20260917/report.md`；含完整用例目标、52 项运行回执、时间精度两侧原始值、失败页面按钮状态。修复后必须重跑，不沿用历史 PASS。
