---
name: sandeval-e2e-acceptance
type: reference
created: 2026-09-17
updated: 2026-09-18
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

- 2026-09-17 生产定向复测：`/Users/leslie/Documents/Playground/output/sandeval-prod-retest-20260917/report.md`，含生产页面截图、冻结计划与 Hologres 同一卡时间比对。解释 wave 数量前先核对入口：`app/repositories/ev3_write.py::persist_assignment_operation` 的 `create_batch` 与页面分派服务不同；CLI 成功不能替代页面 E06 验收。原页面复测状态以报告为准。

- 2026-09-18 普通题 HTTP + Playwright 自动化入口：分支 `codex/sandeval-real-e2e-36`，`sand-eval/platform/acceptance/e2e/README.md`、`campaign.py`、`browser/workflow.spec.js`。按角色准备真实前置，逐题提交、封存、负责人验收、整包交接、连续整改及最终导出分别断言。脚本清单与通过证明必须分开，最新结果从运行目录的 `results.json` 回读。
- 浏览器验收分层：接口可准备前置，但 UI 操作必须真实点击。前置分配失败时，将结果归为前置阻塞，不可把空白截图当作 UI 缺陷；不以减少业务断言换取 PASS。截图中的“判定次数”与“已交卷待下发”需分别建立已下发/未下发两轮，再验证第二次下发后的增量和刷新保持。
- 隔离异步下发：本地 Web 与 worker 必须使用本轮专属的队列 namespace；读取真实业务终态，不能只断言 POST 返回 202。实现及运行条件以该分支 README 和 `app/qc_release_worker.py` 为准。

- 2026-09-18 质检分配重新验证与结论纠正：`/Users/leslie/Documents/Playground/output/sandeval-clean-diagnosis-20260918/report.md`。Why：首次 needs_attention 不等于永久阻塞，后台可在客户端报错后补齐；独立任务和旧 QC 下发 namespace 不代表隔离质量中心恢复扫描。How：保留首次回执，限时回读终态并执行后续质检，分别报告恢复时延、最终可用性和仍未定位的执行者；不得将共享测试库称为独占空库。

- 2026-09-18 完整 24 条 API 重跑与逐项归因：`/Users/leslie/Documents/Playground/output/sandeval-full-api-20260918-recovery-aware/summary.md`、`diagnosis.md`、各用例 `events.jsonl`。Why：HTTP 冲突、最终恢复、脚本漏角色、环境校验和外部修改必须分别判断。How：保留首轮结果并将补查单独记录；作者整改只选当前可操作处置，Sand 退回需先经过供应商质检员；导出检查 HTTPS 配置；shared test 不宣称独占。动态状态及通过数量查报告，不以历史结论替代重跑。
