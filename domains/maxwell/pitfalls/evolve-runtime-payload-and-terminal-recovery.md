---
name: evolve-runtime-payload-and-terminal-recovery
type: pitfall
created: 2026-10-23
updated: 2026-10-26
tags: [maxwell, evolve, runtime, recovery, performance]
links: [evolve-query-latency-and-tuning-visibility, evolve-nextplay-archive-navigation-parity]
---

# EVOLVE 大输入、停机恢复与新会话计划的排查边界

**Why:** A2A 包装器收到请求、内层被测系统完成、证据归档可读和评分完成是不同层。附件原文如果经过多层 Base64/JSONB 往返，会放大派发耗时；本地观察器停机也不能证明远端仍在运行。持续任务换会话后，旧会话的执行许可与新会话的只读准备权必须分开，描述画像中的旧执行器不一定是基线实际使用的接入对象。

**How to apply:** 先按既有 Run/Trial/Attempt、远端 Thread/Run 和原引用追踪，不重复派发。对照大输入的实际请求字节、私有存储 CAS 与回读耗时，再判断是否传输放大。私有封装可以压缩，但恢复身份仍校验原始大小、摘要与归属，并限制解压读取；回滚必须保留在途命令的兼容读取。观察器恢复时先读远端真实终态，父任务取消仍要有效；已确认完成但归档暂不可读应重读同一任务。新会话仅准备计划不能继承旧执行许可；真实接入默认继承已测基线，仍保留明确授权与根用量审计。

## 源码与验证指针

- Maxwell：`services/agent-server/internal/app/integration/runtime/storeadapter/command_payload.go` 及相邻测试；`services/evolve-server/internal/modules/evolve/application/evaluation/live.go`、`live_outage_recovery_test.go`；`application/commands/optimization_explicit_run.go`、`infrastructure/postgres/human_measurement_integration_test.go`。当前实现和版本应重新核对，不把本页当作已发布声明。
- 本轮完整记录：`/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/flexibility-acceptance-20261022.md`。
- 本轮源码冻结及增量复审：集成工作区 `.tmp/evolve-unified-1019/.tmp/final-runtime-recovery-review-20261023.{md,json}`。真实运行、评分、发布和自动审批边界沿记录回查。

技术单题替换通过不能替代自然调优或双轮十题提升。多个真实子任务或模拟用户回合会增加等待时间，应读实际事件与终态定位，不因长等待直接归因于 Adapter 轮询，也不能用部分评分覆盖历史基础设施失败。

## 隔离评分的证据来源必须对齐

**Why:** 2026-10-23 真实验收发现，评分接纳202、任务查询200仍可能只表示评分任务已失败。使用本地EVOLVE运行、共享dev Judge的混合拓扑时，Judge固定回取共享EVOLVE，无法访问本地任务及原件；继续等待或重发执行不会修复这个归属错位。

**How to apply:** 同时核对执行结果所在地、评分服务配置的证据来源、任务归属及评分返回体；通过原任务只读回取复现，不只看HTTP状态。隔离验收应使用相同证据域内的原评分副本或已有被授权的传输拓扑，保留原评分版本和模型，不关闭鉴权、不把失败算零分、不迁移或覆盖旧终态。库初始化及新增凭据目的地按既有确认规则处理。具体回执与恢复计划见本轮验收记录及`output/evolve-unified-20261019/isolated-original-judge-20261023.md`；本页不声明恢复已完成。

## 2026-10-23 重评沿用原执行证据

**Why:** 一个Run完成执行后，新建重评Work并不等于重新执行候选。持续调优根若把重评套入候选准入，会误报版本冲突；即使接纳成功，用新Work对照仍绑定原Trial的文件，也会误报证据无权访问。只验证同Work的mock会遗漏这个跨Work生命周期。

**How to apply:** 检查现有重评命令、根计数事务、运行期权限、原件解析、外部Judge拉取和详情下载整条链。真实用户身份从服务端注入；重复提交沿用同键，根用量不清零，自动阶段/租约不因重评改变。已授权的冻结EvidenceSet按完整引用、Case和执行次数核验原Trial，再由原解析器验证原Attempt及文件hash；不要给新Trial伪造旧文件绑定，也不要用platform身份跳过归属。测试应跨Work、跨Run、隐藏题和实际authorizer，并区分有效质量失败与基础设施失败。

- 源码入口：`application/commands/rescore.go`、`infrastructure/postgres/human_rescore.go`、`application/ports/human_rescore.go`、`application/evaluation/evidence_owner.go`（均在EVOLVE模块）；引用读取与详情分别检查`judge_references.go`及`application/queries/evidence.go`。
- 回归及真实结果指针：本轮验收记录与集成工作区`.tmp/rescore-root-cause-review-20261023.md`、`.tmp/rescore-review-freeze-20261023.json`。源码已测、Judge真实出分、完整十题和双轮提升分别查证，不把首题出分当验收完成。


## 2026-10-23 评分等待与数据库 JSON 往返

