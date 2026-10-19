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

## 2026-10-19 同类型内部调度公平

**Why:** worker 正在成功计算、类型间也轮转，不代表首次生成不会积压。新复验一旦收到提示就与所有已有摘要进入同一 dirty 类；按旧 next_run_at 排序还会让晚发生的变更借过去的周期时间占据前排。只加并发或只修类型间轮转不能消除这个顺序问题。

**How to apply:** 先核对实际领取 SQL、候选位置、发布覆盖和 worker 日志，排除整体停摆；为首次发布、已有结果的变更和丢失提示后的周期校准分别保留反复获得的领取机会。变更按未完成变更的年龄排队，空类别借位，保留租约、退避、控制连接和原并发预算。持续新任务也不能饿死已有结果。调度公平不等于固定完成时限，仍需结合对象数与计算耗时核对容量。

发布中途收到新代数时，既要保留新请求，也要让剩余变更重新排队。继续携带已完成一轮的最早 dirty_since，会使持续写入对象在新的排序下反复占据队首。Review 回归应直接断言其他等待对象获得下一次机会，并用旧发布逻辑复现；只覆盖“不断新增对象”会漏掉“同一对象不断变更”。[取证报告的 Review 节](/Users/leslie/Documents/Playground/output/inspector-summary-status-20261019/report.md#review持续写入的对象仍可能占据队首)保存复现和验证指针。

- [修复与最终 Gate](https://github.com/world-sim-dev/sandai-data-smith/pull/2616)：当前调度契约为 `sand-eval/docs/subsystems/list-summary-refresh.md`，既有工程决定为 `.agents/notes/implemented/architecture/2026-09-24-qc-summary-business-priority.md`；真实 SQL 生命周期用例为 `test_qc_summary_lifecycle.py`。部署与生产恢复必须另行读回，不能将只读候选排序或 SQLite 模型视为已发布摘要。
- [根因及修复探针](/Users/leslie/Documents/Playground/output/inspector-summary-status-20261019/report.md#后续根因与修复验证2026-10-19-17031709)：队列、实际顺序、worker 有界日志、修复后真实 SQL 的 Hologres 只读 EXPLAIN 与候选结果。动态数值和当前状态沿脚本重新读取。
