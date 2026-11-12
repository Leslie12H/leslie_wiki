---
name: sandai-api-platform-performance-testing-entrypoints
type: reference
created: 2026-10-27
updated: 2026-11-12
tags: [sandai, api-platform, performance, testing, quota]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-openapi-quota-entrypoints]
---

# API 平台压测方案入口

**Why:** 2026-10-27 用户要求制定 API 平台压测方案和提前准备清单。生成接口受理、长时任务执行、轮询请求和计费存在不同瓶颈，单看 HTTP 202 或虚拟用户数无法给出业务容量。

## 去哪里看

- 可评审方案：`/Users/leslie/Documents/ChatGPT/Apipltform/docs/performance-test-plan.md`；工作区根 README 有导航。负载阶梯、建议 SLO、预算、准备项、分工及执行状态都以该文档和后续正式报告为准，本文不保存变化中的数值。
- 创建 RPM：Zeus `modules/domain/.../platform/quota/GenerationRateLimiter.java` 与 v2 `OpenApiGenerationService.java`；查询限流查 `GenerationController.java` 和 `RateLimitHelper.java`，不得把创建配额直接用于轮询。
- 派发与占位：Zeus `docs/openapi-task-dispatch.md` 和 `modules/domain/.../task/dispatch/`；外部 processing 状态与真实下游执行数要分别取证。
- 费用：`OpenApiTaskEnqueueService.java` 的扣费/入队事务、当前计费契约及测试组织流水。fake 是否计费、异步失败费用及退款能力执行前重新核对。
- 既有测试原件：工作区 `postman/reports/` 的配额、联调和参数专项；历史配置与缺陷不可当作当前部署结果。

**How to apply:** 先确认预测峰值、环境、有效配额、预算与观测，再分开验证配额正确性、fake 平台容量、真实模型吞吐和故障恢复。用到达速率与任务耗时估算执行并发，用在途任务量与轮询间隔估算查询量；创建与追踪分开编排，保留未知任务和费用证据。方案中的门槛为评审建议，只有执行报告才能证明容量。停止新增请求后仍需追到既有任务终态或明确未决状态，再对账与恢复配置。

## 2026-10-27 飞书方案与观测核查

