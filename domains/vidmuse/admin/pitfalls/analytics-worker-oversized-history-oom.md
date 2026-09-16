---
name: analytics-worker-oversized-history-oom
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [vidmuse, admin, analytics, oom, static-history]
links: [analytics-maintenance-historical-rebuild-pressure]
---

# Analytics Worker 被超大历史聊天输入反复 OOM

2026-09-16 排查入口：[修复 PR #884](https://github.com/world-sim-dev/vidmuse-admin/pull/884)，包含生产取证窗口、具体 Thread、源大小、隔离探针与回归验证。部署状态以该 PR 和 Analytics Worker 独立 workflow 为准，不以 Admin Web 发布成功推断 Worker 已更新。

**Why:** #881 的增量哈希和子 Agent 分批读取减少了后续复制，但主聊天读取仍是 `client.get → response.text → JSON 对象`。一个超过 1 GiB 的聊天源可在完整响应、Unicode 解码和解析对象之间产生多倍内存放大。进程被 SIGKILL 后，正常异常处理无法记录失败次数和推进检查点，重启会再次处理同一历史输入。

**How to apply:**
- 先核对 Worker 镜像、lastState 的 OOMKilled/137、内存上限和上一容器日志。连续两轮最后一个未完成 Thread 一致，比单张实时日志快照更有力；仍在运行时的最后一行不能直接当触发点。
- 使用流式字节计数测量真实源大小，不把整个可疑文件读进诊断进程。生产 static 服务可能不提供 Content-Length，不能只依赖 HEAD。
- 代码入口：`service/analytics_source_limits.py`、`thread_analytics._fetch_static_text`、`_load_chat_history_objects`、`_load_static_subagent_objects`。按解压后字节设单源上限、按主聊天和子 Agent 总量设合计上限；超限应明确失败，禁止截断后发布成功或回落到不完整 DB 快照。
- Worker 的 `_record_batch_results` 负责版本级失败重试/隔离；保护修复后仍需验证失败被持久化、后续 Thread 能完成、检查点推进及重启不再增加。大源被隔离不等于大源已完成准确分析。
- 验证入口：`test_analytics_worker_memory.py`（chunked、压缩、Unicode、合计预算和失败日志）、`test_thread_analytics_precompute_regressions.py`（超限禁止 DB fallback）、`test_thread_analytics_backfill_paging.py`（版本级重试/检查点）。
