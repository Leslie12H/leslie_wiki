# 时间线(append-only)

> 每次 ingest / 重要变更追加一行。格式:`## [YYYY-MM-DD] 操作 | 摘要`

## [2026-07-02] init | 初始化 wiki 骨架:domains(vidmuse 全景+5系统)/ disciplines / global / _template + schema(CLAUDE.md/AGENTS.md)+ index.md
## [2026-07-02] ingest | 梳理 vidmuse-admin 2026-06 知识地图,新增 Test Center V2 MCP / VidMCP auth / CDN / admin harness 页面,并更新 index 与 vidmuse 全景
## [2026-07-02] refactor | 将 Test Center V2 MCP / VidMCP auth / CDN / harness 页面下沉到 domains/vidmuse/admin/,避免 admin 子系统知识冒充 Vidmuse 全域知识
## [2026-07-02] ingest | 从本地 aion/zeus/vidmuse.ai 三仓库扫描并回填 Vidmuse 全景、三张 system 页和 repo scan reference
## [2026-07-02] correction | 确认 Vidmuse 产品 API 事实源是 vidmuse-zeus 而非 zeus,并将 /api/v2/threads 链路修正为 vidmuse.ai -> vidmuse-zeus relay -> AION /public/api/v2/threads
- 2026-07-06 ingest: 2026-07-06-test-center-v2-audit(Test Center V2 全链路审查 P0 结论:dedupe migration MySQL 自连接跑不过/credits 门控不对称/cancel_run 全量重算污染)
- 2026-07-23 ingest: 开新域 domains/maxwell(Agent 平台 + Quality eval 域),写入 README + quality-eval refs;背景:与 Anthropic demystifying-evals 文章做差距分析
- 2026-07-24 update: quality-eval refs 补交互设计结论(v4 原型指针、三层对象模型、能力地图=聚类标签、爬山日志、影响面 gate)
- 2026-08-31 ingest: monitoring-dashboard-window-and-day-semantics(线上监控处置大盘三套"天"的时间基准 + 全量 vs 窗口计数;修了 UTC/UTC+8 桶错位、新增 window_incident_count/window_problem_count 与 day_basis、删掉分页数据算出来的假火花图)
- 2026-08-31 ingest: admin-scheduled-report-mechanisms(admin 两套定时报表机制:外部 /cron 端点 vs 进程内 asyncio+next_fire_at;BugBotConfig.schedules 是没人读的死配置;app.py startup 有一道提前 return 的总闸会静默吞掉新后台循环;FeishuMessageClient 的 webhook_url 优先于 chat_id)
- 2026-09-02 ingest: thread-analytics-read-path-3s(Thread Analytics 8 个 Tab 30 天做不到 3 秒的读路径体检:聚合在 Python 逐行合并 MEDIUMTEXT JSON、四类指标五套完整性定义、campaign 级 fail-closed 脏门禁、outcome 窗口判断不传 end_time;方向=小时事实派生日投影+单一发布契约)
- 2026-09-02 update: thread-analytics-read-path-3s 补最终方案 v2:放弃日投影路线,改为 Thread 级窄事实表 + MySQL 直接聚合 + 读时排除过滤,退役小时表/日表/脏队列/维护锁;五步落地与决策门
- 2026-09-02 update: thread-analytics-read-path-3s 补实测证据(小时合并 30 天 1.59s;latency 明细路径无 N+1;漏斗明细路径 execution_summary_json 真 N+1)与 v3 两层设计(窄事实 + 派生日聚合 + 行数路由)、探针 SQL 位置
- 2026-09-02 update: thread-analytics-read-path-3s 补强候选根因:排除规则 NOT EXISTS 的 collation 不一致(规则表 DDL 未显式 COLLATE)导致规则表索引失效、外表逐行全扫;修法 DDL 对齐 + hash anti-join
- 2026-09-02 update: thread-analytics-read-path-3s 生产实测定根因:随机主键聚簇 + 胖行 → 30 天聚合 67k 次随机页读 13.4s(覆盖索引 COUNT 仅 93ms);规则表 collation 0900_ai_ci vs 事实表 unicode_ci 已确认
- 2026-09-02 update: thread-analytics 实施启动(分支 feat/thread-analytics-facts);Q7b tool_usage_metric 30 天 400 万行 → Tool 日聚合纳入首期,跨日 project 去重口径变化待业务确认
- 2026-09-02 correction: 漏斗明细 N+1 在 main 6cf0e384c 已修(调用方批量预加载),E3 复现绕过了调用方;批次 0 去掉该项
- 2026-09-02 update: thread-analytics 实施进度:批次 0/1 与读路径前两个端点已提交(6 个提交),漏斗/Credits 进行中;部署 runbook 定稿
- 2026-09-02 update: thread-analytics Tool 家族读路径改混合窗口(整日日表 + 零头明细 + UNION 去重),消除整日约束;模版/实验/规则接线子任务进行中
- 2026-09-04 ingest: evolve-agent-preset-business-scoped(maxwell EVOLVE 调优 Agent 单 Preset 写死跨业务不可用;根因链 + 平台模板/托管实例方案指针);maxwell README 补 Quality→EVOLVE 演进一句
- 2026-09-04 update: evolve-agent-preset-business-scoped 方案改 v2(evolve-server 当门面 + 会话表映射目标业务,不改 agent-server;否决 v1 模板复制)
- 2026-09-04 update: evolve-agent-preset-business-scoped 补两条:API Key 只能建 business 可见 Thread(门面需自做账号隔离);Variant 应用固定在被测侧适配器,否决影子 Preset
- 2026-09-04 update: evolve-agent-preset-business-scoped 补闭环差距分析指针(候选=基线、L0 证据路径两个沉默错误)
- 2026-09-07 add: analytics-maintenance-historical-rebuild-pressure(PolarDB writer 报警根因=旧维护调度器 30s 逐日重建 62 天+审计也重写;方案=退役旧路径+新路径冻结线 14 天;分支 feat/analytics-retire-maintenance-rebuild ad24be39b)
- 2026-09-07 update: analytics-maintenance-historical-rebuild-pressure 阶段 2 落地(b5295d470 删 maintenance 容器、FEATURE_SYNC 默认 false、observability 循环迁入 Worker 主容器;H=14 拍板)
- 2026-09-07 add: evolve-original-design-vs-current(原始 index.html 方案对象→当前 artifacts/表/Studio 映射表;Base 缺失、探索期 Frozen Facts 空白)
- 2026-09-07 update: evolve-original-design-vs-current 补 EVOLVE 会话页无 File Explorer 的根因(门面无 files 代理、物理 Thread 不下发、Preset 无文件工具)
- 2026-09-07 update: analytics-maintenance-historical-rebuild-pressure 第三轮:读侧五端点 daily_rollup/hourly 兜底下线(unsupported+reason)、legacy 日表写入开关默认关、hourly rollup 关、tool_daily 当天读明细+闭合日去抖消费;PR #853
- 2026-09-07 update: evolve-original-design-vs-current 补执行目标自助接入+草稿层落地要点(分支 feat/evolve-executor-onboarding,两份设计文档指针)
- 2026-09-08 update: 知识库维护规则改为相关改动检查后自动 commit、push（用户明确授权）；同步 Codex 全局入口，限定 wiki 范围并保留无关工作。
- 2026-09-08 add: timeline-preview-duration-and-export-version，记录 Take Me Over 核验入口及预览时间码与历史导出版本的证据边界。

