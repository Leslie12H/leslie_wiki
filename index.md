# leslie_wiki 目录

> 全库入口。每个 session 先读本文件,再按任务相关性 Read 具体 page。
> 维护规矩见 [CLAUDE.md](./CLAUDE.md)。

## Domains(业务系统)

### vidmuse — [业务全景](domains/vidmuse/README.md)
- [Workflow Catalog、Thread 与 Plugin](domains/vidmuse/refs/workflow-catalog-thread-plugin.md) — 返回体限额、Git revision 发布、缓存/Job 重建验收、路径执行和字符串 null 过滤排查指针
- [aion](domains/vidmuse/systems/aion.md) — agent/runtime/media generation 后端平台
- [vidmuse-zeus](domains/vidmuse/systems/zeus.md) — Vidmuse 产品 REST API + AION relay
- [vidmuse.ai](domains/vidmuse/systems/vidmuse-ai.md) — 面向用户的 Web 前端
- [前端 QuickTracking 指标](domains/vidmuse/refs/quicktracking-frontend-metrics.md) — RUM 采集现状、OpenAPI 拉报表而非明细、数据会变需 upsert、首字节三种口径
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
- [VidMuse A2A 执行器契约](domains/maxwell/refs/vidmuse-a2a-executor.md) — 独立仓库方案、现有 API 复用边界、Git 分支隔离与运行版本承载；评审阶段
- [Quality 域 eval/自迭代指针](domains/maxwell/refs/quality-eval.md) — eval schema/judge/optimizer/harness 代码位置 + 2026-07 机制要点
- [旧 Quality 退役核验](domains/maxwell/refs/quality-retirement-audit.md) — 主动入口退出与源码/建表残留、混合业务库删除边界
- [EVOLVE 原方案对象→当前实现映射](domains/maxwell/refs/evolve-original-design-vs-current.md) — 2026-09-07 index.html 的 workspace/ 目录 vs artifacts/表/Studio 页面;Base 缺失、Diagnosis/Metrics 有壳无方法、探索期右栏空白
- [EVOLVE 调优 Agent Preset 业务私有坑](domains/maxwell/pitfalls/evolve-agent-preset-business-scoped.md) — 2026-09-04 单 Preset 写死导致跨业务不可用;根因链 + 共享调优 Agent 方案指针
- [EVOLVE 调优 Agent 运行逻辑审计](domains/maxwell/pitfalls/evolve-tuning-agent-loop-audit-20260909.md) — 2026-09-09 main 审计：双冻结路径无通知、确认不校验 payload、产物形状对 Agent 不可见、context 混入被测输入等 8 点
- [EVOLVE 对 Maxwell 目标的调优接应](domains/maxwell/projects/evolve-maxwell-tuning-receiving.md) — 2026-09-09 进行中：分支/拍板点（基准由 EVOLVE 获取、level 由预检决定、不用累计 patch）/第二轮待追加项

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
