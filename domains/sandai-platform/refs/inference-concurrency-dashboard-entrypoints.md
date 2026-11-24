---
name: sandai-inference-concurrency-dashboard-entrypoints
type: reference
created: 2026-11-23
updated: 2026-11-24
tags: [sandai, inference, grafana, concurrency, prometheus]
links: [sandai-api-platform-openapi-quota-entrypoints]
---

# Inference 并发资源看板查证入口

**Why:** 开放平台并发管理要同时看可用推理资源、端到端耗时、已派发任务和租户配额。2026-11-23 用户要求新增看板，并明确要求取数不能给生产数据库带来较大压力，业务数据保持无损。

## 查证入口

- [Inference / 06-并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086)：通过面板查询和实时样本核对当前口径。Worker 查 Athena 的就绪及在线信号和 Worker ID 去重。成功任务 E2E 卡查所选时段的 P95 和 Timer 采样最大值。
- [开放平台业务大盘](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-business-v1)：查看 Zeus 任务快照的 leader、更新时间和阶段标签。代码入口为 `TaskSnapshotReader` 与 `TaskLifecycleStage`。执行阶段可估计在途任务，精确派发占用沿 `TaskDispatchStateService` 的 `SUBMITTED` 到 `FINISHED` 边界核对，包括可能晚于用户可见终态的下游停止确认。
- [OpenAPI 配额入口](openapi-quota-entrypoints.md)：查组织有效覆盖和 Redis 默认值。逐用户预估先核对预估来源及用户与组织的映射。组织 Top 5 使用同一时点的已派发在途数量。

**How to apply:** 先回读目标 Grafana 文件夹的有效权限和看板已保存的数据源。对候选数据库查询只执行元数据查询和不执行语句的 EXPLAIN，核对是否为只读副本、语句超时、访问路径和预计扫描量。2026-11-23 Athena 数据源状态和查询计划不足以支撑看板常驻查询，因此保留 Prometheus 刷新。新增配额或组织维度时，沿专用快照采集入口评估一次采集复用、限时限量和采集陈旧状态。Worker 零值或分子缺失时，超售比留空。

## 2026-11-23 并发快照和分阶段耗时

