---
name: evolve-latest-main-integration-boundaries
type: pitfall
created: 2026-10-14
updated: 2026-10-15
tags: [maxwell, evolve, nextplay, integration, review]
links: [evolve-original-evidence-and-report-recovery]
---

# EVOLVE 整合最新 main 时的默认值与迁移边界

2026-10-14 整合中发现：调用方没有文本冲突，不代表行为没有改变。Nextplay 资源构造器的上游默认值放宽后，候选执行需要显式固定自身的严格预检语义；测试只检查缺省参数的假定值，会漏掉真实构造器默认值。同时，新增迁移文件必须进入发布任务实际打包的清单。

**Why:** 三方合并只处理文本，无法自动保护跨文件的默认策略与发布装配；已有题库增长也会让旧测试断言失效，不能把所有失败都归咎于当前改动或修改原评分规则消除失败。

**How to apply:** 同时核对最新 main 的被调用方默认值、调用方所需语义与测试替身；对持久化改动核对运行时代码、迁移及部署打包链。用干净同版本 main、相同依赖和必要编译产物复现失败，区分基线问题与新增回归。单 commit PR、检查通过、真实业务验收和部署是分别验证的事实。

当前实现、精确测试结果与真实验收边界只查 [Maxwell PR #350](https://github.com/world-sim-dev/maxwell-ai/pull/350) 及 [Nextplay PR #19](https://github.com/world-sim-dev/nextplay-eval/pull/19) 中的验证文档；本文不保存易变的通过数量或发布状态。

独立模块验证还须对齐 CI 的 `GOWORK=off` 模式：本机 workspace 可能从其他模块补齐新 import，掩盖当前模块缺失的 `go.mod` / `go.sum`。Why：本机通过不代表镜像或独立 CI 可构建；How：对新增跨模块依赖运行实际发布模块的独立 vet / test，具体修复和结果只查上述 PR 验证记录。

2026-10-15 原件拉取的分层守卫遗漏：见 [PR #355](https://github.com/world-sim-dev/maxwell-ai/pull/355) 及其[修复验证记录](https://github.com/world-sim-dev/maxwell-ai/blob/caa558d7f30efeeb019fa141997a5440b1293eab/docs/verification/2026-10-14-evolve-native-agent.md#2026-10-15-pr-355-ci-分层修复)。Why：`./internal/app/...` 局部测试不包含放在 `./internal` 的架构守卫；业务集成通过也可能遗漏 transport 对 Store ports 的越层依赖。How：HTTP 层只依赖应用服务暴露的错误契约，保留原错误身份和状态码；不要放宽守卫或按字符串识别错误。提交前按 CI 的独立模块入口核对 vet、全包测试和架构检查，源码修复与远端 CI 状态分别回读。
