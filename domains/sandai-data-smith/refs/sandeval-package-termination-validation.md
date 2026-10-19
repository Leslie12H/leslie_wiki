---
name: sandeval-package-termination-validation
type: reference
created: 2026-10-19
updated: 2026-10-19
tags: [sand-eval, package-termination, concurrency, validation]
links: [sandeval-package-transition-lock-regression-20261017]
---

# Sand Eval 数据包终止的隔离与验收入口

**Why:** 业务包 ID 不同不能证明物理锁与连接池隔离。单元测试通过也不能证明实际表结构、已聚焦富文本、原生质检和成果交付已经连通。

**How to apply:** 先核对下列代码与验收入口，再区分持久准入协议、原生业务闭环、浏览器交互和真实用户负载四类证据。发布状态与最新性能结论查 PR 和运行记录，不从本页推定已经合并或上线。

## 权威指针

- [测试集成 PR #2614](https://github.com/world-sim-dev/sandai-data-smith/pull/2614)：最终测试提交、完整 CI、测试部署和业务验收结论的入口。
- [干净功能分支](https://github.com/world-sim-dev/sandai-data-smith/tree/codex/package-termination/sand-eval)：从 main 派生的功能代码；测试集成历史不得作为 main 上游。
- [终止协议及交付排除](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/docs/subsystems/package-termination.md) 与 [操作/验收 runbook](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/docs/operations/package-termination.md)：状态、在途操作、未知结果、批量范围、恢复与验收序列。
- [状态查询与授权回归](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/platform/backend/tests/test_package_termination.py) 和 [浏览器操作区域](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/platform/frontend/src/components/PackageWorkBoundary.tsx)：真实表形状、可见性、查询次数与输入禁用的实现入口。

## 复用时检查

1. 遗留派题通过题目关联任务，测试夹具必须采用真实表形状。正常所属空间的状态轮询先做包元数据读取；跨空间持有人才核对派题历史。权限结果和查询计划都要验证，不能仅按 SQL 条数宣称优化。
2. 原生 disabled fieldset 不会阻止已聚焦 contenteditable 的继续输入。保留原草稿，实际按键验证终止后的富文本与快捷键；仅看按钮变灰不足以验收。
3. 并发容量必须使用独立账号、会话和全新题卡。单账号突发会触发既有限流，不能冒充多人容量；协议微基准也不能替代原生 HTTP 提交。
4. 独立 HTTP 客户端共用 transport 时，任一客户端退出都可能关闭共享池。仅覆盖 aclose 不一定覆盖上下文退出路径；为每个账号独立管理连接池，并先验证部分用户结束时其余用户仍能完成。
5. 连接中断后，按原 task/card/request ID 逐笔对账；未确认结果保留原请求内容，不另建 ID 重发。重跑容量使用新题卡，作废轮次保留失败原因与对账记录。
6. 专用来源身份变化时，重新走题型输入准备器生成冻结 baseline；不要改写既有不可变题面来制造测试材料。
7. 对齐部署 SHA、负载标签、正常/拒绝状态、p95/p99、吞吐与 pool/admission wait。混合负载变慢时先分层归因，不能以零错误宣布不影响正常包。

相关背景见 [共享表锁风险](sandeval-package-transition-lock-regression-20261017.md)。

## 2026-10-19：复审时补查失败与恢复路径

**Why:** 正常提交压测与 A 先终止再交付 B/C，不能覆盖业务拒绝异常、下发恢复和冻结后范围变化。屏障的异常分类或父流程的重放顺序会把局部拒绝放大成正常工作不可用。

**How to apply:** 沿下列固定审查版本查原路径，再核对当前分支是否已修复；不要从本页推定最新发布状态。

- [准入异常分类](https://github.com/world-sim-dev/sandai-data-smith/blob/0b47411b4d0404fc80fefcb204343a002ec94c0d/sand-eval/platform/backend/app/infra/package_control.py#L263-L276)：使用真实服务抛出的领域异常检查 404/409 与未知数据库结果。HTTP 转换发生在外层时，不能仅凭异常有没有 status 字段判断是否已写入或结果未知；反复拒绝后仍须验证正常用户可写。
- [主任务下发的子包准入](https://github.com/world-sim-dev/sandai-data-smith/blob/0b47411b4d0404fc80fefcb204343a002ec94c0d/sand-eval/platform/backend/app/services/facts/dispatch_masters.py#L527-L568)：覆盖 A 已有成功回执、B 尚未完成时终止 A，再恢复原发布操作；区分只读回执恢复与新增写入，并核对下发明细和质量登记的后续步骤。
- [交付范围重验](https://github.com/world-sim-dev/sandai-data-smith/blob/0b47411b4d0404fc80fefcb204343a002ec94c0d/sand-eval/platform/backend/app/services/facts/result_delivery.py#L249-L251) 与 [交付页面](https://github.com/world-sim-dev/sandai-data-smith/blob/0b47411b4d0404fc80fefcb204343a002ec94c0d/sand-eval/platform/frontend/src/pages/dispatchMasters/ResultDeliveryPanel.tsx)：先冻结再终止 A，既要验证旧清单被拒绝，也要验证用户能保留旧记录并从页面重新预览、冻结仅含正常包的新清单。刷新自动恢复旧 sessionStorage 不是重建路径。
