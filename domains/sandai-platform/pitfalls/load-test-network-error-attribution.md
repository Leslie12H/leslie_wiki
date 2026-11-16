---
name: sandai-api-platform-load-test-network-error-attribution
type: pitfall
created: 2026-11-14
updated: 2026-11-16
tags: [sandai, api-platform, performance, network, undici, evidence]
links: [sandai-api-platform-load-generator-readiness, sandai-api-platform-performance-testing-entrypoints]
---

# 压测 networkError 不等于已经定位到网络设备

**Why:** 2026-11-14 美西压测调查发现运行器在同一 catch 中处理 fetch、读响应体和客户端正文大小保护，却只保存 networkError 布尔值，丢失 cause。聚合还优先用 network 替代 HTTP status，可能把已有响应头的信息隐藏。另有历史任务持续轮询，使创建 QPS 与实际 HTTP 总流量相差很大；Pod CPU 饱和、扩容滞后与连接失败同时发生，也不能直接证明它们之间的因果链。

**How to apply:**

1. 钉住实际 runId、发送窗口、冻结 release/hash 和运行 Node/Undici 版本；从固定台账前缀重算，保留原始报告。不要把其他同名 QPS 轮次或当前 Pod 累计计数拼成历史原因。
2. 同时统计 networkError 和原始 HTTP status、request/trace ID 是否存在。status=null 表示客户端未取得 HTTP 响应头；它仍不能证明服务端没有接受请求。未知生成 POST 保留对账，不自动重发。
3. 用白名单保存 exception name、cause/code、失败阶段、已收头标记及耗时；不记录完整 header、URL、请求正文或原始异常 message。DNS/TCP/TLS/收头/读体阶段分别观察，HTTP 延迟和调度延迟分开。
4. 对集中在固定时长的失败，核对客户端内置连接计时器与请求总超时。Node v24.5.0 内置 Undici 7.12.0 的默认 connector 计时为 10 秒，HTTPS 等 secureConnect 才清计时；创建/查询 AbortSignal 更长不等于连接计时更长。耗时吻合只支持候选，确认错误码仍需 cause。
5. 创建、历史任务查询、新任务查询、排空查询分别核算 QPS/失败；累计错误门槛拆分继承错误、当前创建、查询尝试及终态失败。若旧 collector 没保存 byte length，说明“匹配回执数量的前缀重建”，不声称恢复了原子快照。
6. 同窗口读 ALB 连接/TLS/带宽、应用 CPU 与 CFS 限流、HPA 策略、Pod 实际 Ready 时间和数据库等待。CFS 周期限流占比不等于丢失 CPU 时间。ALB 是共享实例全量；60 秒采样不能排除更短尖峰，零 rejected/upstream connection error 不能排除到 ALB 前的故障。无实际限额证据不声称带宽打满。

源码版本依据：[Node v24.5.0 fetch](https://nodejs.org/download/release/v24.5.0/docs/api/globals.html#fetch)、[Undici v7.12.0 connector](https://github.com/nodejs/undici/blob/v7.12.0/lib/core/connect.js#L49)、[fetch cause](https://github.com/nodejs/node/blob/v24.5.0/deps/undici/src/lib/web/fetch/index.js#L215)。运行版本变化时重新核对。

当前取证指针：API 工作区 `.local/magi2-us-network-investigation-20261114/REPORT.md`；同目录 `client-statistics.json` 为固定前缀统计，`source-analysis.md` 为 catch 复现和版本依据，`cloud-*-history.json` 为历史监控原始回读，`server-503-*.json` 为服务端关联证据。具体轮次数字、Pod 和配置只留在证据，不把本页当实时状态。

## 2026-11-16：大正文带宽、HTTP 并发与建连超时

**Why:** 大正文的目标 QPS 可能先超过发压节点的网络能力，随后请求占槽变长、HTTP 并发触顶，尚未发送的预准备意图被撤销。连接超时、API 请求耗时升高与这一过程同时出现，仍不足以逐请求归因，更不能据此认定业务 CPU 饱和。

**How to apply:**

1. 用完整 HTTP 正文字节数（含 Base64、JSON）×目标 QPS×8 核算正文带宽，再留协议开销和同节点流量余量。沿 Runner Pod→Node→实际 ECS 规格→默认路由/NAT/公网出口核对基础带宽、突发条件和实际限额；回环内存测试不证明网络容量。HTTP 并发所需量约为 QPS×平均请求占槽时间，增加并发或延长超时都不能补足物理带宽。
2. 分开重建逐秒实发、HTTP 在途、调度延迟和未发送原因；创建 HTTP 上限不等于 Undici Pool 连接数。核对当前内置 connector：若默认为10秒，HTTPS在 `secureConnect` 后才清除计时，DNS/TCP/TLS均可能涉及；较长的请求总超时不会覆盖它。核验 FastTimer 实现后再解释成组超时；499ms tick 形成的批次不能作为 CPU 卡顿证据。正式新进程也不会继承准入进程的暖连接。
3. 云监控60秒平均不能代表更短突发的峰值；将带宽能力不足与具体失败原因分开。ECS网络调度丢包为零只覆盖该指标，不能排除限速排队或其他链路丢包；累计TCP计数必须有窗口差分，不能直接归到本轮。
4. 按当前部署源码确认 `TraceIdFilter`/`RequestOutcome.elapsedMs` 的计时边界。其 filter chain 内可包含剩余正文读取、JSON/Base64解析、同步 inline 资产上传和任务受理，不是纯业务 CPU 时间，也不含进入 filter 前的全部网络等待；没有分段计时就不分摊耗时占比。
5. 即使发压节点能力不足已证实，也保留未关联的 UNKNOWN；已知 task 全部终态只证明已知范围。没有逐连接阶段或关联入口日志，不把已确认的容量瓶颈写成每条连接超时的最终根因，也不自动重发。

诊断与版本依据只沿 API 工作区 `.local/cn-inline-10mb-50qps-20261116-r1/DIAGNOSIS.md`、同目录 `diagnosis-*` 证据目录回查；当前节点规格、吞吐、云指标与逐请求未证实范围不固化为通用结论。
