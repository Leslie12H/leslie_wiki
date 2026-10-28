---
name: evolve-runtime-payload-and-terminal-recovery
type: pitfall
created: 2026-10-23
updated: 2026-10-28
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


## 2026-10-26：比较读取失败需要保留可操作原因

**Why:** 只读比较同时读取列表、逐题证据与汇总；如果所有错误都变成“请重试”，登录失效、权限撤销和限流会被误认为同一种网络故障。Store 即使保存了错误，页面只展示失败数量也会再次丢失恢复信息。

**How to apply:** 复用只读错误映射，按响应状态显示安全的登录、权限、限流提示，其他故障使用通用文案，不显示原始后端正文。矩阵只汇总本页失败原因并去重，详情与汇总保留显式重试；失败数据不能补零或进入可比结论。技术回归覆盖恢复与迟到响应，真实正常页面单独核对；提示修复不代表底层鉴权延迟已消除。

- 指针：Maxwell `apps/studio/src/products/evolve/RunComparisonStore.ts`、`benchmarks/BenchmarkMetricsOverview.tsx`、`RunComparisonWorkspace.tsx`、`v3/matrix/MetricVersionMatrix.tsx` 及相邻恢复测试；当前验证与发布边界沿主验收记录2026-10-26后续条目查证。


## 2026-10-26：明确引用和自动选择应分别验收

**Why:** 普通评测、候选执行和重评使用相同目录标签时，用户和Agent都容易把不同来源混淆；只有分钟的时间也难以识别邻近记录。明确选择来源后分析成功，不能证明Agent能在模糊历史描述中自动找到正确原版。

**How to apply:** 来源选择器复用已有来源字段区分记录类型，并保留精确时间和固定修订号；不能额外逐行加载报告来完成分类。对自然引用场景分别核对UI选择、消息公开引用、复制件来源/版本及实际工具读取，再判断最终解释；只读分析不替代执行、评分或采纳，analysis_only也不表示原Run评分失效。保留自动选择失败原记录，分开报告两条路径。

- 指针：Maxwell `apps/studio/src/products/evolve/sources/CatalogSourcePickerStore.ts`、`RuntimeSourcePicker.tsx`、`sourceMessageProjection.ts`及 `application/commands/source_catalog.go`；实际自然引用、原始回合和尚缺验收沿主记录2026-10-26 07:12及 natural27 证据核验。


## 2026-10-26：失败诊断展示必须绑定原尝试

**Why:** 包装器完成不代表内部被测执行完成；内部模型拒绝可能已随失败证据保存，但页面只读粗粒度错误类别时仍显示通用失败。直接显示提供方原文又可能暴露凭据或请求内容，拿最新尝试的诊断解释历史记录也会误归因。

**How to apply:** 沿作用域匹配的原生事件、Runner结果、失败Attempt、冻结Assessment及页面投影逐层核对。已知诊断可以映射为固定安全文案；只接受有界、完整、状态一致的原记录，未知或截断内容保留通用说明。模型拒绝保持执行错误与无有效分数，不用重复执行来证明提示修复。旧包装器没有保留精确原因时不追写历史，也不能把合成诊断测试当真实评分闭环。

- 指针：SDK `maxwell-runtime/src/nextplay_runtime/runner.py` 与 `tests/test_baseline.py`；Maxwell `application/evaluation/live.go`、`live_failed_evidence_test.go`、Studio `v3/matrix/trialReading.ts` 与 `TrialDetailPanel.tsx`。实际SDK安装版本、技术与浏览器验证、未解决事项沿主验收记录2026-10-26“模型拒绝的安全展示与失败绑定回归”核验。


## 2026-10-26连接取得时间不等于连接池排队

**Why:** database/sql 取连接还可能包含冷建连和驱动的复用健康检查；池等待计数为零、没有慢SQL，并不能证明数据库依赖无网络耗时。pgx QueryTracer 不覆盖其底层 PgConn 健康探测，实际驱动版本应按工作区解析结果核对。

**How to apply:** 分别核对现存身份查询的共享池统计、建连、查询和完整HTTP时长；用独立有界只读探针区分冷/热取得、事务开始、查询及提交，并以同一后端PID确认复用。独立池测量不等于真实API性能验收，不移除健康检查、关闭TLS或加长超时掩盖原因。建连错误可能含敏感配置，只记录固定安全分类。

源码指针：Agent Server `internal/foundation/database/observability.go`、`internal/modules/identity/auth/infrastructure/store/sql.go`，及实际pgx版本的 `stdlib/sql.go` ResetSession。当前证据沿本页验收记录指针回查；代码通过与加载到服务分别核实。


## 2026-10-26 Full-detail authorization dependencies

**Why:** EVOLVE authorization uses the existing Business detail response, so post-authorization feature and asset-count decorations are still on its critical path. A slow dependency request is not necessarily a slow permission check.

**How to apply:** Correlate the exact HTTP request with connection and SQL fingerprints before changing authorization. Map count queries back to their owning modules, retain full-response and immediate permission semantics, and measure bounded dependency cost. A later fast EXPLAIN is not proof of past server latency or a production fix. Current runtime/load evidence: main acceptance journal, 2026-10-26 09:00 entry. Code pointers: Agent Server app/api/http/studio_api.go businessHTTPController; EVOLVE app/integration/maxwellauth/resolver.go.


## 2026-10-26 Bounded independent detail counts

**Why:** Independent count reads on an already authorized Business response accumulate network round trips when serialized. Parallelizing per row would instead multiply database load and can turn a latency fix into pool pressure.

