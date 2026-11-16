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
