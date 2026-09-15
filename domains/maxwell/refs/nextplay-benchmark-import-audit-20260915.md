---
name: nextplay-benchmark-import-audit-20260915
type: reference
created: 2026-09-15
updated: 2026-09-15
tags: [maxwell, evolve, nextplay, benchmark, case-import, judge]
links: [nextplay-benchmark-final-plan-20260914, nextplay-benchmark-implementation-20260914, evolve-generic-platform-review]
---

# Nextplay Benchmark 导入与评分核验入口

2026-09-15 核验锚点：Maxwell `15340e7b`、nextplay-eval `a6c52f6`。后续版本从远端重新核实。本轮说明和可复核产物位于 `/private/tmp/nextplay-dataset-export-20260915/`，入口 `Nextplay-Benchmark-实施与问题清单.md`；数据与评分明细见 `nextplay-import-mapping.md`，正式 Go 准入证据见 `maxwell-go-admission-audit.json`。它们是离线审计，不代表线上导入、评分校准或完整真实运行。

**Why:** 业务 exporter、平台导入与运行准入是不同契约；平台功能发布不能证明源 Case 已变成可信 Benchmark。特别不能用业务级列表可见性证明跨 Work 执行可用，或用大文件引用字段存在证明 Runner 已解析它。

**How to apply:**

- 从 Nextplay `eval-runner/src/nextplay_eval/evolve/export.py` 追到 Maxwell `domain/caseimport` 与 Studio `library/caseImportPlan.ts`，核对 sourceKey、expectations、labels 和来源身份；只改 key 会漏掉旧顶层评分字段。用当前正式 Go 导入计划回验转换结果，不只验 JSON。
- 对真实 Case 同时走导入预检和 `methods/judge/caseaware.go` 的 PrepareCaseSpec。核对单 input 与完整规范化 Case 的尺寸上限；具体数量以审计重跑为准。Nextplay `maxwell-runtime/src/nextplay_runtime/inputs.py` 的实际引用读取能力需单独核实，不能用占位 inputRefs 通过检查。
- 显式运行 `dataset/checkpoints.py` 的 audit_cases；Dataset load 或 exporter 成功并不覆盖 formal/current route topology 一致性。
- 评分核对 `evaluation/judge.py`、`composite.py` 的 criterion/metric 两级聚合、critical、weight=0 的 hard gate、视觉方法与 incomplete；确认 `evidence.py` 的正文/索引、actions/stateDiff 与原 TargetOutput 是否等价。对同一已保存证据做原评分与平台评分回放，不用复制 rubric 文本代替校准。
- 平台评分导入是 `evolve_draft` 的 preflight_import_metric/import_metric，经既有确认/冻结流程；Benchmark 定版/结果登记是 `evolve_artifact` 的 create_benchmark/record_benchmark_result。检查 LibraryPage/JudgeSpecEditor 与 API 调用方是否已补全，不能从页面文案推断写入已接通。
- StartRun 的 benchmarkRef 在本轮锚点仅做适用性检查；真实组合在 benchmark_result.go 登记时才严格检查。核对精确 CaseSet/Judge/策略，split 也不自动筛选混合集。
- baseline 后可用同一 Work 的 continue_tuning 保持 Case 引用；核对 domain/work/work.go。跨 Work 则必须检查 commands/run.go 的 Case.WorkID 及 Artifact membership，真实跑到 StartRun/Worker/登记，不能只覆盖读取和历史。
- 原 test 标签若用于优化反馈，必须区分新的回归/训练/验证用途与未见测试；按关联故事和 checkpoint 管理数据泄漏边界。固定 checkpoint 批量与依据实际报告 advance 的完整故事链是两种执行方式。

完整 baseline 与优化对比已另开任务 `01a0a3f1-431e-7792-aad2-89eef395822b`；本页只存查证入口，不声明该任务已完成。

## 2026-09-15 目标能力卡与真实回执不一致

核验入口：[历史 Trial](https://agent.sandaii.cn/evolve/tasks/work_35c276d93336f8552b6a5e55f6a19488?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263&run=run_f9ff05a08d4a00ea510aed713670f6c2&trial=trial_e20bed19ecad3c6d28b95d130e8ec7b2)。本次页面回读有结构化回执，但目标卡仍消费较早的连接预检。实际运行状态以后从此入口重新读取，本页不声明当前版本或新一轮运行结果。

**Why:** Card-only 连接探测不派发业务任务，`application/executorprobe/probe.go:105-124` 固定 receiptKind=none。Studio `targets/targetCapabilities.ts:55-64` 却把 none 映射为“不可用、只能拿到文本”；`TargetsPage.tsx:53-59` 只取 Executor 和最近 probe，没有汇总真实 Attempt。因此结构化回执能力可能被误判。

**How to apply:**

- 先并列回读目标的 lastVerifiedAt、probe 与真实 Trial receiptKind，不因目标卡 unknown 推断未运行。
- 核对 `commands/executors.go` 的 Register/Patch 输入、runProbe、projectExecutor：本轮版本的能力声明写入/读取入口未接齐。A2A `capabilities.go` 从配置读声明，`executorsource/source.go` 又从同一数据库快照读配置；Card-only 检查不会自动把远端业务能力写入该快照。
- Level 来自声明；真实 Run 回执落 Attempt/Evidence，不自动反写 Executor Level/LastProbe。ResourceProvider 准备候选也是独立能力，不能靠重复连接验证或跑一次 baseline 让这张卡必然转绿。
- 修复时区分“未执行所以未观测到”与“已执行但只返回文本”，接通声明与最新真实验证的独立展示；任何能力升级需绑定目标/配置版本与可追溯证据。不要直接把数据库 level 改 l1 或把 none 全部改成成功。
