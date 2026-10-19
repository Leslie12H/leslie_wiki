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
- 2026-09-10 ingest：EVOLVE 长程任务确认环节自动应答方案指针，记录 input-required 判失败现状与 Responder Method 推荐。
- 2026-09-10：核对 Workflow Thread 重启仍绑定旧 revision 缓存，补充实际 Plugin 缓存目录与版本发布验收指针，纠正重启即加载源目录的假设。
- 2026-09-10：Interactive Responder 方案同步到飞书文档，指针页补链接。
- 2026-09-10：补充 Test Workflow 正式 Git 发布、DEV revision 缓存和目标 Runner 重建后的三项 Catalog 验收指针，不包含真实生成验收。

- 2026-09-10 ingest: EVOLVE 已接收输出与未冻结 EvidenceSet 的展示差异；CAS 具体竞争写入仍待定位。
- 2026-09-10：补充 Workflow 返回体与 envelope 限额、重复 context 和摘要精简的代码及 PR 指针。

- 2026-09-10：补充 EVOLVE 失败 Run 的 SQL 审计定位、读写分离一致性证据及单处理器旧读取复现；保留绑定参数未采集的证据边界。

- 2026-09-10：补充 EVOLVE CAS 恢复修复 PR #276、同名 Worker 接管保护及测试边界。

- 2026-09-10：录入 Admin 服务 JWT 的部署契约与账号池鉴权验证指针；不记录凭证。

- 2026-09-10：记录 EVOLVE v2.2 工作台单提交、原型契约边界及真实组件浏览器验收指针。
- 2026-09-10：EVOLVE 能力升级方案 v2（业务贴合/优化策略/Agent 在环应答）写入仓库并同步飞书，指针页补记。
- 2026-09-10：EVOLVE 能力升级 P1–P4 拍板记录与子 agent 实施分支登记。
- 2026-09-10：评估 VidMuse A2A 执行器飞书方案，记录 Variant/receipt 合同与 EVOLVE 现有实现的冲突及对齐建议。

- 2026-09-10：记录独立 VidMuse Executor P1 的本地实现、离线验收入口及 Variant 判级、A2A wire 和 jsonb 哈希边界。
- 2026-09-11：EVOLVE 能力升级 P1–P4 合并为单提交 2d6c2945，验证全绿；迁移 0007–0010 与 agent-server 侧仍待人工/跨团队。
- 2026-09-11：EVOLVE 四阶段迁移合并为单个 0007_evolve_capability_upgrade.sql，避免重复重建同组 CHECK 的回退式中间态。

- 2026-09-11 新增 VidMuse Git 候选准备入口，记录基准预算、真实内容 fixture 与版本实读边界的复核指针。
- 2026-09-11：EVOLVE 能力升级开 PR #281；记录 squash 基线前移与 code-review 审错分支两个坑，及三个子 agent 接缝阻塞问题。
- 2026-09-11：核验独立 plugin_id 部署后复用创建 API 的路径，补充账号覆盖、模板限制和整仓部署边界；修正版本扩展必需的假设。
- 2026-09-11：补充 VidMuse 候选仅 DEV 发布约束、产品账号与 Token 边界、公共依赖独立版本及同名 Skill 覆盖核验指针。

- 2026-09-11：登记 9–10 月 OKR 中照野的独担/共担/兜底边界，串联 O2 跨团队阻塞与 O1-KR4 报警前置缺陷。

- 2026-09-11：开 sisyphus 域，登记 quality_dashboard 日投影表、发版门禁模型、Agent Token 与 cron 触发器，并标注调度模型不可套用 admin。

- 2026-09-11：核验生产 Tool 日汇总反复标脏及前端拒收 updating；记录只读证据与修复边界。

- 2026-09-11：追加生产 Worker 500 行日志样本及量化边界，区分重复分析、待更新数量与数据库负载。

- 2026-09-11：补充 Tool 指标完整发布快照的实现指针和 InnoDB 一致性读取注意事项；本地验证，未部署。

- 2026-09-11：补充 PR 871 review 指针；已修部分无效写读，仍未通过生产降载与展示验收。

- 2026-09-11：记录 #870 增量贡献设计指针，解释全日替换与项目引用计数边界。

- 2026-09-11：生产 Admin 只读表清理审计；登记候选及代码/运行态证据边界，未删除表。

- 2026-09-11 ingest：监控 Agent 不认领定位至 MCP GitHub App 仓库范围校验；记录生产只读证据与恢复边界。

- 2026-09-11：用户确认新增仓库权限；记录 readiness 改子集检查、保留工具白名单的实现指针。
- 2026-09-12：补充 Executor 服务部署交付物、监听/健康检查、独立数据库与候选发布分层的源码核验入口。

- 2026-09-12：核对 Maxwell 主干 4a91b778 的业务 Preset 评测入口，记录 maxwell_preset / external_a2a 的选择和执行证据边界；未登录核对目标配置，未登记或执行评测。

- 2026-09-12：按用户澄清纠正 Nextplay 是被测目标、所给 Preset 是外层执行器；补 external_a2a 派发和结构化回执源码边界，未登记或运行。

- 2026-09-12：核对 Nextplay 外层执行器 AppKey 获取与最小权限；绑定尝试停在登录，未登记或预检。

- 2026-09-12：从 UI 核对 Nextplay 与影游a2a 是两个业务，纠正评测登记位置与 AppKey 归属，补充 Card 同源门禁源码指针；实际接口 URL、绑定修复与真实执行仍待验证。

- 2026-09-12：读取影游a2a 外层 Candidate Runner 的实际 Prompt 与 Skill 绑定，补输入基准、完整候选及 Runtime 文件证据的适配核验指针；未读脚本或执行测试。

- 2026-09-12：通过单次只读 GET 与 ACK/CDN 控制台确认外层 Card 宣告回源 origin，补回源协议、公开请求头与文件证据源码核验指针；未修改云配置、部署或发起 Nextplay 测试。

- 2026-09-12：核对部署版 EVOLVE 同源失败未缓存客户端且未发送任务；补下次重取 Card 与 uncertain 错误分类边界，无需为该失败重启或重登记。

- 2026-09-12：录入监控 GitHub App 配置定位及定向导出指针，记录 ACK Secret 注解导致模糊行定位泄露的实踩坑；未保存凭据。

- 2026-09-12：复核部署版和主干的 JSON output 持久化与判卷链路，纠正通用文件下载管线是接入前提的建议；补 preflight_failed 复用方案，未改业务代码。

- 2026-09-12：核对 17:22 外层预检 Trace，确认 skill_load 后 ask_user 导致 input-required 并被取消；未调用内层，补 probe 分支与绿色可达性的验收边界。

- 2026-09-12：记录 EVOLVE 连接预检实现 9c09993b，以 Card-only / HTTP 单次协议 POST 替代合成能力探测；未知能力允许真实试跑，保留运行回执比较保护，旧 Nextplay probe shortcut 建议标记为被平台改法替代。

- 2026-09-12：记录 EVOLVE PR #287 合并与 DEV 发布 34686981214，核验 Studio 构建 193、API/Worker 镜像及原影游a2a 执行器 Card-only 复验通过；未发起 Nextplay 真实评测，另记按钮旧 tooltip 指针。


- 2026-09-12：记录 Nextplay 首轮工作区与执行目标列表刷新核验，补 Creative Production Agent 的协议读取和 Case 场景纠正指针；目标、基准方案、Judge、Case 修订草稿 v2 已保存但未冻结，基准待选定，未发起真实初评或候选运行。

- 2026-09-14：核对 Nextplay 判卷失败的 UI 与主干，定位 Maxwell Judge 依赖仅由 Maxwell Agent 登记初始化的业务凭据；纠正 endpoint 表单及 A2A Token 混淆，未改配置或发起 Run。

- 2026-09-14：记录 EVOLVE 判卷授权独立初始化修复及回归入口，保留 A2A 执行器与业务模型权限边界；本地修复未部署。

- 2026-09-14：记录 EVOLVE PR #288 合并与固定提交 DEV 发布核验；API/Worker 滚动更新和 Studio 196 入口已确认，未创建判卷凭据或真实 Run。

- 2026-09-14：记录 Nextplay Trial remote_interaction_required 追溯、交互配置检查入口和已判卷误标；远端实际问题待核实。

- 2026-09-14：从远端会话确认 Candidate Runner 索要替换包，尚未启动 Nextplay；补充初评与候选输入契约不匹配的根因。

- 2026-09-14：下载并静态审查 Runner 包，确认底层支持无 patch 基准物化及三项后续能力边界。

- 2026-09-14：记录双仓库本地修复、26 项 Runner 回归、冻结传递测试和排版预览，线上未发布。

- 2026-09-14：记录 nextplay-eval 正式构建入口、基准模式资源部署及回下载核验边界。

- 2026-09-14：核对现有 A2A 包装运行与 Dataset 执行器，记录 NextPlay 基准接入最终实施计划。

- 2026-09-14：录入 NextPlay Benchmark 实施指针；记录模型目录校验与实际生成的区别、温度兼容修复及未完成项的代码位置。

- 2026-09-14：核验 Maxwell main 部署 34824272805 成功、Studio 200 和原 Runner Skill/Prompt 更新；真实 Trial 验收仍待执行。

- 2026-09-15：录入 EVOLVE 两条——aggregationPolicy.errorPolicy 取 fail 时执行错误被算成质量 FAIL 的破口，以及只拒新 Run、保历史回放的修法；模型用量记账口径（未知不等于 0、只记录不决策、不折算金额）、判卷与非判卷两族指标的分家理由，以及 context 带外 Recorder 为何不改 Method 契约。

- 2026-09-15：录入 PR #299 通用平台审查指针，保留审查提交与 Benchmark、CAS 引用闭包、外部 Method、Studio 参数传递的复验方法。

- 2026-09-15：补充 [EVOLVE 通用平台审查指针](domains/maxwell/refs/evolve-generic-platform-review.md) 的外部 Method 完整闭环和 Benchmark 旧版资产回归入口；修复和 CI 状态仍以 PR #299 为准。

- 2026-09-15：补充 [EVOLVE 通用平台审查指针](domains/maxwell/refs/evolve-generic-platform-review.md) 的 PR #299 DEV 发布、0008–0010 迁移与 Studio 207 核验入口，以及按组件判断发布和固定 ref 的复用方法。

- 2026-09-15：录入 Nextplay Benchmark 导入与评分核验指针；真实源导出、Go 准入、UI 和跨 Work 边界，未声明线上导入或真实评测完成。

- 2026-09-15：追加 Nextplay 能力卡诊断指针：旧 probe none 被误判不可用，真实结构化 Trial 与声明更新链分别核验。

- 2026-09-15：录入 PR #300 发布边界：同事务 ALTER/INDEX 持锁、保留增量结构回滚、完整 GitHub 资源预览和 DEV 只读预检证据。

- 2026-09-16：录入 [EVOLVE 报告与结果语义审查](domains/maxwell/refs/evolve-pr302-review.md)，保留 PR #302 五类可复现问题的代码与验证指针；未修改业务代码、合并或部署。

