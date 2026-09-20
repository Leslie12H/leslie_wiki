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
- [报警日报证据丢失链路](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-evidence-loss.md) — 输入裁剪、静默降级与引用完整性的排查和验收指针
- [监控大盘窗口与「天」的口径](domains/vidmuse/admin/pitfalls/monitoring-dashboard-window-and-day-semantics.md) — 三套时间基准 + 全量/窗口计数混用导致数字自相矛盾
- [Analytics 维护调度器历史重建压垮 PolarDB](domains/vidmuse/admin/pitfalls/analytics-maintenance-historical-rebuild-pressure.md) — 2026-09-07 三个放大器(30s 排水/审计也重写/replay 并发 16)+ 退役 5 阶段 + 冻结线 + 为何单独建库无用
- [admin 定时报表机制与死配置](domains/vidmuse/admin/pitfalls/admin-scheduled-report-mechanisms.md) — 外部 /cron vs 进程内循环、BugBotConfig.schedules 没人读、app.py 启动总闸
- [vidmuse-admin harness](domains/vidmuse/admin/refs/vidmuse-admin-harness.md) — Test Center V2 / VidMCP harness 指针

- [时间线预览时长与导出版本](domains/vidmuse/refs/timeline-preview-duration-and-export-version.md) — 轨道时长、分秒帧显示及历史混流版本核验指针

- [Kling 漏传分辨率导致 billing/500](domains/vidmuse/pitfalls/kling-billing-missing-resolution-20260909.md) — 2026-09-09 六次请求原始日志：价格 properties={}、未进入 Zeus 预扣费，I2V 输入缺图片/时长/分辨率

### maxwell — [业务全景](domains/maxwell/README.md)
- [VidMuse Git 候选准备](domains/maxwell/projects/vidmuse-executor-candidates.md) — 独立候选 CLI、仅 DEV 发布隔离、执行账号与公共依赖版本核验指针
- [VidMuse Executor P1 实现入口](domains/maxwell/projects/vidmuse-executor-p1.md) — 独立仓库、DEV 部署准备、持久化恢复与协议核验指针
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

## Disciplines(职业知识)
- [testing](disciplines/testing/README.md) — 测试方法论 *(暂空)*
- [dev](disciplines/dev/README.md) — 开发实践 *(暂空)*

## Global(通用)
- [2026 年 9–10 月 OKR 照野责任范围](global/projects/2026-09-okr-zhaoye-scope.md) — O2 整体 owner、O1-KR4 独担、O1-KR1 / O3-KR3 共担，及跨团队阻塞的排期含义
- [飞书表格字段与合并行同步](global/pitfalls/feishu-sheet-header-and-merge-sync.md) — 表头映射、完整读取、状态优先级及幂等核验指针

---
*开新业务:`cp -r domains/_template domains/<新业务名>` 并在此加一节。*

- [Admin 服务 JWT 权限与有效期](domains/vidmuse/admin/pitfalls/service-jwt-permissions-and-expiry.md) — 部署鉴权、type 字段映射、权限范围与 WAF 假 200 的验证指针

- [Tool 日汇总更新状态隐藏已有数据](domains/vidmuse/admin/pitfalls/tool-daily-updating-hides-existing-data.md) — 2026-09-11 DMS 验证反复 thread_upsert 标脏 + 前端拒收 updating，不能把暂无数据直接当作未回填

- [Tool 重建日志样本](domains/vidmuse/admin/pitfalls/tool-daily-updating-hides-existing-data.md) — 2026-09-11：30 分钟 332 次分析、145 个 Thread、6 次成功日重建；日志不支持推算 DB 负载

- Tool 指标发布实现与迁移检查：见 [tool daily 更新门禁](domains/vidmuse/admin/pitfalls/tool-daily-updating-hides-existing-data.md) 的本地实现指针（2026-09-11）。

- [Tool 发布 PR review](domains/vidmuse/admin/pitfalls/tool-daily-updating-hides-existing-data.md)：数据库工作量、人口完整性与 FLOAT 比较边界（2026-09-11）。

- Tool 增量维护目标设计：见 tool-daily-updating-hides-existing-data 的 2026-09-11 设计指针；尚未实现。

