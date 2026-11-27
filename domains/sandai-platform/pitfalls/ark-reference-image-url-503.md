---
name: sandai-ark-reference-image-url-503
type: pitfall
created: 2026-11-27
updated: 2026-11-27
tags: [sandai-platform, openapi, ark, reference-media, sls]
links: [sandai-api-platform-development-entrypoints, sandai-openapi-task-config-dashboard]
---

# Ark 参考图 URL 返回 ServiceUnavailable

**Why:** Ark 创建生成请求的 `content[i].image_url.url` 是 `content` 数组从零开始的元素位置。Zeus 在生成受理前处理参考图，下载、Athena 素材注册和 OSS 写入中的失败都可能返回字段级 `ServiceUnavailable`。2026-11-27 双区只读核验观察到这些失败路径。HTTP 503、错误字段和 HTTP 响应时间只能定位到请求和输入项。是否有任务以及失败发生在哪一跳，须回查请求日志。 [Ark 错误映射](https://github.com/world-sim-dev/zeus/blob/b9a13124e27232ef794ab8b66d5bbadb7845de47/modules/openapi/src/main/java/co/sandai/zeus/openapi/compatible/ark/ArkErrors.java)

**How to apply:** 在 [上海 Zeus SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/co_sandai_zeus_prod?slsRegion=cn-shanghai) 和 [美西 Zeus SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/co_sandai_zeus_prod?slsRegion=us-west-1) 以 `httpStatus=503` 预筛，核对 Ark 创建路由、`errorCode=SERVICE_UNAVAILABLE` 和精确 `field`。按 `request_id` 去重，再用应用事件时间转北京时间。美西的 `zeus-default.log` 与 `error.log` 可重复采集同一请求，`__time__` 可相差约一分钟。缺应用时间时，以最早采集时间近似并标注口径。用同窗的受理日志检查双区索引有覆盖，避免把某个日志词的零命中解释为零流量。保留来源域名、`downloadReason`、`artifactStage`、`artifactReason` 和 HTTP 状态。下载报错可随被转发的流传播到 OSS PUT，出现两组字段时结合原始错误判断，勿把同一个请求计成两次。客户端返回无法区分源站或网络的问题。

覆盖参考素材重试的版本从 [Zeus #532](https://github.com/world-sim-dev/zeus/pull/532) 回查。对比双区运行中 OpenAPI Pod 的 `kube_pod_container_info.image_spec` 标签和提交祖先，再核对角色 ConfigMap 以及新 Pod 的运行配置。配置预置、合并和重试生效分别核验。2026-11-27 查询、去重样本和镜像证据在 API 平台工作区 `.local/ark-image-url-503-20261127/`。上海请求 `c1e52c82cfdd4b53ab8a015350016650` 可回查获取参考图超时，美西请求 `ac00e86a6659406cb26d21471e58c194` 可回查 OSS PUT 超时。

## 下载超时与重试

2026-11-27 从双区生产镜像对应的 [下载实现](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/infra/src/main/java/co/sandai/zeus/infra/http/PublicMediaDownloader.java#L30-L46) 核验连接和读取等待。区分逐次读取的等待阈值与完整图片下载耗时。带 `ImageTransferBudget` 的 Ark URL 下载沿共享的剩余预算设置总时限，下载器的无预算默认分支不适用于该路由。受理日志的 `elapsedMs` 包括其他请求开销，`SocketTimeoutException` 单独不足以区分连接和读取。素材准备预算看 [GenerationMedia](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/GenerationMedia.java#L37-L60)，注册及 PUT 看 [ArtifactClient](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/modules/infra/src/main/java/co/sandai/zeus/infra/infer/ArtifactClient.java#L48-L67)。确定实时值前须查运行中 Pod 的属性覆盖。2026-11-14 上海压测期间实配覆盖证据见工作区 `.local/cn-cpu-after-stop-20261114/deployed-timeout-settings.txt`。

外链临时超时可做有界重试。明确收到字段级 503 时可重提，收到任务 ID 后查该 ID，客户端自身超时则先核对是否已受理。`trycloudflare.com` Quick Tunnel 依赖源端进程存活，地址生命周期和鉴权按 [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/) 核对。可长期复用的图片优先使用可稳定直接读取的 HTTPS 地址，或上传后引用当前组织的 `asset://<id>`。 [Ark 素材用法](https://github.com/world-sim-dev/zeus/blob/0e755146c0d2bfc23e7e54a461c15682266d5007/docs/openapi-ark.md#L51-L53)
