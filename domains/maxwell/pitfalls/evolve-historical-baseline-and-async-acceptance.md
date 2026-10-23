---
name: evolve-historical-baseline-and-async-acceptance
type: pitfall
created: 2026-10-23
updated: 2026-10-23
tags: [maxwell, evolve, a2a, comparison, recovery]
links: [evolve-runtime-payload-and-terminal-recovery]
---

# 历史评分基线与异步接纳的边界

**Why:** 评测用于观察系统变化，不应要求旧系统可重现才能使用已经完成的历史评分。接纳回执、远端执行、证据取回和评分也不是同一个超时窗口；长任务不应被等待任务编号的短超时截断。协议演进后只检查旧回执字段，或假定旧请求正文一定被保留，会错误拒绝真实生效的候选。

**How to apply:** 用户于2026-10-23再次明确：已有Benchmark Run及其评分直接作为基线；同case与评分标准只运行修改后的系统；新增case或改变指标计算才补同口径双方结果。保持历史来源和评分口径，不为缺旧配置或旧回执而要求重跑。候选则验证自己的实际配置、输入与输出回执。对后续候选，界面应展示授权祖先中的原基线，不能仅允许直接父候选。

A2A发送应先返回已接纳任务编号，再持久化跟踪长任务；短HTTP调用期限不代表任务执行期限。发生接纳响应丢失时，先核对同一任务，不将未知当成已取消，也不盲目重复派发。长任务回归分别覆盖接纳、冻结执行时限、观察恢复和最终结果，时钟推进测试不能冒充真实长任务验收。

## 核验指针

- `services/evolve-server/internal/app/integration/a2a/registry.go` 的异步发送配置、`acceptance_timeout_test.go`；`application/evaluation/live_configuration_test.go` 的冻结执行期限恢复。
- `application/comparison/receipts.go` 与 `execution/runner_result.go`：比较复用运行时的精确资源回执；无旧请求正文时只能沿已授权Run的不可变Variant/CaseSet/Case验证，不能取当前Preset补历史。拒绝跨业务、损坏hash及不匹配资源，读入保持有界。
- `apps/studio/src/products/evolve/CandidateResultsStore.ts` 与相邻测试：祖先关系、同Work/业务、逐级资源摘要核对；服务端比较和授权仍为权威。
- 实施和真实完成情况：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/flexibility-acceptance-20261022.md`。测试通过、回执确认、完整评分、指标改善与采纳分别查证，不将本页视为已发布声明。
