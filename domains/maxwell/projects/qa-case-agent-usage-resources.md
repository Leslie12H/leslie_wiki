---
name: qa-case-agent-usage-resources
type: project
created: 2026-09-11
updated: 2026-09-11
tags: [maxwell, qa, prompt, skills, knowledge]
links: [evolve-maxwell-tuning-receiving]
---

# QA Case Agent 正式使用资源

**Why:** 2026-09-11 使用准备检查发现，旧 Prompt 限定恰好两次 skill_load 且禁止其他工具，阻断已配置的知识检索；旧 Skills 把具体测试数据也视作臆造。绑定的共享知识库只有验收样例，样例中的退款规则不应成为业务事实。

**How to apply:** Prompt 管交付与事实边界，Skills 管按需工作方法，知识库保存有来源和适用范围的资料。可以明确标注合成测试数据，不能把合成数值变成产品限制；资料未读取不能声称已覆盖。隔离测试文档，不直接清空共享知识库。更新后从正常 API/UI 保存并回读内容、核对绑定，再实际测试知识召回和用例交付。Skill 的 version 元数据可能未递增，应检查内容 hash 或快照。

## 当前配置入口

- DEV QA Preset：`bc709e3b-2c98-4c90-82f8-6a7d382e4f8c`；Studio `/agents/<presetId>`。
- 可维护资源：maxwell-ai 工作树 `.tmp/evolve-result-details-20260911/agent-resources/qa-case-agent/README.md`；本次源文件尚未提交，后续以实际代码位置核实。
- 原共享库未删除，仅 QA 改绑专用库；具体绑定、Prompt 内容和 Skills 以当前 Studio 为准。
- 冒烟证据会话：`thr_01M27PAKZMSZ27Q0G9PHJRS7KN`。单轮检索与 4 条虚构需求用例成功交付，不代表完整 PRD 与长任务运行稳定性已验收。

PRD 入口索引不等于正文知识。加入实际规则必须记录来源、版本与批准状态；过期规则退出检索。EVOLVE 历史基线保持原快照，新评测应捕获更新后完整资源和知识范围。

## 长任务验收边界

**Why:** 放大执行预算只能解决提前超时，不能证明任务能够跨进程恢复。2026-09-11 的本地修复用模拟时间分别验证长时间运行后按远端任务 ID 恢复、预算耗尽取消，以及不隐式重派；这些测试不等于线上连续运行数小时的验收。

**How to apply:** 检查 `services/evolve-server/internal/modules/evolve/domain/executor/executor.go` 与 `internal/app/integration/a2a/config.go` 的预算及重试默认值，再检查目标的实际 limits。已有目标不会因代码默认值变化自动更新。异步单任务恢复与进程内多轮编排要分开验收；后者需单独验证逐轮状态持久化。测试指针为 evaluation 下 `live_test.go` 的 `TestLongLiveRun*` 及 `processing_window_test.go`。预计两小时的任务应配置大于预计耗时的预算，并明确允许多少次完整重试。

## 配置归属与同步核验

2026-09-11：PR #282 移出新增 QA 配置副本，保留线上 Studio 配置；后续以 Studio 当前资源为准。调优 Agent 的官方 manifest 与业务实例 ID 不同，核验须从 Preset 实际绑定出发，逐项比较正文和 Skill 附属文件，不能只比较名称或版本。审计入口：maxwell-ai 工作树 `.tmp/evolve-result-details-20260911/.tmp/tuning-preset-audit/report.md`。该审计发现内容与绑定漂移，未执行线上覆盖。

## 调优资源同步与发布验证

2026-09-11：通过 Studio 更新调优 Preset 实际绑定的 Prompt 与差异 Skill、补充三个 Skill；回读正文与文件哈希核验完成。审计快照位于 Maxwell 根目录对应本地任务的 `/private/tmp/tuning-resources-after.txt`，具体在线内容仍以 Studio 为准。保存 Preset 时 UI 自动补入 backend resource_url 工具，其他原有工具保留；核对不能只看 skillIds。PR #282 合并版本与 DEV 发布结果见 [发布工作流](https://github.com/world-sim-dev/maxwell-ai/actions/runs/34582708564)，范围为 Studio 和 EVOLVE，迁移关闭。运行就绪和配置一致不等于真实评测已重新跑通。

## 新 Skill 实际试用与启动阻塞

**Why:** 2026-09-11 用 revision 802 需求摘要重新准备评测，实际会话 `agent_session_93305091c35e8f3b341296bf5c4a08f0`、运行追踪 `thr_01M27WECB2WGV2W86QF7BSYJES` 记录了 case-design、judge-design、knowledge-ingest、evolve-workspace-view 加载。知识草稿/ingest 操作被工具 inputSchema oneOf 拒绝；未见 critique 或 Judge 校准实际执行。Prompt/Skills 同步不能代替工具契约同步。Agent 曾将报告批注推断成套件 DSL 自动联动，人工审阅后纠正；该推断不能作为需求或评分依据。

**How to apply:** 同时检查 Preset 工具 schema 与后端方法目录；Case 内容发生变化时使用真实 supersedesCaseRef 与新 revision，完全相同的旧题可幂等复用。Studio FreezeDraft 只把 payload.cases 纳入最终 manifest，不能遗漏旧题并声称会自动拼回。核对真实冻结清单而非目录累计数量。此轮 cases v5 八题与 judge v7 已冻结；新 Run 尚未启动：现有目标仍为 2m/maxAttempts2，重复登记同 Preset 会复用旧目标而不应用新 limits，自动审批拦截了不匹配预算的启动。后续从该会话和目标实际 limits 重新核验，勿把旧 Run 结果当作本轮。

## 默认预算与审查配置排障

**Why:** 2026-09-11 工具管理页刷新并同步六项已有工具后，实际知识 ingest 成功，但 critique 返回缺少 reviewer endpoint。代码显示 critique 读取静态全局方法注册表，而正常判卷与校准使用业务模型配置和凭据工厂；工具 schema 同步只能消除入口契约阻塞。

**How to apply:** 检查 `application/commands/business_basis.go` 的 CritiqueCases 是否在 Work 访问检查后使用业务模型工厂；不可通过全局密钥绕开业务隔离。对应回归见 `business_basis_test.go`。用户要求预算宽松且免填，修复分支 `codex/evolve-readiness-ui-20260911` 将新目标默认设为 3h/1 Attempt，编辑入口置于高级设置，PATCH 保留其他已有 limits。发布与已有目标配置必须分别核验；本条记录时修改尚未部署，不能据默认值声称线上旧目标已经更新。UI 长标题布局、Case 同 revision 内容冲突校验也在该分支，线上 Skill 及真实新 Run 仍须后续核验。

## 真实用户路径检查

**Why:** 2026-09-11 真实页面检查发现确认后需额外生成正式资产、启动表单暴露内部引用、目录版本数冒充当前清单数量；首页 limit:1 配合 Run API 时间正序导致显示首轮状态。完整用户体验不能由单接口或静态预览验收替代。

**How to apply:** 分支 `codex/evolve-readiness-ui-20260911` 的 EvolveWorkspaceStore、DraftsPanel、StartRunDialog、CasesPanel 包含本地修复与回归。截图和逐步边界见该工作树 `.tmp/user-flow-audit/report.md`。检查时未发布、未启动新真实 Run，仍需用正常页面完整走通，不依赖手工改库、填引用或改 JSON。业务模型与凭据应一次接入、后续复用；读取失败应显示未知，不能保留过期成功。
