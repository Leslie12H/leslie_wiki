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
- [日报定时失败诊断](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)：2026-09-12 JSON 输出失败、当天重试门禁及历史与复现证据边界。
- [监控大盘窗口与「天」的口径](domains/vidmuse/admin/pitfalls/monitoring-dashboard-window-and-day-semantics.md) — 三套时间基准 + 全量/窗口计数混用导致数字自相矛盾
- [Analytics 维护调度器历史重建压垮 PolarDB](domains/vidmuse/admin/pitfalls/analytics-maintenance-historical-rebuild-pressure.md) — 2026-09-07 三个放大器(30s 排水/审计也重写/replay 并发 16)+ 退役 5 阶段 + 冻结线 + 为何单独建库无用
- [admin 定时报表机制与死配置](domains/vidmuse/admin/pitfalls/admin-scheduled-report-mechanisms.md) — 外部 /cron、全局 owner 与独立日报调度、日级 guard 及失败重试边界（2026-09-17）
- [vidmuse-admin harness](domains/vidmuse/admin/refs/vidmuse-admin-harness.md) — Test Center V2 / VidMCP harness 指针

- [时间线预览时长与导出版本](domains/vidmuse/refs/timeline-preview-duration-and-export-version.md) — 轨道时长、分秒帧显示及历史混流版本核验指针
- [VidMuse 生成扣费与导出证据链](domains/vidmuse/pitfalls/thread-output-billing-and-export-evidence.md) — 模型产物、Zeus 实扣、DSL 成片、渲染任务和浏览器下载分开核验；99% 是时间估算上限

- [Kling 漏传分辨率导致 billing/500](domains/vidmuse/pitfalls/kling-billing-missing-resolution-20260909.md) — 2026-09-09 六次请求原始日志：价格 properties={}、未进入 Zeus 预扣费，I2V 输入缺图片/时长/分辨率

### maxwell — [业务全景](domains/maxwell/README.md)
- [VidMuse Git 候选准备](domains/maxwell/projects/vidmuse-executor-candidates.md) — 独立候选 CLI、仅 DEV 发布隔离、执行账号与公共依赖版本核验指针
- [VidMuse Executor P1 实现入口](domains/maxwell/projects/vidmuse-executor-p1.md) — P1 实现、轻量适配器去数据库方向、创建重试与部署核验指针
- [EVOLVE v2.2 工作台](domains/maxwell/refs/evolve-workbench-v22.md) — 固定框架、行内判卷、设计与真实接口边界及验证入口
- [EVOLVE 已接收输出与未冻结证据集](domains/maxwell/pitfalls/evolve-received-evidence-before-run-freeze.md) — Attempt 输出与冻结证据的区别；SQL 审计定位 CAS，读写分离下的状态机一致性；修复 PR #276 与租约接管回归
- [EVOLVE 全流程稳定性审计](domains/maxwell/refs/evolve-evaluation-blockers-20260910.md) — 取消收敛、大证据引用、判卷重试、故障回归与 PR/DEV 发布验证指针
- [EVOLVE 重试状态转换](domains/maxwell/pitfalls/evolve-retry-state-transition.md) — 已接受任务后的重试、Worker 恢复与未评分展示口径
- [EVOLVE 抽屉完整展示](domains/maxwell/pitfalls/evolve-drawer-overflow.md) — 长编号/正文滚动/窄屏与真实组件验收指针
- [EVOLVE 判卷解释与优化方法](domains/maxwell/refs/evolve-explainability-and-optimization.md) — PR、DEV 发布、统计口径与 review 回归、Prompt/Skill 同步核验入口
- [VidMuse A2A 执行器契约](domains/maxwell/refs/vidmuse-a2a-executor.md) — 独立仓库方案、现有 API 复用边界、Git 分支隔离与运行版本承载；2026-09-10 评估发现与 EVOLVE VariantManifest/receipt 合同冲突及对齐方式
- [EVOLVE 长程任务确认环节自动应答方案](domains/maxwell/refs/evolve-interactive-responder.md) — 2026-09-10 草案：input-required 现判失败、turns 是剧本、推荐 Responder Method + persona；分期与拍板点
- [Quality 域 eval/自迭代指针](domains/maxwell/refs/quality-eval.md) — eval schema/judge/optimizer/harness 代码位置 + 2026-07 机制要点
- [旧 Quality 退役核验](domains/maxwell/refs/quality-retirement-audit.md) — 主动入口退出与源码/建表残留、混合业务库删除边界
- [EVOLVE 原方案对象→当前实现映射](domains/maxwell/refs/evolve-original-design-vs-current.md) — 2026-09-07 index.html 的 workspace/ 目录 vs artifacts/表/Studio 页面;Base 缺失、Diagnosis/Metrics 有壳无方法、探索期右栏空白
- [EVOLVE 调优 Agent Preset 业务私有坑](domains/maxwell/pitfalls/evolve-agent-preset-business-scoped.md) — 2026-09-04 单 Preset 写死导致跨业务不可用;根因链 + 共享调优 Agent 方案指针
- [EVOLVE 调优 Agent 运行逻辑审计](domains/maxwell/pitfalls/evolve-tuning-agent-loop-audit-20260909.md) — 2026-09-09 main 审计：双冻结路径无通知、确认不校验 payload、产物形状对 Agent 不可见、context 混入被测输入等 8 点
- [EVOLVE 对 Maxwell 目标的调优接应](domains/maxwell/projects/evolve-maxwell-tuning-receiving.md) — 2026-09-09 进行中：分支/拍板点（基准由 EVOLVE 获取、level 由预检决定、不用累计 patch）/第二轮待追加项
- [EVOLVE 能力升级 P1–P4 实施](domains/maxwell/projects/evolve-capability-upgrade-20260910.md) — 2026-09-11 PR #281：5 项拍板、四阶段落地、评审三阻塞与 squash 基线前移的坑
- [EVOLVE errorPolicy=fail 把执行错误变成质量结论](domains/maxwell/pitfalls/evolve-error-policy-fail-breach.md) — 2026-09-15 破口：外部可设的聚合开关绕过协议/质量分层；不删枚举、只在 Run 准入拒绝、历史回放逐字节不变
- [EVOLVE 模型用量记账口径与落点](domains/maxwell/refs/evolve-usage-accounting.md) — 未知≠0/只记录不决策/不折算金额；判卷与非判卷两族指标；context 带外 Recorder 与冻结产物兼容锚点做法
- [EVOLVE v3 前端：任务→执行器映射与会话 N+1](domains/maxwell/pitfalls/evolve-v3-work-executor-mapping.md) — 2026-09-19 targetRef≠执行器 id（要读 TargetProfile.executorRef）；会话列表慢在前端逐条补读；sessions executorRef 参数实按 target_ref；v3 视觉须对齐 Studio tokens
- [影游 Agent Benchmark 综合评测报告 9.19 对照入口](domains/maxwell/refs/nextplay-benchmark-report-20260919.md) — 2026-09-19 报告结论（D4/D5 集中失败、四模型互补、补分敏感）与下一轮协议清单；EVOLVE 三层对照（协议/评分/执行）

### sisyphus — [质量平台](domains/sisyphus/README.md)
- [Sisyphus 质量平台](domains/sisyphus/README.md) — quality_dashboard 日投影/发版门禁、automation_triggers、Agent Token 与 project 边界；调度模型与 admin 不同
- [定时用例的 Admin 会话凭据过期](domains/sisyphus/pitfalls/scheduled-admin-jwt-expiry.md) — `event-tracking` setup 401 的时间线、Runner 凭据映射、Attempt 2 验证与账号池探测陷阱（2026-09-29）

