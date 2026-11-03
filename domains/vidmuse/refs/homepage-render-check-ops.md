---
name: vidmuse-homepage-render-check-ops
type: reference
created: 2026-11-03
updated: 2026-11-03
tags: [vidmuse, frontend, monitoring, cron]
links: [vidmuse-ai-frontend]
---

# VidMuse 首页渲染巡检的调度入口

巡检用浏览器打开 VidMuse 首页，以页面可见元素组合判断是否匹配已知首页样式。告警里的 `no valid homepage profile` 只说明本次采样未匹配巡检条件。判定逻辑查远程脚本 `/opt/vidmuse-check/vidmuse_check.py`，单次结果按告警里的截图路径回查。

2026-11-03 经主机名核验，`vidmuse-data-transfer` 上的 root crontab 是这条告警的调度入口。当天按用户要求备份并注释了唯一一条命中上述脚本绝对路径的计划，回读 crontab 并检查无在跑实例。当前开关状态以该主机上的 `crontab -l` 为准。

恢复时先回读现有 crontab，可参考该机 `/root/vidmuse-check-crontab-before-pause.*` 中的原调度行。只解除对应单行注释，保留其它任务在暂停期间的改动。回读生效配置，并从下一次计划运行核对实际结果。