**How to apply:** Coordinate the two existing batch reads in app/integration with exactly two operations per request, retain authorization and feature policy ordering, propagate cancellation, join both operations, and publish no partial counts after failure. Preserve the shared connection-pool limit and measure real requests separately from deterministic overlap tests. Revert temporary auth timeout overrides and verify the running process plus actual page reads before claiming the original timeout works; independent cold-connect failures remain separate.

Pointers: Agent Server app/integration/studio/businessstats/counts.go and its race tests; app/api/http/studio_api.go. Actual load, original timeout restoration and remaining acceptance boundaries: main journal 2026-10-26 09:30 entry.


## 2026-10-26 工具说明生效与自然选择分开验收

**Why:** API重载只更新远端定义，持久化MCP目录仍可能把旧说明发送给模型；同步后的模型仍可能选择错误历史基线。目录已同步、模型已消费新说明、用户要求的历史记录已选对，是三个独立事实。重复添加SP说明不能替代真实选择证据。

**How to apply:** 在已授权隔离目录通过现有连接、刷新、同步入口核对变更范围，然后独立检查实际model.request的工具说明和摘要。用未受日期、内部ID或预期答案提示的新会话复验；保留旧目录与新目录各自失败。选取问题继续沿任务绑定上下文、轻量目录信息和实际统计读取追踪；补充覆盖信息时复用有界授权投影，避免为每条目录读取完整Scorecard和历史JSON。具体状态只沿本页验收记录指针核查，不把本页视为修复完成或发布证明。


## 2026-10-26 历史目录需要真实评分覆盖

**Why:** 有评分报告或执行结束，不代表所有题都已得到有效判定；只向调优模型提供这些布尔状态，会使任务绑定基线遮蔽用户要求的完整历史记录。工具说明已生效仍选错时，应检查返回信息是否足够，而非继续堆叠提示词。

**How to apply:** 先授权分页及来源关系，再一次批量读取同业务、同可见范围的自动结果投影，只返回固定数量字段；待生成或过期的投影不返回零值冒充结果。不读逐行完整评分报告、指标正文或历史JSON。Trial数量不等于去重Case数量，completed也包含未知判定；真正比较仍需同Case和评分口径核对。用原自然问法、无内部ID/日期提示的新会话复验，同时检查实际模型请求、目录工具正文和最终选择；一次成功不等于模型普遍可靠。

源码指针：EVOLVE `application/queries/work_measurements.go`、`application/ports/result_coverage.go`、`infrastructure/postgres/result_coverage.go`、`app/run_catalog.go`。技术回归、真实SQL计划与自然会话的当前结论沿主验收记录2026-10-26 11:36条目核查；局部比较正确不等于完整候选或双轮十题通过。


## 2026-10-26 自然选择稳定性与说明层次

**Why:** 目录包含完整评分覆盖、模型已消费最新说明、一次历史选择正确，仍不足以证明稳定；后续自然复验可能重新偏向任务正式绑定。Skill要求可读耗时而系统提示词强调沿用单位，也可能使展示要求不一致，不能只看保存回执就认定行为改变。

**How to apply:** 分开验证输入不受内部提示污染、实际目录完整性、正式绑定详情、模型请求与最终选取；保留同一自然问法的成功与失败，不用成功样本覆盖失败。对展示要求先检查SP和Skill是否一致，再确认真实模型消费；可读单位换算正确不等于基线选对，基线选对也不等于整轮改善。避免靠盲目重试或固定工具顺序换取通过。

指针：`agent-resources/prompts/evolve-tuning-agent.md`及`skills/evidence-diagnosis/SKILL.md`；模型输入、工具返回大小/截断状态、自然31/32表现及未完成范围沿主验收记录2026-10-26 12:00条目核验。


## 2026-10-26 基线来源说明不能替代选取验证

**Why:** 任务基线解析可能来自固定关系，也可能来自既有评测输入的回退查找；它并非按当前用户条件做历史搜索。即使工具结果附上正确来源说明并被模型实际消费，模型仍可能沿用不满足用户完整评分要求的记录。单次覆盖提高也不能证明系统稳定性改善。

**How to apply:** 说明涵盖全部现有解析分支，保持旧字段、授权和分页，不为注释增加数据库读。独立核对model.request、实际比较Run及共同有效样本；无效选取保留失败，不把单位换算或参数合法当完整通过。后续围绕输入歧义、绑定显著性和观测值/因果结论区分诊断，不能用同输入盲试积累成功样本。

指针：EVOLVE app/toolcaller.go 的baseline结果、app/transport/mcp/schemas.go 的status帮助、modules/evolve/application/queries/tuning_baseline.go 的既有解析分支；当前证据与边界沿主验收记录2026-10-26 12:42条目核查。


## 2026-10-26 Skill 细则按需加载与自然场景分层

**Why:** 工具 schema 与 Skill 的参数描述可能分叉；API帮助修正不等于旧Skill同步一致。完整评分等业务条件明确后选对记录，也不能覆盖之前模糊问法的失败，更不能把同时修改Skill后的成功归因为上下文精简。

**How to apply:** 检查模型实际请求中的说明、Skill和工具结果，而非猜测截断。把低频技术细则原文移到入口可发现的参考资源，验证打包、保存回读和实际模型消费；保留核心权限、证据与未知边界。明确条件场景和原模糊场景分别记录，禁止把不同输入的成功算成原问题已修复。

指针：agent-resources/skills/evidence-diagnosis/SKILL.md及references/measurement-contracts.md；当前自然34输入、真实比较、用量和未完成事项沿主验收记录2026-10-26 13:10条目核查。


