---
name: evolve-boolean-rate-goal-direction
type: pitfall
created: 2026-10-20
updated: 2026-10-20
tags: [maxwell, evolve, tuning, metrics, frozen]
links: [evolve-latest-main-integration-boundaries, evolve-candidate-loop-decision-boundaries]
---

# 冻结布尔比例与调优方向

2026-10-20 复核发现，冻结指标可以声明 boolean + true_rate 而没有方向；调优表单与严格方向匹配若直接排除它，就无法把用户要求的比例增益变成机器门禁。true 也可能代表错误发生，不能按类型或显示名默认更高更好。

**Why:** 评分事实与本轮优化意图职责不同。直接补写源方向会改动冻结身份；只在目标正文写“提高通过率”则不会自动成为实际比较和采纳门槛。

**How to apply:** 在既有 MetricPolicy 中要求明确 higher/lower，仅对源方向为空的 boolean + true_rate 开放；已有方向不可覆盖，身份、单位、汇总与完整测量继续精确校验。创建与最终比较使用同一领域规则，缺测或错误保持待定。前端同时验证主指标、约束及未知写入后的原请求恢复；真实改善只能由冻结一致的新配对执行证明。

实现、OpenAPI 说明与回归查 [Maxwell PR #378](https://github.com/world-sim-dev/maxwell-ai/pull/378)；当前发布及真实候选结果查 Maxwell 本地 output/evolve-unified-20261019/dev-tuning-20261020.md，不从 PR 或本文推断验收已完成。

正式用例保存与真实运行也须分开：先比较原始输入、通过服务端 Case 准备再保存；草稿 critique 或落库回执都不代替执行结果。发布 Skill 时比较正文而不只看时间；资源存储已更新也不证明既有 Thread 已重新读取新内容。
