---
name: evolve-pr281-dev-deployment-20260911
type: reference
created: 2026-09-11
updated: 2026-09-11
tags: [maxwell, evolve, dev, deployment]
links: []
---

# PR 281 DEV 发布证据

2026-09-11 用户指定部署已合并 PR #281 到 dev，并另行明确允许数据库迁移。发布源码为 main `c5dd348fbc18ac211cd1369a41219207ae906b05`。以下是当次验收证据，当前环境状态应重新查询。

- PR：https://github.com/world-sim-dev/maxwell-ai/pull/281
- EVOLVE 构建：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558545965
- EVOLVE 迁移及部署：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558733197
- Studio 188 构建：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558548776
- Studio 188 发布：https://github.com/world-sim-dev/maxwell-ai/actions/runs/34558832399

**Why:** PR 新后端依赖 migration 0007 的新字段、约束和优化搜索表，必须先完成迁移，再发布后端与前端。

**How to apply:** 检查部署日志的 `EVOLVE migration applied`（0007_evolve_capability_upgrade.sql）、API/Worker rollout、运行时验证步骤；再核对公开 Studio index.html 的构建目录。此次上述步骤均成功，公开 OSS index 指向 build 188；dev API 带 business header 但无鉴权返回预期 401。工作流验证包含 NAS 写入、healthz 和 authenticated MCP initialize。

部署不等于真实评测验证：本次未重跑真实 Run，未确认 agent-resources Prompt/Skills 已同步到业务 Preset，也未验证可选 responder 配置及 P5 外部集成。
