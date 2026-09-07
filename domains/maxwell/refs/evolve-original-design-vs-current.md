---
name: evolve-original-design-vs-current
type: reference
created: 2026-09-07
updated: 2026-09-07
tags: [maxwell, evolve, design, workspace, studio]
links: [maxwell, evolve-agent-preset-business-scoped, maxwell-quality-eval]
---

# EVOLVE 原始方案(index.html)对象 → 当前实现的映射(2026-09-07,main 3eed2b0a)

原始方案是 Leslie 本机 `~/Downloads/index.html`(单页 HTML,"EVOLVE — 评测与自迭代调优系统"),核心是 `workspace/` 版本化目录:Goals/Bases/Judges/Profiles/Cases/Runs/Diagnoses/Metrics + workspace.json 当前指针。

映射(去代码看:`services/evolve-server/migrations/postgres/0001..0003`、`internal/modules/evolve/domain/artifact/artifact.go`、`apps/studio/src/products/evolve/`):

| 原始对象 | 现在落在哪 | 差距 |
| --- | --- | --- |
| workspace.json | `evolve_works` 行(objective/target_profile/decision 三个 artifact 指针 + stage) | 没有 Judge/Profile/Run 的"当前指针",靠 Run 自己引用 |
| Goal | `objective_spec` artifact | 无版本链演进 UI |
| Base(背景事实/约束/知识/资产) | 只有 `target_profile.constraints[]` 字符串 + `discovery_report` | **整体缺失**,约束无稳定 ID,Score 无法引用 |
| Judge | `judge_spec`(deterministic-assertions / llm-rubric);`judge_calibration_report` 只有 kind | 无 calibrate method |
| Profile / Variant | `variant_manifest` + `evolve_candidates` | 正文在被测侧;Maxwell 无适配器 → 候选=基线(见 pitfall) |
| Case | `evolve_cases`(case_key+revision_no)+ `case_set_manifest` | 无 difficulty/weight/sourceRuns/assets |
| Run(manifest/Messages/Output/Score/iteration) | `evolve_runs` + `evolve_trials` + `trial_attempts` + `evidence_set`/`trial_assessment`/`scorecard` | Messages 只有 L0 text 或 receipt;iteration 索引由 candidate.parent 隐式表达 |
| Diagnosis / Metrics / Optimize | `diagnosis` kind 存在但无 method;`evidence_query stats/compare/failures` | 全靠 Agent prompt |
| 治理:数据集隔离/版本门禁/停止条件 | `access_class` visible/hidden;candidate decide;budget maxRuns/maxTrials | 无 validation/hidden/regression 集,无自动晋级门槛 |

呈现位置(Studio):`/evolve`(任务表+最近会话)、`/evolve/tasks/:id`(阶段条、Next Action、Results、runs/cases/candidates/artifacts 四 tab、右侧准备度、Agent 停靠)、`/evolve/agent/:sessionId`(左 Runtime 对话,右 "Frozen Facts" 只在 `evolve_work start` 成功后才有内容)。

**Why:** 对比时反复要查"原方案的 X 现在叫什么",此表省得重看两边。
**How to apply:** 评审 EVOLVE 缺口先按此表定位是"对象缺失"(Base)、"对象有壳无方法"(Diagnosis/Metrics/Calibration)还是"治理缺失"(数据集隔离/晋级门槛);前端问题单独看 `/evolve/agent` 探索期右栏空白这一条,原方案的"目录即记忆"在冻结之前没有任何呈现。

## 2026-09-07 补充:为什么 EVOLVE 会话页没有 File Explorer

通用 Chat(`apps/studio/src/pages/chat/ChatThreadView.tsx`)右栏 = Files(agent-server runtime thread-files API,按 businessId+threadId)+ preset 中间件视图(Todo/Plan、Summarization、Task)。EVOLVE 会话页走 evolve-server 门面,只有 sessions/events/messages/stream/assets-sign 五类接口,事件白名单只放 user.action / agent.content(.delta) / agent.tool.call / agent.tool.result / runtime.checkpoint.updated;物理 Thread 在平台业务 P 且不下发浏览器,所以 Studio 拿不到 (business, threadId) 去列文件。另外共享 Preset 的 tool allowlist 只有 7 个 evolve_* 工具,没有 read_file/write_file,Agent 本来也写不了草稿。要恢复"目录即记忆",需要门面加 files 代理 + Preset 加文件工具 + 约定草稿路径;注意 thread files 是会话级,Work 是跨会话的,草稿会随会话过期丢失。
