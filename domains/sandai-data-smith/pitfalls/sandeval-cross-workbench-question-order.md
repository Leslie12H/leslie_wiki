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
