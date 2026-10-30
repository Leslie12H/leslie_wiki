---
name: mixed-clock-fixture-ordering
type: pitfall
created: 2026-10-30
updated: 2026-10-30
tags: [testing, go, ci, clock, cancellation]
links: [evolve-candidate-version-and-edit-proof]
---

# 模拟未来时间与真实清理时钟不能混用

**Why:** 2026-10-30 EVOLVE 跨页取消轮询测试将执行开始时间逐条推进到未来，却让清理函数取真实当前时间；快机器可能在模拟开始之前完成清理，触发生产端“结束早于开始”校验。云端原失败与本地旧实现重复通过可以同时成立，不能据此删除时间校验或声称本地红绿已复现。

**How to apply:** 同一时序夹具给创建、取消意图和清理使用一致的显式时钟，让清理时间晚于原模拟事件；保留原跨页、防饥饿及时间合法性断言。分别记录云端原失败、本地旧实现未复现、修复后重复 race 和包回归。不要把测试时钟修复称为生产性能或业务质量提升。

源码入口：Maxwell `services/evolve-server/internal/modules/evolve/application/evaluation/live_capacity_test.go`。本轮证据沿集成工作区 `.tmp/cancel-clock-*-20261030.*` 和根目录 `output/evolve-unified-20261019/final-engineering-review-20261030.md` 回查；当前 CI 与发布状态以具体 PR HEAD 为准。
