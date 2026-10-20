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
