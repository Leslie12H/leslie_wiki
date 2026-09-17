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
