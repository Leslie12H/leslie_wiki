---
name: sandai-api-platform-performance-testing-entrypoints
type: reference
created: 2026-10-27
updated: 2026-10-28
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
