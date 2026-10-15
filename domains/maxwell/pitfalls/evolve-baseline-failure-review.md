---
name: evolve-baseline-failure-review
type: pitfall
created: 2026-10-15
updated: 2026-10-15
tags: [maxwell, evolve, nextplay, recovery, testing]
links: [evolve-native-routing-vs-candidate-runner]
---

# 基线恢复与执行证据的一致性审查

**Why:** 首次基线防重规则若按历史 Run 总数判断，会把取消或失败后的合法重试一并堵住。准备成功、接收未知不重发的测试，也不能证明远端明确失败会收敛。两个执行入口接受相同 Case 字段，还必须读取相同目录的证据。

**How to apply:**

- 分别验证进行中基线、已完成可比较基线、已取消或失败且停止已确认的基线；保留历史，合法重试仍受事务并发与预算约束。
- 准备任务区分暂时网络错误、远端失败终态、缺失或无效回执与接收未知，核对总时限和显式恢复路径；未知接收不能盲目重发。
- 对 projectRoot 使用非默认子目录测试实际产物采集；比较两 Adapter 的目录语义，不能只看 succeeded 或文件缺失记录。
- 最小复现应独立于已有理想测试桩。相关现有测试通过但复现失败，表示覆盖缺口，不能拿通过率抵消实际缺陷。

具体代码位置、复现及当前修复状态入口：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-runner-review-20261015.md`；双入口分工见 [内部分流与候选 Runner](evolve-native-routing-vs-candidate-runner.md)。会变化的实现状态回到记录与 PR 核验，本页只保留检查方法。

健康检查也要纳入评分恢复矩阵：登记行的乐观锁版本可能因重检而变化，不能直接等价于原件读取授权已撤销。检查凭据、端点、协议与业务绑定和探测状态是否分离，并用健康重检期间持续分块读取的场景验证。
