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

- MCP 服务已发布新 schema，不能证明共享调优 Agent 已登记相同工具定义。遇到新 action 被 oneOf 拒绝时，先核对 Studio「工具管理 → 服务接入」里的实际 schema，并通过现有刷新、预览、同步流程更新；入口见 `services/agent-server/internal/app/api/http/tools_mcp_wiring.go`。2026-10-12 的差异、同步计数和 baseline 实际成功证据见实施记录，避免让 Agent 反复重试旧 schema。
- hidden Case/CaseSet 对准备 Agent 返回不可见，不意味着资产丢失。维持评分材料隔离；由有权限的 Studio 页面选择冻结 Benchmark 和 Work 版本执行，真实结果再回读。不要为了通过准备流程更改原测试集可见性。

- A2A Data part 出现在模型消息中，不证明运行脚本能以文件方式读取同一份完整 JSON。排查入口为 EVOLVE `internal/app/integration/a2a/registry.go`、Agent Server `runtime/application/task_commands.go` 与 Nextplay Runner SKILL。保持原始字节和哈希，避免模型重建 fixtures；原始失败、已确认的文件扩展和真实验收边界见实施记录及其补充确认单。

- 2026-10-12 完整分支 review 与最小复现见 [审查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-review-20261012.md)。Why：按内容哈希保证重试幂等，不能替代 Run/Trial 任务隔离；已取消的本地终态不能代替远端停止。How：核对 `measurement_provider_method.go`、`native_processor.go`、`measurements.go` 和后台 cleanup 的归属及恢复路径，同时检查 Nextplay 共享 Worker 在两类队列非空时的调度公平性。修复与是否通过验收以审查/实施记录和当前代码为准，不沿用更早“无问题”的结论。

- 2026-10-12 请求上限与原 Case 保真检查：具体授权见 `nextplay-case-size-change-review-20261012.md`，实现查 EVOLVE `execution/contract.go` 与 Agent `inputformat/json_file.go`，结果查实施记录。Why：单字段大小、Case 合计、JSON 编码与 Base64 传输大小是不同边界。How：同时验证实际 BuildRequest、接收端总量及原字节，不通过删改 Case 或静默裁剪过限输入规避。
- 2026-10-12 用例选择与内容预览：查 Studio `CaseEditorDialog.css`、`CaseSetSelection.tsx`、`CaseContentPreview.tsx` 和 `CasePreviewStore.ts`。Why：表单宽泛的 label 样式会覆盖 Checkbox 内部布局，只有编号无法帮助用户判断题目。How：缩小表单字段样式范围，复用 Checkbox 与 JSON 查看器，按需获取精确修订，旧请求/关闭后的响应不得恢复错题内容；实际截图与筛选、跨页、批选证据查实施记录。
- 同一 dev 服务存在并行发布时，构建成功不代表目标镜像已生效。查 Nextplay `.github/workflows/deploy-eval-service.yml` 与 `eval-service/deploy/preflight.py`：保留活跃任务排空保护，核对镜像 SHA、业务身份和任务阶段，不为发布取消别人的任务。完整评测快照/通知能力与 score-only 上报边界应在合并时分别保留；本轮发布与未得分边界见实施记录。
