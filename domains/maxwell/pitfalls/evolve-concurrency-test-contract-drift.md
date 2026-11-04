---
name: evolve-concurrency-test-contract-drift
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [maxwell, evolve, testing, concurrency]
links: []
---

# 准入语义变化后，并发测试不能继续假定只有一个成功

**Why:** 2026-11-04 的 EVOLVE CI 暴露旧内存测试断言漂移：取消旧题隐藏准入限制后，先保存题目、随后停止任务允许两个操作均成功；旧测试仍假定它们必有一个失败。本地反复运行偶然通过，不能证明断言符合新业务语义。该轮修复只调整测试，不改变生产行为或权限。

**How to apply:** 先将并发操作展开成两个可达串行顺序，核对同一事务边界下各操作的允许结果，再验证真正并发。对齐内存与持久化实现已有语义；不要为了旧断言重新加回已取消的限制，也不要用高次数随机重跑替代确定性顺序覆盖。

## 回查入口

- Maxwell PR [#389](https://github.com/world-sim-dev/maxwell-ai/pull/389)，提交 `7cfc90192a48a54518619ad9d5150ae04899472e`。
- 用例入口：`services/evolve-server/internal/modules/evolve/infrastructure/memory/work_write_uow_test.go`；同时查 PostgreSQL 中对应停止/写入事务用例。
- 当前执行证据：集成工作区 `.tmp/c15-ci-memory-green-20261104.log`、`.tmp/c15-ci-evolve-full-20261104.log`；CI run `41775606170`。
- 实际质量与部署验收沿 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 查证。CI 或静态审查通过不代表这些验收已经完成。
