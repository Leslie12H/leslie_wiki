---
name: monitoring-repair-is-separate-from-claim
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [vidmuse, admin, monitoring, maxwell, github, repair]
links: [monitoring-report-vs-chat-output, monitoring-code-scope-blocks-claim, monitoring-problem-claim-replies-to-historical-alerts]
---

# 告警修复尝试必须独立于认领链路

**Why:** 2026-09-16 评估告警群「尝试修复」按钮。已验收的 `draftPRProposal` 是提案，不是执行任务；现有 GitHub 工具的 read_write 级别也不能保证只在指定分支创建 Draft PR。把修复权限、Sandbox 或队列接入调查 readiness，会让新的写入流程故障影响原本正常的接收和认领。

**How to apply:**

- 单独保存 RepairAttempt、冻结报告及来源 Incident、授权人、仓库/部署 SHA/目标 base SHA，并使用独立 outbox、线程、preset 和预算。按钮回调仅校验和入队。
- 只用 Admin 已验收的初步结论和已核验代码目标。不要要求 confirmed：当前 V2 证据校验明确拒绝该强度。重新核对最新 validator 与 verifiedCodeTargets 契约。
- 使用受限发布能力和独立写入身份，强制仓库、分支、diff、测试回执与 Draft PR 边界；不能给现有只读 Monitoring MCP App 原地升权。
- 保留 source_incident_key、卡片版本、操作权限及幂等检查。旧话题不能因同属 Problem 收到修复广播；重复点击、网络不确定和晚到回执不能创建重复 PR。
- PR 打开不等于已合并、部署、恢复或 Incident 关闭。首版停在可审查 Draft PR；执行环境不可用只阻断修复入口。

## 追溯入口

- [Admin 卡片回调](https://github.com/world-sim-dev/vidmuse-admin/blob/21764138ad9e70c7105d1c0447559a6223d1c79e/apps/admin/service/monitoring_problem_card_action.py)、[报告校验](https://github.com/world-sim-dev/vidmuse-admin/blob/21764138ad9e70c7105d1c0447559a6223d1c79e/apps/admin/service/monitoring_incident_report_validation_v2.py)。
- [Maxwell GitHub 权限控制](https://github.com/world-sim-dev/maxwell-ai/blob/8141d9fbafafd5b5e9345d43eeead5072d60d218/services/mcp-server/internal/github/client.go)、[Monitoring MCP 只读身份](https://github.com/world-sim-dev/vidmuse-monitoring-mcp/blob/2a3389fe11e448bface2aaea7d0063c34cc8e98b/docs/readonly-code-database-evidence.md)。
- 详细设计与估算：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/monitoring-repair-button-plan-20260916.md`。这只是设计评估，未实施修复按钮或运行真实修复；权限与 Sandbox 条件须另外核验。
