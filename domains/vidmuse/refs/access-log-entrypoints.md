---
name: vidmuse-access-log-entrypoints
type: reference
created: 2026-09-22
updated: 2026-11-17
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
