---
name: evolve-continuous-admission-and-recovery
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [maxwell, evolve, optimization, postgres, idempotency]
links: [evolve-query-latency-and-tuning-visibility, evolve-candidate-loop-decision-boundaries, evolve-benchmark-run-subset]
---

# 持续调优的准入、原子许可和恢复边界

**Why:** 单语句 statement_timeout 不能限制多语句事务的总耗时；只统计当前 Work 会漏掉候选独立验证和历史重评分；在 Run 写入前开放许可，可能在 Trial 图失败后留下仍可派发的 Search。旧 Worker 的领域版本与调度租约也是两种不同的竞态，单靠乐观版本无法撤销自动动作。

**How to apply:** 新模式用事务外来源／模型／对象写入和有界数据库准入，期限必须覆盖 Begin 前后的锁等待与全事务。根预算从服务端持久关系推导，未初始化不能按零放行；旧根先静止、封闭，再在锁外核对完整子链路，正式 Run／Trial 和固定计数同事务提交。新 Search 的外键指向实际首个基线 Run，等待基线时没有诊断；真实完成后才能规划。许可与该图同事务发布，提交不明按不可变回执恢复；重放核对原 Run 的人类许可指纹，不借 Search 当前可变许可覆盖旧请求。同一幂等键换范围或限额必须冲突。

停止后只允许有限的人工规划及已接纳执行的结果收敛；携带自动租约的写入必须再次验证当期 Search、generation、owner/token 和截止时间，不能借人工规划例外继续生成。跨目标版本保留根累计额度与最初截止时间，只释放未提交验收预留。初始化还须检查未确认远端取消，不能把本地 Run 终态等同远端已回收。

2026-10-19 复审已在隔离本机 PostgreSQL 验证事务总期限、旧验证／重评多层家族计数、首个 Search／Run／许可联合回滚、重放与停止隔离；浏览器技术夹具发现并修复通用表单 label 样式覆盖 Checkbox 的布局问题。技术夹具不证明真实候选已应用、评分或改善；公开执行编排、来源复现及完整真实验收仍需继续完成。

会变化的代码、性能数值、检查结果及剩余阻断统一查[三项整合执行记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/progress.md)与[PR #372](https://github.com/world-sim-dev/maxwell-ai/pull/372)，不从本页推断已经合并或上线。
