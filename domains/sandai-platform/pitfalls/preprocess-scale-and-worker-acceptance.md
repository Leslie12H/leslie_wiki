---
name: sandai-preprocess-scale-and-worker-acceptance
type: pitfall
created: 2026-11-25
updated: 2026-11-25
tags: [sandai, athena, preprocess, prompt-enhancement, kubernetes, scheduling]
links: [sandai-inference-concurrency-dashboard-entrypoints]
---

# Athena 预处理扩容和推理 Worker 接单查证

**Why:** 2026-11-25 上午，生产 MAGI-2 的五分钟 Worker 接单数低于同一时段的 ready 数。上海前处理共享队列在同一批次窗口出现首尾帧准备积压，部分扩容副本未能调度。短窗口的接单 Pod 数、可用推理 Worker 数、预处理期望副本数分别来自不同事件或状态。

**How to apply:**

1. 从 [02 任务运行](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-tasks) 的共享预处理指标核对每个 step 的待处理量、采集健康和执行中任务。 `pp_prepare_frames` 是输入的首尾帧准备，含规范化、裁剪和按需超分，位于依赖它的 PE 之前。CI 和生产模型共用预处理指标及容量。用 [Athena 服务日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/inference-prod?slsRegion=cn-shanghai) 按 Job ID、model 对齐建单、PE 首次调用、PE 输出和 `services.job` 的 `Task … published to …`，分开计算 PE 调用耗时与建单到真正入推理队列的耗时。
2. 对比 kube-state-metrics 的 `kube_deployment_spec_replicas`、`kube_deployment_status_replicas_available`、`kube_pod_status_unschedulable` 和实际抓到的 `preprocess_worker_inflight_tasks` Pod。再去上海 [Kubernetes 事件日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/k8s-event?slsRegion=cn-shanghai) 用 `FailedScheduling` 检索，按 SQL 字段 `"object-namespace"`、`"object-name"` 找同一批 Pod，从 `message` 核对 CPU request、节点亲和性与污点。事件消息为结构化列。同一批 Pod 核对 `NotTriggerScaleUp`。2026-11-25 的 autoscaler 事件指向扩容候选节点模板不满足 Pod 的 node selector，需同时检查节点池模板标签及现有合格节点的可分配 CPU。
3. 从 [03 推理算力](https://grafana-cn-to345ha5507.grafana.aliyuncs.com/d/inference-v2-compute) 取 ready/online，从 [Worker 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/athena?slsRegion=cn-shanghai) 找 `task started, running tasks:`，按 Pod 精确去重并用更长窗口复核是否持续无单。注册名与日志 Pod 名在部分 logic group 有命名前缀差异。配对时验证唯一映射。GPU 利用率只代表有采样的 Worker。推理队列先按 broker 核对 `athena_queue_collection_success` 和期望源数，采集失败时不要把空结果解释为队列无积压。

生产回查可将 Grafana 窗口设为北京时间 2026-11-25 10:00–10:35，分开看 CI 突发与生产 MAGI-2 批次。运行数据以日志和实时指标为准。

## ACK 节点池容量查证

2026-11-25 在上海 ACK 回读 [preprocess-worker](https://cs.console.aliyun.com/#/k8s/cluster/c9838d6fa878b43c59a6d37586f0c0747/v2/workload/deployment/detail/inference-prod/preprocess-worker/pods?region=cn-shanghai&ns=inference-prod) 和 [postprocess-worker](https://cs.console.aliyun.com/#/k8s/cluster/c9838d6fa878b43c59a6d37586f0c0747/v2/workload/deployment/detail/inference-prod/postprocess-worker/pods?region=cn-shanghai&ns=inference-prod)。两者以 nodepool ID 和 workload 标签绑定 [inference-prod-critical](https://cs.console.aliyun.com/#/k8s/cluster/c9838d6fa878b43c59a6d37586f0c0747/v2/nodePool/np55bdebcf785c4a62976fcd8adc6fe194/info)，对两类 Pod 均应用按 hostname 的硬反亲和。计算容量前回读实际 Pod 规则和当前期望副本。约束生效时每台节点最多承载两类 Pod 中的一个，合格节点下限为两类工作负载的期望副本之和，还需为滚动升级及节点维护留出余量。扩容后以新增节点 Ready、Pod Scheduled 和两个 Deployment 的 available 数验收。手动调整期望节点数见 [ACK 文档](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/scale-a-node-pool)。
