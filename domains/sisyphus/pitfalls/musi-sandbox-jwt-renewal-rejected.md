---
name: sisyphus-musi-sandbox-jwt-renewal-rejected
type: pitfall
created: 2026-11-21
updated: 2026-11-21
tags: [sisyphus, vidmuse, aion, musi, sandbox, sse]
links: [sisyphus, vidmuse-aion, vidmuse-zeus, vidmuse-testing]
---

# Musi SSE 只有心跳时核对 Sandbox 凭据续期

**Why:** 2026-11-21 14:30（北京时间）[Sisyphus online / musi 执行](https://sisyphus.sandaii.cn/#/projects/1/execution/runs/RUN-20261121-0016)中，9 个失败用例共用同一个 Musi Thread，POST 都返回 HTTP 200，180 秒内各收到 11 个心跳，缺少消息和 `done`。13:30 的同一 Thread、同一测试提交有真实流式回复。Zeus 转发及 AION Manager 接收请求均有记录。Manager 在 13:56:47 和 14:01:48 记录 `Sandbox JWT phase=update_unconfirmed` 并返回续期 503；首轮 ACS 审计中租期更新 200，之后三次凭据 JSON Patch 全被 HTTP 422 拒绝。该执行的收件长轮询随后在 14:06:06 从 200 转为连续 401，导致 Runner 没有处理测试提交的消息。审计给出通用 `Invalid`，具体失败的 JSON Patch 路径未得到确认。 [15:30 的后续执行](https://sisyphus.sandaii.cn/#/projects/1/execution/runs/RUN-20261121-0018)仍是同一组 9 个失败，其中 1 个继续等待流结束超时，另 8 个明确收到 SSE `00003`（用户消息队列已满）。

**How to apply:** 先按执行编号核对 JUnit 和流事件附件，区分一直收到心跳、已收到回复，以及回复已持久化但缺少 `done`。沿 [Zeus V2 relay](../../vidmuse/systems/zeus.md) 把产品 Thread 与 AION 身份对应起来。在 [Manager 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/vidmuse-aion?slsRegion=us-west-1)按 Thread 和 execution 查 `Sandbox JWT`；在 [Sandbox Runner 日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/aion-sandbox-runner?slsRegion=us-west-1)查 `/inbox/pull` 续期前后的状态。审计查目标 [ACS 集群日志库](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/audit-c33c6749d1306419ea91f5f4dd5e2e6bf?slsRegion=us-west-1)，区分租期写入和 JWT 写入，只摘取状态码、补丁操作路径和时间。不要导出注解值或原始 Kubernetes 请求对象。

凭据写入归属 [AION `acs_sandbox_jwt.py`](https://github.com/world-sim-dev/aion/blob/main/apps/manager/runner_wrapper/acs_sandbox_jwt.py)。修复验收需在隔离执行中观察 Sandbox 及 Pod 写入、sidecar 加载投影、旧凭据过期后的收件 200，再核对 Musi 真实新回复及 `done`。用例超时、断言和历史 Run 都不能用来替代这条验收链。
