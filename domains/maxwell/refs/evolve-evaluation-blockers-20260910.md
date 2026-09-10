---
name: evolve-evaluation-blockers-20260910
type: reference
created: 2026-09-10
updated: 2026-09-10
tags: [maxwell, evolve, stability, cancellation]
links: [evolve-retry-state-transition, evolve-tuning-agent-loop-audit-20260909]
---

# EVOLVE 全流程稳定性审计指针

**Why:** 修复重试状态转换不等于旧远端任务已经停止。本地 Run 终态、Attempt 取消状态和远端执行需要分别验收；已有通过的正常路径测试不能覆盖取消失败与容量边界。

**How to apply:** 查看 Maxwell `codex/trial-detail-ui` 分支 `docs/evolve-evaluation-blockers-audit-20260910.md` 的原始触发条件，以及 `docs/evolve-stability-fixes-20260910.md` 的实现、回归记录和验证边界，不能把本地模拟当作线上事故频率或修复发布证明。

- `application/evaluation/live.go`：超时必须确认取消后才可重派、取消未确认可重入、大 EvidenceSet 使用输出引用。
- `application/evaluation/processor.go`：Run 失败的本地终态提交与远端清理职责。
- `methods/judge/llmrubric/llmrubric.go`：格式修复重试与端点错误重试的区别。
- 仓库 `.tmp/evolve-audit-20260910-overlay.json` 与同日期 log/test 文件：取消失败后重派、取消预算不可恢复、Run 失败无远端取消、证据总量超限四个本地探针。探针断言现存缺陷，不是修复回归。
- `commands/draft.go`：2026-09-10 已核实 ConfirmDraft 调用 validateDraftForFreeze；旧审计中的“确认不校验 payload”不再适用。

优先检查远端任务清理最终收敛，再处理规模准入和仅判卷恢复。具体修复/部署状态以代码和运行证据为准。

## 2026-09-10 修复验收入口

- `application/evaluation/stability_test.go`：未确认取消禁止重派、清理额度恢复、Run 失败后新 Processor 接续清理，以及 520 条大输出与同证据重新判卷；以当前代码测试结果为准。
- `application/evaluation/cleanup.go`、`app/worker/worker.go`：终态 Run 与未完成远端 Attempt 组成持久化清理待办，不依赖失败路径的一次同步请求。
- `application/evaluation/evidence_output.go`：大集合按条读取既有 Attempt blob，验证归属与哈希；仅导出索引不能代替输出正文备份。
- `infrastructure/postgres/cleanup_integration_test.go`：真实数据库约束下的取消重入与队列游标恢复；本次验证使用临时 PostgreSQL，不是 dev 或生产。
- `methods/judge/llmrubric/transient_test.go`：判卷临时错误共享有界尝试预算，取消中止退避；旧评分不静默改写，同证据重新判卷走 evidence_only 新 Run。

本地回归通过不代表部署完成、历史 Run 已修复或真实远端已停止。上线验收继续核对 Worker 版本、远端任务、证据和评分。
