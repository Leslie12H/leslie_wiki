---
name: sandeval-package-termination-validation
type: reference
created: 2026-10-19
updated: 2026-10-20
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

- **Why:** 后台恢复会收拢部分异常，前台没有 5xx、延迟回落，也不能证明新的持久准入占用没有持续累积；旧质检阻塞与新的控制层未知结果可以同时存在。**How to apply:** 联查操作类型、执行器实例、登记数/未决操作数、增长速率与保护上限，再按原业务回执区分旧阻塞和新增控制层影响。未知登记不会自动过期，入口关闭也不停止写屏障；尚未开放时保持入口关闭，已获用户授权开放则只读告警并交由其决策，不自动改开关，也不按时间或 Pod 消失强清。当前窗口和未决根因沿本机 `Documents/Playground/package-termination-acceptance-20261019/production/RELEASE-OBSERVATION.md` 与 [PR #2623](https://github.com/world-sim-dev/sandai-data-smith/pull/2623) 查，不从本页推断最新数量或健康状态。
- **Why:** 常规 Web Deploy 不会升级独立 generation Worker，而它也共享 HoloClient 的生命周期。**How to apply:** 核对各执行器的实际导入闭包与拥有者发布合同，沿 [生成工作区上线 runbook](https://github.com/world-sim-dev/sandai-data-smith/blob/main/sand-eval/docs/operations/video-generation-workspace-rollout.md) 在空闲时通过原生 `--generation-worker-only` 完成独立滚动，核验实际镜像和 Ready 稳定性；不要把 Web Gate 成功视作所有执行器已升级。
- **Why:** 发布前后几个短采样窗口之间可能恰好遗漏错误峰值；新 Pod 恢复、Web 内存正常与连接池不饱和，也不能排除共享数据库的查询总内存超限。**How to apply:** 每轮核对 from/to 连续性并补查间隙，按请求 ID、数据库错误类别与时间归并真实影响；分别记录 DB 查询内存、Pod RSS、池等待及后台持久占用，未定位重查询前不把内存错误归因于新屏障或滚动退出。该次补查的请求与异常证据继续沿本机生产观测记录核验。


## 2026-10-19：生产入口配置与 CI 证据口径

- [入口开关配置 PR #2631](https://github.com/world-sim-dev/sandai-data-smith/pull/2631)、[配置 PR Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39254950018) 与 [主干发布](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/39255185291) 是用户要求开放入口后的配置与生效核验入口；最新开关值和健康结论查本机生产观测记录，不把本页当运行状态。
- **Why:** 开关来自进程启动环境，ConfigMap 已写或 PR 已合并不代表四个 Web 进程都已经生效；纯 release 配置的绿色 Gate 也可能按分类跳过应用测试。**How to apply:** 通过拥有者的配置 PR 与原生发布滚动，逐个回读实际 Web settings、镜像与就绪，再只读验证现有管理员资格和列表；报告实际执行的 CI jobs，把原功能完整验证与本次配置验证分开。用户明确开放入口不表示可以核销历史未知登记，也不意味着风险已解除。

## 2026-10-19：数据库资源与入口身份取证

- **Why:** Hologres 快查询按 calls 聚合，数据库累计峰值内存与 Web RSS 不同，按日志行数或把峰值相加会误判屏障成本。**How to apply:** 按 [官方查询日志定义](https://www.alibabacloud.com/help/en/hologres/user-guide/query-and-analyze-slow-query-logs) 加权 duration/cpu，保留 NULL；生产 digest 的 SQL 文本与源码生成文本做哈希绑定，再分开检查旧 summary metadata、leader candidates、handoff recovery 与新增控制条件。只读 EXPLAIN 对照不替代版本运行对照。实际样本和结论查本机 `Documents/Playground/package-termination-acceptance-20261019/production/PERFORMANCE-INVESTIGATION.md`，本页不存运行状态。
- **Why:** Sand 根空间成员拥有普通导航能力，数据包终止另查显式平台管理员标记。**How to apply:** 联查 [administrator](https://github.com/world-sim-dev/sandai-data-smith/blob/51216a296c3ecaf60e361a735675b0028b125060/sand-eval/platform/backend/app/services/facts/package_termination.py)、capabilities 与 QualityManagementPage，核验账号 active、显式标记、有效根空间、非代入会话和运行开关。不能仅凭角色名称、Settings 可见或员工空间归属判断资格；管理员名单只保留查询指针，不当作永久授权清单。

## 2026-10-19：后台准备与未知写入取证

- **Why:** 将只读记录读取和包锁等待也包进写参与登记，会让准备失败或等待取消产生不必要的永久占用；真正写入结果未知又必须继续保护。**How to apply:** 沿 [修复 PR #2644](https://github.com/world-sim-dev/sandai-data-smith/pull/2644) 与 [仅用于测试的集成 #2640](https://github.com/world-sim-dev/sandai-data-smith/pull/2640) 检查 `_attempt` 准入边界，覆盖反复读取失败、等待取消、等待期间终止、真实写失败和兄弟包可写；不把该边界修复当作全部生产取消根因已解决。
- **Why:** SQL 取消日志与未知登记的时间相邻不等于客户端异常来源已明确；只看 main 池也会遗漏 leader/control 池。**How to apply:** 按源码 SQL 哈希、实际异常类型/SQLSTATE、执行器和原业务回执核对，按进程分别读 control/main 池；SQL 样本或 JSON 截断时在服务端提取固定字段，不以解析失败认定无异常。原生 CAS 简单成功/冲突场景不替代生产负载或取消路径。动态证据沿本机 `Documents/Playground/package-termination-acceptance-20261019/production/RELEASE-OBSERVATION.md` 查。

## 2026-10-19：明确取消后的进度 CAS 与错误夹具

- **Why:** 最后一条带旧版本条件的进度更新遭遇明确数据库取消时，后台下一轮业务恢复成功并不能自动结清原屏障登记；直接重放整个业务流程又会扩大副作用。**How to apply:** 沿 [测试修复 PR #2645](https://github.com/world-sim-dev/sandai-data-smith/pull/2645) 检查只重试单条原版本 CAS 的边界、次数上限与原有冲突重读；覆盖更新生效前后、终止交错、兄弟包在退避期间完成，以及通信失败/任务取消/显式事务不重试。不要从一次取消推断所有内部错误可重试，不自动清理旧占用，实际合并与发布状态仍查观测记录。
- **Why:** Hologres 可能以 57014 或主消息明确为用户取消的 XX000 报告取消；客户端错误类型与数据库原始错误应交叉核验。普通 Python 构造 asyncpg 异常会留下 `.message=None`，把 `str(exc)` 当作真实驱动字段会让分类测试失真。**How to apply:** 错误分类夹具用驱动 `PostgresError.new` 从 SQLSTATE/主消息恢复真实字段，同时测试相似文本但不同含义的内部错误保持原保护。源代码与测试入口沿上述 PR，不在本页复制实现。
- **Why:** 取消自有空闲连接未必影响下一条语句；取消诊断 SELECT 后 CAS 成功，也不等于已复现业务 UPDATE 取消来源。非管理员查询日志看不到其他账号操作，空结果不能排除外部取消。**How to apply:** 原生实验仅用隔离库私有表和本轮自有连接，记录源代码哈希、实际错误和清理回读；明确故障发生在哪一步，生产取消发起方另用有权限的审计证据定位。当前样本只沿本机观测记录查。

## 2026-10-19：被恢复逻辑捕获的嵌套写与测试选择口径

- **Why:** 嵌套写借用外层准入，只监视外层最终是否抛异常，会漏掉被业务恢复捕获的通信失败或取消，进而错误确认排空；外层记录 blocked 或正常返回不证明内层写已结束。**How to apply:** 沿 [联合测试 PR #2647](https://github.com/world-sim-dev/sandai-data-smith/pull/2647) 核对外层 token 保留首个嵌套未知结果、后续成功或业务拒绝不可覆盖、嵌套错误不会无限产生 token；保留独立子任务和正常兄弟包的隔离。以修复前失败、真实 AdvancementService 包装和原生私有控制表验收分别取证，不把本页当上线状态。
- **Why:** 仅改测试文件时，direct import 选择可能运行它的 importers，却没有收集该测试文件本身；绿色返回和总 passed 数不能代替新断言确实执行。**How to apply:** 对照选择器输出中的实际命令与 collected/具名用例，先用具名最小回归证明原行为失败；实现变更后再按正常选择器验证，并由最终完整 Gate 覆盖。具体实现沿 [选择器](https://github.com/world-sim-dev/sandai-data-smith/blob/main/sand-eval/platform/scripts/select_tests.py) 查，避免为补证据扩成无界全量本地测试。


## 2026-10-20：取消包装、时限预算与检查回写阻塞

- **Why:** 同一明确用户取消可能以 ORCA 表缓存 0A000 包装出现，而同为 57014 的语句超时具有不同预算含义；只按异常大类重试会扩大失败成本。**How to apply:** 沿 [最终测试 PR #2649](https://github.com/world-sim-dev/sandai-data-smith/pull/2649) 检查 SQLSTATE 与完整驱动主消息、真实查询样本和反例；仅对有证据的用户取消形式恢复，语句超时不重复整个时限。取消来源的跨账号审计与客户端有界恢复分别闭环，实际发布状态查本机生产观测记录。
- **Why:** GitHub run/check 字段与已完成 job 日志、实际部署可能矛盾，不能据 queued 就推断无 runner，也不能以完成日志替代仓库强制检查。**How to apply:** 固定 PR head/base/tree，交叉核对汇总任务需要的各检查结果、错误/取消/清理标志和实际镜像源码；普通合并若仍被 required checks 拒绝，保留证据请求 Actions 回写排障，不使用管理员绕过、不修改保护或伪造 check，不把早一版已安装镜像冒充最终补丁验收。动态状态沿上述 PR 及本机 `Documents/Playground/package-termination-acceptance-20261019/production/RELEASE-OBSERVATION.md` 查。


## 2026-10-20：轮询失败隔离与大批次占用

- **Why:** 逐包轮询遇到一个损坏登记或退役失败就退出，会饿死后续正常包的排空确认；单包锁独立不足以证明轮询也独立。**How to apply:** 沿 [轮询修复与回归](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination-risk-repair/sand-eval/platform/backend/app/infra/package_control.py) 核对单包与状态批次分别隔离，其他包继续，末尾仍报告原错误，失败占用不核销；分别验证A缺失、A退役失败、跨批次读取失败及取消仍传播。不把模型复现当生产已发生。
- **Why:** Hologres客户端SQL模板很短，绑定大JSON参与表达式拼接时仍可能在服务端展开超过查询派发上限；这种XX000不等同于用户取消，增加重试无法修复。**How to apply:** 沿 [占用CAS修复](https://github.com/world-sim-dev/sandai-data-smith/blob/codex/package-termination-risk-repair/sand-eval/platform/backend/quality/infrastructure/persistence/inspection_work_claim.py) 对比真实错误与隔离私有表原生复现；若使用已读payload整体替换，必须保留其他元数据、相同版本条件、冲突重读和整批原子性，不拆成半批占用。额外评估完整owners的序列化/传输成本，不能宣称无新增SQL即零性能成本。
- **Why:** 测试集成可能缺少生产已有模块；只加入一个未被调用的新文件、或只跑其单元测试，会制造业务链路已验收的错觉。**How to apply:** 同时核对模块、实际调用方、夹具和镜像安装哈希；delete/modify冲突先查主线是否存在真实模块，不直接复活测试分支刻意删除的功能，也不将test历史带回main。具体复现、两项修复及动态门禁状态查本机 `Documents/Playground/package-termination-acceptance-20261019/production/REVIEW-ROUND2.md`。
