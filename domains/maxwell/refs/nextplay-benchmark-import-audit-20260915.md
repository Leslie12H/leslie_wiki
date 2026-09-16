---
name: nextplay-benchmark-import-audit-20260915
type: reference
created: 2026-09-15
updated: 2026-09-16
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


## 2026-09-16 导入闭环、隐藏题与准入复验

源码核验锚点：Maxwell `041f5135a7d90c70a77435c117f2f04c6ea87939`、Nextplay `a6c52f63febc2c64fec4b1e97fb2ad20e4266a46`。可复核包入口：[导入包 README](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-benchmark-import-20260916/README.md)；同目录保留 `convert.py`、`summary.json`、`go-preflight.json`、`go-admission.json`、`draft-batches/index.json` 与 `online-verification.json`。数量、阻塞项和尺寸以后重跑正式 Go 准入报告，不从数据集目录名推算，也不以 Python 字符长度代替 Go 规范化字节数。本节只记录转换和源码查证入口，不声明线上写入、Benchmark 或真实 Run 已完成。

线上复验入口：[独立导入任务](https://agent.sandaii.cn/evolve/tasks/work_b38ece7e02e9367b74a8d34ad418699d?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263)。2026-09-16 观察到原 sourceTags 的最小 Case 预检提示不支持 storyline coverage prefix；修正标签后，该 Case 在 Nextplay 执行器预检中可新增，但点击写入时页面只显示 HTTP 400。此次未取得响应正文；当时任务未有草稿、Case 或 Run。随后对 20 条按 Nextplay 执行器完成两批线上预检，分别为 16 条与 4 条新增，均为 0 条阻塞且全部标记 manualOnly；只尝试过最小 1 条写入。最终刷新任务仍为 0 Case、0 Run、0 草稿、0 冻结产物，核验记录见导入包的 `online-verification.json`。下述草稿及阶段门槛是源码检查所得，不能冒充该 HTTP 400 的服务器返回原因。当前状态须从此入口重新核实。

**Why:** 导入向导的“写入并冻结”、Case 写入、用户确认、CaseSet 冻结与 Judge 准入是不同路径。只看到预检可新增，仍可能被草稿、任务阶段或尺寸门槛拦住；用可见 Agent 对话补隐藏题草稿会破坏原有可见性边界。

**How to apply:**

- 从 `apps/studio/src/products/evolve/library/LibraryPage.tsx`、`CaseImportWizard.tsx` 追到 `services/evolve-server/internal/modules/evolve/application/commands/case_import.go`：向导只调用 Case import，未准备 cases draft，也不创建 CaseSet 或 Benchmark。继续核对 `commands/case.go` 的 confirmed draft 校验和 `advanceWork`，以及 `domain/work/work.go` 的 ObjectiveSpec/TargetProfile 前置条件；“直接创建评测”仍须按实际 orchestratorMode 验证，不能假定空 Work 可直接写题。
- 草稿路径查 `commands/confirmed_draft.go`、`draft.go`、`freeze_draft.go` 与 Studio `drafts/DraftsPanel.tsx`、`EvolveWorkspaceStore.ts`。确认的 payload 必须覆盖精确 Case 定义；UI 单行“确认”也会继续尝试 freeze。CaseSet 要包含同一已确认草稿的全部且仅有用例，分批导入不能自动证明最终统一清单可冻结。
- 分别核对 `transport/http/handler.go` 的请求体限制、`domain/casecatalog/case.go` 的每字段原始及规范化 JSON 限制、`domain/draft/draft.go` 的整份草稿 payload 限制、`methods/judge/caseaware.go` 的完整 Case context 限制。Case preflight 不执行后两项；分页不能解决单题过大，更不能删输入、评分要求或填执行器无法读取的引用来过门。
- 来源标签先过 `casecatalog.NormalizeCoverageTags`。原 manifest 的 `sourceTags` 可能含 `storyline:` 等不受支持的前缀，不能全部直接塞进 `labels.tags`；转换采用 exporter 的合法 coverageTags，原 sourceTags、来源版本和定位信息完整保存在 `context.provenance`。核对 `convert.py` 的摘要校验，保持 input 和 expectations 不变。
- 来源版本是否持久化要追 `case_import.go` 的 `caseInputsFor` 和 `caseimport/content.go`，不能只相信 Source 注释或预检报告。核验锚点下 identity/version/locator/importKey 未进入 Case 写入字段；Case 只保留来源枚举，复用依据仍是 Work、CaseKey 与 ContentHash。使用显式 provenance 后重新计算内容 hash，并保留原始导出包和报告。
- 隐藏题权限查 `integration/maxwellauth/resolver.go`、`transport/http/handler.go` 与 `transport/mcp/handler.go`：Studio 管理身份和共享 Agent session 的 AccessClass 分开核对。Case list/get 在 `application/queries/service.go`、`infrastructure/postgres/cases.go` 过滤隐藏题；不要把“Agent 看不到”解释成写入失败，也不要改成 visible 来解决导入。
- 特别审计 draft put/get/list 与 import 分支的隐藏题检查是否和 create_revisions 一致；核验锚点存在检查缺口。缺少受保护的 hidden draft 创建入口时，应报告产品阻塞并修复正式管理流程，不利用可见 Agent 或直接改库绕过确认及隔离。
