---
name: relocated-git-worktree-repair
type: pitfall
created: 2026-09-28
updated: 2026-09-28
tags: [git, worktree, claude, rebase]
links: [sandeval-branch-automation]
---

# 搬迁后的 Git worktree 指针修复

**Why:** Claude 会话工作目录复制回本机后，文件仍在，但工作树的 `.git` 和主仓库 `.git/worktrees/<name>/gitdir` 可能继续引用 `/sessions/...` 旧路径。此时 `git status` 报「not a git repository」，不能据此判断分支或未提交工作丢失。

**How to apply:** 从仍可用的主仓库读取 `git worktree list --porcelain`，核对目标工作树的 `.git`、对应管理目录的 `gitdir` 和 `HEAD`，并检查旧路径是否存在。确认是路径迁移后，在主仓库执行 `git worktree repair <实际工作树绝对路径>`，再回到目标目录检查分支和 staged/unstaged/untracked 状态。先修复指针并保全文件，不要直接 prune、删除目录或重新 checkout 覆盖原工作。

rebase 前保存原 HEAD 的备份 ref，固定远端 main 的 SHA 和本任务提交范围；完成后用 range-diff 检查原提交是否完整回放，文本冲突须同时保留主线更新与本任务语义。开发分支与测试分支的方向遵守仓库当前 AGENTS 和 test-release 技能。

2026-09-28 的实例为 sandai-data-smith 的 `.claude/worktrees/sand-return-direct`；定位、回放与验证证据见 [PR #2105](https://github.com/world-sim-dev/sandai-data-smith/pull/2105)。PR 的最新状态、检查结果和目标分支以 GitHub 实时记录为准。
