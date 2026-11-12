---
name: vidmuse-homepage-render-check-ops
type: reference
created: 2026-11-03
updated: 2026-11-12
tags: [vidmuse, frontend, monitoring, cron]
links: [vidmuse-ai-frontend]
---

# VidMuse 首页渲染巡检的调度入口

巡检用浏览器打开 VidMuse 首页，以页面可见元素组合判断是否匹配已知首页样式。告警里的 `no valid homepage profile` 只说明本次采样未匹配巡检条件。判定逻辑查远程脚本 `/opt/vidmuse-check/vidmuse_check.py`，单次结果按告警里的截图路径回查。

2026-11-03 经主机名核验，`vidmuse-data-transfer` 上的 root crontab 是这条告警的调度入口。当天按用户要求备份并注释了唯一一条命中上述脚本绝对路径的计划，回读 crontab 并检查无在跑实例。当前开关状态以该主机上的 `crontab -l` 为准。

恢复时先回读现有 crontab，可参考该机 `/root/vidmuse-check-crontab-before-pause.*` 中的原调度行。只解除对应单行注释，保留其它任务在暂停期间的改动。回读生效配置，并从下一次计划运行核对实际结果。

## 2026-11-04 Musi 首页的验收入口

告警截图与巡检机上的无会话 Chromium 一致，旧选择器失配时访客看到的是新首页。顶栏也会出现创作模式的名称，匹配全页文本会把只有导航的页面算作成功。核对规则时看实际创作区域的可见角色与名称，区分访客候补入口和已开放的输入框，具体元素以脚本为准。

用同一台主机和 Chromium 单次验证。运行前对本次进程设置 `FEISHU_WEBHOOK=`，用独立的 `OUT_DIR` 收集诊断。2026-11-04 的新版候选通过 11 项回归及线上单次运行，随后替换正式脚本并回读校验和。旧版保留于同目录 `vidmuse_check.py.before-musi.*`。脚本版本和调度开关分别回查远程脚本和 root crontab。

## 正式调度的结果日志

恢复后用 cron 条目指定的 `/var/log/vidmuse-check/vidmuse_check.log` 核对恢复时间之后新写入的记录。crontab 回读只能确认计划已启用。一次真实的计划执行以新增结果行的时间戳、主机名和页面规则为准。2026-11-04 恢复后，12:05:01（北京时间）的首条正式记录返回 `OK`，命中 `musi_home`。

## 2026-11-11 首页改版后的回查

告警截图和巡检机的无会话 Chromium 都显示，改版后主内容区仍提供 Musi 入口，原创作模式页签组已移除。新页面初始渲染时有名为 `Message Musi` 的禁用输入框。验证时等创作区内的可用入口出现，具体定位规则以正式脚本为准。回归覆盖旧布局、改版后的候补入口与输入控件，以及只有导航、只加载了占位输入框的页面。

远程候选通过 14 项回归和三次无会话 Chromium 线上巡检。正式脚本回退文件在同目录下，匹配 `vidmuse_check.py.before-nov11.*`。

恢复原调度后，2026-11-11 北京时间 20:40:01 的首条正式记录返回 `OK`，命中 `musi_home`。后续按正式日志和远程 crontab 回查。

## 2026-11-12 同名入口触发 Playwright 严格匹配

告警只显示 `exception:Error` 时，可在巡检机用无会话 Chromium 加载首页，直接调用脚本的首页检查函数并读取异常。2026-11-12 两次复现均收到 HTTP 200。创作区里的候补横幅按钮和输入区覆盖按钮同时使用 `Join waitlist` 作为可访问名称，单元素可见性检查因匹配两个按钮而抛错。

入口的渲染检查要求至少有一个可见且启用的匹配。使用集合查询和可见性过滤表达这个条件。回归同时覆盖两个同名入口可用，以及只有禁用或零尺寸入口时继续报缺失。回退脚本在同目录下，匹配 `vidmuse_check.py.before-nov12.*`。

修复在 16 项回归和两次同机线上试跑通过后部署。2026-11-12 北京时间 12:10:01，部署后首轮 cron 返回 `OK`。
