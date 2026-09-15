---
name: executor-declaration-vs-execution-evidence
type: pitfall
created: 2026-09-15
updated: 2026-09-15
tags: [maxwell, evolve, studio, executor, evidence]
links: [nextplay-runner-thread-preset-binding]
---

# Executor 声明、连接检查与真实执行证据不可混用

**Why:** 连接检查没有业务回执，不等于目标不支持结构化回执；声明等级不是某次候选已应用的证明。新配置不能借用缺少配置绑定的历史成功。内存仓库若用 JSON 克隆，`json:"-"` 内部绑定字段还可能在读写时丢失，使纯内存测试与 SQL 实现产生不同事实。

**How to apply:** 分别核对声明及来源时间、连接检查范围、真实 Attempt 的回执和执行时配置。baseline 不能填入候选应用证明；读取失败不能显示无历史。新增不可公开的持久字段时，同时验证 Memory/PostgreSQL 的创建、读回、不可变校验和 CAS 保留扫描。历史无快照保持未验证；有界查询须说明截断，不能声称扫描全历史。

## 核验入口

- Maxwell 仓库：`services/evolve-server/docs/executor-capability-verification.md`，包含接口唯一契约、权限、近期扫描、配置绑定与兼容说明；迁移入口 `services/evolve-server/migrations/postgres/0011_evolve_executor_verification.sql`。这些是代码指针，部署状态须另查版本与实际数据库。
- Studio：`apps/studio/src/products/evolve/targets/`、`executor/CapabilityDeclarationField.tsx`；核对旧记录无法核验、最近失败与历史成功并列、精确 Trial 链接。
- 2026-09-15 本地核验记录：`/private/tmp/nextplay-e2e-20260915/capability-implementation-summary.md`。记录本地修复与测试边界，不作为线上修复证据。
