---
name: sandai-platform-load-capacity-observation-vs-recommendation
type: pitfall
created: 2026-11-16
updated: 2026-11-16
tags: [openapi, load-test, capacity, evidence, reporting]
links: [sandai-api-platform-performance-testing-entrypoints]
---

# 压测观察值、受理能力与推荐容量的分界

**Why:** 生产异步生成接口可能在发压窗口内返回任务 ID，但任务交付、旧任务轮询和素材准备消耗的资源与该窗口并不重合。把续跑时长相加、把客户端 finished 当排空，或对失败档直接打折，会产生没有验收依据的“能抗住”结论。

**How to apply:**

- 每条结论绑定地区、实际路由、版本、Ready副本时间线、输入方式和字节数、模型输出规格、查询新旧池、连续发送窗口；缺项不从邻轮推定。
- 实际发出、合法受理、成功交付、失败交付、pending与UNKNOWN分列。历史终态快照带观测时间，不称当前状态；续段新增与继承链累计不重复相加。
- 成功HTTP P95/P99按协议、样本和窗口展示，不能替代全请求错误率；Ark阈值空缺不是与native同标准通过。HTTP耗时、客户端调度延迟、成功交付发现延迟分开。
- 查询总计可能包含停发后的收尾；仅用同窗口GET计算QPS。尝试数和回执数相差一条，不足以断言已经发送而尚未返回，需逐请求链或活动状态证据。
- 分段发送不称连续稳态；运行器OOM时，预写意图只定义待对账集合，不能充当实际发送量。历史素材超当前契约时保留故障证据，但不外推合规场景容量。
- 将“历史已测表现”“下一轮受控起点”“尚待验收的持续容量”分栏。发布推荐容量前，要求有效输入、受理、成功交付、队列恢复、查询预算和客户SLO共同通过，再选择工程余量；从失败档打折不产生已验容量。
- 手动单档按用户指定QPS和时长执行；到期停新增，保留受控收尾，等待下一次指令。样本不足的低档只提供冒烟或基线证据，不补写统计通过。

## 查证入口

- [生产压测记录与容量建议](https://j0yswlgboxz.feishu.cn/docx/DYEPdWxvNo1qSLxxMuocGb37nFc)：2026-11-16补录后续生产记录、版本边界、关键终态快照、故障分类、分场景建议与证据附件；具体运行数量和容量数字沿文档与原件回查。
- [生产压测执行方案](https://j0yswlgboxz.feishu.cn/docx/MpPrdv5Wto8LVNxMoNNcxM2gnrd)：手动单档、既有候选档位、当前case准入、查询预算和验收口径。
- API工作区 `.local/prod-load-doc-update-20261116/`：双区逐run审计、原件SHA、CSV、局部XML修改、写前/写后回读与核验回执。它是本次历史审计证据，不证明当前生产状态。
- 故障归因分别见 [网络错误归因](load-test-network-error-attribution.md)、[连接池CPU空转](okhttp-pool-spin-after-load-stop.md)、[素材注册HTTP/2失败](asset-registration-http2-failures.md)。修复某一类故障不代表其他输入路径或容量已通过。
