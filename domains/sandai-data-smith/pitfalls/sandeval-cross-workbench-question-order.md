---
name: sandeval-cross-workbench-question-order
type: pitfall
created: 2026-09-28
updated: 2026-10-12
tags: [sandeval, quality, remediation, testing]
links: [sandeval-direct-remediation-and-batch-handoff]
---

# 同一标注批次跨工作台题号须冻结并保留历史映射

**Why:** 2026-09-28 测试环境直接整改中，同一批的 0:09 和 0:10 视频在标注端与 Sand 质检队列的显示次序不同。测试者按“第 1 题”跨界面定位，首次改了 0:09；Sand 下一轮看到真正退回的 0:10 仍是第 1 版。按素材重新定位并将 0:10 改为第 2 版后，Sand 复验才看到新答案。本次是测试定位误差；仅凭这次观察不能认定系统把答案交错。

**How to apply:** 跨标注、供应商质检与 Sand 质检核对整改时，以题目 ID、素材标识或视频本身作为关联键，记录答案版本和各轮质检报告；界面“第 N 题”只用于当前工作台导航。检查新答案时同时核对原问题对应素材、版本历史及 Sand 新轮次，避免把改错题误判为自动回交失败。具体样本和导出指针见 [Sand 直达整改核验入口](../refs/sandeval-direct-remediation-and-batch-handoff.md)。

**2026-09-29 生产复现：** `QT-6349e42ebb285ab0a726e873b75d729c` 的关小琪第 3 轮质检队列按视频分别是篮球、美妆、露营、徒步；姜姗姗同批整改单的“报告退回涉及的答案”却是徒步、篮球、露营、美妆。关小琪的整批退回意见以 `01–04` 编号，在整改详情每题旁原样重复，因此整改页题号不能用来解释这四段意见。按视频标识核对，四个视频仍能一一对应，没有从这次只读页面证据发现答案或逐题判断串到其他视频。生产页面入口见 `https://eval.sandaii.cn/quality/inspection?task=QT-6349e42ebb285ab0a726e873b75d729c&review=RT-0194cadc806756879750c6943ecf502e` 及同任务 `DISP-94d19337436558bd8bede69676bd30be` 整改详情；实时状态须重新查看。

**Why / How to apply：** 2026-09-29 当时主线的质检队列从 `sand-eval/platform/backend/quality/infrastructure/persistence/review_task_repository.py::queue_items` 按检查项 `item_id` 排序；本人整改预览和手工退回问题列表分别通过 `answer_correction_service.py::_read_state`、`disposition_issue_service.py::page` 读取送审成员，底层 `submission_repository.py::items` 按送审项 `item_id` 排序。两种 ID 的生成规则见 `quality/domain/inspection/review_task.py::FrozenReviewPlan.item_index` 和 `quality/application/management/submission_service.py`；它们不能充当跨页面题号。修复时保持按工作项/视频关联逐题判断，并让接收页呈现原质检位置或同源稳定顺序；不能只交换前端数组或用自由文本编号重连答案。


**2026-10-12 生产跨轮次复现：** 白马/香水样本 `QT-e7ccfef4a2da566eb2b8a9dddd40f989` 在供应商第 1 轮、Sand 第 1 轮、供应商第 2 轮、供应商第 3 轮的题号依次为 `2 → 1 → 2 → 1`。四轮持久化记录中的两条工作项身份保持一致；原 Sand 与当前供应商页面也显示同一条白马视频。截图中的“第二题”来自供应商王景茜于 2026-10-08 写下的第 2 轮整批退回备注，不是原 Sand 队列编号。本样本的 Sand 逐题意见按工作项正确对应白马；已确认的是队列编号与历史自由文本编号冲突，未发现这两题的素材、答案或逐题意见互换。原 Sand 页面指针：`https://eval.sandaii.cn/quality/inspection?task=QT-e7ccfef4a2da566eb2b8a9dddd40f989&review=RT-a6dbfbc6dcc0511b9e3262af687bd066&item=RI-d0e7623c9afe5a62a0d35f9076293182`；当前样本指针：同任务 `RT-261a5d7cb28c5d759fcee2527bfee64e` / `RI-4ce05869ac18578e840910df179d5507`。当前状态须重新读取。

**Why:** `FrozenReviewPlan._item_index` 用质检任务、送审及送审成员身份生成检查项 ID；新轮次的 ID 会变化，而 `ReviewRepository.queue_items` 按该 ID 排序并计算 `original_number`。该字段只表达本轮队列位置。`PreviousRoundPanel` 原样呈现旧整批退回意见，因此历史“第二题”会出现在当前第 1 题旁。2026-10-12 的部署源码与当次冻结 main 均包含此机制；源码与环境以后须重新核对。

