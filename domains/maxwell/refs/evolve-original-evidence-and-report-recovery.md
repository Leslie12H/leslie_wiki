---
name: evolve-original-evidence-and-report-recovery
type: reference
created: 2026-10-13
updated: 2026-10-14
tags: [maxwell, evolve, nextplay, evidence, recovery, grading]
links: [nextplay-independent-benchmark-entry, evolve-design-clarity-20261013]
---

# EVOLVE 原件、评分报告与恢复验收入口

当前本地实现、真实 Run 的只读核验、测试日志与待完成项见[2026-10-13 收尾记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-completion-progress-20261013.md)。具体范围以[集中确认单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-completion-contract-review-20261013.md)和用户后续指令为准，不用此页推断实时部署或成功数量。

**Why:** 大附件归档、完整评分报告、长事件记录是不同传输边界；只解决一种不能宣称全链路支持大文件。评分已完成后复制原件失败，也不应触发另一轮付费 Judge。共享 Case 的来源 Work 不等于该次评测所属 Work，权限应依据持久 Trial 绑定及隐藏等级判断。

**How to apply:**

- 查 EVOLVE `integration/judgeprovider/measurements.go`、`reports.go`、`infrastructure/evidencearchive`：评分调用完成状态先持久化，报告引用只允许登记的同源 Provider，验证业务/调用/摘要及文件哈希；重启只读取同一次调用和缺失块，成功归档后才冻结平台引用。
- 查 `queries/evidence_files.go`、`integration/evidenceresolve/authorization.go` 和对应测试：下载与 Agent 读取都核对 Trial 和冻结 assessment，不能凭 CAS 哈希或引用内自报归属授权；共享 Case、跨业务、隐藏题及兄弟题分别测试。
- 查 Nextplay `grading_reports.py` 与 `API.md`：报告只有显式协商时才改用引用；数据库 JSON 调整键序时，应按 JSON 值核对清单，再用封存原字节校验成员。完整文件与摘要不得互相替代。
- 查 `worker/evidence_cleanup.go` 和 `evidencearchive/store_test.go`：未完成传输用独立租期和活动锁清理，已发布清单不能随临时任务清理。
- 查 `executor/identity.go`、`infrastructure/{memory,postgres}/executors.go` 及评分恢复集成测试：付费评分完成和原报告归档完成是两个时间点。所属 Run 仍活跃时，连接和评分声明必须保持可恢复；重新探测不能绕过登记保护。
- 查 Nextplay `event_archive.py`、`grading_evidence.py`、`judge_bundle.py`：长事件原件与索引分开，按字节偏移读取、校验归档及成员哈希；元数据边界不等于附件边界。执行时采集仍积累内容的限制须明确，不把传输流式化说成全程恒定内存。
- 查 Nextplay `resource_control.py` 与 Snapshot 服务：先冻结实际目标，后准备候选，再以执行回执证明应用；目录标为只读的资源，后端必须同样拒绝替换。快照发布需先持久化，回读可以流式核验但不改变旧哈希语义。
- 查 Case 领域准入、Studio 导入和 `0033_evolve_case_content_limit.sql`：提高 HTTP 上限不能遗漏数据库约束，JSONB 存储形式也不等于请求字节数。回滚保留大 Case 的不可变历史。
- 查本轮收尾记录的 `large-original-local-check.py` 与日志：真实不同数据块、本地服务中断续取和最终哈希是本地技术证明；fixture 元数据仓库、跨 Pod 持久卷、真实 Judge 和完整业务闭环须分别标注。
- 查 `MetricUpdateScope` 与 `StandardEditorStore`：共享指标编辑需说明未来普通评测与冻结历史的差异，名称与实际定义同步；不能用猜测计数冒充真实引用清单。
- 新 SQL 同时核对迁移 ConfigMap 与 Job 参数。SQL 文件存在、单元测试通过都不代表真实环境迁移已执行；共享 PVC/NAS 与 1 GiB 实际传输须独立验收。
- 结果页面按执行异常、评分异常、质量未达标分别组织，可读回答优先，原件和诊断按需展开。实时数量、截图及技术测试的适用范围只查收尾记录。
- 在干净的最新 main 工作区整合后重跑验证，不能把旧实施分支通过直接当作合并通过。Nextplay 的 Agentic Judge 测试依赖 `eval-runner/agentic-judge` 的构建产物；先按其 package 入口运行 `pnpm test`，再跑 Python Judge 回归。缺少 `dist/system-prompt.json` 属于构建前提未满足，应与业务逻辑失败区分。整合基线和日志只查收尾记录。
- Benchmark 将评测记录与趋势分开；通过率必须伴随已判定覆盖和异常数量，避免部分样本误导成整批通过。接入向导读取失败须保留未知/失败反馈，不能转成空列表后引导重复登记；已登记对象应进入管理页，首次直接评测进入 Benchmark。当前页面完成度和截图仍以收尾记录为准。
- 查 `evaluation/live_http_batch.go`、`integration/httpjobs` 与回归：Case 本体和批次封装的容量不同；无效输入必须落成逐题终态，不能反复耗尽 Worker 时间片。远端接纳回执丢失或无法解码时，仍使用冻结调用身份和截止时间，截止后先保存取消意图，再追踪原批次，不把连接恢复当成重新起跑。
- 查 `v3/ledger/LedgerLineage`、`TaskLineageGraph` 与 `CandidateResultsStore`：任务谱系复用完整 Run 身份，图形折叠不能丢历史；验证表单不能遮掉已完成结果。Run 冻结基线可能来自另一 Work，应复用业务级受权读取和固定基线比较，不能从当前任务列表缺失推断基线不存在，也不能借此允许任意跨任务比较。打开基线结果必须保留其原 Work，返回后保留原候选/Run 选择。
- 查 `BaselineResultsPanel`、`baselineMetrics` 与收尾截图：接受候选、实际应用回执、比较口径一致和指标变化是不同事实；没有判定不能展示 0%。差值须遵守指标身份、原单位与覆盖条件。真实父容器、窄屏滚动、部分读取失败和精确跳转需浏览器核验；本地 fixture 数字不代表真实调优增益。

2026-10-13 用户明确要求：改动通过 PR 审查合并；**dev 部署须再次询问，不频繁自动部署**。这撤回了此前本轮连续部署的默认授权。PR、迁移、部署与真实业务验收分别记录；本地界面 fixture 不能充当 dev 或自然 Agent 验收。
