---
name: legacy-benchmark-catalog-read-gap
type: pitfall
created: 2026-11-03
updated: 2026-11-03
tags: [maxwell, evolve, benchmark, frozen-artifact, tuning]
links: [evolve-benchmark-unified-plan-review]
---

# 旧 Benchmark 原件存在，不代表有标准资产目录修订

**Why:** 历史 Benchmark 的冻结 CaseSet/Judge 可以早于标准目录、也可以没有 Work 归属。页面若只按 Work 或标准目录反查，会把可读原件误显示为“未找到资产修订”。目录缺失不等于原件不存在，也不应该通过补写历史来掩盖查询路径缺口。

**How to apply:** 先只读核对冻结引用、原件内容哈希、业务权限和实际目录关联。优先复用现有 Benchmark 精确成员读取与 snapshot 定义接口；禁止用当前最新版替换冻结引用。回归应覆盖无目录、错版本/哈希、权限拒绝和过期响应。真实页面读回与历史 Run/Trial 指纹不变分别留证。

- 当前修复、接口复用和真实验收指针：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/legacy-benchmark-clean-tuning-20261103.md`。
- 源码入口：集成工作区的 `apps/studio/src/products/evolve/benchmarks/BenchmarkContentsStore.ts` 与 `services/evolve-server/internal/modules/evolve/application/queries/benchmark_definition.go`。版本与部署状态以验收记录为准，不从本页推断已合并。
- 题目隐藏属性已获用户批准取消，精确权限/兼容范围见 `output/evolve-unified-20261019/tuning-input-unification-20261103.md`；历史内容与哈希保持，旧题用于调优后按回归统计，不再称独立隐藏验收。匿名分享范围不能随业务读取权限放开。
- 安装与消费仍分开：逐文件回读只能证明配置保存，原始 provider 请求才证明实际消费；模型额度失败应保留缺账与原失败，不能把读取成功称为自主修改或质量通过。
