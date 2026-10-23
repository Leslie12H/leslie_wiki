---
name: sandeval-test-branch-recreation
type: pitfall
created: 2026-09-25
updated: 2026-10-23
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

## 2026-09-28 补充

**Why:** test 分支即使已删除，仓库 ruleset 对同名分支的创建仍要求目标提交先有成功的 `Sand Eval Platform Gate`。`main` 在备份、删除期间前进时，新 SHA 的 Gate 尚未完成会使重建推送遭到 GH013 拒绝。删除目标分支自动关闭的 PR，在重建后也不一定都能重新打开：改动已由同源 PR 合入 `main` 的，重建后的 test 已包含其内容。

**How to apply:** 删除前保存并远端核实旧 test 备份；删除后重新读取 `main`，等待**所选 SHA** 的必需检查成功，再用该 SHA 创建 test，最后独立回读两支和零差异。逐个核查被关闭 PR：仍有差异的尝试恢复，已被 `main` 包含的记录为完成，不制造重复 PR。分支创建和 GitHub Actions 的触发是两件事；按新 SHA 查询 `Sand Eval - Test Build and Deploy` 的运行和结果，没有运行时只报告分支已重建，不能声称测试环境已更新。

- [2026-09-28 main Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36402403907) 与[同名 test 分支](https://github.com/world-sim-dev/sandai-data-smith/tree/sandeval-test-only)是此次核验入口；实际 SHA、PR 和发布状态须实时回读。


## 2026-10-23 Caption 提交与重建前置校验

**Why:** 最新 main 若只改 Caption，平台 workflow 的 paths-ignore 可以使该精确提交没有 `Sand Eval Platform Gate` 回执；其他系统检查成功不能替代测试分支 ruleset 的同名必需检查。手动在 main 上 dispatch 平台 Gate 可能同时触发生产构建与部署，不能当作纯测试入口。

**How to apply:** 删除 test 前先读取现行分支 rules 和目标 SHA 的 check-runs；缺少 Gate 时，从该 main SHA 建独立临时校验分支，在该分支 dispatch 原平台 Gate，并重新核对 workflow 的生产 job 是否被 ref 条件跳过。等待精确 SHA 的 Gate 通过后才删除旧 test，避免留下无法创建的空窗。若发现 main 自身的生成物或业务测试失败，保留旧 test 和远端备份，报告具体失败；不降级必需检查、不伪造状态，也不擅自修改生产发布设置。

- 代码回查：仓库 `.github/workflows/sand-eval-platform-gate.yml` 的 paths-ignore、workflow_dispatch、gate、release-image/deploy 条件，以及 `sand-eval/scripts/generated-artifacts.manifest.json` 和 `sand-eval/scripts/generate_performance_profile.py`。
- 本次精确提交的[隔离校验运行](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39896491764)记录生成物新鲜度失败；当前主线和检查结果须沿运行重新查询。