- [生产 Admin 表退役审计](domains/vidmuse/admin/refs/prod-table-retirement-audit.md)：三张注册表候选、旧日汇总退役边界与生产只读核验入口（2026-09-11）。

- [监控代码源范围阻断认领](domains/vidmuse/admin/pitfalls/monitoring-code-scope-blocks-claim.md) — GitHub App 仓库集合与白名单不一致、readyz 与认领前门禁排查（2026-09-11）。

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

- [Analytics Worker 超大聊天 OOM](domains/vidmuse/admin/pitfalls/analytics-worker-oversized-history-oom.md) — 完整响应内存放大、崩溃重试循环、流式体积准入与生产恢复验收指针（2026-09-16）。

- [Sand Eval SQL 与锁诊断入口](domains/sandai-data-smith/refs/sandeval-sql-lock-diagnosis.md) — 日志库边界、transaction_trace 慢 SQL、Cannot acquire lock in time 与连接池耗尽的核验指针（2026-09-17）。

- [Sand Eval 本机启动入口](domains/sandai-data-smith/refs/sandeval-local-startup.md) — macOS 本机配置来源、Python/pnpm 依赖解析与页面验收指针（2026-09-17）。

- [Sand Eval 角色与两侧工作流](domains/sandai-data-smith/refs/sandeval-roles-and-workflow.md) — 角色节点、Sand 视角、成员权限与新旧质检链路的核验入口（2026-09-17）。

- [Sand Eval 多角色验收与派题回读入口](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md) — 操作回执、卡、wave 与质检交接必须一起核验。

- Sand Eval 多角色自动化入口：见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)，包含分层运行和真实存储核验。

- [Sand Eval 质量中心测试数据](domains/sand-eval/pitfalls/quality-center-test-data.md) — 任务内质检与质量中心的边界、完整份数和批次契约、送审与验收入口（2026-09-17）。

- [Test / Prod 与短期验收候选](disciplines/dev/test-prod-short-lived-candidates.md) — 未采用的备选方案；当前规则见 Test/Main Cherry-pick 团队规范。

- Sand Eval 真实 HTTP E2E 与 UI 回归：见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)，区分用例定义、脚本缺口与真实运行回执。

- [Test/Main Cherry-pick 团队规范](disciplines/dev/team-test-main-cherry-pick-workflow.md) — 用户确定的 test 验收、cherry-pick 上线、main 普通 merge 回合及部署回归责任（2026-09-17）。

- Test/Main Cherry-pick 团队规范的飞书协作入口见 [规范页](disciplines/dev/team-test-main-cherry-pick-workflow.md)（2026-09-17 创建并回读）。

- Sand Eval 生产 E06/E07 复测与 CLI/页面入口差异：见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。
- 2026-09-17：Nextplay 导入 400 的空任务 HTTP 复现、管理确认边界、原子写入与预检快照验收入口见 [导入与评分核验](domains/maxwell/refs/nextplay-benchmark-import-audit-20260915.md)。

- [云效多需求分支生成 release](disciplines/dev/yunxiao-release-branch-research.md) — Flow 分支管理器、AppStack 准入、GitHub 接入与现有 cherry-pick 流程的评估边界（2026-09-17）。

- [Sand Eval 部署期间页面不可用](domains/sandai-data-smith/refs/sandeval-deployment-availability.md) — 测试 Web 策略、发布二次重启与生产边界的核验指针（2026-09-17）。

- Sand Eval 测试站 ALB 503 的现场请求、空 Endpoints 与调度等待时间线，见 [部署可用性诊断](domains/sandai-data-smith/refs/sandeval-deployment-availability.md)（2026-09-17）。

- Sand Eval 调度日志已定位入队/排队延迟及同窗离线任务大量调度失败，见 [部署可用性诊断](domains/sandai-data-smith/refs/sandeval-deployment-availability.md)（2026-09-17）。

