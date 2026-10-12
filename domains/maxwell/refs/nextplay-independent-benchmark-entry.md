---
name: nextplay-independent-benchmark-entry
type: reference
created: 2026-10-12
updated: 2026-10-12
tags: [maxwell, evolve, nextplay, benchmark, import, judge]
links: [evolve-nextplay-entry-plan-20261009, nextplay-benchmark-import-audit-20260915]
---

# Nextplay 独立 Benchmark 接入入口

方案、源码快照、资产映射、实施顺序与未验证边界见 [2026-10-12 接入建议](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-independent-benchmark-plan-20261012.md)。这是方案，不是线上导入或真实运行完成记录。

**Why:** 导入用例、接入原评分程序和迁入历史成绩是不同能力。序列化格式受支持不意味着业务目录可以直接导入；简化 rubric 导出也不等于原业务 Judge 的评分口径。

**How to apply:**

- 从 Nextplay 原 dataset 加载器、evaluation/config.py、evaluation/judge.py 和 composite.py 读取实际规则；对照 evolve/export.py，确认 exporter 是否仍只生成旧 draft/rubric。不要用旧导出器的字段或历史题数推断当前数据集。
- 回到 EVOLVE services/evolve-server/docs/native-grading-provider.md 核对原生指标协议、逐题配置、多指标调用、缺失状态与整题判定。复用原评分实现，在业务侧做适配，用同一冻结证据做校准。
- 共享 Case/标准与 Benchmark 精确组合、直接运行路径以当前代码为准；外部历史成绩另查结果导入能力，不绕过 Run/冻结 Scorecard 的真实性校验。
- 既有服务与本轮扩展的边界见 [长任务评分变更确认单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-change-review-20261012.md)。回到 Nextplay `eval-service/README.md`、API/Worker/SQL 和 `.github/workflows/deploy-eval-service.yml` 核对：复用现有服务与数据库连接，执行 DDL 前只读确认实际库身份；完整评测任务不等于基于冻结证据的 score-only 任务。
- 离线导出及 EVOLVE 实际 Go 校验的证据、当前分支与未完成事项见 [2026-10-12 实施记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-implementation-evidence-20261012.md)。导出校验不证明原评分等价、线上资产导入或部署；后续真实执行须追加证据。
- 导出适配应对照 EVOLVE `casecatalog.NormalizeContent` 和 `NormalizeCoverageTags`：rubric 的 JSON 容器类型和标签词汇都可能比导入入口更严格。用实际 CaseContent 和 import Plan 校验所有导出题，不只校验 JSON。
