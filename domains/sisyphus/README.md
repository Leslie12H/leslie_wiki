---
name: sisyphus
type: system
created: 2026-09-11
updated: 2026-09-11
tags: [sisyphus, quality-platform, testing]
links: [2026-09-okr-zhaoye-scope, vidmuse-admin, admin-scheduled-report-mechanisms]
---

# Sisyphus 质量平台

团队自建的 project 级质量管理与测试执行平台。仓库 `~/Downloads/sandai-code/sisyphus/`，远端 `world-sim-dev/sisyphus`。2026-09-11 核对本地工作树（分支 `codex/redis-stream-retention`，HEAD `93407a3f`），不代表线上部署状态。

## 去哪看

- `README.md`：仓库地图与产品能力清单，权威入口。
- `docs/architecture/backend-architecture.md`：数据模型、模块边界、运行流、部署契约。
- `docs/architecture/repository-layout.md`：目标包边界与增量迁移契约。
- `docs/open-platform-cli-debug.md`：开放平台一期，CLI 飞书登录换项目级 Agent Token。
- `deploy/README.md`：镜像、K8s manifest、迁移顺序、密钥与回滚。
- 目录：`frontend/` `backend/` `runner/` `deploy/` `docs/` `scripts/`。

## 与度量相关的既有能力（已读代码确认）

- `backend/app/modules/quality_dashboard/`：`entity.py` 的 `metric_daily_rollups` 表是日投影读模型，唯一键 `(project_id, metric_date, dimension_key)`，列含 runs/cases 的 total/passed/failed、`cases_flaky`、`duration_ms_total`、`duration_ms_p95`。`model.py` 定义 `ReleaseGate` / `ReleaseDecision` / `RiskSignal` / `DailyQualityPoint`。
- `backend/app/modules/automation_triggers/`：`automation_policies` 与 `automation_invocations`，承载 cron 与 webhook 触发及调用记录。
- `backend/app/api/auth_dependencies.py`：Agent Token 是一等鉴权方式，带 scopes，在依赖层统一校验，因此项目级 API 均可用它调用。
- Project 是顶层数据与授权边界，公共目录 `/api/v1/projects`；`/api/v1/test-objects` 适配器已退役。

**Why:** 平台已有日投影、发版门禁、定时触发和 Agent 鉴权四块骨架，质量度量不需要另起炉灶；但 `metric_daily_rollups` 的列全是测试执行语义，业务结果类与代码交付类指标在现有表里没有位置。

**How to apply:** 新增度量前先读 `quality_dashboard/entity.py` 确认当前列与唯一键。调度挂 worker，README 明确 worker 负责 schedule firing、API 副本不再启动 scheduler loop，**不要套用 [admin 的定时报表机制](../vidmuse/admin/pitfalls/admin-scheduled-report-mechanisms.md)**，两者启动模型不同。平台自身稳定性是 2026 年 9–10 月 OKR 的 O3-KR4，度量挂在不稳的平台上会一起不可信。
