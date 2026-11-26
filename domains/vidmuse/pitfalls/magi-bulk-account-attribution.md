---
name: vidmuse-magi-bulk-account-attribution
type: pitfall
created: 2026-11-26
updated: 2026-11-26
tags: [vidmuse, magi-2, aion, zeus, sls, traffic]
links: [vidmuse-access-log-entrypoints, vidmuse-aion, vidmuse-zeus]
---

# VidMuse Magi-2 批量调用的账号与客户端来源查证

**Why:** 模型名称的全文搜索会命中状态轮询与状态变化。海外 OpenAPI 所见的调用方可能是 VidMuse 服务主体。同一小时的量还可能来自单账号集中提交或大量账号各提交少量，两种情况的入口证据不同。

**How to apply:** 从生成请求 ID 算量，以成功的产品扣费日志关联账号，再沿用户入口核对客户端。保存窗口、时区、匹配覆盖与样本 Trace。

1. 在 [美西 AION SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/vidmuse-aion?slsRegion=us-west-1) 用 Manager 的 `operation=video.generate stage=request` 和精确 `model_name` 限定建单事件，按模型请求 UUID 去重。终态、上游受理、费用与客户端未受理请求各自沿对应事件回查。
2. 在 [美西 VidMuse Zeus SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/vidmuse-zeus?slsRegion=us-west-1) 读取 `AdminCreditController.deductCredit`。从 AION 的 `traceId` 提取 Trace 本体，按同一 Trace、邻近时间和唯一成功扣费主体关联 `request.userId`。先抽样用预扣回执及交易 ID 验证方向。按时间分片并将去重总数与小时分桶对账。缺失和多候选要单独核验。
3. 同时看每账号最大分钟量、Top N 占比、小时活跃账号及只调一次的账号数。早期没有匹配事件时，核对型号开通和日志覆盖。首次观察到该模型的账号与新注册账号是两个口径，注册时间从账号表或 Admin 查证。
4. 用 `triggerDrawVideo`、`applyCanvasMutation`、`submitCanvasMediaJob` 等产品入口，以及 AION `generate-video` 和 `generate-video/workflow` 的实际 HTTP 路径证实样本来源。不同接口的计数可独立反映行为强度，逐笔因果关联用 task ID 或 Trace。2026-11-26 的现场复核见 [排查会话](codex://threads/01a215f3-2924-7272-9265-4c29c975cac9)。
5. AION access log 的内网 peer 只能定位上一跳。判定外部反代或多账号共同来源时，从实际 PC Web/API ingress 或边缘访问日志关联请求 ID、可信公网客户端 IP、UA 和入口域名。先核对日志投递和字段语义，参考 [访问日志入口](../refs/access-log-entrypoints.md)。

源码入口为 AION `apps/manager/controller/model_api.py`、`apps/manager/service/model_api/billing.py`，以及 VidMuse Zeus `AdminCreditController`、`AgentTaskWorkerController`、`AgentThreadRelayV2Controller`。