- 2026-09-16：追加 [PR #302 修复回归入口](domains/maxwell/refs/evolve-pr302-review.md)，记录 amend 提交与真实 Axios、Store、SSR、HTTP/MCP 授权测试位置；未合并或部署。

- 2026-09-16：追加 [PR #302 main 发布核验入口](domains/maxwell/refs/evolve-pr302-review.md)，记录 main bd69eefe、DEV 工作流与 Studio 212 来源，区分服务部署和真实评测验收。

- 2026-09-16：录入 [Nextplay Runner Thread 绑定失败](domains/maxwell/pitfalls/nextplay-runner-thread-preset-binding.md)，保留实际失败与冻结 Judge 核验指针，区分外层完成、内层执行和判卷。

- 2026-09-16：补充 [Nextplay 导入闭环核验](domains/maxwell/refs/nextplay-benchmark-import-audit-20260915.md)，记录正式 Go 准入产物入口、来源标签转换、Case 草稿与阶段门槛、Studio/共享 Agent 隐藏题边界；不声明线上导入或评测完成。

- 2026-09-16：追加 EVOLVE 会话加载 9 月 9 日业务 target-recon 的哈希匹配证据，说明服务发布与业务 Skill 同步边界。

- 2026-09-16：核验并记录 EVOLVE 实际共享资源业务、10 Skills/核心 Prompt 同步及 Runner Preset 绑定修复包回读；保留原运行配置，业务端到端复跑另行核验。

- 2026-09-16：单条线上回归证实 Runner 创建 Thread 的 presetId 修复生效；目标另行违反文字限定，停止并保留失败证据，未声明评测通过。

- 2026-09-16：录入 Nextplay 评测与调优验收入口，区分运行准入、证据充分、D1–D5 判卷及真实候选对照。

- 2026-09-16：录入 Judge 参数拒绝被掩盖为 judge_unavailable 的排查方法与保存证据重判指针。

- 2026-09-16：录入自由画布抽卡导出的源表/代码指针、长字段与飞书回读验收方法、选片证据边界。

- 2026-09-16：补充自由画布当前展示版本匹配、自动激活语义与飞书最小改动核验指针。

- 2026-09-16：录入 Analytics Worker 超大历史聊天 OOM 根因与 PR #884；区分输入隔离、完整分析和生产恢复验收。

- 2026-09-17：录入 Sand Eval / Sandworm SQL 与锁排查入口，保留固定窗口证据指针，区分锁获取失败、状态提交冲突与连接池耗尽。

- 2026-09-17：录入 Sand Eval 本机启动指针，记录集群配置来源、pnpm dayjs 依赖解析与前后端分层验收。

- 2026-09-17：录入 Sand Eval 角色与工作流指针，区分角色配置、任务任命、导航视角及质量完成与交付边界。

- 2026-09-17：记录 Sand Eval 多角色实测与派题时间精度冲突核验指针，保留部分写入现场；后续质检被阻断，未声称全流程通过。

- 2026-09-17：补充 Sand Eval 自动化运行入口与 PR #1287 指针，区分隔离服务/DOM 测试和真实资源只读证据。

- 2026-09-17：记录 Sand Eval 质量中心测试数据构造与验收入口，区分任务内 QcCard 队列与中心分配。

- 2026-09-17：录入 Test / Prod 与短期验收候选的流程建议，明确验收 SHA、hotfix 同步和单环境并行限制；未修改业务仓库。

- 2026-09-17：补充 Sand Eval 真实 HTTP E2E 和实际 UI 断言入口，记录前置失败阻塞、未实现变体及脚本版本证据边界。

- 2026-09-17：依据用户确定流程新增 Test/Main Cherry-pick 团队规范，明确上线候选、回合部署回归及责任；旧短期候选建议标记未采用，未修改业务仓库。

- 2026-09-17：创建并回读飞书《团队研发与发布规范》，涵盖八节流程和上线回合检查单；云文档链接录入规范页。

- 2026-09-17：补充 Sand Eval 生产派题时间核验与截图指针，明确 CLI 不建 wave 的入口差异，避免误报页面缺陷复现。
- 2026-09-17：补 Nextplay Case 导入 400 的本地正式 HTTP 复现与管理导入修复指针，区分线上症状、本地测试和未发布状态。

- 2026-09-17：记录云效多需求分支自动生成 release 的官方调研指针及现有团队流程边界；未实施迁移。

- 2026-09-17：录入 Sand Eval 测试发布空窗诊断入口，区分 Web Recreate、QC 激活二次 rollout 与生产滚动更新；未将测试证据推断为生产故障。

- 2026-09-17：补 Sand Eval 测试站 ALB 503 现场闭环：Web 先降零、新 Pod 等调度 3 分 35 秒、Ready 后公网恢复；调度等待原因仍未定。

- 2026-09-17：补 Eval scheduler 日志：目标 Pod 选点绑定仅 31ms、578 个可用节点；同窗 5060 次调度尝试与 4441 次离线任务失败，区分确定事实与拥塞解释。

- 2026-09-18：补充 Sand Eval 普通题 HTTP + Playwright 自动化入口、前置阻塞分类、两轮下发统计和独立队列复验方法。

- 2026-09-18：录入 Sand Eval 接口观测代码指针与统计边界；SLS 看板为待实施方案，现网采集尚未核验。

- 2026-09-18：补充 Sand Eval 全新任务串行分配复验指针，区分首次异常、自动恢复和最终质检可用性；保留共享测试库隔离边界。

- 2026-09-18 ingest：高光题型素材备注测试入口；记录三条对照素材与导入、下发、派题、题面预览的验证边界。

- 2026-09-18：记录 Sand Eval 旧任务答题卡地址的路由诊断与两个遗漏入口，业务代码未改动。

- 2026-09-18：追加 Sand Eval 下发/预览 API 前缀错配、fetch 边界回归与 PR #1350 指针。

- 2026-09-18：补充 Sand Eval 404 修复测试部署与创建回读证据，以及题目包总列表 new_task/new-task 剩余死链指针。

- 2026-09-18：记录 main 回合 test 时新题型缺失集成项的检查指针与 PR #1354。

- 2026-09-18 ingest：补充 Sand Eval 全轮 API 重跑证据入口及归因方法，区分异步恢复、HTTP 超时、角色流转遗漏、导出配置与测试对象外部修改。

- 2026-09-18：录入 Sand Eval 返修与反馈测试夹具构造及真实标注员验收指针。

- 2026-09-18：记录 Sand Eval test 自动部署与 main 回合的实现准备指针，区分本地改动、仓库权限及实际生效。

- 2026-09-19：记录题面预览与下发范围的区别及重复素材核验入口。

- 2026-09-19：核验告警日报三次模型请求超时，记录 AWS 访问拒绝、PIP EOF/503、重试耗尽及 SLS log 未索引的排查指针；未补发或修改生产。

- 2026-09-19：EVOLVE v3 前端可用性整改后记坑：任务→执行器要读 TargetProfile.executorRef 而非 targetRef；会话列表慢在前端 N+1 补读标题；sessions executorRef 实按 target_ref 匹配；视觉对齐 Studio tokens。

- 2026-09-19：补充 Sand Eval 新版退回场景的角色资格与标注员页面核验指针。

- 2026-09-19：记录 Sand Eval MP4 附加数据轨导致时长歧义的证据、浏览器未复现边界及本地重新封装验证。

- 2026-09-19：录入 Sand Eval 质检嵌套布局、账号列表分页与隐藏预览焦点冲突的代码和 PR 核验指针。

- 2026-09-19：录入 Sand Eval 发题历史场景与发布回执/历史计数分开验收的证据指针。

- 2026-09-19：记录测试分支重建及 PR #1418 自动 merge、SHA 校验和显式部署触发的核验指针。

- 2026-09-20：核对测试服务账本和空间类型审计，纠正发题历史场景的漏记误判与记录数相加错误。

- 2026-09-20：记录 Caption 质检滚动差异与 PR #1447 修复入口，覆盖展开对比、普通/展开吸顶和正文顶部边界。

- 2026-09-20：录入影游 Agent Benchmark 综合评测报告（9.19）的结论与下一轮协议清单，作为评估 EVOLVE 能否承载 Nextplay Benchmark 的对照入口。

- 2026-09-20 ingest：Sand Eval 自动复验派回的生产场景与证据入口；区分原检查停止事实和正式报告，指向可重查的运行记录。

- 2026-09-20 ingest：补充 Sand Eval 复验抽题的稳定身份对照方法，以及 50 抽 10、3 题必检生产场景的证据入口。

- 2026-09-20：录入 Caption v6 题目详情 500 的上下文契约排查指针，已核验生产堆栈与运行容器代码。

- 2026-09-20：核验 Caption v6 错误引入于 bd19eca67，PR #1446 合入；区分前置整题重构、回归引入与生产上线时间。

- 2026-09-20：记录 Caption v6 整题契约修复候选 c02848017 与本地验证入口，PR/Gate/上线待后续核验。

- 2026-09-20：只读核验 Caption v6 存量派发配置，确认候选新增人数锁定策略不兼容；留存两次查询和候选校验依据，未改生产。

- 2026-09-20：v6 候选 c3ced3f20 移除新增人数锁定约束，历史配置回放通过且无改写；生产未变更。

- 2026-09-20：记录云度测试任务 Sand 退回后直接验收、重新交接未进入自动复验执行队列的证据指针。

- 2026-09-20：记录生产 1000 题复验快照已冻结但执行未登记造成范围冲突的证据与恢复边界。

- 2026-09-20：记录 Caption 回交成功、未生成自动执行，以及 Sand 手工复验动作仍可用的运行服务证据。

- 2026-09-20 | ingest | 更新 Sand Eval 两条自动复验修复候选代码与回归指针；保留 Gate、部署及存量恢复边界。

- 2026-09-20：补充 Sand Eval 固定整改提交意图、自动回交请求版本与逐条提交中断回归入口，见 `domains/sandai-data-smith/refs/sandeval-auto-reinspection-verification.md`。

- 2026-09-20：补充正式环境 Sand 直接验收回交自动派回原质检员的独立场景、部署和浏览器验收证据指针。

- 2026-09-21：记录生产任务新版质检完成、旧详情读取QcCard/QcRound导致空批次的证据与修复边界。

- 2026-09-21：完成固定main的新旧质检详情兼容方案，并核实新版amendment与旧amended结论的精准对应。

- 2026-09-21：扩展新旧质检兼容方案至概览与答题卡分析，记录全量卡/取值索引、时间归因和查询性能验收边界。

- 2026-09-21：补充高光待标注场景证据指针，以及发题范围校验变化的原草稿恢复方法。

- 2026-09-21：记录切片标注场景的完整附件与媒体映射核验方法，保留真实播放和未提交入口。

- 2026-09-21：记录秋招雷达公共岗位与私人投递隔离的泄露路径、平台身份边界及权限回归方法。

- 2026-09-21：补充构图待质检入口，区分答题完成与批次提交质检，验证3题待检查工作台。

- 2026-09-22：补充 Sand Eval 多进程质检恢复与取连接阶段归因方法，保留已证实并发和未验证恢复幅度的边界。

- 2026-09-22：记录 CI 收窄时文档清单和生成器依赖造成的间接门禁，以及分类样例与失败聚合核验方法。

- 2026-09-22 ingest：Sand Eval 整包提交禁用，记录重新分批旧 scope 重复汇总的只读排查指针。

- 2026-09-22：补充整包重复案例转派审计，区分同一工作项与不同答案版本。

- 2026-09-22：新增 VidMuse 访问日志核验入口，区分内部 Nginx sidecar 与网站 ALB 入口，保留生产未核验边界。

- 2026-09-22：补充 Sand Eval PR #1673 漏掉整包持久化前批次过滤、导致 `SOURCE_SCOPE_CHANGED` 的代码复核指针。

- 2026-09-23：补充 Sand Eval 最新主线仍漏正式交接执行、Sand 批次续跑与成果资格三处 live batch 口径，并记录本地修复提交与未部署边界。

- 2026-09-23：记录 Sand Eval 负责人代交接接口因运行时属性名错误直接 500、未进入 QualityError 门禁的诊断方法。

- 2026-09-23：补充 Sand Eval 已完成批次恢复由负责人直接分配、标注员交接不再作为分配门禁的产品裁决与本地修复指针。

- 2026-09-23：更新 CI 精简方法，加入叶子测试定向、共享夹具回退全量、Collect 负向依赖边界及过期部署成功跳过原则。

- 2026-09-24：补充 Sand Eval 分配计划与真实质检待办数量不一致的排查口径，要求同时核对检查任务、当前提交链和本人工作台。

- 2026-09-24：补充 Sand Eval 整包显示待提交但按钮禁用的 `RECIPIENT_UNRESOLVED` 排查，区分验收数、整包生成与唯一负责人配置。

- 2026-09-24：补充 Sand Eval 手动退回后旧质检轮次保持只读、编辑权迁移至后继复验轮次，以及旧链接状态投影/跳转缺口的排查口径。

- 2026-09-24：Ingest Sand Eval 检查读取与保存性能源码核验入口，补充报告批量读取、范围复用、索引构造与动态校验边界，并纠正旧观测页不能代表当前 ARMS 覆盖；未改业务代码或验证线上收益。

- 2026-09-24：复核报告批量读取与 Sand 保存分组定位方案，补记重复读取风险、无关组深度校验的行为变化及定位完整性测试指针；未实施业务代码。

- 2026-09-24：补充 Sand 批次报告读取优化的仓内实现 Note 指针，以及批量依赖读取前保留循环引用错误的校验顺序；实现、CI 与线上收益分别核验。

- 2026-09-24：补充 PR #1839 上线后固定窗口报告指针、负责人全量页码统计的源码入口、请求参数构成与共享连接竞争的因果边界，以及 ARMS 分页和 Nginx 去重口径。
- 2026-09-24：补充 leader 与 leader/progress 的独立调用链、live 重复范围读取、页内并发和统一取消的核验指针，以及连接 setup 前空档的归因边界。
- 2026-09-25：核验 Sand Eval 生产迁移后旧 SLS 看板无实时数据的原因，记录新项目日志库与重建的 API 看板入口；后续迁移须先核对 ACK 与 SLS 采集映射。

- 2026-09-25：补充 Sand Eval 提交链 trace、整包规模、恢复重试及 SLS 通配覆盖核验指针。

- 2026-09-25 ingest：派题性能六项证据入口；记录部署路径与 autocommit 边界、同 worker 关联方法、分块和内存实验及缺口。
- 2026-09-25 ingest：Sand Eval 质检分配并行进度写回冲突导致 36 批停在“准备中”；记录现场 trace、部署代码因果链、错误码证据边界与原分配续跑验收指针。
- 2026-09-25：按用户授权续跑该生产原分配；负责人详情回读 37 批均有 100 条样本、0 批准备中，补记会话切换、一次可恢复错误与跨身份验证边界。
- 2026-09-25：区分首次进度写回中断与续跑期间单批派单错误；补记“待处理”的 error_message 投影条件、成功重试清除错误及日志未保留具体错误码的边界。
- 2026-09-25：核对叶子浩原分配 10 批共 1000 道，其中 200 道已提交待验收、800 道仍在质检中；记录质检员“待处理”和“已提交”的口径区别。
- 2026-09-25：按生产 SLS 和 ARMS trace 定位质检员任务列表 8.49 秒样本，记录实时模式约 20 条并发成员计数 SQL 与候选查询的证据边界。
- 2026-09-25 ingest：记录 Sand Eval 多轮退回时直接父处置 ID 缺失导致上游意见丢失的排查与验收指针，关联 PR #1913。
- 2026-09-25：Sand Eval 质检员列表新版部署后慢请求；区分实时批次计数和状态筛选逐批扫描，记录生产 trace 与摘要开关的证据边界，见 [检查读取与保存性能](domains/sandai-data-smith/refs/sandeval-review-performance.md)。
- 2026-09-25：记录 Sand Eval #1921 草稿 PR 分类器错误、Ready Gate 通过及干净开发分支直接向 main 提 PR 的当前发布指针。

- 2026-09-26：录入 browser-impersonation-concurrent-tests：Sand Eval 时长验收中共享浏览器代登录冲突、独立会话与实际后台状态核验边界。

- 2026-09-26：录入 Sand Eval 供应商任务与批次分类的代码、配置与帮助文档指针；不保存发布状态。

- 2026-09-26：录入 Ant Design 两字中文按钮可访问名称插空格的选择器陷阱与 PR #1976 核验指针。

- 2026-09-26：记录质检员 page-index 500 的未引用参数类型错误、生产异常栈关联与测试适配器的覆盖缺口。

- 2026-09-26：核验质检核对方案旧页面调用已删除 preview API 的 404，记录版本兼容断裂与生产请求时间线。

2026-09-27：录入 Sand Eval 流程消息验收指针，区分收件、可见、链接与整改后续，保留本次测试报告和证据路径。
- 2026-09-27：新增 Sand Eval 压测与 auth/me 请求归因入口，保存五类接口 SLS/ARMS 对账指针及数据库统计可见性边界。
- 2026-09-27：补充单卡 page 无范围投放反查的 SLS loop_stall、ARMS 与普通 EXPLAIN 证据指针。

- 2026-09-27：复核骆沙展 Sand Eval 交接阻断，更新质量中心测试数据 page 的任务/整包状态边界与生产证据指针；未改生产数据。

- 2026-09-27：录入 Sand 待复验提前展示的生产排查入口，区分整改 processing、供应商验收与真实 Sand 复验派单。

- 2026-09-27：更新质量中心验收指针，补充整包负责人配置的 dry-run/apply 服务审计、报告保全与本人提交权限验收流程。

- 2026-09-27：复核 PR #1792 的整包负责人兜底；记录实时选人权限验证与未透传真实阻断导致生成中误报的排查指针。

- 2026-09-27：补充 Sand 嵌套整改后负责人验收阻塞的只读证据及精确授权排查指针。

- 2026-09-27：记录嵌套整改验收接续实现与原方法错误复现，补充直接执行组和交接恢复候选的核验边界。

- 2026-09-27：记录验收接续 review 的两项复现边界：连续标注退回、autocommit 部分授权写入。

- 2026-09-27：记录结算明细只读性能诊断入口，覆盖筛选触发全量生成、质检读取放大、app/edge 取消对账与整包判定优化边界。

- 2026-09-27 ingest：记录 Sand Eval 单题质检判断修正的受控 CLI、有效判定回读及问题位置版本报错的边界；证据见 sandeval-single-judgment-correction。

- 2026-09-27：复核结算优化方案，纠正权限门禁与快照无缓存判断，补充不可变报表、前后版本校验、批次证据和后台作业边界。

- 2026-09-28：补充质检分配撤销与退回的核验入口，记录精确allocation范围、页面进度与生产写入边界。

- 2026-09-28 更新质检分配撤销指针：明确授权生产操作后的审计归档、CAS冻结、批次释放、真实身份和页面验收；证据保存在任务报告。

- 2026-09-28 ingest：记录 Claude 工作树迁回本机后的旧路径修复、未提交内容保全及 rebase 范围核验方法；实例指向 Sand Eval PR #2105。

## 2026-09-28 补入远端分支的历史记录

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

- 2026-09-17：补充 Monitoring 第三次 canonical 报告严格接收与 SQLite 状态机/卡片验收，明确独立真实回调不等于生产新协议切换。

- 2026-09-17 ingest：13 份历史报告的缺少 Pod 注解绑定根因与逐份回放；补报告 ID/关联键预检、有界重新采证、不可变源码分段读取及上线同步边界。

- 2026-09-17：补充监控报告生产发布验证指针与源码分段传输脱敏边界；保留卡片回调、新协议切换未完成的证据区别。

- 2026-09-17 ingest：补充正式 preset 切换的资源回读/PVC 回执边界及新增代码行号数字占位回归，指向 MCP #68 与实时验收记录。

- 2026-09-17 ingest: scoped alert trace aliases, immutable evidence hashes and independent root-cause cluster rejection; Admin #887.

- 2026-09-17 ingest: persisted retry delivery protocol and bounded recovery for downstream filtered-query proof selection; Admin #887/#888.

- 2026-09-17 ingest: 原卡认领更新回执的大盘误判及正式 preset 跨 Run 引用拒绝；保留 strict gate 与回退边界，Admin #889。

- 2026-09-17 ingest: ACK 表单重新序列化丢失 optional Secret，保留健康模板并验证单字段 YAML 差异。

- 2026-09-17 ingest: 模型 literal records map 只证明内部一致，服务端 canonical Run 引用预检才构成来源验证。

- 2026-09-17 ingest: 核对真实 dispatch 调用链，纠正隔离 evidence scheduler 与生产 single-Run 错误处理之间的验收边界。

- 2026-09-17 ingest: 自由画布下载事件按用户账号与版本交叉校验；记录多版本下载、任务 JSON 截断与实际入参证据边界。

- 2026-09-17 ingest: Monitoring current-Run preflight implementation pointers, MCP extension negotiation and native/legacy call-argument compatibility; retain deployment and acceptance boundaries.

- 2026-09-17 ingest: 补充监控线上技能同 Run 补证例外、完整回读，以及独立日报探针初始化与字段修正验收边界。

- 2026-09-17 ingest: Add same-Run original-workload source correction and formal/card acceptance pointers; preserve legacy-drain and callback evidence boundaries.

- 2026-09-17 ingest: Correct pending-versus-active legacy gate; add missing SLS Admin action diagnosis, exact restoration and WAF-versus-acceptance boundaries.

- 2026-09-17：补充 Sand Eval 测试发布 ALB 503 与调度排队证据，记录 PR #1312 的滚动发布、非抢占优先级及失败恢复入口。

- 2026-09-17：记录 PriorityClass 集群权限阻塞测试发布的前置检查问题，关联 PR #1316 的显式启用修复。

- 2026-09-17：记录 Sand Eval 发布后节点移除与无节点亲和性缺口，区分已证实节点生命周期和未证实 cleaner 批次归因，添加 PR #1322 指针。

- 2026-09-17：补充 Eval 常驻节点修复 Run 35232992685 的实际节点与镜像核验指针。

- 2026-09-17：记录 Monitoring MCP 普通发布撤掉只读调查凭据的证据链与核验入口；生产仅只读排查。

- 2026-09-17：记录 test→main 生产发布及 Web/QC/生成 Worker 常驻非 Spot 约束的分项验收入口。

- 2026-09-18：录入 Monitoring MCP 发布默认参数撤销 code/database 凭据、Admin 配置身份漂移的排查与防复发指针，关联 MCP PR #70/#71、Admin PR #891、Runtime 建连容错与生产取证。

- 2026-09-18：补充扩窗诊断线索触发不可满足的部署取证、同 Run 候选逻辑回放，以及 Runtime API 源站与页面链接分离的核验方法；关联 Admin PR #892。

- 2026-09-18：补充 Admin #892 生产镜像与双副本就绪回读、2494 正式回填验收，以及 acquisition 完成但 prepare 反复失败导致预算耗尽的判别方法。

- 2026-09-18：记录长 Run 报告准备的固定总读取预算、MCP 外层预算与三个不同终止条件，关联 Admin #893 / MCP #72 和生产 HTTP 复现。

- 2026-09-18：补充 Monitoring 大日志分页顺序链验收与 MCP #72 生产验收指针（monitoring-report-preflight-budget）。

- 2026-09-18：记录 Admin #893 实际部署与同草稿 preflight HTTP 503→明确校验反馈的对照证据。

- 2026-09-18：日报未发送定位为 supported proof 合法状态被读取 schema 拒绝，补充 PR #894、同窗生成与结构化 SLS 原始扫描方法。

- 2026-09-18：补充原始报警积压全部严格验收与最后一条正式回填证据，区分持久化完成和 supported 状态页面读取问题。

- 2026-09-18：补充监控日报合法 supported 枚举修复的生产部署、全量 CI、同窗读取及真实详情页验收指针；区分读取恢复与发送回执。

- 2026-09-18：补充用户确认后的日报机器人发送、内容回读及去重验收指针。

- 2026-09-18：记录 Sand Eval 日志看板代码与运行验收指针，明确不增加业务采集/请求依赖、解析率不等于采集率。

- 2026-09-19：记录Eval慢接口与事务SQL面板指针；区分端到端耗时与选择性trace。

- 2026-09-19：记录 Sand Eval 可返回代登录的契约、撤销边界和本地验收指针；明确 PR Gate 与生产状态尚待核实。

- 2026-09-19：补充 Sand Eval 代登录 review 修复验收指针：首次及再次切号撤销竞态、审计故障、真实空间查询语义与返回后的重复查询。

- 2026-09-19：更新可返回代登录指针至 PR #1401 与测试发布回执；区分测试上线和生产上线。

- 2026-09-20：录入 Sand Eval 历史整改快照冲突恢复指针；区分新命令防中断与旧半成品恢复，链接 PR #1504、operator runbook 与生产回读证据。

- 2026-09-21：记录 Sand Eval 供应商批量验收/整包送审的数据构造与粒度校验入口，执行状态保留在本地证据目录。

- 2026-09-21：补充测试数据准备期间被并行消费的回读、保留与补建边界。

- 2026-09-21：记录生产复验跨停止轮次的抽样与历史标签排查指针；保留只读证据和生产修复边界。

- 2026-09-21：补充复验抽样继承的 Sand 退回/重交接入口、有效判断规则及修复回归代码指针。

- 2026-09-21：补充复验最近有效结论展示与 PR #1569 的代码、回归入口。

- 2026-09-23：记录 Sand Eval 重新分批后正式交接仍误用未过滤批次的根因，以及统一 live batch owner 的本地修复入口。

- 2026-09-23：补充 Sand Eval 当前批次需同时核对 scope key 与 version；负责人直接分配完成批次时不以标注交接状态为门禁。

- 2026-09-23：更新 Sand Eval PR #1706 已通过 Gate 并合并到 main；生产部署仍未由该 Gate 执行。

- 2026-09-23：补充 Sand Eval 整包交接因重复串行报告读取导致凭证过期/一分钟超时的根因、PR #1711 修复及生产 14.154 秒只读回归证据。

- 2026-09-23：记录 Sand Eval 供应商与 Sand 质检批量分配延迟根因、生产只读时序、部分完成与重试边界。

- 2026-09-24：记录 Sand Eval 多负责人验收导致整包接收人无法确定的根因、紧急恢复及保持单负责人旧行为的最小修复边界。

- 2026-09-24：记录 Caption 旧模块计数、已验收范围迁移限制和祖先退回责任核验指针；生产只读，未迁移。

- 2026-09-25：核验 Sand Eval 生产迁移导致旧 SLS 看板无实时数据，记录新集群日志库和重建后的 API 看板入口。

- 2026-09-25 ingest：新增 Sand Eval runtime profiling 证据入口，记录历史/当前 CFS 区分、低频 loop lag、SET 状态复位和恢复并发计数方法。

- 2026-09-25：录入质检待处理/质检中分层判读、来源凭证过期和保留成功批次的恢复核验指针；只读证据见 quality-allocation-blocked-status。

- 2026-09-25 ingest：补充当前 API 优先级证据指针、499 unmatched 漏计、取消后继续执行、acquire/setup 重叠与恢复单批阶段诊断方法。

- 2026-09-25 ingest：补充三接口完整 trace 入口、状态筛选覆盖 include_progress、清单分页重扫整包和 SLS 索引截断的核验方法。

- 2026-09-25：记录 Sand Eval 质检分配冻结中断的只读证据入口、非原子写入及恢复分支核查方法；未执行生产修复。

- 2026-09-25：补充用户授权后的单批手动修复指针：备份与计划摘要、补齐缺失快照、父摘要最后发布、原分配续跑，以及生产数据和正式工作台查询服务的独立验收边界。

- 2026-09-25：补充 Sand Eval 四接口发布前后证据入口，记录二次配置滚动的发布边界、前台后台指标分离及同包对照口径。

- 2026-09-25：记录 Raymond 质检版本冲突的事实/窄索引/前置报告核查方法、只读恢复模拟、旧新版本差异与真实故障范围的区别，以及受控索引恢复入口。

- 2026-09-25：补充 Raymond 索引修复的用户授权、应用回执和独立验收指针，以及索引创建时间和业务继续写入时的精确身份保护口径。

- 2026-09-25：收录发布后慢接口与完整调用链证据，补充流式 HTTP 200 与分配进度写回失败的区分，以及 loop_stall 构图/最大流栈的归属方法。

- 2026-09-25：记录 Sand Eval 测试分支删除重建中的 GitHub 保护规则、目标 PR 自动关闭、main 并发前进与测试流水线验证边界。

- 2026-09-25：记录可梦派题部分写入的分层核验、原计划恢复、已有答案保护，以及恢复执行器被滚动替换后的再核对指针。

- 2026-09-25：补充整改工作台、发布和派题逐请求诊断入口，记录旧新版本样本分离、发布 202 前置范围查询及大批派题分块和最大流栈的归因边界。

- 2026-09-25：补充 Sand Eval 两次延迟尖峰证据指针，记录按实际 db.name 拆分控制/读取计算组、客户端与服务端耗时对应及内部等待归因边界。

- 2026-09-25：记录新质检备注刷新丢失的组件状态根因，以及本机草稿恢复与正式保存判断的边界；候选修复未过 PR Gate 或部署。

- 2026-09-25：记录 Sand 质检整批及逐题意见经过供应商负责人退回后未投影到空间质检新轮次的现场与代码原因；标注员链路仅有源码推断，修复未实施。

- 2026-09-25：补充 Sand 退回意见沿委派及标注退回责任链的候选修复入口，并记录上游空间质检旧“合格”标签易被误读为本轮结论；候选尚未过 PR Gate 或发布。

- 2026-09-25：复查跨关卡意见候选修复，补充标注转派后须按授权批次和稳定工作项对题、后续复验须沿父处置链追溯原意见；仍待 PR Gate 和页面验收。

- 2026-09-26：录入 Sand 分配引用过期整包报告的核查指针；区分人员计划与实际任务，记录未完成复验的恢复边界及只读事故证据。

- 2026-09-26：补充数据包管理 tab 的接口/页面映射指针；记录包级空阻断提示、计划创建时间被称为下发时间，以及同名不同批次的核查边界。

- 2026-09-26：校正过期整包分配恢复前置：直接报错的复验链不代表全部未结事项；补充真实供应商验收检查与 allocation 旧包绑定恢复缺口。

- 2026-09-26：补充派发事故恢复的范围求交原则，区分整包实现门禁与所选批次业务前置；记录同名不同批次及无关整改阻断的校正。

- 2026-09-26：更新 Sand 旧包派发故障指针；补充单批历史数组一致性与实时依赖分离、受控恢复/正文验证/零写重放证据。

- 2026-09-26：记录质检分配被实例关闭打断的诊断与恢复入口，区分 allocation 与 review-plan recovery，并补充引用式 Sand 送审的结构边界。

- 2026-09-27：记录 Sand 跳过供应商负责人和按批交接的只读分析入口；区分整改回交与首次送审，核对报告通过语义及截图任务真实时间线。

- 2026-09-27：补充用户确认的整改专用单批回交范围与包状态方案入口，区分首次交接事实、当前处理方和最终 Sand 验收。

- 2026-09-27：同步结算明细诊断与优化方案指针，包含统一权限门禁、快照复用、不可变结果、前后版本校验与后台作业边界；方案尚未实施。

- 2026-09-28 ingest：按用户要求完整同步知识库；备份双方历史与未跟踪文件，纳入四篇 Maxwell 历史正文，保留双方专题与日志，处理分叉冲突，补齐目录入口并记录同步核验方法。最终推送状态以 Git refs 为准。
- 2026-09-28：记录 Sand Eval 历史标注批次转派后整改接收人和个人任务批次分离的排查方法，含限定实例只读证据入口。

- 2026-09-28：补充结算 P0 指定提交的只读评审指针，含四个隔离复现、租约所有权发布、完成时间防连点、导出统一入口、scope 规范化及前端关联断言核验；未修改或发布业务代码。

- 2026-09-28：记录 Sand 直接整改测试环境整包混合路线实测入口及跨工作台题目顺序陷阱，保留用例副本和最终导出指针。

- 2026-09-28：补充结算 P0 本地修复与回归验证指针，覆盖原子发布、完成时间、无 ID 导出、参数规范化、全局构建名额，以及残留字节码触发题型树检查的判别方法；PR、Gate 和部署状态由修复报告及当前 Git 核验。

- 2026-09-28：补充结算 P0 主线与测试 PR 指针，以及测试基线落后、多 merge base 时区分任务差异和实际合并树的方法；交付状态查 PR 与 CI 原始证据。
- 2026-09-28：记录 Sand 默认退回后整包交接成功但测试环境自动复验未按时派回的实测陷阱，人工安排与最终验收证据见测试报告。
- 2026-09-28：补充 Sand Eval 转派后整改可进工作台、却因历史与当前批次键不一致而无法保存答案的写入门禁陷阱；区分答案版本差异和本次整改是否真正完成。
- 2026-09-28：补充 Eval QPS 增长排查指针，区分单题重扫描 CPU、后台计数基础负载、慢 INSERT 数据库等待与高频轻轮询，记录 calls 加权、日志可见性和代表性执行计划边界。
- 2026-09-28：记录 Sand 直接整改路线文案、整包交接后短暂阻断提示和退回弹窗取消后路线选择的实测及代码判读边界；短暂提示根因保留待核验。
- 2026-09-28：补充 Sand Eval 开发分支与测试分支共用 main 祖先时的污染判读方法，以及 main 前进后处理 PR 文档冲突的核验入口，实例见 PR #2144。
- 2026-09-28：记录 Sand Eval 质检员多轮整改列表与可编辑性核验，区分摘要待确认、历史轮次、正式结构操作重放和根账号观察模式只读。
- 2026-09-28：补充转派后整改列表的来源可用性判据及同任务多条历史整改的识别方法；任务分支状态需以当前 Git、Gate 和部署重新核验。
- 2026-09-28：将转派整改修复指针更新为 main PR #2134 和对应 Platform Gate；合并及运行态仍按链接重新核验。
- 2026-09-28：补充 Sand Eval 一个源任务下多标注员范围可共用批次名称，当前工作列表应只展示每范围最新正式版本的当前质检组，旧轮次保留在详情审计。
- 2026-09-28：核实质检员批次计数的后台摘要用途与 PR #1674/#1779/#1912 沿革，纠正计数字段为整批答题卡数，并区分 SQL 调用次数、独立检查任务与刷新次数。
- 2026-09-28：补充六类热点 SQL 的真实接口映射，区分质检修订/历史与冻结正文读取，以及派发进度的 HTTP 异步入口和后台自动刷新；SQL 频次不可直接当接口频次。
- 2026-09-28：补充 Sand Eval 质检退回意见的测试数据复现陷阱：须复制 Sand 原始父处置并以质检员身份回读，避免上游意见为空而被页面隐藏。
- 2026-09-28：补充 Sand Eval 逐题原意见复现依赖：原 Sand 检查任务、检查项、送审包和冻结计划须闭合，并以质检员核对逐题接口与当前 work_unit_id。
- 2026-09-28：记录 Caption Refine 页面允许跳过而服务端拒绝、待定回执不满足整批交质检门槛的生产只读实例与核验入口；修复业务口径尚待确定。
- 2026-09-28：补充 Caption Refine 放开跳过的修复边界：质检修订依赖固定作答上下文，最终主任务交付仍要求完整答案，需防止送审放行后卡点后移。
- 2026-09-28：补充 Sand Eval test 分支重建的必需 Gate 准入、已包含改动的 PR 无法恢复，以及新分支 SHA 须独立核验测试流水线。
- 2026-09-28：追溯 Caption Refine 跳过限制来自 2026-09-14 工作流特判，待定首次实现即保留分母并阻止整批送审；记录 PR #1548 与页面预期冲突，不将实现视为已确认业务规则。
- 2026-09-28：记录 Sand Eval 质检代改后整批退回使上轮未封存、新轮仍冻结原答案的生产版本冲突；核验来源 response、修订事实、检查轮次及手工退回处置，不绕过最新版本保护。
- 2026-09-28：核对 main PR #2144 已加入停止前代改的直系新轮继承与交付资格规则及回归测试；生产是否生效仍以部署 SHA 和原质检员页面回读为准。
- 2026-09-28：核对修复提交 `69e159d80` 的生产发布运行成功、`/health` 已是该 SHA，原实例数据符合新继承判据；原质检员页面操作仍未验收。
- 2026-09-28：记录 Caption Refine 待定及跳过修复的协议边界和分支指针，明确结构检查不等于业务回归通过或生产上线。

- 2026-09-28：审查 PR #2147，记录待定恢复与 Sand 单批链路整包资格的源码边界、缺失回归场景及证据等级；更新跳过待定交接页。
- 2026-09-28：更新 PR #2147 追加修复 086ed1559 与 Gate #36412820402 成功指针，记录恢复待定后的整包资格、旧凭证及单批独立性回归；未合并部署。
- 2026-09-28：记录 Sand Eval 质检不合格阈值与实际报告判定脱节的核查入口；区分抽样、逐题合格率和整包结果。见 domains/sandai-data-smith/pitfalls/sandeval-qc-reject-threshold-not-enforced.md。
- 2026-09-28：记录转派后标注整改提交复验 403 的生产路径：固定整改意图恢复时漏传整改范围校验标记，普通批次授权误拒当前持有人；见 domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md。
- 2026-09-28：补充转派后整改提交 403 的引入时间线、main 合并点，以及二次冻结沿用整改授权的本地修复和验证边界；见 domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md。
- 2026-09-28：记录转派后整改提交 403 修复的 main PR #2153、Platform Gate 成功、合并提交及合并后生产 SHA 仍旧的边界；见 domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md。
- 2026-09-29：记录 Sand Eval 五个慢接口的固定窗口证据入口；确认质检员列表 summary SQL 仍慢、发布受理同步范围查询、整改和报告提交的多次 DB 往返及质量详情默认样本展开；数据库物理原因待执行计划核验。见 domains/sandai-data-smith/refs/sandeval-review-performance.md。
- 2026-09-29：生产只读复现 Sand Eval 同批质检队列与标注整改单的视频次序不一致，补充独立排序路径及按素材核对的入口；见 domains/sandai-data-smith/pitfalls/sandeval-cross-workbench-question-order.md。
- 2026-09-29：补充 Sand Eval 五个慢接口的实际任务/样本规模、只读 Hologres 计划与 query log 用户可见性边界；见 domains/sandai-data-smith/refs/sandeval-review-performance.md 及其固定窗口报告。
- 2026-09-29：补充单人整改 8.32s 请求的完整分页 trace、11 次整任务派题清单读取与 18 次整改执行历史查找，以及 72 槽位/590 历史答案和 3 条共同处置的规模边界；见 domains/sandai-data-smith/refs/sandeval-review-performance.md。
- 2026-09-29：补充单人整改优化顺序：单命令来源范围复用与持有人窄查、执行历史有界批量、详情复用及阶段埋点；记录事后执行计划扫描扩展表和索引边界，见 domains/sandai-data-smith/refs/sandeval-review-performance.md。
- 2026-09-29：记录空间质检第 3 轮冻结答案与后续 Sand 质检修订的版本冲突；历史抽屉“最新”仅在冻结范围内，核对答题卡操作历史和修订关卡后再决定重新送审。见 domains/sandai-data-smith/pitfalls/sandeval-cross-stage-frozen-answer-superseded.md。
- 2026-09-29：补正同一实例的流转顺序：石羽宁第 2 轮先通过、负责人验收并交 Sand；Sand 质检代改后退回，石羽宁第 3 轮才被安排且仍冻结旧答案。不能以再次派单或泛称重新送审作为现成解法；见 domains/sandai-data-smith/pitfalls/sandeval-cross-stage-frozen-answer-superseded.md。
- 2026-09-29：记录 Sand Eval 整改提交执行历史批量读取的自动提交边界：写入前可合并只读历史，最终写入仍逐项复核处置、子处置、待执行轮次与 CAS；见 domains/sandai-data-smith/refs/sandeval-review-performance.md。
- 2026-09-29：记录 VidMuse 生成返回、Zeus 实扣、DSL 成片与浏览器下载的独立证据链，以及导出 99% 时间估算和停止后在途素材核验入口；见 domains/vidmuse/pitfalls/thread-output-billing-and-export-evidence.md。
- 2026-09-29：补充 Sand 退回前代改跨关卡继承的修复候选 PR #2163：按真实退回、委派和复验链承接新版，保持无关后续版本拦截；Gate、测试和生产状态须分别验证。见 domains/sandai-data-smith/pitfalls/sandeval-cross-stage-frozen-answer-superseded.md。
- 2026-09-29：将同一 Sand 修复补丁纳入整改提交性能 main PR #2164，沿用原始开发提交内容，不引入测试分支历史；组合 Gate 与部署状态另验。见 domains/sandai-data-smith/pitfalls/sandeval-cross-stage-frozen-answer-superseded.md。
- 2026-09-29：记录 Sand Eval 全局 API p95 多次尖峰的接口与 SQL 指纹分层定位，以及 transaction_trace 前缀解析和 Hologres 服务端日志权限边界；见 domains/sandai-data-smith/refs/sandeval-sql-lock-diagnosis.md。
- 2026-09-29：补充 Sand Eval 整批退回的持有人分裂 409：历史送审作者与当前持有人分离，按逐题素材核对 1+3 持有人，批次汇总不能代替逐卡转派审计；见 domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md。
- 2026-09-29：复核同一实例的操作方案：目标持有人两张均已答，派题页「未答 0」无法转移，默认转两张还会影响无关卡；记录当前运营 CLI 按实体卡排序取前 N 的精确核验与受控执行边界，未做生产写；见 domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md。
- 2026-09-29：Sand Eval 同一质检实例经生产 CLI 预览并只转李阳目标卡一张至郭士琦，主库核对四张冻结卡统一持有人、李阳非目标卡未动及审计；整批退回仍待 3093 操作。见 domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md。
- 2026-09-29：核实 3093 随后已整批退回，处置单实际接收郭士琦；弹窗「接收人：袁宁彤」取历史批次 producer_name，标签与真实接收人不一致。见 domains/sandai-data-smith/pitfalls/sandeval-transferred-correction-task-visibility.md。
- 2026-09-29：记录 AI 秋招雷达固定公开入口嵌入全栈工作台的发布边界，避免每日岗位日报发布覆盖入口页；见 global/refs/ai-job-radar-stable-entry.md。
- 2026-09-29：确认 Sisyphus `event-tracking` 的 `new_user_join` setup 401 与生产 Admin 会话 JWT 过期对应，记录 Runner 凭据映射和重试验证方法；见 domains/sisyphus/pitfalls/scheduled-admin-jwt-expiry.md。
- 2026-09-29：Sisyphus `RUN-20260929-0030` Attempt 2 在替换账号池专用服务凭据后 2/2 通过；补记生产账号池权限和空 JSON POST 会实际建号的探测陷阱。见 domains/sisyphus/pitfalls/scheduled-admin-jwt-expiry.md 与 domains/vidmuse/admin/pitfalls/service-jwt-permissions-and-expiry.md。
- 2026-09-30：核对 Sand 直接整改先交原供应商质检员、再按需退标注员；区分原路线标签、系统使用负责人身份、复验申请与实际新轮次分配；本批执行回执未确认。见 domains/sandai-data-smith/pitfalls/sandeval-return-route-and-handoff-hints.md。
- 2026-09-30：补核历史首轮质检分配与当前账号入口冲突；复验预览固定原接收人，不能把分配账号当作当前可执行资格或实际真人提交者。见 domains/sandai-data-smith/pitfalls/sandeval-return-route-and-handoff-hints.md。

- 2026-09-30｜Ingest｜新增 Sand Eval 子整改完成后再次退回的上级授权断链排查：工作台准备度、完整历史阻塞范围、pending 执行边界和只读证据指针。

- 2026-09-30｜Ingest｜补充 Sand Eval 重复退回的正式完成执行继承、单条 hash-bound 父关联修复与实际用户提交验收指针；保留负责人独立验收。
- 2026-09-30｜Ingest｜秋招雷达原地址支持匿名岗位浏览，仅主动关联飞书表格时登录；补记平台入口与请求库两层登录门槛、私人数据隔离和双身份验收指针。见 global/refs/ai-job-radar-stable-entry.md。

- 2026-09-30｜Ingest｜补充 Sand Eval 重复退回修复 PR 与 main 发布指针，区分 Gate、滚动发布及生产容器/责任链回读，记录 owning workflow 未触发时的核验与调度边界。
- 2026-09-30｜Ingest｜补记秋招雷达个人账号业务角色、应用资产所有权与租户的区别，附个人版官方能力与后台核查入口；跨租户转移及原 URL 保留仍待确认。见 global/refs/ai-job-radar-stable-entry.md。

- 2026-09-30：补充 Sand Eval 与 Sandworm Caption Flow 共享计算组的慢请求取证入口；保留实际计划、Flow Run 启停、client/server 对照、权限及 CPU 秒口径边界。

- 2026-10-05｜Ingest｜记录 Sand Eval 整改意见姓名展示覆盖缺口的只读核验入口，区分原身份事实、账号昵称、历史链路与整改清单/完整预览投影；业务代码未修改。见 domains/sandai-data-smith/pitfalls/sandeval-correction-reviewer-display-scope.md。
- 2026-10-05｜Ingest｜补充整改意见姓名修复的干净 main 分支与提交指针；区分本地文档/生成物检查、DEFER_TO_GATE、测试 PR、浏览器验收及部署。

- 2026-10-05｜Ingest｜记录 Sand Eval 整改重提的批次范围变化、整包完整性阻断与旧首次交接状态误导的生产只读核验入口；保留源代码、后台重试和成员差集证据指针。见 domains/sandai-data-smith/pitfalls/sandeval-remediation-scope-change-stale-handoff.md。

- 2026-10-05: 补充 Sand Eval 整改分区接续的实现与回归入口；记录精确答案校验、相邻分区和独立 Sand 批次边界，验证/发布状态以 Git 与 CI 为准。

- 2026-10-05｜Ingest｜补充 Sand Eval 整改署名 review 的状态分支和刷新 DTO 核验方法；具体现象及未完成 CI 的边界见 review 记录。见 domains/sandai-data-smith/pitfalls/sandeval-correction-reviewer-display-scope.md。

- 2026-10-05｜Ingest｜补充 Sand Eval 整改接续 review：已有正式批次不能证明恢复暂缓后的完整应交范围；回归须覆盖先改变来源投影再提交整改的真实时序。见 domains/sandai-data-smith/pitfalls/sandeval-remediation-scope-change-stale-handoff.md。

- 2026-10-05｜Ingest｜记录整改交接与署名 review 补修指针、先变化来源的回归入口及整台刷新草稿确认边界；静态检查不代替 CI/浏览器验收。见 sandeval-remediation-scope-change-stale-handoff 与 sandeval-correction-reviewer-display-scope。

- 2026-10-05：补充 Sand Eval 第二轮只读 review 指针：整改换作者后的正式质检代改与冻结接续冲突，以及全工作台刷新丢失当前题；记录条件、调用链和未运行验证边界。

- 2026-10-07：补充 Sand Eval 四接口重复读取取证指针，保存部署源、完整请求trace、Hologres扫描和分片计划的验证方法；尚未优化或部署。

- 2026-10-07：补充 Sand Eval 换作者整改后正式质检代改的连续证据边界、来源回执到质量账本的中断恢复，以及完整工作台刷新保留题目与跨单隔离；关联业务提交 9b94a882d 和第二轮 review 修复记录，明确 CI/浏览器验收尚未完成。

- 2026-10-07：补入整改交接与署名修复的测试 PR #2241 和 rebase 核验入口；范围仅含四条任务提交，测试分支仅为目标，CI/合并/部署状态以链接回读为准。

- 2026-10-07：补充 Sand Eval 四接口无数据库变更方案及交叉审查指针，明确本人列表、阶段授权、幂等恢复与应用回退边界；本轮仅完成方案，未改业务代码或数据库。

- 2026-10-07：补入 PR #2241 首轮 CI 暴露的质量/来源代改引用差异与公开读取自递归调用契约；保存精确恢复边界、假源一致性和具名回归指针。

- 2026-10-07：补入四接口性能修复的独立工作区与本地分项提交指针；记录完整整改历史校验必须保留，targeted-direct转交Gate及结构检查基线缺口，未推送业务分支或部署。

- 2026-10-07：补入四接口性能修复正式审查和 main PR #2245 指针；PR 状态、Gate、性能验收及部署分别回读，未将创建 PR 视为交付验证。

- 2026-10-07：为整改交接与署名修复补充 main PR #2246 指针；记录干净开发分支更新、前序测试部署证据及 main Gate/浏览器/生产验收边界。

- 2026-10-07：核验整改重提交接修复上线后的生产事实，补入“新包生成不等于已交接 Sand”的判定方法及只读证据指针；正式提交与原检查员后继轮次分别验收。
- 2026-10-08 ingest: Sand 质检待验收与自验身份；记录不同关卡人员、当前复核资格、自验限制和只读核验方法，附生产证据指针。
- 2026-10-08 clarify: Sand 负责人是复核流程称呼，无独立可指派角色；根空间 sand_staff 派生身份与 sand_review 关卡分别核对。
- 2026-10-08 ingest: 补入 Sand 质检/复核真实身份只读授权复现方法、先资格后自验的拒绝顺序、外部委派边界及冻结人工复核配置来源。

- 2026-10-08：补充 Sand 质检人工验收的实时动作预检、历史冻结规则与现有自动复核入口指针；区分可执行预检、实际验收及尚未实施的代码方案。

- 2026-10-08：定位冯杰视频11.44秒停止为AAC音频坏包；独立浏览器复现、仅音轨修复完整播放、403帧画面哈希一致，保存只读生产与验证证据指针，未替换生产素材。

- 2026-10-08 ingest: 补入质检复验页上游 Sand 意见署名的独立覆盖边界、原 Sand 作者与当前复验人/标注员的身份区分、只读生产及部署源码取证指针；未修改或部署业务代码。

- 2026-10-08 ingest: 记录复验页原 Sand 意见署名修复提交、仲裁原作者与页面刷新边界；保存 CI 待验证及基线结构检查限制的证据指针。

- 2026-10-09 ingest: 保存复验原意见署名 review 与测试 PR #2266 指针，补充重放提交造成的测试基线冲突及分支 CI 与 PR 合并树的验证边界。

- 2026-10-09 ingest: 按用户直接 main PR 要求补 PR #2267 与 CI 修复指针，区分准确合并树验证、分支手动 Gate 和存量工具自检失败。

- 2026-10-09：Ingest Sand 直接整改后负责人再次退回的身份、轮次与可操作性边界；保存孔一凡/姜子涵只读证据指针，未实施生产恢复。

- 2026-10-09 ingest: 补充 Sand 直接整改被负责人再次退回后的配置快照版本门禁根因、线上代码只读复现与分派后入口限制建议；业务代码及生产数据未修改。

- 2026-10-09 ingest: 用户授权修复 Sand 直接整改负责人重复退回和手动重检旧配置；保存独立 main 基线任务分支、后端共用校验、真实持久化门禁回归和分支 CI 指针，生产未操作。

- 2026-10-09 ingest: 补充 Sand 直接整改修复 review 的存量恢复责任桥接缺口与完整闭环验收边界，保存隔离复现及配置推进对照指针；业务代码和生产未操作。

- 2026-10-09 ingest: 用户授权修复 Sand 存量直接整改责任桥接，补充正式祖先授权、系统验收意图/流水恢复、两端冻结策略绑定及完整 Sand 闭环回归指针；发布与生产恢复以修复记录独立核验。

- 2026-10-09 ingest: 结合 Agent 自迭代工程实践 PDF 审查 EVOLVE，保存当前源码锚点、七项设计问题及本地方法层反例指针；未修改业务实现或部署。

- 2026-10-09：新增 EVOLVE 交互与 Nextplay 原生评测接入方案指针，记录源码/线上只读证据入口、限制分层与实施验收边界。

- 2026-10-09：按用户评审纠正 EVOLVE 方案定位，从零生成 Case 与已有 Case 接入同等重要，撤回以 Nextplay 导入作为平台主流程的设计；同步原方案及索引指针。

- 2026-10-09：补充 EVOLVE 业务资产与 Work 解耦、历史版本差异、指标 CRUD、Benchmark 新建及持续扩充设计指针；仅方案，未实施数据或接口迁移。

- 2026-10-09 ingest: 记录人类授权误下发素材恢复的边界与证据入口，区分终结与有效下发历史；通过正式软删除保留历史，并独立核对可选范围、正常批次及页面。

- 2026-10-09：EVOLVE 多套 Benchmark（效果/性能/成本）、Maxwell 风格交互原型与 12 个 Figma/SVG 交付画板；补充开工缺口及模拟/真实实施边界，指针见 evolve-nextplay-entry-plan-20261009。

- 2026-10-09：录入 Sand Eval 复验报告部分提交后的验收阻断；记录只读取证、409与autocommit证据边界、整改接续和列表/命令资格差异及正规恢复范围。

- 2026-10-09：补充 EVOLVE 用户路径评审纠正：通用方法派生业务指标，已有 Case/Judge 接入、人工复核与重评边界，标明 V5 原型缺口与完整交互规范指针。

- 2026-10-09：记录 EVOLVE 界面文案纠正：移除教学编号、口语问句与设计讲解，使用功能名称和明确操作。

- 2026-10-09：补充 EVOLVE 原型动线与视觉审查指针，记录重复运行配置、返回上下文和复核缺口的截图证据，区分官方产品参考与本地实测；未修改原型实现。

- 2026-10-09：记录 AI 产品设计技能选型入口与整体动线交付约束；仅核验技能文档，未安装或开展产品效果验收。

- 2026-10-09：补充 Sand Eval 复验部分提交修复与追加审查指针，记录报告补登记和责任关闭的不同判据、只读请求事实复用、单批恢复/独立回读及测试集成与发布边界。

- 2026-10-09：记录 EVOLVE 原型复用 Maxwell 真实组件、稳定 Benchmark 页头和运行配置入口的要求及 V6 验证指针；正式平台与完整评分复核链路未实施。

- 2026-10-09：完成三个设计技能的 Codex 用户级安装，保留已有 Frontend Design；记录 ZIP launcher 执行权限检查与搜索/引擎启动验收入口。

- 2026-10-09：记录 EVOLVE V7 完整原型、三类使用者及多人 Skill 调优/人工复核要求；纠正原生 Select 与 EvolveSelect 混用，保存独立 critique、harden 和真实浏览器验收指针，区分本机模拟与正式接入。

- 2026-10-09：补充 EVOLVE 从零对话协作、候选修订与固定基线、谱系显式来源、有效评分题目集合的趋势可比规则；保存完整体验与增量验收指针，保持前端模拟边界。
- 2026-10-09：记录 EVOLVE 布局与动效审查、趋势/谱系返回上下文问题和用户喜欢的 VidMuse 波纹背景；保存未实施的设计方案及证据指针，区分功能通过与持续操作顺畅。

- 2026-10-09：更新 EVOLVE 完整产品组织与交互验收指针；保留 Benchmark 核心，区分被测对象/调优 Agent/执行适配器，记录 HTTP 与 A2A 能力边界、动效和历史/候选归属修复。

- 2026-10-10：记录 EVOLVE 负责人/调优全链路复审，保留通用平台边界；补充联合评分关联、导入与候选基线接续、候选版本隔离及真实后端差距的证据指针。

- 2026-10-10：记录 EVOLVE 原型确认后的正式实施入口；补充 YAML 序列化适配、旧接口共用命令、Work membership 触发器和业务级分页/导入性能边界，明确具体接口迁移仍待确认。

- 2026-10-10：记录 EVOLVE 修订方案实施批准和仅 EVOLVE 域约束；补充目录 Agent 会话权限、按需定义/证据读取及来源依据持久化一致性检查指针。迁移仅文件，真实数据库和 Agent 验收仍独立。

- 2026-10-10：补充 EVOLVE 用例维护、四格式导入与异步编辑验收指针；记录 render prop 响应式、重复 Escape、文件读取锁及模拟/真实验收边界。

- 2026-10-10：补充 EVOLVE 共享标准与 Benchmark 原子修订指针；记录名称去重限制、Run/判卷来源 Work 断点和批量 SQL JSON 字段一致性，区分新增契约待确认与已批准实现。

- 2026-10-10：补充 EVOLVE 共享标准事务采用、判卷/反馈/候选验证技术证据入口；记录正文有界批次、Trial 关联授权和谱系遍历缓存范围，保留数据库及自然 Agent 验收边界。
- 2026-10-10 ingest：EVOLVE 候选验证上下文、成对比较限流与共享标准第 8/6.1 节授权；补充元数据仓储和迁移未执行的核验指针。

- 2026-10-10：新增 Sand Eval 换空间与个人派题核验入口，记录同名账号、生产配置核验及受控批次改派指针；仅只读调查，登录原因待报错核验。

- 2026-10-10：补充 EVOLVE 共享标准采用/修订对比、最小前置条件、Benchmark 精确版本及维护工具证据指针；数据库迁移和真实性能仍未执行。

- 2026-10-10：补充 EVOLVE Benchmark 建议性能力检查、有界启动准备、重试身份及返回上下文指针；明确 Work 依赖尚未解耦，未执行数据库操作。

- 2026-10-10：ingest Sand Eval 16:00–17:02 API 卡顿取证指针；记录 init_warehouse 服务端耗时、同 digest 前后对照、lock_trx 与触发负载未明的边界。

- 2026-10-10：补充已授权的跨业务数据库取证，定位 Caption FPS 动作召回新增负载与既有 videoonly 压力叠加；保留未做停启对照、账号可见性及过滤条件脱敏边界。

- 2026-10-10：补充 EVOLVE 直接评测与人工复核实现指针，记录幂等深拷贝、并发复核、列表采用值与迁移文件权限边界。

- 2026-10-10：补充 EVOLVE 原证据重评、ModelSelect 默认回调、独立候选验证及分页返回的 Why/How 与实施验收指针；迁移未执行，整体目标仍进行中。
- 2026-10-10：补充 Sand Eval 待提交包的视角排查指针，区分 Sand 观察页提示、供应商提交资格及真实提交结果；反馈目标包仍待确认，未执行生产写入。
- 2026-10-10：用户确认纸面 08 包后，以实际负责人权限及双 Pod 只读证据定位唯一历史标注退回未闭环；记录祖先授权与关闭依据边界，未修改生产或代为提交。
- 2026-10-10：补充纸面 08 包历史标注退回的受控恢复工具、固定计划/审计/独立回读指针，区分处置关闭与验收后整包汇总、实际提交资格及代码发布。

- 2026-10-10：补充 EVOLVE 原单位指标、逐题绑定、跨上下文冻结证据校验、汇总计算开销及组成资产返回路径指针；保留模拟/真实验收与迁移文件边界。

- 2026-10-10：补充 EVOLVE 结果投影与人工复核并发的 Why/How、分页一致性及正式组件验收指针；仅迁移文件，数据库与 Benchmark 趋势边界明确。

- 2026-10-10 ingest: EVOLVE Benchmark 结果关联/分页与原生评分协议、目录显示名和服务到标准闭环；保存技术验收指针，不宣称数据库或业务等价完成。

- 2026-10-10 ingest：补充 EVOLVE 7.18–7.20 的判定口径、子集重评、统一下拉与历史版本选择 Why/How 和代码验收指针；不宣称数据库或自然 Agent 验收。

- 2026-10-10 ingest：补充 EVOLVE 7.21–7.23 的基线承接、可信会话、原生 Judge 谱系、独立资产保存及查询/审阅恢复的 Why/How；只存代码验收指针，迁移未执行。

- 2026-10-10 ingest：补充 EVOLVE 7.24 的定义/结果历史区分、精确组合恢复、并发修改接续与分页性能 Why/How；仅代码及模拟验收指针。

- 2026-10-11 ingest：补充 EVOLVE 7.25 共享用例诊断、有界正文读取、原生指标身份、真实报告分派与逐题返回的 Why/How；保存代码/技术验收指针，不宣称整个目标或跨 Work 候选闭环完成。

- 2026-10-11 ingest：补充 EVOLVE 7.26 固定来源运行、晚完成证据关联、候选样本批读及原生正例的 Why/How；保存技术验收指针，不把旧搜索或真实数据库验收包含其中。

- 2026-10-11 ingest：补充 EVOLVE 7.27–7.28 方法适用范围与任务用例引用的 Why/How、正式组件模拟走查及数据库只读验证边界。

- 2026-10-11：补录 EVOLVE 候选同页结果对照与来源索引方法及验收指针；数据库集成/计划仍未执行，不涉及业务仓库提交。

- 2026-10-11：补充 EVOLVE 直接评测与旧待办兼容的 Why/How、分页前过滤、精确 Run 返回及技术验收指针；未执行数据库操作。

- 2026-10-12：补充 Sand Eval 质量中心“1/1 已保存但报告未提交”的证据核验与本人提交边界；记录鸿鑫 10 题包报告指针及 Nginx/SLS 日志格式检查。

- 2026-10-12：补充历史标注退回修复 main PR #2364 的交付指针，区分单包恢复、分支 Gate、main PR 验证及正式发布。

- 2026-10-12：补充 EVOLVE 当前分支审查的 Why/How 与代码证据指针，覆盖共享标准复用、旧 Benchmark 提示、迁移事务、错误映射和维护类型兼容；未执行数据库迁移。

- 2026-10-12：记录 EVOLVE 单提交 main PR #336 的交付指针与回读方法；数据库迁移只提交文件，未执行。

- 2026-10-12 ingest: EVOLVE PR #336 CI 排障指针，补充根目录守卫/迁移部署清单与 amd64 浮点容差，保留数据库仅文件和实时 PR 证据边界。

- 2026-10-12 ingest: EVOLVE PR #336 合并后 dev 发布预检指针；保留数据库仅文件授权边界，等待缺失迁移的明确执行授权，未切换部署。

- 2026-10-12 ingest: 用户授权 dev 0014–0031 迁移，记录 EVOLVE/Studio 发布 run 与独立只读回验；保留部署成功与真实业务评测边界。

- 2026-10-12 ingest: Nextplay 独立 Benchmark 接入方案指针；区分通用格式与业务适配、原 Judge 与简化 rubric、历史成绩与平台执行，保留只读核对边界。

- 2026-10-12 ingest: Nextplay 已有 Eval Service 的扩展位置与 dev 数据库确认边界；记录离线导出实际契约校验指针，保留评分校准、真实导入和部署未完成边界。

- 2026-10-12 ingest: EVOLVE 对象谱系截图与源码审查指针；记录稀疏布局、可比趋势和明确来源的约束，保留产品修改与真实验证边界。

- 2026-10-12 ingest: 补充 EVOLVE 完整趋势与调优路径阅读目标，记录当前分散入口和分页范围核验指针；未实施界面修改。

- 2026-10-12 ingest: 补充 Sand Eval 白马样本跨轮次题号变化取证；区分供应商历史编号与 Sand 逐题意见，记录检查项 ID 排序根因、稳定原题顺序与逐轮映射验收指针；业务保持只读。

- 2026-10-12 ingest: EVOLVE 完整趋势与调优谱系本地实施及真实页面验收指针；记录旧统计与新结果投影兼容、精确返回定位和可区分范围，保留技术大历史测试与线上发布边界。

- 2026-10-12 ingest: 更新 Nextplay 独立 Benchmark 接入入口，补充部署/资产证据指针、PostgreSQL 时间精度导入冲突和 A2A 基准绑定边界。

- 2026-10-12：Nextplay 接入入口追加 MCP 实际登记 schema 同步及 hidden 资产隔离验收指针，真实执行状态仍查实施记录。

- 2026-10-12 Ingest：转派后普通标注产生新版与原质检冻结版冲突；补充逐卡审计、正式回执和新版已另行送审时的新旧任务核对方法。来源：output/deng-qc-version-20261012/report.md；生产仅只读。

- 2026-10-12：补充 EVOLVE 对象演进/单任务谱系关联、多指标时间轴与条件化对比的 Why/How 和真实页面验收指针；纠正任务列表替代整体谱系。

- 2026-10-12：补充 A2A 消息 JSON 与可读请求文件的能力边界；单题 execution_error 和待确认契约仅存证据指针。

- 2026-10-12：补充转派后冻结质检冲突的源码证据和修复方案指针；建议稳定工作项冻结门禁及跨批次有效送审链，未改业务代码或生产数据。

- 2026-10-12：补充 EVOLVE 谱系连续交互复查、画布边界、可读方案正文、明确编号含义及跨视图筛选一致性的 Why/How；保存审查与真实页面证据指针。

- 2026-10-12：补充 Nextplay 独立 Benchmark 完整 review 指针；记录跨 Run 评分身份、取消恢复与共享队列调度的 Why/How，区分 CI 和真实评分验收。

- 2026-10-12：补充单样本通过率、原始分项/冻结标准、通用指标单位/方向/类别与全指标图优先下钻的 Why/How，保留真实页面及技术验证边界。

- 2026-10-12：记录可梦两题 Sand 第 3 轮代改受阻的只读根因与源码证据：顶层汇总换版和停止 Sand 修订未进入可见基线；未修改生产状态。

- 2026-10-12：记录无空间账号仍持有 V3 未作答卡的普通改派拒绝、题池义务与身份 guard 释放边界；保存受控回收 CLI、CI 与生产执行状态指针。

- 2026-10-12：补充 Nextplay 独立 Benchmark 的输入边界与原字节保真、Checkbox 样式与按需内容预览、并行发布排空保护及真实评分未完成证据指针。

- 2026-10-12：补充转派后冻结约束修复的测试 PR、真实第 5 批次入口和验收边界指针；尚未发布，未修改生产状态。

- 2026-10-12：补充 Nextplay 独立 Benchmark 统一 PR 342、响应正文中断与报告超限区分、幂等重试兼容性及审查证据指针。

- 2026-10-12：补充未作答卡回收的生产网络与客户端组合核验方法；保存明确凭据授权、运营执行及独立核验指针，动态业务结果留在本地报告。

- 2026-10-12：补充 Sand 连续退回继承修复的代码、测试 PR 和真实生产数据只读验证指针；未合并或部署，未修改生产数据。

- 2026-10-12：补充 Sand Eval 原批次题号冻结、历史轮次映射、正式 TEST 全链路验收与 main PR 2386 指针，记录转交老答案兼容及 Hologres 重名列导致 SQLite 漏测的坑。

- 2026-10-12：补充 EVOLVE 原报告封装/JSON 转义导致读写预算不一致的 Why/How、真实 CAS 边界回归及 PR 342 修复合并核验指针。

- 2026-10-12：记录 Sand Eval 题序验收中只读质检页误显示未保存并拦截离页的附带观察，保留源码与实测证据指针，不与服务端提交结果混淆。

- 2026-10-12：补充 Nextplay A2A 400 的 API/Worker 输入组件装配差异、生产构造入口回归和 PR 344/真实复验指针。

- 2026-10-12：补充跨工作台题序修复的性能核验入口：全量题序分页、首次冻结及旧数据分块重复批次投影、按锁定驱动验证参数上限；记录输入规模核验不能替代真实数据库延迟证据。

- 2026-10-12：记录 Maxwell dev 发布范围纠正：最新 main 表示版本来源，服务按改动影响选择；保留已发生发布及取消的证据指针。

- 2026-10-12：补充 Nextplay 单题真实运行中的 Preset 工具引用兼容性排查入口，区分 A2A 派发成功与目标执行/评分成功。

- 2026-10-12：补充题序与连续 Sand 修订继承组合发布、五题两轮退回及第三轮候选/闭环验证入口；更新实际 TEST push 自动部署、合并身份与最终精确头 Gate 的核验方法。

- 2026-10-12：记录题序发布后原题号被误当质检题量的排查：固定样本、源批次、已判断数与工作台类型独立核验；建议原标注题号与样本进度分开显示。

## [2026-10-12] ingest | Nextplay 全流程复查指针：middleware 能力、证据保存与清理、结果读取重试、10 MiB 边界和方法入口；遵从暂不提交指令，保留本地修改。

- 2026-10-12：记录已发布题序重排与相邻项保存推进的衔接缺口；区分全新批次顺做、旧批次混排及本轮/历史判断，保留待实施修复方向与验证范围。

- 2026-10-12：记录直接评测与 Agent 调优职责纠正及源码核对指针；方案待确认，不移除调优能力，暂不提交。

- 2026-10-12：按用户纠正撤回重复 A2A 执行队列/任务表方案，记录复用 Nextplay /evaluations、原始证据清理前保存及排除飞书展示投影的边界；业务代码仍不提交。

- 2026-10-12：记录执行与评分分离的源码指针、原始 ExecutionResult 的离线一致性证据及收敛协议/字段待确认边界；未执行真实模型、业务提交或部署。

## [2026-10-12] ingest | Sand Eval 改派、换人与复验问题复盘及重构审查：稳定卡/版本/责任分离、正式退回闭环、历史语义、旧批次和中断恢复验收；交付状态留 PR 指针，重构仅为建议。

- 2026-10-12：补充Nextplay/EVOLVE稳定Case及指标关联、最新内容运行与历史快照边界，记录已批准HTTP批次代码实施和中断恢复测试的查询指针。

## [2026-10-12] ingest | Sand Eval 用户实体图审查：ANSWER_CARD 稳定身份、人员关系历史/当前语义、检查批次 0..1 与多轮记录、退回闭环和可恢复命令；原图原样留证，结论限截图可见范围。

- 2026-10-12：补充 Maxwell 失败原件保存与详情读取、证据保留策略、等待输入取消遗漏及批次取消待核对指针；技术回归与真实取分边界分开。

- 2026-10-12：补充Nextplay清理失败不删租约、独立结果迁移入口和指标名称来源的Why/How及本地回归指针；未执行迁移或更新线上资产。

- 2026-10-12：记录结果提交回执丢失不可判定为执行失败的原因、同Attempt恢复和有界原件重写指针，明确本地故障注入与真实数据库验证边界。

- 2026-10-13：录入 Sand Eval 工作台身份解析 404 的分层取证方法及澳鹏 9.30 声音任务证据指针；区分当前可见、历史失败与原始原因未知，未执行业务数据修复。

- 2026-10-13：补充 Sand Eval 单题正式保存与答案回显分层取证：重复版本、点击前旧值、客户端时钟、准确题号及 leader/follower 读取对照；历史响应正文缺失时保留根因未知，未执行业务数据或代码修复。

- 2026-10-13：补充 Sand Eval 新质检轮次入口404的同实例普通读取/leader对照、本人详情和列表及自然收敛复核；候选替身需保留同次原路基线，现时恢复不代表永久修复，未修改生产。

- 2026-10-13：录入 EVOLVE 逐页 Case 编辑布局与本地交互验收指针、Provider 规则下钻保真、按钮内层居中导致的排版问题，以及趋势/谱系入口方向和 Benchmark 内容读取缺口；业务代码未提交、未部署。

2026-10-13 | ingest | sandeval-workbench-context-404-evidence | 追加质检代改后精确答案普通读取/leader 不一致的取证方法、完整草稿对照和前端判断阻塞；现场结论存报告指针，未写生产数据。

- 2026-10-13：补充张靖茹新质检入口404的应用代码成因与精确责任人/授权主节点读取修复清单；生产部署漂移核对与基础设施触发原因未知边界存只读报告。

- 2026-10-13：补充 EVOLVE 指标目录布局与实际父容器验收指针，记录固定容器宽度、inline-size containment 与段落样式覆盖的排查方法；业务代码仅本地修改。

- 2026-10-13：记录质检入口普通读取回归的固定提交8406e9499、main PR #2299与生产发布任务考古指针；区分代码引入、合并、发布和历史计算组隔离时间。

- 2026-10-13：追加纸面质检代改后七次404、全四副本覆盖和现时读取恢复的只读案例指针；核对发布结束与失败时间，保留未保存输入和永久修复证据边界。

- 2026-10-13：补充 Nextplay 真实取分准备度与 EVOLVE 整站布局规划指针，区分本地回归、表单接入、环境启用及真实评分；记录用户确认导航和内联指标生效边界，业务代码未提交、未迁移、未部署。

- 2026-10-13：复核 EVOLVE 当前模式的设计缺口，记录新工作台跨任务基线/独立验证与旧搜索、原生指标与旧总分决策的接线入口，以及统一采纳/独立验收/校准/预算边界；既有方法测试通过，未运行真实 Agent 或部署。

- 2026-10-13：补证纸面新答案普通读取0行、空数组字段查询大结果，以及王美华多次保存后的明确旧版本绑定；记录request/trace/query实参与calls关联方法、回执版本衔接修复边界及新部署只改owner的核对指针，未写生产。

- 2026-10-13：录入 Sand Eval 主任务发布 Follower 误报不存在的核验方法，关联脱敏运行证据、历史镜像代码和跨 Pod 只读复现；副本滞后底层原因未确认，未执行生产写入。

- 2026-10-13：补充主任务发布 Follower 问题的 Git 考古：PR #1173 的创建人检查、PR #1160 的事务外备题读取、PR #1892 的外层校验回归；明确合入 main、生产部署与副本积压触发时间的边界。

- 2026-10-13 ingest: 新增 Hologres 副本同步延迟取证入口，记录实例级最大值、全计算组资源对照及触发候选与因果验证边界；详见 domains/sandai-data-smith/refs/hologres-replica-sync-lag-20261013.md。

- 2026-10-13：补证副本延迟的四日曲线与最近 41 个关闭 PR/26 个 main 合并，核对 #2383/#2386/#2391 的实际发布及转交耗时；确认持续复制延迟放大旧缺口，未将时间兼容候选当作已证明根因。
- 2026-10-13: 恢复补记 Sand Eval 来源答案权威读与回执版本修复设计；追加新退回入口 false 404 和单题保存、批次交接、本人首页文案分歧的只读取证指针，以及 disposition_owner 主节点修复 main PR #2406 的交付入口。

- 2026-10-13：结合同日 Hologres 底层报告，独立复核 sand_worm/sand_data_hub/sand_vibable 小 Follower 满载指标，补充 samples 批量更新的更强触发候选与 PR 来源、具体 Shard 和停启因果仍未确认的边界。

- 2026-10-13 ingest：补充 Sand Eval 失败副本仍占素材、正式终止授权、零执行任务预检及主任务/个人派题分层核验指针；证据见图虫精筛试标下发报告。

- 2026-10-13：补充 Nextplay dev 发布/真实取分验收指针与 Agent 指标目录读取缺口；区分稳定资产、运行快照和自然生成验收。

- 2026-10-13 ingest：补充图虫精筛三包下发中批次开放开关、人数锁定及质量系统规则独立回读的 Why/How 与验收指针。

- 2026-10-13：补充第 6 批次固定答案上下文失败取证与复用原分配恢复边界，新增 [分配冻结 execution](domains/sandai-data-smith/pitfalls/sandeval-allocation-frozen-execution-context.md)。

2026-10-13 — Ingest Sand Eval 整批恢复未派题的精确范围、完整答案归档、写入锁与独立读取核验指针；本次动态事实留在本地操作报告。

- 2026-10-13：补充自动复验的管理员确认流程评估及当前生产证据指针；区分截图历史状态、同包其他批次自动成功和目标批次实际接续，未修改产品流程。

- 2026-10-13 ingest：补充 Nextplay 大证据传输设计指针；记录内联往返、流式全链路、不可变归档及窗口重复全件校验边界，方案尚未实施。

- 2026-10-13：录入关小琪实例整改回交旧答案与新轮代改保护的 Why/How；区分转派、停止轮次修订和回交取版滞后，当前读取一致不代替历史延迟证明。

- 2026-10-13 ingest：补充长批次评分启动时机与 WallTime 语义核验指针，不将尚无判定直接归为评分服务失败。

- 2026-10-13：补充关小琪指定批次的正式后继复验恢复 Why/How 与执行证据；旧冻结成员和判断保留，来源答案不改，系统性取版修复尚未发布。

2026-10-13 | ingest | EVOLVE 用户设计约束：用例评分核心地位、去泛化提示、页面连续性与清晰关系；记录未批准原型的来源和边界。
- 2026-10-13 ingest：已验收批次退回质检后缺少后继重检，记录指定批次原生恢复、历史保全、完整退回权限与独立回读边界。

- 2026-10-13 ingest：补充 EVOLVE 先画对象关系与完整操作流程的用户要求，保存重评/重新执行、基准版本及实际应用边界的核对指针。

- 2026-10-13：录入 EVOLVE/Nextplay 原件与评分报告恢复指针，补充共享 Case 权限、JSON 键序、迁移接线及 PR/部署分开授权；实时状态留在本轮收尾记录。

- 2026-10-13：补充 EVOLVE/Nextplay 长事件原件、冻结资源与快照持久性、评分报告归档期登记保护、Case 分层容量及本地 1 GiB 技术证明的核对指针；不将本地测试记录为 dev 业务通过。

- 2026-10-13：补充 EVOLVE/Nextplay 干净 main 整合与 Judge 构建前提，记录评测覆盖展示、接入向导失败不可伪装空列表的核对指针；不把本地组件验证作为真实业务闭环。

- 2026-10-14：补充 EVOLVE 批次封装与接纳回执恢复、任务谱系只读结果和跨任务固定基线的 Why/How 及验证入口；仅本地实现，部署仍须确认。见 [原件与评分报告恢复](domains/maxwell/refs/evolve-original-evidence-and-report-recovery.md)。

- 2026-10-14：补充 Benchmark 全历史与指标分页一致性、原单位与覆盖展示的核对入口；Case/规则受权投影仍按契约确认推进，不把局部 UI 验证作为完整业务验收。见 [原件与评分报告恢复](domains/maxwell/refs/evolve-original-evidence-and-report-recovery.md)。

- 2026-10-14：记录 EVOLVE/Nextplay 新建与编辑 Case 的冻结附件评分、原题库回退缺陷及 Judge 缓存身份核对指针；本地技术回归与真实 65 题/调优闭环继续分开，部署须单独确认。

- 2026-10-14：补充 EVOLVE/Nextplay 逐题原件与原评分归因、历史发布覆盖修复的核验方法及缺分原说明展示指针；执行重跑与已有原件重评分开，技术测试不代替真实取分。见 [原件与评分报告恢复](domains/maxwell/refs/evolve-original-evidence-and-report-recovery.md)。

- 2026-10-14：补充历史评测进入 HTTP 资源调优时的冻结来源、父候选完整替换、拒绝当前配置回退及本地验证边界，见 `domains/maxwell/refs/evolve-original-evidence-and-report-recovery.md`。

- 2026-10-14：补充多 Provider 输入身份与摘要顺序、65 题新身份确定性评分覆盖，以及合法维度换序引发规则错位的核验和契约确认指针，见 `domains/maxwell/refs/evolve-original-evidence-and-report-recovery.md`。

- 2026-10-14：补充 EVOLVE Case/指标阅读布局、Schema 值保真、目录失败重试与本地验收边界指针。

- 2026-10-14：ingest EVOLVE Provider 规则稳定身份定位与陈旧编辑保护，更新原件/评分链路引用页及索引；实时实现和验证结果保留为审查台账指针。

- 2026-10-14：补充 EVOLVE Case 原请求指纹、目录漂移后的保存重放、当前/历史隐藏权限、并发首次结果与 JSONB 验证边界；指向链路台账，不固化发布状态。

- 2026-10-14：补充 Benchmark 关联内容的受权只读投影、未显示共享规则的游标失效、来源歧义、大配置完整分页与编辑返回上下文；实现及验收边界指向链路台账。

- 2026-10-14：补充 EVOLVE 共享指标引用范围的当前头、原 Benchmark Judge、逐题覆盖、有界分页和草稿保留边界；实现与验证仅留台账指针，部署仍须另行确认。

- 2026-10-14：补充 EVOLVE 集成测试资产归属、UTF-8 / ANALYZE 前提与 Nextplay 测试环境指针；本地技术验证不替代真实评分、完整审查或部署授权。

- 2026-10-14：补充 EVOLVE 目录连接与被测对象的独立筛选、读取失败语义及页面证据边界；实现状态与截图引用本地验收记录，不等同于真实评分。

- 2026-10-14：补充 Nextplay 执行与评分队列并发锁及失效租约续租的真实数据库验证指针；本地输入 / 原件持久化不替代真实评分、生产兼容或部署授权。

- 2026-10-14：补充 EVOLVE 调优基线与候选复测的信息层级、历史身份和重试验证指针；保留模拟提交与实际应用 / 评分的证据边界。

- 2026-10-14：补充执行 Worker 控制失效、在途接纳与收尾二次异常的恢复指针；保留租约门禁及停止 / 完成证明的区别。

- 2026-10-14：补充直接评测入口的信息层级与失败替换保护；明确保留旧选择后才提交，本地模拟与真实评分分开记录。

- 2026-10-14：补充 EVOLVE 接入登记与检查恢复、Agent 预填声明及隐藏字段边界；实现和浏览器验证仅保留证据指针。

- 2026-10-14 | ingest | 补 Nextplay 临时资源部分删除、响应丢失后的重试和进程中断边界；保存本地技术验证与真实取分/跨 Pod 恢复的区分及复核指针。

- 2026-10-14 | ingest | 补原件采集失败后的租约保留、精确可选目录缺失 / 分页完整性判断与两类执行入口验证；记录大候选资源仍缺受权引用链路。

- 2026-10-14 ingest：补充 Nextplay 评分提交断连、终态重放、完成时间和持久恢复的证据边界；实现与本地 MySQL 回归留指针。

- 2026-10-14 ingest：记录 EVOLVE HTTP 资源提案的冻结版本读取、Provider 类别、父候选继承与连续合同验证入口；区分大候选编辑和真实模型验收。

- 2026-10-14 ingest：记录 EVOLVE 大候选文件引用 / 编辑 / 阅读入口及候选应用证据边界；源码、测试与未完成验收仅留指针。

- 2026-10-14 ingest：补充 EVOLVE 回执丢失后再次拒绝仍须追踪取消，以及部分取消状态持久化后禁止重发的 Why/How；修复与验证仅保留批次恢复复核指针。

- 2026-10-14：更新 EVOLVE 历史规则阅读指针：目录独立版本与冻结材料隔离，普通 Case 版本匹配、内置条件及本地浏览器验证边界；业务代码未提交或部署。

- 2026-10-14 ingest：补充 EVOLVE 归因阶段的冻结 HTTP 资源清单、只读元数据与大 Manifest 边界；连接复核 / 失败日志仅留指针，业务代码未提交或部署。

- 2026-10-14 ingest：记录人工复核的结果作用域、草稿保留边界与布局验收指针；真实评分和本地组件验证保持区分。

- 2026-10-14：补录 Nextplay 执行到评分跨阶段技术验证指针，区分实际产物交接与真实模型取分。

- 2026-10-14：补充 EVOLVE 候选自动准备、清单传输容量与草稿独立边界指针；本地回归不替代真实模型 / Provider 验收。

- 2026-10-14：补充 EVOLVE 大草稿起草、JSONB 容量与人工审阅 / 冻结验证指针，区分本地数据库 / SSR 和未完成浏览器验收；不记录为真实评分或部署。

- 2026-10-14：补充 EVOLVE Provider JSON 身份比较、Case 保存回归和真实评分证据边界的复核入口。

- 2026-10-14：补充草稿审阅在窄侧栏 / 主区域的容器宽度问题及浏览器验证指针，保持模拟保存与真实评分的证据边界。

- 2026-10-14：补充 EVOLVE 原件完整性失败分类和评分摘要数值身份的 Why / How 与本地回归指针；真实评分及部署状态留在专项记录。

- 2026-10-14 ingest：补充 EVOLVE 逐题结果连续阅读的页内身份、焦点与恢复原则，链接本地浏览验证，更新目录；不将示例成绩当真实评分。
- 2026-10-14 ingest：临科 02 三笔质检分配原生续跑，记录来源上下文门禁、历史原因边界、成功批次保护及真实本人列表验收指针。

- 2026-10-14：补充 EVOLVE 异步评分状态中断分类、故障触达验证与同身份恢复指针，范围与测试见 evolve-measurement-recovery-review-20261014.md；未部署业务服务。
- 2026-10-14 ingest：补证临科三笔分配的历史阶段、精确上下文零行 SQL 与旧版本参数，记录来源一致读和受控接续修复及数据库侧未知边界。

- 2026-10-14 · ingest：指标编辑与引用范围的布局、草稿保护和本地验证边界；实现与截图仅存报告指针，未部署或提交业务代码。

- 2026-10-14 · ingest：Nextplay 取消恢复遇到已删除 Thread 的精确判断，关联原生删除先终结 Run 的源码与测试；保留真实取分未完成及未部署边界。

- 2026-10-14 ingest：补充来源 Leader 读取、固定版本不漂移、请求内有界幂等重试，以及分支 CI 与测试分支集成的不同证据边界。

- 2026-10-14：补充已完成卡误转派后整批退回阻断的原作者接回方法、冻结计划与精确卡守卫、不同 Pod 主库独立回读和真实质检员接收人校验；具体实例仅存本次处理报告指针。

- 2026-10-14 ingest：补充 EVOLVE 异步结果更新与选中身份保护的 Why / How，记录后续只聚焦桌面交互；本地示例分数与真实评分分开。

- 2026-10-14 ingest：更新质检修复 main PR / 精确 head Gate 指针，记录源码行号变化须同步生成性能档案的 freshness 约束。

- 2026-10-14 ingest：记录候选对照独立于 Run 终态的汇总刷新、复核联动和分页口径；桌面组件示例不作为真实调优效果。

- 2026-10-14 ingest：整机空间清理的 Go 缓存与测试证据分离、iCloud 扫描停滞和会话/虚拟磁盘保留边界；容量及逐路径执行结果仅存报告指针。

- 2026-10-14 ingest：保存质检修复 review 中权限读取与答案读取必须对齐、真实数据库异常需经过适配器分类的 Why / How；仅模拟复现，未新增业务修改或生产操作。

- 2026-10-14 ingest：扩展跨仓库与工作树缓存扫描，补充 services/.tmp、嵌套实验仓库和 Claude 工作树的漏扫点；包依赖与实验数据继续保留，结果见同一清理报告。

- 2026-10-14 ingest：记录 Nextplay 断连后回滚掩盖原始异常的 Why / How，测试需关闭真实连接；实现与回归状态只存报告指针。

- 2026-10-14 ingest：调优基线异步更新、Trial 判定统计与谱系往返上下文；增补桌面衔接证据指针，模拟提交不代表真实应用或得分。

- 2026-10-14 ingest：补充 EVOLVE 多 Provider 原件下载身份边界、完整引用与包内 ID 分工，以及实际正文/权限回归指针；仅本地技术证据。

- 2026-10-14 ingest：EVOLVE 桌面 Benchmark 内容 / 运行规则并排、单项撤销保留草稿与历史冻结引用；实现和本地验证仅存记录指针。

- 2026-10-14：补充 EVOLVE 实际 Case 编辑器保存输出到 Nextplay 校验 / 评分的跨系统验证方法；保留真实运行与确定性模型的证据边界，更新索引和验证记录指针。

- 2026-10-14 ingest：补充 Case 目录错误恢复、开放对象类型与草稿保护、YAML 解析一致性的原因和复用方法；源码与桌面证据仅存记录指针。

- 2026-10-14 ingest：补充 pnpm auto clone 与 APFS 共享块导致目录占用/物理回收差异、nlink 检查的证明边界及按 store 版本使用官方 prune 的方法；具体清理结果和依赖样本核验只存报告指针。

- 2026-10-14 ingest：补充误点待定后已交卷的未分配个人批次恢复、原生派生卡 ID、真实 checkpoint 与正式答案分离、精确撤回守卫及本人重新提交边界；实例与运行验收仅存处理报告指针。

- 2026-10-14 ingest：更新质检 review 两项修复的 main PR / 精确 head Gate 指针，并记录朱炜整批退回的历史祖先误判；退回链只读取证与代码修复分开。

- 2026-10-14 ingest：EVOLVE 最新 main 整合中的构造器默认值与迁移打包边界，记录同基线失败复现及 PR 验证指针。
- 2026-10-14 ingest：补充 EVOLVE PR CI 暴露的 GOWORK=off 独立模块依赖边界；运行状态仍查 PR 当前 head。

- 2026-10-14 ingest：补充 EVOLVE 内置 Judge 与 Nextplay 原生指标的协议边界、通用组合方向和端到端验收要求。

- 2026-10-14 ingest：补充整改两次转交后历史上级许可版本失配的只读诊断、答案准备度与授权分离、缺父恢复工具适用边界及保留原结果的本人操作建议；本单证据和未改全局规则选择仅存报告指针。

- 2026-10-14：补充历史退回链 PR #2438、连续重检承接封存整改的验收依据与完整回归指针；未执行生产写入或发布。

- 2026-10-14 ingest：记录整改待定排除本次复验的用户裁决、完整草稿与权限链、冻结范围和抽样验证指针，以及普通结果契约与双栏吸顶边界；发布状态留 PR #2439 指针。

- 2026-10-14：记录 PR #2438 的历史退回验收重放反例，隔离假数据复现两种 autocommit 中断边界；业务代码与生产未修改。

- 2026-10-14：整改待定与吸顶验收截图已独立归档至 Playground，清理本地夹具后更新证据指针；最终工作流结果仍以 PR #2439 链接为准。

- 2026-10-14：补充 PR #2438 的 P1 验收中断恢复修复及当前提交绿色 Gate 指针；同次验收、冻结授权和责任版本校验保留，生产未写入或发布。

- 2026-10-14 ingest：补充 EVOLVE/Nextplay 合并后发布验证指针、镜像拉取导致工作流超时的核验方法，以及共享存储与当前基线准备、旧快照漂移的真实验收边界。

- 2026-10-14 review ingest：保存整改待定多轮历史排除与进度摘要的核查方法、PR 精确版本及本地复现指针；未修改业务代码或生产数据。

- 2026-10-14 ingest：记录 Nextplay 内部 Agent 调用、业务准备与评分职责的复核指针，区分快照保留和 PVC 实现；补充 EVOLVE 整页层次与执行终态不等于评分成功的界面验收规则。
- 2026-10-14：补充整改转交后的具体版本回退明示批准边界、仅本单依赖摘要及原生门禁/本人工作台独立验收指针。

- 2026-10-14 fix ingest：补充 PR #2439 两项 review 修复的历史排除继承、有效范围进度及异常成员回归指针；最新验证和发布状态仍以提交、PR 与 Gate 为准。

- 2026-10-14：整改待定修复的回归夹具已核对领域对象与接口对象边界，更新最终提交及完整 Gate 的权威指针；知识库不复制临时 CI 状态。

- 2026-10-14：补充 Nextplay 内部 Agent 执行的 Runtime 边界与既有库复用指针；记录旧配置复制约束，标明方案待决定、未实施。

- 2026-10-14：按用户请求准备整改待定到 main 的 PR #2442，追加最新 main 基线、仅本任务提交及独立 Gate 指针；不把创建 PR 当作验收或上线。

- 2026-10-14：录入 EVOLVE 借鉴 LangSmith 的来源与复核指针，区分已有基础与衔接建议；未修改业务代码或部署。

- 2026-10-14：补充 Nextplay 内部 Agent 与评分服务只读拉取原件的本地实施指针，明确不改 Runtime/复制 Preset、65 条技术验证与真实取分、临时缓存与 Judge 中断恢复边界。

- 2026-10-14：补充 LangSmith 官方 UI 截图来源与 EVOLVE 同题对照、筛选和上下文建议；公开界面研究与实际产品验收分开。
- 2026-10-14：补充 Nextplay 内部执行审查指针；真实业务 Key 权限/Thread 可见性、创建拒绝恢复、原件两段传输与缺件语义须分别复现，测试桩通过不得代表真实出分。

- 2026-10-14：记录 LangSmith 公开 Trace 交互与 EVOLVE 参考方案，区分段落定位、比较参照、重复执行与重试；保持现有视觉风格。

- 2026-10-14：补充 Nextplay 内部执行五项审查修复入口，记录后台凭据与用户身份区别、拒绝/未知受理分流、原件连续下载检查点及缺件证据语义；真实评分与发布仍单独验收。

- 2026-10-14：记录四个评测与调优平台的交互研究入口，区分 Prompt 试验、自动候选搜索和完整 Agent 复测；Opik Trial 映射到 EVOLVE Candidate 与 Run，未执行账号内任务。

- 2026-10-14：补充 Nextplay 内部执行修复后复审入口，记录取消对账不能依赖空 Run 列表、原件过滤需维护检查点和真实用量契约；仅本地复现与审查，未修改或部署业务代码。

- 2026-10-15：补充九月结算明细生成失败的只读取证入口，区分作答统计 SQL 的数据库内存异常、历史质检读取放大和大内存 QueryID 的身份可见性；未修改或部署业务代码。

- 2026-10-15：补充评测平台整体布局研究及四张新截图，明确全局导航、对象标题和任务主体分层；区分最佳方案卡与选中详情，保持 EVOLVE 视觉及核心对象边界。

- 2026-10-15：补充 Nextplay 内部执行三项修复验证入口，记录未决取消的证明边界、先标记后删除、真实用量和完整 Run 列表测试；未修改 Runtime、提交业务代码或部署。

- 2026-10-15：录入 EVOLVE 统一展示规划指针，按对象身份、指标四场景、Benchmark 比较范围及候选/验证/谱系关系组织页面；保留当前风格、全指标与冻结证据边界，未修改业务代码。

- 2026-10-15：记录 EVOLVE 布局图的明确纠正：指标、列表与详情共享整体工作区，使用对齐、选择和必要分隔组织阅读；保留第一版未获认可及修订预览的证据边界。

- 2026-10-15：登记 Maxwell #355 与 Nextplay #21，替换内部 Agent 验证记录临时路径为 GitHub 固定提交指针；两仓库各一个提交，仅发起 PR，未合并或部署。

- 2026-10-15：记录 LangSmith、Opik 核心交互复核入口及 Opik 2.0 导航范围指针；前两版视觉均未获认可，后续先按对象选择与状态变化重新审视，未继续改图或业务代码。

- 2026-10-15 ingest：新增 sandeval-historical-correction-stale-base，记录历史整改转交后的过期回交基线、原始 intent 与原生唯一性校验，现场证据留报告，未执行生产修复。

- 2026-10-15：登记 PR #355 的分层 CI 修复与验证指针：HTTP 层通过应用服务识别缺失错误，保留契约并补齐独立模块全包检查；未修改 Runtime、合并或部署。

- 2026-10-15：新增 EVOLVE 连续工作台交互建议指针，记录研究后的范围、选择、比较、证据与返回路径；标明待讨论及未实施边界。

- 2026-10-15：从当前主线与未合并 PR 核对 Nextplay 评测/调优发起职责，记录 Studio 确认、冻结基线及内部候选应用缺口的源码指针；未触发真实评测或业务写入。

- 2026-10-15 ingest：补充历史整改过期基线的明示授权单案恢复、独立历史与本人待办验收，以及归档前异常后的原操作恢复边界。

- 2026-10-15：记录 EVOLVE 上下同页的明确用户反馈，补充 Benchmark 综合趋势、图表记录详情联动与新预览证据指针；示例交互未作真实评测验收。

- 2026-10-15 ingest：记录 EVOLVE 再次视觉否定与商业工具界面修订指针，区分已认可结构、新视觉提案、局部交互检查和业务上线验收。

- 2026-10-15：记录 EVOLVE 内部执行分流与既有 Nextplay A2A Candidate Runner 的能力边界，保留历史替换验证入口，避免把新路径缺口误报为全平台缺失。

- 2026-10-15 ingest：补充 EVOLVE 底色与被接入对象的明确否定反馈，保存 Opik 当前项目和 Agent Playground、LangSmith 目标函数与实验配置的研究指针；区分被测对象、连接和版本，未改原型。

- 2026-10-15 ingest：补充竞品与 EVOLVE 的用例、指标身份、批量评测、调优和整体 Agent 质量映射；记录 Agent Beta 新证据及跨 Benchmark 曲线口径复查指针，未实施。

- 2026-10-15 ingest：补充指标管理与页面交互研究指针；明确 LangSmith 独立 Evaluators 管理、Opik 人工定义与自动规则的区别，记录趋势到样本证据的设计建议，未实施。

- 2026-10-15 ingest：补充 EVOLVE 双入口分工与 Adapter 临时资源授权；记录冻结原文校验、配对基线缺口和跨语言本地验收指针，未部署。

- 2026-10-15 ingest：核对 Runtime 架构图七类观测钩子的引入历史，保存平台监控、上下文治理、LangSmith 与模型恢复提交指针，区分 EVOLVE 记账与 Runtime 扩展。

- 2026-10-15 ingest：补充 ARC Services 与独立后端服务的统计边界，保存 EVOLVE 引入前后字段集合核对及独立 evolve-server 的源码指针。

- 2026-10-15 ingest：记录 EVOLVE 连续证据工作区原型、浏览器验证指针及用户最新边界：保留 Maxwell 色彩 token，布局与交互按自身概念组织；原型未获视觉认可，未修改业务代码。

- 2026-10-15 ingest：补充 EVOLVE Runner 自动准备与配对基线的本地实现指针，记录精确来源 CaseSet 授权、已知编号断线保存、未知接收不重发及隔离 PostgreSQL 验证；未部署、未新增真实评分。

- 2026-10-15 ingest：记录 EVOLVE 布局改善、底色与文字仍被否定的反馈；追加中性表面、文字层级及浏览器截图指针，新视觉待评价。

- 2026-10-15 ingest：记录用户对纯白 EVOLVE 与 Maxwell 不协调的纠正；回归现有暖色语义层级，保留阅读层级与布局，未修改全局 tokens。

- 2026-10-15 ingest：记录 J王珍/J刘子嘉批次退回标注员部分落库的只读取证入口，区分普通负责人路线、停止成功与进度条件更新失败，以及未修复生产的边界。

- 2026-10-15 ingest：记录石羽宁“待定题仍进入质检”反馈的工作项身份核验方法和只读证据指针；原待定卡与实际送审卡分离，历史题号与当前原题号投影分别核实。

- 2026-10-15 ingest：记录 EVOLVE 一致性需包含暖底、强边框、硬投影与控件分量；保存源码及新原型截图指针，不改变连续布局，未改业务代码。

- 2026-10-15：ingest EVOLVE 复审方法：基线失败恢复、准备终态和项目根目录证据一致性；具体缺陷与测试存为审查记录指针。

- 2026-10-15 ingest：补充待定反馈的历史题号重编取证、不同底层视频和首帧核对、待定只读标题误导；保留当事人认知原因尚未知的边界，未修改生产或业务代码。

- 2026-10-15 ingest：补充 EVOLVE 评分健康重检与原请求恢复、明确失败与接收未知的重试区别，以及先核验实际回收策略再判断引用遗漏风险；修复状态保留为验证记录指针。

- 2026-10-15 ingest：补充 J王珍/J刘子嘉单案恢复的计划、原生写入与本人整改入口独立验收指针；记录持久化退回意图、autocommit 中断回归、临时 Pod 审计持久化及解析预算核验边界，代码修复见测试 PR #2468。

- 2026-10-15 ingest：记录 Sand 可抽供应商未检题的规则核对、独立抽样与题序分离、整批复验链接锚点误判；岳黎明批次的数量、运行版本及持久化证据仅存核验报告指针。

- 2026-10-15：补充整批退回中断恢复的干净 main PR #2470 指针；保留测试 PR 入口，Gate、验收和部署状态以实时证据为准。

- 2026-10-15 ingest：补充 PR 事件基线与 checkout 合并引用漂移导致浅克隆缺失比较对象的定位方法；修复与本地复现留作 Maxwell #355 验证记录指针。

- 2026-10-15 ingest：记录 EVOLVE 连续工作区实装授权、Maxwell 视觉骨架、冻结 Benchmark 用例不依赖任务草稿清单、原生评分空 rubric 与汇总缺失状态展示边界；代码及验收存指针。

- 2026-10-15 ingest: 新增已跳过答案恢复修订的同步保护误判，记录同版本语义对照、本人授权只读和新旧部署复核入口；未修改业务代码或生产数据。

- 2026-10-15 ingest: 补充跳过答案单案恢复的权限/工作流只读预检、整批重做影响范围和追加普通版本的内容确认边界；处理方案尚未实施。

- 2026-10-15：更新 EVOLVE 实装指针，记录首版被用户否定、五个左侧入口的明确分布与对象上下文原则；补充本次纠正验证入口。

- 2026-10-15 ingest: 记录整批退回与部分转派的责任范围冲突、孤立持卡的普通恢复准入阻断、现有交接适用边界及防复发建议；未转派、未退回、未实施建议。

- 2026-10-15 ingest: 补充用户确认的整批选接手人裁决、两张孤立卡受控恢复及独立读回、同连接原子退回与共同保存锁的实现边界和测试 PR 指针；未代点质检退回，未合并或部署长期修复。

- 2026-10-15 ingest: 汇总空间 / Sand 质检抽样与打回复验的源码核验入口，区分历史设计、配置阈值、同线必入样和实际豁免，保存五张流程图及固定源码报告指针；未改业务代码或生产。

- 2026-10-15 ingest: 补充 EVOLVE 用户要求重新考虑导航与融合成熟产品布局、连续工作台原型及资产修订和证据到调优的浏览器验收指针；不代表业务实装或真实评测。

- 2026-10-15：补充 EVOLVE 原型图表 SVG 非等比拉伸的原因、像素坐标修复方法及宽窄屏验证指针；仅涉及原型。

- 2026-10-15 ingest: 记录伍字节包部分转派后原批范围缩小、展示与拼包选择不同造成单条遗漏；保留子集与整批加回的只读对比、正式修订证明及生产未写入边界。

- 2026-10-15：补充 EVOLVE 用例集从弹窗转为完整管理页、行勾选与成员身份分离、显式修订更新和 300 条模拟数据验证指针；正式服务端能力未实施。

- 2026-10-15 ingest: 补充部分转派整包修复 PR 2488 指针、冻结成员子集与 Sand 分配入口接续、整改链及旧 Sand 报告复用的校验边界；生产仍限只读。

- 2026-10-15 ingest: 补充 PR 2488 两项 review 修复的复验指针，明确单批回交传递冻结子集、核对原退回范围，以及必检预览对照真实抽样的验证方法。

- 2026-10-15 ingest: 记录 EVOLVE 现有导航及分类保持不变的最新约束，补充调优 Agent 会话 / 被测对象接入区分、草稿入库与冻结引用、全域规模管理和右侧详情抽屉原型验证指针；未执行真实 Agent 或评测。

- 2026-10-15 ingest: 记录跳过答案整改保存被同步比较误拦的根因、不可变 response 身份保护、PR 2491 与只读及本地浏览器验收指针。

- 2026-10-15 ingest: 补充 PR 2491 自动发布后的只读核验指针与并行转派辨别方法，旧接收人 403 不等同于同步修复回归，不自动改回业务归属。

- 2026-10-15 ingest: 记录 Sand 未质检状态筛选空列表的生产只读诊断，核对摘要生产版本、候选 SQL 准入和旧版测试夹具；保存固定证据报告，未修复或写生产。

- 2026-10-15 ingest: 补充质检状态筛选回归的 PR 元数据与 Git 因果核验指针，区分引入提交和后续部署，并记录版本共用及当前版仓储回归方案；未改业务代码。

- 2026-10-15 ingest: 记录 Caption Refine 尾帧起点、镜头结束边界与时长的口径差异及复核入口；未改业务代码或生产数据。

- 2026-10-15 ingest：EVOLVE 与 Nextplay dev 发布核验指针，记录原件拉取配置加载、OSS 版本核对及发布和真实评分的证据边界。

- 2026-10-15 ingest: 补充质检数据包筛选修复 PR 与发布验收指针；记录共用 schema、保留世代守卫、干净候选测试和运行态/用户场景联合核验。

- 2026-10-15 ingest: Nextplay 原题十题抽样验收指针；保留执行异常原始记录、前端刷新证据及只读诊断边界。

- 2026-10-15：更新 EVOLVE 正式前端与接口增量指针：规模目录、精确修订、趋势/候选联动、Agent 草稿保存边界，以及旧后端代理与未执行数据库迁移的验收限制。

- 2026-10-15：补充 EVOLVE 组合编辑状态和规模交互指针：取消/模式切换保留、搜索 Enter 防误提交、累计选择上限、指标分页与单项配置，并明确未保存样例和真实闭环验收边界。

- 2026-10-15 ingest：补充 EVOLVE 对象实际路由、配置抽屉、目录上下文返回、真实资产向导与 embedded 表格验证指针；保留只读浏览及真实执行未验收边界。

- 2026-10-15 ingest：补充 EVOLVE 分类型接入草稿、登记回执与检查隔离、方法精确版本/评分能力/服务协议关联、跨服务读取竞态及真实验收边界指针。

- 2026-10-16：更新 EVOLVE 正式前端指针，记录校准报告/人工反馈的冻结身份、证据返回路径和评分维度规模编辑方法；验收与未部署边界指向本地交互审计。

- 2026-10-16｜ingest｜EVOLVE 目录筛选、个人视图与任务返回证据；记录受控弹层输入焦点、已有契约复用与 Benchmark 新契约待确认边界。

- 2026-10-16：补充 EVOLVE 用例/共享标准/Benchmark 草稿恢复、原修订与请求身份保留、存储失败/账号清理及真实页面验证指针；未保存线上资产、迁移或部署。

- 2026-10-16 | ingest | EVOLVE 接入登记草稿与回执恢复：账号/入口隔离、Token 不落盘、未知请求核对和 GET 状态恢复；添加正式实现与只读/未提交验收指针。

- 2026-10-16：补充 EVOLVE 直接评测版本核对、能力显式选择、请求持久恢复和连续表单布局的 Why/How 与代码/验收指针；未真实运行评测、迁移或部署。

- 2026-10-16 ingest: 补充 EVOLVE 任务版本运行的选择、请求身份与独立基线验证分流；实现和验收结果仅保留指针，未运行真实评测或执行迁移。

- 2026-10-16 ingest：EVOLVE 独立候选验证的基线列表、冻结回执与未知请求恢复；追加代码/测试/浏览器证据指针，未执行真实验证或部署。

- 2026-10-16：补充 EVOLVE 任务工作区长标题、剩余高度、候选阅读与响应式协作的 Why/How 和验收指针；未执行服务写入、迁移或部署。

- 2026-10-16 ingest：补充 EVOLVE 调优创建、重评与资产编辑的请求恢复 Why/How、聚焦测试和浏览器验收指针；未执行真实运行、迁移或部署。

2026-10-16 | ingest | EVOLVE 汇总缺失/读取失败、完整口径比较与局部证据重试的 Why/How 和验收指针；未执行真实写入、迁移或部署。

- 2026-10-16 ingest：EVOLVE 全目录比较、冻结配置阅读、多指标历史与固定像素图表的 Why/How、源码和验证指针；仅既有记录只读验收，不代表新运行或部署。

- 2026-10-16 补充：EVOLVE 图表尺寸观察须绑定实际容器并验证窄屏到桌面的往返，旧坐标与新外框宽度不同不能只靠静态截图发现。

- 2026-10-16 ingest: 单题整改核查，区分视频镜头与题目、浏览器草稿与正式回执、回交成功与复验派回；记录队列前置和独立回读入口，仅只读。

- 2026-10-16 ingest：Nextplay 十题 HTTP 403 只读诊断入口；按调用身份、时间窗及部署源码区分 Preset 读取授权与后续 Thread/评分阶段，未修改权限或部署。

- 2026-10-16 ingest：质检转交成功回执锁超时后遗留任务级待核对占用；补充请求/事务/占用分层取证及原事务结案边界，详见 sandeval-work-handoff-unsettled-occupancy。

- 2026-10-16 ingest: 更正将 awaiting_assignment 原始执行数当真实未派单数的口径；记录稳定后继分组、已派出待人工与真实待派回的独立核验，以及恢复时间/尝试数的边界。

- 2026-10-16 ingest：Nextplay 执行 Key 最小权限管理员操作单与 EVOLVE 只读预检修复；记录业务编辑账号不能管理 Key、本地回归与真实出分分开验收的边界，未部署或改动线上权限。

- 2026-10-16 ingest：EVOLVE 按原型重组正式布局；记录阅读与运行操作分离、真实谱系和未知汇总紧凑展示，更新实现/验收指针并注明旧布局描述被替代。

- 2026-10-16 ingest：质检转交遗留占用经明确授权，以原生恢复 CLI 按已回滚事务结案；归档冻结计划、执行回执与第二 Pod 独立核验指针，未重放转交。

- 2026-10-16 ingest：徐咏晴质检题的早期 Sand 正式代改未进入后续空间复验基线；记录真实继承链、当前已提交状态、选项变化和独立只读验证，未修改生产。

- 2026-10-16 ingest：EVOLVE 先停实现研究 LangSmith/Opik；记录对象范围、状态分流与连续调查的设计依据指针，区分竞品证据、原型缺口和当前实装，保留五分类与 Maxwell tokens。

- 2026-10-16 ingest：补充连续 Sand 退回缺少中间空间复验的受校验继承修复 PR #2503、后续 Sand 读取与资格的只读候选证明；原数据完整时不伪造当前轮代改，保留已验收记录，发布与候选验证分开取证。

- 2026-10-16 ingest：按用户明确要求，从原干净任务分支直接发起继承修复 main PR #2504；记录 main/test PR 与生产生效证据的独立边界，未合并或部署。

- 2026-10-16：新增 [复验历史优先级与重试冻结](domains/sandai-data-smith/pitfalls/sandeval-reinspection-history-priority-retry.md)，记录同一次复验重试应复用冻结计划，以及必入样和实际检查义务分别核验的方法与只读证据指针。

- 2026-10-16 ingest：补充两级抽检范围中的单题抽样/原题号区分、默认与实际比例差异及王文轩检查记录的只读核查指针；生产无写入。

- 2026-10-16：更正 [复验历史优先级与重试冻结](domains/sandai-data-smith/pitfalls/sandeval-reinspection-history-priority-retry.md) 的入口边界：公开退回和后台恢复已就绪组会跳过，另补安排复验实际服务入口的延迟重试复现；不把内部方法异常直接归于普通页面操作。

- 2026-10-16 ingest：补充 Nextplay 权限配置后单题复验、模式参数与 Preset 能力兼容、未评分计数及取消回执边界的证据指针；本地回归与真实出分、发布分开记录。

- 2026-10-16 ingest：补充 Nextplay #357 限定发布后单题真实执行、长子任务、取消类别遮蔽停止触发原因的核验指针；强调实际登记时限、原评分及页面持久化独立验证。

- 2026-10-16 ingest：补充 EVOLVE 工作区/评测资产分组、评分方法与标准版本关系、规则/Prompt 表单及真实定义检查证据指针；区分定义检查、试评、实际运行和部署，并保留引用接口不可用边界。

- 2026-10-16：补充 Maxwell EVOLVE 单题实际执行预算、取消接纳与终态回执区分、预算编辑和冻结请求恢复的修复指针；代码与线上出分仍分别验收。

- 2026-10-16 ingest：补充 EVOLVE 新版布局优先、候选历史结果与冻结证据阅读的验收指针；明确旧评分分母、截断预览、返回上下文和全站未完成边界。

- 2026-10-16：补充 EVOLVE 评测记录的业务身份原则与验收指针；执行方式不能替代真实 Benchmark / 对象名称。

- 2026-10-16：补充 Nextplay 三条执行连接、声明级别与真实运行证据的区别及只读诊断指针；业务 PR 保留，不部署。

- 2026-10-16 ingest：新增整改冻结分区与当前作者批次重叠的诊断方法；范围版本相等不证明成员相同，完整性拒绝须区分重复与缺项，单案仅只读核验。

- 2026-10-16 ingest：新增柯衔整改转交后 legacy 普通提交误报的证据入口，补充石东亮独立任务的未结案占用核查；两案均只读，未执行恢复或提交。
- 2026-10-16：补充 EVOLVE 比较身份与搜索范围原则及验收指针；冻结修订独立于显示名，未知结果不作零，保留基线与证据阅读上下文。

- 2026-10-16 ingest：补充整改冻结范围重叠的 main PR #2510、完全重复批次的排除条件及未结退回/召回保护，保留代码与生产交接分开验收的边界。

- 2026-10-16 ingest：补充石东亮整改转交的独立授权、冻结计划、原生 rolled_back 结案及跨 Pod 读回；转交与个人批次长期修复按用户指示统一至 PR #2510，发布状态另行核验。

- 2026-10-16 ingest：补充PR2510合并发布后整包可提交的双Pod只读核验入口；区分当前范围完整、正式整包生成、负责人可执行动作和真实Sand交接。

- 2026-10-16：补充 EVOLVE Benchmark 内记录身份与对象筛选的 Why/How；证据留在本地验收记录，未扩展为全站或调优执行通过。

- 2026-10-16 ingest：补充 PR #2510 生产发布后的原单只读验收指针，分层核对原操作结案、个人批次待复验、真实整包与正式交接，保留初次旧阻断和后续恢复的时间证据。

- 2026-10-16 ingest：补充 EVOLVE 单一执行器的显式归属、冻结选路、旧候选保留及配置按值比较检查；实现与验收均指向本地记录，不代表已部署或真实取分。

- 2026-10-16 ingest：补充统一执行器主体角色保护、内存与 PostgreSQL 关系校验一致性、UTF-8 隔离测试环境及 Maxwell PR #358 指针；不代表合并、部署或真实评分完成。

- 2026-10-16｜补充 EVOLVE 用例表单的未完成输入恢复、校验输入只读边界及浏览器验收指针；全站与真实调优闭环仍须分别验收。

- 2026-10-16｜记录 EVOLVE 对象／方法／连接前端分工提案与 PR #358 核对指针；保留五类导航，未改代码或连接关系。

- 2026-10-16：EVOLVE 用户复核连接唯一归属，明确业务指标内配置 Prompt/模型的目标；更新研究与局部实施证据指针，区分未实施的指标配置/试评契约。

2026-10-16 ingest maxwell: 记录用户最新的计算方法/评估器实例/指标/指标集关系及证据范围，标记旧 calculation 方案已取代，保留研究与实现差距指针。

2026-10-16 ingest maxwell: 记录由 Case 指标关联推导 Benchmark 指标的最新方向，指标集降为可选复用工具；链接批准记录与契约细化边界。

2026-10-16 ingest sand-eval: 记录人工退回后通过状态、重检摘要与转交入口断开的原单证据和诊断边界；未修生产，未认定未就绪的深层原因。

- 2026-10-16：补充 PR #358 限定发布、原题执行/Provider 原评分/前端持久化的独立证据入口，以及 Chromium 原件保存对话框与传统 download 事件区别；原十题状态回到复验记录核对。

- 2026-10-16 ingest maxwell: 记录 Case–指标独立双向关联、三类资产独立版本及 Benchmark 采用更新的澄清；附被取代的 Case 内嵌方案与当前实现证据指针。

2026-10-16 ingest sand-eval: 补齐原质检员资格预检证据与待重检责任转交的连续身份、冻结计划及同请求恢复原则；发布与原单操作状态从 PR #2522 和独立验收读取。

- 2026-10-16 ingest sand-eval: 记录重抽漏掉唯一原 Sand 不合格题时的意见展示边界、跨关卡必抽及历史计划独立核验；附原单只读证据指针，未修改生产。

- 2026-10-16 ingest maxwell: 补充评估器与指标原子发布、恢复版本和 OpenAPI 实际生成的核验指针；完整界面、真实试评与 PostgreSQL 执行状态仍沿验收记录核对。

- 2026-10-16 ingest sand-eval: 补充上游 Sand 质检员打开供应商复验链接的真实权限拒绝及 root 自动切换执行人的证据边界；区分历史意见与今天操作。

- 2026-10-16：补充 Sand Eval 刘钬整改提交的历史祖先授权失配核验方法与现场证据指针；本人答案更新正常、联合历史子单阻断，仅只读诊断。

- 2026-10-16 ingest：EVOLVE Benchmark 历史编辑内容与保存基准分离、跨版本阅读与局部验收指针；记录未完成的历史目录解析和新版关联边界。

- 2026-10-16 ingest sand-eval: 记录刘钬本批经明确批准的三条版本栅栏例外、冻结计划/正文备份与跨副本独立验收；保留现接收人、转交历史及原许可/执行，不代替本人提交复验。

- 2026-10-16：补充 EVOLVE 独立版本的未知保存结果边界、首次拒绝与后续拒绝区别，以及聚焦/完整检查指针；未执行真实资产发布。

- 2026-10-16 ingest sand-eval：记录概览未提交与 Sand 可分配的范围差异；保留正式交接、当前整包成员、重复覆盖历史批次和源码复现证据，区分诊断与上线。

- 2026-10-16 ingest sand-eval：补充概览有效批次修复测试 PR #2559、精确整改重复批次回归与独立分支 Gate 的验证边界。

- 2026-10-16 ingest sand-eval：补充用户要求的 main PR #2560，与原测试 PR、独立完整矩阵和测试站验收分别核对。

- 2026-10-16 ingest sand-eval：补充临科智华整包提交身份和旧提示的只读判读；区分已交接、真实 Sand 退回与指定账号可提交，保留报告及测试 PR #2561 指针。

- 2026-10-16 ingest sand-eval：按用户要求将整包提交提示与状态刷新修复指针集中到 main PR #2560，保留原概览修复，关闭重复测试 PR #2561；不将分支 Gate 等同部署。

- 2026-10-16 ingest sand-eval：记录 Sand 零分配整包自查退回的源码核查入口、现有质检/整改转交限制及离职交接风险；建议流程未实施且未核对生产部署。

- 2026-10-17 ingest sand-eval：记录用户授权的整包自查实现 PR #2564，范围扩展到部分 Sand 已分配/质检；补充历史保留、旧执行停止、全部批次重交后重新分配及测试集成证据边界。

- 2026-10-17 ingest sand-eval：补充 PR #2564 的旧整改并存、原保存续做、多仲裁停止和准备自查前重启恢复的代码与用例核查指针。

- 2026-10-17 ingest sand-eval：补充 PR #2564 固定 head 5c4c7fc35 的隔离 review 复现入口，以及并发原子准入、明确拒绝与未知结果分流、实际详情逐批读取的核查方法；未修复业务代码或核验生产。

- 2026-10-17 ingest sand-eval：记录 PR #2564 固定 head 9b18b3c5c 的修复复审入口，补充迟到自动复核/仲裁 INSERT、明确未开始的错误契约与批量改派资格核查；保留模拟接口、锁模型、分支 Gate、测试集成和生产状态的证据边界。

- 2026-10-16：补充 EVOLVE 单一 LLM Rubric、自定义 Prompt 与独立输出指标的设计指针；记录真实组件和技术验证边界，未执行迁移、部署或模型调用。

- 2026-10-17 ingest maxwell：记录直接写入正式评估器前端的创建动线与 LangSmith 官方核查入口；正式页面证据不替代模型试评和资产发布。

- 2026-10-17 ingest maxwell：补充评估器配置编译、精确指标读取与正式页面分类编辑的验收指针；区分前端代理环境、受控计算测试和真实试评。

- 2026-10-17 ingest sand-eval：按用户明确 main 合并授权补充 main PR #2566 与最新 main 干净挑入 9 个开发提交的证据入口，保留原测试 PR #2564，不把测试历史带入发布；合并、Gate、自动发布及运行态分别核验。

- 2026-10-17 ingest maxwell：补充持久试评的操作身份、冻结配置、未知执行和取消边界；保存源码、正式页面及受控测试指针，未执行数据库迁移或部署。

- 2026-10-17：补充 EVOLVE 评分材料选择与实际试评范围指针：显式选择不扩为全部材料、历史映射保留、未知请求冻结恢复；正式页面与真实服务验收分开。

- 2026-10-17 ingest：EVOLVE 指标集正式管理与精确版本采用、目录往返草稿、账号恢复提示及独立关联待确认边界，记录实施证据指针。

- 2026-10-17 ingest：EVOLVE 评估器数值/分类原始输入恢复、可见值与提交值核对及固定操作栏反馈，追加正式页面和受控测试指针。

- 2026-10-17 ingest：EVOLVE 资产长编辑统一抽屉、关闭保留与明确放弃，记录历史草稿、桌面及窄屏证据指针。

- 2026-10-17 ingest：EVOLVE 独立指标编辑与评估器采用，记录精确引用、兼容汇总、批量原子上限及正式页面与真实发布的验证边界。

- 2026-10-17 ingest：EVOLVE 评分资产导航与方法用途，记录精确方法和服务版本、草稿恢复、校准返回及正式页面验证指针。

- 2026-10-17 ingest：EVOLVE Benchmark 编辑抽屉，记录原始数值恢复、资产管理往返、窄屏证据和新旧关联模型的验收边界。

- 2026-10-17 ingest：EVOLVE Benchmark 目录与冻结入口，记录真实目标筛选、来源名称、版本跳转、返回上下文和未读通历史内容的验收边界。

- 2026-10-17 ingest：EVOLVE 冻结内容读取与分页返回，记录局部解析未命中、精确缓存身份、安全错误展示与真实业务未读通的验收边界。

- 2026-10-17 ingest：候选验证抽屉与证据往返；补充来源筛选、默认布局返回、公共浮层及窄屏验收指针，保留未真实执行与读取不稳定边界。

- 2026-10-17 ingest：重新评分连续工作面；记录固定底栏、同一草稿、分页身份、来源返回及模型参数保留，链接真实读取与受控提交验证边界。

- 2026-10-17：补充 Maxwell EVOLVE 独立关系授权、主线交付与性能验收指针，以及调优入口连续操作/统一记录路由的验证边界；更新 index。

- 2026-10-17 ingest：EVOLVE 首屏依赖与按需读取；补充辅助请求仍会阻塞 Promise.all、取消状态缓存边界、分页终止及真实性能证据指针。

- 2026-10-17 ingest：EVOLVE Case—指标独立关系服务端实现指针；补充多输出来源须校验精确内容、批量去重与数据库性能证据边界，更新 index。

- 2026-10-17：录入整改封存缺凭证与待定后批次接续两类阻断的证据边界、恢复保护和修复指针。

- 2026-10-17 ingest：Nextplay 资产题阶段限制与续答诊断；区分历史恢复、Ask User 动态回答、固定多轮和异步工具等待，记录实际系统指令证据与未验证边界。

- 2026-10-17 ingest：补充十题流程完成度核验指针；按原任务与正式产物查提前结束，不限于提问漏答，分清媒体制作、项目保存及跨对象确认缺口。

- 2026-10-17：补充两案授权恢复的原意图保护、有效报告续跑、部分写入回读和主线发布证据指针。

- 2026-10-17 ingest：Sand 当前不合格但验收通过的只读审计；按用户澄清排除历史整改，核验当前送审/复验与完整退回链，交付批次及题目明细。

- 2026-10-17 ingest：核验原 Nextplay Candidate Runner 与 MaxwellExecutor 的共享执行逻辑；记录 A2A 不保证业务阶段完成、模拟用户可见上下文及 Case 终态后清理的设计边界。

- 2026-10-17｜Ingest｜记录退回质检版本占用、原请求回执与后继重检分层；保留原单只读取证和未执行恢复提案指针，不把转交超时归为截图幂等冲突。

- 2026-10-17 ingest：记录 Case 有限目标续行的本地实施指针、公开策略与原 Judge 隔离、澄清/跟进独立预算，以及 not_sent/unknown/accepted 回执和未知派发保留资源的边界；未发布或重跑真实媒体题。

- 2026-10-17 ingest：补充原退回单授权续办、原生预检及跨副本入口/样本回读指针；记录 PR #2575 与 Quality 预检/CLI 审计的 owner 边界。

- 2026-10-17 ingest：记录标注员历史空间整改通过与当前 Sand 退回的责任链区别、本人原生查询和负责人完整流水交叉核验，以及逐题备注与整批原因的保存边界。

- 2026-10-17：录入 Sand Eval 整包退回事务与提交锁等待取证入口；保留生产时间线、PR #2566 / b4177be35、共享表锁与普通读取延迟分层、未执行生产变更的边界。

- 2026-10-17：补充 Sand Eval 锁争用修复建议与实验事务官方依据；记录包级持久准入、原单恢复和真实 Hologres 并发验证边界，方案尚未实现。

- 2026-10-17：补充整包自查 #2566 回退 PR #2577 及生产操作核验入口；交叉链接旧单批退回事务和普通 CAS 锁回归，区分无人操作、常驻扫描、锁等待与全部页面延迟。

- 2026-10-17：补充 Maxwell/Nextplay 目标续行本地审查指针；记录跨入口派发/清理故障窗口、取消留证、保存与执行联合约束及原件观测边界，未修改业务代码或发布。

- 2026-10-17：录入李阳质检页旧版反馈的取证指针；区分服务器最新已保存答案和本人浏览器显示，记录原生双接口一致性及正常登录前的验收边界，未写生产业务数据。
- 2026-10-17：补充 EVOLVE 目标续行审查修复指针，记录真实 Provider 目录往返、JSON 缓冲区隔离、接收后清理、取消留证及有界交付观察的检查方法；仅本地业务修复，未部署或重跑真实评测。

- 2026-10-17：录入复验退回与提交整体审查指针；记录接收/发布/关闭三个恢复屏障的逐语句故障注入、历史卡单只读取证、冻结抽样重试与最新 main 修复补审边界，未修改业务代码或写生产。
- 2026-10-17：补充目标续行配套交付入口 Maxwell #361 / Nextplay Eval #22；各仓库单提交、PR 描述一句话，区分创建 PR 与合并、部署及真实评测授权。
- 2026-10-17：核对 Nextplay Eval 独立调用兼容边界并补充测试指针；旧 Case 默认不启用目标跟进，无 EVOLVE 服务前置依赖，异常回执未确认时保留资源；未部署或发起真实评测。
- 2026-10-17：补充 Sand Eval PR #2590 修复复审及重检准备中现场诊断指针；记录仲裁结果发布隔离、DRAFT 补建入口、换请求号接续、单条异常隔离和全历史恢复扫描延迟；线上恢复须独立验收。

- 2026-10-17：录入 Sand Eval 跨请求同范围首送分叉的只读取证方法、真实 SQL 发布窗口、质检员身份核验及测试全局锁盲区，见 `sandeval-cross-request-first-submission-race`。

- 2026-10-17：补充同范围首送分叉的单案授权恢复与独立验收入口；原判断和备注逐字段保留，原生负责人批次查询恢复，代码修复单独走 PR #2594。

- 2026-10-17：补充 EVOLVE PR #361 整合指针，记录新增评分资产迁移保留既有资源类型、用新版页面承接续行能力及未知写入/原件下载回归边界。
2026-10-17 | ingest | maxwell | 新工作台十题双轮验收指针：迁移授权、旧题缺省续行与两轮冻结口径；结果以实际验收记录为准。

- 2026-10-17：补充 EVOLVE PR #362 的未完成次数草稿、范围门控和跨分区首个无效字段定位经验，保留模拟事件与真实浏览器验收边界。

2026-10-17 | ingest | maxwell | 补充新工作台旧 Provider 绑定升级、同源修订和双轮冻结指针；归档按用户最新指令暂缓，结果沿回执刷新。

2026-10-17 | ingest | sandai-data-smith | 记录 PR #2594 复查发现：预发布占用与最新整改恢复不兼容、归档重试遗漏新接受命令、同原单正常进度被误报冲突；附实际方法 SQLite 故障复现指针。

- 2026-10-17：补充 EVOLVE PR #362 的刷新阅读连续性、冻结 Case 同步门控、请求取消及 Run/Trial 导航隔离经验，区分组件技术回归与真实浏览器验收。

- 2026-10-18 ingest：EVOLVE Benchmark 内嵌评分与独立资产目录的可见性诊断及只读证据入口。

- 2026-10-18：补充 EVOLVE 试评替换前的检查点、旧结果保留及保存回调上下文指针；见 evolve-drawer-overflow，技术回归不代替浏览器或真实模型验收。

2026-10-18 | ingest | sandai-data-smith | 记录复查三处问题的恢复协议：冻结 ledger 前像并原子接续、停写后校验归档依赖和删除前缀、保留同原单前进进度；链接修复与 CI 证据。

2026-10-18 | ingest | maxwell | 补充原件 Range 等价核验、弱 ETag 误判更正及恢复后状态差异基线；仅存方法与证据指针。

2026-10-18 | ingest | sandai-data-smith | 补充 PR #2594 持久占用的性能审查方法与证据指针，区分额外往返、同任务 CAS 热点、JSON 增长和低频管理员表锁，尚无延迟前后实测。

- 2026-10-18：补充 Benchmark 组成读取意图、草稿恢复、历史来源与乐观保存版本分离及有限请求的正式实现指针。

- 2026-10-18 ingest：记录 EVOLVE 外部评分只读展示、冻结规则逐题保留、旧对象入口迁移及首屏三方向待选择的实施指针。

2026-10-18 | ingest | sandai-data-smith | 补充按业务键原子占用、发布语句归属守卫与封存只读确认；区分重复分支自动提交维护和强制整改接续的显式表锁维护模式，CI 状态沿 PR 刷新。

- 2026-10-18 ingest：补充 EVOLVE B 方向首屏实施与用户的运行数量澄清；记录慢读取不被轮询饿死、备注身份及 502 恢复验收边界。
- 2026-10-18：记录 EVOLVE 新布局密度与一致性收敛：保留五类导航，按需规则、选择后操作、单页分页与窄屏阅读；实际证据与后端读取边界沿正式验收记录核对。

- 2026-10-18：补充 EVOLVE 原评分内嵌 Assessment、执行与评分模型区分、汇总独立对齐及 JSONB 资产身份核验方法；动态双轮结果保留报告指针。

- 2026-10-18：补充 EVOLVE 运行中比较缓存验收：对照停留页面、后台原分与重新进入后的逐格结果，区分持久化可读和实时更新可用；证据保留报告指针。
- 2026-10-18：补充双轮零分的只读交互诊断指针；核对普通消息确认、AskUser回答、goal策略及实际SYSTEM阶段边界，区分执行完成、业务未完成与原评分。

- 2026-10-18：录入 EVOLVE native 与 Nextplay 原 Judge 归档导航差异、模拟用户一致性修复及验收指针；measured 不等于取证完整，未据本地测试宣称已发布或取得新评分。

- 2026-10-18：补充两仓库修复发布与原十题单轮复验入口；仅更新冻结 Provider 绑定，保留输入、原规则和媒体 SP，通过原件重建与线上 bundleHash 核对实际 Judge 输入，动态结论查验收报告。

- 2026-10-18：补充原 Judge 输入与策略哈希一致、原判对实际 SP 阶段适用性、媒体实际交付三者的边界；保留原分，用当次配置与原件复核限制归因。

- 2026-10-18：补充 maxReplies/goal 与普通消息停止的区别、真实用户阶段授权边界，以及 Trial 精简引用误报输入为空的原因、身份校验和 #364 修复指针。

- 2026-10-18：补充 EVOLVE/Nextplay 比较时区分 Agent、模拟用户和 Judge 模型与采样，以及单侧证据、Snapshot 和执行隔离的边界，附只读差距分析入口。

- 2026-10-18：记录 EVOLVE 结果优先、原始判定与采用指标分离、指标自然排序、空独立目录按需管理与轻量筛选变体的实施指针；真实回读和发布状态以本轮报告为准。

- 2026-10-18：录入 EVOLVE 查询分层性能取证与隐藏基线调优授权边界，补充 PR #365、真实运行及发布报告指针。

- 2026-10-18 ingest：补充精确整改链接的只读复核、同原命令多责任占用及历史卡单未恢复边界；证据见 sandeval-reinspection-command-recovery-barriers。

- 2026-10-18 ingest：补充临科智华 20261010_03 分配只读复核；区分整改冻结两题与新作者冗余普通批次、当前原生前置通过和实际下发未验证，附证据报告指针。

- 2026-10-18 ingest：记录精确整改原单恢复、独立验收、来源凭证过期续办与当前答案保护；发布和自动派单状态独立核验。

- 2026-10-19：补充 Sand Eval 已消费后继导致旧整改重复版本的诊断与审计恢复边界，记录共享版本依据修复 PR #2601 和两单恢复报告指针。

- 2026-10-19：录入两个“整包交接受阻”的只读核验指针，区分旧冻结范围重复、当前来源份数和完整包指定交接人权限。

## [2026-10-19] ingest | 补充 EVOLVE 目录投影、外部评分显式采用、可恢复目录归档及深层阅读的原因、应用边界和六处修复验收入口。

- 2026-10-19：补充 EVOLVE/Nextplay 原生历史运行逐题取证入口，明确阶段SP、Skills/三个模型、交互分支、初态与评分版本差异，以及运行中/已完成和证据缺口边界。

## [2026-10-19] ingest | 补充 EVOLVE 全差异审查的恢复边界、子连接故障投影、远端清理 context/停止回执及统一 main PR #367 指针。

## [2026-10-19] ingest | 补充整改重叠但正式代改只属于新批成员的证据边界，记录精确子集复用 PR #2488、扩展 PR #2602 及两包手动交接审计回读报告指针。

## [2026-10-19] ingest | 补充 Runtime 历史列表排除未启动已取消任务的契约边界，以及精确终态回执与普通 ACK 的区别，证据沿 PR #367。

- 2026-10-19：录入 Sand Eval 已完成报告后同送审版本追加复验的只读取证入口，区分历史完成、当前零进度与列表摘要待确认；未执行生产恢复。

- 2026-10-19：补充已完成质检后新轮次的原因：上层中断执行未接续下层已通过报告，子整改闭环再次触发安排复验；保留源码及正式回执核验入口。

## [2026-10-19] ingest | 补充本次整改与整包修复统一 main PR #2603 指针及组合后的事务边界、失效范围投影和生成物回归要求。

- 2026-10-19 ingest：EVOLVE 六处修复补充 main 发布回执与浏览器锁屏接续边界；实际归档、十题及报警状态指向独立读回记录。

- 2026-10-19 ingest：EVOLVE 取消 API 分类与正式监控落地的双层边界，补充 PR #369 与 main dev 发布指针，区分代码部署和真实报警解除。

- 2026-10-19：补充 EVOLVE NAS 本地 flock 跨节点取消覆盖、PostgreSQL 互斥与租约退出边界，纠正浏览器锁屏并非 AppleEvent 失败唯一原因；状态沿 PR #370 与验收记录核对。

## [2026-10-19] ingest | 补充 Sand Eval 同版本重复复验的审计恢复边界、单批与批量真实 SQL 一致性回归及部分恢复续做；实现和交付证据仅存指针。

- 2026-10-19 ingest：审查 main 候选生成到采纳的跨层合同，记录三条临时复现与独立验证、Search、原生指标决策衔接边界；未修改业务代码或线上权限。

2026-10-19 — 补充 EVOLVE 运行发现与趋势职责：源码范围、取消/评分投影风险、跨业务权限边界及 LangSmith/Opik 官方指针；设计建议尚未发布。

2026-10-19 — 补充 Sand Eval 整改批次展示根因：相同范围版本下成员数变化未触发投影、冗余来源待分配误标；记录纯抽样与真实逐题下发独立回读入口，仅只读诊断，未改业务代码。

2026-10-19 — 补充 Sand Eval review：最后慢读取后同范围重新取证、预留 Sand 编号与真实责任链区分、有效分区在整包退回及并行代改报告资格中的消费者检查；动态结论指向本机 review 证据。

2026-10-19 — 记录同版本整改分配投影修复及局部选择的完整范围证明，用户指定并入PR #2607；保留本地回归、候选只读验证、远程review服务错误及最终CI证据入口。

- 2026-10-19 ingest：补充后续版本提示的版本来源与本轮归属核验，链接两条复验只读证据，保留原设备状态未验收边界。

2026-10-19 — 补充 Sand Eval 并行代改与整包退回闭环：逐成员自身 ledger 的唯一归属、保留各批次报告资格、未结历史责任阻断与冻结本地版本准入；运行态仍指向 PR 和本机验收报告。

2026-10-19 — 更正两条质检链接第1题正常的外推，补齐截图题号、全任务逐项、跨批次代改和新快照接续路径的只读证据指针。
