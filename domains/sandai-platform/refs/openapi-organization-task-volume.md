---
name: openapi-organization-task-volume
type: reference
created: 2026-11-25
updated: 2026-11-26
tags: [sandai-platform, grafana, sls, openapi, organization]
links: [inference-concurrency-dashboard-entrypoints, development-entrypoints]
---

# 开放平台组织任务量看板查证

- [组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be)位于「sandai 开放平台」。入口、组织和粒度的实际配置以已保存面板为准。
- [Inference 并发资源看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency)提供生产双区的非终态快照，可用作同一结束时点的对照。

**Why:** 组织完成量按首次公开终态时刻计量。终态日志没有组织时，按任务 ID 关联创建请求受理事件的组织，保留任务创建时的归属。快照 Top 5 无法恢复全部组织的历史在途。日志推算会受关联覆盖、采集延迟和任务年龄边界影响。

**How to apply:** 从已保存查询核对国内 `message` 与美西 `content` 的已索引字段、受理路由、首次终态、时区及分桶。SLS 跨越看板起点的取数范围用 `__time__` 约束，并检查完整性和延迟。逐组织算数量时保留未记录的组织分类，核对成功、失败、取消之和等于完成，时段完成之和等于组织汇总，最后一个分桶的在途值等于期末在途。各时点的在途以过去 48 小时创建并仍未匹配公开终态的任务推算。用同一截止时间重新核对快照和日志历史覆盖。Grafana 现有 MySQL 连接的默认库与主从及索引状态须重新确认，避免将查询持续打到生产业务库。

## 组织名称和下拉筛选

2026-11-25 在同一看板接入组织名称。组织下拉仍按所选入口与时间窗口从 SLS 获取组织 ID，使用「Zeus Admin 显示名 · ID」供搜索，提交给任务 SQL 的筛选值仍是 ID。组织表与下拉用同一份按入口和组织 ID 建键的名称映射。后台个人组织的显示名沿用脱敏值。

