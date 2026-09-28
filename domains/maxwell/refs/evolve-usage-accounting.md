---
name: evolve-usage-accounting
type: reference
created: 2026-09-15
updated: 2026-09-15
tags: [maxwell, evolve, 用量, 成本, 可观测]
links: [maxwell, evolve-error-policy-fail-breach]
---

# EVOLVE 模型用量记账的口径与落点

指针页。代码在 `services/evolve-server/internal/modules/evolve/domain/usage`(口径)+ 各 Method + `application/evaluation`(落点),会变,去仓库看。

口径(2026-09-15,commit 7204e300 建立,当日补全):

- **只记物理量,不折算金额。** token 数和模型名是平台观测到的事实,单价是部署配置(按租户、按合同、会追溯改),折算出来的钱冻进不可变产物就永远改不回来。
- **未知 ≠ 0。** `Count` 零值是未知,JSON 用 `omitzero` 整个字段不出现;未知不进求和,改为累加 `UnreportedCalls`。
- **只记录,不决策。** 没有预算、没有上限、没有因用量产生的 error;判分结果与 Run 结局必须与用量是否上报无关(有测试钉)。
- 重试算钱:被丢弃的那次回答也付过费,照记。

落点(三类,别混):

1. **判卷**:用量在 strict judge output 里 → 冻进 TrialAssessment → 在 Scorecard 汇总成 Run 总量。判卷失败时没有 strict output,改放在 error 版 TrialAssessment 的顶层 `usage`,Scorecard 的汇总两种形状都读。
2. **非判卷 Method**(diagnose/from-baseline/critique/propose/pairwise/anchor-refine):它们每次 agent 动作才调一次、不隶属任何 Trial、有的在 Run 存在之前就跑了,所以**不并进 Run 总量**。有产物的(DiagnosisReport 是冻结产物)寄在产物内容体里,其余随方法返回值回给调用方,再统一进指标。
3. **指标两族**,故意不合并:`evolve_judge_*` 是判 Trial 花的钱,`evolve_method_*` 是围着判卷转的优化循环花的钱。合并会让两边都失真。

带外通道(2026-09-15 新增):`usage.Recorder` 挂在 context 上,`usage.Report/ReportOne` 在没装 Recorder 时是 no-op。这是为了**不改 `methods.Implementation` 契约**——Method 失败时返回 nil 输出,已经付过钱的调用没有载体带回;而 propose 这类方法的输出是裸数组,根本没有信封放记录。编排层在 `registry.Invoke` 外面装 Recorder(`appeval.InvokeWithUsage`),成功失败都拿得到。

**Why:** 把用量塞进每个 Method 的返回签名,等于让所有实现(包括业务自带的 grading provider)都要满足一个没有任何决策会读的会计字段;而错误路径恰恰是最该记账的路径(钱花了、结果没有)。

**How to apply:** 新接一个会调模型的 Method:在它自己的重试循环里 `Observe` 进一个本地 accumulator,用 `defer usage.Report(ctx, acc.Record())` 保证所有返回路径都上报;有自己产物就顺带放一份 `usage,omitempty`。调用侧用 `appeval.InvokeWithUsage` + `RecordMethodUsage`。动到任何冻结产物的结构时,兼容测试要按仓库既有严格度做:`git archive HEAD services/evolve-server` 抽到临时目录,把同一个生成器编进旧代码跑一遍,确认 JSON 与 SHA-256 完全一致,这样钉的字面量才是锚点而不是快照。
