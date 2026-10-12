---
name: nextplay-independent-benchmark-entry
type: reference
created: 2026-10-12
updated: 2026-10-12
tags: [maxwell, evolve, nextplay, benchmark, import, judge]
links: [evolve-nextplay-entry-plan-20261009, nextplay-benchmark-import-audit-20260915]
---

# Nextplay 独立 Benchmark 接入入口

方案、源码快照、资产映射、实施顺序与未验证边界见 [2026-10-12 接入建议](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-independent-benchmark-plan-20261012.md)。该方案用于追踪范围；实际部署、登记、资产与真实评分边界以实施记录为准。

**Why:** 导入用例、接入原评分程序和迁入历史成绩是不同能力。序列化格式受支持不意味着业务目录可以直接导入；简化 rubric 导出也不等于原业务 Judge 的评分口径。

**How to apply:**

- 从 Nextplay 原 dataset 加载器、evaluation/config.py、evaluation/judge.py 和 composite.py 读取实际规则；对照 evolve/export.py，确认 exporter 是否仍只生成旧 draft/rubric。不要用旧导出器的字段或历史题数推断当前数据集。
- 回到 EVOLVE services/evolve-server/docs/native-grading-provider.md 核对原生指标协议、逐题配置、多指标调用、缺失状态与整题判定。复用原评分实现，在业务侧做适配，用同一冻结证据做校准。
- 共享 Case/标准与 Benchmark 精确组合、直接运行路径以当前代码为准；外部历史成绩另查结果导入能力，不绕过 Run/冻结 Scorecard 的真实性校验。
- 既有服务与本轮扩展的边界见 [长任务评分变更确认单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-change-review-20261012.md)。回到 Nextplay `eval-service/README.md`、API/Worker/SQL 和 `.github/workflows/deploy-eval-service.yml` 核对：复用现有服务与数据库连接，执行 DDL 前只读确认实际库身份；完整评测任务不等于基于冻结证据的 score-only 任务。
- 离线导出及 EVOLVE 实际 Go 校验的证据、当前分支与未完成事项见 [2026-10-12 实施记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-implementation-evidence-20261012.md)。导出校验不证明原评分等价、线上资产导入或部署；后续真实执行须追加证据。
- 导出适配应对照 EVOLVE `casecatalog.NormalizeContent` 和 `NormalizeCoverageTags`：rubric 的 JSON 容器类型和标签词汇都可能比导入入口更严格。用实际 CaseContent 和 import Plan 校验所有导出题，不只校验 JSON。

- 2026-10-12 接入交付与验收继续查上述实施记录及 [EVOLVE PR 338](https://github.com/world-sim-dev/maxwell-ai/pull/338)、[Nextplay PR 19](https://github.com/world-sim-dev/nextplay-eval/pull/19)。通用平台只承担可选异步评分协议、恢复/取消/结果保真；业务规则和完整轨迹解释留在 Nextplay。凭据转交须获明确授权并核对临时文件、artifact 与工作流步骤的清理。
- 首次导入出现版本冲突时，检查应用时间精度与 PostgreSQL timestamptz 精度；回归入口为 `services/evolve-server/internal/modules/evolve/infrastructure/postgres/case_asset_timestamp_integration_test.go`。同时验证合法写入、幂等与真正旧版本拒绝，不能仅增加重试。
- A2A Runner 运行版本与 Benchmark 资产冻结属于不同层次。回到 `commands/runner_baseline.go`、`commands/direct_run.go` 核对目标快照和运行声明；不能把“连接当前版本”当成已绑定内层目标快照。更新已有 Skill 先对比实际导出并保留 runtime.env，只替换必要运行包。