## 2026-10-26 失败诊断必须有原件读取能力

**Why:** 模型能看到失败类别和文件目录，不代表能读取归档中的失败事件；新版执行器错误说明不会改写旧封存回执。让Agent继续“更认真分析”或重评旧证据，都无法补上缺失的读取能力。重新评分也不等于重新执行。

**How to apply:** 从实际工具结果核对文件目录与正文是否都可达，再对照工具schema与Studio原件下载职责。复用精确Run/Trial/Case权限、冻结绑定和hash校验，设计有界正文与归档读取，避免把大文件/Base64和历史JSON整体灌入模型。保留旧终态和模型拒绝，不靠重复派发补演示；自然诊断未读到根因时应标为未完成，不能把猜测当结论。

指针：EVOLVE application/queries/evidence_files.go的OpenTrialEvidenceFile、app/transport/http/evidence_files.go和app/transport/mcp/schemas.go；Studio reviews/RescoreRunPanel.tsx区分重评与执行。能力缺口、自然35同会话追问与后续正文读取实现、真实消费，沿主验收记录2026-10-26 14:12及15:08条目核查；源码可用不代表发布或自然诊断通过。

## 2026-10-26 原件可读与根因证实分别验收

**Why:** 归档通常按多个执行阶段排列，首批目录和几个正文都可读，仍可能只覆盖较早成功阶段；从“留下产物但终态失败”直接推断状态机故障，会遗漏后续真实拒绝事件。读取能力通过技术测试不能保证Agent正确选择、续读及归因。

**How to apply:** 原件读取复用既有精确授权和冻结绑定，提供有界UTF8字节窗口、归档成员序号、分页和名称筛选；不解包落盘、不跟随链接、不把整个大文件塞入历史JSON。独立核对实际读取成员所属Run/阶段、续读覆盖和最终因果表述；未读取对应失败事件时保留未知，不把局部证据推测成根因。验证运行、只读比较、采纳是不同动作，允许一次正常拒绝后继续独立验证，不代表允许采纳或绕过拒绝。

指针：EVOLVE application/queries/evidence_text.go及evidence_files.go、app/transport/mcp/schemas.go。本次自然36读取范围、未成立的归因、双轮独立Run与不采纳边界，沿主验收记录2026-10-26 15:08条目核验。


## 2026-10-26 检索覆盖与历史结果投影分别核对

**Why:** 归档检索按过小的成员数量分页，会让不足一兆字节的多阶段证据也需要多次模型调用；工具能搜索不等于Agent已经覆盖失败阶段。另一方面，历史Run有原始评分但没有派生汇总job时，页面缺汇总不代表需要重新执行或重新评分。

**How to apply:** 检索以实际字节、命中输出和总体成员上限约束工作量，保留续读与跳过覆盖说明，避免按无关的小成员数强制分页。查询匹配后仍核对Run身份和上下文，不能把关键词命中等同因果证据。历史汇总先只读核对原Run/Trial与投影job；缺失时使用明确业务和Run范围、默认dry-run的维护入口，仅幂等补建派生job，由正常Worker生成汇总。独立对照原记录摘要不变、Worker完成和UI回读；禁止在GET中全扫历史大JSON，禁止直接改分制造比较结果。

指针：EVOLVE queries/evidence_text.go、cmd/evolve-standard-maintenance、infrastructure/postgres/result_maintenance.go。当前实现、原件技术检索与natural37未完成归因、旧基线投影恢复及真实分数，沿主验收记录2026-10-26 16:57及后续条目查证；不把这些技术修复当作候选提升或已发布证明。


## 2026-10-26 候选子集复用与 Worker 兼容

**Why:** 候选的选题预览可以通过，正式启动仍可能失败：内容寻址去重命中了另一 Work 的私有冻结子集，而“同一内容”没有自动建立当前 Work 的使用关系。只测首次生成和同 Work 重试会漏掉这种历史复用；API 能写入新选题快照，也不能证明旧 Worker 能读取。

**How to apply:** 从授权冻结原件投影子集后，复用既有 Artifact 兼容重放建立精确 Work 关联，保留来源、成员摘要及根预算；正式 Run 同时核对所选 CaseSet 身份、Work 关联和成员内容，不改物理来源或放宽业务隔离。回归覆盖已存在的跨 Work 投影、零重复 Put、错误摘要、未关联及范围外 Case，并在实际 PostgreSQL 上验证。API 与消费 Worker 应采用同一兼容版本，排队回执与四题实际派发分别核验；失败恢复沿原幂等键，不另建 Run。源码入口是 EVOLVE 的 `application/commands/case_selection.go`、`infrastructure/postgres/runs.go` 及相邻回归；实际版本、运行和评分结果查上方验收记录，不把本页视为发布或提升证明。

## 2026-10-26 流程历史关联与当前在途评测分开导航

**Why:** 灵活调优中，Search 保留的关联 Run 可以是历史执行；新候选通过普通评测入口启动后，不能继续用该历史引用表达当前评测。临时选题也可能没有 Benchmark 身份。

**How to apply:** 沿 Studio `optimization/OptimizationStatus.tsx` 核对当前 Work 在途 Run 与流程状态分开呈现，停止和恢复状态仍保留；沿 `v3/catalog/RecordsPage.tsx` 检查无 Benchmark 的选题只展示范围而不构造空详情链接。用真实在途页面与状态渲染回归分别验证；运行数、分数、发布状态回查上方验收记录及提交 `66794a17f`，不将导航修正当作执行或调优成功。


