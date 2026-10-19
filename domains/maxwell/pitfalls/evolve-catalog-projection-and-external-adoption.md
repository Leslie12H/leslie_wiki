---
name: evolve-catalog-projection-and-external-adoption
type: pitfall
created: 2026-10-19
updated: 2026-10-19
tags: [maxwell, evolve, benchmark, scoring, studio]
links: [evolve-native-routing-vs-candidate-runner, evolve-inline-metrics-catalog-visibility]
---

# 目录投影、外部评分声明与独立关联的边界

**Why:** 后台保存了逻辑执行器归属，不代表每个新版目录都已经按归属聚合；外部评分服务可真实输出指标，也不表示它已经成为可按精确修订关联的独立评估器。两种目录各自为空或重复，可能是页面投影/采用路径缺失，不能据此删除历史数据或伪造资产身份。把深层材料层层排成左右双列，会使正文逐级变窄，最终逐字换行。

**How to apply:**

- 接入对象沿 `executor/executorRouting.ts` 和 `v3/library/objectDirectoryModel.ts` 核对显式 `logicalExecutorRef`；保留物理连接详情与历史 Work/Run 冻结路线。不要按名称归并，也不要仅隐藏候选连接而破坏其引用。
- 外部指标沿 `library/externalEvaluatorAdoption.ts`、`EvaluatorPublicationStore.ts` 与 `CaseMetricAssociations.tsx` 核对显式采用：固定方法版本、输出定义与配置，使用已有原子资产发布形成真实身份，再保存独立关联。读取目录不得创建资产；未知结果重试沿用原请求与原修订。
- Benchmark 目录生命周期与冻结版本分开，沿 `application/commands/benchmark_catalog.go`、PostgreSQL 同名文件和 0041 迁移检查：业务权限、人类管理边界、目录 CAS 与原回执同事务、归档过滤在分页前。归档后历史详情及结果仍按原身份读取。
- 预期与评分阅读先呈现指标和通过条件，完整参考材料按需展开；`StructuredValue` 的嵌套对象采用完整宽度，长规则分段，技术版本可折叠。必须在真实页面检查窄屏与刷新，不以 JSX 或截图生成成功代替视觉核对。