**Why:** 处理slice退出后继续保留心跳续租，会让已完成的评分空等剩余租约；大JSON进入MySQL队列filesort会耗尽排序内存；MySQL JSON数值规范化还可能让封存报告与数据库回读值出现末位差异，被严格原件比对当作修改。评分任务completed因此不代表平台已拿到可用报告。

**How to apply:** 先分别定位执行、判卷、报告回收和平台提交时间。让出处理槽时，在处理与心跳全部停止后，以精确旧deadline/owner/业务/Run释放租约，验证同worker新claim也不能被旧claim释放。队列只排序锁定任务身份，再按主键读取正文；不要长期靠提高排序内存掩盖整份JSON排序。数值恢复不得引入容差或修改评分：仅在数据库自身JSON规范化证明整份封存响应等于持久化结果后读取封存原精度，继续核对所有归属、文件摘要和内容；测试实际MySQL及被篡改响应拒绝。

- Maxwell代码入口：`internal/app/worker/worker.go`、`infrastructure/postgres/release_run_lease.go`及相邻公平轮转测试（EVOLVE）。
- Nextplay代码入口：`eval-service/src/eval_service/grading_repository.py`、`grading_reports.py`及`tests/test_repository_mysql_integration.py`。
- 真实恢复、源副本的基础设施补丁、完整十题与双轮提分边界，继续沿上述本轮验收记录及`original-judge-transport-patch-20261023.json`核对；评分内核不变不等于整体服务源码逐字未变。

## 2026-10-24 长目录不能用局部片段代表当前任务

**Why:** 运行列表中的配置正文会使一个业务页超过模型可见窗口。业务分页结束、工具归档已完整保存、模型读完某个搜索片段，是三个不同事实；模型可能只见旧记录而漏掉最新候选，还凭相邻位置猜测原基线。

**How to apply:** 先按用户问题确定范围，利用现有小页与游标读取目录；结果归档的 hasMore/nextOffset 另行续读，搜索未命中不代表后续记录不存在。用时间和正式来源关联定位，再读所需统计；不把全部证据正文灌入上下文。部分读取就明确范围与未知项。修复后用无内部提示的新会话复验，保留原始遗漏表现。

- 通用说明入口：Maxwell `agent-resources/prompts/evolve-tuning-agent.md`、`agent-resources/skills/evidence-diagnosis/SKILL.md`。
- 原始自然场景、结果字节、修复后回读与验收状态：上文同一验收记录的2026-10-24章节；代码修改和隔离资源更新不等于自然复验通过或共享部署。

## 2026-10-24 比较口径兼容不等于已证明结果变化

**Why:** 自然汇总即使已真实消费新SP，仍可能把比较接口的comparable理解为两边均分可以直接作差；当原基线仅部分样本有效、候选完整出分时，这会制造不存在的提升或退步。只检查资源已保存，或者只继续堆叠SP，无法证明工具语义已被正确理解。

**How to apply:** 分别核对模型请求实际消费的Prompt/Skill、工具调用及结果。测量口径兼容、逐题共同有效样本、目标门槛判断是三层证据；使用现有比较的交集/覆盖信息和正式目标结果，缺失时明确不可判断，不用两次Run各自的均分补结论。工具描述与Skill应贴近返回字段说明这些边界，避免要求固定调用顺序；说明改动后须加载实际MCP并在未引导新会话复验，旧失败保留。候选真实应用及评分通过，也不能替代自然汇总可信或双轮质量改善。

- 源码入口：Maxwell `services/evolve-server/internal/app/transport/mcp/schemas.go` 中 `evolve_evidence_query/compare_runs`，以及 `agent-resources/skills/evidence-diagnosis/SKILL.md`；当前字段及默认值应沿源码核对。
- 实际模型请求、自然汇总03失败、候选C6在途和修复加载边界，沿本轮验收记录2026-10-24 06:20章节查证；本页不声明修复已通过真实复验或正式发布。

## 2026-10-24 目录投影、正式基线与派发身份

**Why:** 同一个工具网关可能被模型和HTTP页面同时消费，缩小模型目录返回值会破坏仍依赖完整字段的页面。对话创建的调优任务不一定有“从历史Run创建”的旧绑定，不能在读取正式Search前因旧绑定缺失而提前失败。SDK中定义了checkpoint回调，也不等于实际包装入口已经接上持久化。

**How to apply:** 改目录投影前追踪所有调用方，HTTP契约显式保持完整形态并做路由回归。正式基线优先读取业务/Work限定的有界OptimizationSnapshot身份，避免加载整个Search历史JSON；原件权限检查保持。命令行在真正派发前保存action身份与请求摘要，接纳后另存真实Run身份，只保存小回执；进程中断后先追查原执行，不能把回执当成完成或重复派发许可。

