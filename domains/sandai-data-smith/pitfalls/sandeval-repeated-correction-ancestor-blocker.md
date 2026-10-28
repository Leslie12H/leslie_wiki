---
name: sandeval-repeated-correction-ancestor-blocker
type: pitfall
created: 2026-09-30
updated: 2026-10-28
tags: [sand-eval, quality-center, remediation, reinspection, responsibility, release]
links: [sandeval-transferred-correction-task-visibility, sandeval-roles-and-workflow]
---

# 子整改闭环后再次退回丢失上级责任授权

**Why:** 上级负责人退回和下级标注整改有独立闭环。子整改质检通过后，上级责任仍可能处理中；若质检员随后再次退回标注，新退回需要承接真实上级授权。2026-09-30 只读实例确认：新单没有父处置和中断执行记录，工作台显示答案已有更新且可提交，但提交沿报告/送审版本继承链仍查出旧上级未结处置，本次授权集合缺少它，命中 `REVIEW_BLOCKED`。答案准备度和完整责任授权是两个不同门禁。

**How to apply:** 固定来源任务、质量任务、接收人、处置版本和部署 SHA。先读本人工作台的版本更新及准备度，再沿报告的 `previous_task_id` 和送审的 `previous_submission_id` 查未结责任；对比新单 `parent_disposition_id`、父版本证据、中断执行和实际 `_ancestors`。若子整改执行已完成，不能期望只扫描 pending 执行恢复其上级授权；也不能将页面“可提交”或新答案版本视作整条责任链已授权。修复必须恢复真实继承关系并保留上级独立验收，禁止直接关旧单或扩大用户权限。

- [2026-09-30 只读报告](/Users/leslie/Documents/Playground/output/wuqiuyu-correction-20260930/report.md)：含生产身份投影、两张阻塞单、时间线、门禁表达式重放和对应 409 日志；实例状态会变化，使用时重新核验。
- 本次部署源码入口：`sand-eval/platform/backend/quality/application/resolution/manual_return_service.py::_return`、`reinspection_authorization_service.py::manual_parent`、`resolution_service.py::_ancestors / capture_manual_annotation_return / resubmit`；完整阻塞范围扩展在 `quality/application/management/inspection_context_service.py::expand_disposition_targets`。源码属于可变指针，修复或发布后应重读。
- 当次 `manual_parent` 仅定位直接上一轮 group 的负责人退回，实例的旧负责人责任位于更早轮次，结果为空；`capture_manual_annotation_return` 仅捕获 pending 执行，而保存旧上级授权的子整改执行已 completed。具体对象与 SHA 保存在报告，本页不作为当前生产状态证明。
- 原始请求响应正文未保存在应用日志；本次通过同部署的只读阻塞查询、校验表达式和 212 字节响应大小交叉确认拒绝分支，没有为取证执行提交。浏览器未登录，本人工作台事实来自生产服务按当前身份的只读投影。

## 受控恢复与防复发

**Why:** 已完成的下级整改是正式历史依据，不能因为执行离开 pending 集合就丢弃它冻结的上级授权。恢复关联与关闭上级责任是不同动作；恢复后仍保留负责人验收。

**How to apply:** 用 `ReinspectionAuthorizationService.completed_annotation_parent` 核验唯一 completed/resolved 执行、完整通过报告、同一真实批次的逐版本送审继承、父责任精确版本以及既有 v2 正式授权。新退回据此继承 `parent_manual_return_version`；历史缺关联的 untouched open 单通过 owning operator CLI `python -m app.cli.correction_parent_repair` 恢复。工具默认只读，显式 hash-bound apply；先备份 before-image，再重新核验计划，并用当前单版本/原证据、父单 processing 状态与版本作条件更新，保留 `parent_inheritance_repair` 审计标记。授权查询在操作事务外完成，事实校验在调用者 session 内复用，避免嵌套读连接。

- [2026-09-30 修复报告与实时证据入口](/Users/leslie/Documents/Playground/output/wuqiuyu-correction-20260930/repair-report.md)：单条 apply、旧部署代码的独立门禁回读、真实用户 HTTP 200/执行回执、代码分支及 CI 指针。状态会变化，引用时以报告和当前线上回读为准。
- 仅“门禁通过 / 按钮可用”仍不等于实际提交验收；应继续核对原用户的成功命令回执、新执行和 answers POST 结果。已经进入 processing 或存在执行/命令的单子不再适用 untouched-open 关联修复。

