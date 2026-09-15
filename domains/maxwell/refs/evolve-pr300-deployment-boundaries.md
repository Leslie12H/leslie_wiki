---
name: evolve-pr300-deployment-boundaries
type: reference
created: 2026-09-15
updated: 2026-09-15
tags: [maxwell, evolve, deployment, migration, agent-resources]
links: [evolve-generic-platform-review]
---

# EVOLVE 数据库迁移与 Agent 资源发布边界

来源：[PR #300](https://github.com/world-sim-dev/maxwell-ai/pull/300)，源码锚点 [`d6b33a52`](https://github.com/world-sim-dev/maxwell-ai/commit/d6b33a52da10943fca635b2cf46d353cafbb66ba)。本页记录 2026-09-15 核对的机制；实际部署与数据库现状须查看对应发布记录。

## 同一事务中的加列与建索引会扩大阻塞范围

**Why:** `0011` 先加列，再普通建索引；迁移 runner 将整个文件放在一个事务中执行。加列获得的 ACCESS EXCLUSIVE 锁保留到事务结束，因此建索引期间该表的读写都会被阻塞，不能只按普通索引的写入锁评估。

**How to apply:** 发布前只读核对目标表体量、统计估算行数、现有列/索引定义、长事务与持锁会话，避免先用全表 COUNT 探测规模；据实际数据选择发布窗口。不能直接把事务内的索引语句换成 CONCURRENTLY，PostgreSQL 禁止这种组合。

- 代码指针：[0011 迁移](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/services/evolve-server/migrations/postgres/0011_evolve_executor_verification.sql)、[runner 单文件事务](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/services/evolve-server/cmd/evolve-migrate/main.go#L113-L128)。
- 官方规则：[事务持锁与冲突](https://www.postgresql.org/docs/15/explicit-locking.html)、[并发索引限制](https://www.postgresql.org/docs/15/sql-createindex.html)。

## Nullable 新列支持回滚程序，不能删除新证据

**Why:** 新增配置哈希列允许 NULL，旧程序未指定它的 INSERT 仍合法，旧 SELECT/UPDATE 不读取或覆盖它；新程序读取该列，因此必须先迁移再发布。结构兼容不代表旧程序提供新增的执行配置验证能力。

**How to apply:** 回滚 API/Worker 时保留新增列、索引与配置快照 CAS，核对在途 Run 和旧程序可读的数据形状；不执行 schema down、不回填虚构的历史配置。恢复新版本后仍须区分未验证的旧 Attempt 与带真实快照的新 Attempt。

- 代码指针：[Attempt 读写](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/services/evolve-server/internal/modules/evolve/infrastructure/postgres/attempts.go)、[配置快照保留](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/services/evolve-server/internal/modules/evolve/infrastructure/postgres/retention.go#L46-L48)、[迁移回滚契约](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/services/evolve-server/migrations/postgres/README.md#L170-L212)。

## Agent Prompt/Skill 需要独立同步

**Why:** Studio 发布静态产物，EVOLVE 镜像只装载服务二进制；两者不会自动将 `agent-resources` 导入业务资源库。GitHub 同步的 apply 会应用整个 preview 中全部 added/updated 资源，没有仅选择本次 PR 文件的参数。

**How to apply:** 在共享 EVOLVE Agent 所属业务检查 GitHub connection，预览后核对 sourceCommit、所有资源差异、affectedPresets 和目标 Preset 绑定，再应用可审阅的完整 preview。连接落后时可能带入历史变更；发布成功不能代替资源同步及内容回读证明。

- 代码指针：[资源 manifest](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/agent-resources/manifest.json)、[预览与应用入口](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/services/agent-server/internal/modules/studio/githubresource/transport/http/routes.go#L75-L78)、[完整预览应用及校验](https://github.com/world-sim-dev/maxwell-ai/blob/d6b33a52da10943fca635b2cf46d353cafbb66ba/services/agent-server/internal/modules/studio/githubresource/application/preview.go#L373-L427)。

## 2026-09-15 发布准备证据入口

- [合并提交 CI](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34965905555)、[EVOLVE 构建](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34966543501)、[Studio 208 构建](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34966554867)：核对 headSha 与目标提交一致；构建成功不等于部署完成。
- [DEV 只读数据库预检](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34967133774)：表体量/估算行数、锁与事务聚合、0011 目标对象、迁移台账/checksum 的复核入口；统计是瞬时快照，发布前按间隔和活动重新评估。
- 预检脚本仅在临时运维分支，发布版本仍使用 PR 合并提交；数据库凭据只由 Pod 内程序读取，不输出 Secret、DSN 或业务正文。

## main 发布与迁移复验入口

- 用户要求从 main 发布时，直接使用 workflow_dispatch 的 main ref，并分别核对构建/发布 headSha；不要把固定到 main 提交的辅助分支与用户指定的发布分支混为一谈。
- [main CI](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34967423212)、[main EVOLVE 构建](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34968375609)、[main Studio 209 构建](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34968389350) 的源为 a8063483bcc50f6aafab12441e53bdd80945f856，包含 PR #300。
- [0011 迁移与首次发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34967476178)、[迁移后只读复验](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34968048235)：复核台账checksum、新列和有效索引、当时的事务/锁聚合；后续main重新发布无需重复执行已应用迁移。
- [main EVOLVE 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34968696332)：读取组件rollout、实际镜像相等和运行验证结果，不能仅凭dispatch成功判断发布完成。
- [main Studio 209 发布](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34968858841)：与上述main EVOLVE发布同源；2026-09-15发布后默认入口引用 `/build/maxwell/studio/209/`，以后使用本记录仍需回读在线索引。
- 2026-09-15 本轮仅验证服务部署、迁移和只读页面加载；共享 Agent 私有配置/资源同步预览被自动审批阻断，未应用 Prompt/Skill 同步，也未运行真实评测。不能将服务发布结果扩展为资源同步或真实执行验收。
