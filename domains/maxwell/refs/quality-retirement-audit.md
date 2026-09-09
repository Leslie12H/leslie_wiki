---
name: maxwell-quality-retirement-audit
type: reference
created: 2026-09-09
updated: 2026-09-09
tags: [maxwell, eval, quality, retirement, database]
links: [maxwell-quality-eval]
---

# 旧 Quality 退役核验指针

2026-09-09 核验基线：maxwell-ai `b5918c868a72c8d8f9acceed366575ffe13ecd6b`。以下为核验入口，后续应重新检查 main 与实际部署。

- 退役范围：`services/evolve-server/docs/quality-retirement.md`，明确区分主动入口移除与保留的源码、数据；旧数据未迁入 EVOLVE。
- 代码门禁：`services/agent-server/internal/architecture_test.go` 的 `TestAgentServerDoesNotComposeRetiredQuality`。
- 源码残留：`services/agent-server/internal/modules/quality/`；同时检查 Runtime `ports/runtime_control.go`、Studio Skill `application/optimization_release.go` 及调用者。
- 数据库基线：Agent Server `migrations/postgres/schema/0060_eval.sql`、`0070_optimization.sql`，连同 `migrations/postgres.go`、`sqlc.yaml`、shared query/dbgen 一起审计；仅删现存表不等于停止初始化建表。
- 保留业务数据：`0080_agent_feedback.sql` 及 Studio feedback sqlstore；不要按历史 Quality 归属误删 Runtime feedback。
- 新域边界：`services/evolve-server/deploy/README.md`；EVOLVE 数据库独立，但仍使用 Maxwell 的 eval_read/eval_manage 权限。
- 过时操作说明：`agent-resources/skills/maxwell-studio-guide/references/studio/eval-optimization.md` 及其索引引用。

**Why:** 主动运行链路退役不能证明物理清理完成，更不能证明整库可删；旧 Quality 使用 Agent Server schema，需要区分专属旧库和混合业务库。

**How to apply:** 先核对部署版本、存活消费者与实际数据库，再查表、外键、视图、函数和活动连接，确认历史数据保留要求与备份后单独授权删除。2026-09-09 本次未取得目标数据库证据：本地 dev 查询缺少 DSN，当前 Kubernetes context 未见 Maxwell 工作负载，不能据此宣称目标环境已下线。