- Maxwell源码指针：`internal/app/run_catalog.go`、`internal/app/transport/http/handler.go`、`internal/modules/evolve/application/queries/tuning_baseline.go`（均在services/evolve-server下）。对应路由、隐藏来源、缺旧绑定和禁止加载历史的回归随源码查证。
- nextplay-eval源码指针：`maxwell-runtime/src/nextplay_runtime/cli.py`和`maxwell-runtime/tests/test_cli_action_checkpoints.py`。当前打包/上传与真实使用版本须沿验收记录核实，不能以单测通过声称远端已更新。
- 真实自然汇总、原候选失败与独立复验、精确日志和发布状态继续沿本页的验收记录指针回查；仅内层运行完成而无最终证据包，不构成评分完成。

## 2026-10-24 远端执行寿命与本地观察解耦

**Why:** 两小时以上的远端任务如果只靠本地轮询续十分钟空闲租约，控制链暂时中断就会丢失仍在执行的Sandbox。内层任务完成、外层进程存活、NAS证据封存必须分别核实；不能仅凭等待时间把原因归为电脑休眠。

**How to apply:** 执行前按实际获准时限预留远端租约并持久化，预留失败不派发；后续短轮询/文件操作不缩短已有长租约。保留独立任务取消和终态校验，未知接纳不重放。验证同时检查云端实际expiresAt、同一实例的观察恢复和命令结果；短命令使用三小时参数只证明参数/租约机制，不能称三小时实跑通过。

- 源码：Agent Server `internal/modules/backend/execution_tasks.go`、`aliyun_sandbox.go`及相邻测试；本轮实际版本、租约与原失败回执见验收记录2026-10-24 18:32章节。

## 2026-10-24 请求体读取截止误取消业务处理

**Why:** 鉴权预读JSON并替换Body后，net/http后台断连读取已经启动；Huma再次设置BodyReadTimeout且不清除，会在请求体已读完后取消仍正常保存/索引的handler。文件已经写入而页面报失败，不能只延长超时或认定未保存。普通Recorder没有真实TCP截止时间，无法覆盖这个故障。

**How to apply:** 在统一HTTP适配层将截止时间限定于读取阶段，读取完成/关闭或multipart解析完成后清除；保留慢上传拒绝、请求主动取消、原长度与权限验证。使用真实HTTP连接分别覆盖预读后慢handler、慢上传、客户端取消，并从原页面复验保存及独立文件哈希。涉及后处理失败时先回读，不重复派发业务任务或覆盖历史。

- 源码：Agent Server `internal/foundation/httpapi/humagin/adapter.go`、`body_deadline_test.go`；原代码复现、修复回归、实际13秒保存200及发布边界见验收记录2026-10-24 18:59章节。

## 2026-10-24 剩余截止精度与权限读取往返

**Why:** 将授权截止向下取整到秒，会把秒尾仍有效的短窗口变成已过期；仅保留纳秒而不调整请求大小预估，又会让边界传输多出字节。另一个相似的超时表象来自权限读取：业务详情装饰层逐个读取同一命名空间，在已有账号/权限调用后叠加串行往返，即使数据库执行计划很快也可能超过上游截止。

**How to apply:** 原执行截止保持精确，不靠增加授权时长补救；传输预估按协议允许的最大时间格式计量，测试序列化重放、秒尾与容量边界。权限链先关联真实 trace 的各段延迟，再用只读 EXPLAIN 区分数据库执行与调用往返；重复读取同一命名空间时复用现有批量读取，保留缺失关闭、损坏失败和每次重新授权，不用缓存或放宽超时掩盖。源码测试通过与运行期已加载必须分别核对。

- EVOLVE 入口：`application/execution/contract.go`、`request_size.go` 及对应测试；Agent Server 入口：`internal/modules/studio/businessfeature/application/service.go` 与 `internal/app/integration/studio/businessfeature/adapters.go`。具体实际耗时、回归、隔离运行与加载边界沿上述验收记录 2026-10-24 20:56 章节回查。


## 2026-10-24 评分覆盖与实际应用回执分母

**Why:** 终态 Run 可能同时含有效评分和执行错误；EvidenceSet 证明的是实际收集的执行，而比较若把全部计划 Trial 都称为“已评分题”，会在已有分题回执完整时误报缺回执。模型又可能将两边不同有效样本的均分解释为退步，接口告警与解释层必须分别验证。

**How to apply:** 评分覆盖、候选应用证明和质量方向分开核对。实际测量题必须逐条核对原执行回执；无分错误题明确记覆盖不足，不能过滤后凑齐验收或补零。重评分按有分题定位原执行，即使原执行当时无分，也不能省略其回执。完整计划仍进入正式决策，有效样本不足不产生改善/退步结论；在未引导的新会话复验解释行为，正确基线ID或工具调用不等于最终报告可信。

- 代码指针：Maxwell `services/evolve-server/internal/modules/evolve/application/comparison/metric_request.go`、`application/commands/candidate_assessment_test.go`，页面说明在 `apps/studio/src/products/evolve/candidates/comparisonWarnings.ts` 与 `v3/ledger/taskReading.ts`。
- 原错误、先红后绿回归、实际加载与自然复验边界沿本页原验收记录2026-10-24 21:40章节查；本页不声明业务验收或正式发布完成。


