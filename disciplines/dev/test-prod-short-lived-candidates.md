---
name: test-prod-short-lived-candidates
type: discipline
created: 2026-09-17
updated: 2026-09-17
tags: [git, release, testing, hotfix]
links: [team-test-main-cherry-pick-workflow]
---

# Test / Prod 与短期验收候选

2026-09-17 提出的备选建议，未采用。用户随后确定保留长期 test 分支，验收后 cherry-pick 进入 main，所有 main 改动回合 test；团队规范见 [Test 验收、Cherry-pick 上线、Main 回合](team-test-main-cherry-pick-workflow.md)。以下仅保留为方案背景，不作为当前执行规则；未检查或修改业务仓库。

**Why:** 在新需求必须验收后才能合入 main、紧急修复可先进入 main 的约束下，长期 test 分支持续积累未上线需求，容易形成第二条产品线。环境是部署目标，不必对应长期代码分支。

**How to apply:** 保留 main 作为唯一长期发布主线；功能和修复从最新 main 分出；test 部署明确 SHA 的功能分支或短期 release 候选。候选只纳入本批次拟发布需求，完成验收后合入 main 并发布，结束后删除候选，下一批重新从 main 创建。

- 紧急修复通过 PR、自动检查和最小回归进入 main，随后同步当前候选。候选必须包含最新 main，重新运行集成检查和受影响验收；不能把旧 SHA 的验收视为新版本通过。
- main 应保持可发布，但实际 prod 版本以部署记录、tag/SHA 和制品摘要为准。若 main 有未发布代码，不能默认从 main 发 hotfix 一定只包含修复；应以实际生产 tag 准备修复并同步 main 和活动候选。
- 一个共享 test 环境同一时间只能承载一个版本：按候选排队并记录占用人、SHA、需求清单。相互独立的并行验收需要额外的隔离环境；多个分支本身不能提供运行隔离。
- 多需求混合验收后若只发布其中部分，应从最新 main 重建所选需求的候选，再验证最终组合。
- 发布门禁记录候选 SHA、基线 main SHA、制品摘要与验收结果。main 前移则阻止沿用旧验收自动合并；最终合并结果需要 CI 与必要回归。可使用固定合并候选并快进，或验证实际合并产物，避免源码验收与生产制品脱节。
- 环境差异通过配置和 Secret 管理；数据库迁移需要兼容当前生产版本和切换中的候选，避免环境切换时不可逆破坏测试数据。

## 官方资料指针

- [GitLab 分支策略](https://docs.gitlab.com/user/project/repository/branches/strategies/)：比较分支生命周期和发布需求，不将具体模式视为本团队已采用的事实。
- [GitHub 部署环境](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)：实现环境准入和部署保护时查阅当前文档。