名称映射是对有任务的组织从 [Zeus Admin 组织目录](https://zeus-admin.sandaii.cn/organizations)作的点查快照，和日志取数独立。回读看板中隐藏的 `org_names` 常量可核对采集时间。组织改名或新增组织需回查后台并更新映射，名称没有覆盖时下拉仍支持按 ID 筛选。验收用同一固定窗口核对名称和 ID 搜索是否定位同一值，并逐行对比增加名称前后的任务量。

## 组织认证状态取数

2026-11-25 在 Zeus Admin 国内、海外生产各核验一条组织记录。组织列表支持按组织 ID 点查，`certifications` 提供个人实名、企业四要素的可用与通过标志。详情的 `/organizations/{orgId}/certifications` 还提供企业对公账户认证状态。沿 Zeus 的 `AdminOrganizationCertifications` 核对当前代码，认证记录归属于组织所有者。企业四要素和对公认证分开读取。

**How to apply:** 组织状态（如 ACTIVE）与认证分别取值。按入口和组织 ID 关联看板，区分通过、未通过和结果不可用，仅同步状态字段。查询别名时先用已授权目录候选确认身份。目录的精确查询按 ID、完整邮箱或手机号匹配，脱敏显示名可能省略账号前缀，不能据别名未匹配判断没有认证。复核入口见 [Zeus Admin 组织目录](https://zeus-admin.sandaii.cn/organizations)。

## 认证快照与成功率展示

2026-11-25 更新 [组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be)。按入口和组织 ID 关联组织所有者的个人实名、企业四要素和对公认证。回读隐藏的 `org_certifications` 变量和表格上方的北京时间，确认认证快照覆盖与新鲜度。任务量随所选时间变化，认证展示采集时的状态。只记录状态，判断已通过优先看有效通过标志，其次用最近记录区分待完成、处理中、未通过和未认证。快照未覆盖与数据不可用各自显示。

成功率为成功任务量除以完成任务量，完成含成功、失败和取消。零完成量显示空缺。验收固定时间窗口的双区逐组织的原始计数、成功率和状态，切换单组织检查表与概览卡同值。新组织或认证变更沿上节的 Admin 查证入口补齐。

## 全用户任务的 PE 开关占比

2026-11-25 核对国内和美西生产。分母按任务创建时间和任务 ID 去重，覆盖开放平台 API 与在线体验已创建任务及其各状态。任务持久化的开关是 `task.enable_prompt_enhancement`，在 [Zeus Admin 任务详情](https://zeus-admin.sandaii.cn/tasks) 可回读 `parameters.enablePromptEnhancement`。Athena 生产的 `jobs.options.promptEnhancement` 记录派发给推理的开关。模型默认值和请求参数的再解析方式沿模型配置与任务组装代码回查。

**Why**　PE 阶段事件只覆盖实际走到前处理的作业。受理日志没有任务级开关，Athena 缺少派发前失败和仍在排队的任务。仅比较两个总数还会掩盖两边各自缺少的任务。

**How to apply**　沿 [组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be) 的 SLS 区域和创建入口，以完整分段查询形成受理任务 ID 集合。Athena 从对应国内和美西生产项目过滤任务时间窗，按项目与 `request_id` 去重。按区域和 ID 核对双向差异，对缺少开关的 ID 点查 Zeus Admin，抽查 Athena 开关与任务详情一致。另查 Zeus 提交与终态日志是否有前两源共同漏掉的任务，再用 Admin 短窗分页独立抽验。任务 ID 含有分配时间，可用于限制日志扫描。起止边界用 Admin `createdAt` 复核，避免把在截止秒才持久化的任务计入半开区间。双源均缺失的记录需要另用生产任务库核对。复算时记录实际截止时间、未知值和各区分母。

## 2026-11-25 组织失败按终态阶段和下游原因对账

**Why**　公开终态中的 `MODERATION` 同时包含审核拦截和审核服务错误，`EXECUTION` 也包含进入 GPU 前的素材和 PE 错误。按阶段汇总后仍需读取对应的下游原因，避免把内容审核统称为生成异常。

**How to apply**　固定结束时刻，沿看板的任务 ID 去重及首次终态口径，对已受理目标组织核算成功与失败。Zeus 日志用 `jobId` 索引词联合受理和终态检索，在 SQL 内抽取 `task_submitted taskId=… jobId=…`。在美国索引里直接全文搜 `task_submitted` 可能漏派发。确认每单有唯一 Job ID 后，逐单回查上海 `inference-prod` 的 `moderation stage decided`，按输入或输出、拒绝或服务错误、审核项和 reason 分组，保留组合标签。执行失败先查日志，具体原因缺失时，在检查语句计划和主键索引后以已知 Job ID 限量只读回查 Athena `jobs.state` 的终态错误与前后处理步骤。提交失败无 Job 时，使用 Zeus 终态 Trace 核对 Athena 建单访问状态，响应体缺失则保留字段原因未知。汇总必须与公开失败任务数闭合。

同一客户的失败标签是审核服务判定。标签错误率和是否需要规则调整需独立核对申诉或人工样本。复查入口为 [组织任务量](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be)、[美西 Zeus 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/co_sandai_zeus_prod?slsRegion=us-west-1) 和 [上海 Athena 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/inference-prod?slsRegion=cn-shanghai)。

## 2026-11-25 按组织或关联用户核对 PE

**Why**　组织 ID 和关联用户 ID 同为数字，查询条件含义不同。任务列表还返回 `submittedUserId`，逐单归属需要结合相应字段。建单前被拦截的请求可能缺少可关联的任务 ID、身份字段或 PE 参数。

**How to apply**　先在 [Zeus Admin](https://zeus-admin.sandaii.cn/tasks) 对照国内生产与美国生产，分别以 `orgId` 和 `ownerUserId` 检查输入 ID，沿组织详情核对关联用户。固定创建截止时间，使用 `deleted=all` 翻完游标，检查组织范围与关联用户范围的任务 ID 是否一致。逐单对照 Zeus 详情的 PE 开关及 Athena `request_id` 的下游开关。需要核对是否产出增强文时只保留字段是否有值。已建任务的分母按任务 ID 去重。要统计建单前请求，另沿对应入口的请求 ID 与已记录身份核对覆盖，缺少身份或原始开关时保留未确认边界。

## 组织显示别名

2026-11-25 按用户指定将美西入口组织 `871185370785733` 显示为 `Sand.ai`。在组织任务量看板的隐藏变量 `org_names` 中使用 `us:871185370785733` 作为键，供组织搜索与表格共同读取。Inference 并发资源看板海外 Top 5 使用表格值映射，同时显示别名和原始组织 ID。

2026-11-26 按用户指定补录国内 `874226295056901` 为「北京跳跃视界智能科技有限公司」、海外 `872491245460485` 为「巨日录」。06 分别写入国内、海外在途 Top 5 的组织值映射，07 写入按入口和 ID 建键的 `org_names`，供组织筛选、地区组织表和双区生成受理量榜单复用。

更新目录名称快照时保留已确认的显示别名。固定同一美西时段，用别名与组织 ID 分别搜索并确认得到同一筛选值，再对照两个看板的表格显示。认证按入口与组织 ID 关联。

## 双区 Top 5 榜单名称映射

2026-11-25 在 [06 的国内、海外 Top 5 榜单](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 补齐组织名称。取当前「组织任务量」看板的组织名称映射，按生产入口和组织 ID 补查榜单候选。已核实的展示名或品牌别名通过 Grafana 表格值映射显示为「名称 · ID」。只有脱敏账号或仍无名称的组织保留 ID。

查证时回读面板 5 和 9 的 `组织` 字段值映射，并选同一时点验证双区已命名值和 ID 回退。面板名称是低频同步的展示快照，新增或改名时回查目录再更新；原始 `org_id`、排名查询及任务数沿 Zeus 的 Prometheus 快照复核。

## Vidmuse 显示别名

2026-11-25 按用户指定，国内生产组织 `871184089599493` 在 06 国内 Top 5 与 07 组织任务量看板显示为 `Vidmuse`。06 通过面板 5 的组织值映射并列显示原始 ID，07 通过 `org_names` 中的 `cn:871184089599493` 同步组织表和搜索选项。更新目录快照时保留该别名。

## 历史累计任务数的数据源查证

2026-11-26 核对 [组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be) 的全历史统计能力。双区 Zeus Admin 的任务列表按创建游标返回，响应无聚合总数。Grafana 可见的旧 Zeus MySQL 数据源对生产双区刚受理任务做主键点查均未命中，也未见适合按组织重复汇总的索引。现有生产日志在早期日期缺少按组织统计所需的受理和公开终态覆盖，不能直接扩窗作为全历史。

**How to apply** 全历史指标以覆盖双区的 Zeus 任务只读汇总源为准，任务总数按受理任务 ID 去重，累计成功率沿现有公开终态定义取成功除以成功、失败及取消的总和。日志累计预览用明确的覆盖起点和查询当前时刻，并跟随生产入口与组织变量。用同一固定截止时间对比相隔一天的看板时间选择，核对结果一致。若以后上线日志累计，另核实保留策略或汇总基线，避免旧日志过期后累计值回退。

## 组织成功率的失败归因

2026-11-26 在美西生产复核 [组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume)。公开终态成功率的分母是所选时段的完成任务。HTTP 受理率按请求结果和请求时间另算，网关日志若无组织 ID 则无法归属。Zeus 的 `MODERATION` 阶段覆盖策略拒绝和审核服务错误，需要沿 Athena 审核结果区分。

先从看板已保存的受理及首次终态查询圈定组织、时间和失败任务 ID。用美西 Zeus 的 `taskId` 索引检索，按 `task_submitted` 取 Job ID，再通过生产 Athena `jobs.request_id` 回查同一批 Zeus ID，核对两路 Job ID 和覆盖率。沿 `jobs.state` 的失败阶段、错误码和审核项及 `job_moderation` 的阶段和结果拆分失败。输入审核的 `prompt:<offset>` 是原始提示词分段，应和 `prompt` 合并计数。汇总按每单一次归因，分开报告输入文字、参考素材、成片拒绝和审核服务错误。审核标签记录供应商判定，复核误判应另查对应回执与样本。交叉核对技巧见 [Inference 并发资源看板查证入口](inference-concurrency-dashboard-entrypoints.md)。

## 2026-11-26 失败分类与任务明细

初版中，[组织任务量看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume) 的 [失败分类](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume?viewPanel=21)和失败任务明细使用同一份 Zeus SLS 查询。按现有概览的受理归属、任务 ID 去重和首次公开终态筛出失败，再按终态阶段拆分数量和占比。分类覆盖整个所选范围；明细保留所选类型最近 200 笔，可用任务 ID 跳到单任务时间线。

对固定窗口按生产入口和组织分别验收。各类之和应等于概览的失败卡，切换明细类型时左侧汇总维持完整范围。看板当前的终态日志提供阶段；审核拦截、审核服务异常和下游执行中的更细原因沿前述 Athena 证据逐任务核对。保留未记录或未识别的阶段，避免丢失失败计数。

### 同日精简逐任务明细

按用户要求移除逐任务表和类型筛选，保留 [失败分类](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume?viewPanel=21)。SLS 只返回阶段与全表合计，去除任务行排序和组织名映射。同一固定窗口回读双区和单组织，分类数与旧查询一致。性能验收分别比较扫描、返回行数和传输体积，单次请求耗时用于观察。

精简版曾在失败分类面板提供国内和海外业务大盘的失败原因链接。Prometheus 的 `openapi_task_failures_total` 含 `reason` 标签，按全部入口流量和抓取区间估算，可观察审核拦截、审核服务不可用、执行与派发失败。按组织精确拆分仍要在 Zeus 首次公开失败事件记录可靠原因，并沿任务 ID 对账。

### 同日表内展示审核与执行原因

[失败分类](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume?viewPanel=21) 初版直接在阶段行下展示审核拦截、审核服务不可用、执行超时和其他执行失败。表中「失败任务数」和占比沿 Zeus SLS 的首次公开失败口径，「全入口估算」沿同生产入口的 Prometheus 原因指标。估算行只在全部组织时有值，阶段合计不再加计子行。单组织按创建归属查阶段数量。

**How to apply** 固定时间范围切换国内、海外以及一个组织，回读阶段合计、四类估算值和单组织空估算。Grafana 11.5 的外连接遇到缺连接字段的空帧时曾清空阶段行；保留仅供连接使用的固定键，在展示前滤除。看板刷新只用 SLS 和 Prometheus。Athena 审核决策日志有 Job ID，缺少组织和平台请求 ID；当前 Athena 生产 PostgreSQL 数据源的元数据核对显示为主库。按组织精确拆原因，沿 Zeus 首次公开失败的结构化事件补齐原因后再复核字段覆盖率。

2026-11-26 抽查双区的执行终态日志，按任务 ID 统计失败原因字段覆盖，再用同一范围分别打开全部组织和单组织，区分没有细类值与阶段统计空白。能够核实的执行子类沿 Athena 前处理错误码、PE 输出与后处理产物登记事件回查。Prometheus 的执行超时沿 Zeus 的到期终态分支解释。

## Athena 参数校验与 Job 前处理失败

2026-11-26 核对 [Athena 建单与查询入口](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/controllers/job.py) 和 [前处理失败入状态](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/preprocess.py)。建单请求校验可返回 400 类业务错误。已建 Job 的不可重试前处理错误可在 Job 状态中保留失败阶段、错误码和详情。用 `INVALID_REFERENCE_MEDIA`、`UNSUPPORTED_INPUT`、`INVALID_REFERENCE_PE_OUTPUT` 等已有结构化值区分素材校验、输入类型和 PE 输出。

Zeus 的 [Job 回调 DTO](https://github.com/world-sim-dev/zeus/blob/dev/modules/infra/src/main/java/co/sandai/zeus/infra/infer/dto/JobStatusUpdated.java) 已接收上述字段。确认任务归属和首次失败时沿 `TaskDispatchStateService` 查映射，再回读 `TaskMetrics` 的公开终态日志。扩展监控时可在已有回调事件中记录稳定的阶段和错误码，复用 SLS 的任务归属。Zeus 受理前拒绝按 HTTP 请求统计；Zeus 已受理的任务若因 Athena 建单拒绝进入公开失败，按提交阶段的任务终态统计。

## 2026-11-26 按组织关联下游执行原因

[失败分类表](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume?viewPanel=21) 的下游执行子行基于 Zeus 与 Athena SLS 日志关联。按现有首次公开失败和创建时组织圈定全量执行失败，再用唯一的 Athena Job ID 匹配前处理或后处理的非重试失败、核对时间，冲突不归因。按任务去重汇总；原因未确认用阶段总数扣除有唯一证据者。审核子类仍沿入口级指标展示。

**How to apply** 回读面板数据源、执行归因查询变量和实际范围上限。验收历史已知样本、固定 24 小时、单组织和相对时间，核验子类与未确认之和等于下游执行。SLS 的 Job ID 全文检索在 Worker 消息里可命中，在结构化素材校验日志中可能漏掉独立 Job ID 字段，后者先按事件索引预筛，再在 SQL 内精确提取 Job ID。用候选终态范围限制扫描，遇到检索条件上限时减少候选数。只在查询时传递候选 Job ID 和终态时刻，保留未知桶，无生产业务库查询或跨区数据投递。

## 2026-11-26 双区任务量汇总和生成受理量排行

**Why**　同一时间范围可以核对国内、海外及双区合计，并按生成受理量查看跨区主要调用组织。受理量按创建请求受理时刻统计去重的生成任务，完成量沿首次公开终态时刻统计。跨入口排名按生产入口与组织 ID 共同区分。比率按双区成功数除以双区完成数。

**How to apply**　在 [07 组织任务量](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-org-task-volume/aaa73be) 展开顶部「国内＋海外 · 任务量汇总与组织 Top 5」。需要核对榜外组织时，在「汇总组织 ID」输入完整 ID 并回车，清空后恢复总量和排行。该输入仅用于双区区块。回读汇总面板的双区 SLS 查询、排行面板复用的结果和失败时合计行的覆盖条件。验收用固定窗口和两区原有面板分别对账，实查榜外、无活动 ID 和清空恢复。收起区块时不发起双区查询，展开时每区一次 SLS 聚合。
