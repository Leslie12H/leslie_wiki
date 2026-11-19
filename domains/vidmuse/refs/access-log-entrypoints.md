---
name: vidmuse-access-log-entrypoints
type: reference
created: 2026-09-22
updated: 2026-11-19
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

## Sand AI Open 提交回执未知（2026-11-18）

**Why:** 自由画布的 `on_failure: AionClient request failed:` 由 VidFlow 写入失败状态。`Sand AI Open submission outcome is unknown` 来自 AION 的开放平台适配器，表示客户端在提交阶段没有拿到可确认受理的回执。判断请求是否已建单，需要查原请求。

**How to apply:** 用 [AION 适配器的创建回执分支](https://github.com/world-sim-dev/aion/blob/a84ccdddadfd4650f7068db698788d9d5b8e41e6/packages/api_aggregation_adapter/src/api_aggregation_adapter/adapters/sandai_open_adapter.py#L314-L332) 核对实际部署版本对传输异常、HTTP 状态和生成 ID 的处理。拿到画布任务 ID 后，按 [生成链路](free-canvas-draw-video-chain.md) 找 Manager Trace ID 和请求目标。再用 Trace ID 对齐开放平台原始响应、建单记录及生成 ID，确认受理情况后再决定是否重发。

## 预发布画布错误与开放平台建单核验（2026-11-18）

**Why:** 画布可以同时出现多笔相同的失败提示。截图时间适合缩小检索窗口，节点标题和失败任务 ID 才能对齐具体操作。上海 VidMuse staging 可以通过独立的提供方配置调用香港 OpenAPI 国内预发布。

**How to apply:** 在 VidFlow 或 VidMuse Zeus 取失败的 RTC task ID，从 `meta.canvas.nodeId` 回查 `documents/free_canvas` 的节点和失败记录。用同一个 RTC task 找到实际提交 Trace，再用 AION Manager 的出站 HTTP 日志确认目标 host 和状态。从 [Zeus 环境路由表](https://github.com/world-sim-dev/zeus/blob/338d36504de0c03654e92f60e6547df35a285816/deployment/magi/README.md#L185-L195) 定位目标环境。目标为国内预发布时，查香港 ACK 的 `staging-cn-openapi-zeus-deployment`，按同一 Trace 对齐 `RequestOutcome`。确认是否建单时，结合平台的阶段字段、生成 ID 和实际镜像的受理事务边界。

2026-11-18 的具体查证见工作区 `.local/vidmuse-screenshot-503-20261118/REPORT.md`。

跨 VidMuse 和开放平台的任务映射可以调用本机 `$vidmuse-task-lineage`。该 skill 以持久化任务关联和实际出站路由选环境，沿 Zeus 的派发记录核对 Athena Job。入口为 `~/.codex/skills/vidmuse-task-lineage/SKILL.md`。

## Dev 模型请求的上游提示词审核（2026-11-18）

**Why:** VidMuse 的模型请求 UUID 可以由工具调用直接产生，查 Thread 或普通任务详情时可能返回 404。Dev 的应用环境与模型提供方的开放平台、推理工作器区域分别路由。对外显示的通用审核失败文案只保留结果。

**How to apply:** 在正确环境按模型请求主键查 Aion `model_api_requests`，用 `upstream_task_id` 和实际提供方入口匹配开放平台任务，再从 Zeus 提交日志取得 Athena Job ID。查 `moderation stage decided` 的 `stage`、`item` 和 `reason`；若只有 Celery 任务日志，用接收日志中的工作器名和秒级窗口补查决策。文本项后缀按 [Athena 提示词分段实现](https://github.com/world-sim-dev/athena-admin/blob/1fbfab7a8972faa04dc68772d2777f377440ff49/ApiService/services/moderation.py#L71-L79) 回查，标签指向整个分段，具体命中词仍以审核细项为准。

- 该次跨环境的证据路径为工作区 `.local/newjeans-magi2-review-20261118/`，依次查看 `dev-aion-evidence.json`、`dev-provider-host.json`、`sls-initial.json` 和 `sls-athena-decisions.json`。线上路由须重新核对。

## 画布提示词命中阿里云文本标签（2026-11-19）

**Why:** Athena 的 `prompt:<offset>` 是送审提示词按 Unicode 字符切分的起点。阿里云文本审核返回的 `regional` 表示地域和涉政内容。Athena 的文本适配器只保留用于拦截的标签，细分理由和命中词要看供应商原回执。

**How to apply:** 按 Zeus 的建单和派发日志对齐 Athena Job，再用 `moderation stage decided` 确认阶段、分段和标签。根据同一 Trace 回查 VidFlow 和对应 RTC task 的当时提交快照。遇到 `@ElementN` 等素材引用时，先对照 AION 适配器和实际素材顺序，换算文本后再切段。日志转义的换行还原为实际字符后再计数。若要定位具体词句，从阿里云文本审核结果的原始回执核实细节。

- [Athena 文本分段](https://github.com/world-sim-dev/athena-admin/blob/1fbfab7a8972faa04dc68772d2777f377440ff49/ApiService/services/moderation.py#L69-L91) · [Athena 文本标签归一化](https://github.com/world-sim-dev/athena-admin/blob/1fbfab7a8972faa04dc68772d2777f377440ff49/ApiService/clients/green.py#L137-L143) · [阿里云文本标签定义](https://help.aliyun.com/zh/document_detail/465315.html) · [AION 素材占位符替换](https://github.com/world-sim-dev/aion/blob/920753afd976f7a98c5dfdd886005e1aeed0d197/packages/api_aggregation_adapter/src/api_aggregation_adapter/adapters/sandai_open_adapter.py#L165-L187)。
- 2026-11-19 的逐笔映射及分段见 Apipltform 工作区 `.local/beta-cn-regional-20261119/cases.md`。

## 对比生成的重试与错误回写（2026-11-19）

**Why:** 自由画布的对比生成可在同一个 `comparison_id` 下记录多条 RTC task。RTC 的最终失败提示可能只来自最后一次工作流执行。现场出现生成接口多次回 `400 / content_policy`，最后一次领取执行权时连接失败，画布只收到连接失败的情况。

**How to apply:** 从 Thread 的 RTC 数据按 `comparison_id` 汇总本轮及重试的任务，区分创建、模型请求与失败回写的 Trace。用上海 Beta CN 的 VidFlow 日志对齐每次 `/api/v1/model/generate-video/workflow` 回执，再读最终 `on_failure_mark_parent_task` 和失败阶段。AION 内部的 `model_submit_rate_limit_unavailable` 或 `model_generation_concurrency_unavailable` 应按系统不可用回执定位；是否提交到开放平台需另查实际出站及建单证据。

- 2026-11-19 的只读证据见 Apipltform 工作区 `.local/beta-cn-thread-41d42725/` 内的 `comparisons.json`、`attempts.json` 和 `deep.json`。

## AION 提交前的提示词审核（2026-11-19）

**Why:** AION 的模型入口可以在调用生成供应商之前，按模型配置调用 Green 的文本审核。出现 `Prompt did not pass content safety review` 时，先用同一请求的 Manager 审核日志对齐该分支。该分支在 Green 返回中高风险后立即结束，调用日志只记录服务名、接口 Code 和 Request ID。

**How to apply:** 先从 VidFlow 的生成请求获得任务与 Trace，在 Manager 用该调用的实际 Trace、HTTP 状态及时间对齐同一审核 span。Green 接口的 `Code=200` 表示审核调用成功。按 span 内的返回顺序找出使 AION 退出的分段，再用最后一条 Green Request ID 查询供应商审核明细。分段按提交前拼接的文本计数，包含字段名和多段提示词。有重叠的分段窗口以当时部署实现为准。VidFlow 的请求日志会截断长文本，从有权读取的当时提交快照核对被截断部分。

- [AION 视频生成前置调用](https://github.com/world-sim-dev/aion/blob/edfd935e6e77a8467be527ba34a172aecddf1d55/apps/manager/controller/model_api.py#L4399-L4413) · [AION 提示词组装与前置审核](https://github.com/world-sim-dev/aion/blob/edfd935e6e77a8467be527ba34a172aecddf1d55/apps/manager/service/model_api/output_safety.py#L101-L140) · [Green 调用与分段](https://github.com/world-sim-dev/aion/blob/edfd935e6e77a8467be527ba34a172aecddf1d55/apps/manager/service/content_safety.py#L76-L110) · [阿里云结果查询](https://help.aliyun.com/zh/document_detail/2878237.html)。
- 本次关联证据见工作区 `.local/beta-cn-thread-41d42725/policy/last-policy.json`。
