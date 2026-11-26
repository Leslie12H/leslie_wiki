---
name: sandai-platform-openapi-production-signal-alerts
type: reference
created: 2026-11-26
updated: 2026-11-26
tags: [sandai, openapi, alerting, sls, prometheus, athena]
links: [sandai-api-platform-development-entrypoints, sandai-platform-production-error-alerts-entrypoints, openapi-organization-task-volume, sandai-inference-concurrency-dashboard-entrypoints, sandai-platform-admin-balance-grant-entrypoints]
---

# 开放平台生产信号告警接入

2026-11-26 核对组织建单、公开终态和共享推理池的告警设计。阈值、运行状态、通知策略以生产告警规则为准，本次只读验证取数。

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
