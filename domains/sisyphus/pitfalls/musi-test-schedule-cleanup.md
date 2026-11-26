---
name: sisyphus-musi-test-schedule-cleanup
type: pitfall
created: 2026-11-26
updated: 2026-11-26
tags: [sisyphus, vidmuse, musi, fixture, schedule]
links: [sisyphus, vidmuse-testing, sisyphus-musi-sandbox-jwt-renewal-rejected]
---

# Musi 测试排程残留阻断后续巡检

**Why:** 2026-11-26 北京时间 10:30 的 [Musi Run](https://sisyphus.sandaii.cn/#/projects/1/execution/runs/RUN-20261126-0007) 中，编辑排程用例在 teardown 报清理失败。同一排程 ID 出现在 [16:30 Run](https://sisyphus.sandaii.cn/#/projects/1/execution/runs/RUN-20261126-0020) 的 33 条 setup 错误中。Runner 记录显示，该启用任务计划于 16:44 触发，落在共享 fixture 每次检查的 15 分钟窗口内，33 个用例均未进入测试主体。10:30 Run 的另一排程用例记录创建接口返回 HTTP 503，编辑用例的清理错误仅记录异常类型，无法据此判定是 DELETE 失败还是读回失败。

**How to apply:** 先看失败阶段和共享 fixture。遇到 `Account schedule … can interfere with acceptance`，按排程 ID 对照此前用例的 teardown，再回查测试账号归属、排程状态和 `nextRunAt`。修复入口是 [Musi 数据清理](https://github.com/world-sim-dev/vidmuse_test/blob/main/tests/ui/helpers/musi_data.py)，只处理本轮登记的测试资源。删除回执不明时先读回同一资源，核对已不存在后结束，对可恢复失败做有界重试。创建请求结果不明时按本轮标记找已接受的资源，避免重复创建。核对 [Zeus PA 排程接口](https://github.com/world-sim-dev/vidmuse-zeus/blob/main/docs/specs/zeus/pa/schedules.md) 的归属和读回契约。回归需分别确认清理后的详情 404、后续真实 Run 进入测试主体和业务用例终态。历史测试排程的处置应单独确认账号归属、测试 ID 和当前状态。
