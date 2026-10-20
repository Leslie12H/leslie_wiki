---
name: evolve-latest-main-integration-boundaries
type: pitfall
created: 2026-10-14
updated: 2026-10-20
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


## 2026-10-17：新增类型不能收窄已合并的 Artifact 约束

评分资产扩展与 Case 续行的整合证据见 [Maxwell PR #361](https://github.com/world-sim-dev/maxwell-ai/pull/361) 和仓库 `services/evolve-server/docs/evolve-evaluator-workspace.md`。数据库、外部 Runner、实际页面与 CI 状态只查这些当前来源，不以本文推断启用状态。

**Why:** 从旧分支复制整份类型 CHECK 会遗漏另一个已合并功能增加的资源类型；三方合并与一般迁移语法测试都可能放过它。合并另一条用户流程时，旧页面结构也可能重新引入折叠 JSON 或丢失下载入口。

**How to apply:** 对新旧约束枚举做集合包含回归，保留已有类型并单独核对私有资源的 Work 归属限制；不执行数据库来替代文件审查。界面整合以新版页面为容器接入新增能力，重新验证未知写入恢复、策略与能力声明不漂移、消息回执状态和原件下载。后端按独立模块入口验证，生成契约必须保留两侧新增字段；真实浏览器和外部执行仍需各自证据。


## 2026-10-17：跨分区校验与未完成的数值输入

实现和回归指针见 [Maxwell PR #362](https://github.com/world-sim-dev/maxwell-ai/pull/362) 及 `caseGoalWorkspace.test.mjs`。

**Why:** 将空输入立即转成 Number 会把用户尚未完成的编辑变为零；仅判断数值能否解析还会放过超范围次数。表单原生校验会对每个无效控件发事件，隐藏分区逐个切换容易争抢焦点。

**How to apply:** 把未完成文本放进同账号/业务的编辑草稿，整数和范围通过后再写入业务值；跨分区、恢复草稿和未知写入锁定都保留此边界。一次校验只定位首个无效字段，并区分模拟事件回归与真实浏览器证据；依赖目录暂不可用时保留原内容，不用原始 JSON 切换充当正常表单。


## 2026-10-20：恢复测试用事件控制中断，而非赌毫秒级进度

**Why:** 用短时父 Context 同时断言“已经完成第一题，又进入第二次判卷”会把 CI 的调度速度当成业务顺序；处理正确也可能因第一题尚未登记就超时而失败。本机通过不能证明这种测试设置稳定，不能靠反复重跑或放宽生产期限掩盖。

**How to apply:** 在测试替身真正进入指定后续调用时触发中断，保持正式判卷、落库与已完成记录的原断言；租约到期使用既有内存 Repository 的显式 now，分别核对到期前拒绝和到期后接管，避免等待墙钟。保留单独的真实 DeadlineExceeded 测试，区分调度窗口/关停退出与题目评分错误。以低并发重复执行和 race 检查验证测试稳定性，再按 CI 独立模块命令跑全包；不以测试替身证明真实模型质量。

对应测试、具体失败和修复后的远端状态查 [PR #372](https://github.com/world-sim-dev/maxwell-ai/pull/372) 与 `services/evolve-server/internal/modules/evolve/application/evaluation/processor_resume_test.go`；此处不保存易变的 CI 结论或次数。
