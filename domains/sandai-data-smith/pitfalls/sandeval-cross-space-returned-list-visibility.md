---
name: sandeval-cross-space-returned-list-visibility
type: pitfall
created: 2026-10-21
updated: 2026-10-21
tags: [sand-eval, quality, cross-space, manual-return, visibility]
links: [sandeval-mistaken-batch-return-recovery]
---

# Sand Eval 跨空间退回批次的列表可见性

**Why:** 跨空间质检员的列表读取若用“仍可执行的状态”作为可见性准入，整批退回停止旧轮次后，记录可能在“全部/已退回”业务筛选之前即被排除。指派关系、历史判断与整改处置仍在，但当前列表会表现为题目消失；业务展示状态和底层轮次状态不能互相代替。

**How to apply:** 先核对真实身份的 root 标志、当前空间、来源空间和原 assignee。沿候选 SQL、当前版本/轮次、业务状态投影及前端筛选逐层定位，使用真实质检员身份做只读原生列表回读，再单独验证底层可见性表达式。若候选范围已丢行，调整前端筛选或等待摘要刷新不足以解决。修复前先检查已有摘要的 visible、业务状态和源版本；若内容正确且仍可用，只改读取条件即可，不应默认升级 schema 或重算摘要。修复应一致覆盖实时列表、摘要列表和计数，保留已停止轮次的写入保护；明确的指派只读追踪不能变成任意跨空间访问。

## 核对指针

- 2026-10-21 核查证据：[本机报告](/Users/leslie/Documents/Playground/output/lihaolong-caption-20261021/report.md)、同目录 visibility.json 与 native-live.json。实际批次、状态、部署与是否已修复均沿当次证据和生产源码重查；不复制生产记录正文。
- 源码入口：sand-eval/platform/backend/app/repositories/quality_my_review_candidates.py；quality_inspector_summaries.py；quality/application/inspection/inspector_list_projection.py 与 inspector_list_policy.py。检查跨空间准入和业务状态筛选执行顺序，不只看最终 status 参数。
- [整批退回与恢复边界](sandeval-mistaken-batch-return-recovery.md)：读到退回历史与允许继续编辑是两个不同契约。
