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