## Disciplines(职业知识)
- [CI 范围与间接门禁](disciplines/testing/ci-scope-and-indirect-gates.md) — 路径分类、步骤条件、检查依赖图及失败聚合的收窄核验方法
- [testing](disciplines/testing/README.md) — 测试方法论 *(暂空)*
- [dev](disciplines/dev/README.md) — 开发实践 *(暂空)*

## Global(通用)
- [2026 年 9–10 月 OKR 照野责任范围](global/projects/2026-09-okr-zhaoye-scope.md) — O2 整体 owner、O1-KR4 独担、O1-KR1 / O3-KR3 共担，及跨团队阻塞的排期含义
- [飞书表格字段与合并行同步](global/pitfalls/feishu-sheet-header-and-merge-sync.md) — 表头映射、完整读取、状态优先级及幂等核验指针

---
*开新业务:`cp -r domains/_template domains/<新业务名>` 并在此加一节。*

- [Admin 服务 JWT 权限与有效期](domains/vidmuse/admin/pitfalls/service-jwt-permissions-and-expiry.md) — 部署鉴权、type 字段映射、权限范围与 WAF 假 200 的验证指针

- [Tool 日汇总状态与已有数据展示](domains/vidmuse/admin/pitfalls/tool-daily-updating-hides-existing-data.md) — HTTP 成功后的数据门禁、部分日误挡、独立 Worker 核验及 PR #878 本地回归/CI 边界（2026-09-14）


- Tool 指标发布实现与迁移检查：见 [tool daily 更新门禁](domains/vidmuse/admin/pitfalls/tool-daily-updating-hides-existing-data.md) 的本地实现指针（2026-09-11）。


- Tool 增量维护目标设计：见 tool-daily-updating-hides-existing-data 的 2026-09-11 设计指针；尚未实现。

- [生产 Admin 表退役审计](domains/vidmuse/admin/refs/prod-table-retirement-audit.md)：三张注册表候选、旧日汇总退役边界与生产只读核验入口（2026-09-11）。

- [监控代码源范围阻断认领](domains/vidmuse/admin/pitfalls/monitoring-code-scope-blocks-claim.md) — 安装权限扩展、节点网络、结果引用契约，PR 63/872 与恢复核验指针（2026-09-12）。

- 监控认领门禁修正：见 [代码源范围](domains/vidmuse/admin/pitfalls/monitoring-code-scope-blocks-claim.md) 的子集检查实现指针（2026-09-11）。

- [业务 Preset 接入 EVOLVE 评测](domains/maxwell/refs/evolve-preset-evaluation-entry.md) — Agent 管理页与执行器登记的区别、输入协议选择和最终结果验收指针（2026-09-12）。

- Nextplay 外层执行器角色和 JSON 文本 / A2A DataPart 边界：见 [业务 Preset 接入 EVOLVE](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 纠正记录。

- 外层执行器 Business AppKey 的获取、权限及托管凭据边界：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md)（2026-09-12）。

- Nextplay 评测业务与影游a2a 凭据归属、different origin 排查：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 业务边界纠正。

- 外层实际 Candidate Runner 的输入与文件证据映射：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 Prompt/Skill 核验指针。

- Nextplay 外层 Card 同源错误已定位 scheme/host 双差异；CDN/ALB 回源核验及五文件证据保存入口见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md)（2026-09-12）。

- 同源失败的客户端缓存与重试边界：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的部署版本 a158e6c1 核验指针（2026-09-12）。

- [监控 GitHub App 配置与 Secret 读取](domains/vidmuse/refs/monitoring-github-app-config.md) — App/installation 定位、生产凭据指针、指纹校验与 ACK 注解泄露防护（2026-09-12）。

- 五文件内容可由业务 Adapter 放入 evidence.output 复用已有 CAS/冻结/Judge；见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 方案收窄。

- 外层将 probe 当成业务请求并 ask_user：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 17:22 Trace 与预检分支核验。

- EVOLVE 连接检查与真实用例分离：A2A Card-only、HTTP 单次协议 POST、healthy unknown 可试跑与运行回执比较保护，见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 实现指针。

- EVOLVE PR #287 的 DEV 发布与原影游a2a 执行器连接复验：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 发布指针；未进行 Nextplay 真实评测。


- Nextplay 首轮工作区、执行目标刷新与创作场景纠正：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-12 19:20 核验指针；基准未选定，草稿修订与真实 Run 需分别验收。

- 判卷 endpoint 连带错误与托管业务凭据缺口：见 [EVOLVE 接入记录](domains/maxwell/refs/evolve-preset-evaluation-entry.md) 的 2026-09-14 核验，区分模型选择、Maxwell 业务 Key 与外部 A2A Token。

- [EVOLVE 判卷授权解耦修复](domains/maxwell/projects/evolve-judge-authorization-decoupling.md) — 2026-09-14：基于最新 main 的独立判卷准备入口、权限与回归指针；未部署。

- EVOLVE 判卷授权修复 PR #288 与 DEV 发布、Studio 196 入口核验见 [判卷授权解耦](domains/maxwell/projects/evolve-judge-authorization-decoupling.md)（2026-09-14）；未执行真实初评。

- 2026-09-14：首轮 Trial 远端交互阻断与评分状态误标的追溯入口见 [判卷授权后续核验](domains/maxwell/projects/evolve-judge-authorization-decoupling.md)。

- 2026-09-14：Nextplay 初评被 Candidate-only 包装规则阻断，现场证据见 [授权修复后续诊断](domains/maxwell/projects/evolve-judge-authorization-decoupling.md)。

- 2026-09-14：Runner 包源码评估与基准执行复用入口见 [判卷授权后续诊断](domains/maxwell/projects/evolve-judge-authorization-decoupling.md)。

- 2026-09-14：基准 Runner 正式迁至 nextplay-eval 源码修复，Maxwell 保留接入与 UI 修复，见 [双仓库实施记录](domains/maxwell/projects/evolve-judge-authorization-decoupling.md)。

- 2026-09-14：nextplay-eval 正式构建及线上 Skill/Prompt 更新见 [部署核验记录](domains/maxwell/projects/evolve-judge-authorization-decoupling.md)。

- [NextPlay 基准接入最终计划](domains/maxwell/projects/nextplay-benchmark-final-plan-20260914.md) — 复用现有 A2A Preset、共享执行能力、证据回读及 A/B/C 比较边界（2026-09-14）。

- [NextPlay 基准接入实施指针](domains/maxwell/projects/nextplay-benchmark-implementation-20260914.md) — 两仓草稿 PR、受控证据回读、复用 Maxwell 续答通道与实际验收边界。

- 发布核验：Nextplay benchmark 的 main 部署、Runner 和 Prompt 更新见 [实施指针](domains/maxwell/projects/nextplay-benchmark-implementation-20260914.md)。

- [EVOLVE 通用平台审查指针](domains/maxwell/refs/evolve-generic-platform-review.md) — PR #299 的证据/评分回归与 DEV 发布复验入口，含固定提交、版本化迁移和前后端发布顺序（2026-09-15）。

- [Nextplay Benchmark 导入与评分核验](domains/maxwell/refs/nextplay-benchmark-import-audit-20260915.md) — 转换契约、双层尺寸准入、评分证据、页面与跨 Work 复用检查入口（2026-09-15）。

