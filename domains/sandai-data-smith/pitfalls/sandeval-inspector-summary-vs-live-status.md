---
name: sandeval-inspector-summary-vs-live-status
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [sand-eval, inspection, summary, projection, evidence]
links: [sandeval-saved-version-vs-browser-display]
---

# 质检列表摘要待确认与详情实时状态分开核验

**Why:** “状态待确认”是列表没有可用持久摘要时的展示回退，不能当作需要负责人确认的业务节点。详情实时计算当前 display_status，因此同样的列表回退可能对应待质检、待复验或其他实际状态。长期未发布的摘要也不能被解释为正常短暂加载。

**How to apply:** 对齐截图登录账号、任务名、标注员、QT/RT，再读取当前部署版本、摘要 computed_at/result 内 task_version、requested/published_generation、job_status、next_run_at、lease 与错误。以实际人员当前身份在数据库只读保护下读取原生详情 display_status、progress 和 actions。旧摘要与当前任务版本不匹配时保持未知，不强塞初始状态或清保护。只有摘要证据时，不能断言 worker 的具体根因；复验状态也不能独立证明答案最新版已纳入。

- [2026-10-19 个案证据与只读复核脚本](/Users/leslie/Documents/Playground/output/inspector-summary-status-20261019/report.md)：截图两位标注员身份校准、摘要发布等待、原生第二轮复验状态及未审计边界；具体当前状态会变，沿脚本重读。
- 代码入口：`quality/infrastructure/client/my_review_candidates.py::summary_page`、`quality/application/task_list_summary.py::projection`、`ReviewQueryService.detail/_inspector_status`、`SupplierInspectionList.tsx`、`useMyTaskPages.ts`。沿运行 SHA 核对，不能只改文案就声称消除了长期未发布的问题。