- 2026-09-18：Sand Eval 的真实 HTTP / Playwright 分层验收、封存与下发统计及专属异步队列方法见 [验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。

- [Sand Eval 接口观测设计入口](domains/sandai-data-smith/refs/sandeval-api-observability.md) — 请求耗时、异常分类、Nginx 日志覆盖与低开销采集的代码核验指针（2026-09-18，方案未实施）。

- 2026-09-18：质检分配首次异常与自动恢复的区别、测试过早断言的纠正见 [Sand Eval 验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。

- [高光题型素材备注验收](domains/sandai-data-smith/refs/sandeval-highlight-note-test.md) — 三条对照素材、任务下发与派题回读，以及预览和正式提交的证据边界（2026-09-18）。

- [Sand Eval 旧任务链接排查](domains/sandai-data-smith/refs/sandeval-retired-task-links.md) — HTTP 200 与前端 404 的区分、旧链接生成器和现行路由核验指针（2026-09-18）。

- Sand Eval 下发请求把页面前缀当 API 前缀的排查与 PR 指针，见 [旧链接与接口路由](domains/sandai-data-smith/refs/sandeval-retired-task-links.md)（2026-09-18）。

- Sand Eval 404 修复部署与总列表剩余入口见 [路由排查](domains/sandai-data-smith/refs/sandeval-retired-task-links.md)（2026-09-18）。

- [Sand Eval 新题型集成检查](domains/sandai-data-smith/refs/sandeval-question-type-integration.md) — seed、能力预期、声明预算及同步 Gate 证据入口（2026-09-18）。

- 2026-09-18：完整 24 条 API 串行重跑、脚本/环境/外部修改的归因边界，见 [Sand Eval 验收指针](domains/sandai-data-smith/refs/sandeval-e2e-acceptance.md)。

- [Sand Eval 返修与反馈场景](domains/sandai-data-smith/refs/sandeval-correction-fixtures.md) — 部分抽样、逐题判定字段及标注员页面验收指针（2026-09-18）。

- [Sand Eval 分支自动化核验入口](domains/sandai-data-smith/refs/sandeval-branch-automation.md) — 测试部署触发器、main 回合 PR 和 Actions 权限的核验指针（2026-09-18）。

- [主任务题面预览与下发范围](domains/sandai-data-smith/refs/sandeval-dispatch-preview-scope.md) — 真实来源预览、本次配额及跨历史去重的代码核验入口（2026-09-19）。

- [日报模型通道失败与重试耗尽](domains/vidmuse/admin/pitfalls/monitoring-daily-brief-provider-timeout.md) — AWS 模型访问拒绝、PIP EOF/503、300 秒超时及未索引 log 字段的只读排查指针（2026-09-19）。

- 2026-09-19：新版质检登记、检查员权限与标注员退回页面的验收边界，见 [返修场景指针](domains/sandai-data-smith/refs/sandeval-correction-fixtures.md)。

- [MP4 附加轨道时长异常](domains/sandai-data-smith/pitfalls/mp4-extra-track-duration.md) — 12 秒画面夹带 35 分钟 SubtitleHandler 数据轨的定位与无重编码验证（2026-09-19）。

- [Sand Eval 质检布局与切号核验](domains/sandai-data-smith/refs/sandeval-review-layout-and-account-picker.md) — 深层容器宽度、账号分页及隐藏预览定位冲突入口（2026-09-19）。

- [Sand Eval 发题历史验收场景](domains/sandai-data-smith/refs/sandeval-dispatch-history-fixture.md) — 双供应商双题型、历史漏记回读与素材导入契约指针（2026-09-19）。

- 2026-09-19：Sand Eval 同名测试分支重建、自动回合与显式部署触发入口见 [分支自动化](domains/sandai-data-smith/refs/sandeval-branch-automation.md)。

- 2026-09-20：发题历史场景前次漏记结论已纠正；空间分类过滤与跨批次素材去重的核验见 [验收场景](domains/sandai-data-smith/refs/sandeval-dispatch-history-fixture.md)。

- [Caption 质检视频与正文滚动](domains/sandai-data-smith/refs/sandeval-caption-review-scroll.md) — 新题型样式覆盖、两种布局吸顶与顶部裁剪、PR #1447 验收入口（2026-09-20）。

- [Sand Eval 自动复验派回验收](domains/sandai-data-smith/refs/sandeval-auto-reinspection-verification.md) — 手动退回与正式报告的取人边界、生产独立场景及后台失败证据入口（2026-09-20）。
