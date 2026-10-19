---
name: evolve-catalog-projection-and-external-adoption
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [maxwell, evolve, benchmark, scoring, studio]
links: [evolve-native-routing-vs-candidate-runner, evolve-inline-metrics-catalog-visibility]
---

# 目录投影、外部评分声明与独立关联的边界

**Why:** 后台保存了逻辑执行器归属，不代表每个新版目录都已经按归属聚合；外部评分服务可真实输出指标，也不表示它已经成为可按精确修订关联的独立评估器。两种目录各自为空或重复，可能是页面投影/采用路径缺失，不能据此删除历史数据或伪造资产身份。把深层材料层层排成左右双列，会使正文逐级变窄，最终逐字换行。

**How to apply:**

- 接入对象沿 `executor/executorRouting.ts` 和 `v3/library/objectDirectoryModel.ts` 核对显式 `logicalExecutorRef`；保留物理连接详情与历史 Work/Run 冻结路线。不要按名称归并，也不要仅隐藏候选连接而破坏其引用。
- 外部指标沿 `library/externalEvaluatorAdoption.ts`、`EvaluatorPublicationStore.ts` 与 `CaseMetricAssociations.tsx` 核对显式采用：固定方法版本、输出定义与配置，使用已有原子资产发布形成真实身份，再保存独立关联。读取目录不得创建资产；未知结果重试沿用原请求与原修订。
- Benchmark 目录生命周期与冻结版本分开，沿 `application/commands/benchmark_catalog.go`、PostgreSQL 同名文件和 0041 迁移检查：业务权限、人类管理边界、目录 CAS 与原回执同事务、归档过滤在分页前。归档后历史详情及结果仍按原身份读取。
- 预期与评分阅读先呈现指标和通过条件，完整参考材料按需展开；`StructuredValue` 的嵌套对象采用完整宽度，长规则分段，技术版本可折叠。必须在真实页面检查窄屏与刷新，不以 JSX 或截图生成成功代替视觉核对。

2026-10-19 本地实施、确认范围、独立工作树与真实验收查 [六处修复记录](/Users/leslie/.codex/worktrees/evolve-six-fixes-1019/maxwell-ai/docs/verification/2026-10-19-evolve-six-fixes.md)。代码分支 `codex/evolve-six-fixes-1019`，初始发布提交 `904097740dea17f9d100d36d6d27975009dc2367`；发布任务 [39194487591](https://github.com/world-sim-dev/maxwell-ai/actions/runs/39194487591)。当前发布/归档状态及十题终态必须回到该记录与实际服务刷新，本页不保存易变结果。
