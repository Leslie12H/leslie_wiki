---
name: sandai-inference-concurrency-dashboard-entrypoints
type: reference
created: 2026-11-23
updated: 2026-11-27
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

#### 2026-11-25 北京 Tair 公网连接重置与 Celery 订阅超时

**Why** 21:39 起，取单异常先在 `_brpop_read` 和 `_brpop_start` 观察到 TCP reset，少量样本读到 EOF。21:40 后的集中报错主要来自 Redis Pub/Sub 的 `_receive` 读超时，Celery 随后重建消费连接。同一 Pod 重连回北京 Tair 公网地址。事故窗口内数据节点的连接数、出流量和命令延迟低于事前，重连阶段新连接与 QPS 抬升。分钟级数据可否定持续触顶的解释，亚分钟限流和具体发出 TCP reset 的设备仍需云侧记录。

**How to apply** 在 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 以 Pod 和秒对齐 `Connection to broker lost` 与 `Connected to redis`，按 BRPOP、Pub/Sub 和错误类型分别计数。搜索预筛同时覆盖 ConnectionError、TimeoutError，避免只命中重连日志。用 [实例连接信息](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/info) 辨别公网与 VPC，和 [Tair 监控](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/redisHistory) 的代理新建连接、主节点出向、连接和命令延迟一起核对。在 [Tair 事件中心](https://kvstore.console.aliyun.com/Redis/eventToDo/cn-beijing) 检查异常和已完成的计划事件，在 [任务中心](https://kvstore.console.aliyun.com/Redis/jobCenter/cn-beijing) 核对代理重启、变配及切换；无匹配记录时，以公网入口和代理节点的连接关闭原因、秒级限流丢包及 HA 日志继续定位。

#### 2026-11-25 逐 Proxy 定位北京 Tair 公网断连复发

**Why** 21:58:07 复发时，Worker 读到已有连接关闭，部分 Pod 重连北京 Tair 公网端口时记录 `ECONNREFUSED`。四台 Proxy 中，`55473037` 的已使用连接数独自急降并维持低位，另外三台新连接及活跃连接上升。共享主节点的 `LPUSH` 和读取仍有采样，数据库整体停止服务的解释缺乏支持。21:39 首波的四台代理分钟指标同向变化，现有证据仅把复发定位到该节点及其公网接入路径。重启、摘流量或入口设备关闭连接仍依赖提供方内部记录。

**How to apply** 在 [服务可用性](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/serviceAvailability) 确认实际节点清单，在 [历史监控](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/redisHistory) 按 Parent Node ID 加物理 ID 逐个读 `UsedConnection` 和 `NewUserConnQps`，避免把默认节点当成全实例。应用侧对齐 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的 EOF、TCP reset、ECONNREFUSED 和重连，实例侧对照主节点命令计数和 Grafana 的队列采集成功时间，区分仍在采样和沿用旧值。代理慢日志用有记录的时间段验证查询口径后再查故障分钟，慢日志缺失不能定位 TCP 重置来源。保留复发秒级起点与物理节点 ID，供定位入口后端健康检查、摘挂流量、代理进程生命周期及连接关闭原因。

#### 从 SLS 估算共享池实际推理 Worker

2026-11-25 查证 [Athena Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 当前忙碌实例。按同一个 Pod 和 Job ID 配对 `GPU worker started inference at` 与 `Step5: Post Process Done`、`inference finished in` 或明确失败。同一 Worker 有开跑且截至采样点未见对应结束才进入候选，先按 Worker 去重，再与 [06 的在线就绪快照](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=1) 对账。Worker 接单事件可早于 GPU 开跑，用于另看上机等待。

**How to apply:** 结合逻辑组核对 Worker 心跳名与 SLS Pod 名，重命名的实例须一对一匹配。比较事件时间和采集延迟，过滤无当期心跳的旧尝试。不同组的日志覆盖可能不同，2026-11-25 对 i35 实测近期缺少同口径的开跑／结束事件，另用 [03 的 GPU 采样](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-compute) 对仍在线的实例补充活动信号。合并时按 Worker 去重，同时报告 SLS 对账数、仅 GPU 样本信号数、在线就绪数与采样时间。GPU 利用率阈值和日志未见结束都属于估算信号，不能替代逐实例实时执行状态。

#### 从模型执行进程采集实际推理实例状态

2026-11-25 回读 [Athena #788](https://github.com/world-sim-dev/athena-admin/issues/788) 和 [GPU 心跳契约](https://github.com/world-sim-dev/athena-admin/blob/main/ApiService/docs/gpu-heartbeat.md)。现有生产 Prometheus 可见在线、就绪、设备采样以及前处理在途指标，未查到该票的推理实例状态指标。Coworker 已有 [GPU 批次的资源用量记录](https://github.com/world-sim-dev/athena-admin/blob/b8bcf4bfbca03bb79f378b2ad70355b3d7f0eb22/Coworker/coworker/tracking.py#L96-L149)。Grafana 当前使用的 Athena 生产数据源未看到对应公有 schema 表，覆盖范围和异常退出后的记录回收仍需确认。

**How to apply:** 从各实际执行路径的模型调用边界上报活跃请求数。同一逻辑推理实例的多 rank 由指定 rank 统一上报，活跃请求大于零时只计一个实例。按稳定实例身份对账，通过启动代次、采样时间和过期语义处理重启、失联及迟到样本。取消后等执行实际退出再减计数。有共享采集器时聚合整份最新快照并显示未知覆盖，避免不同副本的状态拼成双计数。遇 broker 通路中断时复查心跳采集依赖，用 GPU 指标和 SLS 对照。验收执行数从 0 到 N 再回 0，并覆盖失败、取消、重启和失联。

#### 现有遥测对账的采样对齐

2026-11-25 在同一截止时点复核 SLS 和 Prometheus 的忙碌 Worker 估算。对每个 Worker 取最后接收心跳的采集副本，再关联该副本的在线、就绪信号。GPU 补充信号使用同一采集副本的最近有效设备样本和时间戳。只为缺少可配对执行日志的在线实例补计，并排除已被更新的结束事件覆盖的 GPU 采样。复核不同利用率阈值下的补计人数以识别阈值敏感性。

**How to apply:** 口径区分在线和可接新任务的就绪。已有在线实例短暂变成未就绪时，同一时点仍可有正在执行的任务。核对当前心跳与最近 GPU 开始事件，容量比较按明确的在线或就绪范围注明分母。保留每个来源的覆盖及采样时点，使用 [SLS 与现有监控取数入口](#从-sls-估算共享池实际推理-worker) 回查。

#### 2026-11-25 北京 Tair 不同 Proxy 先后出现公网连接骤降

**Why** 21:58:07 与 22:09:48，Worker 两次集中记录北京 Tair 公网端口拒绝新连接及已有连接关闭。第一次对应 `55473037` 的活跃连接骤降，第二次对应 `55473033`。同窗其余代理新连接上升，主数据节点仍可读写，出向未出现分钟级触顶。按实例核对云监控秒级事件，20:49 与 20:54 有可读取的出口流控记录，三次断连窗口未返回出口流控或故障切换事件。该模式支持优先查代理逐节点轮换、重启或公网入口摘挂。具体动作及是否属于计划运维仍需供应商日志确认，不能从失败波形推定操作人或变更类型。

**How to apply** 对 [Tair 逐节点历史监控](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/redisHistory) 的 `UsedConnection` 做相邻分钟差分，同时看其他 Proxy 的 `NewUserConnQps` 及主节点的 `LPUSH`、`BRPOP` 和出向比例。以 [Worker 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 中第一条 `ECONNREFUSED` 明确秒级起点。用 [Tair 任务中心](https://kvstore.console.aliyun.com/Redis/jobCenter/cn-beijing) 与 [云监控系统事件](https://cloudmonitornext.console.aliyun.com/system-events) 交叉核对租户可见的变配、故障切换及出口流控。查询空结果前先用该实例已知流控分钟验证筛选。若无匹配记录，向供应商提供公网端口、节点 ID 和时刻，查入口健康检查、摘挂记录、代理进程启动时间及连接关闭原因。

#### 06 正在推理 Worker 估算卡片

2026-11-25 在 [06 面板 135](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=135) 增加「正在推理 Worker（估算）」，与共享池就绪 Worker 卡相邻。面板跟随看板结束时点和刷新周期，从既有 SLS、Prometheus 读取。SLS 使用原始 `_pod_name_` 与心跳中的实际 Worker Pod 名关联，标准化 Pod 标签只作为回退。执行日志回看 52 分钟，按 Pod 和 Job 匹配最新开跑与结束，然后按在线 Worker 去重。

**How to apply:** GPU 补计限最近 60 秒利用率至少 50% 的有效样本，只补日志无法确认的在线 Worker。使用同一个采集副本的数据，有更晚的结束事件即排除旧采样。跨源外连接时，缺少结束日志的行在时间比较中按无结束处理，外连接出的离线行不计。固定绝对时间复算 SLS 与 GPU 的分类、总和与页面读数，再验证相对时间刷新确实用新的截止时点。历史日志补到后，同一时点的估算可能小幅调整。

#### 2026-11-25 北京 Tair 代理闪断的升级与支持渠道复核

**Why** 多个 Proxy 先后出现连接骤降只能证明故障集中于代理及其入口链路。版本管理中心的当晚快照显示该实例未开启自动小版本升级，断连也在当时配置的可维护时间之外。版本号和窗口会变，当前配置也不能还原历史。站内信和操作审计权限独立于实例监控权限，无法读取的来源不能记成零事件。

**How to apply** 在 [版本管理中心](https://kvstore.console.aliyun.com/Redis/versionUpgrade/cn-beijing/setting) 点开实例的配置面板读取自动升级与时段，结合 [Tair 计划事件](https://kvstore.console.aliyun.com/Redis/eventToDo/cn-beijing) 与 [任务中心](https://kvstore.console.aliyun.com/Redis/jobCenter/cn-beijing) 核对真实执行记录。[我的工单](https://smartservice.console.aliyun.com/service/list?entrance=101&product=kvstore) 用实例 ID 和产品关键词查已有回执。已有证据仍缺代理进程启动退出及公网入口后端摘挂时，以脱敏秒级时间线提交给云厂商查证，保留返回的事件或任务标识。

#### 06 就绪 Worker 与推理中差额的分组核对

2026-11-25 对照 [06 共享池](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 的就绪与推理中读数。两个面板的采集副本选择和就绪范围可不同。先固定截止时点，用同一份最新心跳按 Worker 对齐，就绪 Worker 内部再拆已开跑、近期低 GPU、已结束等下一单和信号缺失。部分 Worker 未就绪时仍可能完成手头任务，另计该部分。

**How to apply:** 对差额按模型、broker 和逻辑组汇总，同窗核对 [02 的逐队列待处理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=14) 和采集时间；同模型排队表明有积压，逐组可领取范围仍需验证。用最近 10 分钟的逐 Worker GPU 采样区分固定低负载和轮换，以前一条结束、后一条接单和 GPU 开跑对时验证任务交接。i35 当次低 GPU 在实例间轮换，相关 SLS 生命周期事件缺失，取单与开跑前的具体耗时分段仍待核实。

#### i35 提交 GPU 前与执行器内部耗时对账

**Why** 2026-11-25 北京时间 22:20–22:35 完成的 1,435 条 i35 同模型成功 Job，从首次派到推理队列到记录 GPU 开跑的 P50 / P95 为 232.9 / 418.3 秒。1,300 条 Job 的 API `running` 与 GPU 开跑相差不超过 1 秒，同 Job 跨组重试时旧 `running` 可能属于其他尝试。以这 1,300 条计时可对齐的 Job 估算，1,299 条在提交 GPU 执行器前已累计超过 2 分钟，该段耗时下界中位数为 204.4 秒。提交后到 GPU 开跑的耗时上界中位数为 6.1 秒，下界超过 60 秒的有 138 条。长尾仍可包含执行器内部等待。Job 完成样本不能逐台对应 GPU 低读数的 Worker。

**How to apply** 用 [Athena 计时定义](https://github.com/world-sim-dev/athena-admin/blob/b8bcf4bfbca03bb79f378b2ad70355b3d7f0eb22/docs/architecture/README.md#L344-L381) 的首次入队、实际开跑、完成和执行器上报时间对账。仅在 Job 时间戳与执行器耗时可视作同一次尝试的情况下，以逐 Job 的 `celery_job_duration - dit_job_duration` 估计 GPU 执行器内部开跑等待的上界，因其中还包含超分和返回开销。用提交执行器的总耗时减去 GPU 开跑至 Job 完成的墙钟区间，取非负值估计等待下界。先逐 Job 计算再取分位数。入队至 GPU 开跑减去执行器内部等待上界，可估计提交执行器前累计耗时的下界。用 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的实际 Pod、Job ID 及开跑时间关联同一次尝试，避免把其他机型的接单记录算到 i35。该窗口针对 i35 成功样本未找到同 Pod 的接单和素材准备记录，队列取单与接单后的准备耗时仍待逐次对账。

#### i35 B300 的 Celery 取单与输入准备重叠

**Why** Celery broker 预取预留任务消息。Worker 执行 handler 后，解析参考素材组、读取素材并构造推理请求，然后进入 GPU 执行器的内部队列。这些阶段有各自的容量限制。2026-11-25 北京时间 20:47–21:14 抽到 23 个 i35/B300 Pod 的启动记录，Celery `concurrency` 均为 2。20:34–20:47 可完整配对的 520 次同 Pod 任务交接，有 339 次在前一单 GPU 开跑后、前一单记录结束前已开始处理下一单。该窗口 581 条同 Pod 接单到开跑的中位数 7.5 秒，包括输入准备和执行器等待。在晚间 OSS 超时样本中，同 Pod 配对了 28 条接单后在 `_download_http_into_file` 报错的记录，接单到报错的中位数约 72 秒。该值含请求构造和可能的重试，适用范围是失败样本。

**How to apply** 看 [Celery 预取说明](https://docs.celeryq.dev/en/stable/userguide/optimizing.html#prefetch-limits) 区分消息预留、worker 槽位和确认时机。用 [Athena 计时定义](https://github.com/world-sim-dev/athena-admin/blob/b8bcf4bfbca03bb79f378b2ad70355b3d7f0eb22/docs/architecture/README.md#L344-L381) 区分 GPU 请求构造、`submit_and_wait` 及 evaluator。排查 B300 吞吐时，用 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的 `Using celery concurrency` 和 `task started, running tasks:` 核实部署并发。以同 Pod、Job ID 及尝试时间关联接单、解析与下载、GPU 开跑和结束，检验次单能否在上一单结束前备妥。结束日志含的工作可能超过纯 GPU 计算边界。当前可见生产日志未证明 B300 的 `worker_prefetch_multiplier`、ACK 时机或是否存在独立的输入准备队列。20 点的日志不能解释 22:32 快照中逐 Worker 的低负载原因。

#### i35 仍在开跑时产物与状态回报 DNS 失败

**Why** 2026-11-25 北京时间 23:00–23:15，Athena 记录 i35 成功完成 1,042 条，23:15–23:30 降为 40 条，23:30–00:00 的同口径窗口为 0。2026-11-26 00:02:42 的 06 估算 629 台，i35 占 60 台，同组有 63 台新鲜 GPU 利用率样本达到 50%。Worker 日志仍有真实 GPU 开跑及模型后处理事件。按 23:30–23:35、23:50–23:55 同一 B300 系列的 GPU 开跑各抽样共 241 个记录，回查时 135 条在开跑后由其他组成功，15 条在 i35 此次开跑前已由其他组成功，88 条还在 pending/running，3 条失败。逐 Job 日志确认 Worker 调用 `_report_status_http` 及 `create_artifact` 时，解析 `athena-staging.sandaii.cn` 遇到 `NameResolutionError`。00:05 的失败栈确认主结果在 `_merge_and_report → _publish_artifact → create_artifact` 时遇到同一解析异常。该域名在 Athena 的生产 Ingress 配置中。具体 DNS 解析链路、变更及任务恢复范围未核实。

**How to apply** 以 [06 正在推理 Worker](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=135) 同口径多时点复算执行信号。不要把 [02 任务运行](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks) 的创建分桶或当前 running 数当 Worker 数。查询成功吞吐按任务实际完成时刻分桶，并按 [B300 Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的原始事件时间关联实际开跑、模型后处理、产物登记与状态回报。重复开跑以 Job ID、Pod 及尝试时刻区分，最终成功组与发生 GPU 开跑的尝试组可以不同。看到 DNS 解析异常时核对 [Athena 生产 Ingress 源码](https://github.com/world-sim-dev/athena-admin/blob/c912bb99586de9b0e8afff027c4a4e2b74281390/ApiService/k8s-manifest/overlays/prod/ingress.yaml#L14-L29) 和 Worker 侧实际解析器。避免用日志采集入库时刻判断故障起点。

#### i35 产物回报 DNS 故障的修复验收

**Why** 2026-11-26 北京时间 00:07 复查，i35 的主视频发布与状态回报仍有同域名的解析失败，近六分钟的任务数据库查询未见 i35 成功完成。同分钟从排查机器发起 Athena 生产入口的 `GET /health` 返回 200。两个网络位置的证据缩小了排查范围，不能代替故障 Worker 内实际使用的 DNS 配置和响应。北京共享队列仍由其他组继续消费。

**How to apply** 从受影响的 i35 Worker 容器读取 `/etc/resolv.conf`，通过 `getent ahostsv4` 或运行时的 `getaddrinfo` 复现，并用实际 nameserver 查询原域名与 CNAME 目标。比较同节点主机、其他 i35 节点及健康组。NXDOMAIN 查私有区覆盖、转发和负缓存，超时或 SERVFAIL 查 DNS 服务与上游连通。现场是 Kubernetes 时，按 [Kubernetes DNS 排查](https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/#checking-the-local-dns-configuration-first) 查 Pod DNS 与转发路径。生产入口以 [Athena 生产 Ingress 源码](https://github.com/world-sim-dev/athena-admin/blob/c912bb99586de9b0e8afff027c4a4e2b74281390/ApiService/k8s-manifest/overlays/prod/ingress.yaml#L14-L29) 确认。优先对少数 Worker 恢复解析，用原域名完成 TLS 和 `/health` 检查，再用同一个实际 Job 核对 i35 GPU 开跑、主视频 Artifact、Athena succeeded。按模型和逻辑组验证多分钟无同因错误、成功吞吐恢复、[共享队列](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=14) 连续回落。需要止损时用已核实的 i35 自身停止取单能力，保留共享队列由健康 Worker 消费。失败窗口按 Job ID 识别重复尝试、已有产物和其他组终态，再走现有幂等补偿。

#### 06 Worker 估算与 GPU 实测的覆盖差异

**Why** 2026-11-26 北京时间 00:06:05，06 估算 i35 60 台、全池 629 台。i35 105 台有近 60 秒 GPU 样本，58 台最新样本利用率达到 50%。卡片计入 14 台最新样本为 0% 的实例，漏掉 12 台最新样本达到 50% 的实例。全池 629 台中有 390 台缺近 60 秒 GPU 样本，主要为两个 S5000 组。00:19:23 同口径估算 656 台。全池 686 台中 288 台有近期 GPU 样本，271 台最新值达到 50%，另 398 台活动未知。i35 106 台均有样本，89 台达到 50%。相同 Job ID 的另一尝试可已由别组成功，任务成功终态不能说明当前某个 Worker 的尝试已结束。

**How to apply** 将 [06 日志估算卡](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=135) 和 [03 GPU 实测](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-compute) 固定在同一截止时点。按 Worker 联结同一副本的新鲜心跳和 GPU 样本，报告实际覆盖、最新利用率达阈值数和缺采样数。SLS 使用最近一条 GPU 开跑且无匹配结束做推断，仍可能受日志迟到、异步结束、重试和长任务影响。DNS 故障期间的任务对账使用同 Job 的开跑、主视频登记与成功终态，避免拿成功流量当同时计算的数量。当前 Athena 推理监控源未找到覆盖全池的执行进程活跃请求数。精确实时报数依赖 [Athena 执行状态采集](https://github.com/world-sim-dev/athena-admin/issues/788) 的实际部署和失败收尾对账。

#### i35 CoreDNS 上游超时与单域名转发恢复

**Why** 以 [研发群 00:17 的故障查证](https://applink.feishu.cn/client/thread/open?open_chat_id=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&open_thread_id=omt_18628147f0cf1c96&openchatid=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&openthreadid=omt_18628147f0cf1c96&thread_position=2) 和 [00:21 恢复证据](https://applink.feishu.cn/client/thread/open?open_chat_id=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&open_thread_id=omt_18628147f0cf1c96&openchatid=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&openthreadid=omt_18628147f0cf1c96&thread_position=3) 为当次变更指针。i35 两个 CoreDNS 副本把外部域名转发到 Google 公共 DNS，查询 Athena 生产入口时出现上游超时。两个节点的 B300 Pod 分别复现失败，从这些 Pod 直查已验证的阿里云解析器可得到负载均衡地址。平台给该域名单独配置转发并热加载两个副本，业务恢复。该变更的范围为 Athena 入口域名，默认上游为何超时及故障窗口的回报是否全部补齐仍待确认。

**How to apply** 用 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的原始事件时间核对规模与起止。2026-11-25 北京时间 23:05:58 左右首见解析失败，23:22 单分钟涉及 102 个 Pod。2026-11-26 00:17:27 任务库重新出现 i35 成功完成，最后一条同类 DNS 错误为 00:17:31。故障前后均观察到同一批 115 个 Pod 有真实开跑。按回滚和现网修复证据检查 CoreDNS 副本的实际生效规则、集群服务和 OSS 解析，以及同一批 i35 的产物登记与完成回报。默认转发出口的根因需查 i35 侧解析器日志与 DNS 网络路径，公网域名操作日志是判断公开记录是否改过的独立证据。

#### 追溯 FIFO 最长等待告警

**Why** 2026-11-26 北京时间 00:03 的 Magi-2 告警报 189.3 分钟。复核同一轮三张飞书卡片及北京 DB2 的原始时间序列，最长值每隔 30 分钟增长约 30 分钟。极低优先级队列重新出现在指标中的时点，模型最大值从很小的值跳回两个多小时。此类跳变要区分队列消息的年龄、一次连续排队时长和首次进入 running 前的实际等待。[原始飞书告警](https://applink.feishu.cn/client/chat/open?openChatId=oc_8baec17ece7a9ebceffa89517b3a5b25&position=57122)

将同一 Worker 的任务生命周期与 Redis 连接对时。Job 5085942 的首次入队时间和原始采样反推起点相差约 4 毫秒，Worker 接单后发生 broker 读超时。Celery 提示断连使正在执行且延迟确认的消息无法通过旧连接确认，随后重连，旧计时起点在下一分钟重新出现，原执行稍后成功。这个组合支持断连后消息重新入队。单任务的再次领取或重复执行还需独立回执。[Athena 单任务时间线](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-job-detail?var-job_id=5085942)

**How to apply** 在告警时间点先对齐来源、Redis DB、模型及采集状态，再并列查询模型级的 `athena_inference_queue_max_wait_seconds` 和分优先级的 `athena_inference_queue_pending`。保留回落、重新出现等变化。最大等待指标没有任务 ID 或优先级，要确认具体任务需有队首消息或可关联的投递、重投、领取证据。用 Prometheus 原始 range vector 的样本时间减去等待秒数，避免查询网格和飞书发送时间引入的秒级误差。将反推时刻与 Athena 的首次推理入队记录、SLS 投递和 Worker 接单及终态交叉核对。普通请求可按 Athena `jobs.started_at` 限时分组，统计各 `queue` 的 `state.inference_start_wait_duration`，同时说明分母只包括窗口内已开始的任务。[队列看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=14&from=1795617600000&to=1795623600000)

#### 02 推理中任务的分钟存量回算

**Why** [任务创建趋势](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=7) 把任务按创建分钟分桶，再用查询当下的状态给每桶着色。末端近期任务集中在预处理和待推理，推理中曲线也会因此下弯。[当前阶段卡片](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=8) 统计所选创建范围内当前处于推理阶段的任务，单位是任务。一位点的任务存量需沿实际开跑和终态时间线复算。

**How to apply** 固定模型和时间，先按卡片的实际 SQL 复查快照。用 Athena 任务的 `started_at` 和终态时刻回算分钟存量。缺少 `completed_at` 的终态只能用 `updated_at` 近似；跟随 Last 1 hour 模拟滚动时，另扣创建时间滑出一小时的存量。用分钟新增开跑减已开跑后进入终态减滑出窗口，在数值偏差较大时检查状态回报和重试。实际 GPU 开跑对照 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的 GPU 开跑事件，按 Job ID 去重并通过 Athena 反查模型。同一个 Job 可以有多次开跑日志，Job 的首个 `started_at` 可以早于在窗口里观察到的 Worker 开跑事件。Worker 活跃度另按设备和采样窗口交叉验证。

2026-11-26 在模型 `test-magi-2-1118-prod` 复核中，右端创建桶的视觉下弯与分钟存量回落同时出现。窗口滑出数为零的时段里，成功完成速率稳定，Athena 新开跑速率低于退出速率。GPU 开跑日志计数也下降，但幅度小于 Athena 新开跑的降幅，说明两个口径需分别解读。持续诊断时同时查 [Redis 排队](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=14) 和 Worker 分组指标。

#### 北京 Redis 断连后的重复 GPU 开跑

**Why** 2026-11-26 北京时间 00:31–00:35 与 00:35–00:39，模型 `test-magi-2-1118-prod` 的 Athena 首次 running 从 875 降到 761，同期按实际 Pod 与 Job 对齐的 GPU 开跑从 961 降到 943。已记过 running 的 Job 再开跑从 85 升到 181，后窗中 179 次查到另一 Pod 更早的 GPU 开跑，129 次查到原 Pod 在首次 GPU 开跑后、再次接单前丢失消费连接。i35 的实际 GPU 开跑 402 → 408，再开跑 20 → 64。00:35–00:39 真正的 broker 丢失事件命中 252 个去重 Pod，i35 占 67 个。重连回北京 Tair 公网 broker。同窗见 Redis Pub/Sub 读超时和 BRPOP 读取时连接被关闭。00:41、00:42 再次放大。具体 Tair 代理或网络触发原因仍待实例侧证据。

**How to apply** [ApiService](https://github.com/world-sim-dev/athena-admin/blob/b8bcf4bfbca03bb79f378b2ad70355b3d7f0eb22/ApiService/services/job.py#L1430-L1441) 在首次 pending → running 处理时写 `started_at`。用 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的真实 GPU 时间与该字段对齐，先分同一次回报、已早先回报的重复尝试、回报偏晚及缺回报。重复开跑按真实 Pod 和尝试时刻判定，任务最终组只用于检查结果。模型阶段的 Job ID 在结构化 `job_id`，接单和 GPU 开跑也可能用正文里的方括号 ID。用同 Pod 前单 GPU 开跑到 `Step5: Post Process Done` 的区间检查接单后等待，避免把已有任务占用 GPU 的时间算成素材下载。该窗口后四分钟，sensecore-s5000 接单后等待至少 30 秒的 241 个样本中，240 个至少 80% 的等待与前单模型运行重叠。

SLS broker 断连应把 `ConnectionError`、`TimeoutError` 等作为索引预筛，随后在完整 `content` 里验证 `Connection to broker lost`，用 Celery 的自动重投告警和同 Pod 重连补证。只按整段短语预筛或只读拆出的 `message` 可能漏掉 Python 栈。按先前开跑、原 Pod 断连、另一 Pod 领取及再次开跑，逐次区分重复执行与状态回报。对 Tair 代理节点和链路触发点的复核沿[实例性能监控](https://kvstore.console.aliyun.com/Redis/instance/cn-beijing/r-2zetxnct3dc6y6dd8l/Normal/VPC/tair.rdb.with.proxy.4g/redisHistory) 继续。

#### 按 Worker 组核对最终失败率

**Why** 2026-11-26 核对生产 Magi-2 告警时，Athena 有状态已为 `failed`、`completed_at` 仍为空的 Job。仅按 `completed_at` 过滤会漏计失败。部分失败发生在输入审核或预处理阶段，任务没有记录推理组。跨组重试还会使最终记录的组与某次尝试所在的 Pod 不同。

**How to apply** 固定模型和终态时间窗，从 [02 任务运行](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks) 所用的 Athena `public.jobs` 按 Job 计数。缺少 `completed_at` 的终态以 `updated_at` 近似归桶，报告近似计数。以 `state.inference_group` 分组，失败率取 `failed / (succeeded + failed)`，取消单列。保留未记录组名的任务，使全模型成功数和失败数分别等于各组及未归组之和。未归组失败沿 `state.failed_stage`、`state.failed_error_code` 核对是否发生于推理前。定位某组执行异常时，按 Pod、Job 和尝试时间回查 [Worker 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai)。

### 2026-11-26 全局 Athena 在途趋势

在 [06 的 Athena 在途趋势面板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=136) 查看所选时间范围的全局 Athena 在途。趋势复用同看板面板 3 的双区 Zeus 执行阶段 Prometheus 快照，含已派发后在下游排队的任务。Grafana 按相同时间戳合计两区；任一区快照缺失时保留断点。用固定结束时间查两区即时值、全局卡与趋势末点，再对比一小时与六小时重叠时段。区间取数、快照有效条件和步骤设置以面板已保存配置为准。

顶部成功任务 E2E P95 和最大值保留在摘要卡，沿原 E2E 趋势回查同入口、组织和时间范围的样本。

### 2026-11-26 同时查看 Athena 在途与入口 E2E P95

在 [06 并发资源管理](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 将全局 Athena 在途与当前入口的 [成功任务 E2E P95](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=107) 上下对齐。两图用同一看板时间范围及固定的左轴宽度，启用共享十字线。P95 悬停提示使用查询返回的同窗口成功样本数。P95 卡继续读取趋势面板的转换前摘要行。

复核时固定同一小时窗口切换国内和海外入口，检查标题、P95、成功样本数及上下两图光标是否对齐。P95 查询的时长上限和滚动口径以面板当前设置为准。若入口切换显示暂无样本，先用相同固定范围复查数据源、搜索词和实际返回行数。

### 2026-11-26 E2E 摘要随所选范围消失

**Why**　[06 看板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency) 的顶部 P95／最大值读取 E2E 趋势查询的摘要行。范围超过 SQL 上限时，两个面板同时返回空，「暂无样本」也可能表示超过上限。仅调大上限时，宽泛的扫描模式还可能超时并返回空帧。生产数据源的可索引字段分区不同，海外公开终态的时间沿 content 日志前缀解析。

**How to apply**　先回读摘要的 Dashboard 数据源引用、E2E 源查询的范围条件和结果行数上限，再用固定结束时点、同一入口和组织验收。扩大范围时同步检查摘要行和全部趋势刻度，并用任务 ID、终态和受理事件的索引预筛后做精确解析。组织筛选依赖向前回看的受理日志，极长任务在不同时间范围中可能有归属覆盖差异。记录实际面板说明中的范围上限，通过原链接核对数值和趋势，参考 [06 E2E 源面板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=107)。

## 2026-11-26 历史并发估算与排队 P95 的核对

**Why:** 同一次容量讨论里，机型折算、可承载在途数量和排队分位数分别来自不同口径。若把资源交付计划直接当已上线资源，或把一个延迟档位的线性容量外推用于另一个档位，对外给出的容量会失去对应的观测依据。

**How to apply:** 先沿 [研发群容量测算原图](https://applink.feishu.cn/client/chat/open?openChatId=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&position=866) 核对基准机器组、等效权重、基准并发和延迟档位。该图是 20 分钟档的历史测算，发布人随后在[群内补充](https://applink.feishu.cn/client/chat/open?openChatId=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&position=868)称整理可能有误并请同事复盘。10 分钟排队档沿 [原讨论](https://applink.feishu.cn/client/thread/open?open_chat_id=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&open_thread_id=omt_186db9c9bd4f5b43&openchatid=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&openthreadid=omt_186db9c9bd4f5b43) 及 [口径交接消息](https://applink.feishu.cn/client/chat/open?openChatId=oc_0d19c3545bfd03bea5bd4d9bba23a1dc&position=867) 查原始计算或新一档观测。复核时固定模型、入口、样本和时间窗口，用 [03 推理算力](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-compute) 核对当时实际上线的机器组，用 [06 分阶段趋势](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=132) 核对该窗口的排队分段。若口径为入推理队列至 GPU 开跑，先对同一 Job 合并接单前后两段耗时，再计算 P95。

### 2026-11-26 按入队时点复算 10 分钟档

**Why:** 同样的在途量可以因机器池、积压和任务构成变化而出现不同的排队 P95。完成时分桶与任务入队时的系统负载也可能错开。

**How to apply:** 固定 Magi-2 模型及北京时间范围，根据 Athena Job 的入队时间分组，用记录的 GPU 开跑时间减入队时间逐任务取 P95，并核对未开跑、提前终止和倒序记录。同窗按分钟用建单与终态回算 Athena 非终态存量，再取窗内中位数。建单查询向前覆盖积压，另查旧任务存量对敏感性的影响。用 [02 任务运行和队列](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?from=2026-11-26T05%3A00%3A00.000Z&to=2026-11-26T10%3A00%3A00.000Z&viewPanel=14) 和 [03 推理算力](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-compute?from=2026-11-26T05%3A00%3A00.000Z&to=2026-11-26T10%3A00%3A00.000Z) 对齐当日窗口的队列与就绪 Worker。在业务侧引用 06 双区 Zeus 已派发存量时保留地域及模型覆盖差异。报告一个接近门槛的连续达标窗口，并给出同档在途量超线的观察和机器池差异。

### 2026-11-26 同批任务合并排队与生成

**Why:** 排队和生成的长尾可能出现在不同任务。两个阶段的 P95 之和无法代表同一批任务入队到生成结束的 P95。平台后处理与模型内 VAE 解码也有不同计时边界。

**How to apply:** 用 Athena 的入队时间定样本和分桶，按 Job ID 将记录的 GPU 开跑与 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 的同次开跑对齐，再找同 Pod、同次尝试的 `Step5: Post Process Done`。逐任务用生成结束减入队时间计算总耗时，最后取分位数，同时给入队分母和结束日志覆盖。判断 10 分钟档时，可把缺失结束事件全部算作达标，检查结论是否仍成立。若验收终点为 Athena 成功，另读成功终态的完成时间以纳入平台后处理。对照 [06 分阶段趋势](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=132) 的阶段说明和样本分桶。

### 2026-11-26 用机器组吞吐估算对外并发与时效

**Why:** 按机器组核算模型生成吞吐可以用于资源预算。共享池的成功终态吞吐还经过前处理、后处理和结果返回。机器组数量变化时，生成结束和最终成功的计数可以呈现不同趋势。客户组织并发涉及不同的占槽范围。

**How to apply:** 以 [03 推理算力](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-compute) 的逐机型就绪 Worker 分钟数为分母，以 [Worker SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 匹配同次开跑并按 Job 去重的模型结束数为分子。保留实测规格组合、路由与积压变化，Worker 数和实体机数按部署单独映射。按机型加总模型吞吐预估，再用 [02 任务运行](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks) 和 [06 端到端](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=107) 复核共享池各环节的完成量与长尾。对外验收约定工作负载、持续及突发提交速率、组织占槽定义、失败处理以及从受理到首次返回可下载结果的时间。达标率的分母沿受理批次追到截止，以便排队和失败组成变化仍可比较。

### 2026-11-26 双区公开成功按等效算力加权

**Why:** 等效算力按同一模型的 Worker 计时，客户可见的完成量来自 Zeus 的首次公开成功。两地日志被分段读取时，日志时间和结构化事件时间不同，邻接窗口硬裁可能漏掉成功或对应的派发事件。

**How to apply:** 以 [06 的国内及海外 E2E 查询](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=107) 取双区首次公开成功。查询外层在每个切片交界加重叠，按结构化事件时间用半开窗口归属，合并后以 Zeus 任务 ID 去重。用公开成功之前的有效派发 Job ID 关联 Athena 模型，同时回查两区原面板成功数。各 20 分钟窗口按平均等效算力算暴露量，全时段汇总用双区同模型公开成功数除以等效算力窗口之和。P95 另从逐任务 E2E 时长取分位数。

#### 海外待派发尖峰与既有组织积压

**Why** 2026-11-27 的 [06 海外待派发固定窗口](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=8&from=1795709640000&to=1795710360000) 同时包含 Higgsfield 的 Ark 兼容接口突发流量和巨日录此前受理的原生 v2 存量。两家组织的等待时长与排出速度差异明显。巨日录一笔首次公开终态后，下笔派发在约一秒内发生，重复出现可以佐证组内补位。Redis 实际持槽和 Admin 有效额度仍须单独查证。

**How to apply** 先把 06 所显示的时刻还原为任务快照采样秒，对齐尖峰前、峰值及回落时的新增受理、派发和公开终态。短窗复算不足以解释入口总量时，以此前稳定底量和同时点组织在途榜单找候选组织。沿美西 Zeus SLS 查询候选组织较长时段的首次受理，按任务 ID 分组查派发和公开终态，再与三个以上快照对账。用终态与下一次派发的时间差区分按组织补位、受理洪峰造成的积压和整个派发器停摆。缺历史槽位样本时只报告可观察到的派发节奏。调度规则从 [美西发布回执](https://github.com/world-sim-dev/zeus/actions/runs/45632146492) 对应版本查，批量上限以生产配置回读为准。

#### 组织批量派发上线与实际吞吐复核

**Why** [Zeus #529](https://github.com/world-sim-dev/zeus/pull/529) 将每组织一轮的任务数做成可配置的上限。一个组织同时只有一个 worker 执行该轮，worker 在轮内按任务逐笔拿槽、准备、同步提交 Athena 与落库。线程池大小约束跨组织并行，调度 tick 约束查找下一轮的频率。批量派发减少轮间扫描与握手开销，轮内 Athena 提交仍串行。

**How to apply** 从 [上海发布](https://github.com/world-sim-dev/zeus/actions/runs/45633989450) 与 [美西发布](https://github.com/world-sim-dev/zeus/actions/runs/45632146492) 找到当时镜像，读实际 Pod 的 `dispatcher.properties` 挂载与容器启动记录。并发 worker、每组织批量与扫描间隔均以该现场回读为准。2026-11-27 的 [美西尖峰窗口](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=8&from=1795709880000&to=1795710180000) 可用 SLS 的 `task_submitted` 提取组织的成功回执与调度 Trace ID。按 Trace 分轮后，用一轮第一笔到末笔的耗时加末笔到下一轮第一笔的耗时验证吞吐。轮间间隔也含下一轮首单的实际执行，单独比较轮内相邻回执才能估算轮间附加成本。根据 [调度实现](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/TaskDispatcherRuntime.java#L148-L195) 对照扫描速率、扫描平均耗时和线程排队。用 Job ID 在上海关联 `job creation completed` 和美西提交后落库事件可拆回执前后时间，两点之间的跨区时间差仍含网络和状态持久化，完整 HTTP 耗时以客户端 span 查证。

#### 扩 Dispatcher 之前核对组织占槽与任务归属

**Why** [现网 Dispatcher 发布约束](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/docs/openapi-task-dispatch.md#发布) 采用每库一个消费者。调度器的组织运行集合和退避状态保存在进程内。候选 SQL 读取 WAITING 任务，Redis 任务占槽集合用于配额和恢复，已占槽可以被后续轮次继续处理。增加副本需要独立验证跨进程任务领取、迁移和故障恢复。按组织分片可扩大跨组织吞吐，单个大组织的派发速度仍取决于该组织内部的执行方式。

**How to apply** 2026-11-27 [Higgsfield 美西尖峰](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=8&from=1795711020000&to=1795711500000) 以相邻时刻的组织待派发、实际占槽及有效额度判断要扩哪一层。Admin 会话不可用时，在已授权的美西 DMS 验证目标实例与 `zeus_magi` 库，按组织主键点查 `organization_quota`，空覆盖再沿默认额度查证。同一时点用 Dispatcher 连接的 Redis 对 [TaskConcurrencySlots](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/TaskConcurrencySlots.java#L14-L48) 对应的组织只执行 `SCARD`，核对配置来源和数据库，记录只保留数量与采样时刻。消化流量尖峰时同时验组织派发与 Athena 建单速率、终态和槽位释放，保留秒级突发与分钟均值两种视角。

#### 02 当前阶段合计与 06 Athena 在途的对账

**Why:** 2026-11-27 复核 [02 当前阶段](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=8) 与 [06 全局 Athena 在途](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=3)。02 按 Athena 的创建时间和选中模型、项目过滤，以查询时的 Job 状态统计 pending/running。06 汇总两区 Zeus 的 `executing` 快照，其中包含 `SUBMITTED` 和旧 Running，未附加 02 的创建范围或模型筛选。两区快照时刻可不同，并且与 02 查询时刻有偏移。Athena 写入终态到 Zeus 记录结束之间也存在时间差。Worker 卡片按运行实例计，不参与任务数对账。

**How to apply:** 先回读 02/06 已保存查询和 02 筛选，再用 06 的 `openapi_snapshot_last_success_timestamp_seconds{group="tasks"}` 分别找国内、海外实际采样秒。在各自时点按 Athena 的 `magi-prod-cn`、`magi-prod-global` 回算 Job 存量，检查创建范围、模型、终态时间和时间戳缺失。用 Zeus `task_submitted` 的 Job ID 关联 Athena `completed_at` 和 Zeus `task_finished`，用事件先后验证差额，区分已证实的样本与未匹配记录。回查 2026-11-27 00:21 与 00:38（北京时间）的脱敏汇总方法和现场证据见 API 工作区 `.local/athena-worker-gap-20261127/`。判断就绪 Worker 是否有单可取，另查 [02 逐队列](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=14) 同模型水位及采集成功和更新时间。Athena 的待推理含 Worker 已接单、构建请求或等 GPU 的任务。

#### 同组织有界并行的吞吐回放

**Why** 2026-11-27 针对 Higgsfield 美西突发积压提出同组织内并行提交方案。每轮仍有任务数上限，并行后要等本轮最后一笔收尾才可轮转。用串行吞吐直接乘并行度会漏掉批尾等待和轮间开销。线上基线可从[美西积压窗口](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=8&from=1795709880000&to=1795710180000)与当时的 [Zeus 派发代码](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/TaskDispatchWorker.java#L64-L113)复核。

**How to apply** 在同一组织持续积压且有可用配额的窗口，按调度 Trace ID 整理成功派发回执，用同轮相邻回执间距作为单笔耗时的近似样本，用跨轮与同轮的平均间隔之差估算额外轮转时间。按拟议轮大小重组按时间排序的样本，模拟并行上限，某笔收尾就补下一笔，轮末取最后完成时间，再加入轮转时间。先用串行配置回算原窗口吞吐，再将其他档位的结果作为 staging 压测的比较基线。该回放只覆盖历史成功回执，在并发下的下游排队、数据库争用和异常恢复要靠实测确认。此方法对应拟案，线上效果以灰度数据为准。

#### Athena 终态 HTTPS 回调积压造成 Zeus 在途偏高

**Why:** 2026-11-27 北京时间在 [06 Athena 在途](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=3) 与 [02 当前阶段](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=8) 对账。两区时点对齐后差额仍大。按 Athena Job 与 Zeus 任务对应关系匹配 `completed_at` 和 `task_finished stage=EXECUTION`，确认任务已结束后仍等回报。随后从上海生产通知 Pod 的日志补齐 HTTP 投递回执，匹配的样本显示主要间隔在 Athena 完成到回调投递。通知 Celery broker 的队列有持续待投递消息。该队列有不同项目和消息类型，一条通知不等于一个生成任务。

**How to apply:** 先从 Athena `projects.callback_url` 取协议和域名并丢弃查询参数，确认项目实际路由。此次两区生产项目均走 HTTPS，Zeus 历史 `zeus-infer-events` Stream 的 pending 与 lag 不适用于该口径。按 [通知 Worker](https://github.com/world-sim-dev/athena-admin/blob/9930d3168401f7d3edf1e353f233299296eccbc4/ApiService/notification.py) 和 [Zeus HTTP 回调入口](https://github.com/world-sim-dev/zeus/blob/b9a13124e27232ef794ab8b66d5bbadb7845de47/modules/api/src/main/java/co/sandai/zeus/api/infer/InferEventController.java) 核对三段时间。用 Athena Job ID 关联通知 Pod 的 `HTTP notification delivered`，用 Zeus 任务 ID 关联执行终态。若 SLS 不含通知 Pod 日志，从已授权的集群读对应 Pod 的限量日志。按实际 Deployment 查通知副本和 Celery 线程并发，通过运行时 broker 只读查看队列 LLEN 和 unacked。看到等待重试时区分同 Job 消息排序、HTTP 投递重试和业务失败。推理供给另查同模型 Redis 取单水位及 Worker 活跃信号。现场脚本和脱敏证据见 API 工作区 `.local/athena-worker-now-20261127/`，配置和积压现值需回源。

#### Athena 通知服务的副本数估算

**Why:** 2026-11-27 复核 Athena 通知服务水平扩容。多个 Celery 副本使用相同 broker 与顺序状态 Redis。不同 Job 可以并行，单 Job 通知有共享顺序队列和重试。线程数、预取、待投递消息组成和状态回调耗时会影响扩容后的吞吐。生产声明由 [Athena 生产 overlay](https://github.com/world-sim-dev/athena-admin/blob/9930d3168401f7d3edf1e353f233299296eccbc4/ApiService/k8s-manifest/overlays/prod/kustomization.yaml#L36-L42) 下发，临时副本数可能被下一次发布覆盖。

**How to apply:** 先在实际 Deployment 读取副本数、线程参数、HPA 和资源。间隔两次采样 broker 各优先级水位与 unacked，并以完整分钟的成功 HTTP 投递量估计现有处理速率。由成功投递与积压净变化估计有效到达量，评估丢弃或重试对估计的影响。所需总吞吐等于有效到达量加上积压除以清理目标时长。按每副本实测量做线性和折损场景，清理时间从新副本就绪后计算。验证时以连续分钟的成功投递、队列净降和最老消息年龄对照终态延迟，额外核对回调 429/5xx 与顺序重试耗尽。新增副本的预取会把一部分队列移入 unacked，且 Zeus 完成释放槽位后新单可能推高到达量。复算脚本和 2026-11-27 的快照见 API 工作区 `.local/athena-worker-now-20261127/scale-*.json`。

#### 输出与参考视频的合计时长

2026-11-27 核对按合计视频时长分析模型执行耗时的口径。按任务读取原始输出 MP4 的实际秒数，再加各个参考视频输入的时长。先确认输入清单，只有确定没有视频时才加零。画面衍生的音轨与独立音频均不计入。

预处理有两条路径。素材准备路径按每个视频输入取已准备的时长并相加，见[参考槽位元数据](https://github.com/world-sim-dev/athena-admin/blob/9930d3168401f7d3edf1e353f233299296eccbc4/ApiService/preprocessors/reference_prompt.py#L126-L146)。仅校验路径不会回填槽位时长，按任务 ID 读取校验完成事件的实测视频总秒数，见[参考媒体校验](https://github.com/world-sim-dev/athena-admin/blob/9930d3168401f7d3edf1e353f233299296eccbc4/ApiService/preprocessors/reference_validation.py#L56-L82)。同一任务的校验总数只用一次。有视频但两处均缺少完整信息时，保留未知。逐任务相加后再分档，避免先对各段时长取整造成边界偏移。

#### 成功任务 E2E 趋势切换平均值与 P95

**Why** 2026-11-27 在 [06 成功任务 E2E 趋势](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=107) 验证了顶部「E2E 趋势统计」的 P95 与平均值切换。每个点统计截至该点前 30 分钟首次公开成功的任务，每 5 分钟显示一个点。平均值反映这批任务从建单到公开成功的算术平均时长，P95 用于观察长尾。国内和海外入口共用该面板。

**How to apply** 固定入口、组织、看板时间和同一曲线时间点，切换两个选项，核对标题、悬浮指标名及成功样本数。用同一桶的逐任务耗时分别复算平均值和 P95。回读[顶部 P95 / 最大值统计卡](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=2)的共享查询来源；趋势使用所选指标列，统计卡从原始汇总行保留 P95 和最大值。两处一起验收可发现切换趋势时误改统计卡或额外显示一列的问题。

#### 后处理瀑布的分段均值与总时长对账

**Why** 2026-11-27 回读 [06 后处理瀑布](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=122) 的分段均值及共享明细查询。图上的黑条表示距 Worker 完成日志的平均起点，绿条表示本段平均耗时。审核开始早于 Worker 完成日志的任务可有有效的审核服务耗时，但当前瀑布的审核及审核后放行均要求审核区间落在 Worker 完成日志至 Zeus 公开成功之间。水印有自己的有效样本，柱尾只能按对应行的样本解释。

**How to apply** 用[阶段统计范围](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=131) 对齐入口、组织、公开成功窗口与任务数。成功任务较多时核对最近关联子窗口。用 [全链路耗时明细](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=120) 查有效样本量及 Worker 完成日志到首次公开成功的后处理均值。若外部统计从模型 `Step5: Post Process Done` 起算，按同一 Job 补算从该事件到 Worker 完成日志的交付区间。若用 Athena 审核计时，确认是否从审核入队起算、是否纳入其他审核终态及审核早于 Worker 完成的样本。Athena 回调排队沿本页「Athena 终态 HTTPS 回调积压造成 Zeus 在途偏高」核查，同一终点区间内的等待勿重复加算。

## 四阶段耗时的均值和图例

- [02 · 任务运行，四阶段耗时面板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=17)。2026-11-27 核对，均值与各阶段的分位数应复用同一个过滤和校验后的样本，在原聚合查询里加 `AVG` 即可，避免为新增统计重复取数。
- 横向条形图若已通过 Grafana 图例隔离某些序列，保存后的 `hideSeriesFrom` 排除式匹配也会隐藏新列。为新列加入可见名单，保留原有默认显示，再用固定短窗口核对数据源返回和页面图例。

## 分逻辑组耗时的统计切换

- [02 · 任务运行，模型 / 逻辑组耗时比较](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks?viewPanel=19)。2026-11-27 核对，均值对各阶段的有效耗时直接求平均。切换统计口径时保留原有逻辑组选取和排序边界，避免 LIMIT 前换排序改变比较对象。用固定短窗口核对两种口径的分组、样本数和值。
- 在 Grafana 11.5 的表格上方可以用原生文本链接切换隐藏变量，同一张表按变量查询所选统计。链接应携带时间和筛选并聚焦原表。在此实例，文本链接插值的 `${__url_time_range}` 不带问号，发布后应从实渲染链接核对参数和点回原口径。
