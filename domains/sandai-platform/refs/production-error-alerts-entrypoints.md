---
name: sandai-platform-production-error-alerts-entrypoints
type: reference
created: 2026-11-16
updated: 2026-11-16
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