## 2026-10-24 运行验收策略与指标比较、预算预留与测量权限分离

**Why:** 同一题和评分标准的两次运行，运行级最少成功题数等验收策略可能不同；将整份运行策略当作原生指标比较的必要身份，会把真实可比结果挡住。独立验收容量预留也不是所有人工评测的总次数上限；预留耗尽而总额度仍有余量时，自动按题目相同套入预留路径，会造成笼统预算超限。

**How to apply:** 分别核对运行级判定与原始指标/逐题判定所依赖的身份。原生指标比较排除与其计算无关的运行验收门槛，原历史数据不改；整体运行比较仍保留其语义。人工单次测量复用绑定精确范围的服务端回执，保留同根累计用量、总额度、当前权限和不可变原件，不能靠新Work或清零计数恢复。预算分区不应决定真实证据能否参与比较/采纳，但后者仍须校验范围、独立执行次数、完整有效样本及逐轮目标，禁止把重评分或不足样本当提升。

- 源码指针：EVOLVE `application/comparison/gate.go`、`application/commands/optimization_verification.go`、`optimization_manual_decision.go`、`infrastructure/postgres/optimization_verification.go`及对应PG/命令回归。
- 实际双轮结果、报告哈希、剩余额度回查和部署状态：`output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的2026-10-24晚间章节；完整执行到评分、指标改善、正式采纳与发布分别核实，不以其中一个替代其余。


## 2026-10-25 混合测量范围与会话事件时序

**Why:** 同一候选可以在不同题集和评分标准上普通评测；若正式采纳先对所有运行检查终态，再检查验证范围，就会被无关的在途测量阻断。旧同任务基线目录也有相同风险。另一个展示问题是把持久草稿卡的时间写成渲染时刻，每次刷新会把历史卡片挤到最新进度后面。

**How to apply:** 先校验服务端回执归属，再按实际冻结题目/评分范围选择验证证据；不匹配的普通测量不计数也不阻断，声称使用验证预留的回执仍须准确匹配。范围过滤须同时覆盖候选目录和旧基线发现，并保留缺轮、伪造回执、重评分不增加执行次数等负例。会话里持久事件使用真实修订/确认时间；趋势定位只在范围/选中变化时更新，不因普通进度刷新抢走手动滚动位置。

- 源码：EVOLVE `application/commands/optimization_manual_decision.go` 及相邻测试；共同题目比较的运行聚合策略边界见 `application/queries/run_intersection.go`。Studio `v3/ledger/LedgerPage.tsx`、`benchmarks/BenchmarkMetricsOverview.tsx`。
- 真实运行、先红后绿日志、页面回读、加载和发布状态沿 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的2026-10-25章节核实；源码修复不是已取得提升或已发布的证明。

## 2026-10-25 历史基线复用与最后一次统计失败

**Why:** 比较端已区分运行验收策略和评分身份，不代表历史基线复用入口也同步遵守；只修比较会留下同题同评分仍被阻止复用的入口。SSE只发布变化，终态最后一次统计请求失败后，Run修订可能不再改变，不能等待下一次事件来恢复。

**How to apply:** 沿计划准备、历史授权、测量比较逐层核对同一身份边界；只在临时测量视图对齐无关运行门槛，原记录与新运行授权不改。前端将统计失败和其修订一起保留，采用已有退避读重试，成功后停止兜底，权限拒绝不自动重试。用终态且没有后续SSE的502恢复负例验证，不把源码修复当作原页面所有断连故障已经定位。

- 源码：EVOLVE `application/commands/optimization_reuse.go`、`rescore_test.go`；Studio `EvolveWorkspaceStore.ts` 和相邻恢复测试。加载版本、原页面观察及未证实的连接丢失起因见原验收记录2026-10-25 00:39章节。


## 2026-10-25 终态单次页恢复与逐题质量解释

**Why:** 工作区和单次运行页各自管理统计请求，只修工作区会留下终态单次页永久停在旧分数的同根缺陷。另一个结果解释错误是把 Error→Pass 和 Fail→Pass 都称为质量改善；前者没有旧的有效分数，只能证明恢复可评分。

**How to apply:** 沿所有消费相同终态的 Store/视图检查最后一次请求失败，退避重试到统计成功，403停止；不依赖终态之后仍有新事件。对照报告同时保留每题判定、评分覆盖和原错误，区分可评分性变化与有效质量变化；同为Pass或Fail也只说明该判定未变，不能替代分项分数。用未引导新会话及逐题独立回查验证，模型自我修正的工具错误保留原记录，不能用一次通过覆盖之前失败。

- 源码指针：Studio `RunRecordStore.ts`、`RecordsPage.tsx` 及相邻统计恢复回归；调优资源 `agent-resources/skills/evidence-diagnosis/SKILL.md` 与 `references/outcome-decision-tree.md`。
- 真实复验、加载哈希、自然对话与独立SQL证据沿原验收记录2026-10-25 01:03/01:28章节查证；具体分数、在途状态和PR状态不在本页复制。


## 2026-10-25 局部目录计数与模型参数实效

**Why:** 根任务和候选目录可能分别加载同一 Run 或不同子任务的 Run；取两侧数量最大值既不能去重求并集，也不能证明历史总数。模型请求声明了推理参数也只证明参数已发送，不能据此认定服务实际执行该参数或结果解释已经正确。

**How to apply:** 页面按 Run ID 合并已读取记录并明确范围，不为显示总数向所有候选扇出查询；覆盖重叠、互不相交及尚未打开的候选。模型诊断同时核对请求与完成事件中的实际用量/模型回执、相同资源哈希及未引导回答；参数对照后恢复原隔离配置，不用已启用推理替代业务正确性证据。

- 源码指针：Studio `v3/ledger/LedgerLineage.tsx`、`v3/lineage/historyRendering.test.mjs`；运行证据沿主验收记录2026-10-25及集成工作区 `.tmp/natural13-model-completed-20261025.json`、`.tmp/candidate-read-count-browser-20261025.txt` 回查，具体状态不在本页保存。


## 2026-10-25 工具密集会话的首屏恢复

**Why:** 最近 N 条事件不等于最近 N 条对话；一个长工具回合可以把已保存的用户消息和回答全部挤出首屏。此时检查点仍显示运行中，看起来像对话丢失，但持久消息可能完整。

**How to apply:** 同时核对持久消息和首屏事件类型；有更多历史时补取有界的消息事件，合并去重并按原序列还原。工具历史分页与 SSE 续接仍使用原事件页游标，不能用消息筛选游标替换。覆盖工具占满窗口、交叠去重、补读失败、晚到消息顺序、离开/重新进入及会话摘要；不扫描全部历史、不重发消息。

- 代码入口：Studio `products/evolve/EvolveConversationHistoryStore.ts`、`EvolveAgentConversation.tsx`、`v3/sessions/sessionSummary.ts`。实际复现、回归与页面重入证据见主验收记录2026-10-25章节及 `conversation-window-*-20261025` 文件；合并/发布状态沿分支与PR另查。
- 诊断等待应分段：大量原件读入后可能触发上下文压缩；从 `runtime_context_compaction_terminal` 的 duration、模型调用数和压缩后输入检查，而不能直接归为远端评测挂起。正确压缩不证明分析已完成，模型能否继续读资源正文和给出有据结论须另验。


## 2026-10-25 MCP 数值等价副本与版本化读取

**Why:** 同一工具可以同时返回 JSON 文本和 structuredContent，1.0 与1的数值拼写不同会使字面深比较漏掉重复内容；大量评分正文因而重复进入模型。用float64比较又会把大整数或高精度小数误判相同。直接改已有model_view版本则可能改变历史分页的字节位置。

**How to apply:** 去重只在模型请求投影内做精确数值语义比较，保留原始证据与已版本化读取器；数组顺序、缺键/null、字符串/数字、注释和媒体不得误合并。数值长度和指数计算有界，超界保留副本而不拒绝结果。用实际请求回放比较体积和CPU开销，同时验证历史读取位置不变；请求减小不等于真实模型延迟已经改善，仍需加载后真实复验。

- 源码指针：Agent Runtime `toolprotocol/json_equivalence.go`、`result.go` 的 ModelRequestView/ModelViewV1，以及 `model/multimodal.go`；测试覆盖精度、极端指数、原件不变与旧读取视图。实际回放、回归、运行期加载和提交/发布状态沿主验收记录2026-10-25 03:43章节及集成目录number-dedup日志核对。

## 2026-10-25 摘要投影恢复与资源续读

**Why:** 摘要也会消费重复的工具结果，但直接替换既有摘要输入会改变已保存分片的字节位置；资源窗口按换行或UTF-8边界提前结束时，下一段位置也不能用offset加limit推算。把这类参数错误归为Provider永久失败，会让Agent放弃本来可修正的读取。

**How to apply:** 新摘要使用新投影版本，旧检查点按原版本和原片段续接；仅进行有界的旧身份查找，不扫描历史或重发已完成摘要。资源分页明确返回游标为唯一顺序续读位置；错误给出字符起始或所需最小字节数，通过既有correct_arguments信号恢复，不能静默跳字节或泄露正文。自然会话采用单次大窗口读取不等于已验证多窗口续读；技术拼接测试与实际读取分别记录。

- 源码指针：Agent Runtime `extensions/summarization/preflight.go`、相邻恢复测试；EVOLVE `application/resourcecontent/content.go`、`transport/mcp/schemas.go` 和 `resource_errors_test.go`。加载、真实续读与原件对照沿主验收记录2026-10-25章节核验，不把构建成功当成延迟改善。

## 2026-10-25 工具联合类型与可修正输入

**Why:** 联合schema的根级oneOf错误会遮住真正出错的字段；已授权资源的引用笔误若又被归为永久服务故障，Agent容易放弃或转向不相关工具。手动搜索计划与累计执行许可也不能只因都含“预算”而混用。

**How to apply:** 保持原完整输入校验，仅失败时利用唯一显式discriminator分支补充字段诊断，保留根约束、oneOf歧义和本地引用；不要以重验分支取代完整校验。只对明确的可修正输入给correct_arguments，不按错误文案推断，不将权限/缺失来源/原件损坏当参数笔误。工具说明应明确各计划是否具有授权能力。技术原参数回放与自然Agent能否自纠正分别记录；有错误提示或提出文字计划均不算真实计划准备完成。

- 指针：Agent Server `modules/tools/contract/input_diagnostics.go`及测试；EVOLVE `app/toolcaller.go`、`app/transport/mcp/handler.go`和`schemas.go`。真实失败参数、回归、运行加载及自然16结果沿主验收记录2026-10-25章节与集成工作区input-diagnostic/tool-input-classification日志核验。


## 2026-10-25 授权调整与实时进度分离

**Why:** 已接纳评测会在用户阅读确认卡期间继续写入证据与用量；把这些观察值放进授权计划身份会产生无意义冲突。旧会话的短MCP凭证也不等于当前登录用户的授权有效期。API更新后，持久化工具目录可能仍向模型提供旧契约；React StrictMode的effect重放则可能把仍在显示的Store永久标成已销毁，让真实失败看起来一直等待。

**How to apply:** 局部额度调整服务端沿用原Grant，只允许明确字段单调增加，计划绑定原权限范围和请求；提交读取最新计数并以原根锁/CAS保护，不重置Run、用量、预留或已接纳回执。区分当前鉴权、原会话撤销与短token有效期，不绕过现有权限。发布MCP变更后经现有服务接入流程同步目录，并检查下一次真实model.request的schema；单独重启API不算生效。effect setup/cleanup须可重入，覆盖失败后可重试、回执成功后回读失败及响应丢失。

- 源码指针：EVOLVE `application/commands/optimization_authorization_update.go`、`infrastructure/postgres/optimization_authorization_renewal.go`，Studio `executor/AuthorizationUpdateCardStore.ts`与`AuthorizationUpdateCard.tsx`。首次自然失败、同步目录、红绿回归、真实PG及UI/数据库独立回读沿主验收记录2026-10-25 05:58及后续章节查证；具体授权值、实时分数和PR状态不在本页复制。


## 2026-10-25：部分证据恢复与权限依赖超时

**Why:** 远端执行证据已经收回，不代表 Judge 的 Sandbox 网络可用；一次执行中的缺失样本，也不能由对其它样本重新评分补齐。EVOLVE 权限解析复用业务详情读取，账号查询、功能装饰和资源计数等任一依赖超时均可能表现为502，不应将其解释成登录失效或权限被撤销。

**How to apply:** 先按原Run及Attempt确认终态和已归档证据，对有完整证据的明确子集通过正式重评入口恢复，保留原失败、范围及幂等回执；缺证据项须真实补跑。重新执行前核验既有File Server回环、同源码API/唯一Worker和无重复在途任务。依赖超时只用既有有界配置诊断并记录恢复值，不能靠延长超时宣称性能问题已修复或放宽权限；健康接口不能替代真实判卷结果。

- 源码指针：EVOLVE `internal/app/integration/maxwellauth/resolver.go`，Agent Server `internal/modules/identity/business/transport/http/controller.go` 与 `internal/app/api/http/studio_api.go`，重评契约及证据完整性沿现有Run入口追踪。
- 实际恢复结果、范围与临时配置恢复项见同一验收记录 `flexibility-acceptance-20261022.md` 的2026-10-25 22:12条目；此处不固化易变运行状态、分数或连接配置。


## 2026-10-25：重评子记录的发现和比较必须沿同一来源

**Why:** 正式重评分可能归属独立 Work。页面通过来源查到它，不代表绑定原任务的 Agent 目录也能发现；只放宽目录而未补详情、统计及比较，会形成下一处断点。评分副本的 `evidence_only` 描述判卷方式，不能代替原执行器的执行模式，否则同题同标准的交集会被误判不可比。

**How to apply:** 只读发现、详情、统计、逐题、失败聚类和比较沿不可变 `sourceRunRef` 有界解析，逐层验证业务、输入权限和来源一致性；过滤在分页之前，保留实际 Work 及评分身份，写操作仍验证实际归属。交集保留所选评分记录的题目、标准和分数，仅从原执行读取执行条件和生效回执；缺失、无权限或漂移仍阻断。必须同时测试完整集合与部分交集，不能把重评当新执行或把四题通过推广到五题。

- 源码：`application/queries/work_measurements.go`、`queries/run_intersection.go`、`comparison/execution_source.go`、`infrastructure/postgres/catalog.go`及相邻回归；实际自然会话、SQL性能与发布状态沿主验收记录本日22:20之后条目核验。


## 2026-10-26：独立 CLI 与服务执行的证据采集接线

**Why:** 服务执行器传入了持久化轨迹回调，不代表独立 A2A CLI 也传入。SSE 里存在各阶段终态仍不足以证明工具正文完整；工具结果可能只是引用回执，目标资源被清理后无法补回正文。

**How to apply:** 沿 CLI→Runner→轨迹采集→原件归档→清理逐段核对实际接线。在清理前按原 Thread/Run 分页读取持久化事件，精确解析缺失 resultRef 所有者；保留原事件身份，正文流入归档，热 JSON 仅留索引。采集失败时保留资源及原始失败，不能补造正文或把重评算独立执行。用未修改的原 Judge 做多阶段、缺正文引用与归档契约验证，再通过真实执行证明修复。安装包装器时从既有安装回执确认包装器业务，不能假定与被测业务相同。

- 源码指针：nextplay-eval `maxwell-runtime/src/nextplay_runtime/cli.py`、`trajectory.py`、`event_archive.py`与`runner.py`；消费者 `eval-runner/src/nextplay_eval/evaluation/archived_maxwell_events.py`。
- 当前版本、测试、隔离安装摘要与实际分数沿 Maxwell 主验收记录 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的2026-10-26章节核验；合成契约测试不等于真实候选或双轮十题通过。


## 2026-10-26：证据修复成功不等于目标执行成功

**Why:** 同一评测可能同时有证据齐全且评分通过的样本，以及上游模型拒绝造成的执行失败。把原生失败统一压成 `TASK_STATE_FAILED` 会隐藏恢复语义，使人误判为 Adapter 丢证据并重复派发。

**How to apply:** 先按归档原 Thread/Run 核对失败事件，再区分采集故障、模型拒绝与质量不达标。现有错误摘要仅传递有界、校验过的协议错误码与恢复标识，不直接转发可能含凭据或请求正文的供应商细节；原事件继续归档。模型安全拒绝应保留终态和用量，不以自动重试、换模型或改原题绕过；部分通过不能算全量验收完成。

- 诊断源码指针：nextplay-eval `maxwell-runtime/src/nextplay_runtime/runner.py`、`evidence.py`及`tests/test_baseline.py`；真实失败、评分与实际安装版本以 Maxwell 主验收记录2026-10-26 03:00之后条目为准。


## 2026-10-26：指标有效样本与整轮完整性分开展示

**Why:** 某指标的有效样本可以是4/4，而整轮五题中另有一题执行异常。只显示指标覆盖或判卷通过率会掩盖未进入评分的样本；直接把异常计零分又会改变原评分口径。

**How to apply:** 保留后端发布的分数和指标分母，在同一趋势点与候选详情中明确整轮次数、异常、取消、判不出和待处理数量。历史统计与新结果投影都要覆盖；用真实部分失败Run验证页面，并确认异常没有变成零分或完整验收通过。后台页恢复后的首次旧状态应等待正常轮询核对，不能直接判为永久不刷新。

- 源码：Studio `products/evolve/panels/runRates.ts`、`benchmarks/benchmarkResultTrend.ts`、`v3/lineage/evolutionModel.ts`与`LineageNodeDetail.tsx`。真实页面和检查证据沿主验收记录2026-10-26 03:40之后条目回查。


## 2026-10-26：共同样本数量不等于配对聚合值

**Why:** 比较结果中存在共同样本数量，并不代表左右均值已经仅按共同样本重算。有效样本不一致时，直接用各自均值声称“局部改善”仍会产生错误结论；只比较成功运行耗时还会出现幸存者偏差。接口拒绝正式采纳不代表 Agent 的自然解释不会误报提升。

**How to apply:** 同时读取指标各自有效范围、共同样本数和比较状态；若返回值仍是各自独立聚合，应明确说明，不能把 overlap 数量当作配对均值。可继续读取同 Case、同重复序号的真实逐题结果形成有限结论，不强迫重跑。提示词与 Skill 维护通用证据解释规则，接口保持原始数值、权限和门禁；用不含预期答案的新自然会话验证，而非只检查单测或提示词已保存。耗时和成本同样核对有效样本身份。

- 源码指针：Maxwell `application/queries/run_intersection.go`、`agent-resources/prompts/evolve-tuning-agent.md`及`agent-resources/skills/evidence-diagnosis/SKILL.md`；实际加载摘要、自然解释失败与修复后复验，沿主验收记录2026-10-26 04:02之后条目核验。


## 2026-10-26：成功耗时的比较覆盖与单位解释

**Why:** 两次运行的P95只覆盖各自成功样本时，即使成功数量相同，也不能由汇总确定是同一批题；错误地返回可比和差值会把幸存者偏差传给Agent。模型还可能把毫秒数量级当成秒，提示词保存成功也不证明自然解释正确。

**How to apply:** 跨运行耗时比较先核对实际计时来源和样本覆盖；没有身份信息的部分汇总保留原P95与单位，不自动计算提速差值，完整完成率及其它独立计量继续可比，不阻断正常运行。按返回unit转换ms/秒/分钟；用真实工具正文与未给预期值的新自然会话共同验证。基线选取、数值解释、真实效果是独立验收项：单位修复通过不代表已选对原版记录或证明候选提升。

- 源码指针：Maxwell `domain/runmetrics/compare.go`、`summary.go`、`application/queries/compare_runs.go`及Agent说明；实际生效摘要、保留失败和自然22证据沿主验收记录2026-10-26 04:50条目核验。


## 2026-10-26：任务绑定基线与本次历史对照分开

**Why:** 读取正式基线的接口正确返回任务绑定，不代表它满足用户本次描述的日期、版本或完整评分条件。把“正式关联为准”扩大成任何历史对照都只能使用该记录，会压制已有历史比较能力，甚至把有执行错误的旧记录称为完整原版。

**How to apply:** 保留正式绑定与权限，按本次需求核对目录、实际评分覆盖及配置/应用证据；没有候选标识也不足以证明是原配置。已授权历史记录可用既有只读比较入口，不因选择历史而自动重绑、重跑或修改结果；确有多个无法区分的记录时用日期与版本澄清，不让用户辨认内部ID。SP与隔离Skill同时核对实际加载版本，用原问题的新自然会话验证选择和结论，不能仅凭说明保存宣称通过。

- 指针：Maxwell `application/queries/tuning_baseline.go`、`work_measurements.go`、`app/run_catalog.go`及Agent说明；当前绑定、真实目录、自然23与发布状态沿主验收记录2026-10-26 05:07之后条目核验。

## 2026-10-26：运行身份应在目录中直接表达

**Why:** 可访问目录里同时有普通评测、候选执行及重评；存在分数或终态不能证明它是原版。只在长说明里提醒来源核对，仍可能出现把候选的重评、或候选执行本身误作原版的真实回答。

**How to apply:** 在已有授权后的轻量目录投影中由现存候选与来源字段明确记录类型，重评优先保留来源链；不能为了分类额外读取每条完整报告。普通评测不是原版证明，仍须结合用户选择、实际配置及评分覆盖。元数据改善与 Agent 最终选择/解释分别验收，保存失败对话，不能以新字段已出现或单元测试通过替代自然场景。

- 指针：Maxwell `internal/app/run_catalog.go`、`run_catalog_test.go`、MCP `runSchema` 和 `evidence-diagnosis`；真实目录消费、日期澄清与未完成项沿主验收记录2026-10-26 05:20之后条目及 natural24 证据核验。


## 2026-10-26：配对数量不能代替配对重算

**Why:** 共同题目不等于共同有效测量；两边分别忽略失败后得到的均值可能来自不同题目。只提供重合数及警告，仍容易使 Agent 或页面把独立汇总误读成局部提升。逐样本重复计算指标身份还会使大批次只读比较产生大量临时分配。

**How to apply:** 在现有授权、冻结定义校验后的只读投影内，按同一题目和重复序号选择双方有效值，复用既有有界归约器；保留原始汇总与错误数量，新增配对值只解释明确子集，不放宽正式采纳条件。复用已验证的每题绑定身份，避免每次重复执行重新序列化和哈希；在最大既有 Run 规模测量新增 CPU 与分配，不把纯计算性能称作外部鉴权性能。

- 源码指针：Maxwell `services/evolve-server/internal/modules/evolve/application/queries/run_intersection.go` 与相邻测试、`apps/studio/src/products/evolve/benchmarks/RunIntersectionPanel.tsx`；兼容字段以 OpenAPI 和生成客户端为准。
- 真实评分独立核算、页面与自然解释是否复验、当前部署及完整验收状态，沿本轮 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的2026-10-26章节查证；本地评分投影通过不代表新执行或完整产品链路通过。


## 2026-10-26：配对投影必须同步系统提示词与真实视图

**Why:** 后端增加共同有效子集投影、Skill补充字段含义后，旧系统提示词若仍笼统要求“不可比就不能描述变化”，模型可能忽略有效的局部证据；反过来仅凭失败总数减少，也可能把Fail→Error误说成失败已消除。字段、保存回执和单元测试都不足以证明最终解释正确。长版本标识还可能在对话分栏中把比较表撑宽，让用户只能看到一侧数值。

**How to apply:** 同时检查SP、Skill与实际工具返回的结论范围，明确正式整轮决策与同一有效子集观察相互关联但不能替代。保留错误题并核对逐题转移；更新后使用全新自然会话，记录是否明确给出日期或版本，不用指定历史成功覆盖无日期选择失败。页面用真实长标识核对分栏及展开两种宽度；表头视觉省略仍保留完整可访问文本，不改变比较数据或权限。

- 指针：Maxwell `agent-resources/prompts/evolve-tuning-agent.md`、`skills/evidence-diagnosis/SKILL.md`、`RunIntersectionPanel.tsx`与`RunComparisonWorkspace.css`；当前实际加载、自然25/26、页面宽度、失败记录及尚缺验收沿主记录2026-10-26 06:20之后条目核查。