- 2026-09-08 ingest: Suno media_urls MCP 三路回归 Case、证据入口与工具成功/音频解码验收边界。

- 2026-09-09：录入 VidMuse 接入 EVOLVE 的 A2A 执行器契约指针与评测/调优边界；本地代码核对，未实施。
- 2026-09-09：补充 VidMuse plugin GitHub 发布、AION revision cache、Zeus 创建幂等与 Maxwell 多轮契约指针，形成外层 A2A 服务设计。

- 2026-09-09：新增旧 Quality 退役核验指针，区分代码退出、物理清理与数据库删除证据。
- 2026-09-09：VidMuse A2A 与 Plugin 分支隔离完整方案写入飞书自迭代目录并回读核验；记录用户要求先方案后实现。
- 2026-09-09：审计 origin/main 调优 Agent 运行逻辑（Prompt/工具 schema/草稿层/Studio 联动），录入 8 点不合逻辑处与改法优先级。
- 2026-09-09：补记 orchestration-v4 Prompt + 7 Skill 已上线但本地未提交，对照审计 8 点标注哪些已解。

- 2026-09-09：修订 VidMuse A2A 执行器：独立仓库、接口复用与候选版本执行分层，补架构图指针。

- 2026-09-09 ingest: Kling billing/500 case 原始 SLS 根因与请求字段证据，见 domains/vidmuse/pitfalls/kling-billing-missing-resolution-20260909.md。
- 2026-09-09：新增 EVOLVE 对 Maxwell 调优接应项目页，记录三项拍板与第二轮待追加清单。
- 2026-09-09：EVOLVE 调优接应第二轮完成并复核，记录 agent-server 阻塞点与遗留。
- 2026-09-09：录入 EVOLVE 判卷解释、候选优化及业务 Judge 配置兼容的实现和验收指针（PR #269）。
- 2026-09-09: PR #269 review regression pointers added; fix status follows PR.
- 2026-09-09: PR #269 fixes and Prompt/Skill audit validation pointers added.

