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

## 2026-10-19：修复、main 更新与容量证据边界

- [main 评审 PR #2623](https://github.com/world-sim-dev/sandai-data-smith/pull/2623) 与 [复审修复测试 PR #2621](https://github.com/world-sim-dev/sandai-data-smith/pull/2621) 是后续修复和最终验证的入口；不从本页推断合并或生产状态。
- **Why:** 只补页面入口会遗漏后台持久意图恢复；更新 main 时，新业务写口可能在原审查后出现。**How to apply:** 沿 Quality runtime 的实际组合检查新增命令，换版复验需同时覆盖 submit、prepared.submission 身份的恢复及直接换版退回；测试应检查真实安装的声明列表，不能只单独验证绑定器。
- **Why:** 读取已完成回执虽然不创建包，也可能绕开原有的权限和读一致性合同。**How to apply:** 主任务恢复在包写准入前读取固定回执时，保留 Leader、执行器租约和发起人当前权限校验，再将未完成的后续写入包在同一参与登记内。
- **Why:** 同一新版本的正常/混合负载只回答“终止是否额外干扰”，不回答“新屏障相对旧版本增加多少开销”。**How to apply:** 单列版本对照、热/冷包、多执行器、大包和时长维度；入口关闭仍运行既有屏障，不能称为无后端影响。真实测量的 SHA、规模、时长与尚未覆盖范围放 PR/验收记录，避免把小包单 Pod 短测写成生产容量承诺。

## 2026-10-19：包可交付与主任务汇总分开核验

- **Why:** 终止控制按执行包隔离，主任务的完成率与交付范围却是不同读取路径；正常包可交付不能推导主任务统计会自动完成。**How to apply:** 同时检查 [MasterProgressReader](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/platform/backend/app/repositories/master_progress.py)、主任务状态 reducer 与交付排除规则；统计分母和展示语义沿 [终止协议](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/docs/subsystems/package-termination.md) 核对，不把历史总量静默改成有效范围。
- **Why:** 停用数据库账号不一定令已缓存的旧会话立即失效。**How to apply:** 临时身份清理先核对状态及会话版本，再在 JWT 尚未过期时验证真实 HTTP 拒绝；鉴权正缓存 TTL 和失效路径沿 [AuthService](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/platform/backend/app/services/facts/auth.py) 复核，不用自然 JWT 到期冒充撤销成功。

- **Why:** 多人集中在少数包的短间隔压测会保持热登记，可能漏掉真实人工长时间作答后的反复冷登记。**How to apply:** 沿 [PackageControl 的空闲退役与登记路径](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination/sand-eval/platform/backend/app/infra/package_control.py) 对照作答间隔，分别测试多包低频提交、热包与初次冷启动；不能只按服务启动时的一次性成本解释登记开销。

## 2026-10-19：生产迁移与持续观测入口

- [生产合并与评审 #2623](https://github.com/world-sim-dev/sandai-data-smith/pull/2623) 和 [合并树 Gate / 生产发布](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39248630799) 是实际发布状态入口；合并、镜像构建、执行器就绪和业务健康分别核验。
- **Why:** 发布 schema gate 只读，不会自动补建控制表；旧生产镜像也可能不认识新迁移。**How to apply:** 先按已审核迁移及固定候选镜像的原生 allowlist CLI 应用唯一迁移，使用无生产 Service 标签的临时执行环境；保存 SQL 内容哈希和目标核对，另一个生产连接回读列、主键和初始行数，完成后清理临时资源。超时或部分结果先独立查库，不通过重跑全部迁移或修改旧 Pod 应用源码来解决。
- **Why:** 发布前已经存在的慢请求或 5xx，以及同期其他 main 修复，会影响上线后的因果判断。**How to apply:** 发布前冻结完整 SLS 时间窗，按真实 SHA、路由和方法保留样本数及分位数；发布后确认每个写执行器版本，再比较相近窗口和负载。保留低样本与滚动期间的限制，并继续检查控制表未知占用和正常包成功流转。具体查询契约见 [性能观测](https://github.com/world-sim-dev/sandai-data-smith/blob/main/sand-eval/docs/subsystems/performance-observability.md)。

## 2026-10-19：HTTP 健康与持久占用增长分开判断

- **Why:** 后台恢复会收拢部分异常，前台没有 5xx、延迟回落，也不能证明新的持久准入占用没有持续累积；旧质检阻塞与新的控制层未知结果可以同时存在。**How to apply:** 联查操作类型、执行器实例、登记数/未决操作数、增长速率与保护上限，再按原业务回执区分旧阻塞和新增控制层影响。未知登记不会自动过期，入口关闭也不停止写屏障；出现增长时保持入口关闭，不按时间或 Pod 消失强清。当前窗口和未决根因沿本机 `Documents/Playground/package-termination-acceptance-20261019/production/RELEASE-OBSERVATION.md` 与 [PR #2623](https://github.com/world-sim-dev/sandai-data-smith/pull/2623) 查，不从本页推断最新数量或健康状态。
- **Why:** 常规 Web Deploy 不会升级独立 generation Worker，而它也共享 HoloClient 的生命周期。**How to apply:** 核对各执行器的实际导入闭包与拥有者发布合同，沿 [生成工作区上线 runbook](https://github.com/world-sim-dev/sandai-data-smith/blob/main/sand-eval/docs/operations/video-generation-workspace-rollout.md) 在空闲时通过原生 `--generation-worker-only` 完成独立滚动，核验实际镜像和 Ready 稳定性；不要把 Web Gate 成功视作所有执行器已升级。
- **Why:** 发布前后几个短采样窗口之间可能恰好遗漏错误峰值；新 Pod 恢复、Web 内存正常与连接池不饱和，也不能排除共享数据库的查询总内存超限。**How to apply:** 每轮核对 from/to 连续性并补查间隙，按请求 ID、数据库错误类别与时间归并真实影响；分别记录 DB 查询内存、Pod RSS、池等待及后台持久占用，未定位重查询前不把内存错误归因于新屏障或滚动退出。该次补查的请求与异常证据继续沿本机生产观测记录核验。
