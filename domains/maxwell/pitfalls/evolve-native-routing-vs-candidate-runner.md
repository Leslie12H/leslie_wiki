---
name: evolve-native-routing-vs-candidate-runner
type: pitfall
created: 2026-10-15
updated: 2026-10-17
tags: [maxwell, evolve, nextplay, a2a, candidate]
links: [nextplay-independent-benchmark-entry, evolve-preset-evaluation-entry]
---

# 内部执行分流与既有候选 Runner 的能力边界

**Why:** 新的内部执行入口不支持候选，不能据此断言整个系统没有替换复测能力，也不能否定之前的 A2A 验证。A2A 传输、外层 Candidate Runner 和 Agent Runtime 是不同层次；禁止修改 Runtime 内核，与禁止通过既有管理 API 创建临时资源，也不是同一个约束。

**How to apply:**

- 先查 Nextplay Eval 的 `nextplay-a2a/README.md`「恢复与验证范围」：它保留了此前 A2A 隔离运行及 SP 替换已验证的历史记录，并单独记录原 Benchmark 单题的 Judge 限流边界。该记录不能扩展为当前部署或全部 65 题已完成验收。
- 查同仓库 `nextplay-a2a/skills/maxwell-candidate-runner/scripts/run.py`、`maxwell-runtime/src/nextplay_runtime/runner.py` 与 `materializer/service.py`：确认旧 Adapter 实际如何替换、创建临时 Prompt/Skill/Preset、执行、回收证据并清理，而不是把发送 Variant 当作应用成功。
- 查 [Maxwell PR 355](https://github.com/world-sim-dev/maxwell-ai/pull/355) 的 `services/evolve-server/internal/app/integration/a2a/registry.go`、`maxwellexecutor/adapter.go` 与验证记录：核对识别结构化 Case 后是否提前进入内部执行分支，以及该分支如何处理候选/旧 Runner 快照。不能因为普通 A2A 分支仍在，就声称新路径已继承其候选能力。
- 调整路由前，应保持基线与候选的初始化、资源版本、执行语义、证据及评分条件一致。仅将候选改走另一条路径，不足以证明结果可比。优先衔接既有 Adapter；2026-10-15 用户已明确允许 Adapter 管理临时 Preset，仍禁止改动 Agent Server Runtime。

## 2026-10-15 两条入口与本地交接

用户确认普通批量评测直接调用内部 Nextplay Agent；需要替换 SP / Skill 的调优，基线与候选均走已登记的 A2A Candidate Runner。来源评测可用于诊断，更换执行条件后须重建配对基线。

实现及验证入口：Maxwell 工作树 `/private/tmp/evolve-internal-agent-20261014/docs/verification/2026-10-15-candidate-runner-handoff.md`；跨语言测试 `services/evolve-server/internal/app/integration/a2a/candidate_handoff_test.go`；Nextplay `maxwell-runtime/src/nextplay_runtime/request.py` 与 `tests/test_frozen_request.py`。检查请求冻结原文、完整 SP / Skill、实际绑定和先采集后清理；SDK / 模型替身不是真实评分证明。

自动衔接的具体接口清单在 `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-runner-handoff-contract-review-20261015.md`。确认状态与当前代码需回到任务 / PR 核验，不能把分工确认或交接测试通过当作自动准备、65 题真实取分、大原件和取消清理全部完成。未部署。

## 衔接后的恢复与资产归属检查

**Why:** 新调优 Work 关联了来源 CaseSet，不等于运行仓储已经允许读取其中仍归属原 Work 的 Case；同样，已派发的远端任务可能在调用方断线后丢失本地编号。只验证 JSON 形状或内存仓储，会漏掉真正的恢复和事务边界。

**How to apply:** 顺着 Maxwell `commands/runner_preparation.go`、`runner_tuning_run.go`、PostgreSQL `works.go` / `runs.go` 及 `runner_handoff_integration_test.go` 核对：精确来源集合授权、实际准备回执、已知远端编号的有界持久化、未知接收不重发、首次基线的事务限制。协议到执行用跨语言测试，数据库 CAS 与资产归属用隔离 PostgreSQL；两者均不能代替真实 Agent / Judge 验收。

2026-10-15 已获仅本地实施授权。实现清单、逐项测试与未验收的大原件 / 取消 / 65 题真实评分边界，统一查上方 `2026-10-15-candidate-runner-handoff.md` 验证记录；PR、提交和部署状态需另行核验。


## 2026-10-16 三条连接与长期待验证的排查指针

**Why:** 接入列表的每行是执行连接，同一业务对象在迁移中可能保留内部 Agent、HTTP 批次和 A2A Runner 多条登记。连接检查、声明能力与真实运行证据不是同一状态；将声明未知写成“执行能力待验证”，会让用户误以为存在后台验收任务，或误以为历史执行没有发生。

**How to apply:** 沿 `executorRegistration.ts` 的展示条件、`domain/executor/capability_level.go` 的级别推导、`commands/executors.go` 的预检持久化查清字段来源，再对照具体 Run。不能从声明级别推断评分成功，也不能仅为压缩列表删除历史执行器。对象与连接的归属应显式管理，不能按业务名称硬编码归并。

准确登记身份、dev 页面只读证据、源码版本和建议见[三条连接状态诊断](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-executor-status-diagnosis-20261016.md)。这是 2026-10-16 的诊断记录；继续操作前刷新实际登记与引用，不以本页推断当前部署或运行状态。


## 2026-10-16 单一执行器的本地实现指针

**Why:** 同一个被测 Agent 可以有普通评测与候选验证两条技术路径。只隐藏 Runner 的列表行，会让旧候选选择器丢失执行身份；只改连接标签，也不能说明实际执行与评分状态。合并展示不能修改历史 Run 或在重试时重新选择路径。

**How to apply:** 以显式同业务归属聚合连接；新调优任务冻结实际 Runner 与内层目标；重复创建沿用已保存路线；旧候选和历史查询保留物理执行器标识。关联变更属于展示与未来路由元数据，不应影响已开始任务的执行配置；比较含指针的配置结构时按值比较，避免从数据库重新读取后误判变化。

代码、具体契约和本地验证记录查 `/Users/leslie/.codex/worktrees/evolve-logical-executor/maxwell-ai/docs/verification/2026-10-16-logical-executor.md`。检查 `domain/executor/routing.go`、`commands/logical_executor.go`、PostgreSQL `executor_routing_integration_test.go` 与 Studio `executor/executorRouting.ts`。本轮仅本地，页面测试数据、隔离 PostgreSQL 和技术回归不能替代 dev 关联生效、真实 Case 执行或评分验收；PR 与发布状态须另行核对。

## 2026-10-16 统一执行器提交复查

**Why:** 关系校验只检查“有上级引用的子连接”会漏掉主体的角色修改；内存实现通过不能证明 PostgreSQL 事务路径一致。临时数据库使用 SQL_ASCII 时，Unicode 长度约束还会按字节计数，造成与 UTF-8 环境不同的测试结果。

**How to apply:** 关联和主体修改均在同一业务事务锁内检查；持久化测试同时覆盖重复绑定、主体角色变化、解除关系后的历史查询。启用隔离 PostgreSQL 集成测试前先核对 server_encoding，使用 UTF-8 数据库，不为环境编码问题放宽业务约束。

统一执行器代码与原预算、预检、取消修复统一查看 [Maxwell PR #358](https://github.com/world-sim-dev/maxwell-ai/pull/358) 及其中 `docs/verification/2026-10-16-logical-executor.md`。PR 当前状态、CI 和部署状态以远端为准；本次授权为提交到既有 PR，不含合并或部署。


## 2026-10-16 合并发布与真实原题复验入口

**Why:** main 已合并和预检通过，仍不能证明真实长任务结束、评分服务收到完整原件或页面结果可持久化；登记预算也可能保留旧值，不随代码默认值自动变化。0–1 原值、子项分数与 Boolean 通过比例应分别解释，不能从汇总页的整数格式推断丢失精度。

**How to apply:** 发布前锁定 main SHA 和组件范围；回读现有连接实际预算，再顺着执行 Thread、终态原件、原 Provider 方法/版本与原始数值核验。普通评测成功不能扩大为候选配置已验证、全部题库已通过或调优闭环通过。合并发布、原单题、原十题及限制统一查 [PR #358 发布复验记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/release-retest-pr358-20261016.md)；当前数量和状态以该记录及关联真实 Run 为准。

原件浏览器下载使用 Chromium `showSaveFilePicker` 时，须将页面聚焦并完成系统保存对话框；不要只等待传统 download 事件就将 0 B 归因为网络或存储故障。落盘后核对字节数、哈希及格式解析；小原件成功不代替超大文件验证。相关实现入口：Studio `products/evolve/evidence/evidenceDownload.ts` 与 `EvidenceDownloadStore.ts`。

## 2026-10-17 资产阶段约束与自动续答诊断

**Why:** 历史对话、当前请求和未来续答剧本属于不同输入。目标正常结束、等待用户、等待异步工具也不是同一状态。原题要求真实媒体，而所选 Preset 的实际系统指令限制在文字和图片 Prompt 阶段时，自动多发“继续”既不能证明原链路一致，也可能改变测试授权与业务范围。不能仅凭输出把配置限制归因为模型漏执行。

**How to apply:** 对照真实首轮 MODEL.REQUEST 的系统指令与 Case 当前请求；沿 Nextplay `maxwell-runtime/src/nextplay_runtime/executor.py` 的 `_initial_input_with_context` / `_execute_conversation` 和 EVOLVE `maxwellexecutor/turns.go` / `reply.go` 分清恢复历史、原生 Ask User 回答和正常完成后的固定 turns。当前两种编排二选一；不得从“支持自动续答”推断支持固定阶段与动态澄清混排。续答只使用用户侧材料，保持回执与幂等身份，不把评分标准或期望工具路径交给被测 Agent。

实际 Thread / Run / Preset、阶段限制原文、原 Case 的 8 次续答上限、源码版本和未验证边界见 [资产题与续答诊断](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/assets-continuation-diagnosis-20261017.md)。这是 2026-10-17 的只读诊断；原始评分、当前目标配置和其他样本归因须逐项回读，不以本页推断后续配置状态。

同日用户进一步明确：检查目标应为“Case 要求的流程是否走完”，不限于 Ask User 是否得到回答。逐题对照原请求、续答约束、实际输出、正式项目快照与评分原因，见 [十题流程完成度核验](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/ten-case-workflow-completion-20261017.md)。重点区分媒体停在 Prompt、文字文件未写入项目、跨对象确认未触发；不把预设回复指导当作固定待发送消息，也不因 Thread 正常完成就断言业务完成。


## 2026-10-17 A2A 与原续答实现的职责复核

**Why:** A2A 传输不等于外层 Agent 已具备目标完成检查。Nextplay CandidateRunner 继承 MaxwellExecutor；现有 continuation 在正常完成时结束，仅在原生 Ask User 时调用受约束的模拟用户。不能声称旧 A2A Runner 本来就保证走完每个业务阶段。

**How to apply:** 查 Nextplay `maxwell-runtime/src/nextplay_runtime/runner.py` 的继承关系、`executor.py` 的 TASK_STATE_COMPLETED 分支、`reply.py` 的输入构造，以及 Candidate Runner SKILL.md 的“多轮及有界续答由 Python 统一完成”。区分初始历史与实际新增对话、问题回答与目标驱动跟进、内层一轮结束与外层 Case 会话终态；采集与清理不得抢在全部续行之前。

源码证据、上下文视图、平台/Adapter/Runtime 职责及待确认的方案见 [Case 目标续行方案](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-case-goal-continuation-plan-20261017.md)。此段记载的是当时的设计建议；同日获准开始后的本地实施见下节，线上路由与部署仍须单独核验。


## 2026-10-17 有限目标续行的本地实施与回执边界

**Why:** 正常回复可能停在 Prompt 或草稿；追加消息的决策也可能在取消、超时或丢失派发回执时尚未实际送达。把“决定继续”算作已跟进，或在回执未知时清理临时目标，会失真且破坏恢复条件。

**How to apply:** 将公开目标策略随 Case 冻结，默认关闭；提问回答与主动跟进分别计数，后者在同一 Thread 发新 message。决策、实际上下文、文件哈希和派发状态先保存，只有 accepted 计入已发送次数；unknown 保留资源待核对。公开交付检查与原 Judge 质量评分分开，文件存在或哈希变化不证明媒体有效。旧 Runner 必须拒绝不支持的能力，不能静默跳过新策略。普通内部路径和 A2A Runner 保持相同冻结语义，不改 Runtime、不把评测资产塞入 Thread 元数据。

本地代码、契约、技术回归与桌面截图查 `/Users/leslie/.codex/worktrees/evolve-executor-preflight/maxwell-ai/docs/verification/2026-10-17-case-goal-continuation.md`；Nextplay 配套工作树为 `/Users/leslie/.codex/worktrees/nextplay-case-continuation/nextplay-eval`。这是本地实施指针，未发布或重跑真实媒体题；PR、部署、65 题交付与真实评分必须另行核验。


## 2026-10-17 目标续行审查的故障窗口

**Why:** 回执未知保护不能只覆盖外层 CandidateRunner；直接 Dataset 执行入口也会走共享执行器。新 Run 已接收但首条 SSE 尚未到达时，使用旧 Run 身份确认停止会错误释放仍在使用的资源。取消成功也不代表推进记录已被归档。

**How to apply:** 从每个调用入口检查 action 接收、会话当前 Run、证据提交和 lease 清理的同一状态链；覆盖 accepted 后写入失败及 unknown 派发两种窗口。对照 Provider schema、编辑保存和执行解析的联合约束；紧凑输出只携带摘要与引用。目标检查需读取关键交付字段，不能把文件前缀或哈希当成完整媒体/写回证明。

本轮完整范围、实际复现、分级与待验收入口见 `/Users/leslie/.codex/worktrees/evolve-executor-preflight/maxwell-ai/output/reviews/2026-10-17-case-goal-continuation.md`。这是 2026-10-17 的本地审查记录，未据此宣称完成修复或真实评测；最新代码及解决状态需回到工作树/后续 PR 核对。

## 2026-10-17 审查修复与真实目录往返

**Why:** 仅用简化 schema 或手工构造最终回执，无法覆盖 Provider 目录被平台白名单拒绝、JSON 规范化覆盖原始缓冲区、第二轮接收后尚未出现 SSE 等真实边界。取消命令返回成功与可查询证据已经保存也属于两个不同步骤。

**How to apply:** 使用实际 Provider 目录和模板走平台准备、派生身份、计算摘要、严格校验全链路；草稿暂存与执行准入分开。用真实提交顺序注入接收后落盘失败，按 action 身份核对并检查相关 Run 全集，确认停止和归档后才清理。摘要按合法最小预算投影，完整记录走已授权的原件引用；交付字段从完整文件提取，超出有界检查能力时明确未完成，不把前缀、哈希或模型判断当成质量评分。

本地修复、最终技术测试及未做的真实媒体/评分验收，见同工作树 `docs/verification/2026-10-17-case-goal-continuation.md`「审查修复」；原审查保留修复前证据。该记录不是部署状态，发布、线上 Case 策略与单题/十题真实结果需另行核验。未改 Maxwell Agent Runtime。
