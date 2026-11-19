---
name: sandai-api-platform-openapi-quota-entrypoints
type: reference
created: 2026-10-26
updated: 2026-11-19
tags: [sandai, openapi, quota, concurrency, testing]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-global-acceptance-20261026]
---

# OpenAPI 频率、并发与 TPM 实现入口

**Why:** 2026-10-26 用户询问 TPM 和并发限制。必须先区分每分钟请求/任务数与模型 token 吞吐量，核对仓库已有能力，避免重复实现或把本地代码默认值当作线上配置。

## 去哪里看

源码根为 `/Users/leslie/Documents/ChatGPT/Apipltform/zeus/`；重新核对 HEAD 与部署版本后再使用以下入口：

- `docs/openapi-task-dispatch.md`：组织频率与执行并发的既有语义、管理员配置、缓存传播、迁移与消费者发布条件。状态和默认值以当前源码及真实配置为准。
- `modules/domain/.../domain/platform/quota/OrganizationQuotaService.java`、`GenerationRateLimiter.java`：组织覆盖/全局默认、Redis Redisson OVERALL、429 与依赖失败 503。
- `modules/api/.../api/admin/AdminOrganizationQuotaController.java`：组织配额 GET/PUT、超级管理员授权、保存与 Redis 同步回执。
- `modules/domain/.../domain/task/dispatch/TaskConcurrencySlots.java`、`TaskDispatchWorker.java`、`TaskDispatchStateService.java`：Redis Lua 原子占位、按 taskId 去重、满额等待、终态提交后释放、未知受理保留名额及恢复。
- v1 创建入口为 `PlatformGenerationController`，v2 创建经过 `OpenApiGenerationService`。需要核对不同版本的额度检查位置和失败计数口径，不能仅凭类存在认定覆盖一致。

## 设计使用边界

- 当前组织配额字段与每次申请一个 permit 的创建限流不是 token TPM。Tasks Per Minute 可沿创建频率实现；Tokens Per Minute 需要明确 tokenizer、计量范围、上限、预占与实际 usage 结算契约。
- 视频场景可使用每分钟生成秒数或明确的算力单位，但不要把自定义权重标成真实模型 token。计费额度、分钟吞吐额度与并发名额分别处理。
- 并发计算后台任务生命周期，不能在 HTTP 返回时释放。已运行任务不因短 TTL 到期自动失去占位；未知提交先恢复查证。
- 新增分钟预算时，采用 Redis 原子检查/扣减，明确滚动窗口还是允许突发的 token bucket，组织总额优先，避免用户轮换 API Key 绕过。
- 2026-10-26 的本次工作仅只读分析和方案，未修改业务代码、配额或部署；当前线上生效情况需另查。

**How to apply:** 先读取上述调度文档与真实配额回执，确认缺少的是配置启用、对用户展示、执行并发还是 token 计量。补 TPM 时明确预占 ID、重复请求、失败返还与窗口到期的语义，再用隔离环境验证多实例争抢、终态重复回调、未知受理和队列上限。

## 2026-11-16 执行 Fail 后的占位验证

**Why** 任务表的执行状态、Dispatcher 派发状态、Redis 实际占位和 Athena 状态分别推进。单写执行状态会跳过事务后的槽位释放，也会跳过事务内的退款认领。任务已经 `Fail` 仍可能有待执行的下游作业。

**How to apply** 同一时间按任务 ID 对照 `task.status`、`task.dispatch_status`、组织并发 Set 的 `SISMEMBER` 和 Athena 作业状态。对卡在 `WAITING` 的任务，依据当前版本核对未提交收尾分支、是否存在未知受理和实际派发次数。对 `SUBMITTED` 找下游终态，`FINISHED` 排查 Redis 删除及重试。余额退回另用实际流水核验。现场证据见 `.local/refund-nine-slots-20261116/REPORT.md`。

巡检若从 Redis Set 枚举任务，只能核对已登记占位的成员。还需从 MySQL `SUBMITTED` 和 Athena 在途作业反向核对缺失占位。处理历史异常前，区分未提交、受理未知和已受理，否则可能在作业仍可执行时提前放开槽位。

