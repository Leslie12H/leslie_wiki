# leslie_wiki 目录

> 全库入口。每个 session 先读本文件,再按任务相关性 Read 具体 page。
> 维护规矩见 [CLAUDE.md](./CLAUDE.md)。

## Domains(业务系统)

### vidmuse — [业务全景](domains/vidmuse/README.md)
- [Workflow Catalog、Thread 与 Plugin](domains/vidmuse/refs/workflow-catalog-thread-plugin.md) — 返回体限额、Git revision 发布、缓存/Job 重建验收、路径执行和字符串 null 过滤排查指针
- [aion](domains/vidmuse/systems/aion.md) — agent/runtime/media generation 后端平台
- [vidmuse-zeus](domains/vidmuse/systems/zeus.md) — Vidmuse 产品 REST API + AION relay
- [vidmuse.ai](domains/vidmuse/systems/vidmuse-ai.md) — 面向用户的 Web 前端
- [2026-07-02 Vidmuse 三仓库代码扫描](domains/vidmuse/refs/2026-07-02-repo-scan-aion-vidmuse-zeus-vidmuse-ai.md) — aion/vidmuse-zeus/vidmuse.ai 角色、入口和 V2 relay 链路
- [admin](domains/vidmuse/systems/admin.md) — 管理后台(多 release 工作树)
- [testing](domains/vidmuse/systems/testing.md) — 测试仓库群
- [admin 深入知识](domains/vidmuse/admin/README.md) — admin 子系统索引
- [2026-06 admin 知识地图](domains/vidmuse/admin/projects/2026-06-admin-knowledge-map.md) — 过去一个月 admin 主题索引
- [Test Center V2 MCP direct tool call](domains/vidmuse/admin/projects/test-center-v2-mcp-direct-tool-call.md) — mcp_tool_call case/job/run 闭环
- [Suno media_urls MCP 回归](domains/vidmuse/admin/refs/suno-media-urls-mcp-regression.md) — 分享/歌曲/音频三路 Case 与解码验收指针
- [Thread Analytics 读路径 3 秒体检 2026-09-02](domains/vidmuse/admin/projects/2026-09-02-thread-analytics-read-path-3s.md) — 五个病根(Python 逐行合并 JSON/五套完整性契约/全局 fail-closed 脏判断/ID map 进 JSON/对比 Tab 无聚合)+ 四阶段方向(日投影/统一发布契约)
- [2026-07-06 Test Center V2 全链路审查](domains/vidmuse/admin/projects/2026-07-06-test-center-v2-audit.md) — P0:dedupe migration MySQL 跑不过、credits 门控不对称、cancel_run 全量重算污染
- [VidMCP auth/runtime context](domains/vidmuse/admin/pitfalls/vidmcp-auth-runtime-context.md) — MCP_URL/token 与 X-Auth-* 不要混淆
- [CDN user-generated images](domains/vidmuse/admin/pitfalls/cdn-user-generated-images-video-cdn.md) — aion-user-base/assets/images 走 video CDN
- [报警 Problem 标题与当次报告](domains/vidmuse/admin/pitfalls/monitoring-problem-title-vs-incident-report.md) — 历史聚类标题不能代替当次结论，发送摘要前核对证据等级
- [Problem 认领触发历史告警回复](domains/vidmuse/admin/pitfalls/monitoring-problem-claim-replies-to-historical-alerts.md) — 弱聚类、来源话题绑定与旧卡刷新、PR #881 及生产回读边界（2026-09-15）
- [Tool Errors 启动与 Analytics 内存](domains/vidmuse/admin/pitfalls/tool-errors-bootstrap-and-analytics-memory.md) — JS MIME、Web/Worker 内存证据、异步客户端原循环与 PR #881 回归入口（2026-09-15）
- [报警日报证据丢失链路](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md) — 输入与引用完整性、结构失败停当天、调查 Preset 协议边界，以及同窗生成与补发回读验收（2026-09-17）
- [日报滚动部署启动交接](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-startup-handoff.md) — 循环缺失、旧镜像自动补跑、周末窗口对账与历史补偿缺口、PR #878 发布验收及卡片统计口径（2026-09-14）
- [Tool 日汇总状态与已有数据展示](domains/vidmuse/admin/pitfalls/tool-daily-updating-hides-existing-data.md) — HTTP 成功后的数据门禁、部分日误挡、独立 Worker 核验及 PR #878 本地回归/CI 边界（2026-09-14）
- [监控大盘窗口与「天」的口径](domains/vidmuse/admin/pitfalls/monitoring-dashboard-window-and-day-semantics.md) — 三套时间基准 + 全量/窗口计数混用导致数字自相矛盾
- [Analytics 维护调度器历史重建压垮 PolarDB](domains/vidmuse/admin/pitfalls/analytics-maintenance-historical-rebuild-pressure.md) — 2026-09-07 三个放大器(30s 排水/审计也重写/replay 并发 16)+ 退役 5 阶段 + 冻结线 + 为何单独建库无用
- [admin 定时报表机制与死配置](domains/vidmuse/admin/pitfalls/admin-scheduled-report-mechanisms.md) — 外部 /cron、全局 owner 与独立日报调度、日级 guard 及失败重试边界（2026-09-17）
- [vidmuse-admin harness](domains/vidmuse/admin/refs/vidmuse-admin-harness.md) — Test Center V2 / VidMCP harness 指针

