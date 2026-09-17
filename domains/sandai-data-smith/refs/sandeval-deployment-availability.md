---
name: sandeval-deployment-availability
type: reference
created: 2026-09-17
updated: 2026-09-17
tags: [sand-eval, deployment, availability]
links: []
---

# Sand Eval 部署期间页面不可用诊断入口

**Why:** 测试与生产的 Web 发布策略不同，不能把部署期间的 503 一律解释为生产滚动更新故障。2026-09-17 只读核验发现测试环境 Web 的先停后起策略及单次发布二次重启机制；未取得用户那一次请求的 ALB 日志，不能据此断言生产故障原因。

**How to apply:** 先确认域名与实际 Ingress、Deployment，再比对代码和当次集群事件。部署策略与副本数应实时读取，以下只保存定位指针。

- 初始化测试 Web 策略：`sand-eval/platform/scripts/prepare_test_resources.py` 中 `web["spec"].update`。
- 发布时的副本数及沿用策略：`sand-eval/platform/scripts/deploy_test.py` 中 Web JSON patch；检查它是否更新 `strategy`。
- 二次 Web 发布：同文件先替换 Pod template 并等待 rollout，再部署 QC Worker，随后 `kubectl set env` 开启 QC admission，重新等待 Web rollout。
- 生产策略与健康探针：`sand-eval/platform/k8s/deployment.yaml`；前端静态资源与 API 同在 Web Pod，静态页面也受整个 Pod 是否可接流量影响。
- 2026-09-17 集群事件证据：测试 Web 于北京时间 20:55:20 旧 ReplicaSet 从 1 降为 0，20:55:31 新 ReplicaSet 才从 0 升为 1，20:55:50 新 Pod 仍有启动 readiness 502；20:56:49 与 20:57:00 再次出现先降零后拉起。探针的 502 不等于用户响应的 503，错误来源需结合入口日志核验。
- 优化方向需先审查测试初始化迁移、新旧版本兼容及 Worker 并行条件，再考虑 Web 滚动更新和 QC 激活方式。生产已有滚动策略时不应照搬此根因。

## 2026-09-17 现场链路闭环

- 用户浏览器测试站错误页正文为 `503 Service Temporarily Unavailable`，页脚 `alb`；公网 curl 于北京时间 21:10:09 同样返回 HTTP 503、ALB 错误页。
- 对应 [测试发布 Run 35223112476](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/35223112476) 的 Deploy job 于 21:06:39 开始；Web 旧副本在 21:06:56 降零。新 Pod `sandeval-dev-667dfcfb8f-xm4fz` 于 21:07:35 创建，21:10:51 仍无 nodeName/PodScheduled 条件，Service Endpoints 为空。
- 新 Pod 在 21:11:10 获调度，21:11:22 Ready；21:11:33 公网测试站和生产站首页均返回 HTTP 200。新 Pod 从创建到获调度耗时 3 分 35 秒；旧副本降零到新 Pod Ready 共 4 分 26 秒。该区间是集群服务空窗，不是连续逐秒 HTTP 采样。
- 调度器 Lease 当时持续刷新，未获得 FailedScheduling 原因；不能把等待具体归因于 CPU/内存不足。
- 发布失败的放大路径见 `deploy_test.py::handle_deploy_failure`：某些校验失败会主动 scale Web 到 0。本次捕获的停机发生在新 Pod 等待调度期间，未证明由失败分支触发。
- [成功 Run 35222474958](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/35222474958) 的发布阶段与 20:55 和 20:56 两轮替换对应，说明 CI 发布成功并不证明发布过程不中断。

## 2026-09-17 调度日志继续取证

**Why:** Pending 只能定位阶段；应区分资源筛选失败与排队等待，避免误建议盲目扩容。

**How to apply:** 在同 Project 的 `scheduler-c7a4a4cf4049c494ca6dea4aaf1e7f9b9` 查询精确 Pod 名；`content` 未开启 SQL 统计时使用 `set session mode=scan;`，不修改线上索引。所有下列时间为北京时间。

