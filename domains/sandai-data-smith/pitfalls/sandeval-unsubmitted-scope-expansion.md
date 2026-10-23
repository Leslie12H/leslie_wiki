---
name: sandeval-unsubmitted-scope-expansion
type: pitfall
created: 2026-10-23
updated: 2026-10-23
tags: [sand-eval, quality, submission, recovery]
links: [sandeval-handoff-duplicate-scope]
---

# 批次后来新增答案时，历史通过不能覆盖漏送审题

**Why:** 质检通过绑定不可变送审成员。当前作者批次新增答案后，旧报告仍然有效但不覆盖新增题；普通新版本派单会触发正式复验授权，而按最新版复验只读取原冻结成员，不能补齐从未送审的题。应先按稳定工作项与答案版本定位缺口，区分正式代改后继和完全没有送审记录的新增成员。

**How to apply:** 用户选择“补检后提交”时，保留完整交付范围，安排真实新检查和负责人验收。不能把旧通过状态复制到新增答案，不能删除占用、改冻结快照或借用质检员身份制造判断。受控补检需要冻结目标、来源版本、原报告版本、真实操作者及质检员，默认 dry-run，明确 apply，保存不可变意图和独占审计。派单成功但回执丢失后，即使人员已完成检查，也只能复用同一个任务。

## 回查入口

- [补检运营命令与授权、幂等、验收回归 PR #2820](https://github.com/world-sim-dev/sandai-data-smith/pull/2820)：发布与审查状态以 PR 和准确提交的 CI 为准。
- [正式交接与补检 runbook](https://github.com/world-sim-dev/sandai-data-smith/blob/main/sand-eval/docs/operations/package-handoff-recovery.md)：实际支持的参数与边界回源文件，不在 wiki 复制。
- 本次生产只读预检、当前人工处理进展与后续回执：[受限本地证据目录](/Users/leslie/.codex/visualizations/2026/10/22/01a16320-cb2a-7231-b0af-61d168d28c51/package-submit-20261023/manual09-plan.md)。不要把预检通过、代码发布、派单成功、人工验收和正式交接混成一个“修好”。