- Nextplay 目标卡 unknown/回执不可用与真实 Trial 不一致：见 [导入与评分核验](domains/maxwell/refs/nextplay-benchmark-import-audit-20260915.md) 的能力卡诊断，区分 Card-only probe、能力声明和实际回执（2026-09-15）。

- [EVOLVE 迁移与 Agent 资源发布边界](domains/maxwell/refs/evolve-pr300-deployment-boundaries.md) — PR #300 同事务锁、程序回滚、独立资源同步与 DEV 只读预检入口（2026-09-15）。

- [EVOLVE 报告与结果语义审查](domains/maxwell/refs/evolve-pr302-review.md) — PR #302 的数组请求、共享 Agent 授权、阶段达标、统计缓存和配置诊断回归入口（2026-09-16）。

- PR #302 修复后的可执行回归入口见 [报告与结果语义审查](domains/maxwell/refs/evolve-pr302-review.md)，涵盖真实请求、运行状态与共享 Agent 授权（2026-09-16）。

- PR #302 合并后 main 的 DEV 发布与 Studio 子构建证据见 [报告与结果语义审查](domains/maxwell/refs/evolve-pr302-review.md)，强调发布 ref、SHA 与在线资源编号一致（2026-09-16）。

- [Nextplay Runner Thread 绑定与外层完成误读](domains/maxwell/pitfalls/nextplay-runner-thread-preset-binding.md)：HTTP 400 的跨仓库契约核验、D1–D5 资产与方法调用审计入口（2026-09-16）。

- 2026-09-16：Nextplay 导入向导与确认草稿/任务前置条件、隐藏题隔离、来源持久化和 Go 尺寸准入复验见 [导入与评分核验](domains/maxwell/refs/nextplay-benchmark-import-audit-20260915.md)。

- EVOLVE 截图能力误判的精确旧 Skill 哈希与业务 scope 证据见 [Runner 与目标判断排查](domains/maxwell/pitfalls/nextplay-runner-thread-preset-binding.md)（2026-09-16）。

- EVOLVE 共享 Agent 资源归属、10 Skills 与 Prompt 同步回读、Runner 修复包保留配置见 [Runner 与资源发布核验](domains/maxwell/pitfalls/nextplay-runner-thread-preset-binding.md)（2026-09-16）。

- Runner 绑定修复的真实 Thread/Run 证据与目标违反文字限定后停止的边界见 [线上回归记录](domains/maxwell/pitfalls/nextplay-runner-thread-preset-binding.md)（2026-09-16）。

- [Nextplay 评测与调优验收入口](domains/maxwell/refs/nextplay-evaluation-gates-20260916.md) — 真实运行、证据分类、D1–D5、方法产物与候选对比的核验指针

- [Judge 参数拒绝与恢复重判](domains/maxwell/pitfalls/evolve-judge-model-parameter-rejection.md) — 参数兼容性预检、错误透传和保存证据重判的验收方法

- [自由画布抽卡数据导出](domains/vidmuse/refs/free-canvas-generation-export.md) — 项目覆盖、初始与实际 prompt、DMS 长字段完整性和三用户飞书模板导出入口（2026-09-16）。

- 自由画布当前展示版本与最终选片的区别、精确输出匹配及保留用户改名，见 [抽卡导出入口](domains/vidmuse/refs/free-canvas-generation-export.md)（2026-09-16）。

- [Analytics Worker 超大聊天 OOM](domains/vidmuse/admin/pitfalls/analytics-worker-oversized-history-oom.md) — 完整响应内存放大、崩溃重试循环、流式体积准入、生产发布与 RSS/cgroup 恢复验收指针（2026-09-16）。

- [Sand Eval SQL 与锁诊断入口](domains/sandai-data-smith/refs/sandeval-sql-lock-diagnosis.md) — 当前 SLS 日志库、热点 SQL 与接口映射、QPS/重扫描/慢写归因、全局 API p95 尖峰分层诊断、transaction_trace 前缀解析及服务端证据边界（2026-09-29）。

- [Sand Eval 本机启动入口](domains/sandai-data-smith/refs/sandeval-local-startup.md) — macOS 本机配置来源、Python/pnpm 依赖解析与页面验收指针（2026-09-17）。
- [Sand Eval 供应商任务与批次分类入口](domains/sandai-data-smith/refs/sandeval-supplier-task-grouping.md) — 供应商派题列表、明确发布关联、配置装配与质检分组参考指针（2026-09-26）。

- [Sand Eval 角色与两侧工作流](domains/sandai-data-smith/refs/sandeval-roles-and-workflow.md) — 角色节点、Sand 视角、成员权限与新旧质检链路的核验入口（2026-09-17）。
- [Sand Eval 多轮退回的上游意见链](domains/sandai-data-smith/pitfalls/sandeval-repeated-return-feedback-lineage.md) — 整批意见须有父处置，逐题意见还须原报告、送审包与冻结计划（2026-09-28）。
- [Sand Eval 整改意见姓名的展示覆盖](domains/sandai-data-smith/pitfalls/sandeval-correction-reviewer-display-scope.md) — 原身份、账号昵称、部署 DTO 与状态分支覆盖；完整工作台刷新、草稿确认、稳定题目定位与跨单隔离修复及测试 PR #2241 / main PR #2246 指针；质检复验页上游 Sand 意见的身份边界、仲裁作者、署名/刷新修复、测试 PR #2266 / main PR #2267、基线冲突与 CI 验证边界（2026-10-09）。
- [Caption Refine 跳过与待定阻断交卷](domains/sandai-data-smith/pitfalls/sandeval-caption-refine-skip-defer-handoff.md) — 定位限制历史与修复分支；待定排除须覆盖整包，跳过须保留固定作答上下文，交付状态另行核验；含全待定兄弟批次恢复后的整包资格修复与回归指针（2026-09-28）。
- [Sand Eval 质检员整改轮次与可编辑性核验](domains/sandai-data-smith/pitfalls/sandeval-inspector-rework-round-list-and-editability.md) — 源任务、标注员范围、当前/历史质检轮次与编辑权限的区分（2026-09-28）。
- [Sand Eval 整批退回后的代改版本冲突](domains/sandai-data-smith/pitfalls/sandeval-stopped-review-amendment-conflict.md) — 上轮停止后代改继承的原因、main 修复 PR #2144 与生产验收边界（2026-09-28）。
- [Sand Eval Sand 退回前代改与空间复验版本冲突](domains/sandai-data-smith/pitfalls/sandeval-cross-stage-frozen-answer-superseded.md) — 上轮供应商已通过并交 Sand；Sand 代改退回后新空间轮次冻结旧答案的时间线、测试与 main PR 指针及验证边界（2026-09-29）。

- [Sand Eval 多角色验收与派题回读入口](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md) — 操作回执、卡、wave 与质检交接必须一起核验。

- Sand Eval 多角色自动化入口：见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)，包含分层运行和真实存储核验。

- [Sand Eval 质量中心测试数据](domains/sand-eval/pitfalls/quality-center-test-data.md) — 任务内质检与质量中心的边界、完整份数和批次契约、送审与验收入口；分配计划与真实质检待办需分层核对，整包禁用要回读推进阻断码及唯一负责人配置，区分任务通过与整包通过（更新至 2026-09-27）。
- [Sand Eval 质检分配进度冲突](domains/sand-eval/pitfalls/quality-allocation-progress-cas.md) — 2026-09-25 并行写回中断、单批“待处理”的状态来源、续跑至 37 批及质检员待办 800 与已提交 200 的口径。

