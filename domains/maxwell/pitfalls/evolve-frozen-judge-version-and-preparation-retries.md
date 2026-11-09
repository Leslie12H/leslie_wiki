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
