---
name: ark-output-resolution-pricing-key
type: pitfall
created: 2026-11-24
updated: 2026-11-24
tags: [sandai, ark, magi-2, resolution, pricing]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-media-functional-acceptance-entrypoints, sandai-platform-production-error-alerts-entrypoints]
---

# Ark 成片分辨率与计费档位

**Why**　Ark 创建参数指向模型支持的生成档位，查询接口的 `resolution` 源自交付资产的像素短边。宽画幅成片可能产生 `946p` 这类实际尺寸。按秒计费的调用方若用该字段重做价格查表，可能找不到有效单价。按各服务实际计费入口回查这个推断。 [Ark 查询源码](https://github.com/world-sim-dev/zeus/blob/f04eae7afef28dd3941d9a2ff18ffffff0c52782/modules/openapi/src/main/java/co/sandai/zeus/openapi/compatible/ark/ArkGenerationController.java#L116) · [Zeus 受理计费](https://github.com/world-sim-dev/zeus/blob/f04eae7afef28dd3941d9a2ff18ffffff0c52782/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/OpenApiTaskEnqueueService.java#L92)

**How to apply**　从同一任务的创建入参或 Worker accepted 记录取生成档位，用 Worker 编码尺寸和交付资产元数据解释 Ark 输出。按任务 ID 分别核对 Zeus 首次公开终态和扣费流水，再按轮询 Trace 或调用方请求 ID 确认价格 lookup 的参数来源。修复时由提交时的计费档位或定价快照决定单价，成片尺寸用于展示和交付验收。

2026-11-24 上海生产样本 `873731336906117` 在北京时间 00:01:56 由 Ark 受理，00:19:08 提交成功终态。按 [Zeus 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/co_sandai_zeus_prod?slsRegion=cn-shanghai) 找到 Athena Job `4740859`，在 [Worker 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 对照接单的 `1080p`、模型参数的 `2206×946` 与 00:18:32 的编码记录。该次取证未取得调用方报错原始记录、此任务 Ark GET 正文或实扣流水。
