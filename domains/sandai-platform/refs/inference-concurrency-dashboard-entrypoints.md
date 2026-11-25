---
name: sandai-inference-concurrency-dashboard-entrypoints
type: reference
created: 2026-11-23
updated: 2026-11-25
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

#### 上海 SLS 并行与 Worker 日志预筛选

2026-11-24 优化 [06 趋势面板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?from=now-6h&to=now&var-entry_region=us&var-org_id=all&viewPanel=132)。Grafana Mixed 原先按同一个上海数据源引用将 Athena 与 Worker 放进一条请求。Worker 使用隐藏常量 `phase_worker_sls` 引用同一个既有上海数据源，让 Mixed 分两个请求并行发出。以浏览器网络实际解析的 UID、子查询起始时间及响应为准。Worker 在竖线前筛接单、完成、GPU 启动和阶段耗时四类日志，竖线后的计时与去重规则保持原口径。

Athena 输出审核的日志全文检索加状态词曾漏事件，保留原有审核事件检索和 SQL 内字段过滤。变更前后用同一个固定六小时窗口逐 Job 比对有效字段，另验收相对六小时、同窗组织筛选和国内入口。区分上海请求耗时和打开面板到渲染的耗时。查询仍走既有 SLS，无业务数据库读取或跨区投递。

#### 单任务 Athena 前处理长尾与提示词增强

2026-11-24 按 Zeus 任务 ID 和 Athena Job ID 对账时，在 Athena 建单至切片就绪的长窗口查到多次提示词增强启动。沿上海 `inference-prod` 的 `prompt_enhancement.enhance_v2` 日志，以结构化 `job_id` 核对 `Enhancing with provider` 和 `reference PE output accepted`。前处理整段包含提示词增强；单次调用失败、超时或重试原因需要同 Job 或同次调用的异常事件。只有两条启动事件时，报告其间隔和已确认的成功时间。

Worker 等 GPU 的归因另外对齐同一 Pod 前单的模型结束及本单实际 GPU 开始，避免用前单上报当作 GPU 空闲时间。各段从实际日志边界计算；结果审核使用独立审核时长，给 Worker 上报至审核开始、审核通过至公开成功留出交接间隔。没有水印起止日志时，独立水印时间留空。先按日志索引缩小事件和时间范围，再在 SQL 内精确匹配结构化 Job ID。

#### 成片放行复核与 Green 原始标签