- [时间线预览时长与导出版本](domains/vidmuse/refs/timeline-preview-duration-and-export-version.md) — 轨道时长、分秒帧显示及历史混流版本核验指针

- [Kling 漏传分辨率导致 billing/500](domains/vidmuse/pitfalls/kling-billing-missing-resolution-20260909.md) — 2026-09-09 六次请求原始日志：价格 properties={}、未进入 Zeus 预扣费，I2V 输入缺图片/时长/分辨率

### maxwell — [业务全景](domains/maxwell/README.md)
- [Executor 声明与执行实证](domains/maxwell/pitfalls/executor-declaration-vs-execution-evidence.md) — 声明/连接/真实回执分开，历史配置绑定、内存克隆与 CAS 保留核验指针
- [Nextplay Runner 创建 Thread 遗漏 Preset 绑定](domains/maxwell/pitfalls/nextplay-runner-thread-preset-binding.md) — 2026-09-15 基准在临时资源物化后、Thread 持久化前 400；调用方与 Runtime 契约因果、失败证据和恢复验收指针
- [VidMuse 无库 Adapter 实施](domains/maxwell/projects/vidmuse-stateless-adapter-implementation.md) — 普通 Thread 等价性硬要求、AION #1760 / Zeus #525 回退与本地保留、DEV Manager/固定 Runner 分别核验；文件/账号迁移、捕获影响及公共 SQL 审核指针（2026-09-14）
- [VidMuse Git 候选准备](domains/maxwell/projects/vidmuse-executor-candidates.md) — 独立候选 CLI、独立 Plugin 名称部署、账号覆盖与共享部署边界核验指针
- [VidMuse Executor P1 实现入口](domains/maxwell/projects/vidmuse-executor-p1.md) — P1 实现、轻量适配器去数据库方向、创建重试与部署核验指针
- [EVOLVE v2.2 工作台](domains/maxwell/refs/evolve-workbench-v22.md) — 固定框架、行内判卷、设计与真实接口边界及验证入口
- [EVOLVE 已接收输出与未冻结证据集](domains/maxwell/pitfalls/evolve-received-evidence-before-run-freeze.md) — Attempt 输出与冻结证据的区别；SQL 审计定位 CAS，读写分离下的状态机一致性；修复 PR #276 与租约接管回归
- [EVOLVE 全流程稳定性审计](domains/maxwell/refs/evolve-evaluation-blockers-20260910.md) — 取消收敛、大证据引用、判卷重试、故障回归与 PR/DEV 发布验证指针
- [EVOLVE 重试状态转换](domains/maxwell/pitfalls/evolve-retry-state-transition.md) — 已接受任务后的重试、Worker 恢复与未评分展示口径
- [EVOLVE 抽屉完整展示](domains/maxwell/pitfalls/evolve-drawer-overflow.md) — 长编号/正文滚动/窄屏与真实组件验收指针
- [EVOLVE 判卷解释与优化方法](domains/maxwell/refs/evolve-explainability-and-optimization.md) — PR、DEV 发布、统计口径与 review 回归、Prompt/Skill 同步核验入口
- [VidMuse A2A 执行器契约](domains/maxwell/refs/vidmuse-a2a-executor.md) — 独立仓库方案、现有 API 复用边界、Git 分支隔离与运行版本承载；评审阶段
- [Quality 域 eval/自迭代指针](domains/maxwell/refs/quality-eval.md) — eval schema/judge/optimizer/harness 代码位置 + 2026-07 机制要点
- [旧 Quality 退役核验](domains/maxwell/refs/quality-retirement-audit.md) — 主动入口退出与源码/建表残留、混合业务库删除边界
- [EVOLVE 原方案对象→当前实现映射](domains/maxwell/refs/evolve-original-design-vs-current.md) — 2026-09-07 index.html 的 workspace/ 目录 vs artifacts/表/Studio 页面;Base 缺失、Diagnosis/Metrics 有壳无方法、探索期右栏空白
- [EVOLVE 调优 Agent Preset 业务私有坑](domains/maxwell/pitfalls/evolve-agent-preset-business-scoped.md) — 2026-09-04 单 Preset 写死导致跨业务不可用;根因链 + 共享调优 Agent 方案指针
- [EVOLVE 调优 Agent 运行逻辑审计](domains/maxwell/pitfalls/evolve-tuning-agent-loop-audit-20260909.md) — 2026-09-09 main 审计：双冻结路径无通知、确认不校验 payload、产物形状对 Agent 不可见、context 混入被测输入等 8 点
- [EVOLVE 对 Maxwell 目标的调优接应](domains/maxwell/projects/evolve-maxwell-tuning-receiving.md) — 2026-09-09 进行中：分支/拍板点（基准由 EVOLVE 获取、level 由预检决定、不用累计 patch）/第二轮待追加项

