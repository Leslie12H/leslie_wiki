---
name: sandai-platform-openapi-production-signal-alerts
type: reference
created: 2026-11-26
updated: 2026-11-26
tags: [sandai, openapi, alerting, sls, prometheus, athena]
links: [sandai-api-platform-development-entrypoints, sandai-platform-production-error-alerts-entrypoints, openapi-organization-task-volume, sandai-inference-concurrency-dashboard-entrypoints, sandai-platform-admin-balance-grant-entrypoints]
---

# 开放平台生产信号告警接入

2026-11-26 核对组织建单、公开终态和共享推理池的告警设计。阈值、运行状态、通知策略以生产告警规则为准，先验证取数，再回读已启用规则的实际配置。

**Why:** 组织建单减少影响入口流量，公开终态失败率反映用户结果，共享推理池就绪数反映可接单容量。三者时间语义和责任归属不同。共享池覆盖多个入口，重复按入口评估会造成重复通知。技术失败规则的分母是技术失败加成功，整体失败率纳入所有公开失败，取消单列。

**How to apply:**

- 组织建单沿[组织任务量查证](openapi-organization-task-volume.md)定位双区 `RequestOutcome` 字段、有效创建路由和组织归属。固定地区、组织和窗口，按首次成功创建的任务 ID 去重。高优先级组织先用 SLS 独立评估，配合[同期比较](https://help.aliyun.com/zh/sls/interval-valued-and-periodicity-valued-comparison-functions)或预聚合基线。正常采集时保留显式零值，查询失败、采集缺失或基线覆盖不足时进入独立的数据状态。2026-11-26 试查时，双区上周同一窗口均未匹配创建路由，昨天同期有行。验证历史覆盖时将同期函数输出与固定日期的独立查询和 SLS 告警查询状态对照，再测试低量和完全归零窗口。
- 公开终态沿 [Zeus Prometheus 规则](https://github.com/world-sim-dev/zeus/blob/dev/deployment/observability/prometheus/openapi-alerts.yaml)、[生产规则生成器](https://github.com/world-sim-dev/zeus/blob/dev/deployment/observability/prometheus/render-production-rules.py)和[生产实施记录](https://github.com/world-sim-dev/zeus/blob/dev/deployment/reports/prod-cn-observability-audit-20261106.md)查证。使用首次公开终态计数增量，按入口比对历史基线。合并入口时先汇总成功数、失败数再计算比率。核对最小样本量和各失败阶段，沿 [业务大盘](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/openapi-business-v1) 和 SLS 定位。
- 推理 Worker 沿[并发资源看板查证](inference-concurrency-dashboard-entrypoints.md)检查 [06 共享池](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=1)保存的数据源。就绪与在线状态关联同一 Worker 的新鲜心跳和采集副本，按实际池、模型和逻辑组去重。用独立的采集健康检查区分失联与可确认的容量下降，结合既定容量和队列确认升级条件。测试分组完全消失和采集源中断。
- 发布前回查同口径现有规则、责任人和恢复路由。用历史事件回放及静默评估校准阈值。分别确认告警评估、飞书送达、恢复消息和看板链接，保留可复算的时间窗和样本量。

## 2026-11-26 组织可用余额耗尽与生成拒单

**Why:** 2026-11-26 北京时间 06:55:17 起，美西 Higgsfield 的创建请求摘要记录 `stage=CHARGE`、`errorCode=INSUFFICIENT_CREDITS` 和 HTTP 400。两条创建路由均命中，受理量在随后一小时几乎归零。请求已取得任务 ID 时仍可能在扣款环节失败。组织流量异常通常晚于首次余额拒单，区域 API 错误计数也可能只覆盖部分路由。是否有规则实际通知须查告警历史。

**How to apply:** 按 `orgId` 和创建路由查询[美西 Zeus SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/co_sandai_zeus_prod?slsRegion=us-west-1)，按请求业务码、阶段、时间分桶，对照受理成功量。兼容 Ark 的对外错误码与请求摘要字段沿 [ArkErrors](https://github.com/world-sim-dev/zeus/blob/dev/modules/openapi/src/main/java/co/sandai/zeus/openapi/compatible/ark/ArkErrors.java)核对。面板统计、原生告警查询状态和通知回执各自回读。对重点组织及时通知余额拒单，并从 [Admin 余额口径](admin-balance-grant-entrypoints.md)与 [任务扣费](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/credit/refund/TaskCreditChargeService.java)校验可用批次、扣费单位及到期时刻。用已提交消耗估计剩余时长，同时设按组织配置的绝对下限和采集新鲜度。变更余额后沿账本核验入账，再核对组织出现实际受理成功。

### 首笔拒单回放与固定金额阈值

2026-11-26 北京时间 06:00–08:00 的结构化请求摘要按分钟回放，Higgsfield 美西在 06:56 的第一个符合条件的评估时点进入告警，窗口结束前保持同一轮告警。LibTv 上海未返回同码拒单。回放按事件时间，线上评估时点还受入库延迟和调度影响。以稳定的组织和地区为告警身份，核对首次通知、重复等待和恢复行为。原生 SLS 评估及飞书送达沿[生产日志告警查证](production-error-alerts-entrypoints.md)回读。

固定余额阈值沿 [Admin 余额 API](https://github.com/world-sim-dev/zeus/blob/dev/docs/admin-api.md#余额明细与金额口径)读取 `amount`、`currency` 与 `asOf`。阈值和采样使用同一站点的主货币单位，可用额度来自未到期的正余额批次。内部积分字段另有换算口径。自动采集需要站点 `billing.read` 权限，按组织维护越阈状态，区分余额恢复和采样失效。

### 双区拒单上线与飞书、语音路由

2026-11-26 启用 [Higgsfield 美西规则](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/alert/alert-1795660220-268061?slsRegion=us-west-1) 与 [LibTv 上海规则](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/alert/alert-1795660220-513956?slsRegion=cn-shanghai)。回读规则的各自生产日志库、查询窗口、条件、重复等待和行动策略。按用户要求复用已有开放平台生产电话策略。该策略含两条飞书集成与生产值班组语音，恢复通知在余额拒单规则中关闭。上线后两区原生评估均成功，当次回读窗没有达到触发条件。发送结果须沿真实告警的通知历史核验。

**Why:** SLS 规则能够显示已启用，但查询统计若未完成原生预览和确认，会保留旧的日志库与时间参数。两条规则最初因日志库为空而返回 `InvalidMethod` 和 `/logstores//logs`。

**How to apply:** 编辑查询统计时选定生产项目、日志库和窗口，先执行预览，再确认子弹窗和外层规则。保存后独立回读实际查询源和窗口，再看 `internal-alert-history` 的最新成功评估。涉及升级电话时先查当前行动策略的飞书集成和语音接收组，再只替换目标规则的路由。回放用固定历史窗口取数，触发和真实送达分别验收。

2026-11-26 用户明确固定余额阈值由阿里云侧运行。服务端余额采集可复用 [Zeus 只读余额 SQL](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/credit/dao/UserCreditMapper.java) 与 [快照采集器](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/observability/snapshot/BusinessSnapshotCollector.java) 的租约和新鲜度，以固定的组织范围读取，再由 ARMS 评估。首次启用先核对生产查询计划、地区和币种。余额采集在本次交付时仍是本地代码，生产无此阈值通知；桌面巡检已暂停。

### 余额阈值可直接查库

2026-11-26 复查 [Grafana MySQL 告警](https://grafana.com/docs/grafana/latest/datasources/mysql/alerting/) 与 [SLS 外部 MySQL 数据源](https://help.aliyun.com/en/sls/associate-log-service-with-a-mysql-database)。能取得对应生产组织的可用余额时，可以用日志服务或 Grafana 的数据库查询告警。Zeus 内部采集是给 Prometheus 提供指标的另一条接入路径。当天只读点查时，核对的可执行通用 MySQL 数据源未命中目标组织，另一个数据源查询失败。该结果只约束已查连接。

**Why:** 管理台能查余额，代表 Zeus 服务可在自身环境内访问账本。告警平台需要独立核验其数据源实际覆盖的生产地区、组织和只读权限。

**How to apply:** 按地区先点查已知组织，再用 [Admin 余额接口契约](https://github.com/world-sim-dev/zeus/blob/dev/docs/admin-api.md#余额明细与金额口径)复核余额与币种。沿现有 SQL 聚合有效的组织余额批次，显式区分组织不存在、采集失败和实际余额为零。若走 SLS 外部存储，先核对同地域 VPC、既有网络授权和只读源，再用实际告警查询评估历史与实时窗口。


### 生产 PolarDB 直读与管理台对账

**Why:** Grafana 的 MySQL 数据源名称不代表实际库。2026-11-26 回读时，`Zeus-Prod` 指向 `zeus`，`Zeus-Gaga-Prod` 指向 `zeus_gaga`。Magi 开放平台余额使用 `zeus_magi`。

**How to apply:** 从 [上海部署配置](https://github.com/world-sim-dev/zeus/blob/dev/deployment/magi/structure/prod-cn/policy.json)和[美西部署配置](https://github.com/world-sim-dev/zeus/blob/dev/deployment/magi/structure/prod-us/policy.json)定位 PolarDB，再从生产集群详情的「登录数据库」进入对应地域的 DMS。美西走 `dms-us-west-1.aliyun.com`，上海走 `dms.aliyun.com`。查询前确认库名和查询权限。按组织 ID 锚定 `organization`，对有效的组织级余额批次使用索引点查，额度为零与组织未找到分开处理。存储过期时间按 UTC 判定，内部积分按部署中的每单位换算率转换。用先后两次管理台查询夹住同一时间段的数据库点查，保留查询时间和原始积分，处理活跃扣费造成的读数变化。

2026-11-26 美西 Higgsfield 的 DMS 结果与同秒段管理台的 USD 金额及原始积分一致。上海 LibTv 的管理台币种确认为 CNY，DMS 实例需独立登录，当次未完成库端对账。交互式 DMS 的查询授权和云端告警的独立连接各自验收。固定金额阈值启用前，需验证监控运行身份的只读连接和同地域网络。按 [SLS 外部 MySQL 数据源文档](https://help.aliyun.com/zh/sls/associate-log-service-with-a-mysql-database)核对 PolarDB 连接方式，文档列出的接入类型为 RDS、ADB 和 ECS 自建 MySQL。

### 组织任务受理量告警

2026-11-26 上线 [Higgsfield 美西](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/alert/alert-1795664347-345200?slsRegion=us-west-1)与 [LibTv 上海](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/alert/alert-1795663921-666304?slsRegion=cn-shanghai)两条任务量规则。规则以生产 `RequestOutcome` 去重后的成功受理任务数做 30 分钟日同比，并预留日志入库缓冲。11 月 26 日北京时区的回放在 07:35 命中 Higgsfield，30 分钟受理 25 单，昨日同期 1,132 单。当天同时段的 LibTv 未命中。

**Why:** 首次拒单定位已知业务原因，受理量同比能捕捉其他原因造成的流量下降。按完整的比较窗口验证可解释两类规则的触发时间差。

**How to apply:** SLS 选中生产日志库后先执行查询预览，再确认查询统计。用 SQL 同比函数取昨天相同时间窗，由 SLS 的连续触发阈值判断持续下降。界面选中「SLS通知」后还要打开输出开关再选择行动策略。保存后独立回读实际日志库、查询文本、连续阈值、重复等待、输出开关与行动策略，分别核验原生执行结果和真实送达。

### 指标告警回放与通知路由

2026-11-26 以生产 ARMS Prometheus 数据按区域回放首次公开任务终态。用近 15 分钟失败占比与此前两小时基线比较，加上最小样本量和持续时间，候选条件命中上海 2 段和美西 3 段。共享池 Worker 以在线、就绪和新鲜心跳做去重计数，过去 24 小时的候选跌幅无命中。Worker 的全量采集丢失需单独评估，避免把指标缺失当成容量为零。

**Why:** ARMS 开放平台原策略只绑定一个飞书机器人。两群与轮值电话已在 SLS 行动策略配置，两个产品的通知对象各自管理。

**How to apply:** 对新增 Prometheus 规则独立标记和路由，先核对现有开放告警接入和模板。可通过[阿里云 Prometheus 接入 SLS](https://help.aliyun.com/zh/sls/ingest-managed-service-for-prometheus-alerts-into-log-service)复用 SLS 去重和通知。使用开放告警应用前，核查接口授权和目标策略，避免同一个事件同时匹配两条发送链路。


### SLS 直接读取托管 Prometheus 时序库

2026-11-26 启用 [上海整体任务失败率](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/alert/alert-1795666109-918036?slsRegion=cn-shanghai)、[美西整体任务失败率](https://sls.console.aliyun.com/lognext/project/workspace-default-cms-1552113873580453-us-west-1/alert/alert-1795666535-488746?slsRegion=us-west-1)与[共享推理池就绪 Worker 数下降](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/alert/alert-1795666556-502943?slsRegion=cn-shanghai)。回读三条规则的实际时序库、表达式、连续触发阈值和现有双飞书群及生产值班电话行动策略。首次检查时三条规则的 SLS 执行成功率为 100%，真实电话送达须沿首次命中的通知历史核对。

**Why:** 托管 Prometheus 的底层 SLS 时序库可以直接承担同一查询的云端评估。美西生产日志 Project 中看不到同名时序库，数据实际在 Prometheus 实例所关联的云监控工作空间 Project。按实例的实际存储位置核实时序库是否存在。

**How to apply:** 从真实 [Prometheus 实例](https://cmsnext.console.aliyun.com/next/home?workspace_region=us-west-1&redirect_app=app/prom/instance)详情的「存储位置」打开关联的 SLS MetricStore，再点查关键指标。参照 [SLS 时序告警](https://help.aliyun.com/zh/sls/create-an-alert-for-metric-store)查询并另存为告警。先在时序库验证正常窗口和历史窗口，再核对告警中的 `promql_query` 为点查、使用采集缓冲和本地区的指标库。查询应仅在故障条件满足时返回行。查询统计对话框要等待预览完成再确认。逐规则回读配置和原生运行历史，恢复通知和重复等待以生产策略为准。

2026-11-26 复查 DMS 发现，美西 `sandai-us-prod` 是安全托管免登录实例，当前账号能交互式查询，完整功能目录未开放新版数据服务。上海 DMS 的安全访问代理列表未返回可用实例。旧 [DMS `ExecuteScript` API](https://help.aliyun.com/zh/dms/product-overview/announcement-executescript-openapi-upgrade) 已下线，核查云端调用时需要验证实际可用的[新版数据服务](https://help.aliyun.com/en/dms/data-service-new)或专用只读数据源。分别验收交互式查询和告警服务长期可用的连接。