## 2026-10-26 共同题增益与执行用量分别核验

**Why:** 历史五题与候选四题的整集通过率不能直接相减；排除一个拒绝案例也不构成稳定性改善。执行原件含嵌套 usage 并不表示平台运行指标已采集，根 Run 累计账目与子 Run 相加还会重复计费。

**How to apply:** 沿已有共同题集查询核对相同内容、相同评分和两侧有效测量，只在共同样本上报告差值；另行保留单侧、拒绝和未评分项。与原始基线及上一候选分别比较，不把对较旧版本的提升称为最新一步的收益。用量转换沿原运行指标契约读取一份权威 turn 数组，明确账目身份及父子包含关系，冲突、未知和不完整保留标记，不能从没有回执推断零用量。跨语言合成回放、真实新 Run 消费和原冻结历史分开验收，不为展示完整追写旧分数或用量。

指针：EVOLVE queries/run_intersection.go、domain/runmetrics/metrics.go、SDK maxwell-runtime/src/nextplay_runtime/evidence.py 与 runtime_metrics.py。当前比较原件、CPU有界测试、源码和安装状态统一查主验收记录2026-10-26 20:22条目，不将本页视为发布或全量提升证明。


## 2026-10-26 多阶段账单与工具指标的采集完整性

**Why:** 续答阶段的 byRun 可能累积携带前序执行账单；直接求和会重复计费，把所有额外身份视作子 Run 又会把真实完整数据判为缺失。界面无成本/工具错误也可能只是包装器未输出事实，不能填零。

**How to apply:** 以已执行 turn 的原生 Run 身份建立根集合；只合并与明确根快照一致的重复记录，不混加父汇总和子账目。成本使用原始金额及币种，不估价。工具事件在原持久化轨迹流中按 Run/调用身份去重，完整遍历且调用均有终态才声明覆盖完整；缺失、冲突、容量超限保留未知。依次核对归档原件、协议消费、安装包哈希、新执行入库与页面展示，离线回放不冒充新 Run，旧结果不静默回填。

- 源码指针：nextplay-eval 的 `maxwell-runtime/src/nextplay_runtime/runtime_metrics.py`、`event_archive.py`、`evidence.py`；Maxwell 的 `apps/studio/src/products/evolve/formatMetric.ts` 与 `panels/metricSummary.ts`。版本、测试和新运行消费状态见本页原验收记录的2026-10-26成本/工具指标章节。

## 2026-10-26 历史验收副本必须保留证据依赖

**Why:** 只复制历史 Run、Trial、评分及 Artifact 元数据，会出现总分可读但逐题报原件引用不匹配；执行回执及其内容寻址对象、证据包仍是验证来源身份和正文完整性的必需依赖。这类导入缺项不能用放宽产品权限或证据校验来修复。

**How to apply:** 在明确的业务内容复制授权下，按精确 Run/Trial 读取原 Attempt；先验证隔离副本的原 Run/Trial 未改变，仅补缺失的原始记录。沿这些回执和冻结 EvidenceSet 复制引用的 CAS 与 Bundle manifest/chunk，逐项检查归属、摘要、大小及文件哈希，最后再封存 manifest。恢复后独立回读逐题和比较页，确认原分数未改、没有重评或新执行。汇总可读、逐题可读和自然 Agent 分析分别验收。当前精确范围、恢复脚本与哈希证据见主验收记录2026-10-26 21:37条目，不将隔离恢复误称线上数据修复或发布。


## 2026-10-26 审计脱敏不得破坏嵌套证据 JSON

**Why:** 工具正文可能是 JSON 字符串中再嵌套的 JSON。签名 URL 正则若把结束引号前的转义反斜线当成查询参数一起删除，审计副本就无法逐层解析；真实模型请求与审计副本走不同路径时，不能用审计损坏推断模型没有收到完整证据。

**How to apply:** 分别验证原 Provider 请求和脱敏审计，保证脱敏不改变发送内容；覆盖多层序列化、转义 ampersand 后的签名参数和相邻字段。保留字符串闭合需要的转义，仍删除全部敏感查询参数，不能简单在任意反斜线处停止匹配。不要修写旧审计或把技术回归称为自然诊断通过。

- 源码指针：Agent Server `internal/modules/model/infrastructure/openaicompat/gateway.go` 的 `auditChatRequest` / `redactSignedAssetURLQueries` 及相邻网关测试。实际运行加载版本、自然诊断消费和剩余问题查本页验收记录指针；本页不声明修复已发布。


## 2026-10-26 独立候选评测必须能从原调优任务发现

**Why:** 界面能查看候选验证记录，不代表绑定原 Work 的 Agent 工具能发现它。普通评测保留自己的 Work，若任务目录仅包含直属 Run 与重评后继，新验证已完成且指标完整，Agent 仍可能只看见旧轮并据此误报“未采集”。这属于证据发现范围缺口，不能继续堆提示词或重跑评测修复。

**How to apply:** 以持久化的 Candidate 归属、冻结 Variant 和验证关系建立只读测量目录，保持实际 Run/Work 身份；沿原资产权限与 visible/hidden 校验，列表分页前过滤，状态、统计、逐题与文件使用同一授权映射。查询由 Work/候选索引驱动，不能先拉全业务历史再筛选；回归包含独立执行、重评后继、不重复分页、撤权、不相关 Work 和原精确写入边界。用新自然会话验证自主选择最新运行、消费真实账目，并单独检查旧轮缺数据的比较边界。

