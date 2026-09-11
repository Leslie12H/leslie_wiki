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
