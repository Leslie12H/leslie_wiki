---
name: sandai-pe-rollout-audit-window
type: pitfall
created: 2026-11-20
updated: 2026-11-20
tags: [sandai, api-platform, prompt-enhancement, release, audit]
links: [sandai-api-platform-development-entrypoints, sandai-admin-task-prompt-export]
---

# PE 滚动发布的变更时间与任务统计

## 为什么

2026-11-20 查证时，生产 API 与预处理 worker 分批更新。审计成功、worker 第一次处理对应步骤、旧 worker 最后一次处理以及任务创建各有独立时间。生产日志中也可能出现带 `dev-` 前缀的镜像标签，所属环境由集群和命名空间确认。

## 如何核验

1. 在上海生产集群的 [Kubernetes 审计日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/audit-c9838d6fa878b43c59a6d37586f0c0747?slsRegion=cn-shanghai) 检查 `inference-prod` 下 API 与预处理 Deployment 的镜像 PATCH。按部署对象和实际镜像筛选，核对 `ResponseComplete` 与响应码，排除 `/status` 更新和同批 rollout 重启标注。
2. 从 [推理生产日志](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/inference-prod?slsRegion=cn-shanghai) 按 worker Pod、镜像和 `pp_prompt_enhancement` 回读第一条与最后一条日志。报告用应用记录的时间换算时区。滚动发布存在并行处理。一个 Job 可产生多条含 PE 标识的日志，实际命中版本应按 Job 关联核验。
3. 对时间窗口内的新建任务，在各地区用 [任务管理](https://zeus-admin.sandaii.cn/tasks) 按稳定任务 ID 去重，用模型显示名和组织归属做统计。计数写清开始、结束和快照时间。客户名以组织详情登记为准，已脱敏标签原样保留。