2026-10-19 本地实施、确认范围、独立工作树与真实验收查 [六处修复记录](/Users/leslie/.codex/worktrees/evolve-six-fixes-1019/maxwell-ai/docs/verification/2026-10-19-evolve-six-fixes.md)。代码分支 `codex/evolve-six-fixes-1019`，初始实现提交 `904097740dea17f9d100d36d6d27975009dc2367`；发布任务 [39194487591](https://github.com/world-sim-dev/maxwell-ai/actions/runs/39194487591)。当前发布/归档状态及十题终态必须回到该记录与实际服务刷新，本页不保存易变结果。


## 2026-10-19 完整审查与取消清理

**Why:** 目录把多个物理连接合为一个对象后，如果健康状态和筛选仍只看主连接，会隐藏候选路径故障。未知写恢复入口若依赖实时服务目录，目录故障又会阻断原请求恢复。远端取消沿用已取消的父 context 会在发出 HTTP 请求时立即中断；只等待 HTTP 接收回执又不能证明执行已停止。

**How to apply:**

- 沿 `objectDirectoryPaths` 检查名称、类型和状态筛选与每条路径展示，不按主连接健康替代整个对象。
- 目录写的 409 是否能解除未知态，取决于服务是否先查不可变回执、后做 CAS；不得把这个结论泛化到先检查当前依赖的其他写接口。恢复外部采用应直接使用已保留声明和原请求，不等当前 Provider 目录。
- 沿 EVOLVE `application/evaluation/live.go` 与 `app/integration/maxwellexecutor/cancel.go` 核对：只让远端清理脱离父取消，取消和证据读回共用有限期限；停止接收回执跨重启保留，模糊响应沿用原 actionId，终态必须独立确认。普通执行继续受原 context 控制。Runtime 历史列表会排除从未启动即取消的任务；空列表不等于已取消。该场景需校验 stop 响应的 Thread/Run 身份和终态，普通 ACK 仍不能替代终态。真实契约及反例测试沿 PR 中的取消恢复测试查验。
- 迁移必须同时核对 SQL、Job 挂载/参数和 CI ConfigMap 清单；用 `deploy/jobs` 的全迁移守卫验收，不能只运行迁移文件测试。

统一 main PR、审查补丁与发布核验入口：[maxwell-ai PR #367](https://github.com/world-sim-dev/maxwell-ai/pull/367)。按用户交付要求通过 main 发布，不继续单独部署功能分支；实时发布、报警和运行状态仍查 PR 与验收记录。


## 2026-10-19 main 发布与浏览器接续

**Why:** 浏览器自动化会话关闭后，用户现有 Chrome 仍可能保持正确登录；此时重复开空白登录窗口会增加无效操作。系统锁屏又会使原窗口无法前置、按键无效、AppleEvent 超时，不能误判为登录失效。

**How to apply:** 优先用当前可用的 `cua_repl` 检查并复用现有 Chrome；扩展连接失败时使用该工具的原生 Chrome 入口。2026-10-19 解锁后 AppleEvent 仍超时，而 `cua_repl` 成功完成归档和比较，所以锁屏不是所有自动化失败的唯一原因。工具明确报告锁屏时只要求解锁，不要求重新登录，不复制认证或开启持久 JavaScript 自动化安全设置。

统一交付已走 [PR #367](https://github.com/world-sim-dev/maxwell-ai/pull/367) → main → [dev 发布 39196828107](https://github.com/world-sim-dev/maxwell-ai/actions/runs/39196828107)；CI、迁移和部署以这两个外部回执核对。后续归档、十题与报警结论查 [本轮独立读回记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-six-fixes-1019/final-acceptance.json)，不能以发布成功代替业务验收完成。


## 2026-10-19 取消错误分类需贯穿监控输出

**Why:** HTTP/API 层将请求取消分类为 499/WARN 后，通用监控完成事实仍可能按所有 4xx 写入 failed，物理日志 Sink 又将 failed 输出为 ERROR，造成同一取消请求同时有正确分类与误报。只核对 API error 日志会漏掉第二条输出。

**How to apply:** 沿 `foundation/observability/httpaccess` 的正式完成事实和 `platform/monitoring/slog` 的落地日志一起回归；只有 HTTP 499 且请求 context 确实已取消时分类为 canceled，保留请求关联与延迟，不把正常取消伪装为成功。真实 5xx 即使伴随断连也仍是 failed，原因不明的 499 和其他 4xx 不一并降级。回归覆盖 Gin → 校验 Recorder → 真实日志 Sink，部署成功与真实取消/SLS 报警解除仍分别验收。

最小补丁、CI 与 main 合并查 [PR #369](https://github.com/world-sim-dev/maxwell-ai/pull/369)，实际 dev 发布查 [39198987832](https://github.com/world-sim-dev/maxwell-ai/actions/runs/39198987832)；运行、归档与真实取消结论继续查本页上方的独立读回记录。


## 2026-10-19 NAS 文件锁不等于跨节点互斥

**Why:** API 取消与 Worker 观察位于不同 Kubernetes 节点，NAS 的 `local_lock=all` 只提供同一客户端文件互斥。另一节点可用旧检查点覆盖已写入的取消标记；本轮真实取消后四份记录中一份取消标记未保留。数据库 CAS 阻止旧 Worker 继续推进，却不能修复共享文件覆盖；正常取消又触发 stale claim 的租约丢失误报。

**How to apply:** 不以单机多进程测试替代不同节点核验；检查节点、挂载语义及同一 Attempt 的检查点。Linux [nfs(5)](https://www.man7.org/linux/man-pages/man5/nfs.5.html) 明确 `local_lock=all` 的本地限制。沿 `foundation/database/advisory_lock.go` 和 app 装配注入 PostgreSQL 事务互斥，覆盖 Dispatch/Observe/Cancel 的完整读改写，使用有上限的独立连接池；锁不可用时不写共享记录，释放不延长请求期限，无需新表或配置。正常取消可安全退出 stale claim，但保留替代 claim 的所有权错误。回归真实 PostgreSQL 排他、等待取消、父取消及连接终止后的释放，再在两个实际 Pod 上读回。

EVOLVE `remote_running` 可能仍在恢复文件；运行中停止验收必须先确认原生 `CurrentRunID` 存在，再核对停止回执、实际终态与幂等，不把未启动即取消算成运行中停止。实现与发布查 [PR #370](https://github.com/world-sim-dev/maxwell-ai/pull/370)；真实结果沿本页独立读回记录，区分两轮质量评分和取消技术用例。


## 2026-10-19 运行发现、监控与实验趋势分工

**Why:** 业务内记录页即使存在，如果主导航没有入口、路由又高亮为 Benchmark，用户仍无法发现独立运行；业务内“全部”也不能代表跨业务进度。把取消终态数解释成已评分、将最新技术取消运行作为质量主结果，会同时误导进度和趋势。仅将底部折线图移到首屏，仍不能回答改了什么、是否可比及哪些题退步。

**How to apply:** 从 v3/routes.ts、EvolveNavigation.tsx、catalog/RecordsPage.tsx 与 HTTP catalog.go 一起核对入口、范围和鉴权。全局运行发现关注执行/评分进度；Benchmark 趋势关注同口径实验；调优曲线关注候选迭代和固定基线，三者不要混算。取消记录保留可查，缺测不补零；诊断集与隐藏验收集分开。跨业务聚合必须是已有可读业务的交集，不以去掉业务过滤或前端扫描全历史代替服务端分页与权限。

讨论与本轮核验入口：[运行总览与趋势设计记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-candidate-loop-20261019/run-overview-and-trends.md)。该记录是建议与源码现状，不代表新界面已发布。外部产品以 [LangSmith 实验分析](https://docs.langchain.com/langsmith/analyze-an-experiment)、[实验比较](https://docs.langchain.com/langsmith/compare-experiment-results)、[Opik Dashboard](https://www.comet.com/docs/opik/tracing/dashboards/dashboards) 和 [调优结果](https://www.comet.com/docs/opik/development/optimization-runs/optimization/dashboard_results) 的官方文档为入口，能力会变化，使用时重新核验。
