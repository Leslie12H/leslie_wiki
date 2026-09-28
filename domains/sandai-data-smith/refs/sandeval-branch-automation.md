---
name: sandeval-branch-automation
type: reference
created: 2026-09-18
updated: 2026-09-28
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

## 2026-09-25 主线 PR 与草稿 Gate

当前 main 发布边界以仓库 `sand-eval/.agents/skills/sand-eval-test-release/SKILL.md` 为准：从最新 main 建干净开发分支，开发分支直接向 main 提 PR，不能把测试集成分支历史带入 main。上文 2026-09-19 自动回合仅是当日流程记录。

**Why:** [PR #1921 的草稿 Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36131883370) 在改动分类阶段报 `draft classification must disable every surface and job`，业务测试没有运行。仓库 `sand-eval/platform/scripts/select_tests.py` 中，草稿分支清空了 surfaces，但前端关联测试和前端类型检查仍可从改动文件重新选中，造成校验矛盾。该现象是 CI 草稿分类问题，不是质检业务代码失败；截至本次核验，分类器尚未修复。

**How to apply:** 草稿 PR 若出现上述秒级失败，先看 Detect platform changes 的具体日志和 `IS_DRAFT`，不要把它当成业务测试失败。需要正常 Gate 证据时，将 PR 设为 Ready；本次 [Ready Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36132026089) 已通过。PR 合并和 main 发布仍分别核对；#1921 的 main 提交与发布状态从 [PR](https://github.com/world-sim-dev/sandai-data-smith/pull/1921) 和该提交的 Actions 记录实时读取。

## 2026-09-28 测试分支与 main 共用祖先

**Why:** 准备 [PR #2144](https://github.com/world-sim-dev/sandai-data-smith/pull/2144) 时，开发分支以提交 `b9bce96ad` 为父，`sandeval-test-only` 当时也停在该提交，但该提交已经属于 `main`。单独检查“测试分支是开发分支祖先”会误判为携带测试专属历史；同时，直接向已前进的 `main` 提 PR 曾与新改动的质检使用文档冲突。

**How to apply:** 先刷新远端并核对源、目标和父提交；同时比较 `origin/main..origin/sandeval-test-only` 是否有测试专属提交，以及 `origin/main..开发分支` 的提交列表、合并提交和实际差异。只有共享祖先属于 `main`、没有测试专属提交且差异均为本任务时，才能继续。若 `main` 前进造成冲突，只从最新 `main` 更新开发分支并逐处合并两侧意图；PR 的 Gate 与可合并状态最后重新读取。
