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

- 查 `benchmarks/BenchmarkTrendStore`、`benchmarkTrendModel` 与本轮收尾记录：记录分页不是完整趋势范围，指标也不能只从一次评测发现；同一 Benchmark 版本内读取完整 Run 目录，再有界并发读取各次全部指标页。评分代际、口径或更新时间变化时重读，不能混合分页快照。失败位置保留，原单位、精确指标身份及覆盖不足应直接可见；不从历史曲线推断真实调优增益。截图、当前完成度与测试结果只查收尾记录。
- Benchmark 关联 Case/规则阅读应使用受权投影，不遍历全资产库或虚构 Work 拼引用；新增契约须先确认。当前补充清单及是否实施以收尾记录为准，预览读取不能调用会创建修订的普通评测准入路径。

- 查 Nextplay `grading_evidence.frozen_case_attachments`、`grading.grade` 与 `AgenticJudge._bundle`：执行附件不一定出现在输出原件中，评分应读取本次冻结 Case 的附件，不能回退原题库；新建、替换、删除都需覆盖。复用执行输入校验器核对原字节与哈希，临时来源须存活至全部 Judge 完成，异常后同样清理；缓存身份包含附件元数据与哈希，不包含本机临时路径。具体发现、回归与全分支审查边界见[2026-10-14 链路台账](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)，不把确定性 Judge 当成真实评分。

- 查 [65 题逐条失败归因记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-65-failure-audit-20261014.md)：错误数量不能由单题抽样归因；逐条核对原执行中的 Thread、完成标记与清理状态，再查看原评分报告。未执行成功需要重跑；已有有效原件而 Judge 初始化失败应重评，保留原历史记录。具体数量与环境状态只读该记录，不在 Wiki 固化为实时事实。
- 查同一核验记录的 Actions 元数据和对应 SHA 源码：一次修复部署成功后，后续从另一基线发布可能覆盖修复；应按组件、SHA、部署时点和失败观测时点还原发布链，不能仅凭“修复曾上线”排除旧代码。后续交付走审查合并后的统一 main，仍需单独部署授权。
- 查 Nextplay `grading.grade` 与 Studio `TrialDetailPanel`：缺分应保留原 Judge 说明并遵循既有 UTF-8 字节上限，完整报告保持原文；默认展示名称、值、判定和覆盖，长说明按需展开。0 和 false 是有效值，技术失败不能换算成质量零分；渲染必须转义外部文本。相关桌面/窄屏截图与技术测试仍查核验记录。

- 查 `commands/resource_tuning_baseline.go`、`resource_baseline.go` 与命令入口回归：从历史评测启动的调优，资源读取必须沿仓库保存的 Work → 来源 Run 关系取得冻结 Variant，再校验 Artifact 归属/哈希、执行器、目标、版本及清单；不能仅凭调用参数抓当前配置。来源是候选时，阅读内容要叠加其原有替换，但保持原始基线和完整 Variant，避免下一轮无意撤回父候选改动。旧快照不可读应失败，不能静默回退当前版本；直接新评测仍可捕获当前配置。Why：评测结论对应具体配置，读取漂移会破坏归因与复测。How：测试真实 StartRunTuning 后目标变更、旧快照不可读、清单身份冲突及父候选继承，验证范围见[链路审查台账](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)，不把本地适配器回读当作真实候选运行。

- 查 `prepareProviderCase.ts`、`commands/provider_case.go` 及对应回归：多 Provider 共用输入时，应先派生所有身份字段，再统一计算摘要；目录顺序不能改变输入身份，真实摘要冲突仍应拒绝。仅后端正确不能避免前端提前报错。
- 查 [Case 编辑与规则定位审查](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)：复制原题为新身份、编辑任务及评分说明，应核对 Judge 实际收到的冻结内容和原题不变；确定性 Judge 回归不能证明真实 Agent 取分。规则目录的数组下标也不等于稳定维度身份，合法换序或子集必须单独验证，防止显示和编辑相邻指标。Why：固定模板及原题库同序会掩盖新题路径错误。How：对照 Provider 合同允许的结构变化，使用由 Provider 声明的稳定身份定位；平台不推断业务字段，新增目录契约须先确认。当前方案、授权与修复状态只查审查台账，不在 Wiki 固化为已完成。

2026-10-13 用户明确要求：改动通过 PR 审查合并；**dev 部署须再次询问，不频繁自动部署**。这撤回了此前本轮连续部署的默认授权。PR、迁移、部署与真实业务验收分别记录；本地界面 fixture 不能充当 dev 或自然 Agent 验收。

- 查 `CaseContentPreview`、`JsonSchemaReadView` 与 `ProviderMetricStore.catalogState`：用服务已声明的 Schema 阅读冻结 Case，默认值不能补进原内容，未知字段和完整 JSON 必须保留；任务和评分区域共享目录读取。Why：结构化输入的协议字段容易遮住真实用户需求，目录读取失败也不能被解释为未配置规则。How：分别验证加载、列表失败、明细失败、服务不存在和未声明定位，失败原位重试；同时覆盖 0/false、转义、未知字段、窄屏和原题库内容。页面、测试及发布状态仅查[链路审查台账](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)，既有按数组位置定位的语义缺口不能由布局改进掩盖。

