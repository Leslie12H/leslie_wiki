---
name: nextplay-independent-benchmark-entry
type: reference
created: 2026-10-12
updated: 2026-10-13
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

- 2026-10-12 接入交付与验收继续查上述实施记录及 [EVOLVE 统一 PR 342](https://github.com/world-sim-dev/maxwell-ai/pull/342)、[Nextplay PR 19](https://github.com/world-sim-dev/nextplay-eval/pull/19)。通用平台只承担可选异步评分协议、恢复/取消/结果保真；业务规则和完整轨迹解释留在 Nextplay。凭据转交须获明确授权并核对临时文件、artifact 与工作流步骤的清理。
- 首次导入出现版本冲突时，检查应用时间精度与 PostgreSQL timestamptz 精度；回归入口为 `services/evolve-server/internal/modules/evolve/infrastructure/postgres/case_asset_timestamp_integration_test.go`。同时验证合法写入、幂等与真正旧版本拒绝，不能仅增加重试。
- A2A Runner 运行版本与 Benchmark 资产冻结属于不同层次。回到 `commands/runner_baseline.go`、`commands/direct_run.go` 核对目标快照和运行声明；不能把“连接当前版本”当成已绑定内层目标快照。更新已有 Skill 先对比实际导出并保留 runtime.env，只替换必要运行包。

- MCP 服务已发布新 schema，不能证明共享调优 Agent 已登记相同工具定义。遇到新 action 被 oneOf 拒绝时，先核对 Studio「工具管理 → 服务接入」里的实际 schema，并通过现有刷新、预览、同步流程更新；入口见 `services/agent-server/internal/app/api/http/tools_mcp_wiring.go`。2026-10-12 的差异、同步计数和 baseline 实际成功证据见实施记录，避免让 Agent 反复重试旧 schema。
- hidden Case/CaseSet 对准备 Agent 返回不可见，不意味着资产丢失。维持评分材料隔离；由有权限的 Studio 页面选择冻结 Benchmark 和 Work 版本执行，真实结果再回读。不要为了通过准备流程更改原测试集可见性。

- A2A Data part 出现在模型消息中，不证明运行脚本能以文件方式读取同一份完整 JSON。排查入口为 EVOLVE `internal/app/integration/a2a/registry.go`、Agent Server `runtime/application/task_commands.go` 与 Nextplay Runner SKILL。保持原始字节和哈希，避免模型重建 fixtures；原始失败、已确认的文件扩展和真实验收边界见实施记录及其补充确认单。

- 2026-10-12 完整分支 review 与最小复现见 [审查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-review-20261012.md)。Why：按内容哈希保证重试幂等，不能替代 Run/Trial 任务隔离；已取消的本地终态不能代替远端停止。How：核对 `measurement_provider_method.go`、`native_processor.go`、`measurements.go` 和后台 cleanup 的归属及恢复路径，同时检查 Nextplay 共享 Worker 在两类队列非空时的调度公平性。修复与是否通过验收以审查/实施记录和当前代码为准，不沿用更早“无问题”的结论。

- 2026-10-12 请求上限与原 Case 保真检查：具体授权见 `nextplay-case-size-change-review-20261012.md`，实现查 EVOLVE `execution/contract.go` 与 Agent `inputformat/json_file.go`，结果查实施记录。Why：单字段大小、Case 合计、JSON 编码与 Base64 传输大小是不同边界。How：同时验证实际 BuildRequest、接收端总量及原字节，不通过删改 Case 或静默裁剪过限输入规避。
- 2026-10-12 用例选择与内容预览：查 Studio `CaseEditorDialog.css`、`CaseSetSelection.tsx`、`CaseContentPreview.tsx` 和 `CasePreviewStore.ts`。Why：表单宽泛的 label 样式会覆盖 Checkbox 内部布局，只有编号无法帮助用户判断题目。How：缩小表单字段样式范围，复用 Checkbox 与 JSON 查看器，按需获取精确修订，旧请求/关闭后的响应不得恢复错题内容；实际截图与筛选、跨页、批选证据查实施记录。
- 同一 dev 服务存在并行发布时，构建成功不代表目标镜像已生效。查 Nextplay `.github/workflows/deploy-eval-service.yml` 与 `eval-service/deploy/preflight.py`：保留活跃任务排空保护，核对镜像 SHA、业务身份和任务阶段，不为发布取消别人的任务。完整评测快照/通知能力与 score-only 上报边界应在合并时分别保留；本轮发布与未得分边界见实施记录。

- 2026-10-12 统一 PR 与正文传输中断复查见 [PR 342 审查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-pr342-backend-review-20261012.md)。Why：HTTP 状态已返回不等于正文完整；把 body 读取错误当成报告超限会丢失已接纳任务的取分机会。How：区分真实字节超限与传输错误，异步重试必须保持同一 invocationId，同步未声明幂等时不自动重发；测试覆盖 POST 接纳正文和 GET 结果正文中断。合并其他 PR 时先验证远端祖先关系，保留历史后快进推送，不覆盖其他任务工作区；原 PR 状态及 CI/发布/65 题实际评分以 GitHub 和实施记录回读为准。

- 2026-10-12 原报告读写预算一致性：回到 `evaluation/contracts.go` 的 MaxAssessmentBytes 以及 queries、judge_usage、judge_quality、case_proposals 的读取入口。Why：外部原文上限不能直接作为冻结对象读取上限，评分/来源封装与 JSON HTML 转义会扩张字节；只测写入会遗漏详情打不开或用量静默缺失。How：保持现有 CAS 写入上限，评分报告读取共用对应预算，其他产物上限与权限不扩张；用真实 CAS 覆盖接近上限原文、转义膨胀、隐藏/跨任务拒绝、元数据校验及用量。具体修复、测试和合并状态查 [PR 342 审查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-pr342-backend-review-20261012.md) 与 GitHub。

- 2026-10-12 A2A JSON 输入的 API/Worker 装配一致性：入口为 Agent Server `internal/app/composition/services.go`、`runtime.go` 与 `runtime_test.go`，修复追踪 [PR 344](https://github.com/world-sim-dev/maxwell-ai/pull/344)。Why：Worker 装配了 InputPreparer，不代表 API 预检也具备该能力；仅测试手动注入的 Runtime 服务会漏过真实装配缺口。How：对照两个生产构造入口，从 API 装配结果验证附件原字节写入/回读、Thread 隔离和模型资源引用，再核对同版本 API/Worker 的真实派发与评分；原 400 正文、修复测试与实测边界见 [恢复记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-a2a400-recovery-20261012.md)，不把接纳成功当成评分成功。

- 2026-10-12 dev 发布范围：用户要求最新 main 时，仍须按本轮实际改动与运行依赖选择服务，不默认勾选全量。Why：不相关服务的重新发布扩大影响面，也延长验收等待；版本来源与服务范围是两个决定。How：Studio/Evolve 变更选对应服务，若 A2A 修复落在 Agent API 则核对配套 Worker；复用已有镜像时使用 `.github/workflows/maxwell-batch-deploy.yml`，不额外发布 File/MCP/Gateway。已发生的额外发布、取消及替代工作流须如实保留在本轮 [恢复记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-a2a400-recovery-20261012.md)。

- 2026-10-12 复制 Preset 与冻结快照的工具一致性：查 Maxwell `agentpreset/application/selection_validator.go`、`runtime/extensions/catalog.go`，以及 Nextplay `maxwell-runtime/src/nextplay_runtime/materializer/service.py`。Why：原 Preset 仍可保存旧工具引用，复制时按当前目录清理后，临时副本可能与冻结快照不同；A2A 已接纳和文件哈希一致不能证明目标开始执行。How：只读对照原/临时 Preset 的工具身份和中间件，再按部署 SHA 核对工具更名或合并；保留一致性校验和失败证据，先确定目标语义的兼容方案，再执行全量。具体工具差异、终态和未得分边界见 [恢复记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-a2a400-recovery-20261012.md)。

- 2026-10-12 结果大小与全流程复查：查 [复查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-full-flow-review-20261012.md) 及 EVOLVE execution/contract、domain/metric/protocol、evaluation/judge_provider_method、jsonwire 和 Nextplay grading.py。Why：提高输出单点仍会被方法入口、传输、JSON 转义或报告读写预算拒绝。How：从真实 fixture 到方法注册表与 CAS 写读测试边界；保留小限额和冻结版本，发布后更新登记并创建新 Run，不能将默认值修改视为既有对象迁移。
- 2026-10-12 Runtime middleware 与证据生命周期：查 Agent Server runtime_capabilities.go、Nextplay runner.py 的 _create_thread 与清理前 ExecutionResult 保存、A2A runtime_result.go。Why：普通工具目录不涵盖 middleware；主文件保存不等于完整原评分材料持久化；临时读取失败不等于目标失败。How：复用业务授权目录并移除能力绕过；清理前保存完整事件与支持文件；重读同一任务，验证不会重复派发。Runner 按逻辑安装路径加载相邻 ZIP；实际挂载根因仍需 dev 核实。最新状态和验收边界查复查记录。

- 2026-10-12 直接评测与调优调用边界：见[设计核对](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evaluation-tuning-boundary-20261012.md)。Why：是否由调优 Agent 发起与底层是否使用 A2A 是不同维度；删除外层运行 Agent 不应删除调优对话，也不能让两种入口形成不同评分口径。How：核对 direct_run.go、tuning_baseline.go、MCP evidence_query 与 Nextplay Runner；两种入口共用逐题执行、冻结版本和结果记录，Agent 按权限读取绑定基线。新增 A2A 执行入口/新任务表建议已被用户否决，改为复用现有 /evaluations 与任务表；完整变更边界以[当前方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-complete-plan-20261012.md)为准，真实取分和候选应用另行验收。

- 2026-10-12 原始证据交付与既有任务复用：见[完整方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-evolve-complete-plan-20261012.md)。Why：飞书 ZIP 经 view_bundle.py 投影，只供展示，不能替代 Runner 原始执行证据、evaluator 输出及 Judge 审计；新增执行表会重复现有任务职责。How：从 eval-service/API.md、repository.py、worker.py 与 run_artifacts.py 核对既有批量入口、任务身份和清理前保存时机；原件直接归档到 EVOLVE 结果体系，展示指标是投影，调优按权限读取原件，不从飞书回读。结果字段/出口的必要变更仍需具体清单确认，不把源码核验当作真实取分。

- 2026-10-12 仅执行与原评分复用：见[收敛变更清单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-raw-batch-change-review-20261012.md)及[复核记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-full-flow-review-20261012.md)。Why：现有 skip_judge 只跳过 LLM Judge，固定/脚本评分仍会运行；原件传输不需要再建预评分导入和重评判定路径。How：核对 local_run.py 的 TargetEvaluator 调用边界与 grading.py 的 target_from_evidence，直接执行复用 executor/capture，原始 ExecutionResult 进入既有 /score；65题确定性对照只证明协议与原程序一致性，不证明真实取分。结果接口/现有表字段变更仍待明确确认，当前清单不授权提交或部署。

- 2026-10-12 稳定资产关联与运行快照：见[指标与 Case 补充清单](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/provider-metrics-case-binding-change-review-20261012.md)。Why：Case 编辑后不应要求另建 Benchmark 或手动升级关联；指标目录能展示也不等于 Provider 接受修改后的规则。How：检查 metricBindings/metricRef、Nextplay grading.py 原版哈希校验及 direct_run.go 的冻结组合入口；普通新 Run 按稳定资产身份解析最新内容并冻结，历史/调优复测沿用原快照，不能只隐藏版本号或更改评分文案。导入原件关联数、当前实现差距与契约范围读取补充清单。
- 2026-10-12 原始批次实施与恢复校验：用户已批准收敛清单的代码/迁移文件实施，仍未授权本轮提交、迁移或部署。入口见[全流程复查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-full-flow-review-20261012.md)。Why：远端已接纳而逐题 Attempt 尚未全部落库时，临时分组会产生重复任务。How：检查 live_http_batch.go 和对应故障测试，先持久化完整批次与成员再提交，恢复使用同一调用和原件；本地测试不替代真实数据库、65题得分和调优应用验收。

- 2026-10-12 失败执行原件与可读性：见[全流程复查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-full-flow-review-20261012.md)的失败原件续接。Why：远端失败也可能携带唯一执行轨迹，丢弃结果或按中间产物清理会让用户和调优Agent无法判断失败原因。How：核对 liveFailResult/FailWithEvidence、queries/attempt_evidence.go 与两种Repository的retention分类；保持错误状态、不参与评分，校验原件哈希与身份后按既有权限提供有界预览。批次接纳丢失时的取消和单题错误影响兄弟题仍是独立恢复边界，源码/测试不能替代真实停止与65题取分验收。

- 2026-10-12 原件清理与发布准备：见[全流程复查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-full-flow-review-20261012.md)的迁移入口与指标名称续接。Why：原件入库不代表目标资源已清理，SQL文件存在不代表发布入口会执行，内部指标键也不等于用户可读名称。How：核对 execution_worker.py 的保留/停止分支、migrate.py 的独立003入口和 shared_export.py 的原维度标题；旧迁移入口不自动应用ALTER，名称修正只作用于新导出。真实数据库、线上旧资产和实际取分另行核验。

- 2026-10-12 结果落库不确定提交：见[全流程复查记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/nextplay-full-flow-review-20261012.md)的落库失败续接。Why：写入报错不证明数据库没有提交；将存储故障转成执行失败会丢失已完成结果或误触发重跑。How：核对 EVOLVE live.go/live_evidence_persistence_test.go 的状态重读、同Attempt恢复及明确错误分类，Nextplay database.py/execution_worker.py 的同份原件有界重写与租约检查；代码级故障注入不能替代真实数据库中断验收。


- 2026-10-13 指标规则与 Case 编辑布局：见[逐页修改记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-case-editor-layout-20261013.md)及其真实组件截图。Why：单纯折叠七项绑定再在底部追加完整规则表单，无法对应指标和判定标准；基础 Button 的居中内层、等宽字体和重复序号会让业务列表持续错位。How：复用组件的 face 样式入口，按 Provider 已声明的 rulePointer/schema 下钻同一份材料，保留兄弟规则、未知字段和父级只读约束；窄屏先让所选规则可见，保存动作固定。用户选择保留暖色粗线条、逐页验收；本地模拟保存不能代替 dev 持久化或65题取分。
- 2026-10-13 入口与数据投影：同一逐页记录保存当前方向及缺口。Why：按被测对象组织底层历史，不等于用户应先进入对象才能看 Benchmark 趋势或调优谱系；Artifact 引用不能回答测什么。How：主入口分别围绕 Benchmark 测量与调优任务组织，对象历史保留辅助关联；冻结快照与普通新运行的最新资产明确区分。未有直接内容读取投影时，不扫描全库修订或按名称猜关联；契约变更沿用仓库确认流程。路由和 Benchmark 详情的新布局尚未实施。