- 2026-09-09：补充 PR #269 DEV 发布记录、调优业务资产入口及逐文件读回核验方法。

- 2026-09-09：记录 EVOLVE 抽屉溢出与完整展示验收方法，补充真实组件、长文本及窄屏验证指针。

- 2026-09-09：记录 EVOLVE remote_running 重试转换 Bug、持久化恢复验收及未评分 Run 的展示口径。
- 2026-09-10：记录 EVOLVE 三轮升级已随 PR #269 合入 main；剩余为 agent-server 侧接口与线上 Prompt/Skill 同步。

- 2026-09-10：录入 EVOLVE 全流程稳定性审计指针，记录四个本地缺陷复现，并纠正草稿确认校验的旧结论。

- 2026-09-10：补充 EVOLVE 五类稳定性修复与回归验收指针；区分本地模拟、临时 PostgreSQL 验证和未执行的真实部署/重跑。

- 2026-09-10：补充 A2A 取消拒绝不等于终态的 Adapter 回归指针，以及中断恢复不编造超时原因的边界。
- 2026-09-10：录入 Workflow Catalog 的 Thread/Plugin 排查指针，强调检查字符串 null 过滤与真实目录状态。
- 2026-09-10：补充 Test Plugin Workflow 发布验收指针：ZIP 导入能力边界、源码哈希、Runner 挂载和目录查询。
- 2026-09-10：核对已部署 Runner 固定启动时 Workflow Catalog，补充文件发布与旧 Thread 重载的分层验收指针。

- 2026-09-10：记录报警历史 Problem 标题与当次报告不一致的核验指针及摘要口径。

- 2026-09-10：补充 EVOLVE PR #273 合并与 DEV 发布 34439061069 的验收指针，区分发布健康验证与未执行的真实评测重跑。
- 2026-09-10：记录飞书秋招表插列与合并公司行导致的同步偏差，补充按表头读取、状态优先及写后幂等核验指针。
- 2026-09-10 ingest：报警日报证据丢失链路，记录输入、综合、渲染与真实语义验收边界。
- 2026-09-10：核对 Workflow Thread 重启仍绑定旧 revision 缓存，补充实际 Plugin 缓存目录与版本发布验收指针，纠正重启即加载源目录的假设。
- 2026-09-10：补充 Test Workflow 正式 Git 发布、DEV revision 缓存和目标 Runner 重建后的三项 Catalog 验收指针，不包含真实生成验收。

- 2026-09-10 ingest: EVOLVE 已接收输出与未冻结 EvidenceSet 的展示差异；CAS 具体竞争写入仍待定位。
- 2026-09-10：补充 Workflow 返回体与 envelope 限额、重复 context 和摘要精简的代码及 PR 指针。

- 2026-09-10：补充 EVOLVE 失败 Run 的 SQL 审计定位、读写分离一致性证据及单处理器旧读取复现；保留绑定参数未采集的证据边界。

