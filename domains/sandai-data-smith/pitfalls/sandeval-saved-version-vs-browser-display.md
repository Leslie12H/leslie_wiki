---
name: sandeval-saved-version-vs-browser-display
type: pitfall
created: 2026-10-17
updated: 2026-10-22
tags: [sand-eval, inspection, amendment, browser, draft, evidence]
links: [sandeval-workbench-context-404-evidence, sandeval-correction-evidence-and-deferred-lineage]
---

# 已保存最新版与本人浏览器实际显示分开取证

**Why:** 质检页仍绑定原送审成员，同时通过本轮代改记录展示较新答案。只读到成员的原 `object_ref` 会误以为仍显示旧版；读到最新代改、执行回执和原生候选，也只能证明服务器当前有新版，不能否定本人界面显示旧内容。浏览器还包含当前视图、编辑器状态与本机草稿，这些必须直接观察。

**How to apply:** 固定 QT/RT/RI，经送审成员定位工作项，分别核验原作答人和检查员；对每个保存版本对齐来源答案、执行回执和代改事实。以实际检查员身份在 DML 拒绝保护下读取原生 item 和 answer-draft，比较 `member.content` 的实际版本、execution.fields、候选正文与来源字段哈希。再直接打开生产页面，核对实际登录身份、网络响应、原文/修订视图和草稿基线。代码存在本机草稿优先分支只构成候选，不能据此认定个案根因。先保留原草稿，不用清空浏览器数据作为诊断起点。

- 2026-10-17 李阳反馈的精确对象、跨 Pod 保存链、原生双接口正文比较、浏览器访问状态与未决事实：[只读取证报告](/Users/leslie/Documents/Playground/output/liyang-answer-version-20261017/report.md)。具体版本和当前状态会变，沿报告脚本重新核验；本页不保存“现时已恢复”结论。
- 源码指针：`AnswerAmendmentService.visible_amendment/display`、`ReviewQueryService.item_detail/items_page`、`ReviewService.answer_draft`、`StructuredAnswer.tsx` 的草稿载入和内容身份，以及 `caption_refine_v6/ui/Answering.tsx` 的原文/修订内容来源。按报告中的生产 SHA 读取。
- 浏览器新会话进入登录页时，先区分它与用户已经登录的内嵌浏览器或 Chrome 会话；不能把独立会话的登录状态当成用户页面状态。明确实际验收范围，不伪造账号会话，也不把原生服务读取或路由 mock 当作本人生产界面。
- 观察页带 `observe_account` 时，当前前端跳过本人浏览器草稿。用户说“应是某时刻修改的内容”，应补查该时刻之后的正式答案、来源回执、服务端候选和 `pending_write`，再区分服务器保存内容与本人原设备上的输入。质检输入当前走浏览器暂存，明确保存成功才产生来源答案与代改事实；这是实现边界，不能据此推定具体用户没有保存。本人浏览器与管理员观察页分别验收。

## 2026-10-19 后续版本提示与本轮正式代改

**Why:** “来源存在后续版本”不能独立证明本轮应检查旧答案。新版可能已在本轮建立前纳入冻结成员，也可能是同一检查员在当前轮、当前题正式保存的代改。仅比较原冻结引用与来源最新时间，会把这两种合法情况误报为版本过期。

**How to apply:** 分别核对版本作者、时间、代改所属 RT/RI、成员、计划与版本；再比较当前原生 item 的实际内容引用和 answer-draft 基线。当前基线一致、允许代改，不足以证明用户设备旧提示已消失；需保留草稿并对齐原设备请求。不能因这句话让质检员盲判，也不能未经谱系证明切到任意最新答案。

- [两条复验的只读证据与未决项](/Users/leslie/Documents/Playground/output/two-inspection-superseded-20261019/report.md)：正式版本来源、本轮归属、原生双接口和保存前置校验；当前状态需沿脚本重新读取。该记录未包含生产写入或用户设备页面验收。

## 2026-10-19 截图题号校准与跨批次正式代改

**Why:** 用户给出的 URL 可能仍指向第1题，截图实际停在第3题。只读链接题正常，不能外推整任务；观察页按截图切题后，可能立即复现真实后续版本阻拦。来源新版也可能属于其他批次质检员的正式代改，而非本轮自己的修改。

**How to apply:** 先对齐截图题号、队列 question_number 与 RI，再逐项读候选、按稳定 work_unit_id 找跨送审代改。不要在未排除其它题时宣称任务已无阻拦或归因缓存。区分“负责人退回质检员”沿原送审重抽样，与“质检员退回标注员—当前持有人提交整改—负责人安排复验”产生新送审快照；给操作步骤前只读核对资格、接收人和当前完整答案，实际命令另行验收。

