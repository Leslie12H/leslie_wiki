---
name: sandai-offline-ops-diagnostics-skill
type: reference
created: 2026-11-27
updated: 2026-11-27
tags: [sandai, api-platform, athena, diagnostics, skills]
links: [sandai-api-platform-development-entrypoints, sandai-inference-concurrency-dashboard-entrypoints]
---

# 开放平台与推理中台离线排障 Skill

**Why**　2026-11-27 为没有内网和内部账号的接收者提炼三类常见调查。实时状态需要授权证据，通过脱敏导出可交接同一统计口径。仅有 Task ID 时，优先生成精确的取数清单并保留状态未知。

**How to apply**　工作区入口见[开放平台研发入口](development-entrypoints.md)。分享包源目录为工作区的 `outputs/sandai-ops-diagnostics/`，使用方法与归档指针在其中的 README。只取需要的脱敏字段，按环境、区域、任务、项目 Job 和尝试关联，保留时间及覆盖率。跨系统存量的在线口径沿[推理并发查证入口](inference-concurrency-dashboard-entrypoints.md)回看。发行验收从新解压的 ZIP 运行包内 `scripts/verify.py`，操作系统禁止网络和个人目录读取，进程使用空账号目录。先验证隔离确实生效，再检查单任务、失败率、时延并发及仅 ID 交接。离线算出合成样例只证明本地逻辑。
