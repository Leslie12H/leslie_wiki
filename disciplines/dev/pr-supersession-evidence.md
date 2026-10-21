---
name: pr-supersession-evidence
type: discipline
created: 2026-10-21
updated: 2026-10-21
tags: [git, pull-request, audit, supersession]
links: [sandeval-cross-request-first-submission-race]
---

# 判断旧 PR 是否已被其他合入覆盖

**Why:** 移植提交可能保留相同意图但改变上下文，因而既不是主线祖先，`git cherry` 也仍显示 `+`。反过来，主线存在相似页面或基础保护，并不能证明一个 PR 的修复、回归和操作工具已完整带入。误关会隐藏尚未交付的工作。

**How to apply:** 固定最新目标分支和原 PR head；同时核对提交祖先、补丁等价性、原 PR 每个文件/变更点与当前源码。补丁不等价时，追到具体移植提交及其合入 PR，逐 hunk 排除缺失，并确认后来没有反向撤销。没有覆盖证据就保留；废弃旧方案属于另一种关闭理由。

## 操作边界

1. 按作者与 OPEN 状态查询全部分页，不只检查用户当前页面。
2. 从原 PR 提交与文件清单还原任务范围，避免把主线后续全部变化当成原 PR 的未合入内容。
3. 区分完整覆盖、部分覆盖、未覆盖与业务废弃。缺少关键写入守卫或回归套件时，不能用其他相似功能代替。
4. 关闭前再次核对作者、OPEN 状态和 head SHA；写明对应合入证据，保留分支，随后独立回读。此方法不授权合并、部署或生产操作。

## 2026-10-21 核对入口

- [Sand Eval #2488](https://github.com/world-sim-dev/sandai-data-smith/pull/2488) 与 [#2603](https://github.com/world-sim-dev/sandai-data-smith/pull/2603)：完整移植的案例；三项修复的移植提交及逐文件差别沿 PR 记录核验。
- [Sand Eval #2594](https://github.com/world-sim-dev/sandai-data-smith/pull/2594)：业务范围持久占用、正式父记录发布与恢复工具须一起核对，不能从其他去重修复推断已覆盖。现状以最新目标分支与 PR 为准。
- [跨请求同范围首送分叉](../../domains/sandai-data-smith/pitfalls/sandeval-cross-request-first-submission-race.md)：并发问题和历史恢复的背景指针。