- 源码指针：EVOLVE `application/queries/work_measurements.go`、`application/comparison/execution_source.go`、`infrastructure/postgres/catalog.go` 与其 memory 对等实现。原失败、修复加载、自然复验及查询性能见主验收记录2026-10-26 23:43之后条目；一次自然通过不表示普遍可靠或已发布。


## 2026-10-27 归档索引上限与封装升级后的恢复

**Why:** 事件正文写入流不代表索引也有界；结束后才检查索引大小，会在长轨迹下先累计过量内存。另一个独立边界是封装演进：为新结果增加可选统计字段后，若恢复程序按最新版重建旧原件，合法的旧哈希也会失配。

**How to apply:** 流式计入索引条目的实际 UTF-8 字节及封装开销，在现有上限处停止继续读取，保留原观察和执行租约。用原封存的可选字段形状重建旧封装，仍要求完整原件哈希精确一致；新封装删字段不能降级通过，晚采诊断继续保留原失败，不能回填旧账目。分别覆盖有界终止、旧封装恢复、内容篡改拒绝和新封装降级拒绝。

- 源码指针：nextplay-eval 的 `maxwell-runtime/src/nextplay_runtime/event_archive.py`、`recapture.py`、`evidence.py`、`evidence_bundle.py` 及相邻测试。测试失败到修复通过、四题已归档原件的字节等价回放与尚未安装的边界，见主验收记录2026-10-27章节；技术回放不算新的真实执行。


## 2026-10-27 派发前原件失败不能锁死准备状态

**Why:** 配置准备先把 Work 写为 pending，再保存不可变派发意图时，原件存储故障会留下无法恢复的 pending：远端尚未收到请求，同键重试却因缺意图被拒绝，新键又被 pending 阻挡。首次准备和替换已有 ready 配置都会受影响。

**How to apply:** 先保留精确的服务端不可变意图，再通过 Work 版本 CAS 获取唯一派发资格。存储失败不改变 Work；并发 CAS 失败留下的意图仅是元数据，不能触发派发。同键内容变化仍应冲突，远端确认不明确仍保持防重复边界。验证故障前后 Work 版本/内容不变、恢复后同键仅派发一次，并覆盖首次准备、已有 ready、并发和不可伪造意图；不要用直接改库解除状态。

- 源码指针：EVOLVE `application/commands/runner_selection_preparation.go` 与相邻测试；真实 PostgreSQL 合成准备测试在 `infrastructure/postgres/runner_selection_configuration_integration_test.go`。失败复现、race 回归、隔离 API 加载与业务验收边界见主验收记录2026-10-27章节，技术回归不等于重新完成业务调优。


## 2026-10-27 线上来源复制中的字符串化 JSON

**Why:** Runtime 工具结果可能是 JSON 字符串中的 JSON；仅遍历外层对象键，会漏掉内层的凭据字段、签名地址或 modelContext。一般文本正则也不能覆盖带引号与转义的结构化字段，审计脱敏正确不代表来源复制路径同样正确。

**How to apply:** 对完整、合法的内嵌 JSON 使用相同的字段规则、节点总量和深度预算递归处理；保留精确数字，未发生脱敏的字符串保持原字节，发生脱敏后仍保持原来的字符串封装层数与可解析性。复验多层编码、重复规范化和超限边界；用合成凭据复现，不能为了验证而导出实际凭据。旧不可变材料不静默重写，技术用例不证明历史泄漏已经发生或已清理。

- 源码指针：Maxwell EVOLVE `domain/knowledge/source_material.go` 与相邻测试，调用方为 `application/commands/source_material.go`、`source_catalog.go`。失败复现、race 回归、构建及隔离加载状态见主验收记录2026-10-27章节。


## 2026-10-27 跨业务权限目录分页不能把变化范围当完整快照

**Why:** 上游业务目录按 offset 分页；两页之间增删可访问业务时，后页的 total 可能变化，删除还可能使尚未读取的业务跨过 offset。仅以累计数大于等于最新 total 结束，会把混合范围及部分计数呈现成完整总览。重复 ID 检查只能覆盖一部分变化。

**How to apply:** 在同一次有界遍历中记录首个 total，拒绝后续 total 漂移或累计项数超过声明总量，沿原不可用响应让用户重新读取，不返回部分授权范围。不额外授予权限或无限重试。覆盖稳定多页、增删、重复项和上游失败；注意这只是可检测变化保护，不能声称无快照协议的多次请求具有原子一致性。

- 源码指针：EVOLVE `app/integration/maxwellauth/businesses.go` 及测试；Agent Server `identity/business/infrastructure/store/sql.go` 提供 offset 分页。红绿回归、隔离 PG 总览校验、构建和运行加载边界见主验收记录2026-10-27 02:12条目，不以合成故障代替实际权限变更验收。


## 2026-10-27 本地 Runtime 进程存活不代表依赖可消费

**Why:** Docker停止后，本地API和Worker仍可存活，healthz与进程检查也可能通过，但Temporal/Redis已断开。A2A可先建空Thread，再等待持久受理；调用方超时不证明服务端请求已终止。直接恢复依赖可能让已取消批次的脱离调用方重试迟到执行。

**How to apply:** 真实运行前同时核对API/唯一同源Worker、Temporal协议健康及任务队列实际poller、Redis和原文件/评分依赖。发生故障先停止当前批次后续调度，保留错误与用量；只读核对Thread/Run与Temporal持久受理，再处理残留请求，恢复原依赖后重新验证。不要删除空线程、改写错误或把容器启动当业务成功。是否可重发必须依据原请求的持久化结果，而非单独HTTP超时。

