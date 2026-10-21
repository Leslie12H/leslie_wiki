---
name: evolve-tuning-flexibility-review
type: pitfall
created: 2026-10-20
updated: 2026-10-21
tags: [maxwell, evolve, agent, review, performance]
links: [evolve-boolean-rate-goal-direction, evolve-conversation-tuning-workspace-plan, evolve-candidate-loop-decision-boundaries]
---

# 对话调优需要按动作证明而非固定步骤放行

2026-10-20 用户要求完整检查历史评测进入、资料引用、目标修订、候选生成、真实验证、比较与采纳，避免逐步试跑才暴露后续限制。

**Why:** 物理 Work 归属、来源题集、实际诊断范围、目标草稿与正式修订、传输执行器、持续模式的单资源 Method 和隐藏验收政策若各自成为硬门槛，会产生互相矛盾的准入。合法采用 Artifact 不自动解决 Case 正文可读；未记录版本也不等于历史快照不存在。一次静态检查同样不能证明远端未来执行必然成功。

**How to apply:** 以完整调用链为范围，区分可直接复用的历史基线、待补证据及已证明必要的补跑。Agent 自主选择资料和动作，平台保留业务/hidden隔离、精确冻结证据、同根预算、幂等恢复与正式采纳权限；检查绑定到动作，不把方法库或本次验收门槛写成所有任务的固定流程。发送前失败与已发送结果未知分别处理，不通过换键重试解除未知保护。性能审查保留短锁、有界热状态及按需历史原件，不能靠扩容或多建表绕过。

当前审查快照、逐项源码、技术复现、拟变更面和一次性验收矩阵查 Maxwell 本地 output/evolve-unified-20261019/full-flexibility-review-20261020.md；真实执行/环境恢复查同目录 dev-tuning-20261020.md。本文不保存易变的缺陷数、Run/Grant ID或发布状态，不推断整改已完成。


## 授权查询与预算锁的性能边界

2026-10-21 的隔离 PostgreSQL 回归发现：带递归血缘、成员与可见性校验的复杂 SQL，在小规模索引读取上也可能主要耗时于 JIT 编译；扩大 statement timeout 不能解决用户等待和持锁成本。

**Why:** 逻辑上有界的返回条数不等于规划/编译有界；若在预算或资产发布锁内编译复杂授权表达式，会把计算开销放大为并发等待。将整包测试连接全局关闭 JIT 只能作为定位对照，不能替代产品实现验证。

**How to apply:** 先对照默认设置与仅测试连接关闭 JIT，保留实际查询计划、完整权限负例及锁延时。相关授权操作可采用短事务内 SET LOCAL jit=off，读操作保持只读，结束后回滚/提交并确认设置不泄漏到池连接；不要修改数据库全局默认或放宽权限 SQL。恢复读优先 Search 精确基线，发现读只查询 ID，禁止为选一个基线加载整段 Run 历史 JSON。具体代码和本轮证据查 Maxwell output/evolve-unified-20261019/flexibility-implementation-20261020.md，不把实验数字当 dev SLA 或真实候选验收结论。


## 工具契约投影、错误反馈与引用读取

2026-10-21 的真实隔离对话补充了模型适配与资料引用两项核查方法；具体会话、错误与修复验证均查 Maxwell output/evolve-unified-20261019/flexibility-implementation-20261020.md，不在本文保存易变模型、会话ID或验收状态。

**Why:** 合法的工具执行JSON Schema不一定可直接提交模型。重复action标签会阻断判别联合的模型投影，历史持久目录又可能保留旧形状；仅刷新远端实现不足以证明旧会话恢复。通用匿名oneOf错误不能帮助Agent修正缺失必填字段。引用的Case ID只证明来源，不等于授权读取原始Case；脱敏复制件的artifactRef才是分析材料的读取入口。

**How to apply:** 对当前真实工具目录和历史持久形状分别测试模型投影，保持原始执行Schema与权限校验不变；多参数形式归于一个action并保留互斥规则，不能靠去掉服务端校验过关。校验失败可在已证明的动作分支报告缺失字段名，不回显参数值，也不猜测分支。自然用户验收中保留模型错误、占位输出与错误读取路径，不能将材料已保存、工具调用或模型完成等同于资料已阅读及候选有效；若切换模型或改用技术路径，单独记录其边界。
