---
name: sandeval-transferred-author-handoff-and-mixed-qc-scope
type: pitfall
created: 2026-10-25
updated: 2026-10-26
tags: [sand-eval, quality, reassignment, author, handoff, scope]
links: [sandeval-reassigned-answer-frozen-review-conflict, sandeval-partial-reassignment-package-completeness-gap]
---

# 转派后的原作者提交入口与混合质检范围

**Why:** 当前持卡权、最新答案作者、质量送审批次与冻结质检责任是不同事实。转派后若个人看板只读持卡人，而待提交质检按答案作者投影，就可能让原作者没有入口、新持卡人的提交又不覆盖原作者范围。新批次同时包含旧质检占用与从未送审题时，整批重复送审保护也可能将未送审部分一起挡住；“查看原质检任务”只提供导航，不能证明旧单覆盖整个新批次。

**How to apply:** 按稳定工作项并排核对当前持卡、最新响应作者与版本、逐卡改派审计、个人看板实际服务、作者明确交接回执、正式冻结成员、原质检轮次与处理人。分别统计旧占用和未送审部分；旧通过不能证明转派后新答案已检，也不能通过删除占用、扩大旧快照或减少应交数消除缺口。需要更改持卡归属时先确定业务接手意图；不得自动替active作者提交。修复验收应证明作者本人可提交、质检员真实收件、原责任链保存，以及应交集合没有重复或遗漏。

2026-10-25 梁旋、杨心月、文希三个具体形状、双生产副本只读核对、精确SHA、逐卡版本和待确认方案见[现场报告](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/report.md)。本次只读排查，没有生产恢复、代码PR或部署；当前状态和后续结果从报告及新回读查证，不能将本页当作已修复声明。

源码回查：个人看板 `app/repositories/my_tasks.py::annotation_tasks`、`app/services/facts/my_tasks.py::list_my_annotation_batches`；来源作者分组和本人交接 `app/services/facts/task_assignments.py::_submission_scopes_with_manifests`、`submit_annotation_batch_for_qc`；首次分配守卫 `quality/application/management/batch_allocation_service.py::batch_options` 和 `quality/infrastructure/persistence/inspection_work_claim.py`；接续展示 `quality/application/management/leader_query_service.py::_batch_options`、`frontend/src/pages/quality/management/PackageDetail.tsx`。复用时先按DEPLOY_SHA核实坐标和行为。


## 2026-10-26 原作者确认入口方案

用户明确选择保留当前标注员接手，恢复原作者本人对已保存作答的确认提交入口。**Why:** 不能为补交接入口擅自回退持卡归属，也不能让当前标注员的批次提交覆盖另一名作者的责任。**How to apply:** 原作者入口只使用当前仍属本人的最新答案范围，确认绑定scope版本和答案manifest；读取失败明确提示，成员或答案变化后重新确认，原有编辑权限不扩大。