## 发布与运行时验收指针

**Why:** 分支或 PR 的 Gate 证明被测源码通过检查，仍需证明生产运行该修复，并保留已修复实例的正式责任链。PR 合并、镜像构建、滚动发布和真人提交回执各自提供不同证据。

**How to apply:** 发布获授权后，把 main 合并 SHA、同一流水线的 Gate 与镜像 digest 绑定；等待发布任务成功，再独立核对公开 `/health` 版本、全部副本镜像、实际容器源码和实例责任链。若合并后没有该 SHA 的发布任务，先排除已运行或排队的任务并重新确认 main，再调度 owning workflow；不并行启动本机发布，也不将“没有触发”的观察臆断为 webhook 或凭据故障。

- [修复 PR #2192](https://github.com/world-sim-dev/sandai-data-smith/pull/2192) 与 [main 发布流水线](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/36685310505)：2026-09-30 发布证据入口。
- [独立生产版本、4 个副本与责任链回读](/Users/leslie/Documents/Playground/output/wuqiuyu-correction-20260930/production-release-verification.json)：具体 SHA、digest、容器源码哈希和执行状态保存在当次证据；使用时须重新核验，不能视为持续的生产状态。

## 整改转交后，冻结许可与当前责任版本分离（2026-10-14）

**Why:** 同批次历史整改转交后，当前持有人和接收人可以正确，页面也可以显示必需题目已更新，但上级继承证据和复验许可仍绑定转交前的版本。本次只读实例中，四条 processing 责任经过两次正式管理转交各增加两个版本，原 v2 许可仍存在且摘要、执行与精确范围可核验；当前版本没有许可，原生祖先门禁返回 `REINSPECTION_AUTHORIZATION_STALE / 上级整改授权已变化`。答案准备度不能替代完整授权链。

**How to apply:** 对同一报错，先区分客户端旧版本、缺父关系、原许可丢失和转交后的版本失配。读取同一真实 scope 的管理转交命令、当前处置与 inherited refs、旧/新版本的精确许可，再在数据库强制只读连接中重放原生祖先门禁和冻结执行范围校验。不能因页面显示可提交就让用户反复改题，也不能因旧许可有效便跳过当前授权校验。`correction_parent_repair` 的 fresh untouched missing-parent 条件不能推广到已经转交或有历史执行的单。没有已批准且适用的授权接续机制时，给出诊断并保留答案、旧许可、报告和上级独立验收；不要关闭旧责任、回退版本或虚构授权。仅诊断的结果不能描述为提交恢复成功。

- [2026-10-14 本单诊断与只读证据](/Users/leslie/Documents/Playground/output/correction-xujiayu-20261014/report.md)：转交、四条旧/新版本、原生拒绝分支、许可摘要与执行范围核验、本人操作建议及未改规则边界。具体状态仅保存在报告，现场复用须重新核验。
- 当前实现指针：`quality/infrastructure/persistence/disposition_repository.py::transfer / reinspection_permit`、`quality/application/resolution/reinspection_authorization_service.py::manual_ancestors / _validate_execution_permit`、`quality/application/resolution/resolution_service.py::_ancestors / resubmit`。是否支持合法转交后的授权接续以当次部署源码和原生检查为准。

## 明示批准的单案数据例外与快照范围（2026-10-14）

**Why:** 缺少现成接续机制不等于任何单案数据操作都不可行，但恢复历史许可所绑定的责任版本属于对单调版本栅栏的例外，可能改变旧请求及审计版本语义。“修复本单”或“直接改数据”不能代替对具体回退及其风险的明示批准。2026-10-14 在用户对四条具体版本回退及风险明示批准后，使用原生管理转交的混合 DML 边界完成单案恢复；未修改共用授权规则、原许可、执行上下文、报告或答案，保留当前接收人及完整转交历史。具体对象、版本、部署、计划摘要和回执只保存在当次报告，不作为通用修复规则。

**How to apply:** 先备份精确 before-image，核对版本增量是否全部来自同一 scope 的正式转交，并排除活跃依赖、本单提交 intent 及现接收人可重放的历史命令。用拟修改数据的内存投影运行未修改的原生门禁，明确区分预演与生产恢复。若只能回退版本，必须把确切修改与栅栏风险交给人批准；不能把本次批准延伸到其他单。写入时固定本单完整依赖摘要、条件行数及真实事务边界，保存不可变管理审计；提交后用独立连接和另一副本回查，再读取本人身份的工作台准备度。门禁/准备度通过仍不等于本人 POST 或质检验收成功。

同质量任务的其他批次会持续更新后台重试次数。完整快照应保留，但冻结修复摘要应绑定本单全部依赖，不应把无关批次的进度计数当成本单前置。漂移先停止并做精确 diff，证明无关后再冻结新计划；不能直接忽略任意变化。滚动发布更换 Pod 后须以当前部署重新预检。

- [2026-10-14 单案数据修复、批准边界及独立验收指针](/Users/leslie/Documents/Playground/output/correction-xujiayu-20261014/data-repair-report.md)：实际修改、审计回执、原许可保留、新连接/另一副本回查及本人工作台证据。仅证明当次授权阻断解除，真实复验提交另验。


## 联合历史整改单时触发旧祖先授权（2026-10-16）

**Why:** 当前链接本身的祖先门禁通过，仍不能证明整批复验能提交。提交服务会联合详情列出的同批未结历史责任，其中某张更早子单可能承接旧负责人退回；其继承证据和精确范围许可绑定转交前版本，当前责任已因后续转交增加版本。于是完整集合返回 `REINSPECTION_AUTHORIZATION_STALE`，即使本人全部答案已保存更新、页面准备度为真。这一阻断与从旧送审基线重复生成版本不同。

**How to apply:** 固定主单与实际接收人，读取完整 manifest 和 related_dispositions；先对主单、每张历史关联单以及联合集合分别只读重放原生 `_ancestors`，再沿失败历史子单追父责任的 `inherited_reinspection`。对每条继承引用比较旧/当前版本、原精确范围旧许可与当前许可、正式转交历史，保留“旧许可存在但当前版本无许可”的区别。实际 POST 的时间、request_id、部署 SHA 和响应长度独立核对；历史响应正文未留存时明确区分日志事实与当前只读重放。排查中若滚动发布，再在新副本复核门禁。恢复须单独有精确授权，不能让标注员重做答案、直接关旧单或跳过版本校验。

- [2026-10-16 刘钬本批只读报告](/Users/leslie/Documents/Playground/output/liuhuo-correction-20261016/report.md)：本人四题准备度、主单通过/历史子单阻断、三条旧/新版本及许可、真实失败请求和滚动更新后独立复核。具体 ID、状态和 SHA 仅存现场证据；该链接保留初始只读诊断，下述明示批准后的数据修复另有独立报告，未替本人提交复验。


## 2026-10-16 明示批准后的三条版本恢复

**Why:** 本单部署的精确许可还绑定旧执行的固定责任版本，直接补当前版本许可仍会触发执行版本校验；重写旧许可或执行上下文会改变历史依据。用户在看到三条确切回退、完整计划和旧请求风险后，明确批准该单案版本栅栏例外。该批准不能推广为其他单的通用恢复授权。

**How to apply:** 保留强制只读计划和完整 before-image，证明每条版本差值全部来自正式同批转交回执，排除活跃/已验收依赖、当前单提交意图与现接收人可复用旧命令，再用未修改的原生联合门禁验证内存候选。在任务级占用、本人写锁和正式管理转交使用的混合 DML 事务内重算冻结摘要，按旧版本、旧证据、接收人及未关闭状态精确 CAS，保存不可变审计；提交后另开只读连接与另一 Pod 核对正文、全部历史判断、送审版本、旧许可/执行/命令、本人真实工作台和联合祖先门禁。普通 Hologres autocommit 的 rollback 不作为保证。授权阻断解除与本人实际提交/后续质检仍分别验收。

- [刘钬本批手动修复及独立验收](/Users/leslie/Documents/Playground/output/liuhuo-correction-20261016/data-repair-report.md)：明确批准、精确三行变更、冻结计划与正文备份、不可变审计、任务占用结案和跨副本本人投影的证据入口；没有替标注员提交或改动判断结论。具体版本、ID 和 SHA 只保留在报告。


## 2026-10-22 委派质检责任在再次退回时遗漏

**Why:** 已完成答案整改的真实上级可能来自 `review_rejected` 委派，而不是负责人 `manual_return`。只回查手动退回会漏掉已由正式执行与 v2 permit 授权的责任，造成答案准备度通过、完整提交责任校验失败。联合关联单遍历与委派责任类型解析是不同问题。

**How to apply:** 核对上一轮 completed/resolved 执行、准确祖先版本、来源整改单的父执行、连续报告与送审、原始成员集合及 v2 permit。复用同一父执行校验处理当前授权和已完成整改继承，保留上级独立验收；历史修复审计也必须回到正式已完成执行证明，不能仅凭标记放行。单案数据恢复、通用代码验证、测试分支整合及生产发布分别验收。

- [岳凡翔单案排查、具体批准、父关联恢复与独立生产回读](/Users/leslie/Documents/Playground/output/yuefanxiang-correction-20261022/report.md)：当次对象、版本、计划摘要及修复回执只沿报告查，不将本页作为运行态证明。
- [通用修复测试 PR #2750](https://github.com/world-sim-dev/sandai-data-smith/pull/2750)与[任务分支完整 Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39721311592)：源码、最新检查/整合与发布状态沿链接重新核验。测试分支冲突不允许把 test 历史带进开发分支；独立 Gate 不替代测试环境整合验收。
- 共享校验与回归入口：`quality/application/resolution/reinspection_authorization_service.py::annotation_execution_parents / completed_annotation_parent`、`resolution_service.py::_ancestors`、`tests/quality/application/resolution/test_completed_delegated_correction_parent.py`。性能代码索引通过 owning generator 更新。


## 2026-10-22 已关闭父责任的历史查询与正式提交

**Why:** 共享父执行校验如果只允许 processing，会让已完成整改的历史继承查询在上级正式验收后报错。历史查询应识别真实关闭并停止继承；正式提交仍不得复活已关闭责任，两条用途不能共用相同的状态许可。

**How to apply:** 在同一校验owner复用谱系证明；默认严格，仅历史查询可识别真实return、冻结版本的连续关闭版本、关闭依据与时间。随后核对已完成执行的祖先版本，并停止继承已关闭父责任。增加关闭后不继承、错版本/缺关闭依据或时间/recall拒绝、普通发布门禁仍拒绝关闭责任的回归。

- [main PR #2751](https://github.com/world-sim-dev/sandai-data-smith/pull/2751)与[最终head对应Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39725534860)：用户要求review、直接main PR及通过后合并；最新审查、提交和发布状态沿链接重新核验，不能由本页推断。
- [本次review与发布回执](/Users/leslie/Documents/Playground/output/yuefanxiang-correction-20261022/review-main-release.md)：人工审查发现、修复、精确head、Codex审查新鲜度与合并/发布独立证据。


## 2026-10-23 多轮标注退回的联合关闭责任遗漏

**Why:** 连续标注退回会把更早的中断责任加入后续执行的固定 `related_disposition_versions`。之后发生质检退回并最终由负责人验收时，只匹配紧邻来源报告会漏掉联合集合中的旧责任，导致所有批次已验收但整包仍报 `REVIEW_BLOCKED`。固定联合关闭责任与仅授予复验权限的 ancestor 集合不能混为一谈。

**How to apply:** 同时核对原质检退回冻结的 disposition refs / v2 permit hash、原执行的 related 精确版本、最终已完成子执行的祖先版本、当前正式质检报告和负责人封存验收。只有完整闭环证据才允许原生关闭；ancestor-only 不得借此自动关闭。历史恢复沿 owning CLI `inherited_annotation_return_recovery`，先 hash-bound dry-run，再 CAS、审计与跨 Pod 回读。关闭责任后还要核验原验收推进是否保留旧失败；如需重放，仅恢复其原持久推进，不能制造新验收或代替负责人提交 Sand。

- [本次两个包的诊断、精确恢复与独立回读](/Users/leslie/.codex/visualizations/2026/10/22/01a16320-cb2a-7231-b0af-61d168d28c51/package-submit-20261023/report.md)：对象、版本、审计 hash 和当时的可提交资格仅以报告及新鲜回读为准。
- [共用闭环修复 PR #2804](https://github.com/world-sim-dev/sandai-data-smith/pull/2804)：最新 head、审查、Gate、合并和生产发布状态沿 PR / workflow 查证；独立恢复进程加载候选逻辑不代表线上 Web 服务已发布。
- 回归应组合多轮退回发生在负责人退回之前和之后，并检查仅 ancestor 授权、陈旧版本、缺许可和未完成执行仍拒绝。


## 2026-10-28 历史父责任再次整改关闭后，单题修订链读取失败

**Why:** 当前任务的详情和编辑授权可正常，单题读取仍可能在追溯历史 Sand 修订时失败。旧执行冻结父责任版本，父责任随后经过正式下一轮整改并关闭，历史读取若只接受旧版本加一，就会把存在正式关闭记录的历史链判为不连续，并将异常传递到整题加载。报错文字含“或关闭依据”，不能据此推断关闭依据实际缺失。

**How to apply:** 分别读取本人任务详情、真实题序和每个精确题目；沿失败调用栈定位版本比较，再对照旧执行、父责任当前版本、正式关闭执行及报告。真实题号按原生队列核对，不能按 RI 字典序猜。修复需证明中断、子整改、后续父执行和关闭之间的连续性，不能简单放宽为版本大于等于、回退责任版本或吞掉所有错误。只读重放能证明题目读取阻塞，不能单独证明浏览器跳题机制或真实保存成功。

- [两个批次的只读报告](/Users/leslie/Documents/Playground/output/qc-two-batches-20261028/report.md)：具体 QT/RT/RI、三条父责任版本、部署 SHA、另一副本本人读取及失败调用栈。当前未改业务代码、生产数据或部署；现场状态沿证据入口重新核验。
- 可变代码入口：`ReviewQueryService.items_page`、`AnswerAmendmentService._sand_return_chains / _sand_return_basis`、`delegated_feedback.annotation_return_delegation`、`ReinspectionAuthorizationService.annotation_execution_parents(allow_resolved=True)`。


### 2026-10-28 请求日志补证与修改边界

**Why:** 单题加载失败会清空内容，但刷新若从内容对象取选中 ID，会丢掉仍在 URL 中的目标，发出默认队列请求并转到第一题。队列若附带第一题内容，单题历史链异常也会传成整页加载失败。访问日志可证明请求和 Referer 的变化，不能代替没有记录的点击事件或响应正文。

**How to apply:** 固定 SLS 查询窗口并核对 Complete 与独立计数，按精确 RT、客户端及观察模式区分流量；沿失败题目、带 anchor 队列、无 anchor 队列及后续 Referer 对齐源码。选中 ID 与加载内容独立，失败重试保留目标，旧请求不得覆盖新选中项。后端同时核对 annotation_execution_parents 和 completed_annotation_parent 的历史版本假设，以正式下一轮执行证明合法增版，再以真实关闭执行校验当前版本、完整报告和关闭依据；已关闭责任仍停止继承。回归覆盖单题、历史、核对答案版本与首次队列附带内容，不能只验证详情 200。

- 证据与精确修改建议仍见[两个批次只读报告](/Users/leslie/Documents/Playground/output/qc-two-batches-20261028/report.md)。代码入口补充：`ResolutionService.resubmit`、`ReinspectionAuthorizationService.completed_execution_permit / completed_annotation_parent`、`ReviewWorkspace.select / load`、`ReviewQueryService.queue_page`。本页不表示业务修复已实施。


### 2026-10-28 共享校验影响范围 review

**Why:** `allow_resolved=True` 的历史委派解析同时被直接整改推进、退回阻挡和上游反馈权限复用；“函数只读”不等于“只影响展示”。历史修订还作为答案保存 prepare 的基线，单独放行 GET 会造成读写版本不一致。前端 load(undefined) 也承载检查范围变更后的主动重置，不能一律替换成保留旧题。

**How to apply:** 按事实识别和当前授权区分调用用途，默认写门禁不变，历史证明不得变为活跃 parent/ancestor/related。展示和保存准备共享同成员的精确谱系，但 source.verify、版本、候选 binding_hash 和写权限仍独立严格校验。completed_execution_permit 的其他业务调用保持原语义；不同关闭类型分别识别，不能将子整改执行当成父责任自身的关闭执行。completed_annotation_parent 属于必须审查的间接写路径，不是本案 item_detail 栈上必改函数；若纳入需证明关闭后仍不继承。前端刷新重试与范围重置分开，目标 ID 不替代成功加载的 selected 内容，草稿和保存仍按精确题目及版本绑定。新证明沿请求内缓存复用，缓存区分用途，不跨请求缓存当前授权。

- [调用方、风险与回归清单](/Users/leslie/Documents/Playground/output/qc-two-batches-20261028/report.md#2026-10-28-追加-review共享调用方与回归风险)：包括 direct_return/manual_return、答案 prepare、反馈权限、其他关闭类型及 changeScope 的源码位置。此轮为方案 review，未声称实现或测试通过。
