---
name: sandeval-branch-automation
type: reference
created: 2026-09-18
updated: 2026-09-19
tags: [sand-eval, github-actions, deployment, git]
links: [team-test-main-cherry-pick-workflow]
---

# Sand Eval 分支自动化核验入口

**Why:** 测试分支部署和 main 回合必须接通同一条可追踪发布链路；口头称呼 test 不一定对应远端的字面分支名。

**How to apply:** 先实时查询远端分支，再核对 `.github/workflows/sand-eval-test-ci.yml` 的触发器和入口守卫。main 回合遵循团队规范，通过普通 merge 的 PR 保留祖先关系；创建 PR 不等于已同步或已部署。

2026-09-18 的实现准备位于 sandai-data-smith 的 `codex/test-deploy-main-sync` 分支和 `/private/tmp/sandeval-test-deploy-main-sync` 工作树；核对 `.github/workflows/sand-eval-sync-main-to-test.yml`。这是待确认的本地实现指针，不代表已发布。部署范围、分支名、PR 和实际上线状态以当次 GitHub 记录为准。

GitHub Actions 创建 PR 需要仓库设置允许；使用 GITHUB_TOKEN 创建的 PR，其检查可能需要写权限成员批准运行。不要把 YAML 中声明 pull-requests: write 当成已核实仓库设置。参考 [GitHub 触发工作流文档](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)。


## 2026-09-19 自动回合变更入口

用户要求测试分支以最新 main 重建，并将后续回合从人工合并改为无冲突时自动普通 merge 后部署；冲突仍保留 PR 待处理。变更与最终状态查 [PR #1418](https://github.com/world-sim-dev/sandai-data-smith/pull/1418)，不要沿用上文旧实现的人工合并结论。

测试分支重建后的部署证据查 [test run 35437291719](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/35437291719)。本地备份 ref 为 `backup/sandeval-test-only-before-rebuild-20260919`。核验自动回合时同时检查 PR 合并结果、显式 workflow_dispatch、expected_sha 校验及部署前分支版本检查；GITHUB_TOKEN 合并本身不会触发 push 部署，单有合并成功不代表已启动部署。
