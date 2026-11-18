---
name: vidmuse-access-log-entrypoints
type: reference
created: 2026-09-22
updated: 2026-11-18
tags: [vidmuse, nginx, logs]
links: [vidmuse-aion, vidmuse-ai-frontend]
---

# VidMuse 访问日志核验入口

**Why:** 内部 runtime 代理日志和用户网站入口日志覆盖不同请求，不能互相替代。

**How to apply:** 先确认环境和请求经过的网关，再检查对应日志配置与真实样本。

- AION runtime sidecar 配置指针：`~/Downloads/sandai-code/aion/runtime-sidecar/nginx.conf.template`，检查 `log_format`、`access_log` 和 `error_log`；启动路径见同目录 `entrypoint.sh` 和 `Dockerfile`。容器标准输出应通过对应 Pod/container 日志查询，实际采集和保留期限需另查。
- 网站入口先用目标集群的 `kubectl get ingress -A` 核验 host 与 ingressClassName；ALB 入口应继续查 ALB 访问日志及 SLS 投递配置，不能默认存在 nginx access.log。
- 2026-09-22 本次只读检查默认 context `204595254019434109-c8537cc4bdbe246968912d1aaefa38832` 时，仅看到 VidMuse dev/staging 等入口，不能据此断言 vidmuse.ai 生产入口或生产日志已开启。

## CN 生产自由画布生成排查（2026-11-17）

- **Why:** CN 应用和上海推理中台各自采集应用日志。画布的通用生成失败只指出工作流返回失败，归因需要 Manager 的模型请求或对应的上游任务回执。
- **How:** 先在 [VidMuse CN 生产应用 SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c1a1f9f5e8bb44808bb3fbcc20b7512e3/logsearch/vidmuse-cn-prod-manager?slsRegion=cn-shanghai) 核对 `vidmuse-cn-prod-zeus`、`vidmuse-cn-prod-manager`、`vidmuse-cn-prod-vidflow` 的采集样本。用画布链接确认产品项目 ID 和环境，按 [自由画布抽卡数据导出](free-canvas-generation-export.md) 的 ID 关系定位 Aion Thread 和生成请求。出现上游任务 ID 时，再沿该 ID 到模型侧查询。
- 先确认查询时区、日志库的索引字段和访问日志覆盖范围。从工作流日志提取任务 ID 或 Trace ID，再到 Manager 查模型提交、轮询和终态。同一时间的其他线程日志只能用于定位采集范围。UUID 搜索无命中时可在已知的失败时间窗口内核对原始日志内容。
- 画布显示 `Sand AI Open generation failed.` 时，按 [Aion Sand AI Open 适配器轮询分支](https://github.com/world-sim-dev/aion/blob/920753afd976f7a98c5dfdd886005e1aeed0d197/packages/api_aggregation_adapter/src/api_aggregation_adapter/adapters/sandai_open_adapter.py#L280-L330) 对照发布版本。查对应模型请求的 `upstream_task_id` 和结构化错误码。该文案可覆盖内容审核和其他上游失败，无法单凭截图判定原因。


## CN beta 预发布与生成回执（2026-11-17）

- **Why:** `beta.vidmuse.cn` 的应用记录来自 CN staging，生成请求可以调用 CN 生产 Sand AI Open。画布任务 ID、Aion 模型请求 ID、Trace ID 和开放平台生成 ID 各指向不同层级。
- **How:** 沿 [Zeus 上海 staging 路由](https://github.com/world-sim-dev/vidmuse-zeus/blob/954f5a278146d9e47f4a43d8b8e7250058dc1c20/docs/runbooks/zeus/shanghai-staging-deployment.md#L41-L61) 核对当前域名归属。在 [上海集群应用 SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/vidmuse-cn-staging-manager?slsRegion=cn-shanghai) 按画布或任务 ID 查 `vidmuse-cn-staging-zeus`、`vidmuse-cn-staging-manager`、`vidmuse-cn-staging-vidflow`。相同任务 ID 也可能出现在另一环境的回调日志中。取证时核对实际 Pod、请求目标和任务回执。
- Aion 显示 `submission outcome is unknown` 时，按 Manager Trace ID 查同项目的 [开放平台生产日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/co_sandai_zeus_prod?slsRegion=cn-shanghai)。对照 `RequestOutcome` 的 HTTP 状态、`stage`、`field`、下载异常以及是否有 generation ID。已核验素材下载超时可返回 503 并映射为该提示。按实际平台回执和 Aion 入库状态核对是否受理。
- 上游返回生成 ID 后，按该 ID 核对最终错误码。轮询中的 HTTP 429 表示查询限流，终态仍以成功读取的任务状态为准。应用侧预扣与撤销按同一个模型请求 ID 和账务交易号核验。

## Dev 模型请求的上游提示词审核（2026-11-18）

**Why:** VidMuse 的模型请求 UUID 可以由工具调用直接产生，查 Thread 或普通任务详情时可能返回 404。Dev 的应用环境与模型提供方的开放平台、推理工作器区域分别路由。对外显示的通用审核失败文案只保留结果。

**How to apply:** 在正确环境按模型请求主键查 Aion `model_api_requests`，用 `upstream_task_id` 和实际提供方入口匹配开放平台任务，再从 Zeus 提交日志取得 Athena Job ID。查 `moderation stage decided` 的 `stage`、`item` 和 `reason`；若只有 Celery 任务日志，用接收日志中的工作器名和秒级窗口补查决策。文本项后缀按 [Athena 提示词分段实现](https://github.com/world-sim-dev/athena-admin/blob/1fbfab7a8972faa04dc68772d2777f377440ff49/ApiService/services/moderation.py#L71-L79) 回查，标签指向整个分段，具体命中词仍以审核细项为准。

- 该次跨环境的证据路径为工作区 `.local/newjeans-magi2-review-20261118/`，依次查看 `dev-aion-evidence.json`、`dev-provider-host.json`、`sls-initial.json` 和 `sls-athena-decisions.json`。线上路由须重新核对。