实现坐标为 `app/services/facts/authored_annotation_handoffs.py`、`app/api/my_tasks.py::get_authored_annotation_handoffs_reader` 和 `frontend/src/pages/myTasks/AnnotationBatchList.tsx`；版本、测试PR与Gate、只读生产候选回查、虚构数据浏览器截图及测试分支冲突边界见[实施记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/implementation-status.md)和[PR #2839](https://github.com/world-sim-dev/sandai-data-smith/pull/2839)。入口代码验证、测试环境验收、生产上线和本人实际提交是四个独立状态，复用时分别查证。混合批次的后续方案与验收边界见下节，不能由单一入口的修复外推线上已恢复。

## 2026-10-26 混合范围与失效确认

**Why:** 原整批确认绑定完整范围和答案；一题产生后续版本后，旧确认可能失效，即使其余未送审答案没有改变。只解除混合批次的展示禁用仍可能缺少真实来源范围证明，或让旧通过掩盖新答案。

**How to apply:** 按稳定质检归属投影互不重复的固定成员分组，来源列举、版本读取、提交证明和派检共用同一标识。已有质检的题沿原责任链；新答案使用“核对答案版本 → 按最新版重新复验”，普通退回质检员不换版。原整批确认只有精确匹配当前完整成员和答案时才覆盖分组；失效确认由本人绑定新清单重交并追加回执，原历史不改写。验证须覆盖独立首送、原链复验、整包完整性及无重复成员，不能只验证按钮可点。

实现从 `app/domain/annotation_inspection_partition.py`、`app/repositories/annotation_qc_allocation.py::inspection_owners`、`app/services/facts/task_assignments.py` 和 `quality/application/resolution/latest_answer_reinspection.py` 回查。转派操作人及无业务原因的审计边界、调查期间出现后续质检版本的核验、本人确认与质检候选、最终提交与Gate状态见[混合范围修复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/mixed-fix-status.md)及[PR #2839](https://github.com/world-sim-dev/sandai-data-smith/pull/2839)。原作者、当前持卡人、各批验收人和整包最终提交人分别核验；整包尚未封存时不把回落规则说成已经指定了提交人。

分组进入质检后还须反向约束原持卡批次。**Why:** 只更新质检队列，会让个人看板和普通修改仍按旧批次标识误判；滚动发布时，给旧领域对象直接增加序列化字段还可能令旧进程无法解码或在写回进度时丢掉门禁。**How to apply:** 来源提供父范围关联，贯穿预览和分配；准备中的分配也参与原批次门禁。兼容测试同时证明旧对象形状可读、旧进度写回不会丢失限制、真实数据库匹配父范围且拒绝其他范围。具体字段与存储实现沿修复记录和 `quality/infrastructure/persistence/batch_allocation_repository.py` 回查。


## 2026-10-26 数据包展示的低风险边界

**Why:** “原批次处理中”“部分题目”“重新确认”没有明确题目范围、待办人和下一步；为了补齐展示而额外展开历史任务查询，又会增加读取范围，并可能把旧答案的通过误当成当前答案已通过。

**How to apply:** 先用现有接口返回的范围、作者、状态和操作引用，明确未送审份数、谁应提交质检及负责人何时可以派检。仅把确认入口改名为提交质检，不改变提交请求或权限；原任务详细状态通过现有详情入口核对，不以展示层推测覆盖关系。性能结论应限定为本轮没有新增请求或查询，不能外推其他功能的延迟不变。

本轮实现从 `frontend/src/pages/quality/management/PackageBatchStatus.tsx`、`PackageDetail.tsx` 和 `frontend/src/pages/myTasks/AnnotationBatchList.tsx` 回查；没有增加后端读取。虚构数据浏览器证据、最终提交与 Gate、未部署边界见[展示修复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/display-status.md)及[PR #2839](https://github.com/world-sim-dev/sandai-data-smith/pull/2839)。


## 2026-10-26 完整差异 review 的边界

**Why:** 仅展示层无新增查询，不能外推整个修复的查询成本；保存不可变门禁元数据，也不代表滚动版本能完整恢复领域对象。全量 CI 通过仍可能遗漏历史任务规模、单任务失败隔离及旧写回后的新读取往返。

**How to apply:** 本人待提交列表应限定有效待办并批量或有界读取，避免逐历史任务展开。错误必须带任务范围，只阻断不能证明完整性的任务；不能让单个历史异常抹掉其他健康入口。扩展记录兼容要实测旧进程替换 payload 后，新进程从保留的 owner_ref 恢复字段，并通过原命令幂等重试，不能只检查新写回 SQL 没有修改 owner_ref。

本次逐提交说明、三个具名缺口、隔离脚本和证明范围见[main PR 复查记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/review-main-2842.md)及[PR #2842](https://github.com/world-sim-dev/sandai-data-smith/pull/2842)。修复采用同请求批量归属事实、按任务隔离失败、所有领域对象读取恢复不可变父范围；实现、隔离前后对照、页面证据和最新 Gate 以[review 修复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/review-fixes-status.md)及该 PR 当前 head 为准，不将隔离调用预算等同于生产延迟。


异构数据库替身也要验证参数语义。**Why:** PostgreSQL 的编号占位符按编号绑定，SQLite 的顺序实参按占位符首次出现绑定；CTE 优化移动参数后，旧用例可能交换作者与空间。**How to apply:** SQLite 复用 PostgreSQL SQL 时按占位符名称绑定，并保留真实结果断言；诊断与具名复验沿 review 修复记录回查，不能为测试适配改变生产的参数顺序。


## 2026-10-26 批次通过与整包回交的边界

**Why:** 数据包中的个人批次均通过供应商验收，仍可能存在旧整包退回、复检或冻结交接证据不覆盖当前整改结果的阻塞。原作者提交入口与混合首送范围修复不会替用户结清退回或重新交接；不能由行级“已通过”推断整包可提交，也不能把不同负责人阶段的展示混作一个状态。

**How to apply:** 在同一生产版本下分别核对供应商和 Sand 负责人视角，确认整包实际阻塞原因、提交入口是否可用及剩余整改/复检。再按 disposition、父子执行与当前冻结证据定位接收人和下一步；没拿到具体记录前，不指派责任人、不直接关闭退回、不让用户重复提交已通过批次。本机 env 的目标缺失不证明生产对象不存在。

纸面包的上线后只读验证、两种视角、确定事实和尚未定位的记录边界见[纸面包核对记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/paper-package-after-release.md)。发布是否完成沿[发布恢复记录](/Users/leslie/Documents/Playground/output/qc-batch-blocker-20261025/release-recovery-status.md)及目标生产 SHA 独立核验。


## 2026-10-26 上层验收先关闭后的整改恢复闭环

**Why:** 多轮答案整改中插入负责人复查后，后继质检和负责人报告通过，不一定意味着原整改执行已经完成。若上层退回已关闭，而下层恢复仍要求上层保持原 processing 版本，同时历史补偿又只接受 completed/resolved 的整改执行，就会形成双方都无法继续的状态。行级已通过与整包未结退回可以同时是真实数据。

**How to apply:** 将最终正式报告、验收回执、原标注退回集合、祖先版本及当前执行错误放在同一时间线上核验；用只读授权检查复现具体拒绝点，区分持久化错误与实际日志。修复应核验精确冻结证据并补齐收尾顺序，不绕过未结退回保护，不要求重复提交已验收内容。累计 attempts 不等于已取得同等条数的失败日志，也不要在缺乏历史调用证据时归因为并发竞态。

本次纸面包的真实记录、北京时间线、已部署代码坐标、双实例回读与纯读取复现见[根因报告](/Users/leslie/Documents/Playground/output/paper25-rootcause-20261026/report.md)。本次仅排查；是否恢复须以后续操作回执和重新读取为准。


### 已验收祖先仅用于原整改收尾

**Why:** 已关闭的上层退回不应重新授予编辑、派检或再次验收权限，但同一组已通过报告及其正式验收可以为尚未结清的原整改执行提供有限收尾证据。简单把 resolved 当作 processing 会放宽普通操作，直接修改旧退回状态又会丢失关闭依据。

**How to apply:** 只在关闭入口核对当前批次与完整报告组、负责人验收版本、冻结汇总、原执行授权及全部责任版本；保留未结子责任/召回门禁，用原关闭回执与 CAS 处理部分提交。验证包含失败反例、关闭中断后重试、整包汇总与实际交接分离，并对真实对象做纯读取预检。实现、16项回归、候选生产只读证明及最新CI/上线边界见[修复记录](/Users/leslie/Documents/Playground/output/paper25-rootcause-20261026/fix-status.md)和[PR #2864](https://github.com/world-sim-dev/sandai-data-smith/pull/2864)。


### 2026-10-26 混合祖先的关闭补偿审查

**Why:** 冻结祖先可能同时包含仍处理中的标注退回和已验收关闭的负责人退回。补偿只允许全部祖先属于已关闭负责人退回，会在真实多轮流程中重现原阻塞；从负责人退回开始的测试无法覆盖此前已有的标注责任。

**How to apply:** 回归应在首次负责人退回前加入原生标注整改，再延迟末次执行收尾后完成负责人验收。分别校验仍处理祖先的原版本与授权，以及已验收祖先的受限关闭证据；不得忽略前者或擅自关闭全部祖先。复现、定位和修复状态沿[PR2864再次审查记录](/Users/leslie/Documents/Playground/output/paper25-rootcause-20261026/review-2864.md)回查。


**混合链的双段恢复。** Why: 补齐本轮执行关闭后，历史责任查找仍可能把中途已停止的整改复验组误当成执行最终组，导致验收恢复再次拒绝。How to apply: 首段对精确验收的父责任只做局部只读历史验证，重跑原父链与冻结授权；次段在执行已经完整关闭后，只接受同批、同关卡、连续人工复查接续的实际最终封存组，由原验收恢复路径关闭历史标注责任。应测试最终整包汇总及中断后的重复验收，不能只断言本轮 execution completed。2026-10-26实现与40项具名回归、CI和发布边界见[混合祖先修复记录](/Users/leslie/Documents/Playground/output/paper25-rootcause-20261026/mixed-fix-status.md)。


**负责人验收的部分提交也必须覆盖。** Why: 本轮整改关闭的中断测试不能覆盖上层验收捕获的中断；多个负责人祖先可能同时存在 processing 与 resolved，若只接纳仍处理的标注祖先，两个恢复流程仍互相等待。How to apply: 在原生验收流程每条负责人关闭的实际持久化之后注入故障，再交替执行整改恢复与原验收恢复；保留已封存报告、连续版本与冻结许可，并检查最终整包而非仅一次恢复结果。2026-10-26实际第2条关闭后中断的证据、反例和修复状态沿[第二次复查记录](/Users/leslie/Documents/Playground/output/paper25-rootcause-20261026/review2-2864.md)回查。


**部分验收的校验集合。** Why: 同一冻结责任链中的负责人祖先可以在故障后混合处理状态，其下仍处理的真实冻结子责任不能被当作未知阻塞，但也不能因此自动关闭祖先。How to apply: 允许本轮关闭前完整验证仍处理的负责人及标注祖先，集合必须与原冻结版本、真实父链和全部许可一致；集合外子责任继续阻断。对每条负责人关闭后的实际写入故障和两种恢复顺序验证最终汇总，剩余祖先沿原验收路径结清。2026-10-26的66项回归、最新提交和CI/部署边界见[部分验收修复记录](/Users/leslie/Documents/Playground/output/paper25-rootcause-20261026/partial-acceptance-fix-status.md)。


## 2026-10-26 整改结清后的下游唤醒缺口

**Why:** 关闭整改只重试已完成的空间质检推进，会被 completed 幂等短路；后续供应商负责人整包推进仍在全局队列等待。页面若继续投影上次失败原因，就会在正式复核和退回均完成后仍提示待复核或未结退回。

**How to apply:** 分开证明当前正式复核、活跃退回、负责人推进记录、新整包及真实提交入口。沿 `ResolutionService` 关闭后回调、`AdvancementService.after_submit/recover` 和 `LeaderQueryService._package_generation_blockers` 核对；恢复应精准唤醒同包待推进记录并保留权限、范围、锁和幂等，不重做验收或直接改状态。全局队列候选窗口和记录排序须现场取证，不承诺固定恢复时间。

纸面 1019_04 的已部署源码、只读实时阻塞校验、先复核后结清的时间线与队列证据见[专项诊断](/Users/leslie/Documents/Playground/output/paper25-rootcause-20261026/paper04-diagnosis.md)。本次是诊断发现；是否已实现修复或恢复，必须重新读取正式推进与提交入口，不能从本页推断。
