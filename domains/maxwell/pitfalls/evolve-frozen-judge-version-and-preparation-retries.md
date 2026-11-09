---
name: evolve-frozen-judge-version-and-preparation-retries
type: pitfall
created: 2026-11-09
updated: 2026-11-09
tags: [maxwell, evolve, nextplay, judge, recovery]
links: [evolve-nextplay-ten-case-acceptance-20261015, evolve-workspace-implementation-20261015]
---

# 冻结评分版本失联与准备任务重试

**Why**

冻结的外部评分方法按 Provider ID 和版本精确解析。Provider 登记健康只证明当前版本被发现，Nextplay 会在真实调用中核对请求版本。在单版本登记模型中，部署覆盖后，旧版本可以在资源已封存、Run 尚未创建时失联。只调整接纳错误文案会保留后台重试，Work 的版本号也会因 Worker 领取和写回状态而持续增加。

**How to apply**

- 只读按业务核对同一 Work 的准备状态、冻结 JudgeSpec 和 Run 列表，再核对 Provider 当前登记版本。用两次 Work 版本及更新时间读回判断状态是否仍在写入，用日志或部署代码解释写入原因。当前声明、带鉴权的 `/describe` 和真实 Trial 的评分回执分开验收。历史现场查 [2026-11-09 交接](/Users/leslie/Downloads/261109_handoff_nextplayJudgeVersion.md)。同日复核可从 [Dev Studio 原 Work](https://agent.sandaii.cn/evolve/tasks/wrk_ab2314ac6667a38c645d483754814205/results?businessId=ad3d5c4b-c7c9-4ed3-b15d-4f3556520263) 进入，读取现有 Work、Run 列表和评分服务详情，发布前后重查。
- 平台应对确定的精确版本缺失停止高频自动重试，保留封存原件与历史引用，暂时的目录或网络故障另行退避。复用已有 `preparation.failed` 会退出 Worker 扫描，也会失去恢复原版本后的自动接续。需要接续原 Work 时，应另外定义显式恢复，并沿用原请求幂等键和冻结引用。核对 [#386 的行为与回归](https://github.com/world-sim-dev/maxwell-ai/pull/386) 以及 [EVOLVE Worker 发布记录](https://github.com/world-sim-dev/maxwell-ai/actions/runs/42351891658/job/128342550037)，分清文案修复与重试终止。
- 若必须复现旧口径，恢复对应版本的真实实现和按版本路由，先查真实评分回执。沿用当前口径时创建新 JudgeSpec 和 Benchmark 修订，并逐题确认有效绑定及 CaseSet/Split 范围，再以单题真实出分验证。新版分数另行归档。Nextplay 的版本来源及请求校验可查 [评分接口实现](https://github.com/world-sim-dev/nextplay-eval/blob/cad5f5f8c563b7d2388c69fed03a319a46402792/eval-service/src/eval_service/grading.py#L72-L79)，历史资产采用边界见 [Nextplay 十题验收入口](../refs/evolve-nextplay-ten-case-acceptance-20261015.md)。

## 2026-11-09 Work 修订号、服务构建与评分口径

- Work 是平台在 Run 创建前保存准备状态、原件引用及幂等身份的载体。Work.version 是并发写入修订号。逐次评测的评分口径沿 JudgeSpec 和逐题有效绑定核对，独立于 Work.version。要用新标准重评旧执行时，先检查已有证据是否覆盖新要求，再保存独立的重评分记录。
- Nextplay 的 `providerVersion` 来自评测服务构建 Git SHA。查 [版本自述实现](https://github.com/world-sim-dev/nextplay-eval/blob/cad5f5f8c563b7d2388c69fed03a319a46402792/eval-service/src/eval_service/api.py#L333-L343) 与 [实现差异](https://github.com/world-sim-dev/nextplay-eval/compare/afd04ce1ebfa8a5f437ca8eb1aa88d33ade38903...cad5f5f8c563b7d2388c69fed03a319a46402792)，将构建身份和影响得分的变化分开核验。2026-11-06 的 [Nextplay #27](https://github.com/world-sim-dev/nextplay-eval/pull/27) 记录了默认关闭的条件排除、条款分母和图片证据边界。确认该条款是否实际启用、证据是否齐备，再判断某个样本是否可比。
- 停止自动重试的实现入口为 `services/evolve-server/internal/modules/evolve/application/commands/direct_preparation.go` 和相邻接纳回归。接纳错误可能合并多个原因，只有全部原因都是精确方法缺失时才落终态。回归分别检查封存资源与 Split、同请求幂等回读、目录恢复后仍不自动领取、暂时或混合错误可接续。发布状态查实际 Worker 和 Work 回执。

## 2026-11-09 派发前评分版本预检

- Benchmark 修订保存选题、评分引用与运行设置。修订号递增本身不更新 Provider 版本，按具体 Run 核对冻结 JudgeSpec、Evaluator 和逐题有效覆盖。旧式 Benchmark 省略版本走 `freezeCurrentBenchmark` 时会主动跟随当前绑定。新式评测方案采用新规则需新建修订。查 `direct_run.go`、`direct_run_current.go` 与 `measurements/current.go` 的实际分流。
- 派发前检查放在 `direct_preparation.go` 的 pending 阶段，复用冻结 Split 选题、有效规则合并及业务评分目录，按精确方法和版本去重。确认缺版时用现有失败状态显示受影响用例，目录读取异常继续等待。进入准备和创建 Run 之间仍可能更换 Provider，接纳时要再校验。回归查 `direct_preparation_admission_test.go` 的零派发、逐题覆盖和暂时目录故障用例。实际生效范围查部署版本和 Work 回执。
