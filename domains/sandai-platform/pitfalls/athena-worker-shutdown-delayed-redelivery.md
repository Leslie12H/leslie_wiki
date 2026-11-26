---
name: sandai-athena-worker-shutdown-delayed-redelivery
type: pitfall
created: 2026-11-26
updated: 2026-11-26
tags: [sandai, athena, celery, redis, redelivery]
links: [sandai-inference-concurrency-dashboard-entrypoints]
---

# Athena Worker 关停后任务长时间未重投

**Why:** 2026-11-26 从国内 LibTv 的 Grafana 06 成功任务最大 E2E 查到一例。B300 Worker 已接到消息，收到 SIGTERM 后等待运行任务结束超时，随后恢复未确认消息的操作也超时。虽然日志标记 `reject requeue=True`，同一个 Celery 任务 ID 直到与首次接收相隔约五小时才在 S5000 被接收并完成。间隔与源码中的 Redis 可见性超时匹配，旧 Redis 投递记录及具体触发关停的控制面事件需要独立取证。

2026-11-26 同 Pod 补查到 Celery Redis 订阅读超时，随后有重连成功。该分片的首次收到发生在重连之后，接着才是 SIGTERM、关停恢复超时和再次接收。按 `Connection to broker lost`、`Connected to redis`、同一 Celery ID 的 `received` 和关停栈分别对时。关停日志的超时来自消费事件循环未执行恢复操作。断链与 SIGTERM 或该恢复操作之间的因果关系仍需控制面和 broker 侧记录。

**How to apply:** 读取 [06 面板](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-concurrency?viewPanel=2) 当时的地区、组织和时间窗口。沿当前面板的底层查询复现最大值，按原成功分母和耗时计算保留任务 ID。对应同一 Zeus `task_submitted` 的 Athena Job ID，点查前处理、首次入队、GPU 开跑、成片审核和首次公开成功。Athena 的入队至开跑包含 Worker 收到消息后到 GPU 开跑的等待，按实际接收事件继续切开。

在[上海 Worker 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai)用完整 Celery 任务 ID 对齐同一次分片的两次 `received`，按首次接收 Pod 和秒级窗口回查 SIGTERM、drain、恢复未确认消息的超时及 `Reject`。看到 `requeue=True` 时，继续确认接收或 broker 恢复凭据。用两次接收之间的间隔对照部署的 `visibility_timeout` 和 `task_acks_late`，不要用关停时刻代替首次接收时刻。查当前推理 Worker 镜像和实际设置；旧源码只作入口。 [Worker 传输配置](https://github.com/world-sim-dev/athena-admin/blob/main/Coworker/coworker/celery_worker.py) · [Celery Redis 重投语义](https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/redis.html#visibility-timeout)
