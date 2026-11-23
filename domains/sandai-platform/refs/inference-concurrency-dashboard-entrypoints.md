---
name: sandai-inference-concurrency-dashboard-entrypoints
type: reference
created: 2026-11-23
updated: 2026-11-23
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
