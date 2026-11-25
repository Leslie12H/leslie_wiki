---
name: ack-nodepool-pinned-worker-capacity
type: pitfall
created: 2026-11-25
updated: 2026-11-25
tags: [ack, kubernetes, inference, autoscaler, scheduling]
links: [ack-node-scale-down-topology-spread-cni]
---

# ACK 节点池绑定下的 Worker 容量核算

**Why:** Pod 的 `nodeSelector` 若同时绑定 ACK 节点池 ID 和业务标签，新增到其他池的节点无法承接。目标池为手动模式时，集群启用节点自动伸缩也不能代替该池扩容。硬 `podAntiAffinity` 可进一步要求相同 hostname 只能放一个命中的 Worker。调度时还会按可分配资源和已预留的 requests 计算 CPU 余量。

**How to apply:** 先从实际 Pod 的事件和 YAML 查 `FailedScheduling`、`NotTriggerScaleUp`、requests、节点池 ID、污点容忍和反亲和，再对照节点池伸缩模式和活动时间。手动池用 ACK 调整目标池的期望总节点数。按同一反亲和范围内的副本数规划节点，并计入滚动更新的 `maxSurge`。需要新增兼容池时，核对硬绑定的选择器是否也要调整。节点池活动成功后，继续核验 Node Ready、Pod Scheduled/Ready 和工作负载可用数，再用业务队列看是否消除积压。

## 2026-11-25 上海生产回查

- `inference-prod/preprocess-worker` 的事件曾出现 `NotTriggerScaleUp`，候选自动伸缩节点不匹配选择器。其绑定的 `inference-prod-critical` 当次采用手动模式。10:33 的独立伸缩活动 `asa-uf6j2a5mljlfb07ed5js` 成功新增 6 台，后续节点分布可从 ACK 复核。两种结果对应不同阶段的操作。见 [目标节点池伸缩活动](https://cs.console.aliyun.com/#/k8s/cluster/c9838d6fa878b43c59a6d37586f0c0747/v2/nodePool/np55bdebcf785c4a62976fcd8adc6fe194/info?tab=scaleActivities&region=cn-shanghai&ns=inference-prod)。
- 当次预处理模板的 hostname 硬反亲和同时匹配预处理与后处理 Pod。回读两类 Pod 分布时，目标池 15 台均已有其一，仍有两个预处理 Pod Pending，最新调度事件同时报告 CPU 不足。生产副本数、模板和节点数以现网为准。见 [预处理 Worker](https://cs.console.aliyun.com/#/k8s/cluster/c9838d6fa878b43c59a6d37586f0c0747/v2/workload/deployment/detail/inference-prod/preprocess-worker/pods?region=cn-shanghai&ns=inference-prod)、[后处理 Worker](https://cs.console.aliyun.com/#/k8s/cluster/c9838d6fa878b43c59a6d37586f0c0747/v2/workload/deployment/detail/inference-prod/postprocess-worker/pods?region=cn-shanghai&ns=inference-prod) 和 [ACK 手动扩缩容说明](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/scale-a-node-pool)。
