---
name: sandeval-dashboard-package-termination-scope
type: pitfall
created: 2026-10-20
updated: 2026-10-20
tags: [sand-eval, dashboard, package-termination, scope]
links: [sandeval-package-termination-validation]
---

# 看板终止筛选与数据包终止的对象边界

**Why:** 主任务和执行数据包有独立的控制状态。页面开关叫“排除已终止任务”时，不能仅从名称推定它也排除了已终止的数据包；终止操作成功与统计范围改变需要分别取证。

**How to apply:** 先确定操作对象及执行任务 ID，核对包控制的最终状态，再检查列表与汇总读取的是哪个对象。混合主任务只终止部分包时，不应通过修改整个主任务状态来凑统计结果。若改变看板范围，先明确正常兄弟包、全部包终止、终止处理中和未开启排除时的口径，再改列表、状态数量与卡片，并核对正式终止回执。

## 2026-10-20 排查指针

下列为源码核对入口，采用 main 提交 `c7a9b416c` 的快照；后续实现与生产部署须重新核对：

- [主任务筛选与汇总仓储](https://github.com/world-sim-dev/sandai-data-smith/blob/c7a9b416c/sand-eval/platform/backend/app/repositories/dispatch_masters.py)：查看 `_master_filter_sql` 和 `dashboard_summary` 的 `exclude_terminated` 条件，以及汇总选取执行包的范围。
- [执行数据包控制](https://github.com/world-sim-dev/sandai-data-smith/blob/c7a9b416c/sand-eval/platform/backend/app/infra/package_control.py)：查看 `TABLE`、`_cas`、`_terminal`，核对控制对象和最终状态的写入位置。
- [终止及统计契约](https://github.com/world-sim-dev/sandai-data-smith/blob/c7a9b416c/sand-eval/docs/subsystems/package-termination.md#主任务交付)：核对数据包终止是否改变主任务状态和原计划进度，以及统计与交付是否采用相同范围。
- [前端参数传递](https://github.com/world-sim-dev/sandai-data-smith/blob/c7a9b416c/sand-eval/platform/frontend/src/pages/dataDashboard/api.ts)：核对列表和汇总是否同时传递开关，避免仅凭显示数值判断缓存。

初次截图只证明数值未变化；2026-10-20 后续已按用户要求，从最近一次终止时间反查生产日志与持久记录，再精确复现截图筛选。取证不依赖用户手工提供任务 ID。未修改业务代码或生产数据。

## 2026-10-20 生产证据接续

- 本机只读证据入口：`/Users/leslie/Documents/Playground/output/sandeval-dashboard-termination-20261020/evidence.json`。包含终止接收/完成时间、原请求和执行任务 ID、主任务状态、两次截图对应的汇总 GET 参数与 HTTP 状态、SLS Complete 覆盖确认，以及同筛选下的正式仓储只读计算。具体时间、数量、状态及部署 SHA 以该次取证为准，后续重新查询。
- 重算字段中 `readonly_proposed_exclude_completed_packages` 是只读 SELECT 预估，不是已部署修复；仓储中的验收字段需由 API 进一步补充，本次证据主动省略未补充的验收零值。
- 验证顺序：按终止请求发现对象 → 核对控制表完成状态及占用 → 反查主任务 item 及包题数 → 对齐截图时刻的真实汇总 GET → 复现截图数值 → 只读计算仅排除最终 terminated 包的差额。stopping 包另列，不能当成终止完成，也不能用 HTTP 200 代替领域完成状态。

## 2026-10-20 包级排除的实施入口

用户明确要求将终止排除改为数据包维度。实现与验收状态沿[测试 PR #2689](https://github.com/world-sim-dev/sandai-data-smith/pull/2689)核对；[独立任务分支 Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39439681747)只验证该任务提交，不等于测试分支集成、部署或浏览器验收。

**Why:** 修改汇总而保留整行的原进度和质检分母，会造成排序与页面数字不一致；修改主任务状态又会误伤正常兄弟包。

**How to apply:** 沿 PR 的当前契约与回归核对剩余包投影、全部包终止后的主任务隐藏、未下发草稿、同执行项筛选、缺失进度和分页前排序。测试分支历史冲突独立处理，不把 test 合入功能分支来取得验证；生产是否已生效沿正式 main 发布链核对，不从此页推定。

最终提交与 CI 采用情况查 PR 最新 head 和上述独立 Gate，不复用首轮失败回执。首轮结算测试的 loading 按钮名称竞态采用具名测试等待修正，参照[Ant Design 加载退场](../../../disciplines/testing/antd-loading-accessible-name-race.md)；不修改结算产品行为，也不以具名文件本地通过冒充完整 CI。

## 2026-10-20 默认关闭路径的执行计划审查

**Why:** 新筛选只在开启时提前分页，公共列表重写却也影响关闭筛选的默认路径；SQL 值正确与扫描范围受控需要分别审查。Gate 的合成回归可以通过，但不能证明 Hologres 会把分页下推到复用 CTE。

**How to apply:** 对同一主任务列表入口分别捕获开关开/关与普通/指标排序的真实仓储 SQL，使用只读 `EXPLAIN` 对照原基线。检查共享执行项 CTE 的构造范围是否已经受当前页约束，不把计划估计行数或 cost 当作真实扫描量、耗时或生产影响实测。

- 审查对象和结果沿[PR #2689](https://github.com/world-sim-dev/sandai-data-smith/pull/2689)的对应提交核对；本机证据入口为 `/Users/leslie/Documents/Playground/output/sandeval-dashboard-termination-20261020/review-9cbfdde1e/review.json`，相邻文件保存四份 Hologres 计划及捕获的 SQL。
- 该轮审查只读，报告默认关闭路径的分页前中间集合扩大风险，未在本轮修改业务代码，也未实测响应耗时；是否已经修复，继续核对 PR 后续提交与执行计划。


## 2026-10-20 main 发布与修复复核

**Why:** 包级筛选影响关闭开关时共用的列表路径；分页边界修复必须随最终发布提交一起验证，不能复用修复前 Gate 或把测试分支冲突当作功能失败。

**How to apply:** 普通排序在两种开关状态下都先分页；关闭筛选的完成率排序使用原缓存先分页；开启后的完成率与质检排序按剩余包指标确定顺序。沿 [main PR #2692](https://github.com/world-sim-dev/sandai-data-smith/pull/2692)、[最终 PR Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39443431868)及[main 发布工作流](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39444035183)逐层核对，生产结论读取本机验收回执，不从合并状态推断。

- 干净 main 分支只挑入本任务原始提交及 review 修复；测试 PR #2689 已被 main PR 替代，不把测试分支历史带入开发或发布。
- P2 修复后的只读计划入口：`/Users/leslie/Documents/Playground/output/sandeval-dashboard-termination-20261020/main-fix-explain.jsonl`；持久验收证据目录：`/Users/leslie/Documents/Playground/output/sandeval-dashboard-termination-20261020/`。核对共享执行项集合构造前的分页节点；计划验证不代表真实延迟压测。

- 正式仓储验收入口：证据目录下 `acceptance-checks.json`、`postdeploy-acceptance.jsonl` 与 `predeploy-summary.jsonl`。验收比较同一筛选范围的新旧读数，同时单独核对关闭开关的完整历史范围；旧开关也会排除整条终止主任务，因此不能把“关闭→开启”的全部差额都归给新增的包级过滤。验收字段通过 API 使用的正式验收仓储补齐后再解释，不能把摘要仓储占位零值当成事实。