## 2026-10-26 真实配额测试入口

- 专项报告：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/quota-global-20261026/README.md`。阈值、窗口恢复、token TPM 检查范围、任务采样有效性、费用与待确认项以该报告及相邻 JSON/CLI 原件为准，不把默认配置当组织有效覆盖值。
- 可复查脚本：项目 `postman/scripts/quota_acceptance.py`；probe / observe 为只读查询，concurrency 为会收费的 fake 任务创建。复查旧任务不重发创建请求。
- **Why:** Postman CLI 退出码 0 只证明实际执行的断言通过；异步采样若未真正发出请求，空快照不能证明并发生效。
- **How to apply:** 同时核对实际 HTTP 查询数、逐任务状态记录、样本完整性与断言数。没有队列/在途证据时保留未验证；修复采样先读已有任务，再依据当前授权决定是否增加付费样本。严格执行并发还需组织配额与内部 slot / 下游时间线。


## 2026-11-19 组织任务排队与 GPU 启动的查证

**Why** 管理后台的 Running 覆盖任务从入库到出片的多个阶段。同一批次可能先等组织并发名额，下发成功后又在 Athena 等待 GPU。只看任务状态或更新时间，无法定位等待发生的位置。

**How to apply**

1. 用管理后台的组织任务列表和组织 quota GET 分别取任务创建时间、状态与 `effectiveMaxConcurrentTasks`。固定时间窗口和任务 ID，保留终态前序任务供并发复盘。
2. 在上海生产 SLS 的 `co_sandai_zeus_prod` 按 taskId 查 `task_submitted` 和 `task_finished`。用入库至下发的时间差计算平台等待。按下发和终态时间重建已受理未终态的数量，对照有效上限与前序终态后的补位间隔。遇到未知受理或异常占位时，加查派发状态与 Redis 实际成员。
3. 以 `task_submitted` 的 jobId 串接 `inference-prod` 的前处理和任务切片，以及 `athena` 的 worker `task started`、`inference finished in`。已建切片但还无 worker 开始回执时，核对调度记录与日志时效后再判定下游等待。用 worker 开始至结束的耗时衡量推理，用平台终态确认交付。
4. 本次只读证据见工作区 `.local/org-871466884966341-20261119/` 的配额回读和日志时间线。线上数量、上限和等待时长按当时快照重新查证。


## 2026-11-19 同时核对创建 RPM、组织并发和 worker 执行并发

**Why:** 组织并发上限只控制平台允许下发的在途任务数；创建请求仍受 RPM 限制，下发后的任务还会排队等待模型池 worker。只改并发、只数 Running，或把日志中 worker 的执行数当作组织配额，都会混淆限制层级。

**How to apply:**

1. 同一时间读取组织 quota GET 的 `rpm`、`maxConcurrentTasks` 和两个 effective 值。继承字段为空时按 effective 值核对。接口的当前值不替代各派发实例缓存或实际槽位的验证。
2. 对创建接口按组织、精确路径和时间窗口聚合 HTTP 状态码、`stage`、`errorCode`。分清请求次数、成功受理的任务数和 429；达到日志页面条数上限时改用聚合或拆分窗口，不能从截断的原始列表直接报总量。
3. 将已受理任务逐一串到 Athena Job，分别记录创建、下发、前处理完成、worker 开始和平台终态时间。排查速度优先计算各段等待，不能将平台 Running 等同于 GPU 已开始。
4. 按该批 Job 实际命中的模型池前缀查询 worker 开始/完成事件，按 Pod 重建占用；日志观测到的执行并发与配置上限分别报告。仅凭活跃 Pod 数不能证明整个池的最大副本数，也不能把模型池的占用全部归属到该组织。
5. 现场原件位于 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/org-concurrency-20261119-1800/`，含配额、完整受理回执聚合、任务与 Job 映射、worker 时间线，以及后续用户明确授权的组织 RPM 修改前值、原生保存回执和独立回读。当前配额、任务数及 Pod 数须重新取快照，知识库不存为长期事实。
