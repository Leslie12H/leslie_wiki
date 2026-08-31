---
name: maxwell-quality-eval
type: reference
created: 2026-07-23
updated: 2026-07-23
tags: [maxwell, eval, llm-judge, optimization, self-iteration]
links: [maxwell]
---

# Maxwell Quality 域(Eval + Optimization)— 代码指针

以 2026-07-23 扫描为准;代码会变,以下存指针不存实现细节。根:`~/Downloads/sandai-code/maxwell-ai/services/agent-server/`。

## 去哪看

| 关注点 | 位置 |
|---|---|
| 权威设计/边界 | `docs/eval-product-architecture.md`(repo 根 docs) |
| Eval schema | `migrations/postgres/schema/0060_eval.sql`、`0070_optimization.sql`、`0080_feedback.sql` |
| Case/Run/Score 领域模型 | `internal/modules/quality/eval/domain/` |
| 打分引擎(规则断言 + rubric 编排) | `internal/modules/quality/eval/application/executor.go` |
| LLM judge(panel/tie-breaker/contract) | `internal/modules/quality/eval/infrastructure/modeljudge/` |
| Agent harness(真实 runtime 执行) | `internal/app/quality/adapters/maxwell/runtime_runner.go`;外部 agent 走 `eval/infrastructure/httprunner/` |
| 自迭代闭环 | `internal/modules/quality/optimization/application/task_service.go` |
| Optimizer LLM(5 策略) | `internal/modules/quality/optimization/infrastructure/modeloptimizer/optimizer.go` |
| Issue→回归 case 晋升 | `internal/modules/quality/eval/application/issue.go` |
| 发布后观察 | `optimization/application/release_observation_service.go` |
| API 路由 | `eval/transport/http/endpoints.go`、`optimization/transport/http/endpoints.go` |
| 前端产品包 | `apps/studio/src/products/eval/`(自带 README 地图) |

## 2026-07-23 时点的机制要点(会演进,当线索用)

- 评测对象(target):只有 Prompt/Skill 有 adapter;tool/preset/mcp_provider 是枚举占位。
- Grader 两级:规则断言(contains/regex/json_path 等)先跑,过了才跑 LLM rubric judge;case 级全有全无,无 partial credit。
- Judge:单模型或 2+1 panel(分歧≥2 分或 pass/fail 不一致时请 tie-breaker),保守聚合(min/median),temperature=0,严格 JSON contract + 2 次修复。
- 自迭代:observe baseline → LLM 生成 patch 候选 → 稳定性采样(1/3/5 次,majority vote + Wilson 区间)对比 → gate(零回归 + 至少修复 1 case + 目标维度改善)→ 人审 → 发布 → 观察。case 集划分 optimization/validation(held-out 防过拟合)。
- Transcript:只持久化 64KiB excerpt(`eval_scores.trace_excerpt_json`),完整 trace 只在打分时传给 judge,不落库。
- 无 CI eval gate;无 suite 一等实体(靠 case_ids[] + coverage tags)。

## 交互设计结论(2026-07-24)

差距分析后连做 4 版交互原型,最终版在 `~/Downloads/sandai-code/maxwell-ai/docs/eval-interaction-prototype.html`(v4,浏览器直接打开)。关键设计结论:

- **数据核心是一个一个自包含的任务**(评测/优化任务:冻结 target revision、case 集、判分配置、环境快照,其下是 case×trial,对应 Anthropic 文章的 Task/Trial 模型);**项目与场景是聚合维度(可空外键),不是容器**;UI 第一入口 = Eval 任务中心,项目工作区(孵化/运行两态)是第二入口的汇总视图。(2026-07-24 与 Leslie 讨论定稿,推翻过一版"项目为顶层容器"的设计)
- 三层对象模型:**用例挂场景、revision 挂组件(prompt/skill/tool)、分数挂 agent×场景**;场景⇄组件双向索引(场景→组件=失败归因,组件→场景=影响面/带保护修改)。
- 能力地图=用例的聚类标签(系统起草、随使用生长),不是前置建模作业;场景来源:配置自反推/流量聚类/PRD/坏例子倒推。
- 自迭代交互=挂机战报(批量)+ 爬山日志 attempt chain(单任务,含被拒原因和喂给下轮的教训)。
- 「A 好了 BCD 变差」由依赖图+影响面 gate 解:发布单位是"依赖图上没有人变红"。
- IA:项目工作区左侧导航,一页一对象,总览只放状态+需要我;异步状态机(交棒/通知拉回),不是向导。

**Why:** 2026-07-23 做过一次与 Anthropic《Demystifying evals for AI agents》的差距分析,以上是当时确认的现状,后续讨论 eval 能力建设时可直接引用。
**How to apply:** 改 Quality 域前先读 `docs/eval-product-architecture.md` 和该文件列的 schema;讨论差距/路线图时注意上面"要点"可能已过期,先 spot-check 代码。