- [Test / Prod 与短期验收候选](disciplines/dev/test-prod-short-lived-candidates.md) — 未采用的备选方案；当前规则见 Test/Main Cherry-pick 团队规范。

- Sand Eval 真实 HTTP E2E 与 UI 回归：见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)，区分用例定义、脚本缺口与真实运行回执。

- [Test/Main Cherry-pick 团队规范](disciplines/dev/team-test-main-cherry-pick-workflow.md) — 用户确定的 test 验收、cherry-pick 上线、main 普通 merge 回合及部署回归责任（2026-09-17）。

- Test/Main Cherry-pick 团队规范的飞书协作入口见 [规范页](disciplines/dev/team-test-main-cherry-pick-workflow.md)（2026-09-17 创建并回读）。

- Sand Eval 生产 E06/E07 复测与 CLI/页面入口差异：见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。
- 2026-09-17：Nextplay 导入 400 的空任务 HTTP 复现、管理确认边界、原子写入与预检快照验收入口见 [导入与评分核验](domains/maxwell/refs/nextplay-benchmark-import-audit-20260915.md)。

- [云效多需求分支生成 release](disciplines/dev/yunxiao-release-branch-research.md) — Flow 分支管理器、AppStack 准入、GitHub 接入与现有 cherry-pick 流程的评估边界（2026-09-17）。

- [Sand Eval 部署可用性](domains/sandai-data-smith/refs/sandeval-deployment-availability.md) — 测试站 ALB 503、调度队列证据、滚动发布/失败恢复修复入口及 PriorityClass 权限边界（2026-09-17）。

- Sand Eval 测试站 ALB 503 的现场请求、空 Endpoints 与调度等待时间线，见 [部署可用性诊断](domains/sandai-data-smith/refs/sandeval-deployment-availability.md)（2026-09-17）。

- Sand Eval 调度日志已定位入队/排队延迟及同窗离线任务大量调度失败，见 [部署可用性诊断](domains/sandai-data-smith/refs/sandeval-deployment-availability.md)（2026-09-17）。

- 2026-09-18：Sand Eval 的真实 HTTP / Playwright 分层验收、封存与下发统计及专属异步队列方法见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。

- [Sand Eval 接口观测入口](domains/sandai-data-smith/refs/sandeval-api-observability.md) — 当前 SLS 日志库和生产 API 看板、离线生成器、覆盖口径及回退入口（2026-09-25）。