- [同一取证报告的更正与全任务核验](/Users/leslie/Documents/Playground/output/two-inspection-superseded-20261019/report.md)：更正先前只查两个第1题的外推，记录真正受阻的三个检查项、跨批次正式代改，以及现有接续路径和未执行边界。动态事实沿 queue/allfacts/lineage/route 脚本重读；未证明重叠送审最初由何代码或操作产生。

## 2026-10-19 复发预防边界

**Why:** 人员批次的 scope_key 防重复不等于稳定工作项的质检责任防重复；转派或作者变化可改变前者，后者仍是同一题。来源写入时拒绝过期基线可以防覆盖，却会把未协调的并行链表现为质检页面被锁。一次整改重交不会自动消除该入口。

**How to apply:** 分配冻结与发布都按稳定工作项、关卡和正式谱系核验占用，保留显式独立多评；活跃检查/整改转派须接续责任，不能再次作为新作者普通首送。本人同轮正式代改、合法继承和其它链新版分开处理；已保存结论继续绑定所检查版本，旧入口给出当前合法后继或明确处理动作。历史冲突与后续预防分开验收，不能清保护、批量判通过或静默切最新版。

- [预防建议与尚未实施边界](/Users/leslie/Documents/Playground/output/two-inspection-superseded-20261019/report.md#复发风险与预防建议尚未实施)：部署版分配占用、版本链、整改分区与来源写保护的代码指针；尚未证明原始创建请求的唯一成因。后续修复须覆盖并发/重试/部分交叠及原生页面，不把此前分配展示修复当成完整防复发验收。

## 2026-10-19 派检准入与固定版本续办

**Why:** 保存正式送审快照与获得质检责任是两个事实。把防重复放在快照保存入口，会阻断历史整改分区和正常版本保存；只在页面预览检查又挡不住竞争发布。原生整改提交返回的固定回执也不必然包含随后形成的复验申请，不能把旧回执的空申请当成当前不可派检。

**How to apply:** 在完整质检计划准备和恢复激活时，对稳定工作项执行同一持久发布准入；新作者不能借人员批次变化创建并行责任链，但仍允许正常快照保存。显式换版固定完整答案、真实负责人及原请求，复用原生退回/复验协议后，再读取当前复验申请。旧判断不复制；原上级整改仍待真实复验与正式验收。对历史重叠保留明确前驱，已通过的其它报告还有未结退回，或重叠题已从其它人员批次交接 Sand 时，旧链换版继续阻断；沿正式 Sand 退回事项接续。

- [换版复验方案与代码 review/CI 入口](https://github.com/world-sim-dev/sandai-data-smith/pull/2613)：仓内方案 `sand-eval/docs/superpowers/specs/2026-10-19-inspection-version-continuation.md`；实现入口为 `LatestAnswerReinspectionService`、`inspection_work_claim` 和 `LatestAnswerReinspectionModal`。最终实现、测试分支冲突、Gate、部署及两条原卡单恢复分别沿 PR 和只读取证报告核验，不能把代码提交当成已上线或已完成生产换版。

## 2026-10-19 上线验收与历史任务接续

**Why:** 发布新功能不会替负责人自动确认答案，也不会自动生成历史任务的后继轮次。另一前端遗漏是把只读版本核对嵌套在“退回质检员”权限下：Sand 直接整改禁止再次退回，但仍需要读到新版来源和未整改题的阻断原因。维护账号具备 Sand root 身份，也不自动具备供应商本空间负责人资格。

**How to apply:** 先核对部署 SHA、镜像和 Ready，再逐条读取旧 RT 状态、合法后继、全量检查项和负责人实际预览。以真实本空间负责人校验，不把维护账号的 REVIEW_FORBIDDEN 认作业务故障。旧轮仍受冻结版本保护；预览允许也不是实际换版成功。保留未整改的不合格题及下游交接守卫，只读入口与写动作权限分别呈现；直接整改的后续操作继续沿原责任链。浏览器验收要检查入口能否发现阻断，不能只测试弹窗本身。

- 上线后的两条精确任务、石羽宁负责人页面和逐题只读证据：[生产验收记录](/Users/leslie/Documents/Playground/output/two-inspection-postrelease-20261019/report.md)。运行态事实沿该记录重读。
- 只读入口补漏及最终 CI 指针：[main PR #2622](https://github.com/world-sim-dev/sandai-data-smith/pull/2622)。本地真实组件夹具验收、生产页面验收和实际换版写入分别记录，不相互替代。


## 2026-10-19 换版复验的只读来源与标注编辑权限

**Why:** 负责人能核对最新版，不代表实际提交使用了同一权限路径。完整复验准备若复用只限当前标注持有人的答案整改解析器，会在停止旧轮次前报“标注整改不存在”；只测替身来源会漏掉这层真实权限边界。当前整改责任人、历史答案作者和实际执行维护操作的人也必须分别记录。

**How to apply:** 负责人换版准备使用已限定精确工作项的质检只读正式答案来源，保留负责人资格、版本比对、完整范围、待定、交接和原生恢复协议。普通标注整改继续检查当前持有人。回归要让持有人编辑解析器明确拒绝负责人，验证换版仍走只读来源，并验证准备期间来源再变化时写入前阻断。预检成功后仍须真实提交并独立读取旧轮次、合法后继和完成回执；失败先确认意图是否已落盘，重试沿用原冻结计划和请求身份。列出未整改题时按稳定工作项追当前持有人及正式处置，不能从历史作者反推接收人；若整改处于复验中，须先由当前质检员正式退回。

- [源修复、原生回归和受控 CLI 的 main PR #2624](https://github.com/world-sim-dev/sandai-data-smith/pull/2624)。实现沿 `LatestAnswerReinspectionService`、`SubmissionService.resolve_items` 的 `review_refresh` 与 `app.cli.latest_answer_reinspection` 查，普通标注编辑解析接口权限未放宽。
- [本次精确操作与逐题责任证据](/Users/leslie/Documents/Playground/output/latest-reinspection-apply-20261019/report.md)：实际结果、代码指纹、环境、冻结计划、原请求及独立回读沿记录核验；本页不保存现时执行成功或待办状态。


## 2026-10-19 未完复验换版的历史责任接续

**Why:** 旧复验可以同时携带多个历史整改单的正式授权。停止旧轮、保存最新版送审后，如果重提时只带新整改单，原生联合责任守卫会拒绝生成新待办；预览通过和送审已保存都不能说明闭环完成。已完成的整改责任与仍未结的共同责任也不能一起重新打开。

**How to apply:** 从旧不可变检查计划读取精确责任引用和版本，仅将同范围未结非祖先责任显式带入原生重提；已关闭责任排除，祖先责任保留至正常验收。恢复请求先固定到原生回执，按质量任务、旧轮次及请求身份隔离；每次重试使用同一送审、原意图和请求，不重算当前答案或静默扩大授权。回归同时覆盖未完复验再次换版、已关闭责任、祖先验收和跨轮次复用请求标识。实际完成须独立回读正式回执、新轮次和真实工作台；一次维护操作的代码指纹与常驻服务发布SHA分别记录。

- [main PR #2625](https://github.com/world-sim-dev/sandai-data-smith/pull/2625)：`LatestAnswerReinspectionService._resubmit_request`、原生回执及直接回归；代码、CI和合并发布状态沿PR查。
- 精确任务的新轮次、4张旧整改单、冻结请求、实际操作代码及逐题回读，查[维护交付记录](/Users/leslie/Documents/Playground/output/latest-reinspection-apply-20261019/report.md)。不在wiki复制现时成功状态。

## 2026-10-22 Caption 标注草稿与机标回退取证

**Why:** “全部变回机标”可能涉及正式版本、首次保存前的本机输入、另一题或原文显示模式。服务端两个版本未发生回滚，只能排除这两个保存点之间的正式回滚，不能据此认定用户没有输入。直接比较原始Caption JSON还会把地点/场景/主体的结构迁移误算为文字修改。

**How to apply:** 先固定本人账号、整改冻结工作项、题号和答题卡；以当次部署的规范化`payload.baseline.caption`逐字段比较正式版本，并分开统计帧对齐与文字。核对执行回执、结构操作before/after和原生返修编辑入口、execution.fields的精确正文；跨Pod只读一致仍不等于本人页面一致。原设备草稿按当次源码键读取localStorage、当前标签页sessionStorage和大记录IndexedDB；仅读指定任务/账号/答题卡，不新建缺失数据库、不清理存储、不请求保存或提交。先导出备份，再决定任何恢复动作。

- [吴安银本次只读排查与定向浏览器导出方法](/Users/leslie/Documents/Playground/output/wuanyin-caption-revert-20261022/report.md)：保存链、规范化差异、切点操作核对、两个实例原生读取及未决浏览器现场。该记录未确认回退触发根因，当前保存/恢复状态沿报告脚本核验。
- 当前实现指针：`useAnswerAutosave.ts`、`autosaveStorage.ts`、`largeDraftStorage.ts`、`largeBrowserRecords.ts`、`Answering.tsx`及`AnswerExecutionService.snapshot`。日常本机草稿与业务动作正式回执的边界按部署SHA复核，不把管理员观察页当作本机草稿。