- 指针：Maxwell `runtime/infrastructure/temporalruntime/client.go` 的受理重试与进程生命周期；本次隔离环境中断、9空线程无Run、无新Temporal工作流、恢复后真实任务回执的分层证据见主验收记录2026-10-27 02:27章节。


## 2026-10-27 评分 API 排队回执不证明消费者存活

**Why:** 恢复数据库容器并不恢复因连接中断而退出的评分 Worker。评分 API 可以正常入队且持续返回 202；被测系统已完成、证据齐全，但队列任务始终没有 started_at/heartbeat，直到平台等待超时。这属于评分不可用，不能记成题目未通过或有效得分。

**How to apply:** 依赖恢复清单应逐个覆盖执行与评分消费者；同时核对唯一进程、队列认领时间、持续心跳、原评分终态和平台测量入库。恢复原消费者前排除已有活跃 owner，消费原队列而非重复创建任务。已经超时取消的评分不改写历史；后续通过正式重评入口使用同一执行证据补齐，并明确重评不是新的独立执行。保留原模型和标准，不以延长等待时间掩盖没有消费者。

- 指针：nextplay-eval 原评分 `eval-service/src/eval_service/grading_repository.py` 的队列/租约与 `grading_worker.py`；本轮隔离 launcher 和原 Worker MySQL 2013 退出日志、原队列无开始时间、恢复后实际得分见主验收记录2026-10-27 05:00后条目。隔离恢复操作不代表业务代码已发布。


## 2026-10-27 不可完整比较不等于评分标准变化

**Why:** 比较结果的通用否定状态可能来自缺测、执行超时、缺少应用回执，也可能来自评分定义不一致。若页面直接把该布尔值显示为“比较口径不一致”，会把同题同评分的执行失败错误解释为标准变化，掩盖真正需要恢复的环节。

**How to apply:** 通用标签仅说明“暂不能完整比较”，详细原因沿服务端覆盖和身份检查展示。共同有效题的均值与历史相同子集比较，不能把缺测补零或直接比较不同样本总体；重评保持原证据和来源，不算新的独立执行。验证覆盖页面、服务端具体原因以及真实运行记录，不能只检查文案快照。

- 指针：Maxwell `apps/studio/src/products/evolve/v3/lineage/LineageNodeDetail.tsx` 与 `candidates/comparisonWarnings.ts`；真实超时导致九项有效测量的共同样本分析、UI回读及聚焦回归见主验收记录2026-10-27 07:42条目。


## 2026-10-27 首阶段中断没有完成轮次但仍有执行证据

**Why:** 已受理的原生 Run 在首阶段中断时，可能尚无完整 Turn。若持久化轨迹采集只从完成 Turn 推导 Run 身份，会错误拒绝真实部分证据，保全失败并保留临时资源。仅测试 Runner 的流式归档、没有接入 CLI 生产采集回调，会漏掉这类组合缺陷。

**How to apply:** 用同一 Thread 的确认受理回执与原始观察补充内部采集身份，保持原失败和空完成轮次；不能编造完成状态或放松原事件身份、终态和分页校验。分别核对外层取消、内层原生 Run 终态、证据封存与资源清理，取消成功不代表资源已删除。测试须组合真实采集器与 Runner，在实际存储边界注入失败；原事件离线回放与新执行验收分别标记，旧结果不覆盖。

- 指针：nextplay-eval `maxwell-runtime/src/nextplay_runtime/{runner,models,trajectory}.py` 及 `tests/test_standalone.py` 的中断+持久化采集组合；真实取消回执、93条原事件回放、独立下载包验证见主验收记录2026-10-27 08:15条目。


## 2026-10-27 无续答对话的澄清也是可测量结果

**Why:** 固定消息脚本与 continuation.mode=none 的单轮对话都没有合法自动续答；若只有前者把真实 AskUser 封存供评分，后者却映射成采集失败，会使同样的澄清行为因输入结构不同而丢失评分机会。调优 Agent 可能转而提出禁用澄清工具来适应这一采集缺陷。

**How to apply:** 沿冻结续答策略判断是否允许回答，不编造后续用户信息。真实问题、目标 INPUT_REQUIRED 与未完成执行状态必须保留；采集完整且原执行已停止才允许进入原评分流程，不能把采集完成当作题目通过。没有真实问题、续答耗尽或取消未确认仍保留失败。覆盖生产 Runner 的固定脚本/无续答对话两条路径，以及原事件离线回放；离线回放不是新模型执行或新评分，旧结果不可回写。

- 指针：nextplay-eval `maxwell-runtime/src/nextplay_runtime/{runner,executor}.py`；Maxwell 主验收记录 2026-10-27 18:10 与 `.tmp/conversation-real-event-replay-20261027.json`。候选是否真的修改须比对资源哈希，名称/说明变化不能当作 Prompt 内容已更新。


## 2026-10-27 冻结来源编辑与待审稿续改不是同一个操作

**Why:** 资源编辑工具若以冻结 Variant 为完整输出模板，它返回的 profilePayload 不包含另一个待审稿的新资源。Agent 在待审稿哈希被拒绝后改从冻结来源重做单文件，再保存整个返回值，可能悄悄回退其它文件。单文件正文确实变了、工具成功或最终回答“其它未改”，都不足以证明方案完整性。

**How to apply:** 同时比较输入待审稿、冻结来源及新稿的每份资源引用与实际字节，特别核对未编辑路径、execution 声明和最终说明。哈希拒绝不可放宽；先区分已有契约是否包含待审稿续改，再设计显式版本来源与原授权锚点，契约新增按项目规则书面审批。不要隐式选择最新稿、静默合并或自动冻结来绕开人审，也不能用辅助合并成功覆盖独立自然场景失败。

