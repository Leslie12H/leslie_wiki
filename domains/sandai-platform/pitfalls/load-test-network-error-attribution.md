---
name: sandai-api-platform-load-test-network-error-attribution
type: pitfall
created: 2026-11-14
updated: 2026-11-14
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
