---
name: sandai-platform-production-error-alerts-entrypoints
type: reference
created: 2026-11-16
updated: 2026-11-20
tags: [sandai, api-platform, sls, observability, alerting]
links: [sandai-api-platform-development-entrypoints]
---

# API 平台生产 ERROR 日志告警查证入口

## 为什么按地区和服务配置

2026-11-16 为生产 OpenAPI、Platform、Dispatcher 补齐 SLS ERROR 日志告警。同名日志库在上海和美国的级别采集方式有差异。上海可直接使用结构化级别字段。美国共享库同时采集普通日志文件和应用错误文件，实测同一异常可以在两份文件出现。确定美国范围时，应核对最新 Pod 前缀、实际文件路径与 Zeus Log4j2 的 ErrorFile 阈值。运行日志的正文关键词可能来自普通日志，不能直接当级别。

## 如何复核

1. 到两地 SLS 告警中心搜索「开放平台生产」，逐条回读日志源、服务前缀、窗口、阈值、启用状态和行动策略。配置会变，依控制台为准。[上海告警中心](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/alertcenter?slsRegion=cn-shanghai) · [美国告警中心](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/alertcenter?slsRegion=us-west-1)
2. 在各自的 `internal-alert-history` 按规则 ID 查执行结果。使用已保存查询回查有错误的历史窗口和当前安静窗口。样本数、告警状态和配置回执留在 API 平台工作区的 `monitoring/aliyun/production-error-alerts.md`。
3. 按规则配置核对 SLS 行动策略与飞书机器人归属。出现真实触发后，查通知记录和飞书消息确认送达，恢复消息同样需要回读。[SLS 告警日志字段](https://help.aliyun.com/zh/sls/fields-in-alert-rule-evaluation-logs)
4. 2026-11-16 按用户指定追加运维群。SLS Webhook 显示名由配置者填写。以飞书群设置中已有机器人的绑定确认实际群，再通过六条规则共用的行动策略增加目标。变更后重载策略，核对原渠道与新增渠道均存在。运维群和变更回执以工作区记录为准。

## 2026-11-16 业务限流也会记为 ERROR

**Why:** 上海 OpenAPI 的原始日志中，`GET /v1/assets/{id}` 在 `RateLimitHelper.checkRateLimit` 命中组织及接口维度的请求频率限制，`ErrorLogger` 将该异常以 ERROR 级别记录。异常映射为 HTTP 429 `ExceedRateLimits`。以日志级别匹配的规则会计入这类记录。

**How to apply:** 先按对应地区的规则回查 SLS，确认查询为 `Complete`，再用日志的异常栈和请求链路判定 HTTP 状态。看到 `tooManyRequests` 时回查调用入口，确认是哪个接口的限流。核对服务端 5xx 时用入口 HTTP 状态或独立指标，告警是否触发和送达可从告警历史分别核对。[上海 OpenAPI 规则](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/alert/alert-1794831378-460578?slsRegion=cn-shanghai) · [Zeus 429 映射](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/modules/common/src/main/java/co/sandai/zeus/common/exception/ZeusServiceException.java#L123-L126)

## 2026-11-17 回查告警之外的请求与重试

**Why:** 2026-11-16 夜间的双区原始日志回查中，临时素材删除失败重试由 `UploadArtifactCleanup` 写为 WARN，V2 参数校验等客户端拒绝由 `RequestOutcome` 写为 INFO。美区 ALB 的生成状态轮询另有后端返回 429 的记录。只按 ERROR 查会漏掉这些类型。

**How to apply:** 固定时间窗，分别汇总应用事件与入口 HTTP 状态。对素材清理同时统计重试日志和去重后的素材键，元数据中的 Pod 用来确认 OpenAPI 或 Dispatcher 来源。对 V2 请求摘要按 `httpStatus`、`errorCode` 分组，字段未开放 SQL 时用计数加分页，并核对去重请求 ID。对 ALB 按目标域名、请求方法、路径、`status` 和 `upstream_status` 核对。先从对应实例的访问日志页签确认采集状态，只有已投递且能确认覆盖窗口的日志库可用于入口结论。[美国入口日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/alb_access_log_store?slsRegion=us-west-1) · [上海 ALB 访问日志状态](https://slb.console.aliyun.com/alb/cn-shanghai/albs/alb-bq1qujda99ty9r8wss/access-log)

## 2026-11-17 临时素材清理重试的下游取证

**Why:** 2026-11-16 夜间的国内与美国 `UploadArtifactCleanup` 日志均在同一 Zeus 镜像中指向 `ArtifactClient.deleteArtifact` 的未确认分支。按同一 trace 回查，所核对的双区清理请求都由上海 Athena API Service 执行。OSS 删除对象时返回 `403 AccessDenied`，详情指向 bucket ACL。Athena 回滚事务，访问日志仍记录 HTTP 200。Zeus 从业务响应中得不到删除成功确认，按代码重新排入 Redis 重试。具体生效访问策略需要沿 OSS 请求 ID 核对。

**How to apply:** 先用生产镜像 SHA 对齐 Zeus 异常行，再带 artifact UUID 和 trace 在上海推理日志库查 `oss2.api`、事务回滚、服务错误与 `http.access`。美区 Zeus 请求也可在这个日志库命中下游。核对 HTTP 状态的同时读取下游业务失败，后台重试次数按素材去重。对同时段的请求 400，先和验收台账按请求 ID 双向对账，再判断是否为预期负例。11 月 16 日美国 V2 的 155 条 400 均匹配当晚功能测试台账，400 用例断言均通过，台账入口为工作区 `.local/magi2-us-native-20261116-side/cases.csv`。[上海推理日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/inference-prod?slsRegion=cn-shanghai) · [Zeus 删除确认分支](https://github.com/world-sim-dev/zeus/blob/c0bb6a646725a633804754f57fcfbabb7492d517/modules/infra/src/main/java/co/sandai/zeus/infra/infer/ArtifactClient.java#L400-L415)

## 2026-11-17 异步生成失败的终态日志

**Why:** 已接单的生成任务失败时，Zeus `TaskMetrics` 用 INFO 记录 `task_finished`。2026-11-17 双区均查到 `result=failure`，同时应用 ERROR 与美国 ALB 5xx 查询均未命中。

**How to apply:** 在双区应用日志回查 `task_finished` 与 `result=failure`，按 `stage` 和去重后的 task ID 汇总。美国普通日志正文未开放 SQL 时，先计数再分页解析。用 task ID 对齐测试回执，命中现有记录后再用下游 trace 或 Job ID 确认原因。一次公共查询仍返回 200 时也可以取得失败终态。[Zeus TaskMetrics](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/modules/domain/src/main/java/co/sandai/zeus/domain/task/metrics/TaskMetrics.java#L157)

## 2026-11-17 上传暂存对象删除错误

**Why:** 2026-11-16 夜间两地出现 `OssClient` 的 `asset_staging_cleanup_failed`，对象键位于 `upload-staging/`，异常为 `S3Exception`。同一晚的 `UploadArtifactCleanup` 则沿 Athena 删除内联 artifact 并重新入队。上传暂存删除日志的业务操作和对象标识可从 `OssClient.deleteStaged` 回查。

**How to apply:** 用日志组件、事件名和对象键识别清理操作。暂存对象可按 object key 统计，内联 artifact 按 artifact UUID 去重并确认最后一次重试。获取上传 HTTP 结果时用请求 ID 或入口访问日志核对。仅有 `S3Exception` 类名时，通过对象存储侧请求回执核对具体状态码。[Zeus 暂存清理](https://github.com/world-sim-dev/zeus/blob/59b6561a80160de5be9c0227dd72ed2d2946fdee/modules/infra/src/main/java/co/sandai/zeus/infra/oss/OssClient.java#L346-L354)

2026-11-17 复查暂存清理时，SLS 收录时间排序与应用报错时间排序不同。确认最后一次发生时，读取结构化应用 timestamp 或美国普通日志行首时间并转为北京时间。保留收录时间和应用时间，避免把延迟写入当成复发。SLS 控制台 GetLogs 的 from/to 使用整数 Unix 秒，本次带小数的时间参数返回 InternalError。

## 2026-11-18 开放平台 HTTP 503 查证

**Why:** 共用 ALB 的实例指标汇总多个域名。SLS 全文查询中的 `httpStatus=503` 也可能匹配到时间戳或耗时里的 `503`。逐条解析出真实 HTTP 状态和请求 ID 才能给出 OpenAPI 应用的数量。

**How to apply:** 先在启用访问日志的入口按 `host` 或 `http_host`、`status` 和 `upstream_status` 过滤，查同域名总请求数确认覆盖。再从两区 Zeus `RequestOutcome` 中解析 `httpStatus`、应用时间、`requestId` 和 Pod，按请求去重。查素材失败时依次回看 `stage`、`field`、`sourceHost`、`downloadReason` 以及生成 ID。`DOWNLOAD` 核对具体来源和异常，`INPUT_PREPARATION` 继续查同一 Trace 的依赖异常。访问日志缺失时，共享 ALB 峰值保留实例口径。前端遇到提交回执未知时，沿 [VidMuse 访问日志核验入口](../../vidmuse/refs/access-log-entrypoints.md#sand-ai-open-提交回执未知2026-11-18) 回查原始响应和受理状态。

2026-11-18 的双区窗口、逐请求证据和上海入口覆盖范围见工作区 `.local/openapi-503-20261118/REPORT.md`。

下载超时的重试策略按实际失败环节回查。参考源 URL 读取检查 [PublicMediaDownloader 的客户端配置](https://github.com/world-sim-dev/zeus/blob/338d36504de0c03654e92f60e6547df35a285816/modules/infra/src/main/java/co/sandai/zeus/infra/http/PublicMediaDownloader.java#L35-L46) 和 [IOException 分支](https://github.com/world-sim-dev/zeus/blob/338d36504de0c03654e92f60e6547df35a285816/modules/infra/src/main/java/co/sandai/zeus/infra/http/PublicMediaDownloader.java#L199-L206)。Athena 素材注册及应用生成提交分别沿 [注册重试条件](https://github.com/world-sim-dev/zeus/blob/338d36504de0c03654e92f60e6547df35a285816/modules/infra/src/main/java/co/sandai/zeus/infra/infer/ArtifactClient.java#L274-L298) 与 [VidMuse 提交回执](../../vidmuse/refs/access-log-entrypoints.md) 核对。把下载超时、注册重试计数和生成受理记录分别对应到各自的请求。

## 2026-11-20 邮箱登录验证码拒绝

美国 Platform 的邮箱登录验证码失败由 `ErrorLogger` 记录，告警级别取自应用日志。按同一 Trace 核对 `CaptchaService` 的供应商结果和 `RequestCompletionLog` 的 HTTP 状态，才能判定失败发生在哪个环节。供应商返回 `F002` 时，查看阿里云服务端接入文档的返回码表，参数丢失的位置需要单独取证。[阿里云验证码服务端接入](https://help.aliyun.com/zh/captcha/captcha2-0/user-guide/server-access)

按 Trace ID 搜索若只命中结构化摘要，从摘要取 Pod 名和应用时间，再收窄至该 Pod 与前后数秒，查询 `/app/logs/error.log` 和 `/app/logs/zeus-default.log`。用原始行中的 Trace ID 对齐验证码回执、异常栈和请求完成记录，两份文件的同一异常按同一请求归并。查询证据见 API 平台工作区 `.local/trace-45fd1460-20261120/digest.json`。[美国生产日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c7c0ede6c71484f8da34a829954c50cd9/logsearch/co_sandai_zeus_prod?slsRegion=us-west-1)

## 2026-11-20 国内预发 OpenAPI 的素材下载超时计数

**Why:** VidMuse 的调用入口可能落在香港国内预发。生产 Zeus 日志覆盖上海和美西，香港国内预发 OpenAPI 的记录出现在名称含 `dev` 的香港日志库。预发应用将同一个 `RequestOutcome` 写入普通日志和错误日志，两份记录的 SLS 收录时间可能不同。素材下载在生成受理前执行，因此该阶段的失败通过创建请求日志计数。

**How to apply:** 先从调用域名或同一 Trace 核对实际部署环境。香港日志按 `staging-cn-openapi-zeus-deployment-*` 限定 Pod，从 `content` 解析 `route`、`httpStatus`、`stage`、`downloadReason`、`sourceHost` 和 `requestId`。用 `stage=DOWNLOAD`、`downloadReason=SocketTimeoutException` 和 HTTP 503 确认这类失败，按 `requestId` 去重。按日统计时，将应用日志行首 UTC 时间转换为北京时间。SLS 计数可用分页读回和 ACK 容器日志复核，滚动发布前后的全窗口覆盖以集中日志为准。[香港日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c4d615674e9994747af45004405e35503/logsearch/co_sandai_zeus_dev?slsRegion=cn-hongkong) · [香港预发部署](https://cs.console.aliyun.com/#/k8s/cluster/c4d615674e9994747af45004405e35503/v2/workload/deployment/detail/default/staging-cn-openapi-zeus-deployment/pods?region=cn-hongkong&ns=default)

2026-11-20 的聚合查询、去重核对与容器取证见 API 平台工作区 `.local/socket-timeout-20261120/` 下的 `hk-dedup.json`、`hk-causes.json` 和 `hk-ack.json`。
