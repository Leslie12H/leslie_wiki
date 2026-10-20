---
name: evolve-tuning-flexibility-review
type: pitfall
created: 2026-10-20
updated: 2026-10-20
tags: [maxwell, evolve, agent, review, performance]
links: [evolve-boolean-rate-goal-direction, evolve-conversation-tuning-workspace-plan, evolve-candidate-loop-decision-boundaries]
---

# 对话调优需要按动作证明而非固定步骤放行

2026-10-20 用户要求完整检查历史评测进入、资料引用、目标修订、候选生成、真实验证、比较与采纳，避免逐步试跑才暴露后续限制。

**Why:** 物理 Work 归属、来源题集、实际诊断范围、目标草稿与正式修订、传输执行器、持续模式的单资源 Method 和隐藏验收政策若各自成为硬门槛，会产生互相矛盾的准入。合法采用 Artifact 不自动解决 Case 正文可读；未记录版本也不等于历史快照不存在。一次静态检查同样不能证明远端未来执行必然成功。

**How to apply:** 以完整调用链为范围，区分可直接复用的历史基线、待补证据及已证明必要的补跑。Agent 自主选择资料和动作，平台保留业务/hidden隔离、精确冻结证据、同根预算、幂等恢复与正式采纳权限；检查绑定到动作，不把方法库或本次验收门槛写成所有任务的固定流程。发送前失败与已发送结果未知分别处理，不通过换键重试解除未知保护。性能审查保留短锁、有界热状态及按需历史原件，不能靠扩容或多建表绕过。

当前审查快照、逐项源码、技术复现、拟变更面和一次性验收矩阵查 Maxwell 本地 output/evolve-unified-20261019/full-flexibility-review-20261020.md；真实执行/环境恢复查同目录 dev-tuning-20261020.md。本文不保存易变的缺陷数、Run/Grant ID或发布状态，不推断整改已完成。
