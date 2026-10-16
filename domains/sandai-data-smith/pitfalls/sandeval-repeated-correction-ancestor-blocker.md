---
name: sandeval-repeated-correction-ancestor-blocker
type: pitfall
created: 2026-09-30
updated: 2026-10-16
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

- [2026-10-16 刘钬本批只读报告](/Users/leslie/Documents/Playground/output/liuhuo-correction-20261016/report.md)：本人四题准备度、主单通过/历史子单阻断、三条旧/新版本及许可、真实失败请求和滚动更新后独立复核。具体 ID、状态和 SHA 仅存现场证据；本次未恢复提交、未修改生产数据或发布。