- 指针：Maxwell `commands/resource_edit.go`、`resourcecontent/source_runner.go` 与 MCP schema；具体三方差异与自然失败见主验收记录2026-10-27 19:40及集成工作区 `.tmp/natural63-draft-content-review-20261027/`。拟议契约与批准/实施状态查 `output/evolve-unified-20261019/draft-resource-edit-contract-20261027.md`，不能把方案当已存在能力。

## 2026-10-27 流重连等待也必须属于订阅生命周期

**Why:** SSE握手失败后，网络请求可已清理，但延时重连仍在等待。只中止请求或比较Work ID不能识别隐藏后恢复、退出后重开同Work的旧等待；旧回调可能在后台重新连接或建立重复流。

**How to apply:** 在拆除订阅时使整个生命周期失效，延时完成后核对订阅代次、页面可见性及目标。技术回归覆盖隐藏、隐藏后立即恢复、同Work重新订阅，不能只模拟不同Work导航。该缺陷修复不能自动解释所有线上进度延迟；真实服务阶段变化和浏览器自动更新仍应独立验收。

- 指针：Studio `EvolveWorkspaceStore.ts` 与既有 `.test.mjs`；旧红/新绿和验证边界见主验收记录2026-10-27 19:40、`.tmp/work-events-retry-lifecycle-*`。

## 2026-10-27 显式草稿续改与磁盘故障恢复

**Why:** 多资源方案只接受冻结版本编辑时，Agent 回退旧来源会丢失另一份已修改文件；强制“只能最新草稿”又妨碍合理的历史分支。连续编译残留的可执行文件也可能挤满主机磁盘，使 Docker VM 停止而 API 进程仍存在。

**How to apply:** 草稿续改明确选择已保存版本，冻结来源继续提供权限与目标基线；历史/冻结稿只读派生，保留其它资源和兼容运行设置，精确核对有效字节，不隐式选最新或合并并发保存。技术验证须覆盖失败不留产物、冻结状态不变和连续编辑；自然验证另核对完整资源与答复。环境故障追到 Docker backend 日志和 `df`，仅删除已确认 Git 忽略、无进程打开的可重建产物，保留当前/回滚二进制、证据和数据；引擎恢复后逐项核对原容器、Temporal poller 与评分消费者。

- 代码指针：EVOLVE `application/commands/resource_edit.go`、`application/resourcecontent/source_draft.go`及 MCP schema；可选字段与当前语义沿源码核对。
- 本次方案批准、红绿/race、磁盘错误、清理 SHA 清单与后续自然验收，见原工作区 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 2026-10-27续改记录。技术通过不代表自主验收或质量提升。


## 2026-10-27 错误恢复建议与能力说明需要同源核对

**Why:** natural65 的工具正文要求改用实际 Run 的执行器，但普通错误经 MCP 映射成 ProviderPermanent，再由 Runtime 给出 choose_another_tool。Agent 将可修正选择解释为平台不可用。同时已实现显式草稿快照续改，策略 Skill 却仍描述从冻结原版重新合并；新 schema 到达模型不代表全部资料一致。不能仅从模型停止推断能力不可用，也不能把这两处矛盾直接认定为全部自然失败的根因。

**How to apply:** 对齐源头错误、MCP structured error、Runtime code/action 与实际 model.request，区别参数可修正、权限拒绝和真实服务故障；不要根据错误文案批量改分类。新增能力同时检查已启用 Skill 的旧限制，更新后独立回读全文和其它文件，实际消费及自然产物另行验证。错误语义变更按项目契约规则批准；禁止靠新提示、自动替换执行器或盲重试掩盖原失败。

指针：Maxwell `application/resourcecontent/source_runner.go`、MCP `handler.go`、Agent tools `execution/native/builtin_tools.go` 与 `runtime/toolprotocol/result.go`；策略 `agent-resources/skills/optimization-strategy/SKILL.md`。实际版本、回执及待批准范围见工作区 `output/evolve-unified-20261019/resource-executor-error-contract-20261027.md` 和主验收日志；本页不代表该修复已实现或已发布。


## 2026-10-28 执行器选择错误应与永久故障分开

**Why:** 已获资产授权、同业务且 active 的执行器未暴露所需 Runner 通道，是调用者可以修正的选择错误。仅在错误文字里建议更换参数，而结构化分类仍为永久供应方错误，会令 Runtime 给出错误恢复方向。修复此分类不证明 Agent 已能正确合并历史多资源稿；保存成功也不证明保留了用户要求的全部改动。

**How to apply:** 在权限和精确冻结资产校验之后，对该有限输入错误复用 `ErrInvalidInput`，通过 MCP `invalid_input` 到 Runtime `correct_arguments`；保持 `retryable=false`，不自动选执行器或重复调用。跨业务、停用、撤权、缺失对象及外部故障保持原边界。分别核验源头/传输/Runtime映射和真实只读请求，再独立核对自然保存的资源哈希与历史版本，而非只看最终答复。

源码指针：Maxwell `services/evolve-server/internal/modules/evolve/application/resourcecontent/source_runner.go`、MCP `resource_errors_test.go`、Runtime工具错误映射。批准与运行证据：工作区 `output/evolve-unified-20261019/resource-executor-error-contract-20261027.md`、验收日志2026-10-28条目及集成 `.tmp/natural66-executor-recovery-20261028/`。这些记录区分错误分类修复、正确执行器自然选择与尚未通过的自主合并，后续状态应读原记录。