**How to apply:** 先查编号原话的作者、退回处置及原轮次，区分 Sand 逐题意见与供应商转述。以工作项/素材身份逐轮建立题号映射；不能从“第二题”字样推断上游素材绑定。修复应继承冻结的原题顺序，并明确展示原轮次题号与当前题号的对应；验收覆盖换阶段、复验、新送审版本、抽样变化与分页。`original_number` 的名字不代表跨轮次稳定性。代码指针除上述后端入口外，还包括 `quality/application/inspection/review_query_service.py::queue`、`frontend/src/pages/quality/inspection/PreviousRoundPanel.tsx` 与 `ReviewWorkspace.tsx`。完整本次取证指针：`/Users/leslie/Documents/Playground/sandeval-question-order-20261012.md`；上述为初始生产只读排查阶段；修复与 TEST 验收指针见后文，生产没有写入或部署。


**2026-10-12 修复与 TEST 验收指针：** [main PR #2386](https://github.com/world-sim-dev/sandai-data-smith/pull/2386) 从干净任务分支直接指向 main；提交、Gate 与是否合并须查看 PR，不能从此页推断实时状态。测试发布证据见 [#2377](https://github.com/world-sim-dev/sandai-data-smith/pull/2377)、[#2380](https://github.com/world-sim-dev/sandai-data-smith/pull/2380)、转交兼容 [#2382](https://github.com/world-sim-dev/sandai-data-smith/pull/2382) 及 [完整部署流水线](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38232938184)。题号帮助与实际 TEST 截图见 [#2384](https://github.com/world-sim-dev/sandai-data-smith/pull/2384)。具体送审版本、退回单终态、源身份和图片存于 [验收报告](/Users/leslie/Documents/Playground/sandeval-question-order-20261012.md)。本次验收覆盖正式下发、个人标注批次、空间质检、负责人验收交接、Sand 抽样退回、供应商委派打回标注、浏览器只更新原第 5 题、新送审复验、负责人再次交接、Sand 新抽样复验及退回闭环。

**Why:** 每轮生成的送审项 / 检查项 ID 只能作为身份，不能作为来源排序。题号应随原标注批次冻结，抽样筛选保号；正文意见中的编号是历史当轮语义，无法安全自动改写。工作项与答案作者构成题号关联身份，防止同素材多作者相互覆盖。老答案经过转交后作者不等于持有人；老快照没有题号时，只能按经授权的稳定卡核实转交并保留未知标注号，不能套用接手人的题号。原质检轮次的位置仍可用来解释历史退回意见。

**How to apply:** Review 要连着检查标注来源批次、冻结内容、检查计划、队列分页、负责人展开、退回问题和整改预览；不仅检查不合格项，也检查原 Sand 入样但已合格的题及未入样题。现场验收同时核对工作项、原作者、答案版本、题号、逐题意见与整批历史映射；重新抽样允许改变集合，但同题编号不能重置。负责人验收和冻结包状态不等于正式交接：只有 owning service 的 package handoff 事实完成，Sand 才能安排新复验。业务验收与 Gate、部署镜像、可见页面和生产发布是独立证据。

**2026-10-12 真实数据库踩坑：** 队列查询同时选取当前 `review_item_id` 和来源成员同名字段，Hologres/asyncpg 返回值中来源空字段覆盖当前检查项 ID，队列连接因此为空；SQLite fake 读取首个同名字段使测试漏报。修复使用独立列别名，并增加真实 SQL 执行后检查返回列名唯一的回归。以后同时选取不同实体身份时，必须独立别名；契约测试不能仅 mock 一份去重后的 dict。


**2026-10-12 验收附带观察：** 已验收通过的只读质检页仍显示“未保存”，并拦截原标签页离开；新标签页可正常查看并返回本人。`ReviewWorkspace.tsx` 的脏状态和 `useUnsavedReview` 判定不在本次题序 PR 的改动行内。现象、源码和截图指针见验收报告；不能由此推断答案未持久化或题序修复引入了导航问题。**Why / How to apply:** 将只读页面提示、服务器提交结果和退回单终态分别核对；只读误报脏状态属于独立交互问题，须单独复现定位，不能为了离页重新提交已验收报告。


## 2026-10-12 题序修复的性能评审入口

**Why:** 冻结题号解决跨轮次顺序问题，但每页重建完整题序，以及旧成员按块重建派题批次索引，会让小页仍承担整批或整任务的工作量。真实五题业务验收与绿色 Gate 不证明大批次响应时间没有回退；输入参数规模也可能触及驱动边界。

**How to apply:** 以 [main PR #2386](https://github.com/world-sim-dev/sandai-data-smith/pull/2386) 的实际提交为准，沿 `quality/application/inspection/review_query_service.py::{queue_page,items_page}` → `quality/infrastructure/persistence/review_task_repository.py::{queue_members,queue_items}` 检查全量元数据、排序、摘要与 `VALUES` 输入是否在分页前反复构造。再沿 `quality/application/question_order.py::question_numbers` → `app/services/facts/task_assignments.py::annotation_question_positions` → `app/repositories/assignment_wave.py::{waves,members_by_wave}` 检查分块是否反复加载整任务批次；首次冻结和旧历史缺题号都须覆盖。参数上限按仓库实际锁定的驱动版本核实，不凭 PostgreSQL 通用印象推断。具体输入规模、官方驱动源码链接和证据边界见 [验收报告的性能补充](/Users/leslie/Documents/Playground/sandeval-question-order-20261012.md) 与 [输入规模证据](/Users/leslie/Documents/Playground/sandeval-order-proof-20261012/performance-shape.json)。该证据只执行原函数与内存协作者，不代表真实数据库执行或延迟；性能结论需在 TEST 同规模对齐执行计划、查询次数、冷/热路径和并发。复用冻结事实或请求内索引时，保持动态权限、当前检查范围与写入版本实时校验。历史性能核验规矩见 [检查读取与保存性能入口](../refs/sandeval-review-performance.md)。


## 2026-10-12 组合连续 Sand 修订继承的发布指针

题序修复与 [原修订继承 PR #2385](https://github.com/world-sim-dev/sandai-data-smith/pull/2385) 的原始开发提交组合，通过 [TEST 集成 #2389](https://github.com/world-sim-dev/sandai-data-smith/pull/2389) 和 [组合 TEST 部署](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38240793405) 验收，再经 [main PR #2386](https://github.com/world-sim-dev/sandai-data-smith/pull/2386) 发布；精确头 Gate 见 [38242605584](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38242605584)，main 发布见 [38243270210](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/38243270210)。动态状态须读取 PR、流水线与环境；完整证据存于上述验收报告的组合验收段。修订谱系背景见 [复验换版修订链](sandeval-sand-reinspection-summary-revision-amendment-conflict.md)。

**Why:** 顺序正确不能证明多次退回后有效答案仍正确；新汇总版本下，早期代改题与后来代改题可能需要继承不同 Sand 返回链。**How to apply:** 组合验收至少连续两次代改不同题，再分别经过供应商委派、空间复验、负责人正式交接；第三轮同时验证两题基线、可保存候选、原题号和历史意见。区分不改写的原始冻结引用与合法继承后的有效修订，封存前验证保存能力、封存后以只读报告和退回单核对闭环。本次真实五题链路、浏览器及两张 resolved 退回单是业务证据；不能替代大批次性能证明。


## 2026-10-12 抽样保号引发“质检题量增加”的误解

**Why:** 题序修复发布后，两份 100 题抽检页显示原第 632、770、893 题，用户以为突然需要检查接近 900 题或切成标注页面。只读回读固定检查项和来源投影、再以平台正式只读观察核验，显示变化来自原标注批次题号；实际各从 1,000 个送审成员抽取 100 个检查项，仍是 Sand 质检，既有判断保持原检查项身份。具体轮次、读数、代码归因和截图见 [验收报告的发布后反馈](/Users/leslie/Documents/Playground/sandeval-question-order-20261012.md) 及 [持久化与来源题号证据](/Users/leslie/Documents/Playground/sandeval-order-proof-20261012/production-sample-number-display.json)；实时进度须重新读取。

**How to apply:** 先区分显示题号、固定样本总数、已判断数和标注源批次数。以 review stage、冻结策略、送审成员及检查项计数证明是否真的扩样；不能由最大题号推算数量。抽样保号应显示“原标注第 N 题”，并保留独立“已检查 X/总样本数、剩余 Y”的进度说明。下方答案表单是质检上下文，须和上方质检判断及提交动作区分；不要为消除误解恢复 1–100 重编号，破坏跨标注、整改和历史意见的定位。该文案建议尚未实施，相关变更与发布从 PR 实时核对。
