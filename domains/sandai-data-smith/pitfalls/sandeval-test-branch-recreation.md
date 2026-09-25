---
name: sandeval-test-branch-recreation
type: pitfall
created: 2026-09-25
updated: 2026-09-25
tags: [sand-eval, git, github-actions, test-release]
links: [sandeval-deployment-availability]
---

# Sand Eval 测试分支删除重建的边界

**Why:** 2026-09-25 按用户要求从最新 main 删除并重建 `sandeval-test-only`。分支保护允许删除后创建，却拒绝对已创建分支直接推送更新（GH013：须经 PR）；删除目标分支还使以它为 base 的 [PR #1856](https://github.com/world-sim-dev/sandai-data-smith/pull/1856) 自动关闭。重建期间 main 又前进，首次创建的测试分支随即落后。创建新分支触发的测试流水线是发布尝试，不等于部署成功。

**How to apply:** 先实时查询远端 `main` 与 `sandeval-test-only` 的 SHA、差异、关联未合并 PR 和运行中流水线；保存旧测试分支备份。按用户明确授权删除与重建时，用预期旧 SHA 保护删除操作，从刚核验的 main SHA 创建；创建后再次回读两个远端 SHA。若 main 在操作期间前进，既有测试分支的更新受 PR 规则约束，不能假定可以直接 push。检查过期 SHA 的流水线是否被取消或被版本守卫拦截，再分别验证新 SHA 的 Build、Test、Deploy。

## 本次核验入口

- [旧测试分支备份](https://github.com/world-sim-dev/sandai-data-smith/tree/codex/backup-sandeval-test-only-20260925-d7ff4a7c4)；只用于追溯，不作为开发或生产发布上游。
- [重建后的测试分支](https://github.com/world-sim-dev/sandai-data-smith/tree/sandeval-test-only)；打开时重新比对当时的 main。
- [新 SHA 的测试流水线](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36111675533)；2026-09-25 当次 Build 在 ACR 登录步骤失败，未取得部署成功证据。旧 SHA 的 [过期运行](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36111575094) 已取消。