2026-11-24 复核成片出现疑似公众人物的案例。先按 Zeus `task_submitted` 核对 task ID 与 Athena Job ID，再看 `inference-prod` 中 `stage=output` 的审核启动、结果、耗时及 Zeus 公开成功。Athena 记录的 `passed` 为本地汇总状态，供应商服务代码、逐帧标签和风险等级需要读取 [阿里云视频审核结果](https://yundun.console.aliyun.com/?p=cts#/videoReview/resultQuery/cn-shanghai)。

优先用 Green `TaskId` 或 `DataId` 做精确关联。应用日志缺供应商 ID 时，按 Athena 送审时刻缩到秒级查候选，再核对供应商预览、片长、任务和审核事件。只靠时间不足以认定同一成片。区分实际 `ServiceCode` 与画面 `ImageService`，同一生产账号可能同时存在通用和 VidMuse 模板。确认 `RiskLevel`、截帧数和标签后，回查 [Athena 风险等级判定](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/clients/green.py#L137-L149)。`none` 和 `nonLabel` 表示适用规则下未检出风险，无法据此确认人物身份或断定未命中的算法原因。记录结果字段和入口，避免保存或转贴签名视频 URL。

2026-11-24 复核一条美西任务时，用源提示词精确匹配文本回执，并用去掉签名参数的同一成片对象路径匹配视频回执。视频逐帧可命中「领导人」标签，同时整体风险等级仍为 `low`。排查放行时先核对聚合等级，再对照[对应版本的 Athena 判定](https://github.com/world-sim-dev/athena-admin/blob/3948f4850b37423497e8965c2ca6567f10d5316c/ApiService/clients/green.py#L137-L149)。该版本按 `medium` 或 `high` 拦截视频，单有逐帧命中只证明检测结果。

#### 素材编码失败和输入自定义词库拒绝

2026-11-24 复核受理后失败的两类样本。先沿 Zeus 派单回执确定 Job ID，再查上海 `inference-prod`。输入已通过但没有 Worker 事件时，查 `preprocess_handler rejected invalid input` 的 `reason`，它会带输入编号、素材类型和校验限制。参考视频的校验包括独立音轨编码，文件容器或画面编码正常也可能因 PCM 音轨失败。支持范围以当次日志和部署校验为准。Zeus 公开查询沿 [参考素材错误投影](https://github.com/world-sim-dev/zeus/blob/main/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/AthenaReferenceMediaFailure.java) 返回 `invalid_reference_media`。

Athena `stage=input, item=prompt, reason=C_customized` 表示提示词命中 Green 自定义词库。去 [文本审核结果](https://yundun.console.aliyun.com/?p=cts#/textReview/resultQuery/cn-shanghai) 看实际 `customizedWords` 和 `customizedLibs`。并行送审可能在同一秒出现多条文本结果；回查任务事件、秒级候选和标签一致性，缺单条关联 ID 时不要指认某条具体 RequestId。

#### Grafana 精确任务日志与同 Worker 交接

2026-11-24 在美西生产任务 `874043806303557` 与上海 Athena Job `4873764` 的计时查证中，Grafana SLS 原始日志查询只返回最新的一条终态事件。对同一任务 ID 和时间范围使用全文预过滤加 `set session mode=scan; SELECT content, __time__ FROM log …`，回读了完整的受理、派发和终态三条。核对美西应用事件时间时，读取 `content` 行首 UTC 时间。用受理事件的 `elapsedMs` 还原请求开始时间。

Worker 的 `inference finished in …` 从 Worker 内部较早的事件计时，可能包含排队。查单次任务时应分别读取 Worker 接单、`GPU worker started inference at` 消息内的实际开始时间、首次 `encoding chunk` 及原片上报。对同一 Pod 的前单用 `__tag__:_pod_name_` 查询交接点。该次前单 `4873741` 的 GPU 区间覆盖目标单进入 Worker 到 GPU 开跑的等待，前单原片随后才上报。 [05 单任务时间线](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-job-detail)

#### 独立参考音频过短在 Worker 编码阶段拒绝

2026-11-24 在单任务排障中，开放平台已受理，Athena 已完成预处理并派发。GPU Worker 进入 VAE 参考输入编码后，`check_reference_limits` 抛出 `Reference standalone audios run 2-30 s each, got 0.07 s`，同一 Job 的最终日志记为 `UnRetryableError`，Zeus 记 `stage=EXECUTION`。这条路径会先经历待执行时间，再在真正开始推理时很快失败。

用 Zeus 的 `task_submitted` 定 Job ID，用 Worker 接单确定 Pod 和开跑秒级窗口。若只按 Job ID 检索拿不到栈，在该 Pod 的短窗口找原始 `GPU worker inference failed`，再用带 Job ID 的终态异常核对是否为同一任务。限制口径以当次部署报错为准，区分推理实际读到的时长与源素材时长；日志无素材序号时不指认具体附件。入口见 [上海 Worker 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai)。

#### 参考视频的画面时长与抽取音轨时长分开核对

2026-11-24 通过国内生产 Zeus 单任务素材详情回读该失败案例，调用方素材只有图片和视频，音频来自视频内的第一条 AAC 音轨。[Athena 视频准备](https://github.com/world-sim-dev/athena-admin/blob/833aea1eb92c30ffcd0c75b6100308bfb7191213/ApiService/preprocessors/reference_media.py#L295-L373) 输出不带音轨的参考视频并单独抽取 WAV，[参考素材准备](https://github.com/world-sim-dev/athena-admin/blob/833aea1eb92c30ffcd0c75b6100308bfb7191213/ApiService/preprocessors/reference_prompt.py#L221-L261) 把这条派生音轨追加为音频输入。Worker 的独立音频校验覆盖此派生素材。

排查时先按原任务投影对齐素材清单，再用 `ffprobe` 分别读容器、视频流和音频包。容器 9.458333 秒的样本只有三个 AAC 包，包时间戳都为 0，单包 1024 个采样点。头部音频流时长 0.023220 秒。按生产命令 `-map 0:a:0 -vn -af aresample=async=1:first_pts=0 -c:a pcm_s16le` 抽轨复算，WAV 有 3072 个采样点，44100 Hz 下为 0.069660 秒，与 Worker 的 `0.07 s` 一致。用解码后的抽轨样本核对 Worker 判定；原始文件已经只有极短音轨。查证只保留轨道元数据和路径指针，临时签名地址取证后清除。

#### 全局实际超售比

2026-11-24 在 [06 并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?var-entry_region=us&var-org_id=all&viewPanel=133) 发布「全局实际超售比」。分子复用全局实际并发卡的国内与海外有效任务快照，分母复用共享池可推理 Worker。两地快照缺一时显示对应缺失状态，Worker 数不可用或为零时不计算倍率。入口地区选择用于入口耗时，倍率解释为全局任务数对共享池。

验收从线上读取面板定义，使用同一时点执行国内、海外、Worker 及 Grafana 表达式，对照 `（国内实际 + 海外实际）÷ Worker`。保留预计并发分子的既有「全局超售比」，可在相邻两张卡对照当下占用与配额压力。

### 启用双区活跃预计并发

2026-11-25 回读两地 ACK 后确认，预计并发总开关已开，活跃窗口参数需要在生产 ConfigMap 的 `dispatcher.properties` 单独配置。[Zeus 活跃配额口径](https://github.com/world-sim-dev/zeus/blob/c8482c6229cbf6a1b830bda113dd9c3b45244a4a/docs/openapi-task-dispatch.md#L78-L91) 给出配置键、滚动窗口和采集节奏。[Magi 环境拓扑](https://github.com/world-sim-dev/zeus/blob/dev/deployment/magi/targets.json) 给出两地配置项和命名空间。

**Why:** 代码发布或原全量快照正常更新时，活跃快照仍可能没有注册。Dispatcher 通过 `subPath` 挂载配置文件，保存后需要新 Pod 加载。两地 Dispatcher 为独立部署，重建应逐区进行，降低两地派单同时暂停的风险。

**How to apply:** 逐区回读目标文件和两项活动窗口参数，按获批范围补缺。走 [Magi 维护](https://github.com/world-sim-dev/zeus/actions/workflows/magi-maintenance.yml) 的同镜像 restart，只选择 Dispatcher。核对部署就绪、任务快照恢复，及 Prometheus 的 `openapi_concurrency_expected_active`、对应 `expected_concurrency_active` 组的采集成功时间和错误计数。一地恢复后再处理另一地。两地新快照均有效后，先预执行 [06 看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 的全局及入口预计查询和倍率表达式。用同一时点的两地活跃配额之和除一次共享池可推理 Worker，并回读保存版本；一地缺失或 Worker 为零时显示不可用。

### Zeus 待派发与 Athena 在途分开统计

2026-11-25 更新 [06 并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 的全局与两地入口任务卡。Zeus 待派发对应 `openapi_tasks_inflight{stage="queued"}`，包含尚待确认 Athena 受理的派发尝试。Athena 在途使用 `stage="executing"`，以 Zeus 记录的已派发状态为主并兼容旧 Running 状态，包含下游排队。单独分类的输入审核、前处理、输出审核保留在首次非终态汇总口径，独立计数适用范围以当前面板说明为准。

**Why:** Zeus 等待派发会扩大积压，组织配额则按 Dispatcher 已取得的 Redis 槽位限制新增派发。执行阶段快照观察 Athena 侧任务压力，也受 Zeus 回执和状态写回时效影响。Top 5 的组织指标没有阶段标签，榜单标为在途组织。查 [阶段映射](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/task/metrics/TaskLifecycleStage.java) 与 [派发规则](https://github.com/world-sim-dev/zeus/blob/dev/docs/openapi-task-dispatch.md)。

**How to apply:** 对每个入口只用新鲜任务快照，阶段值和同实例总量的采集时间需相同。健康快照缺某个阶段时该阶段为零，快照缺失时保留缺失状态。按同一时点对照各阶段之和与任务总数。全局 Athena 在途倍率以两地执行阶段之和除一次共享 Worker 数，预计并发和预计超售比沿活跃配额取数。由 [Athena 在途倍率](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=133) 核对表达式。

#### E2E 趋势切换时间范围后的样本截断

2026-11-25 在 [06 的成功任务 E2E 趋势](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=107) 复现同一时间点缩短所选范围后 P95 偏低。面板 107 的描述按公开成功时间做固定 30 分钟滚动统计，但 SQL 先将 `created_at` 限制在看板选择区间，且 SLS 查询外层范围随时间选择器缩短。短窗会过滤区间前建单但区间内完成的任务，慢任务优先被排除。

复核时固定地区、组织和共同结束时间，比较同一 5 分钟刻度的 P95 和样本数。按该点之前 30 分钟的公开成功时刻取样，再统计建单早于短窗起点的任务数与它们的时长。若要使同一完成时间点可比，数据读取需覆盖最早可见点前 30 分钟，并按需向前读组织归属日志。用于聚合的样本以完成时间窗口选择，显示范围独立裁剪。回查面板目前保存的 SQL 后再判断修正是否生效。

#### 5 分钟完成分桶和 30 分钟滚动的展示口径

2026-11-25 对国内入口同一批首次公开成功任务，按完成时间复算 5 分钟独立分桶和 30 分钟滚动分位数，样本无需在显示区间内建单。16:35–16:55 的 5 分钟 P50 持续回落，P95 仍受同时完成的二十分钟以上任务影响。看长尾变化前应同时对照样本数和长任务占比。

复核 [成功任务 E2E 趋势](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=107) 时，用 5 分钟独立完成桶观察变化，30 分钟滚动作为平滑参考。图例或提示中写清窗口并显示分母。当前未结束分桶显式标注。时间选择器只裁剪显示点，固定同一刻度检查分位数和样本数。若需观察新进任务的体验，另看建单批次，并在窗口成熟后结合终态覆盖率解释完成任务的耗时。

#### 单组织待派发积压、派发速率与实际占槽

2026-11-25 在国内入口核对 libtv 的 [任务与并发面板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=7)。该面板的 Zeus WAITING 是入口整体，组织 Top 5 是组织的首次非终态总数，包含已派发与尚未派发。量化某组织积压先按受理日志中的组织 ID 关联任务的派发回执和首次公开终态，再同刻比较队列快照。受理未见派发是日志重建，仍可能含前处理、审核或未采到回执的任务。

按 Zeus Admin 的有效组织配额，同一时点以部署所用 Redis 的 `SCARD` 读实际占槽，先核对地区、工作负载和镜像。后续回查 [该次部署的 TaskDispatcherRuntime](https://github.com/world-sim-dev/zeus/blob/c8482c6229cbf6a1b830bda113dd9c3b45244a4a/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/TaskDispatcherRuntime.java#L153-L187) 和 [TaskDispatchWorker](https://github.com/world-sim-dev/zeus/blob/c8482c6229cbf6a1b830bda113dd9c3b45244a4a/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/TaskDispatchWorker.java#L58-L88)。单组织同时一轮，每轮最多派发一个任务，页游标回绕与轮询影响持续吞吐。该案例仍有槽位，短时受理超过实测派发速率形成队列，Redis 现场样本仅用于该采样时点，历史沿 Prometheus 和 SLS 回查。区分组织串行派发、真实满槽、远程提交拒绝与派发依赖异常，再定位数据活跃度及积压。

#### libtv 待派发的历史对照

2026-11-25 对照 11 月 23–25 日国内入口 libtv 的 SLS 受理事件、逐任务派发回执和 [国内待派发历史](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=7)。按绝对时间对齐 5 分钟的新受理、派发和期末未见派发；分辨排空阶段与持续流入。代码对照此前已部署镜像与本次镜像的 `TaskDispatcherRuntime`、`TaskDispatchWorker`，单组织一轮一单的规则一致。

历史取数要区分两类形态。当天上午已派发在途长时间贴近一个水平，随后在途和派发输出同步抬升，待派发快速回落。运行曲线可提示并发约束，历史配置仍需查正式变更记录。下午积压对应受理量超过单组织可持续派发速率，同时实际槽位有余量。对照更早的低流量日期，用受理与派发逐任务对账，避免把当时很少排队归因为派发器规则变化。

#### 从原始提示词反查 OpenAPI 任务与脱敏 Key

2026-11-25 验证一条通过上海共享推理池执行的美西 Ark 兼容任务。先在 Athena `inference-prod` 用提示词的稀有词组合预筛日志，严格比对用户原文。若 `services.job` 的步骤提示词日志缺少 Job ID，按 Pod 和毫秒时间找相邻切片事件，将 Job ID 作为候选。并发时同一秒可出现不同入口的候选，需再沿双区 `task_submitted` 反查 Zeus 任务，并用 [Zeus Admin](https://zeus-admin.sandaii.cn/organizations) 的任务内容核对原始提示词字段与增强结果。

归属与用键以对应入口的 Admin 任务记录 `orgId`、`apiKeyId` 为准。按 Key ID 从该组织的 Key 列表获取名称、掩码、创建时间，沿任务受理日志确认实际 API 路径和 Trace。归属、创建记录、接口与调用方如何取得密钥是不同证据，留档仅保留查证方法和必要指针。

#### 同文提示词按发起窗口核对

2026-11-25 复核原文相同却发生在不同时段的生成记录。用户给出时间时用 Zeus 的创建时间和入口筛选，再对照原始 prompt 与分镜字段。Athena 日志出现时间代表处理阶段，适合反查 Job 和任务 ID。若生产已存记录在目标窗口中无法配对，保留地区和查证窗口，沿调用域名、请求 ID 或发起页面追查测试环境和受理前失败。

#### 海外待派发与单组织配额饱和

2026-11-25 核对 [06 海外任务与并发](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=8) 的一次积压。先用面板的 `openapi_snapshot_last_success_timestamp_seconds{group="tasks"}` 取底层采样秒，再按同一时点从美西 Zeus SLS 用任务 ID 关联首次受理、`task_submitted` 和首次公开终态。按组织累加受理未派发、已派发未终态，在相邻秒和连续窗口与总待派发、组织非终态榜单对账。美西全文检索使用 `("taskId" OR "task_submitted" OR "outcome")` 后做 SQL 精确解析，避免使用宽字段词和事件词的交集遗漏旧格式事件。

本次复算中队列绝大部分集中于一个组织，其已派发未终态在连续窗口贴合 Zeus Admin 的有效并发。受理突增后产生积压，受理回落且下游腾出额度后队列下降。海外面板的预计值是活跃组织配额合计，组织之间的未用额度不能通用。历史 Redis 占槽没有回放时，用已派发未终态贴线和逐任务的吞吐对账支持归因，并在结论注明是日志重建。与有大量剩余槽位的单组织派发吞吐瓶颈分别验证。

#### 短窗口空白与阶段日志关联修复

2026-11-25 在 [06 国内入口筛选 libtv](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?from=now-15m&to=now&var-entry_region=cn&var-org_id=871466884966341) 复现短窗内有公开成功任务但 E2E 趋势空白。旧查询要求任务在展示窗内建单和完成，丢失窗口以前建单的慢任务，且部分窗口只剩统计卡样本而无完整趋势刻度。按首次公开成功时间选样，E2E 图先补齐每个显示点需要的 30 分钟滚动桶，再独立裁剪显示点。统计卡只使用显示窗内的完成样本。各数据源 SQL 用 `__time__` 显式回看关联所需窗口，组织归属与阶段事件向前回查 1 小时。对照同结束时点的 15 分钟、1 小时查询，检查重叠点的样本数及 P50/P95 一致。

国内阶段明细原先在 Zeus 请求内跨日志库关联。对同一批候选直接读取 Athena 有事件，复合查询未覆盖这些事件，即使扩大请求时间也未恢复。复用已验证的海外分源取数方式，`phase_tasks` 取当前入口的成功任务，`phase_athena` 读上海 Athena，明细直接读 Worker，并按 Job ID 关联。明细、相应瀑布和阶段排行走单次最多 500 个的完成子窗口，超出时「阶段统计范围」显示实际覆盖。完整 E2E 和分阶段趋势保持各自窗口口径。验收先看源请求与字段，再对照选定组织的页面及阶段有效样本。

#### 北京推理 Redis 消费断连与公网带宽判别

2026-11-25 生产 Magi2 任务已进入 Athena 北京 Redis DB2，在普通优先级队列形成持续积压。Worker 日志显示多个推理组在 Redis `BRPOP` 发送或接收阶段集中断连、超时后重连。上海总览的共享公网出方向带宽在该窗口有余量。同窗北京 Tair 数据节点出方向流量使用率长时间贴近配额，入方向、连接和 CPU 有余量，为该次有效消费能力下降的已确认带宽瓶颈。出向流量由哪个客户端或通道驱动，仍需实例侧流量归因。

**How to apply:** [02 任务运行](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks) 的「任务创建趋势」按建单时间查看当前状态，吞吐用同一模型的 Athena `completed_at` 分桶，开跑用 `state.inference_started_at`，入队用 `state._inference_queued_at`。对齐 Redis 的 broker、DB、模型、优先级和采集新鲜度，从 [Worker SLS 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 统计 `Connection to broker lost` 的短窗事件和去重 Pod，再用原始栈和同 Pod 的重连记录确认 broker。仅搜整段短语可能漏数，可用异常类型做索引预筛后在 SQL 精确匹配消息。Worker 的心跳在线不能证明消费连接正常，GPU 利用率先核 `athena_gpu_sample_timestamp_seconds`，陈旧值不能当作实时空闲容量。[生产总览的上海公网指标](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-overview?viewPanel=17) 只覆盖所列 EIP，Redis 实例吞吐、连接和时延沿 [北京 Tair 实例性能监控](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/redisHistory) 回查。容量判断使用该节点的流量使用率和同一监控序列的配额，控制台实例规格可能采用其他汇总范围。生产恢复用队列回落、开跑及完成速率一起验证。

#### 推理 List、主从与 Redis 分片

2026-11-25 复核 [北京 Tair 读写分离配置](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/readWriteSplitting)。控制台当时显示 1 主、9 只读。事故窗口 [02 任务运行](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks) 的逐队列指标把 Magi2 的主要积压定位到北京 broker 的 DB2 和单个普通优先级 Redis List。DB 编号是逻辑命名空间。多个 Worker 竞争消费同一个 List，`LPUSH` 和 `BRPOP` 都修改该 List，走主节点；只读副本的数量不能用来换算出队能力。

**How to apply:** 沿 [Athena Admin 投递](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/services/job.py) 与 [模型 broker 配置](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/models/model.py) 查实际执行模型、broker、优先级、可选时长标签和版本。用监控的 `broker,db,queue` 及队列采集逻辑的 `TYPE`、`LLEN` 判定物理 List，再用 Worker 日志确认消费路径。Redis Cluster 按 Key 分配 Slot，同一个 List 的元素始终在一个写分片。跨写分片时要让生产端分流到独立队列及 Worker 消费组，检查 Kombu 多 Key `BRPOP` 的同 Slot 约束、ACK、恢复及排空边界。多个队列仍在同一写主时共享其资源。队列积压只能证明消费落后，数据节点出向流量的贡献方需独立归因。参见 [Redis 分片规则](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/) 和 [Tair 命令兼容性](https://help.aliyun.com/zh/redis/developer-reference/limits-on-commands-supported-by-cluster-and-read-write-splitting-instances)。

#### 单节点带宽封顶后的推理 broker 优化

2026-11-25 对照 [北京 Tair 实例信息](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/info)、读写分离节点数和数据节点监控。此实例页面的带宽是多个数据节点总和。判断还能否扩展写主出向，应以同一监控序列的节点配额和 [Tair 云原生突发带宽上限](https://help.aliyun.com/zh/redis/user-guide/elastic-burstable-bandwidth) 为准。排队深度下降和节点出向持续满载可以同时发生。恢复判断同时核对消费、完成和断连。

**How to apply:** 优先按时间对齐主节点、只读副本、各 Proxy 出入流量及复制指标。已有的 [Top Key 统计](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/keyinfo) 要看按字节流量的启用与覆盖情况，QPS 热 Key 的空结果不能代替流量归因。对照 [Athena 心跳实现说明](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/docs/gpu-heartbeat.md) 确认任务 broker 与 Celery 事件共用连接目标，再用实测区分正常任务传输、Pub/Sub、共用客户端和主从复制。从 [服务可用性](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/serviceAvailability) 将节点 ID 对齐 MASTER/READONLY，再比较 [全局节点实时性能](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/realTime)。本次观察到单个写主出向集中、各只读节点入向读数远低于写主出向。节点出向、代理和副本的读数差异只用于选择排查方向，复制要用同窗复制字节计数或云侧流量拆分确认。

长期候选为独立写主的 broker 分流。先通过同模型、同 Worker 条件验证新 broker 的投递、领取、ACK 和重连，再按比例分配新任务。Job 持久化有效路由，重试复用，原 broker 由原消费者处理到待取、未确认及重试都清空，对账终态和占槽。回退只关闭新流量并保留两边排空。恢复期间的入队预算以实际领取速率减去目标排空速率估算，按已确认消费信号和各优先级下的排队水位调整。此段为设计候选，待独立验收。

#### 06 Athena 排队趋势的分桶与阶段分母

2026-11-25 回读 [06 分阶段趋势面板 132](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=132)。`Athena 排队` 用同 Job ID 的 `worker_at - ready_at`。保存查询的起点匹配唯一 `Created 1 task chunks for job …` 日志，终点取唯一 `task started, running tasks:` 日志。切片日志是投递前的观测锚点。缺两侧有效锚点或时间倒序的样本不能贡献该段；多切片日志本身不满足起点规则。接单到 GPU 开跑另看 `Worker 等 GPU`。

**How to apply:** 按当前入口、组织和时间范围选首次公开成功任务，以公开成功时刻每 30 分钟分桶，再按该阶段有效耗时取 P95。首尾分桶可短于 30 分钟。灰色成功任务数是整个桶的成功 Job 数，阶段有效分母沿面板聚合的 `nonNullCount` 查证，图上该统计列未显示。对具体长尾查单任务日志或分阶段明细。若需要纯 Redis 等待，须按发布和领取的直接事件另验，不能从切片日志精确反推。

#### 2026-11-25 晚间 i35 OSS 超时与 Redis 取单断连

**Why:** 同模型的晚间完成吞吐下台阶，首先对应 i35/B300 在 Worker 已接单后向上海素材 OSS 发起 GET 时出现连接和读取超时。原始栈从 Athena 的 `_build_request`、`_resolve_reference_groups` 到 `artifact_loader._download_http_into_file`，发生在 GPU 开跑前。亦抽到当时的产物/缩略图上传调用超时。取已接单但在 i35 查询窗未见 GPU 开跑的 Job ID 回查，许多后来由其他逻辑组完成。晚些时候多个推理组又在 Redis 取单路径断连，Redis 普通队列积压扩大。该时段部分分钟的 Redis 出向已低于早前持续触顶的水位，不能用下午的饱和状态替代同窗取证。

**How to apply:** 在 [02 任务运行](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks) 用 `completed_at` 按同一模型和时间桶分组，比较逻辑组完成量。用 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 对照同一 Job 的接单、网络异常、GPU 开跑及后续尝试，由心跳标签确认逻辑组和 Pod 家族。记录异常的调用阶段、主机与端口，只保留脱敏证据。对照 [Tair 同窗带宽](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/redisHistory)、Redis `BRPOP` 栈和逐队列水位。GPU 开跑的 Athena 数据库状态可能晚于直接 Worker 日志，近端不完整窗口需回查。i35 的具体网络设备或限额及后来 Redis 断连的触发原因在本次未证实。