- 2026-09-18：质检分配首次异常与自动恢复的区别、测试过早断言的纠正见 [Sand Eval 验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。

- [高光题型素材备注验收](domains/sandai-data-smith/refs/sandeval-highlight-note-test.md) — 三条对照素材、任务下发与派题回读，以及预览和正式提交的证据边界（2026-09-18）。

- [Sand Eval 旧任务链接排查](domains/sandai-data-smith/refs/sandeval-retired-task-links.md) — HTTP 200 与前端 404 的区分、旧链接生成器和现行路由核验指针（2026-09-18）。

- Sand Eval 下发请求把页面前缀当 API 前缀的排查与 PR 指针，见 [旧链接与接口路由](domains/sandai-data-smith/refs/sandeval-retired-task-links.md)（2026-09-18）。

- Sand Eval 404 修复部署与总列表剩余入口见 [路由排查](domains/sandai-data-smith/refs/sandeval-retired-task-links.md)（2026-09-18）。

- [Sand Eval 新题型集成检查](domains/sandai-data-smith/refs/sandeval-question-type-integration.md) — seed、能力预期、声明预算及同步 Gate 证据入口（2026-09-18）。

- 2026-09-18：完整 24 条 API 串行重跑、脚本/环境/外部修改的归因边界，见 [Sand Eval 验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。

- [Sand Eval 返修与反馈场景](domains/sandai-data-smith/refs/sandeval-correction-fixtures.md) — 部分抽样、逐题判定字段及标注员页面验收指针（2026-09-18）。

- [Sand Eval 分支自动化核验入口](domains/sandai-data-smith/refs/sandeval-branch-automation.md) — 测试部署触发器、干净开发分支向 main 提 PR、共享祖先误判、草稿 Gate 分类失败及 Actions 权限的核验指针（更新至 2026-09-28）。

- [主任务题面预览与下发范围](domains/sandai-data-smith/refs/sandeval-dispatch-preview-scope.md) — 真实来源预览、本次配额及跨历史去重的代码核验入口（2026-09-19）。

- [日报模型通道失败与重试耗尽](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-provider-timeout.md) — AWS 模型访问拒绝、PIP EOF/503、300 秒超时及未索引 log 字段的只读排查指针（2026-09-19）。

- 2026-09-19：新版质检登记、检查员权限与标注员退回页面的验收边界，见 [返修场景指针](domains/sandai-data-smith/refs/sandeval-correction-fixtures.md)。

- [MP4 附加轨道时长异常](domains/sandai-data-smith/pitfalls/mp4-extra-track-duration.md) — 12 秒画面夹带 35 分钟 SubtitleHandler 数据轨的定位与无重编码验证（2026-09-19）。

- [Sand Eval 质检布局与切号核验](domains/sandai-data-smith/refs/sandeval-review-layout-and-account-picker.md) — 深层容器宽度、账号分页及隐藏预览定位冲突入口（2026-09-19）。

- [Sand Eval 发题历史验收场景](domains/sandai-data-smith/refs/sandeval-dispatch-history-fixture.md) — 双供应商双题型、历史漏记回读与素材导入契约指针（2026-09-19）。

- 2026-09-19：Sand Eval 同名测试分支重建、自动回合与显式部署触发入口见 [分支自动化](domains/sandai-data-smith/refs/sandeval-branch-automation.md)。

- 2026-09-20：发题历史场景前次漏记结论已纠正；空间分类过滤与跨批次素材去重的核验见 [验收场景](domains/sandai-data-smith/refs/sandeval-dispatch-history-fixture.md)。

- [Caption 质检视频与正文滚动](domains/sandai-data-smith/refs/sandeval-caption-review-scroll.md) — 新题型样式覆盖、两种布局吸顶与顶部裁剪、PR #1447 验收入口（2026-09-20）。

- [Sand Eval 自动复验派回验收](domains/sandai-data-smith/refs/sandeval-auto-reinspection-verification.md) — 手动退回与正式报告的取人边界、复验必检题和补抽集合、整改回交接线，以及旧轮次只读与后继复验入口核验（更新至 2026-09-24）。

- [Caption 工作流上下文契约](domains/sandai-data-smith/refs/sandeval-caption-workflow-context.md) — 题目详情 500、modules 缺失与运行版本核验入口（2026-09-20）。

- 2026-09-20：Caption v6 modules 依赖的引入提交与 PR #1446 合入时间，见 [上下文契约排查](domains/sandai-data-smith/refs/sandeval-caption-workflow-context.md)。

- 2026-09-20：Caption v6 整题修复候选、真实服务上下文回归及验证边界见 [上下文契约排查](domains/sandai-data-smith/refs/sandeval-caption-workflow-context.md)。

- 2026-09-20：Caption v6 新派发约束确认存在生产存量不兼容，证据和发布边界见 [上下文契约排查](domains/sandai-data-smith/refs/sandeval-caption-workflow-context.md)。

- 2026-09-20：按用户要求移除 v6 新增派发限制并验证历史配置兼容，见 [上下文契约排查](domains/sandai-data-smith/refs/sandeval-caption-workflow-context.md)。

- 2026-09-20：Caption 退回后回交的自动执行缺口与手工复验入口区别，见 [复验核验](domains/sandai-data-smith/refs/sandeval-auto-reinspection-verification.md)。

- 2026-09-20：整改责任重叠和供应商直接验收后自动派回复验的修复候选与回归入口，见 [自动复验核验](domains/sandai-data-smith/refs/sandeval-auto-reinspection-verification.md)。

- [质检详情与质量中心取数不一致](domains/sandai-data-smith/refs/sandeval-inspection-detail-source-mismatch.md) — 新版报告通过与旧详情空批次的核查入口（2026-09-21）。

- 2026-09-21：新旧质检兼容方案及“新版改答案让旧详情非空”的逐条证据，见 [取数差异](domains/sandai-data-smith/refs/sandeval-inspection-detail-source-mismatch.md)。

- 2026-09-21：概览与答题卡分析的真实质检数据、全量读取瓶颈及分页方案，见 [质检详情取数兼容](domains/sandai-data-smith/refs/sandeval-inspection-detail-source-mismatch.md)。

- 2026-09-21：高光片段待标注场景和发题范围校验入口见 [高光验收](domains/sandai-data-smith/refs/sandeval-highlight-note-test.md)。

- [切片标注验收入口](domains/sandai-data-smith/refs/sandeval-slice-fixtures.md) — 题面字段、逐片段媒体映射与真实播放核验（2026-09-21）。

- [公共岗位与私人进度隔离](global/pitfalls/public-jobs-private-applications.md) — 平台角色、自由文本隐私与直接接口回归入口（2026-09-21）。

- 2026-09-21：构图待质检场景与标注批次主动交接门禁，见 [质量中心验收](domains/sand-eval/pitfalls/quality-center-test-data.md)。

- 2026-09-23：负责人“代交接”500、运行时服务名装配遗漏、`QualityError code` 未产生及恢复已完成批次直接分配的口径，见 [质量中心验收](domains/sand-eval/pitfalls/quality-center-test-data.md)。

- 2026-09-24：分配计划、真实检查任务、当前提交链和本人工作台的数量必须分层核对，见 [质量中心验收](domains/sand-eval/pitfalls/quality-center-test-data.md)。

- 2026-09-24：整包“待提交”但按钮禁用时，回读 `inspection_advancement` 的真实阻断码，并核对多负责人验收与 `return_recipient_id`，见 [质量中心验收](domains/sand-eval/pitfalls/quality-center-test-data.md)。

- 2026-09-22：多进程质检恢复、共享连接与 pool_wait 计时边界见 [SQL 与锁诊断入口](domains/sandai-data-smith/refs/sandeval-sql-lock-diagnosis.md)。

- [整包提交与重新分批重复范围](domains/sandai-data-smith/refs/sandeval-handoff-duplicate-scope.md) — 当前批次的 key/version 口径、负责人直接分配边界，以及整包交接范围、重复报告读取超时和多人验收接收人阻断的修复与生产核验指针（2026-09-24）。

- 整包重复范围案例的转出再转回审计、历史与当前范围边界，见 [整包提交排查](domains/sandai-data-smith/refs/sandeval-handoff-duplicate-scope.md)（2026-09-22）。

- 2026-09-22：PR #1673 后续复核发现整包持久化前仍使用未过滤批次集合；四个检查点与 `SOURCE_SCOPE_CHANGED` 入口见 [整包提交排查](domains/sandai-data-smith/refs/sandeval-handoff-duplicate-scope.md)。

- 2026-09-23：最新主线的正式交接执行校验仍使用未过滤批次，导致 `SOURCE_SCOPE_CHANGED`；统一 live batch owner、后续 Sand 批次与成果资格的修复指针见 [整包提交排查](domains/sandai-data-smith/refs/sandeval-handoff-duplicate-scope.md)。

- [VidMuse 访问日志入口](domains/vidmuse/refs/access-log-entrypoints.md) — runtime sidecar 与网站网关的覆盖边界、ALB/SLS 和生产环境核验指针（2026-09-22）。

- [Sand Eval 检查读取与保存性能](domains/sandai-data-smith/refs/sandeval-review-performance.md) — 整包报告、提交链、质检员列表 live 与 summary 路径、单人整改重复读取与批量读取的自动提交校验边界、默认样本展开及 Hologres 查询日志/计划证据边界（更新至 2026-09-29）。

- 2026-09-24：Sand 质检批量定位的查询边界、无关组损坏隔离、循环引用错误顺序及仓内实现 Note，见 [检查读取与保存性能](domains/sandai-data-smith/refs/sandeval-review-performance.md)。；含提交阶段、恢复 attempts 与 SLS 通配覆盖核验
- 2026-09-24：Leader 详情与 live 逐包进度、重复来源范围读取、当前页并发及连接等待的核验入口，见 [检查读取与保存性能](domains/sandai-data-smith/refs/sandeval-review-performance.md)。；含提交阶段、恢复 attempts 与 SLS 通配覆盖核验

- [Sand Eval 派题性能证据](domains/sandai-data-smith/refs/sandeval-assignment-performance-evidence.md) — 2026-09-25：loop_stall 与同 worker 排队、五类分块及 Redis 检查、快照复核和测试库内存实验的核验入口。

- [并行浏览器测试的代登录会话冲突](global/pitfalls/browser-impersonation-concurrent-tests.md) — 共享 profile 切号影响其他标签页；后台计时必须验证实际 visibility 状态（2026-09-26）。

- [Ant Design 两字中文按钮的测试选择器](disciplines/testing/antd-button-accessible-name.md) — 可访问名称插空格、存在性假阴性与 PR #1976 分页测试核验指针（2026-09-26）。

- 2026-09-26：质检员 page-index 无搜索词的 SQL 参数缺口与 SQLite 测试覆盖差异，见 [检查读取与保存性能](domains/sandai-data-smith/refs/sandeval-review-performance.md)。

- [质检核对方案旧页面 404](domains/sand-eval/pitfalls/bulk-allocation-stale-client-404.md) — 删除 preview API 与已打开旧页面的兼容断裂、生产日志及整页刷新边界（2026-09-26）。

- [Sand Eval 流程消息验收](domains/sand-eval/refs/workflow-notification-acceptance.md) — 正向单接收人、逆向全链路及Sand排除、兼任角色消息跳转、未读状态的实际验收入口（2026-09-27）。

- [Sand Eval 压测与认证请求归因](domains/sandai-data-smith/refs/sandeval-api-load-and-auth-diagnosis.md) — load_run/deploy 分层、app→edge 499 对账、focus 触发与任务矩阵/发布/整改/流式分配的诊断指针（2026-09-27）。
- 2026-09-27：单卡 page 的派生 UUID 全表反查、应用 CPU 阻塞与 SQL span 间隙证据，见 [压测与认证请求归因入口](domains/sandai-data-smith/refs/sandeval-api-load-and-auth-diagnosis.md)。

- [Sand 待复验提前展示](domains/sand-eval/pitfalls/sand-reinspection-premature-status.md) — 上级 processing、嵌套整改验收接续、连续退回与部分写入恢复、回交及真实后继轮次的核验边界（2026-09-27）。

- 2026-09-27：整包负责人配置受控恢复、报告摘要保全及指定负责人本人提交权限核验指针，见 [质量中心验收](domains/sand-eval/pitfalls/quality-center-test-data.md)。

- 2026-09-27：PR #1792 负责人兜底的实际选人、当前提交权限与“整包生成中”误报的复核路径，见 [质量中心验收](domains/sand-eval/pitfalls/quality-center-test-data.md)。

- [Sand Eval 结算明细性能](domains/sandai-data-smith/refs/sandeval-settlement-performance.md) — 全量生成与读取放大、统一权限门禁、快照缓存，以及 P0 原子发布、完成时间、统一导出、全局预算和范围规范化的评审、修复验证及双目标 PR 指针（更新至 2026-09-28）。

- [Sand Eval 单题质检判断修正](domains/sandai-data-smith/refs/sandeval-single-judgment-correction.md) — 原备注保全、单题正式保存及独立有效判定回读入口（2026-09-27）。

- [质检分配撤销与退回](domains/sand-eval/refs/quality-allocation-withdrawal.md) — 原责任人退回、分配占用、生产撤销审计及真实身份验收指针（2026-09-28）。

- [搬迁后的 Git worktree 指针修复](disciplines/dev/relocated-git-worktree-repair.md) — Claude 会话旧路径、双向 Git 指针修复及 rebase 前后保全核验入口（2026-09-28）。

## 2026-09-28 同步补入的专题入口

- [自由画布下载与生成版本关联](domains/vidmuse/refs/free-canvas-download-attribution.md) — 下载者、版本、任务、实际入参的精确关联及开始下载/最终采用边界
- [Problem 认领触发历史告警回复](domains/vidmuse/admin/pitfalls/monitoring-problem-claim-replies-to-historical-alerts.md) — 弱聚类、来源话题绑定与旧卡刷新、PR #881 及生产回读边界（2026-09-15）
- [Tool Errors 启动与 Analytics 内存](domains/vidmuse/admin/pitfalls/tool-errors-bootstrap-and-analytics-memory.md) — JS MIME、Web/Worker 内存证据、异步客户端原循环与 PR #881 回归入口（2026-09-15）
- [日报滚动部署启动交接](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-startup-handoff.md) — 循环缺失、旧镜像自动补跑、周末窗口对账与历史补偿缺口、PR #878 发布验收及卡片统计口径（2026-09-14）
- [Executor 声明与执行实证](domains/maxwell/pitfalls/executor-declaration-vs-execution-evidence.md) — 声明/连接/真实回执分开，历史配置绑定、内存克隆与 CAS 保留核验指针
- [VidMuse 无库 Adapter 实施](domains/maxwell/projects/vidmuse-stateless-adapter-implementation.md) — 普通 Thread 等价性硬要求、AION #1760 / Zeus #525 回退与本地保留、DEV Manager/固定 Runner 分别核验；文件/账号迁移、捕获影响及公共 SQL 审核指针（2026-09-14）
- [EVOLVE PR 281 DEV 发布证据](domains/maxwell/refs/evolve-pr281-dev-deployment-20260911.md) — 2026-09-11，0007 迁移、API/Worker 与 Studio 188 发布和验收指针。
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
- 日报 JSON 格式本地修复与验证：见 [日报失败诊断](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md) 的 2026-09-12 修复指针。
- 日报结构化返回与 Chat 复制交互：见 [日报修复指针](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md) 的 2026-09-12 后续修复。
- Chat Shift 连选及 Esc 清空验证指针：见 [Chat 与日报修复记录](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)。
- [Admin PR #875](https://github.com/world-sim-dev/vidmuse-admin/pull/875)：日报格式与 Chat 多选复制统一交付，见 [修复记录](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)。
- [Nextplay 真实 Case 演示讲稿](domains/maxwell/refs/evolve-demo-runbook-20260914.md) — 25 分钟操作路线、真实预演与同口径候选比较的验收边界（2026-09-14）。
- [Nextplay 真实评测契约复核](domains/maxwell/pitfalls/nextplay-real-run-contract-review-20260914.md) — 执行声明、固定文件根目录、回执配置、轨迹大小、首个真实基准通过与候选验收指针（2026-09-14）。
- [Maxwell 知识库大文件上传限制](domains/maxwell/pitfalls/knowledge-upload-limits.md) — 上传解压预算、分块总量、导入前置校验、PR #295 及 CI 浅克隆基线排查（2026-09-14）。
- [分镜标签同步与视觉核验](domains/vidmuse/pitfalls/storyboard-label-sync-without-visual-verification.md) — 文本批量一致不等于素材语义一致；封面、播放、时长与导出版本的复验边界（2026-09-16）。
- [Runner 日志范围与错误计数](domains/vidmuse/pitfalls/runner-log-scope-and-error-count.md) — tail/full 与轮转边界、重复异常归并、精确帧输出校验及恢复核验方法（2026-09-16）。
- [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md) — 双协议报告、PR 883/64、脱敏与恢复边界、生产发布与工具同步、发布后 OOM 和严格回放验收指针（2026-09-16）；2026-09-17 补充严格报告接收与真实卡片回调分层验收边界；补缺少 Pod 注解绑定、fresh-evidence 恢复、大文件分段读取与发布后源码脱敏字节边界；补正式 preset 切换和数字占位兼容。
- [修复尝试独立于告警认领](domains/vidmuse/admin/pitfalls/monitoring-repair-is-separate-from-claim.md) — 修复按钮、独立任务与写入身份、来源话题和 Draft PR 完成边界（2026-09-16）。
- [Runtime 托管业务 Judge 评审方案](domains/maxwell/projects/evolve-runtime-judge-review-20260916.md) — Nextplay 业务判卷包、逐题配置、冻结证据、版本更新与通用平台改造的飞书评审入口（2026-09-16）。
- [候选需可编辑基线，证据重判需同口径比较](domains/maxwell/pitfalls/evolve-candidate-editable-baseline-and-regrade-comparison.md) — Nextplay 候选真实应用、同证据判卷波动、live/evidence-only 对照、Scorecard usage 修复部署与正式决策报告验收指针（2026-09-16）。
- 2026-09-16 报告协议首次真实 canary 的空替代哈希与隔离 Problem 风险：见 [报告与聊天分离边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)，修复 PR #65、下游 trace 全集、结构预检 PR #66、记录定位与验证入口。
- 原报警 workload 与下游部署证据不能互相替代，见 [报告协议验收边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)（2026-09-17）。
- [Studio 发布变量与候选展示](domains/maxwell/pitfalls/studio-release-env-and-candidate-results.md) — composite action 同层 env 空值导致白屏、版本 CDN 准入和单候选结果证据边界（2026-09-17）。
- 2026-09-17 日报结构错误的有界修复与同窗只读回放入口见[日报证据链](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md)；生成通过不等于补发。
- 2026-09-17 调查重试文本超出 Runtime 单消息容量的无损分段与幂等回执验收见[报告协议边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)。
- 候选正文、空 Benchmark 与多 Case 并发的区分见 [Studio 与候选验收](domains/maxwell/pitfalls/studio-release-env-and-candidate-results.md)，PR #309 提供入口与调度回归（2026-09-17）。
- 2026-09-17 分段报告上下文恢复、采集与证明部署关联对齐、历史快照和标量 observation 边界见[监控报告验收](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)，修复指针 Admin #885 / MCP #67。
- 2026-09-17 真实飞书认领/原卡片回填、临时样本清理与专项策略 CI 兼容门禁见[报告协议验收边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)。
- 2026-09-17 exact alert trace aliases and independent cross-trace rejection: [report protocol boundaries](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md), Admin #887.
- 2026-09-17 correction transport and filtered downstream-query proof boundaries: [monitoring report protocol](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md), Admin #887/#888.
- 2026-09-17 原卡更新回执与话题回复的验收差异、正式 preset 跨 Run 引用失败后的切换门禁见[监控报告边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)，Admin #889。
- 2026-09-17 ACK 容器表单丢失 optional Secret、单字段 YAML 变更回读与安全模板回退见[监控发布边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)。
- 2026-09-17 模型手写 records map 的自检不能证明 canonical Runtime 引用，见[报告证据边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)。
- 2026-09-17 生产 invalid_report 处理器未调用证据续查辅助函数，隔离调度器测试不能替代生产恢复验收，见[报告协议边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)。
- Monitoring 当前 Run 草稿预检、MCP 执行上下文协商及真实证据绑定入口，见 [报告与聊天输出边界](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)（2026-09-17）；PR 合并和 CI 不代表正式 preset 验收通过；补线上技能禁止补读冲突与独立日报探针的模型路由初始化边界。
- 2026-09-17 Same-Run original-workload SHA correction, layered formal/card acceptance and legacy-drain cutover gate: [monitoring report boundaries](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md).
- 2026-09-17 First-claim protocol cutover gate and SLS Admin action lost from both DSL/graph: [monitoring output and routing boundaries](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md).
- Sand Eval 发布后节点移除、单副本与 Spot 调度边界：见 [部署可用性诊断](domains/sandai-data-smith/refs/sandeval-deployment-availability.md)（2026-09-17）。
- Eval 常驻节点修复的测试发布与实际落点验收入口，见 [部署可用性诊断](domains/sandai-data-smith/refs/sandeval-deployment-availability.md)（2026-09-17）。
- [监控发布撤掉只读凭据](domains/vidmuse/admin/pitfalls/monitoring-deploy-revokes-readonly-credentials.md) — 发布参数撤权、配置身份漂移、全副本验收及 Runtime 建连容错的排查与修复指针（2026-09-18）。
- Eval 生产常驻非 Spot 约束与生成 Worker 独立补发：见 [部署可用性诊断](domains/sandai-data-smith/refs/sandeval-deployment-availability.md)（2026-09-17）。
- [扩窗诊断线索与事故取证](domains/vidmuse/admin/pitfalls/monitoring-expanded-lead-escalation.md) — 主窗查空后的合法扩窗不等于事故归属，防止强制部署/源码检查形成无法完成的报告门禁，并区分取证完成、报告准备失败与预算耗尽。
- [报告准备的跨层预算](domains/vidmuse/admin/pitfalls/monitoring-report-preflight-budget.md) — 长 Run 分页读取、真实 HTTP 对照、分层超时与按历史 receipt 恢复的核验方法（2026-09-18）。
- [Eval慢接口与事务SQL观测指针](domains/sandai-data-smith/refs/sandeval-slow-panels.md) — 现有日志面板、trace覆盖边界与2026-09-19排查入口。
- [Sand Eval 可返回代登录入口](domains/sandai-data-smith/refs/sandeval-returnable-impersonation.md) — PR #1401、测试发布及首次/再次切号并发撤销的验收指针（2026-09-19）。
- [Sand Eval 历史整改快照恢复](domains/sandai-data-smith/refs/sandeval-legacy-correction-recovery.md) — 2026-09-20：旧快照与失败意图区分、最新答案保留、PR #1504 和只读计划 / apply 操作入口。
- [供应商批量验收与送审测试数据](domains/sandai-data-smith/refs/sandeval-bulk-quality-fixtures.md) — 独立题包、待办状态、并行消费与页面证据核对入口
- [复验抽样与停止轮次继承](domains/sandai-data-smith/refs/sandeval-reinspection-sampling-lineage.md) — 供应商与 Sand 退回重提的跨轮不合格必检、有效改判、最近有效结论展示及实际抽样核对入口。
- [质检批量分配延迟](domains/sandai-data-smith/refs/sandeval-bulk-allocation-latency.md) — 供应商与 Sand 批量分配的完整范围核查、串行批次、Sand 整包重复校验及一分钟客户端超时边界（2026-09-23）。
- [Caption 旧模块数量与整题迁移](domains/sandai-data-smith/pitfalls/caption-module-count-and-migration.md) — 模块义务与答题卡数量差异、已验收迁移门禁及祖先退回闭环核验入口（2026-09-24）。
- [Sand Eval CPU 与恢复取证入口](domains/sandai-data-smith/refs/sandeval-runtime-profile-evidence.md) — CFS、事件循环、SET/acquire、运行栈与计算组分层归因；含 2026-09-30 Caption Flow 重扫描、跨服务共享 leader 资源和启停对照取证入口。
- [质检待处理与质检中状态判读](domains/sandai-data-smith/pitfalls/quality-allocation-blocked-status.md) — 分配姓名、送审与真实任务的区别，凭证过期及继续完成分配核验入口（2026-09-25）。
- [质检分配与半完成送审冻结](domains/sandai-data-smith/refs/sandeval-partial-submission-freeze.md) — 写入中断根因、保留原快照的单批受控修复、备份及独立验收指针（2026-09-25）。
- [Sand 分配与过期整包报告](domains/sandai-data-smith/refs/sandeval-stale-package-allocation.md) — 新复验使旧交接报告失效、数据包 tab 判读、选中范围求交、历史证据与实时依赖边界、恢复脚本及题目正文验收（2026-09-26）。
- [修订索引缺失与质检版本冲突](domains/sandai-data-smith/refs/sandeval-amendment-lookup-recovery.md) — 修订继承链、授权补齐索引、已有判断保护及独立验收指针（2026-09-25）。
- [Sand Eval 测试分支删除重建](domains/sandai-data-smith/pitfalls/sandeval-test-branch-recreation.md) — 分支创建的 Gate 准入、目标 PR 恢复、main 并发前进及测试部署证据边界（2026-09-28）。
- [Sand Eval 派题部分完成核验与原计划恢复](domains/sandai-data-smith/refs/sandeval-partial-assignment-recovery.md) — 冻结计划、卡、wave、回执、已有答案保护及滚动发布中断后的复核入口（2026-09-25）。
- [质检分配实例关闭与恢复](domains/sandai-data-smith/refs/sandeval-allocation-shutdown-recovery.md) — shutdown 与分配日志对齐、已激活但未登记的计划、受控续跑与实样本验收指针
- Sand Eval 双峰与多计算组归因：见 [运行取证](domains/sandai-data-smith/refs/sandeval-runtime-profile-evidence.md) 的 2026-09-25 db.name、控制池和服务端查询对应方法。
- [Sand Eval 质检备注草稿恢复](domains/sandai-data-smith/refs/sandeval-inspection-note-draft.md) — 新质检备注刷新丢失的代码根因、本机草稿与服务端判断的边界及修复候选入口（2026-09-25）。
- [Sand Eval 跨关卡退回意见可见性](domains/sandai-data-smith/refs/sandeval-cross-stage-feedback.md) — Sand 原意见跨负责人、空间质检与标注整改的责任链；含转派后的工作项映射、后续复验及历史结论文案（2026-09-25）。
- [Sand 直达整改与按批交接核验入口](domains/sandai-data-smith/refs/sandeval-direct-remediation-and-batch-handoff.md) — 退回路由、负责人验证、整包交接与 QC passed 语义的代码和生产核验指针（2026-09-27）。
- [Sand Eval 质检不合格阈值与实际判定脱节](domains/sandai-data-smith/pitfalls/sandeval-qc-reject-threshold-not-enforced.md) — 建任务阈值、抽样比例、逐题合格率和整包结果的语义边界及代码核查入口（2026-09-28）。
- [Sand Eval 跨工作台题目顺序](domains/sandai-data-smith/pitfalls/sandeval-cross-workbench-question-order.md) — 测试与 2026-09-29 生产均复现质检和整改题号乱序；按题目/素材及答案版本关联，含排序代码指针。
- [Sand Eval 整包交接后复验等待](domains/sandai-data-smith/pitfalls/sandeval-whole-package-reinspection-wait.md) — 2026-09-28 测试环境整包已提交、Sand 待复验但原质检员未按用例时限收到新轮次，须分开核对交接和自动派回。
- [Sand Eval 退回路线与整包交接提示](domains/sandai-data-smith/pitfalls/sandeval-return-route-and-handoff-hints.md) — 路线文案、整包提示、直接整改链路、系统执行身份，以及历史质检分配、当前账号资格和实际复验任务的区别（更新至 2026-09-30）。
- [Sand Eval 转派后整改任务可见性](domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md) — 核对历史批次、当前持卡工作项、整批退回的唯一持有人门禁、已答卡转派页与运营 CLI 口径、写入与提交恢复路径；含持有人分裂 409、单卡转派、退回弹窗错误接收人标签与真实处置单、复验提交 403 的排查指针（2026-09-29）。
- [Sand Eval 子整改闭环后再次退回阻塞](domains/sandai-data-smith/pitfalls/sandeval-repeated-correction-ancestor-blocker.md) — 上级责任未结、新退回授权断链的取证、正式完成执行继承、单条受控修复及 main 发布验收指针（2026-09-30）。
- 2026-09-27：首次继续整包送审、仅整改批次独立回交的范围与混合状态核验见 [直达整改与按批交接](domains/sandai-data-smith/refs/sandeval-direct-remediation-and-batch-handoff.md)。
- [AI 秋招雷达固定入口与工作台](global/refs/ai-job-radar-stable-entry.md) — 固定公开 URL、匿名岗位与私人权限、个人账号使用与资产归属边界、全栈嵌入及定时发布维护指针（2026-09-30）。

- [Test Center V2 run detail 性能记录](domains/vidmuse/admin/projects/2026-07-02-test-center-v2-run-detail-perf.md) — 2026-07-02 的接口实测、假设与分阶段优化计划；使用时重新核验。
- [VidMuse QuickTracking 前端指标](domains/vidmuse/refs/quicktracking-frontend-metrics.md) — 报表取数入口、时间桶校准和前后端统计口径边界。
- [知识库多分支历史分叉的同步](disciplines/dev/wiki-history-sync.md) — 双方历史保全、未跟踪文档、目录与日志合并及远端回读方法（2026-09-28）。

- [Sand Eval 整改后范围变化与旧包交接状态](domains/sandai-data-smith/pitfalls/sandeval-remediation-scope-change-stale-handoff.md) — 换作者整改、整包完整性、旧包投影与自动派回；正式代改连续证据、来源回执受控恢复、质量/来源引用差异及组合回归、测试 PR #2241 / main PR #2246，以及上线后包已生成但待正式交接的生产核查指针（2026-10-07）。

- [Sand Eval 四接口重复读取取证](domains/sandai-data-smith/refs/sandeval-four-api-repeated-read-evidence.md) — 整改历史、代改回执、本人列表和提交快照的运行证据、无数据库变更方案、正式审查及 main PR #2245 验证入口（2026-10-07）。

- [Sand 质检待验收与自验身份](domains/sandai-data-smith/pitfalls/sandeval-self-review-stage-identity.md) — 供应商与 Sand 质检人、待验收状态、Sand 复核与角色的区别、实际授权拒绝点、冻结复核配置、正规恢复及自动复核入口的生产核验指针（2026-10-08）。

- [AAC 坏包导致浏览器固定时间停播](domains/sandai-data-smith/pitfalls/sandeval-aac-corrupt-packet-browser-stall.md) — 原文件11.448秒解码失败、音轨修复对照、严格解码与媒体交付健康的边界（2026-10-08）。

- [Sand 直接整改后负责人再次退回](domains/sandai-data-smith/pitfalls/sandeval-direct-return-interrupted-by-leader.md) — 区分系统代委派与负责人独立退回，保存过期配置快照导致重检门禁拒绝、旧轮次 stopped 的只读复现，以及直接整改入口限制、手动重检修复与存量责任桥接、验收中断恢复及配置迁移接续的完整回归指针（2026-10-09）。

- [EVOLVE 自迭代设计审查 2026-10-09](domains/maxwell/refs/evolve-design-review-self-iteration-20261009.md) — 统一采纳门槛、final 独立性、搜索反馈、Judge 校准及预算/交付边界的代码与反例核验入口

- [EVOLVE 通用工作台与 Nextplay 接入方案](domains/maxwell/projects/evolve-nextplay-entry-plan-20261009.md) — 2026-10-09：生成/导入同等重要，Case/Judge 与 Work 解耦；通用方法派生业务指标、Benchmark 内完整路径、人工复核/重评/重跑与历史边界、工作台文案规范、动线审查、V7 完整前端体验及展开菜单纠正；多人 Skill 调优与复核证据要求；对话草案、候选显式来源、可操作谱系与可比趋势；布局连续性与局部可暂停动效；Benchmark/评测/调优整体组织、Maxwell/A2A/HTTP 通用对象与候选应用能力区分，实际验收及真实接入边界。 2026-10-10 补全全链路复审、候选默认版本隔离、联合评分关联与源适配边界、导入接续及后端差距指针；原型确认后的正式实施、YAML 与接口/迁移/性能评审入口。 2026-10-10 已批准首批代码与迁移文件，限定 EVOLVE 域；新增目录会话权限、定义/历史分读及持久化一致性证据指针。 补充用例修订/归档、四格式导入与异步编辑交互验收指针。 补充共享标准全链路、Benchmark 原子修订与存储唯一键限制指针。 补充共享标准采用/判卷/候选验证技术链路、批次读取、Trial 权限和谱系缓存范围指针。

- [Sand Eval 已终结主任务的素材占用恢复](domains/sandai-data-smith/pitfalls/sandeval-terminated-dispatch-material-occupancy.md) — 停止执行与有效下发占用的区别、正式软删除/审计路径及逐素材范围验收指针（2026-10-09）。

- [Sand Eval 复验部分提交后的验收阻断](domains/sandai-data-smith/pitfalls/sandeval-reinspection-partial-submit-acceptance-blocker.md) — 正式报告、整改后继关联、提交回执与列表动作的分层核验；提交409部分落库、CAS推断边界、拒绝报告补登记、多轮接续及单批恢复/独立回读指针（2026-10-09）。

- [AI 产品整体设计与交互动线技能](global/refs/ai-product-design-skills.md) — 整体设计、设计规则持久化、动线与状态交付约束；上游技能指针、本机安装和启动检查入口及效果验证边界（2026-10-09）。