- 飞书评审文档：[API 平台压测执行方案与观测清单](https://j0yswlgboxz.feishu.cn/docx/Q88sdPyI9oZ43xxuFtnc5QyXnPg)。本地核查指针：工作区 `docs/observability-readiness.md`。大盘链接、权限、环境和数据新鲜度随执行重新验证。
- 指标存在与大盘可用分开：调度/配额 JSON 接口、ARMS overlay、Prometheus 示例分别沿源码回查；不能据此宣称业务指标已被采集或某环境大盘已有数据。
- 核对调度字段语义：`TaskDispatcherRuntime.snapshot()` 的本地组织工作队列/耗时，与业务 WAITING/任务排队分开；`TaskDispatchWorker.maxSelectedWaitingAgeMillis` 为历史最大值，不能替代当前全队列最老等待。
- 费用规则以 `TaskDispatchStateService`、`TaskFailureRefundPolicy`、`TaskCreditRefundService` 和当前部署有效开关/流水核验；旧调度说明中的失败退款描述可能落后于实现。验收覆盖应退、已退、待处理及重复退款。

**Why:** 运维模板、累计快照和旧说明都容易被误作实时业务观测，导致压测通过而积压或补偿问题未被发现。

**How to apply:** 先让运维给出目标环境大盘并用冒烟证明数据变化，再补业务队列/真实执行/费用只读采样；无法访问时明确保留未核实，不能断言不存在。

## 2026-10-27 阿里云看板交付入口

- 用户明确选择阿里云看板作为交付位置，暂停本地网页路线。配置入口为工作区 `monitoring/aliyun/README.md`，相邻 Grafana 导入文件、JSON exporter 映射与采集任务示例以原文件为准。
- 现有业务 JSON 经独立 exporter 接入阿里云 Prometheus，再由托管 Grafana 展示；ARMS 已采集的基础指标优先复用，实际查询从目标应用面板获取。配置准备不等于已部署或已有实时数据。
- 官方指针：[阿里云自定义可观测页面](https://help.aliyun.com/zh/arms/application-monitoring/use-cases/custom-observable-page)、[prometheus-community/json_exporter](https://github.com/prometheus-community/json_exporter)。

**Why:** 监控应运行在团队的云端系统中；缺少登录或数据源不能默认为用户接受本地替代交付。

**How to apply:** 先核对管理 Dev 的账号、地域、现有工作区编辑能力及数据源，再绑定和验证云上看板。业务代码可不改，但采集配置/组件仍需建设；采集器仅内网开放，逐实例采集进程计数。

## 2026-10-27 CMS 原生看板与接入验收

- 正式云端入口：[API 平台 Dev · 限流与调度](https://cms.console.aliyun.com/hybrid-monitor/dashboard2/custom/akpvcwp0891o2k374f6jfubgdd)。配置、当前接入状态及证据指针在工作区 `monitoring/aliyun/README.md` 和 `docs/observability-readiness.md`；不在知识库保存账号名额或实例数量等可变快照。
- 云监控 CMS 原生模型与标准 Grafana 模型分开：原生备份 `cms-dashboard.native.json`，标准 Grafana 备份 `grafana-dashboard.json`。CMS 导入校验成功不等于组件可渲染，导入原生 JSON 会新建大盘；必须核对真实面板类型、表达式和刷新后的持久化。
- 权限授权可能因工作区账号名额失败，申请提交不等于权限已生效；核对返回结果，不删除其他用户或自动购买升级。实例下拉无选项只是当前账号可见范围的结果。

**Why:** 云端容器存在、组件渲染、数据源绑定、近期采样和业务健康是不同证据。看板为空不能被解释为指标正常。

**How to apply:** 用原生 JSON Model 读回面板数与查询，再刷新验收。部署内网 exporter、逐实例抓取并绑定真实 Prometheus 实例后，用正常活动核对 up、心跳、新鲜度和计数变化；此后才能作为压测观测入口。

## 2026-10-27 Dev 采集实施清单

- 可执行步骤与各阶段验收看工作区 `monitoring/aliyun/implementation-runbook.md`；目标身份以当前部署为准。Dev 环境从 Zeus `deployment/README.md` 回查，不能混用并存 overlay 的 namespace。
- dispatcher 指标的提供条件从 OpenAPI `TaskDispatcherHealthController.java` 与有效配置核对，不能把普通 API Pod 上的 404 推断为整个环境没有指标。

**Why:** 模板、运行角色与采集目标不一致，会产生空面板或误采其他环境；固定 Pod IP 在重建后也会失效。

**How to apply:** 先验证各角色源 JSON，再验证 exporter 输出、自动发现、数据源查询和面板联动；这条链路与真实压测任务及费用确认分别验收。

## 2026-10-27 已授权后的实际接通验收入口

- 持续变化的部署、任务、指标数量、新鲜度与面板保存结果，查工作区 `monitoring/aliyun/README.md`、`exporter.k8s.yaml`、`scrape-config.dev.json`，以及忽略目录 `.local/aliyun-dashboard/connection-test/`。飞书方案第 10 节同步接通状态，不在知识库复制运行快照。
- 既有实例列表要等加载完成再判断缺失；CMS 原生面板的实例选择必须保存后刷新，并从 JSON Model 回读每个查询的 `clusterId`。在编辑器看到选中不等于配置已经持久化。
- 官方 JSON exporter 的缺字段行为可能为 HTTP 200 且无样本，因此验收应同时检查预期指标存在、抓取 UP 和近期调度心跳；不能用 UP 单项代替完整性或业务健康。
- 独立 namespace 创建被拒绝时，先判断现有授权命名空间能否容纳仅选中采集器的受限资源；不为监控主动授予角色或改业务 Deployment。实际清单与回退以工作区文件为准。

**Why:** 采集组件 Ready、Prometheus UP、指标完整、近期心跳与面板持久化各自可能独立失败，单一绿灯会掩盖空面板。

**How to apply:** 先逐源核对，再查完整指标与心跳，最后保存、刷新、逐图验收。真实压测仍需独立确认流量、预算、任务终态、HTTP 延迟和费用证据。

## 2026-10-28 延迟、积压与 GPU 补齐的查证口径

- 排队时间回查 Zeus `TaskDispatchMapper.java` 的 enqueue/saveControl/touch：`dispatch_updated_at` 会被控制信息和重试触碰更新，不能直接作为首次入队时间。`TaskDispatchWorker.java` 当前按 createTime 计算的年龄是创建年龄；精确排队等待需沿真正入队时间或事件查证。
- HTTP 分位数先核对实际 ARMS 应用及可用 quantile；官方指标说明不保证具备 0.95。跨实例总体分位数应沿原始耗时或可聚合直方图计算，不能平均各 Pod 的 P95/P99。官方入口：[ARMS 指标](https://help.aliyun.com/zh/arms/application-monitoring/developer-reference/application-monitoring-metrics)、[Micrometer 分位数与直方图](https://docs.micrometer.io/micrometer/reference/concepts/histogram-quantiles.html)。
- 实际下游从 `TaskDispatchWorker` 的 AthenaDispatchClient 回查；GPU 监控归属以模型运行集群为准，不默认属于 API ACK。安装方式与限制查[ACK GPU 监控](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/enable-gpu-monitoring-for-a-cluster)。

**Why:** 重试更新时间、已受理状态、API 所在集群与服务端分位数都可能被误作真实排队、执行或用户延迟证据。

**How to apply:** 分开采集压测客户端耗时、服务端 HTTP 耗时、真实业务任务状态与模型执行资源。只读聚合先核对环境、API 来源、终态排除与查询成本；缺数据显式暴露采集失败，不补零。


## 2026-10-28 Dev ARMS 与只读 SQL 采集入口

- 当前实施与验收看工作区 `monitoring/aliyun/README.md`、`cms-dashboard.native.json`、`task-metrics.k8s.yaml`、`task-sql-collector.json`、`scrape-config.task.dev.json` 及原飞书方案第 11 节。数据库、应用 PID、面板数、样本值、数据源 ID 等可变状态只在实施记录保存，不复制到知识库。
- ARMS 的指标存储来源与业务 ACK Prometheus 可以是两个不同实例。先按真实 Pod 的 ARMS 应用标识匹配实际数据源；兼容的 HTTP latency 指标可能混入 Scheduled rpc，按规范化 HTTP 路径过滤，并实查 quantile 是否存在。
- SQL exporter 的连接入口是 dburl URL，不能直接拼原生驱动的 tcp() DSN；用户名和密码需 URL 编码，避免特殊字符及变量展开。配置检查只证明格式，不证明数据库可连或 SQL 返回指标。官方入口：[SQL exporter 源码](https://github.com/burningalchemist/sql_exporter/blob/master/sql.go)。
- 控制台异步菜单可在关闭动画中保留旧 DOM 和宽度；菜单点击前检查实际可见性并等待前一个菜单完全关闭，保存后刷新逐项比对原有查询。复制面板和在编辑器看到新标题不构成持久化验收。

**Why:** 相似的实例名、兼容指标、驱动格式以及残留菜单均可让“看似配置完成”偏离真实数据源或修改了错误面板。

**How to apply:** 先锁定当前运行配置和来源，凭据只在集群内存中处理，以只读会话和受限查询采集；再验证预期指标、两层采集健康与快照年龄，最后从正式面板导出实际样本并比对保存前后的原有查询。任务创建年龄与精确排队、SUBMITTED 与 GPU 运行继续分别报告。


## 2026-10-28 多租户负载与采集可信度分层

- 用户目标从单租户突发纠正为多个独立租户同时发压；最终数量、节奏、费用与准备状态以工作区 `docs/dev-multitenant-load-plan.md` 为准。单组织运行原件在 `postman/reports/load100-2026-10-28T06-40-31-142Z/`，指标字典在 `docs/dev-dashboard-metrics.md`。
- 创建配额按组织隔离；同组织多个账号/Key 不自动成为多个租户。多租户容量同时报告逐组织和总量的实际发出、受理、完成、延迟、等待与费用，区分大量限流提前拒绝与真正达到业务负载。
- 查询 GET 有独立限流，沿 `GenerationController.get`、`RateLimitHelper.checkFlowControl` 与当前有效配置核对。轮询被拒绝会延迟发现终态，不能把“读到终态的时间”当成真实完成时间。
- 采集可信度与性能结论分开：up、快照/心跳年龄、来源与部署信息只限定观测是否可用；性能看有效吞吐、成功请求延迟、各类错误、积压与消退，业务正确性和定位资源另列。缺样本不能以旧零值宣称错误率为零。

**Why:** 单租户配额、查询节流和采集空窗可能让低有效负载看起来稳定，或让任务完成发现延迟被误认成生成耗时。

**How to apply:** 先锁定独立组织与模型/余额/配额，冻结逐组织到达速率和低频终态追踪；验证观测新鲜度后执行，报告实际负载、逐租户公平性和明确的采集缺口。先前单租户突发结果不能充当新的多租户场景验收。


## 2026-10-28 专用测试身份、真实准入与原生指标迁移

- 执行与回滚范围回查工作区 `docs/dev-multitenant-load-plan.md`、`postman/scripts/DevLoadTenantFixture.java`、`DevLoadIdentityFixture.java`、`DevMultiTenantLoad.java`、`DevLoadReadback.java` 及忽略目录中的固定身份清单和独立读回。当前结果、组织 ID、费用和授权状态只保存于该次原件，不复制到知识库。
- 测试账号创建、组织余额、生成准入是不同条件。模型对所有组织开放仍可能因国内实名准入返回通用 permission_denied；沿 `DomesticAccessService`、`TaskDomainServiceImpl` 和实际认证状态核对，不先修改模型白名单。需要模拟认证时另行冻结并确认专用 Dev 身份、明确模拟标记和精确回滚，不复制真实用户认证、不请求真实提供商。
- 独立构造旧专项脚本中的服务前，先核对实际部署 SHA 的构造器与依赖。沿真实 `SessionService` / `OrganizationAccessService` / MyBatis 状态读取接入新增校验，不把缺依赖导致的异常当业务故障，不注入跳过校验的替身。临时会话及 Key 只在内存，退出后删除并从独立入口读回。
- 看板主视图按实际吞吐、成功请求尾延迟、业务积压、首次对外终态和恢复组织；源码指针为 `TaskMetrics` 与 `TaskModeration.publicStatusSql`。原始执行 Success 与审核后可交付 Success 分开。旧 JSON 采集随部署失效时，先验证当前原生指标和近期样本，再迁移查询；指标存在不能替代逐图导出数据验收。
- 字典与云端当前口径回查工作区 `docs/dev-dashboard-metrics.md`。原生直方图分位数是桶内估计，粗桶不能提供虚假的时间精度；客户端分位数、云端服务端分位数和任务端到端延迟各自保留口径。

**Why:** 登录、余额、公开模型和抓取成功可能同时成立，但生成准入、实际完成或当前看板仍不可用。把这些条件合并会导致用拒绝流量、过时零值或尚未审核的成功推断容量。

**How to apply:** 在完整负载内先验证一轮，每个租户核对真实准入与单位费用；按范围停发，未知 POST 不重试。保留逐组织客户端原件，独立核对公开任务状态、唯一扣费交易、积压消退和临时准入回滚，再报告可持续容量与未验证的 GPU 边界。


## 2026-10-28 云看板资源分母与短图例

- 当前布局、原生配置与实际 CSV 验收入口在 API 工作区 `monitoring/aliyun/README.md`、`cms-dashboard.native.json`、`docs/dev-dashboard-metrics.md` 和忽略目录 `.local/dashboard-polish-20261028/`；可变面板数量和资源峰值只存实施记录。
- 容器 CPU 核数沿 cAdvisor `container_cpu_usage_seconds_total`，工作集内存沿 `container_memory_working_set_bytes`；配额分母沿 kube-state-metrics `kube_pod_container_resource_limits`。核对 namespace、Pod、实际容器和资源单位，同 Pod 配对，重复采集取适当去重聚合；未设置 limit 不伪造百分比。JVM 堆、进程 CPU、容器总体资源与节点/GPU 分开命名。
- CMS 原生 Prometheus 查询的图例输入保存字段是 `legendFormat`；仅写 `legend` 不保证界面使用短图例。配置更新后，核对正式图例是否仍退回整段 PromQL 或 Pod 标签。编辑器 JSON 文本框可能只暴露当前窗口内容，不能将片段当全量原生导出；沿控制台实际配置读取/保存链路核对，临时签名 URL 与安全字段不进入持久化原件。

**Why:** CPU/内存图即使有数据，放得过深、分母含糊或图例充满内部标签，也难以用于压测定位；堆水位低并不代表容器整体内存低。

**How to apply:** 先证明每个目标服务有资源序列与 limit，再把 CPU/内存水位前移，用核数/MiB 图解释绝对用量，单独保留 JVM 图。保存后全配置独立读回，并从正式面板逐图导出实际样本；保持同一看板链接，不用占位数据证明完成。

## 2026-11-09 阶梯压测异常响应与账本对账

- 香港 Dev 多组织阶梯执行结论、未执行档位、部署范围、费用与阿里云截图见[飞书实测章节](https://j0yswlgboxz.feishu.cn/docx/Q88sdPyI9oZ43xxuFtnc5QyXnPg#doxcnKIVPZo0D4Ncb2p40IIPTUg)。回查独立数据库终态、结算和 Key/认证清理的证据入口为工作区 `.local/dev-fake-capacity-20261109/`。
- 发压端无 HTTP 响应或收到 5xx 时，服务端仍可能持久化并完成任务、产生扣费。沿冻结组织范围与数据库时钟起点核对当前公开终态映射、唯一扣费及退款。按状态分开记客户端收到的响应、云端服务端序列和数据库任务，未回执时只做范围对账，不猜逐请求映射。
- 复用部署内 Spring 配置构造 Dev 临时会话时，按实际运行配置优先级读取 overlay，再读回会话所属用户与组织。预检和实际发流分开保留启动证据。同 Pod 发压时把发压器纳入资源解释，短时流量依赖客户端时间戳而非分钟聚合速率判定。
- 看板的 API/调度抓取健康无法替代业务 SQL 快照有效性。等待、端到端延迟和数据新鲜度缺样本时明确列出，从限定范围的只读采样复查终态和停发后恢复。

**Why:** 请求返回、落库和扣费发生在不同时间。客户端全失败不能用来排除后台副作用，继续发压或补发会扩大影响。

**How to apply:** 阶梯发压使用每组织独立节奏和总量门槛，触发停发条件后收齐在途结果、确认终态与账本并清理临时访问。报告实际发流时长及未执行档位，区分实测异常档和可持续容量。

## 2026-11-09 生成入口 503 与发压超时分流

- 对照 [500 组织档复测与归因报告](https://j0yswlgboxz.feishu.cn/docx/Q88sdPyI9oZ43xxuFtnc5QyXnPg#doxcnEZnQRPBbJsbICY1ydGd7Xc) 回查两档的客户端异常分类、OpenAPI 容器日志、任务终态、账本和监控截图。原件只保留报告与本地证据路径 `.local/dev-fake-capacity-20261109/followup500/`，容量和时间样本随运行变化。
- 平台与 OpenAPI 是独立 Deployment。归因先读处理实际请求的 OpenAPI 镜像 SHA，再匹配 ACK 日志里的堆栈行号。准备线程池在 `GenerationPreparationConfig`，队列拒绝转 503、等待超时与落库/派发顺序在 `OpenApiGenerationService`。单看错误码 `service_unavailable` 或任务 `INPUT` 无法区分这些分支。
- 客户端分别留存 HTTP 状态、受限错误码和传输异常类。ACK 只取末尾行时把计数标为样本。单笔 202 通过精确任务 ID 回查公开终态与结算，时间范围采样按数据库列精度对齐并单独验证边界。

**Why:** 应用线程池拒绝、客户端等待到期和任务已成功可能在同一批流量中共存。毫秒查询边界还会漏掉同一秒写入的任务。

**How to apply:** 先用一笔请求核验创建、终态、结算，冻结正式发流上限。压测后按客户端、容器日志与业务数据库三层复查，保持已验证的生成结果和账本，避免重复发出未知请求。

## 2026-11-09 三档报告与图文输入集

- [香港 Dev API 压测报告｜200、400、500 组织档](https://j0yswlgboxz.feishu.cn/docx/RnH9dvHoTo8f2hxO2HacNWoonce) 保留三档数据和截图。带宽归属沿发压 Pod 实际连接 IP、域名 CNAME、ALB 实例与监控维度核对；独立物理专线只在链路证据能匹配时归入请求路径。历史阶段实发 QPS 与实时服务端窗口平均响应速率分别显示。
- 图文输入集的设计在 API 工作区 `.local/dev-fake-capacity-20261109/mixed-input-retest/dataset-design.md`。外部平台的输入数量与时长分布先核实统计口径、联合分布和目标部署模型变体。v2 创建协议沿 Zeus `docs/openapi-v2-generations.md` 回查。
- URL 首帧会增加 OpenAPI 到图片源站的流量，并进入图片导入和审核。组织内 assetId 引用适合作同图同文对照。两条路径分别保存实发、受理、终态与耗时。入口 ALB 与图片源站带宽分别核对。

**Why:** 合并异构模型统计或使用无关专线曲线会误判负载及瓶颈。只按数量分布生成随机输入也会破坏图片、文字与时长的关联。

**How to apply:** 冻结有来源和授权的图片与配套 prompt，用部署允许的组合归一分布并记录口径。按档使用同一分层与排序策略，给预检和各档确定独立账本与观测窗口。

## 2026-11-09 v2 图文连续升压与双口径对账

- [香港 Dev v2 图文压测报告](https://j0yswlgboxz.feishu.cn/docx/Hr4QdGt1XouDS1xkSFrcojCvnJy) 保存本轮逐档数据、秒级发压曲线和阿里云截图。证据目录为 API 工作区 `.local/dev-fake-capacity-20261109/v2-image-ramp/`。
- 固定发出节奏与在途并发分开。错峰组织用相同分钟相位，校验每组织四批、每批五次、各档分钟无空秒，独立记录启动时刻和响应完成时刻。压测端曲线给出实发速率，云看板采样给出服务端响应速率。
- v2 的 503 可以带 `details.generation_id`。沿 202 的任务 ID 与 503 的错误详情 ID 分别关联实际任务行，区分 HTTP 层状态、失败阶段、生成终态、扣费和退款。没有 202 的落库行不能直接记成孤儿或已扣费。
- 单笔预检若 202 且后台已派发，仍未到公开终态时，可把入口受理作为明确口径继续发流。保留该笔预检独立账本，正式窗口重新按数据库时钟设边界，恢复时复用原回执，避免重复创建。

- 同一错误码可能来自不同分支。把 ACK 容器日志按发流档位计数，保证查询未被字节限制截断，再按实际镜像 SHA 对应源码行。对有界执行器拒绝和图片审核异常分别计数。日志摘要和部署链接见飞书报告。
- 飞书 XML 回读与页面看到的内容可能不同。页面表格出现重复且原文回读为单份时，检查浏览器翻译层。沉浸式翻译可在单元格插入额外译文，切回原文后按所有单元格复查，避免误删原文。

**Why:** 分钟聚合会抹平短时错峰曲线。图片准备失败和生成未完成也可能同时出现，只汇报 HTTP 结果会掩盖下游积压。

**How to apply:** 冻结图片 URL 与模型变体，先核对分档预算和单笔真实链路。结束后同时比对秒级客户端回执、错误详情中的任务 ID、只读队列快照与账本，最后读回临时 Key 和模拟认证的清理结果。

## 2026-11-10 输入准备线程池看板口径

- [香港 Dev 图文压测报告](https://j0yswlgboxz.feishu.cn/docx/Hr4QdGt1XouDS1xkSFrcojCvnJy) 和工作区 `.local/dev-fake-capacity-20261109/v2-image-ramp/` 的日志汇总与客户端回执可按档绘制拒绝与受理。真实活跃线程数与队列深度需要运行时指标，不能从 HTTP 503 或 CPU 反推。
- 沿实际部署的 `GenerationPreparationConfig` 和 `OpenApiGenerationService` 核对执行器、提交点和异常映射。一个图文请求可以拆成提示词审核和首帧处理两份执行器工作；执行器计数与 HTTP 计数使用不同分母。

- 香港 Dev [现有阿里云大盘](https://cms.console.aliyun.com/hybrid-monitor/dashboard2/custom/akpvcwp0891o2k374f6jfubgdd) 已保存输入准备面板。按实际 Pod 的启动参数、环境、外置配置和部署 SHA 核对默认值是否生效。运行读回与看板原件在 API 工作区 `.local/dev-preparation-pool-20261110/`。
- Actuator 上出现 `executor_*` 时先核对 `name`，Dev 的 `taskScheduler` 序列不能用于请求的 `generationInputExecutor`。新埋点使用已在 PodMonitor 保留规则中的 `openapi_*` 前缀，发布后先读 Pod 的指标端点，再验云端按 Pod 序列。任务级 `input_review` 与执行器细分 P95 分开命名，空样本留空。

**Why:** 独立线程池可以在容器 CPU 尚有余量时因依赖等待、突发提交和队列上限而拒绝工作。

**How to apply:** 按 Pod 同时对齐活跃线程与上限、队列深度与容量、每秒拒绝数和排队耗时分位数。排队耗时按成功入池工作从提交到开始执行计量，阶段耗时按提示词审核、首帧下载和图片审核独立记录。高频突发结合拒绝计数器核对，避免低频队列采样漏掉瞬时满队列。

## 2026-11-12 国内与美国生产压测准备和收尾

- 执行稿见工作区 `docs/production-load-test-runbook-20261112.md`。两地环境卡、值守填表、阶段升降判定、轮询与预算算例、精确对象清理预览及验收表均随该文档核对。生产参数以实际签核和现场冒烟为准。
- 目标入口以[国内 OpenAPI 契约](https://api.sandai.cn/openapi.json)和[美国 OpenAPI 契约](https://api.sand.ai/openapi.json)回查，核对 servers 和 API 方法。运行版本、支付币种、模型路由和采集归属沿 Zeus `deployment/magi/`、实际部署回执及[两地生产监控实施记录](https://github.com/world-sim-dev/zeus/blob/7db539d43e95f1d43933ae3ad920b8b3856079d7/deployment/reports/prod-cn-observability-audit-20261106.md#2026-11-07-生产实施记录)回查。公开契约可读只证明入口可读。
- 国内准入、美国模型权限、参数组合与组织级配额各自预检。历史正反样本见[生成验证入口](v2-input-validation-entrypoints.md)，配额原始覆盖和继承恢复见[管理后台验证入口](admin-rpm-change-verification-entrypoints.md)。生产额度的来源、币种、可用期和处置规则以当次批准及账本为准，勿搬用 Dev 模拟认证或赠送额度做法。
- 对照[生成与素材接口](https://platform.sand.ai/docs/api-reference/)和当次部署的 `PlatformAssetController`、`AssetService.deleteAssetById`、`ImageAssetImporter` 核查删除语义。素材 API 回读和对象存储回收分别验收。首帧 URL 导入可能为任务生成内部素材，不能只清上传接口返回的素材 ID；输出、缩略图、播放列表等需按任务归属与引用核对对象清单。公开生成接口的状态枚举不能证明存在取消入口。
- 费用收尾沿[充值入账查证入口](recharge-settlement-entrypoints.md)及本页退款和账本指针。保留任务、正式流水、账单及审计回执；测试数据从业务统计排除时使用冻结的组织清单。实际资金调整使用相应财务和原支付渠道流程。

**Why:** 独立测试组织可隔离凭据、配额与账务归属，入口、审核、调度和模型资源仍可能共享。停发、任务终态、资产可访问性、存储回收与财务结算各有独立完成条件。

**How to apply:** 两地分开定窗口、硬预算、流量上限和停发值守人。发流前冻结区域、run ID、组织和 Key 标识、配置与账务基线，验证小样本和监控数据；逐档按实际发送、受理、完成及客户基线决定是否升压。停发后低频追踪在途及未知受理，按任务对账，预览并复核本批待清资产精确清单，再按归属回收临时资源。恢复覆盖和继承状态，回读有效配置、权限和残留，未决任务或差额保留责任人和复查时间。2026-11-12 准备方案阶段仅查公开契约、源码与历史记录；同日新增看板的建设入口见下节。未执行生产压测或清理。


## 2026-11-12 双生产 CMS 压测看板

- 主入口：[API 生产压测 · 国内 / 美国](https://cms.console.aliyun.com/hybrid-monitor/dashboard2/custom/bqr0ki00956g4iku1pfwlcu059)；固定并排入口：[API 生产压测 · 双区对照](https://cms.console.aliyun.com/hybrid-monitor/dashboard2/custom/5dt4f1qdcp013goi13jdw9t9uc)。配置与验收记录见 API 工作区 `monitoring/aliyun/production-load-dashboard.md`，构建器在同目录 `build-production-load-dashboard.mjs`。面板数量、布局及可维护备份与当次独立回读核对，分别维护现有 ID；原生导入会另建大盘。
- 2026-11-12 主视图已保存为顶部原生 Prometheus instance 区域单选，默认国内；对照视图保留两地固定数据源。默认值与实例地域映射沿回读配置的 `attribute.variables` 核对，不能只检查面板标题或手写的下拉默认值。切换时同时核对实际查询请求的 `regionId`、`clusterId`、精确环境及 namespace 条件和返回标签。默认国内、切换美国及切回国内的首屏真实路由已核验，所见请求地域与集群正确、反区表达式为空；这项验收不表示当前全部查询已逐条重跑。Grafana 的 SSO 与 CMS 查询权限分别验证。
- 验收原件在工作区 `.local/prod-load-dashboard-20261112/`：`regional-readback.json`、`comparison-readback.json` 为两视图配置回读，`backlog-validation.json` 为队列查询核验，`region-cn-routing.json`、`region-us-routing.json`、`region-cn-return-routing.json` 为主视图国内、美国及切回国内的首屏实际路由回执，`comparison-routing.json` 为固定双区对照首屏回执。最终页面目检见 `main-final.png`、`comparison-final.png`，两份当前可维护备份为 `monitoring/aliyun/cms-production-load.native.json` 与 `monitoring/aliyun/cms-production-load-comparison.native.json`。此前首版与展示优化版的全量查询证据继续保留，与本次首屏往返验证分别记录。采样密度、窗口、样本门槛和当前缺项沿建设说明与 `docs/production-load-test-runbook-20261112.md` 查证，不复制即时任务数量或资源数值。
- 阶段定义回查 Zeus `TaskLifecycleStage.resolve`、`TaskSnapshotReader` 和 `TaskMetrics.tags`，按实际部署 SHA 核对。待派发 / 待确认队列使用 `queued`，对应平台 WAITING，可含提交中、未知回执待确认及重试；沿 `TaskDispatchStateService.reserveAttempt` / `submissionFailed` 查控制状态。`input_review`、`preparing`、`executing`、`output_review` 分开观察，尤其不能把 executing 或全部在途叫作待派发积压。
- 当前最老任务等待年龄及等待超阈值存量的接入状态沿建设说明核对；`TaskDispatcherRuntime` 的组织工作队列和 `openapi_dispatcher_work_oldest_seconds` 描述进程内组织调度工作，不是业务任务队列数量或最老等待年龄，不能用它们补缺项。阶段耗时直方图统计已退出阶段的样本，也不能替代仍在等待任务的当前年龄。

**Why:** 页面刷新频率不等于源端采集频率；rate 窗口中只有一个样本时会产生空结果。查询成功、已有零速率、缺少事件序列、低样本分位数与完整链路验证也分别有不同含义。区域标题变化不证明请求切换了数据源，生产全量的既有在途任务也不能直接归属当次压测；把 executing 或组织工作年龄当积压会进一步误判瓶颈。

**How to apply:** 建图前用 count_over_time 核对实际采样密度，选择含足够样本的速率窗口并写清平滑范围；需要更快停发时独立核对运行器或采集配置。保存后独立回读原生模型，再执行最终表达式、检查非空覆盖和页面曲线。UP 仅反映已发现目标，还须与当前部署期望目标核对；快照须有有效 leader、抓取与新鲜度保护。成功事件未产生、无错误序列或样本不足时保留空值，不能宣称零错误或延迟达标。HTTP 202 只表示受理，公开成功终态也不包含客户端查询等待或媒体下载。新生错误计数器可能因窗口内只有一次采样而没有有效 rate，不能把这种空值补成零错误。首屏口径卡和延迟前的样本图用于提示这些边界。实际发送、受理批次结果和费用使用本轮台账，待补的输入准备、客户分类或真实模型指标沿建设说明处理。

区域视图验收须覆盖默认打开与国内 / 美国往返，检查真实请求地域、实例和结果归属，再更新完成结论。队列查询保留 stage/model/task_type 维度去重；仅在同一完整有效 tasks 快照的 total 存在而 queued 无序列时允许锚定零，阶段与 total 使用相同 leader、up 和新鲜度保护。无有效快照继续留空。此规则依赖完整快照语义，不能套用于仅有一次采样的新生 HTTP 错误计数器。