## 2026-10-28 历史声明导航不能替代原文恢复

**Why:** 草稿说明可能声称保留历史修改，但资源哈希证明其它文件已回退。提供父版本哈希差异能暴露回退，却不意味着 Agent 已读取原文或完成修复。另一个实际误导是工具帮助仅提冻结 Variant：已有资源引用读取本来支持获授权的历史待审资源，模型可能因此反复读旧冻结内容。

**How to apply:** 历史导航只沿同 Work 已持久化父版本、限深度和时间，声明比较与正文、execution、实际应用明确分开；不能隐式合并或替模型选择版本。用真实只读请求验证既有资源引用能力及完整哈希，再同步工具目录和启用 Skill，独立重新打开全部文件核对保存。新自然会话另核验历史原文消费、保存资源实际字节与最终说法；辅助纠正后的局部改句不能覆盖原失败，也不能冒充恢复整份历史修改。

指针：Maxwell `internal/app/toolcaller_profile_history.go`、`queries/resource_read.go`、`resourcecontent/content.go`、MCP schemas 和 optimization-strategy Skill；真实六份原件读取及自然67/68证据见集成工作区 `.tmp/natural67-profile-history-20261028/`、`.tmp/natural68-resource-read-20261028/` 与主验收日志2026-10-28。技术读取、实际消费、自主恢复和业务质量各自保留结论；本页不预判仍在进行的自然验收结果。


## 2026-10-28 候选资源声明不等于已存原件

**Why:** 自然候选编辑曾在没有创建资源原件的情况下保存一个格式正确的资源引用；前端只按声明显示“完整原件已保存”，直到真实读取才发现记录不存在。草稿可编辑性与不可变原件真实性是两项不同证据；另存到会话附件也不代表候选已更新。

**How to apply:** 审核候选时核对具体资源身份、授权读取、完整字节与摘要，再比较 Prompt 和 Skill 是否都保留所需变更。UI 在读取前只陈述引用存在，成功和失败依实际回执表达；既有冻结校验继续验证引用，不为制造通过而补写缺失原件。结构整理也要逐字审视被删除的业务规则，不能以模型自述“仅整理”或 hash 改变代替语义验收。辅助纠正产生的可用稿不能覆盖独立自然场景的原失败。

当前实现指针：`apps/studio/src/business-components/evolve/{ResourceContentReader,VariantResourcesView}.tsx`、`services/evolve-server/internal/modules/evolve/application/commands/service.go` 的冻结资源引用检查，以及 `application/resourcecontent/content.go`。实际版本、自然表现和应用证据沿本页验收记录指针查证；本页不声明质量或发布通过。

## 2026-10-28 候选内部编辑与外部应用分开准入

**Why:** 已获授权且字节完整的 EVOLVE 本地 Prompt/Skill 编辑曾依赖执行器是否暴露 Runner 结果通道。任务历史执行器与实际 A2A 执行器不同时，这个无关前置会阻塞内部编辑，并诱使模型手写长正文和摘要；资源哈希错误又导致保存失败。候选内部原件编辑和向真实 Adapter 应用并不是同一动作。

**How to apply:** 先识别冻结来源协议。对获授权的本地 Runner 原件，只按原 Work/visible、冻结身份、内容摘要、可编辑种类及替换冲突检查派生文件；外部 resource-control 来源仍需执行器和库存核验。保存候选仍是显式步骤，实际应用继续经过原 A2A/Adapter 准入。参数可选性变更须按项目规则批准，覆盖旧调用兼容、无执行器查询、权限拒绝、篡改、其它资源保留和失败不落产物。新会话分别核验模型实际消费、保存字节、业务语义和最终表达，不把内部编辑成功当作应用或质量通过。

指针：Maxwell `application/resourcecontent/source.go`、`source_runner.go`、`commands/resource_edit.go` 与 MCP `schemas.go`；批准清单在 `output/evolve-unified-20261019/internal-candidate-edit-contract-20261028.md`，红绿、race、原工具目录同步及独立自然73的逐字节结果见主验收日志和集成 `.tmp/natural73-internal-edit-20261028/`。C9 在途验证另追实际应用回执；本页不预判终态评分或发布。


## 2026-10-28 显式草稿续改不应重复要求冻结身份

**Why:** 本地草稿已经保存全部授权原件和精确资源哈希，继续修改仍要求另一个冻结 Variant 身份，会制造没有实际读取需求的依赖。自然验收出现模型正确读到最新稿，却捏造冻结身份、转为手写长正文及错误摘要的失败；目录或提示已消费也不能证明任务完成。

**How to apply:** 仅对显式版本、同 Work 中已存在的本地资源路径提供草稿续改；所有保留引用仍核对可见权限、原件类型、哈希和大小，选中原文字节另作完整性检查。外部、未覆盖路径、内联或包覆盖保持原契约；显式错误来源不得失败后回退放行。返回不声明不存在的冻结来源，不自动保存、确认或授予 A2A 应用许可。验证分开核对 schema/Skill 实际消费、落库 payload、另一资源保留、最终说明以及 Adapter 应用；不以一次保存成功声称质量改善。

指针：Maxwell `application/resourcecontent/source_draft.go`、`commands/resource_edit.go`、MCP schemas 与相邻测试（均在 services/evolve-server 内）；批准方案 `output/evolve-unified-20261019/draft-resource-edit-contract-20261028.md`。自然74原失败、自然75独立保存与 C9 实际应用证据沿主验收日志及集成工作区对应证据目录核查。
