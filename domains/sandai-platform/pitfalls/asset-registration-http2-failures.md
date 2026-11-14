---
name: sandai-api-platform-asset-registration-http2-failures
type: pitfall
created: 2026-11-15
updated: 2026-11-15
tags: [sandai, api-platform, athena, okhttp, http2, performance, evidence]
links: [sandai-api-platform-load-test-network-error-attribution, sandai-api-platform-performance-testing-entrypoints]
---

# 素材依赖 503 要拆开注册连接与文件上传

**Why:** 2026-11-15 上海十图 URL 压测的只读诊断中，Zeus 的 INPUT_PREPARATION / AssetDependencyException 只表明输入准备依赖失败。应用日志将异常栈截断后，无法区分源素材下载、Athena 注册、OSS PUT。ARMS 样本补出 HTTP/2 写请求头阶段的 Broken pipe，以及读取响应头阶段的 REFUSED_STREAM，两者都落在部署版本 ArtifactClient.performUpload 的注册调用行，而非后面的文件 PUT。Athena 服务端大量 HTTP 200 与这种“取得 HTTP 响应前失败”可以同时存在。

**How to apply:**

1. 固定 runId、活跃发送窗口、Pod 和部署提交；先从客户端台账与服务端 requestId 摘要对齐 503，再用原始 Trace ID 查 ARMS。Request ID 与 Trace ID 不混用；若跨服务追踪未传播，不能仅凭时间把 Athena 成功请求归给失败的 Zeus 请求。
2. 将源 URL GET、Athena POST `/public/api/v1/artifacts/`、签名 OSS PUT 分别归因。异常类和文件行号需对照实际镜像的源码提交；方法名含 upload 不代表已经上传文件。
3. 读取受控的异常消息、HTTP/2 错误码和因果栈。不得导出认证头、签名 URL 查询参数或完整业务请求。应用安全日志若在最外层耗尽截断预算，应改为独立记录安全的 root-cause class/code、依赖阶段及目标主机。
4. 检查连接恢复与请求体可重放性：该现场版本既配置 retryOnConnectionFailure(false)，也把字节数组元数据正文标成 isOneShot=true。修复不能只打开全局重试；先将小型注册元数据与不可回放的文件输入流分开，针对 REFUSED_STREAM 等有“未处理”保证的错误作有界重试。普通 Broken pipe 不能一概视为服务端未受理，须按是否发出、幂等键和注册对账处理。
5. 一次生成带十张图会放大注册和上传调用量。按每阶段实际请求数、连接池、Pod/节点和时间分布观察，不用入口 50 QPS 直接代表依赖侧 50 QPS。异常集中于单 Pod 支持连接路径/池状态候选，不等于已证明节点或 ALB 配额故障。
6. HTTP/2 的 REFUSED_STREAM 表示对端在应用处理前拒绝流，可以重试；但它本身不能区分并发流限制、连接生命周期或其他入口策略。若 ALB 详情权限不足，明确保留未知，不将“带宽不足”“ALB限流”或“空闲连接过期”写成已证实根因。必要时在授权范围内对注册客户端做 HTTP/1.1 对照；对照成功仍需限定因果范围。

## 证据入口

- 源码：[部署提交 8a4424a 的 ArtifactClient](https://github.com/world-sim-dev/zeus/blob/8a4424a91f6caf65b91a506b61310d1799a24bf0/modules/infra/src/main/java/co/sandai/zeus/infra/infer/ArtifactClient.java#L159-L190)，第168行注册 POST，第190行 OSS PUT；源码可能变化，后续运行重新核对实际镜像。
- [ARMS Broken pipe 样本](https://arms.console.aliyun.com/#/full-trace-detail?regionId=cn-shanghai&traceId=64def63de949a2aadc638e25e3129862&hidTopBar=true&mode=normal&querySource=&source=trace&startTime=1794672093207&endTime=1794672993207&from=1794672093207&to=1794672993207)，北京时间 2026-11-15 00:04:08；同一时间窗 REFUSED_STREAM 样本 Trace ID `2752775602cb2ad984ed3b25c3166606`。追踪留存可能过期。
- 本机 API 工作区 `.local/cn-url200-shanghai-continue503-20261114/REPORT.md` 与 `runs/cn-20261114T160142-mixed-bda267d3/result-server-snapshot.json`：本轮结果、失败阶段和 Pod 分布的私有指针；这两个既有文件未补写本次 ARMS 诊断，深层异常依据为上述 Trace。
- [HTTP/2 RFC 9113 §8.7](https://www.rfc-editor.org/rfc/rfc9113.html#section-8.7)：REFUSED_STREAM / GOAWAY 的未处理保证及重试边界。

本次只读排查未修复、部署或重新发压；ALB 入口已确认，详细 AlbConfig 因 RBAC Forbidden 未读到。上述规则不代表修复已验证。
