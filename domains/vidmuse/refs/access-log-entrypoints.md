---
name: vidmuse-access-log-entrypoints
type: reference
created: 2026-09-22
updated: 2026-09-22
tags: [vidmuse, nginx, logs]
links: [vidmuse-aion, vidmuse-ai-frontend]
---

# VidMuse 访问日志核验入口

**Why:** 内部 runtime 代理日志和用户网站入口日志覆盖不同请求，不能互相替代。

**How to apply:** 先确认环境和请求经过的网关，再检查对应日志配置与真实样本。

- AION runtime sidecar 配置指针：`~/Downloads/sandai-code/aion/runtime-sidecar/nginx.conf.template`，检查 `log_format`、`access_log` 和 `error_log`；启动路径见同目录 `entrypoint.sh` 和 `Dockerfile`。容器标准输出应通过对应 Pod/container 日志查询，实际采集和保留期限需另查。
- 网站入口先用目标集群的 `kubectl get ingress -A` 核验 host 与 ingressClassName；ALB 入口应继续查 ALB 访问日志及 SLS 投递配置，不能默认存在 nginx access.log。
- 2026-09-22 本次只读检查默认 context `204595254019434109-c8537cc4bdbe246968912d1aaefa38832` 时，仅看到 VidMuse dev/staging 等入口，不能据此断言 vidmuse.ai 生产入口或生产日志已开启。