- 2026-09-10：补充 EVOLVE CAS 恢复修复 PR #276、同名 Worker 接管保护及测试边界。

- 2026-09-10：录入 Admin 服务 JWT 的部署契约与账号池鉴权验证指针；不记录凭证。

- 2026-09-10：记录 EVOLVE v2.2 工作台单提交、原型契约边界及真实组件浏览器验收指针。

- 2026-09-10：记录独立 VidMuse Executor P1 的本地实现、离线验收入口及 Variant 判级、A2A wire 和 jsonb 哈希边界。

- 2026-09-11 新增 VidMuse Git 候选准备入口，记录基准预算、真实内容 fixture 与版本实读边界的复核指针。
- 2026-09-11：核验独立 plugin_id 部署后复用创建 API 的路径，补充账号覆盖、模板限制和整仓部署边界；修正版本扩展必需的假设。

- 2026-09-11：录入 EVOLVE PR #281 DEV 发布证据，包含显式迁移授权、工作流和运行时验收边界。

- 2026-09-11：核验 PR 281 DEV 六题真实评测 Run #2，记录评分产物、重试成功、全文超时、声明代替用例输出与未覆盖能力。

- 2026-09-11：追查 PRD 六题模型事件和 Worker 日志，区分空交付、模型流失败、总预算和取消确认，记录结果 UI 修复验收入口。

- 2026-09-11：补充 EVOLVE 同任务历史 Run 对照实现与验收入口，说明可比性、缺失评分及有效评分分母边界。

- 2026-09-11：记录评测体系复盘指针，明确历史 Run 对照尚不能替代服务端候选决策验证。

- 2026-09-11：补录 Run 服务端可比性和完整任务页验收，记录 pending 重复计数修复与业务校准待办。
- 2026-09-11：记录 QA Case Agent 使用资源分工、知识样例隔离、配置回读与冒烟验收边界。

- 2026-09-11：补充 QA Case Agent 长任务预算、远端任务恢复与多轮编排验收边界及代码测试指针。

- 2026-09-11：记录 QA 配置副本移出 PR，以及调优 Agent 实际绑定与官方资源的只读审计入口。

- 2026-09-11：记录调优 Agent 资源同步回读及 PR #282 DEV 发布验证入口。

- 2026-09-11：补充报警日报发送身份回退坑：截图群成员不能代替实际 token 身份核验；保留飞书业务错误码。
- 2026-09-11：记录 PRD 摘要复验的实际 Skill 调用、知识工具契约错误、Case 修订/幂等语义及预算不匹配导致新 Run 未启动。

- 2026-09-11：补充 QA Case Agent 工具同步验证、critique 业务模型接入根因及默认免填预算修复指针，区分本地修改与线上生效。

- 2026-09-11：记录真实评测路径审查、确认准备合并、最新 Run 分页错误和尚未完成的端到端验收边界。

- 2026-09-11：记录启动确认卡片层级、结果详情加载语义及 584px 组件交互验证边界。

- 2026-09-11：记录启动卡片与现有组件视觉一致性修订。

- 2026-09-11：记录结果工作区视觉细化、共用统计描述及宽窄屏验收指针。

- 2026-09-11：记录 PR #284 合并后的 Studio + EVOLVE DEV 发布及运行时验证成功。

- 2026-09-11：监控 Agent 不认领根因与 PR 63 修正；记录权限子集检查、限定临时令牌及搜索响应仓库验证。

- 2026-09-12：补充监控恢复中的 Admin resultRef 消费契约、权威正文校验及候选报告与严格验收边界；指向 PR 872 和只读回放证据。

- 2026-09-12：补充日报 invalid_output 日志与仅生成复现指针、重试分类问题。

- 2026-09-12：补充日报 JSON 格式修复本地分支和 78 项测试指针，未部署。

- 2026-09-12：记录结构化返回的 extra_params 边界、用户允许正常改写、悬停多选与独立复制栏的本地验证。
- 2026-09-12：补充 Executor 服务部署交付物、监听/健康检查与候选发布分层的源码核验入口。
- 2026-09-12：按用户职责界定修正 Executor 独立数据库必需的假设；记录轻量适配方向及 Maxwell 外部任务重发、创建幂等和查询上下文的改造边界。