## Disciplines(职业知识)
- [testing](disciplines/testing/README.md) — 测试方法论 *(暂空)*
- [dev](disciplines/dev/README.md) — 开发实践 *(暂空)*

## Global(通用)
- [飞书表格字段与合并行同步](global/pitfalls/feishu-sheet-header-and-merge-sync.md) — 表头映射、完整读取、状态优先级及幂等核验指针

---
*开新业务:`cp -r domains/_template domains/<新业务名>` 并在此加一节。*

- [Admin 服务 JWT 权限与有效期](domains/vidmuse/admin/pitfalls/service-jwt-permissions-and-expiry.md) — 部署鉴权、type 字段映射、权限范围与 WAF 假 200 的验证指针

- [EVOLVE PR 281 DEV 发布证据](domains/maxwell/refs/evolve-pr281-dev-deployment-20260911.md) — 2026-09-11，0007 迁移、API/Worker 与 Studio 188 发布和验收指针。

- [广告画布 PRD 六题回归](domains/maxwell/refs/evolve-pr281-dev-deployment-20260911.md)：4 pass / 1 fail / 1 error，含重试成功及取消清理收敛的边界。

- [PRD 回归异常追查](domains/maxwell/refs/evolve-pr281-dev-deployment-20260911.md) — 模型 stop 空交付、model_stream_failed 与双层重试预算、取消确认边界，及正文/维度详情 UI 修复入口。

- [EVOLVE 历史运行对比入口](domains/maxwell/refs/evolve-pr281-dev-deployment-20260911.md) — 2026-09-11，同任务 Run 对照、有效评分分母和可比性边界的实现指针。

- [EVOLVE 评测体系复盘](domains/maxwell/refs/evolve-pr281-dev-deployment-20260911.md) — 2026-09-11，业务完成标准、Run 可比性证据与端到端验收边界。

- [历史 Run 服务端可信度校验](domains/maxwell/refs/evolve-pr281-dev-deployment-20260911.md) — 2026-09-11，回执/Judge 检查、双分母、pending 计数与完整任务页验收指针。
- [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md) — Prompt/Skills/知识分工、测试样例隔离与实际交付验证入口。

- 长任务预算、恢复与多轮编排验收边界：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- Agent 配置归属与实际绑定核验：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- 调优资源同步与 PR #282 DEV 验证：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- 新 Skill 试用、知识工具契约与 Case 版本/预算启动阻塞：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- 默认免填预算、业务审查模型接入与工具契约分层排障：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- 真实用户评测路径、一次确认准备与首页旧 Run 状态坑：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- 启动摘要层级、结果加载语义与交互验收：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- 启动摘要统一现有 Tag、Collapse 与设计 tokens：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- 结果摘要、维度布局和侧栏一致性：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- PR #284 DEV 发布与真实评测边界：见 [QA Case Agent 正式使用资源](domains/maxwell/projects/qa-case-agent-usage-resources.md)。

- [监控代码源范围阻断认领](domains/vidmuse/admin/pitfalls/monitoring-code-scope-blocks-claim.md) — 安装权限扩展、节点网络、结果引用契约，PR 63/872 与恢复核验指针（2026-09-12）。

- [日报定时失败诊断](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)：2026-09-12 JSON 输出失败、当天重试门禁及历史与复现证据边界。

- 日报 JSON 格式本地修复与验证：见 [日报失败诊断](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md) 的 2026-09-12 修复指针。

- 日报结构化返回与 Chat 复制交互：见 [日报修复指针](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md) 的 2026-09-12 后续修复。

