---
name: evolve-latest-main-integration-boundaries
type: pitfall
created: 2026-10-14
updated: 2026-10-14
tags: [maxwell, evolve, nextplay, integration, review]
links: [evolve-original-evidence-and-report-recovery]
---

# EVOLVE 整合最新 main 时的默认值与迁移边界

2026-10-14 整合中发现：调用方没有文本冲突，不代表行为没有改变。Nextplay 资源构造器的上游默认值放宽后，候选执行需要显式固定自身的严格预检语义；测试只检查缺省参数的假定值，会漏掉真实构造器默认值。同时，新增迁移文件必须进入发布任务实际打包的清单。

**Why:** 三方合并只处理文本，无法自动保护跨文件的默认策略与发布装配；已有题库增长也会让旧测试断言失效，不能把所有失败都归咎于当前改动或修改原评分规则消除失败。

**How to apply:** 同时核对最新 main 的被调用方默认值、调用方所需语义与测试替身；对持久化改动核对运行时代码、迁移及部署打包链。用干净同版本 main、相同依赖和必要编译产物复现失败，区分基线问题与新增回归。单 commit PR、检查通过、真实业务验收和部署是分别验证的事实。

当前实现、精确测试结果与真实验收边界只查 [Maxwell PR #350](https://github.com/world-sim-dev/maxwell-ai/pull/350) 及 [Nextplay PR #19](https://github.com/world-sim-dev/nextplay-eval/pull/19) 中的验证文档；本文不保存易变的通过数量或发布状态。