- 2026-09-12：补充 Chat 消息边缘选择、可见范围连选、Esc 清空的本地验证指针。

- 2026-09-12：登记 Admin PR #875，将日报格式修复和 Chat 多选复制优化合入同一 PR，含 alias 范围回归。

- 2026-09-12 | VidMuse stateless Adapter: state ownership correction, verified source/API pitfalls and local implementation/test pointers; live tuning remains incomplete. See domains/maxwell/projects/vidmuse-stateless-adapter-implementation.md.
- 2026-09-12 | Added three draft PR pointers, exact frozen JSON boundary, DEV full-tree preservation and private checkpoint byte storage constraints; keep preparation distinct from live application.

- 2026-09-12 | 更新 VidMuse 无库 Adapter 实施页：五仓草稿 PR、Plugin #1832、Zeus #523 补充提交指针，记录 stable PVC/current 与旧 IAM 撤权门禁、Runner 自报和继承产物原始摘要边界；动态候选、运行实读与长快照仍未完成，无部署/生成。见 domains/maxwell/projects/vidmuse-stateless-adapter-implementation.md。

- 2026-09-12 — 回读 VidMuse 无库 Adapter、Maxwell 控制面、Zeus 与 AION 原生续跑草稿提交；同步飞书 revision 114 和本地回归入口，保留未部署/未闭环边界。

- 2026-09-12 | VidMuse runtime slice: pushed five draft PRs; documented approved release catalogs, actual startup/Maxwell comparison contracts, input/receipt bounds and remaining large-snapshot preparation. Feishu revision 132 and existing version board verified; no deployment or external DDL.

- 2026-09-12 | VidMuse Adapter container delivery and AION product-owned preparation reservation: draft code, real SQL lifecycle tests, no new tables; corrected mapping recovery to reuse Zeus outbox, separated internal capture and async handle follow-ups, and updated Feishu deployment/preparation sections. No image run or deployment.

- 2026-09-12 | VidMuse PR merge verification: recorded main DEV automation, deferred Manager/Runner test imports, isolated test databases, opt-in immutable Plugin layout, publisher prerequisites and CI/deployment evidence pointers. Real generation and async preparation completion remain separate.

- 2026-09-12 | AION merge review fixes: frozen-input admission retry boundary, ordinary-message fence, remote-tool terminal progress, USTAR admission and symlink-safe proof publication. Linked targeted regressions and complete CI; in-progress log prefixes are not stall evidence.

- 2026-09-12：录入监控 GitHub App 配置定位及定向导出指针，记录 ACK Secret 注解导致模糊行定位泄露的实踩坑；未保存凭据。

- 2026-09-12 | AION second merge review: documented work/event/control admission, SQL pagination exclusion, snapshot path/shape/metadata limits and idempotent runtime reports; track new review threads during CI rather than only at the final merge gate.

- 2026-09-12 | AION final preparation/transport fixes: allow failure after persisted reserved input without claiming model processing, reserve metadata/tar overhead in capture, and repair the queue timestamp test fixture; linked latest complete CI and actual reduced-budget transport tests.

- 2026-09-12 | AION STOP boundary: successful completion waits for remote work, but failure after STOP must finalize even when a running Future cannot be cancelled; include already-consumed fast STOP and real running-Future regression pointers.

- 2026-09-12 | AION preparation filesystem and cancellation: reject ordinary access to empty reserved workspaces and commit native failure with confirmed inbox cancellation before processing; preserve consumed interrupts and link rollback, HTTP and caller regressions.

- 2026-09-12 | AION controlled request identity and import recovery: compare full request fingerprints before returning an existing Thread, serialize cooperative release creates, fence native workspace mutations and preserve committed publications after lost commit responses; linked 520 checks and current CI.

- 2026-09-12 | AION native restart boundary: ordinary recreate/reactivate cannot change frozen continuation execution; keep dedicated activation/input claim-start paths and link 308 related checks.