- 查 `metric/catalog.go`、`providerMetricModel.ts` 与 Nextplay `grading_rules.metric_catalog`：指标规则定位由 Provider 声明集合、身份指针和精确值，平台只接受唯一匹配；不要把数组位置当身份或在歧义时回退旧下标。Why：新 Case 合法换序、取子集及编辑中位置变化会使旧位置指向兄弟指标。How：目录预览、Case 阅读及写入共用解析器；写入时重读当前材料和关联，并继承只读父级，陈旧事件不能覆盖较新的规则。指针必须区分缺失与显式空根路径，限制只加在声明契约，不顺手收紧其他通用读写调用方。验证、授权和发布状态见[2026-10-14 链路台账](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)，技术 Judge 与浏览器本地编辑不等于真实评分。

- 查 `commands/case_assets.go`、`casecatalog/save_request.go` 与两个仓库存储适配：原请求指纹和派生后的评分内容是两种身份，前者须与修订同事务保存；已成功请求的重试先核对保存身份和当前/历史权限，再返回原修订，不能依赖实时 Provider。Why：自动补齐身份/摘要会改变内容，目录升级或停机会让丢回执的成功保存被误报失败；仅比较最终内容也会吞掉派生擦除的原文差异。How：同时测试 create/revise、目录升级/停机、新头存在、同键异文、并发准备不同结果和隐藏状态改变；旧 NULL 行不伪造原文，内部字段不进入公共 JSON，内存复制和 SQL 批量写入须显式保留。JSONB 文本空白不等于内容差异，应以规范化内容与哈希验证；本地 PG 专项通过不替代所有可选集成测试。实现、迁移和未完成项只查[链路台账](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)。

- 查 `application/benchmarkcontent`、`measurements/current.go`、`queries/benchmark_definition.go` 与 `BenchmarkContentStore`：Benchmark 内容阅读复用普通评测的只读解析，不能调用冻结写入；先授权所有关联成员，再返回元数据分页，正文按精确修订另读。Why：只显示资产 ID 无法确认实际测试内容，客户端全库扫描会造成越权和大数据读取；仅当前页身份不能防止未显示共享规则变化后混合分页。How：游标绑定关联 Case / 指标 / Provider 身份，区分 current 与 snapshot，实际发起时另存冻结结果；同一 Artifact 多来源时不猜编辑目标。大配置分页应计字节而非只计题数，并保证单题完整和游标推进；共享字段重复、固定响应部分与单题大行需明确容量边界。编辑返回保留阅读位置，陈旧游标提供刷新。实现、范围及本地 / 真实评分证据只查[链路台账](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)。

- 查 `queries/metric_usage.go`、窄仓储 `MetricUsageRepository` 与 `MetricUpdateScope`：修改共享指标的影响应按当前 Case 头、当前评分标准和 Benchmark 实际组合分别计算；Benchmark 中的旧 Judge 引用不能被目录新头替代，同 key 的 Case 内联规则会覆盖共享引用。Why：单看名称、历史成员或当前标准目录会漏报/误报修改范围。How：只投影 key/reference，先验证关联对象和全部成员权限，再返回名称和受影响用例数；候选分页为空仍可有后页，不承诺全库总计或跨页原子快照。编辑跳转保留草稿，读取失败提供恢复入口。契约、实现及本地/真实验收边界见[集中台账](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-final-flow-review-20261014.md)，不要用示例影响数代表真实评分成功数。

- 查 `postgres/repository_integration_test.go`、`artifact_access_integration_test.go` 与[数据库及执行链路复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-repository-validation-20261014.md)：跨 Work 测试需创建合法资产成员关系，拒绝后核对状态未变；临时 PostgreSQL 明确使用 UTF-8，查询计划测试先建立代表夹具的统计信息。Why：错误的夹具归属、SQL_ASCII 字符语义和缺失统计会在不同层制造假回归，不能通过放宽生产校验解决。How：保留原失败证据，先分别验证业务保护和环境前提，再运行整个可选数据库包；Nextplay 使用服务镜像 / CI 对应的 Python 环境并明确当前源码路径。通过数量、命令、停止临时实例及仍缺真实验收的状态只查复核记录，不把技术通过变成可部署结论。


- 查 Nextplay `repository.create_job`、`grading_repository.create`、`Repository.heartbeat` 与 `test_repository_mysql_integration.py`：幂等入队要核对真实 InnoDB 的锁顺序；不存在记录上的先读后插，以及 INSERT IGNORE 后升级排他锁，均可能使并发重试死锁。续租同样要验证原租约仍有效，不能仅验证 Worker 名称。Why：游标 mock 不表现间隙锁、共享锁升级或数据库实际影响行数，顺序测试会漏掉网络重试时的失败。How：使用显式隔离的本机数据库验证同键并发、异文冲突、取消先到、原件不可变和过期 Worker，保留失败与修复后证据；迁移、65 条输入落库和大原件读回都不等于模型评分。当前版本、数量、代码同步与停止实例记录只查[本地 MySQL 复核](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-nextplay-mysql-review-20261014.md)，不从本地数据库版本推断生产兼容或部署授权。