- Chat Shift 连选及 Esc 清空验证指针：见 [Chat 与日报修复记录](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)。

- [Admin PR #875](https://github.com/world-sim-dev/vidmuse-admin/pull/875)：日报格式与 Chat 多选复制统一交付，见 [修复记录](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)。

- [监控 GitHub App 配置与 Secret 读取](domains/vidmuse/refs/monitoring-github-app-config.md) — App/installation 定位、生产凭据指针、指纹校验与 ACK 注解泄露防护（2026-09-12）。

- [Nextplay 真实 Case 演示讲稿](domains/maxwell/refs/evolve-demo-runbook-20260914.md) — 25 分钟操作路线、真实预演与同口径候选比较的验收边界（2026-09-14）。

- [Nextplay 真实评测契约复核](domains/maxwell/pitfalls/nextplay-real-run-contract-review-20260914.md) — 执行声明、固定文件根目录、回执配置、轨迹大小、首个真实基准通过与候选验收指针（2026-09-14）。

- [Maxwell 知识库大文件上传限制](domains/maxwell/pitfalls/knowledge-upload-limits.md) — 上传解压预算、分块总量、导入前置校验、PR #295 及 CI 浅克隆基线排查（2026-09-14）。

- [分镜标签同步与视觉核验](domains/vidmuse/pitfalls/storyboard-label-sync-without-visual-verification.md) — 文本批量一致不等于素材语义一致；封面、播放、时长与导出版本的复验边界（2026-09-16）。

- [Runner 日志范围与错误计数](domains/vidmuse/pitfalls/runner-log-scope-and-error-count.md) — tail/full 与轮转边界、重复异常归并、精确帧输出校验及恢复核验方法（2026-09-16）。

- [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md) — 双协议报告、PR 883/64、脱敏与恢复边界、生产发布与工具同步、发布后 OOM 和严格回放验收指针（2026-09-16）；2026-09-17 补充严格报告接收与真实卡片回调分层验收边界；补缺少 Pod 注解绑定、fresh-evidence 恢复与大文件分段读取。
- [修复尝试独立于告警认领](domains/vidmuse/admin/pitfalls/monitoring-repair-is-separate-from-claim.md) — 修复按钮、独立任务与写入身份、来源话题和 Draft PR 完成边界（2026-09-16）。

- [Runtime 托管业务 Judge 评审方案](domains/maxwell/projects/evolve-runtime-judge-review-20260916.md) — Nextplay 业务判卷包、逐题配置、冻结证据、版本更新与通用平台改造的飞书评审入口（2026-09-16）。
- [候选需可编辑基线，证据重判需同口径比较](domains/maxwell/pitfalls/evolve-candidate-editable-baseline-and-regrade-comparison.md) — Nextplay 候选真实应用、同证据判卷波动、live/evidence-only 对照、Scorecard usage 修复部署与正式决策报告验收指针（2026-09-16）。

- [Analytics Worker 超大聊天 OOM](domains/vidmuse/admin/pitfalls/analytics-worker-oversized-history-oom.md) — 完整响应内存放大、崩溃重试循环、流式体积准入、生产发布与 RSS/cgroup 恢复验收指针（2026-09-16）。

- 2026-09-16 报告协议首次真实 canary 的空替代哈希与隔离 Problem 风险：见 [报告与聊天分离边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)，修复 PR #65、下游 trace 全集、结构预检 PR #66、记录定位与验证入口。

- 原报警 workload 与下游部署证据不能互相替代，见 [报告协议验收边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)（2026-09-17）。

- [Studio 发布变量与候选展示](domains/maxwell/pitfalls/studio-release-env-and-candidate-results.md) — composite action 同层 env 空值导致白屏、版本 CDN 准入和单候选结果证据边界（2026-09-17）。
- 2026-09-17 日报结构错误的有界修复与同窗只读回放入口见[日报证据链](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)；生成通过不等于补发。

- 2026-09-17 调查重试文本超出 Runtime 单消息容量的无损分段与幂等回执验收见[报告协议边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)。

- 候选正文、空 Benchmark 与多 Case 并发的区分见 [Studio 与候选验收](domains/maxwell/pitfalls/studio-release-env-and-candidate-results.md)，PR #309 提供入口与调度回归（2026-09-17）。
- 2026-09-17 分段报告上下文恢复、采集与证明部署关联对齐、历史快照和标量 observation 边界见[监控报告验收](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)，修复指针 Admin #885 / MCP #67。

- 2026-09-17 真实飞书认领/原卡片回填、临时样本清理与专项策略 CI 兼容门禁见[报告协议验收边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)。