- 2026-09-12 | Native output content contract: video paths can be overwritten, so AION hashes file bytes and Zeus/Executor preserve and bind versioned evidence; fence ordinary streaming input and atomically publish the PID fixture exposed by full CI. Linked the three coordinated PRs and validation boundaries.

- 2026-09-12 | Native ownership and script limits: reject ordinary create/delete against checkpoint ownership; stream bounded UTF-8 scripts with stable-file and newline checks. Linked 350 checks, all 23 Zeus cross-contract tests, and the follow-up DEV release.

- 2026-09-12 | Refreshed concurrent Plugin main changes: #1844 restored ordinary DEV routing while publisher provisioning is pending; latest ordinary deployment succeeded, but the protected candidate publisher environment still has no variables. Preserve this distinction in merge readiness.

- 2026-09-12 | Merge completed for the five original PRs and Executor/Zeus content follow-ups. AION current head passed all four required checks with 24 resolved threads and a completed fresh review. Linked automatic DEV workflows and retained deployment, async preparation and real A/B gaps.

- 2026-09-14 | Audited AION #1754 against its parent: distinguish existing Plugin ID/cache support from checkpoint replay expansion, document shared SQL/lock and capture/current scope, and keep incomplete async preparation separate from full-task evaluation. No business code rollback or deployment performed.

- 2026-09-14：录入日报滚动部署后全局 owner 无接管导致循环缺失的生产证据与 PR #878 验收指针；补充 Tool/命中率 HTTP 成功后拒收、部分日 dirty 误挡、独立 Worker 有进展及历史标脏逻辑变更边界。未部署、未回填、未补发。

- 2026-09-14：补充 Analytics ac8dcb93a / PR #878 实现与 46 后端、31 前端及静态检查验证指针；区分旧日报提交 CI 通过与新提交待独立核验，保留未部署、未回填的验收边界。

- 2026-09-14：补充 11:36 旧镜像定时循环重启后自动补跑的生产日志与卡片核验；记录 PR #878 合并和部署运行指针，区分两条入库记录、一个模型分组、一张卡片及全局问题处置计数，未把旧版本成功当作新修复验收。

- 2026-09-14：生产 DMS 按完整日报条件核对三个窗口 28/22/2 条记录，定位当日启动补跑不会覆盖历史漏发日期；未补发。

- 2026-09-14 | Completed AION #1760 and Zeus #525 full reverts on main, preserving original worktrees/patches/bundles for local review. AION passed four required checks and resolved five conditional legacy-state findings using live DEV preflight; Zeus passed 349 tests and DEV rollout, with existing baseline formatting failures disclosed. Ordinary product Thread semantics are mandatory; Maxwell, Executor and Plugin remain unchanged. Linked audit, CI and deployment evidence; no production rollout or stored-data deletion.

- 2026-09-14：收录 Nextplay 真实 Case 25 分钟演示讲稿指针；明确目标产物、执行回执、有效评分与候选比较的分别验收。

- 2026-09-14：核验 AION DEV 回退工作流成功及 Manager 实际回退镜像 Ready；补充 Runner 仅构建、独立固定版本须核验的发布边界。在用 DEV Runner 版本均早于 #1754；保存只读证据，未发起生成或生产操作。

- 2026-09-14：录入 Nextplay 真实执行契约复核与 PR 292/293/294、nextplay-eval PR 2 指针；明确部署和本地目标完成不能代替 EVOLVE 初评/候选验收。
- 2026-09-14：补充真实 Run 的外层模型预算耗尽证据、Nextplay PR 3 有界等待修复及同 Skill/Prompt 回读核验。

- 2026-09-14：补充 Nextplay 第二轮真实运行的 toolEvents 上限拒收及 PR 4 全事件审计索引修复；区分 Judge 投影与执行回执边界。

- 2026-09-14：补充 PR 4 在真实混合 Runtime 流上的不足，以及 PR 5 按语义分离 toolEvents 的修正与回归证据。
- 2026-09-14：记录 Nextplay 首个完整真实基准通过及 4/5、5/5、5/5 评分，回读五文件、清理和同快照绑定。

