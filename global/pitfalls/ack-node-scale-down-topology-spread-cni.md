---
name: ack-node-scale-down-topology-spread-cni
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [ack, kubernetes, autoscaler, cni, topology-spread]
links: [sandeval-deployment-availability]
---

# ACK 缩容后的补副本调度与新节点 CNI 告警

**Why:** 节点缩容可驱逐正在运行的副本，ReplicaSet 会补建 Pod。按 hostname 的硬拓扑分布约束可能排除已有同类副本的节点，其余节点又可能因污点不可用，导致新 Pod 触发扩容。新节点初始化期间，调度到该节点的系统 Pod 可以先记录 `NetworkNotReady`。两类告警可能属于同一次缩容、补副本和扩容，但来自调度器和 kubelet 两个不同阶段。

**How to apply:** 在 ACK SLS `k8s-event` 中取消 Warning 过滤，用精确 Pod 名、ReplicaSet 和节点名串联 `ScaleDown`、`SuccessfulCreate`、`FailedScheduling`、`TriggeredScaleUp`、`RegisteredNode`、`NodeReady`、`Scheduled`、`AllocIPSucceed` 与 `Started`。在 ACK 的 Pod YAML 中回读 `topologySpreadConstraints`、`tolerations` 和 `status.conditions`，在 Deployment 中确认当前可用数。用旧 Pod 退出到替代 Pod Ready 界定补副本耗时，用户请求影响另查当时的服务入口指标。告警聚合窗口的事件条数不等同于受影响节点数或用户请求数。

## 2026-11-04 复查入口

- `sandai-us-prod` 的 `new-api-slave` 缩容与补副本事件以及同一新节点上的 `increase-inotify-limit` 告警，见 [SLS 时间窗口](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/k8s-event?slsRegion=us-west-1&encode=base64&queryTimeType=99&startTime=1793782800&endTime=1793783538&queryString=ZXZlbnRJZC5pbnZvbHZlZE9iamVjdC5uYW1lOiBuZXctYXBpLXNsYXZlKiBPUiBldmVudElkLmludm9sdmVkT2JqZWN0Lm5hbWU6ICJpbmNyZWFzZS1pbm90aWZ5LWxpbWl0LW1iZGpwIiBPUiBldmVudElkLmludm9sdmVkT2JqZWN0Lm5hbWU6ICJ1cy13ZXN0LTEuMTcyLjE3LjIuMTk3IiBPUiBldmVudElkLmludm9sdmVkT2JqZWN0Lm5hbWU6ICJ1cy13ZXN0LTEuMTcyLjE2LjE4My42MiI%3D)。使用 UTC+8 对齐事件和告警时间。
- 调度约束及当前副本状态从 [ACK Deployment](https://cs.console.aliyun.com/#/k8s/cluster/c7c0ede6c71484f8da34a829954c50cd9/v2/workload/deployment/detail/product-infra-platform/new-api-slave/pods?region=us-west-1&ns=product-infra-platform) 回读。历史事件用于说明本次机制，后续配置和健康状态须重新查证。

### 缩容决策的取证

- 在 ACK 节点池的「查看日志」入口选择实际执行决策的 `cluster-autoscaler` Pod。UI 仅显示最近若干行，回查旧窗口时用同一 Pod 的 Kubernetes 日志接口限定 `sinceTime`。日志按 UTC 对齐事件，优先找 `was unneeded for`、`Scale down status`、`Detailed evaluation` 和 `Scale-down: removing node`。最后一条会记录决策利用率和待迁移 Pod。缩容阈值按资源 requests 与节点容量口径解释。候选持续时长和扩容后静默期分别核验，不能从事件时间倒推候选何时进入可缩状态。
- 本次日志证实节点利用率低于阈值，且上一轮扩容的静默期到期后才执行。旧副本与补建副本同属一个 ReplicaSet，但缩容日志中旧 Pod 的实际 spec 无 `topologySpreadConstraints`，补建 Pod 的实际 spec 有按 hostname 的硬约束。比较实际 Pod spec，不能仅凭同一个 ReplicaSet 判断两次调度约束相同。约束的注入来源尚未核实。
- 缩容日志可能嵌入完整 Pod spec。查证时仅提取决策行或所需字段，避免输出原始 Pod JSON。