- 最长队列等待先对照相同时间范围内的队列积压。采集端返回成功且等待值全为 0 仍可能漏掉实际积压的年龄。在推理队列监控中分别核对有效分钟样本数、等待值峰值和队列待处理数。积压存在且等待始终为 0 时，把等待计时当成缺失，沿推理队列 exporter 的年龄解析和标签覆盖继续排查。
- 按用户确认的口径，预计并发取正常开放平台用户所属有效组织的并发配额。继承值从 Redis 全局默认一次读取。有重复有效组织无法判唯一归属时停止更新这一快照。
- 精确在途沿 Zeus `TaskDispatchMapper.submittedPage` 的覆盖索引获取已确认派发的任务和组织。Athena 使用带 group 的请求 ID 批查确认 pending/running，再由同份结果算总量和 Top 5。复查 [Athena 作业批查](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/controllers/job.py) 和 jobs 的复合唯一索引。整批缺记录、状态未知、超时或达到读数上限时，沿快照采集日志和 Prometheus 时间戳判不可用。检查对应部署及监控开关的在线状态。
- 06 的「分阶段耗时」使用国内实时 Zeus 直方图。[五日原表](https://j0yswlgboxz.feishu.cn/docx/H8TMdJsI6oBefWxuWRLcxXvBnHh)保留历史基线。基线用逐任务配对计算 Athena 排队和模型子阶段。实时 Zeus 完成耗时起点是建单。后处理可对照原表的 Worker 上报到公开总间隔，独立水印或审核耗时需再核对各自的计时字段和覆盖。

### E2E 卡和阶段图

用户 2026-11-23 确认关注端到端长尾和最大耗时。实时卡取国内成功任务的 Zeus 建单到首次公开成功。P95 通过 `openapi_task_completion_seconds_bucket` 的区间增量估算。采样最大值沿 `openapi_task_completion_seconds_max` 回查滚动窗口和抓取边界，参考 [Micrometer Timer 指标](https://docs.micrometer.io/micrometer/reference/implementations/prometheus)。当前图以最近 30 分钟样本画 P50 / P95 趋势。遇到有区间总量但走势图空白，比较窗口宽度、实际抓取间隔与每点样本量。

瀑布基线沿五日原表回查同一批阶段齐全任务。用各阶段均值逐段累加，并与同批 E2E 均值对账。不同阶段的 P95 用于各阶段的长尾比较。地区分母、逐日和模型细分沿五日原表回查。

### 06 实时分阶段与后处理计时

用户 2026-11-23 要求看板按所选时间范围查询。全链路时间瀑布仍需逐任务匹配全部阶段，在 06 先用 Prometheus 的 `openapi_task_stage_seconds` 直方图及计数、求和，分别呈现当前可测阶段的样本量、平均、P50 和 P95。验证两个不同时段返回不同分母。历史五日数据沿原表回查。Grafana 多值 Stat 在低面板高宽比下发生文字堆叠时，使用原生 Table 的单行摘要保存列与数值对齐。

后处理沿 `ApiService/services/postprocess.py` 查下发顺序和依赖。水印、输出审核可能并行，逐段累加时要先核对重叠。输出审核可沿 `ApiService/services/moderation.py` 的 `save_phase`、`finish_review` 和晚到回调 guard，核对 `job_moderation.output_review.started_at` 以及 `stage=output`、`status=passed`、`output_review.finished=true` 的最终写入时间。按 Job 主键执行 EXPLAIN 后，小样本点查对齐 Worker 上报和 Zeus 公开成功。独立水印起止和跨系统实时快照仍需采集覆盖。SLS 走 Grafana 内已有数据源时，先检查连接授权与日志库索引，避免把鉴权失败当成日志缺失。

#### Zeus 状态停留与全链路阶段的区别

2026-11-23 回查 06 底部面板。由 `TaskLifecycleRecorder.transition` 在任务离开一个状态时用当前时间减 `stage_entered_at`，事务成功后记录到 `openapi_task_stage_seconds`。底部曲线每点看前 30 分钟，按 `stage` 汇总桶增量估算 P95。阶段对比表按看板所选范围聚合，平均值为耗时总量增量除以样本数增量。成功、失败和取消的阶段转换均可贡献样本，尚未离开阶段的任务还没有该段的完整计时。

`queued` 是 Zeus 派发 WAITING，`executing` 是 SUBMITTED 或旧 Running 状态。后者离开时可先转 OUTPUT_REVIEW，也可直接终结。复查 `TaskLifecycleStage.resolve` 与图例措辞，避免把状态停留解释成固定的“提交到终态”或纯推理执行。Athena 前处理、Worker 排队、模型细分和后处理需沿原表的逐任务事件边界复核。

#### 用实时日志复核完整阶段

2026-11-23 用户确认 06 按飞书原表复现全部阶段，并用所选时段统计持续采集的数据。复核入口为[原表的计时说明](https://j0yswlgboxz.feishu.cn/docx/H8TMdJsI6oBefWxuWRLcxXvBnHh)、上海 SLS 的 `co_sandai_zeus_prod`、`inference-prod` 和 `athena`。用开放平台任务 ID 对齐 `task_submitted` 的 Athena Job，再用实际执行 Pod 和同次运行窗口对齐模型阶段。Athena 建单日志的 Job ID 位于结构化内容，全文搜索可能匹配不到。用派发回执附近的短窗口搜 `job creation completed`，再按结构化 Job ID 对齐。抽查先逐任务用主链路各段对账 E2E，再聚合，并分别验证重试和缺事件样本。保留建单时区、分段样本数及机器池、实际输出时长、输入视频/图片数量的分组口径。

Worker 上报至公开的总区间可用上述日志验证。独立水印和输出审核需要校验各自的开始、结束和是否实际触发，遗漏的事件留空。水印和审核有重叠时用相对同一任务起点的区间展示。实时看板应消费持续生成的监控数据，验收时复核数据源权限和采集延迟，确认切换时段后重新计算。用户约束为监控取数不增加生产库压力，业务数据保持无损。

#### 06 实时瀑布与组织归属

2026-11-23 的线上面板从上海 SLS 关联 Zeus、Athena 服务与 Worker 事件。参考 [06](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086) 的已保存查询。专用 SLS 连接凭据禁用时，检查同项目现有数据源的实际资源权限，按插件的查询级 Logstore 选项尝试只读短窗口。Athena 原始 JSON 可全文命中，但 SQL 普通模式的 `content` 返回 NULL。先用短窗口 `set session mode=scan` 验证 JSON 字段和跨日志库联合查询，监测长窗口耗时、样本覆盖与扫描负担。用一个 Grafana 数据查询共享给明细与各瀑布。时间从所选范围传入，默认最近一小时、五分钟刷新，阶段覆盖在明细可见。

瀑布的偏移以各图命名的零点计算。主链路七段使用同一完整样本组。模型内部使用模型阶段齐全的样本组，GPU 等待、纯模型执行和解码输出包含或重叠其他行。后处理时间按有匹配边界的成功任务计算，水印和审核可重叠。输出审核优先读 Athena `services.moderation` 的 `moderation stage decided`，用 `stage=output`、`status=passed` 与 `duration_ms` 校核，再与 Worker 上报和 Zeus 公开成功对账。水印需独立事件覆盖，缺失留空。

组织维度使用创建请求的 `RequestOutcome.orgId`，经 taskId 关联同一条任务的阶段数据，少量已核验样本具备唯一组织。后续组织筛选沿日志或低频快照查询。保存任务创建时的归属，避免用户转组织后改写历史；组织名称只作展示映射，从授权的现有维表或低频只读快照取得。逐组织的 P95 用该组织的任务样本重新计算。有歧义或缺组织的样本单独揭示覆盖。预计与实际并发仍沿并发快照计量，组织维度不要求在 Prometheus 直方图上展开高基数标签。

#### 用顺序明细读 Worker 与后处理

2026-11-23 调整 [06](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086)。阶段明细按主链路和内部实际边界排，累计、总计和差额集中到末尾。阶段耗时排行与瀑布复用同一查询。排行按各可独立比较阶段的 P95 降序，排除汇总范围和已被输入编码覆盖的输入 VAE。对比长尾时回看每个阶段有效样本数。

Worker 接单到 GPU 开跑止于 `GPU worker started inference at`。Worker 接单到模型准备开始止于模型 `Start: Prepare`。两个累计耗时共享起点，核对差距时按任务将后者的终点减前者的终点，再计算分位数。模型总计自 `Start: Prepare` 至 `Step5: Post Process Done`，覆盖输入编码、基础及超分降噪、VAE 解码。模型结束到产物交付沿模型结束至 Worker 上报核对。Worker 上报的生成计时可能涵盖接单后等待 GPU，Worker 其他耗时沿接单到上报实测区间减上报计时。主链路后处理从 Worker 上报算到首次公开成功，包含交接和输出公开；水印与输出审核是这个区间里的子项。

#### Athena 接单前与 Worker 内排队

2026-11-23 查证 [06 的两层排队](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086)。Athena 队列从切片就绪到 Worker 接单。Worker 内排队从同一 Job 的 `task started, running tasks` 到 GPU 实际开跑。对长等待从 [Athena Worker 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 回查同 Pod 的前单 GPU 开始和 `Step5: Post Process Done`，用前单模型结束而非前单上报给交接对时。在 S5000 和 5090 的同次长尾抽查均出现接单时 `running tasks: 2`、前单覆盖几乎全部等待的情形。用同 Pod 的忙碌区间解释接单后长尾。判断派发是否有空闲目标还需要当时的可调度槽位和路由记录。

主链路显示「后处理（水印 + 审核）」，采样时间沿 Worker 上报到公开成功，可能含等待、交接与公开。排查趋势先看主链路瀑布上方的成功任务 P50/P95 图，数据仍来自 Zeus 30 分钟滚动直方图，从建单到公开成功。瀑布从开放平台创建请求开始。

#### 快照切换与共用推理池的口径

2026-11-23 复核 [06 的版本历史](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086)。实际并发卡从旧 `openapi_tasks_inflight{stage="executing"}` 切到 `openapi_concurrency_dispatched`，旧采集在线而新分组没有序列时会显示暂无生产快照。切换前用实时查询分别验证 gauge、成功时间和 leader，区分未启用、采集失败、超时和业务零值。在旧来源上标明 Zeus 在途估算口径。

Athena `jobs?request_ids=` 批查走全量任务详情。核对 `JobService.list_jobs`、`build_job_for_query` 和 `build_artifact_inputs_for_query`，每条有素材或产物引用的记录还可能查产物并刷新 URL。只读调用也会在后端放大读数，监控需优先使用已有状态流或仅投影状态的批量查询。单条漏返回或超过上限会让整轮精确快照不发布，应单独说明状态和覆盖。

Worker 数属于共享推理池。用户任务 E2E 可按 Zeus 入口地区及创建时组织筛选，筛选范围与共享容量保持区分。全池超售比的需求侧先覆盖所有入口并核对组织去重，再除共享 Worker 数。

#### 组织筛选与全体指标

2026-11-23 更新 [06](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086)。在「分阶段耗时」首个面板检查组织选择，核对同一固定时段切换组织时区内趋势、瀑布、排行和明细跟随选择，以及顶部全体组织的 E2E 和并发指标不受影响。局部选择通过 Grafana 数据链接更新隐藏的 `org_id`，列表从当期成功任务的创建日志取组织，留意无组织归属和时间窗口上限。推理 Worker 继续看共享池，国内与海外 E2E 沿各自入口。海外源可在 [海外 E2E 看板](https://grafana-cn-8t84id9nh01.grafana.aliyuncs.com/d/openapi-business-v1?orgId=1&var-environment=prod-us)复核。合并显示前查 06 所在工作区的授权接入和区域覆盖。

实际并发采用精确快照优先及带来源的 Zeus 在途估算回退。精确采集复查 [Athena #856](https://github.com/world-sim-dev/athena-admin/pull/856) 的带项目和 group 状态投影，以及 [Zeus #520](https://github.com/world-sim-dev/zeus/pull/520) 的限量、超时、保留最近完整结果和失败状态。Athena 先发布，再在 Zeus 启用采集。核对快照状态、采集新鲜度和 06 的实际来源后验收精确占用、Top 5 和预计并发。

#### 平台非终态并发与美西 SLS

2026-11-23 用户确认并发按开放平台公开状态计量。排队、执行、输出审核等首次请求在终态前均计入，公开成功、失败、取消及终态后复审排除。看板实际值复用 `openapi_tasks_inflight_count`，只收新鲜 leader 快照。Top 5 在同次 `TaskSnapshotReader` 扫描投影组织 ID，最多发布五条序列并清退掉榜指标。无组织归属的任务仍计入总数。查 [Zeus #520](https://github.com/world-sim-dev/zeus/pull/520) 的当前变更及发布状态。原 Athena 方案见已关闭未合并的 [#856](https://github.com/world-sim-dev/athena-admin/pull/856)。

海外日志沿 [美西 Zeus 生产 SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/co_sandai_zeus_prod?slsRegion=us-west-1)验证。06 工作区的集成列表筛选只列已发现的地域。新建 SLS 数据源表单可选「美国（硅谷）」及指定项目和 Logstore，需要专用 RAM 只读凭据。更改 RAM 权限遇到绑定手机验证时，由账号持有人在官方页面完成。保存后对照所选入口的生命周期事件、组织归属和 Worker 日志覆盖，确认每个图的实际数据源及缺失阶段，再发布地区切换。SLS 连接沿阿里云授权路径使用，无需回查生产库。

#### 并发采集开关与快照故障边界

2026-11-23 审查 [Zeus #520](https://github.com/world-sim-dev/zeus/pull/520)。`BusinessSnapshotConfiguration` 用同一默认关闭开关控制 Top 5 和预计并发。Top 5 随既有任务扫描，只增加组织 ID 投影及内存汇总。预计并发新增组织、用户与配额联查，并读取继承的 Redis 配置。两类采集的上线成本不同，核验开关、目标规模与真实 SQL 扫描量后再启用。SQL 返回行数上限与数据库扫描量分别核查，先用不执行查询的 EXPLAIN 和既有指标量化。

`BusinessSnapshotCollector` 单线程依次运行各组。联查的语句超时不包括取数据库连接和读 Redis，依赖变慢时可以延后其余快照。失败保留上次成功时间并按原间隔重试。核验 `openapi_snapshot_collection_seconds`、`openapi_snapshot_failures_total` 及 `openapi_snapshot_last_success_timestamp_seconds`，确认任务组仍新鲜，预计组过期时超售比留空。检查用户量超上限、双活组织归属等整轮失败条件。必要时分开启用 Top 5 和预计并发，避免把榜单上线绑在新增数据库读取上。

#### 预计并发隔离与美西只读主体

2026-11-23 [Zeus #520](https://github.com/world-sim-dev/zeus/pull/520) 将 Top 5 和预计并发拆为默认关闭的独立开关。预计快照的数据库与 Redis 读取走独立执行器，最多一轮在途，原采集线程只接收已完成且属于当前 Leader 任期的结果。超过扫描预算保留上一轮，沿面板新鲜度观察空值。预计配额聚合把主键排序后的组织原始行上限放在联查之前，数据库只返回一行。隔离 MySQL 用合成数据证实组织主键扫描及两次主键点查的计划。生产启用仍要核对实际 `zeus_magi` 的计划与规模，避免用旧 `zeus` 数据源的验证替代。

美西 SLS 可从源控制台查看。确认 [只读 RAM 策略](https://ram.console.aliyun.com/policies/detail?policyType=Custom&policyName=sls-read-zeus-inference-prod) 后还要检查授权管理是否有 Grafana 专用主体，以及 06 工作区是否保存了美西数据源。RAM 报 `ram:CreateUser` 无权限时，由账号管理员用现有或新建的专用主体完成绑定，凭据只在官方配置页录入。验收分别验证日志读取、成功事件/组织字段以及选中海外时的面板实数。

#### 复用已有 SLS 凭据的判断

2026-11-23 复核 [06 工作区](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086)。`/api/user` 只确认当前 Grafana 登录人。沿目标面板的数据源 UID 查询 `/api/datasources/uid/{uid}`，已有上海 SLS 连接的 `secureJsonFields` 标注已配置访问密钥。这个响应不返回密钥值或其 RAM 用户归属。不要按登录人或工作区名推断数据源凭据归属。

如已有 Grafana 专用 RAM 用户，由数据源管理员沿原配置来源确认主体，追加 [美西只读策略](https://ram.console.aliyun.com/policies/detail?policyType=Custom&policyName=sls-read-zeus-inference-prod)，再用该身份在同工作区配置独立美西数据源。无需新建 RAM 用户。上海源保留，不能把上海的项目和 Endpoint 当成美西连接。若已有 SLS 详细审计，按 [SLS 服务日志字段](https://help.aliyun.com/zh/sls/log-types) 的请求方字段复查主体。2026-11-23 同项目默认详细日志库查询没有找到记录源，此路径未提供可确认的归属。

#### 从集中 SLS 审计确认 Grafana 调用主体

2026-11-23 对现有上海 SLS 数据源执行短窗口计数，在 [上海集中详细日志](https://sls.console.aliyun.com/lognext/project/log-service-1552113873580453-cn-shanghai/logsearch/internal-operation_log?slsRegion=cn-shanghai) 按源 Project、Logstore、探针标记和请求起止秒匹配 `GetLogStoreLogs`。详细日志可放在集中 Project，源 Project 缺 `internal-operation_log` 不代表没开审计。普通 SQL 下未建索引的 `Query` 可能为空。先缩小搜索范围，再用 scan 模式读取标记及 `InvokerUid`、`CallerType`。只对唯一且匹配的记录追认主体。字段定义参见 [SLS 服务日志](https://help.aliyun.com/zh/sls/log-types)。

用现有数据源确认的 RAM UID 打开 RAM 用户详情或在 [美西只读策略](https://ram.console.aliyun.com/policies/detail?policyType=Custom&policyName=sls-read-zeus-inference-prod&activeTab=Permission) 的授权主体搜索框查对应用户。运行后台由凭据主体鉴权，Grafana 登录会话另行鉴权。若 RAM 会话过期，UID 可直接供管理员查人，密钥不出控制台。后续打开 06 只对已完成绑定及美西数据源配置做读回和实数验证。

#### 美西策略绑定回读与密钥验证

2026-11-23 在 [美西只读策略授权管理](https://ram.console.aliyun.com/policies/detail?policyType=Custom&policyName=sls-read-zeus-inference-prod&activeTab=Permission) 回读已有授权主体，并与 [审计已确认的 RAM 用户详情](https://ram.console.aliyun.com/users/detail?userId=205798887368878784) 对齐。Grafana 托管工作区「云服务集成 → SLS 日志服务」的新建表单可预选美西生产项目及 `co_sandai_zeus_prod`，凭据字段在该工作区是必填。账号登录和为已有用户创建 AccessKey 的手机验证是独立两步。若为接入生成额外密钥，先核对既有活动密钥，保持当前连接，并将一时显示的凭据直接填到核对过的配置表单。验证步骤不需要把密钥或验证码写入对话、终端或知识库。

添加并读回数据源后，先用聚合计数验证授权和海外事件覆盖，再按公开成功、派单及组织字段判断可展示阶段。旧格式日志关注 `content` 与已有上海结构化字段的区别。位于共享推理池的 Athena 和 Worker 阶段需用匹配的任务及事件核验，缺样本时标注缺失。

#### 美国入口接入与阶段样本边界

2026-11-23 在 [06 海外分阶段明细](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086?var-entry_region=us&viewPanel=120) 回读已接入的 [美西 SLS 数据源](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/connections/datasources/edit/81adc62632cb93c115265427976eada0)。按 `entry_region` 切换国内与美国生产 SLS，组织选择只影响耗时区。用相同固定时段切换国内、海外和一个组织，复查创建样本数、Athena 阶段与面板错误。顶部指标沿已保存的查询核验其原有范围。

美西 Zeus 有旧格式文件日志，`content` 前 23 字符为 UTC 事件时间。先将时间与 SLS 采集时间对账，再用已受理请求的 `elapsedMs` 还原请求起点，用 Zeus 任务 ID 得到建单时间。美西创建段以已受理的有效任务为样本，国内继续以公开成功任务为准。排查缺失阶段时，在美西源短窗口核对 `task_submitted` 和 `task_finished` 的采集，并校验目标 Project 是否有 Athena 和 Worker 事件。2026-11-23 验收时美西只有创建段有样本，其余阶段显示缺失，E2E 趋势显示无样本。需要美国全链路时，沿实时派单、共享推理和公开成功事件按任务关联，样本不足保持明确空值。

#### 海外入口与共享推理日志的关联

2026-11-23 从美西 Zeus 受理日志抽样，按同一 Zeus `taskId` 查派单和终态。`task_submitted` 带 Athena Job ID，`task_finished` 带 `result=success`。再按 Job ID 查上海 `inference-prod` 和 `athena`，核对 Athena 前处理、Worker 接单、GPU 开跑和 Worker 上报。业务入口归属看 Zeus，推理阶段看共享 Athena Job，不能用入口地区代替推理地区。端点配置和美西独立项目回调见 Zeus 仓库 `deployment/magi/structure/{prod-cn,prod-us}/policy.json` 和 `deployment/magi/README.md`。

美西 SLS 在 2026-11-23 同一窗口以 `task_finished` 或 `task_submitted` 作全文检索预过滤返回空，按具体任务 ID 或 `taskId` 检索能找到原始生命周期事件。先按 ID 验证检索命中，再用 SQL 解析事件、成功状态和时间。`jobId=0` 是占位，使用真实派单 Job ID 关联。[06 海外 E2E](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086?var-entry_region=us&viewPanel=107) 的查询可用于复查检索和样本口径。

[06 分阶段明细](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086?var-entry_region=us&viewPanel=120) 中搜索修正只能补回 Zeus 自身的阶段。检查数据源和 `athena_events`、`worker_raw` 的入口条件判断当前覆盖。SLS SQL 的跨 Logstore JOIN 限于同一项目，[StoreView](https://www.alibabacloud.com/help/en/sls/dataset-storeview-overview) 也不能跨境查询。海外中间阶段按美西 Zeus `taskId` 关联上海 `job_id` 后再按入口、组织和成功任务聚合，优先从已有日志关联。

#### 海外实时分阶段的取数与验收

2026-11-23 在 [06 海外阶段明细](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086?var-entry_region=us&viewPanel=120) 接入海外分段。回读面板 120 和以 `phase_us_` 开头的隐藏查询变量。先按所选时间及创建时组织查美西公开成功任务，使用 Athena Job ID 关联上海 `inference-prod` 与 `athena`。两地现有只读 SLS 在 Grafana 里传递查询结果，关联只传 Job ID 和计时字段。SQL 校验时间范围和组织，缺边界的阶段留空。瀑布、P95 排行和顺序明细共用阶段结果，主链路瀑布按阶段齐全的同批任务统计。

长窗口使用扫描 SQL 横跨多个热日志库可能只返回部分事件。分别将 Athena 和 Worker 的时间事件用各自 Logstore 的索引预筛选，再比较同一时段的成功任务数、Job 匹配数、逐阶段有效样本与瀑布的完整样本。对照固定一小时、六小时、单组织及国内入口，再查相对最近一小时是否刷新。现有水印计时留在 Worker 上报后，只有同一 Job 的已验证起止事件落入 Worker 上报至公开成功区间才有独立耗时。没有该事件时看后处理总时长和有样本的输出审核，不拿其他阶段差值填水印。

#### 海外六小时关联容量与回退

2026-11-24 在 [06 海外](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency/06-e5b9b6-e58f91-e8b584-e6ba90-e7aea1-e79086?from=now-6h&to=now&var-entry_region=us&refresh=5m) 复现低量验收通过后高量时阶段图空白。看板可单独回查 E2E；若 E2E 有数、阶段无数，检查 `phase_us_tasks` 与 `phase_us_athena` 返回值。对同一请求时段查成功任务量、Job ID 覆盖和序列化大小。旧方案容量保护返回空值，后续图都会空白。SLS GetLogs SQL 的长度上限及同 Project JOIN 约束见[阿里云文档](https://www.alibabacloud.com/help/en/sls/dedicated-sql/)。通过限制任务批量、增设「阶段统计范围」明确实际时段及两种任务数，避免将短窗口阶段 P95 解读为整个所选时段。

长窗口高量持续扩展时，可在独立监控链路按 Athena Job ID 提前关联既有日志，逐任务保留入口、组织、阶段耗时与覆盖，并处理重放和迟到事件。Grafana 读取归并后的结果后按所选窗口计算分位数。比较变更前后三个阶段查询耗时、六小时任务分母、覆盖、刷新负担及监控数据新鲜度。该取数升级需在落地后核验，当前看板回退参考面板 120、131 和隐藏查询变量的已保存配置。

#### 跨境投递停用与按 Job ID 查证

2026-11-24 原生 SLS 定时 SQL 从美西选华东 2 时，控制台明确要求数据跨境合规承诺。用户要求停止该方案，未发布跨区任务。上海项目的空监控库 `inference-phase-inputs` 和 `inference-task-phases` 是尝试期间建的隔离资源。查当前看板版本及云端作业启用状态，06 的取数继续沿本页上节，完整六小时的预关联和撤回退未验收。

在上海 `inference-prod` 与 `athena` 用此前已关联的海外 Job 做短窗口复核。可看建单和执行事件，抽查日志未见可靠的海外入口或组织标签。按单任务钻取使用 [05 单任务时间线](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-job-detail) 的 Job ID 输入，海外自身 E2E 使用当地的开放平台看板。若组织允许现有 Grafana 两地只读查询，可在各区先缩小为逐任务的必要字段，再在查询时按 Job ID 匹配；它不产生跨区持久副本，但仍需要查询路径的数据使用授权。若只允许区域内处理，则分别呈现入口 E2E 和共享推理阶段，不以两个聚合值反推同一组织的全链路分位数。

#### 海外六小时分阶段趋势的只读复算

2026-11-24 用看板已有 SLS 通路，从美西 Zeus、上海 Athena 和上海 Worker 分别查询最多六小时的必要计时字段。先以 Zeus 的成功和创建时组织定样本，再用 Athena Job ID 关联，按公开成功时间每 30 分钟计算各阶段 P95 和有效样本数。仅在查询时关联，不需要生产库、应用发布或跨区 SLS 定时投递。取数验证入口见 [06 海外](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?from=now-6h&to=now&var-entry_region=us)。

验收时对同一固定窗口核对成功任务分母、两侧 Job ID 关联覆盖、阶段有效样本数以及组织筛选。首尾桶可以不足 30 分钟，低量桶需要同时看样本量；无独立阶段事件保留空值。分阶段曲线需要先逐任务关联再算分位数。三路并行探针时间用于衡量取数路径，面板加载需另外测量，检查查询是否被数据源串行处理以及多帧 JOIN 是否造成漏数。

#### 国内预计并发的账户状态和组织归因

2026-11-24 核对 [Magi 国内部署](https://github.com/world-sim-dev/zeus/actions/runs/45320457134) 对应 [采集源码](https://github.com/world-sim-dev/zeus/blob/8a5c0c011ff886c4ef675261e45125ff2d72d14f/modules/domain/src/main/java/co/sandai/zeus/domain/observability/snapshot/ConcurrencySnapshotReader.java#L21-L56) 和 [06 的预计并发卡](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=4)。面板短单位加零位小数会把原始的四位数四舍五入为 k。对图中数字先查面板的原始 Prometheus 结果与 `expected_concurrency` 的快照成功时间。

预计快照按正常账号拥有的 ACTIVE 组织累加并发覆盖值，无覆盖时用当轮全局默认。状态过滤与按近 7 天、30 天发任务的活跃度是不同口径，查部署源码确认有没有附加条件。预计指标只上报总量，未保存这轮贡献组织的 ID 和份额；并排的 Top 5 用任务组的非终态快照，无法反推预计总额的组成。

#### 06 发布分阶段 P95 趋势

2026-11-24 在 [06 分阶段趋势](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?from=now-6h&to=now&var-entry_region=us&var-org_id=all&viewPanel=132) 发布原生 Grafana 面板 132，位置在 E2E 趋势与阶段统计范围之间。趋势读取同一时间窗的 Zeus、Athena 与 Worker SLS，在 Grafana 按 Job ID 关联，以公开成功时间每 30 分钟分桶。右轴为各桶成功任务数。入口和组织筛选只影响对应的阶段统计。阶段定义、数据源和维护设置回读面板本身。

验收先查相对最近六小时的时间跨度、Zeus 返回任务数与分桶数，再固定同一窗口切组织并抽查国内入口。首开渲染时长和单独的取数探针时长分别测量。趋势的六小时取数和瀑布的范围提示使用各自口径，精确范围见各面板。若图库插件把同数据源的两路查询合在一个请求，优先测上海 Athena 和 Worker 的该请求耗时。

#### 活跃组织预计并发的窗口和索引

2026-11-24 将滚动口径、配置名和边界样例记录在 [Zeus #523](https://github.com/world-sim-dev/zeus/pull/523)。用户希望排除窗口之外注册或未受理过任务的组织，并让起始日与滚动天数可配置。验收从 PR 查最新源码与时区口径，从两地 Prometheus 回读同口径且新鲜的活跃配额后切换 06 的预计并发和超售比。

查 SQL 时关注 `ORDER BY ... LIMIT 1` 是否在取首条之前排序。2026-11-24 合成 MySQL 对照中，原写法虽然命中组织与派发状态索引，仍为旧任务做了排序读取。存在性判断用时间窗口内的 `EXISTS`，并以隔离样本核对索引条件、重复探测次数和首条命中停止。生产口径切换前确认实际目标索引和异步采集耗时，避免以索引名或 LIMIT 代替扫描量的验证。