- 2026-09-14：录入知识库大文件上传根因与本地修复指针；记录 HTTP、分块容量、原文件完整性及前后端回归入口，未部署。

- 2026-09-14：补充知识库上传修复 PR #295 交付指针与仅合并、不部署的边界；CI 和评审以 PR 当前状态为准。

- 2026-09-14：补充知识库 PR #295 评审发现的解压解析膨胀、提前分配全部行问题及修复指针；领域测试改为直接运行，保留不部署边界。

- 2026-09-14：补充 PR #295 并发 main 更新导致 CI 浅克隆缺失基线的排查指针；同步 main 后恢复范围检测，未修改部署流程。

- 2026-09-14：补充知识库高重叠率需要累计分块字节预算、失败导入必须先校验再创建知识库的评审结论与回归指针。

- 2026-09-15：录入 [Nextplay Runner Thread Preset 绑定缺失](domains/maxwell/pitfalls/nextplay-runner-thread-preset-binding.md) 的真实 baseline 400、双仓库因果与本地修复/恢复验收指针；未声明共享 Runner 已发布、真实恢复或候选比较完成。

- 2026-09-15：录入 Executor 声明、连接检查与真实执行证据分离及配置绑定的核验方法；记录 Memory JSON 克隆内部字段和 PostgreSQL/CAS 保留验证指针。

- 2026-09-15：录入 [Problem 认领触发历史告警回复](domains/vidmuse/admin/pitfalls/monitoring-problem-claim-replies-to-historical-alerts.md) 的人工动作、弱聚类、全关联通知与飞书回执追溯方法；源码审查和生产运行版本分别表述，未声明修复。

- 2026-09-15：补充来源话题绑定与旧卡刷新，录入 [Tool Errors 启动与 Analytics 内存](domains/vidmuse/admin/pitfalls/tool-errors-bootstrap-and-analytics-memory.md) 的 MIME、Web/Worker 分层证据及共享异步客户端原循环边界；记录 PR #881、461 项联合/16 项末次影响回归及本地合成内存对照，未声明合并部署或精确 OOM 因果。

- 2026-09-16：补充 [历史告警回复](domains/vidmuse/admin/pitfalls/monitoring-problem-claim-replies-to-historical-alerts.md) 的 PR #881 合并/部署指针及“新入队约束不清理旧活动”边界；原话题当次完整回读未见新消息，未将尚未定位的发送判为复发。

- 2026-09-16：录入 [分镜标签同步与视觉核验](domains/vidmuse/pitfalls/storyboard-label-sync-without-visual-verification.md)，保留 Thread 调查入口、实际视频核验方法与首次错配起因未知的边界；区分封面、播放、时长字段和导出版本，未修改线上项目。

- 2026-09-16：录入 [Runner 日志范围与错误计数](domains/vidmuse/pitfalls/runner-log-scope-and-error-count.md)，保留全量加载确认、当前文件/历史轮转边界、错误事件归并和精确帧异常的代码解释；不把历史错误或取证超时直接判为当前故障。

- 2026-09-16：录入 [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md)，记录线上 Preset 与最新源码的 JSON 依赖、纯函数报告工具设计、结果原文和容量边界；仅形成方案，未修改线上配置或验证生产卡片。

- 2026-09-16：更新 [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md) 的配套 Draft PR 883/64 与审查边界；新增 [修复尝试独立于告警认领](domains/vidmuse/admin/pitfalls/monitoring-repair-is-separate-from-claim.md)，区分已实施的报告通道与仅评估的修复功能，未修改线上 Preset 或宣称生产验收。

- 2026-09-16：补充 [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md) 的独立复审：已脱敏多行值误拒绝、operator 恢复丢协议和 Runtime 封装容量边界均有临时复现；两 PR CI 通过但本轮未改业务代码或部署。

- 2026-09-16：更新 [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md) 的授权修复追溯入口，补充完整 canonical receipt 传递、历史线程匹配、幂等脱敏与完整 Runtime 容量预算；本地验证不代表生产回填验收，状态从原 PR 883/64 查询。

- 2026-09-16：收紧 [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md) 的脱敏边界：保留合法原文不等于允许 marker 任意后缀；独立扫描凭据前缀并检验明确分隔，修复及回归证据见 MCP PR #64。