- 故障 Pod 在 21:07:35.012 收到 Add event；21:09:19.160 / 21:09:31.163 记录进入 Active queue；直到 21:11:10.172 开始 Attempting to schedule，21:11:10.203 成功绑定。选点与绑定约 31ms，evaluatedNodes=1055、feasibleNodes=578。证实主要延迟发生在排队/入队阶段，而非该 Pod 无可用节点。
- SLS 精确扫描，Unix 秒范围 1789650455 至 1789650670：`Attempting to schedule pod` 共 5060 次，其中 data-operator 4862 次；`Unable to schedule pod` 共 4466 次，其中 `yxp-raw-video-sp-detect-normal*` 4441 次。数字是日志事件次数，不是唯一 Pod 数。
- 21:07:35 的离线任务失败样本：0/4813 nodes available，1638 Insufficient cpu、1638 Insufficient memory、3102 affinity/selector mismatch、73 untolerated taint。条件计数可重叠。
- 实时配置核验的关联工作负载：data-operator 下 `yxp-raw-video-sp-detect-normal` 与 `...-normal-two`；副本数、资源和优先级需实时读取，不把快照用作今后扩缩容依据。此次两者均无 priorityClassName，Eval 故障 Pod priority=0。
- 结论分级：Web Recreate 导致发布空窗为确定根因；本次长空窗发生于调度队列等待为日志确定事实；同优先级离线任务的大量不可调度重试造成共享调度拥塞，是这些证据支持的高置信解释。未获得调度器 CPU/锁剖析，不能把入队延迟进一步断言为某个内部锁或 CPU 瓶颈。
- 应先修 Web 可用性，再评估在线业务非抢占调度优先级和离线并发容量治理。仅隔离节点池未必隔离共享调度器队列；仅加副本而保留 Recreate 仍会先删除旧一代。

## 修复入口

- [PR #1312](https://github.com/world-sim-dev/sandai-data-smith/pull/1312) 持有测试 Web 滚动发布、非抢占 PriorityClass 与第一阶段失败恢复的变更。合并、Gate 和部署状态以 PR / workflow 为准，不把代码提交等同于运行态修复。
- **Why:** 只改滚动策略仍可能被发布失败分支的 scale-to-zero 抵消。
- **How to apply:** 检查正常发布和失败恢复两条路径；恢复应绑定本次预检通过的旧配置，并用 API 返回的默认化模板做并发前置条件。QC Worker 替换前仍需确认所有 Web 停止受理。

## PriorityClass 权限与发布隔离

- [测试发布 Run 35228629545](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/35228629545) 在 Web 修改前停止；2026-09-17 只读授权检查确认当前操作者不能读取或创建集群级 PriorityClass，不能把该资源权限当作 namespace 发布权限的一部分。
- [PR #1316](https://github.com/world-sim-dev/sandai-data-smith/pull/1316) 持有优先级显式启用及默认滚动发布路径。权限和部署状态以当前 RBAC、工作流和 Deployment 为准。
- **Why:** 增加可选调度优化不能阻塞解决停机的滚动更新；初始修复把两者绑定成了同一个前置条件。
- **How to apply:** 上线前分别核验 namespaced Deployment 与 cluster-scoped PriorityClass 的权限。默认不访问 PriorityClass；显式启用时仍校验其值、非全局默认和 Never 抢占策略，不因权限错误悄悄跳过检查。

## 发布成功后的节点移除与调度边界

**Why:** 滚动发布的可用性保证不覆盖单副本所在节点被移除；提高调度优先级也不能让已删除的节点继续服务。

**How to apply:** 用户再次报错时重新绑定故障窗口，比较 Deployment generation、ReplicaSet、Pod UID 和 nodeName。先读节点事件，再核对节点标签及资源生成、发布脚本里的硬性亲和性；不要把上一轮 HTTP 200 采样延伸成长期健康结论。

- 2026-09-17 北京时间 22:02:24 节点 `cn-shanghai.192.168.103.95` 变为不可调度，22:02:44 记录 RemovingNode；随后 API 返回 NotFound。原 Web Pod 消失，22:03:34 同一 ReplicaSet 创建替代 Pod，22:03:59 Ready；Deployment generation 仍为 180、镜像未变。这轮发生在 [成功发布 Run 35230023499](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/35230023499) 后。
- 当次模板没有 affinity/nodeSelector；替代节点标签实测为 SpotAsPriceGo，说明在线测试 Web 仍可落到可回收计算节点。代码入口是 `prepare_test_resources.py` 删除 affinity，及 `deploy_test.py` 沿用无约束模板。
- `ack-operator-system` 的 cleaner 日志显示 22:02:25 提交 38 节点释放批次、22:03:26 完成；尚未取得该批次精确节点清单，当前身份读取 SpotNodePoolCleaner CR 被 Forbidden。因此不能仅凭同窗时间断言该 cleaner 删除了故障节点。
- [PR #1322](https://github.com/world-sim-dev/sandai-data-smith/pull/1322) 持有 Eval Web/QC 常驻非 Spot 节点约束和发布回读检查；当前运行态以 PR/Gate/集群为准。保留单副本意味着仍不能容忍任意常驻节点故障，跨节点多副本需要单独验收。
