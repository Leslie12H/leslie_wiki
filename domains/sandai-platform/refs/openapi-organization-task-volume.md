---
name: openapi-organization-task-volume
type: reference
created: 2026-11-25
updated: 2026-11-25
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

更新目录名称快照时保留已确认的显示别名。固定同一美西时段，用别名与组织 ID 分别搜索并确认得到同一筛选值，再对照两个看板的表格显示。认证按入口与组织 ID 关联。

## 双区 Top 5 榜单名称映射

2026-11-25 在 [06 的国内、海外 Top 5 榜单](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 补齐组织名称。取当前「组织任务量」看板的组织名称映射，按生产入口和组织 ID 补查榜单候选。已核实的展示名或品牌别名通过 Grafana 表格值映射显示为「名称 · ID」。只有脱敏账号或仍无名称的组织保留 ID。

查证时回读面板 5 和 9 的 `组织` 字段值映射，并选同一时点验证双区已命名值和 ID 回退。面板名称是低频同步的展示快照，新增或改名时回查目录再更新；原始 `org_id`、排名查询及任务数沿 Zeus 的 Prometheus 快照复核。