- 2026-09-16：录入 Runtime 托管业务 Judge 飞书评审方案指针；明确逐题规则、比较内版本固定、平台与业务改动及未实施边界。

- 2026-09-16：补充 [监控报告与聊天输出分离](domains/vidmuse/admin/pitfalls/monitoring-report-vs-chat-output.md) 的生产发布、先同步 MCP 再绑定 Preset、等待 Admin 飞书恢复后发布 Worker 的追溯入口；工具同步不等于开启新报告协议。

- 2026-09-16：补充监控发布后验证指针：rollout 后 Worker OOM、主服务职责核对，以及历史报告无法通过当前证据规则的验收边界；未宣称真实卡片认领链路通过。
## [2026-09-16] ingest | 记录 Nextplay 候选运行的可编辑 baseline 读取缺口、快照核验及 live/evidence-only 对照边界；保留 Run #5 入口，不将启动声明为评测或优化成功。

- 2026-09-16：录入 Analytics Worker 超大历史聊天 OOM 根因与 PR #884；区分输入隔离、完整分析和生产恢复验收。

- 2026-09-16：补充报告 canary 首次前驱哈希失败、Admin 替代链拒绝、隔离持久化及 Worker 任务归属边界；关联 MCP PR #65。

- 2026-09-16：补充 Nextplay 候选后半程的实际应用核验、同证据 Judge 波动、业务事务回执与调优 Agent 归因边界；新增 DecisionReport 顶层 usage 契约修复 PR #305 指针。

- 2026-09-16：补充 Analytics Worker OOM 修复的生产发布入口与进程 RSS、cgroup、失败持久化、检查点联合验收方法。
- 2026-09-16：记录 PR #305 合并部署后原 DecisionReport 冻结成功的验证入口；保留无改善、Judge 未校准与不采用候选的边界。

- 2026-09-16：补充 monitoring-report-vs-chat-output：分页错误码与必查 trace 全集的区别，以及实际 generation 补查回执边界。

- 2026-09-16：补充监控报告结构预检与精确记录定位，区分诊断副本和真实验收，并记录 bot 建群及 Workbench 文件保存边界。

- 2026-09-17 ingest: monitoring 原 workload 部署绑定与下游证据区别，补 PR #885 和实际验收追溯指针。

- 2026-09-17 ingest: 日报 JSON 可解析但结构校验失败，首次失败停止当天重试；补生产日志指针与字段诊断边界，修正独立调度说明。

- 2026-09-17 ingest: 对比 #881–#883，区分调查 Preset/报告交付变化与日报既有结构校验失败，保留间接输入影响尚未证实的边界。

- 2026-09-17 ingest: 日报同窗一次真实生成通过 schema 与来源校验，复用结果补发并回读确认；补原始请求响应、飞书消息指针及不能还原 10:00 历史失败的边界。

- 2026-09-17 ingest：Studio composite env 发布白屏、候选展示修复与业务候选采用边界；证据指向 PR #307/#308。
- 2026-09-17 ingest：补充日报 invalid_schema 有界结构纠正、内容安全诊断及同窗生产回放指针，区分历史失败和实际发送验收。

- 2026-09-17 verify：#308 main Web 发布后白屏恢复，候选评分、运行来源、决策报告及 Judge 质量提示已浏览器核验。
- 2026-09-17 ingest：隔离调查同事件验证 32 KiB 单消息容量冲突与无损分段接单，记录既有 Run 恢复保护及真实报告/卡片验收边界。

- 2026-09-17 ingest：候选 Variant 正文入口、Benchmark 定版与历史成绩边界、Nextplay 异步执行并发及串行判卷的代码核验。
- 2026-09-17 ingest：记录 canonical 分段接收与部署证明关联缺口，补历史快照拒绝和观察值结构预检边界，指向 Admin #885 / MCP #67 及真实隔离回放。

- 2026-09-17 ingest：真实隔离卡片认领、落库和更新回执已验证，关闭卡片并清理本次七条临时记录；区分报告接受未完成与独立回调验收，补完整 Monitoring CI 门禁。
