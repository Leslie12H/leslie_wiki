---
name: evolve-nextplay-ten-case-acceptance-20261015
type: reference
created: 2026-10-15
updated: 2026-10-18
tags: [maxwell, evolve, nextplay, acceptance, permissions]
links: [evolve-nextplay-dev-release-20261015, evolve-native-routing-vs-candidate-runner]
---

# Nextplay 原题十题抽样验收入口

## 2026-10-17 新工作台双轮验收入口

- 用户要求合并 Maxwell #361 / Nextplay #22 后部署 dev、复用原十题、整理单一 Benchmark 并运行两轮。范围、发布任务、数据库迁移确认、登录前置及后续运行证据查[双轮验收记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-two-round-acceptance-20261017/plan.md)。此处只保存入口，完成度以记录及真实环境为准。
- 2026-10-17 补充：旧 Benchmark 固定的评分 Provider 版本不会随服务发布自动变更；仅更新同源 Case 的评分绑定版本后，必须保存新 CaseSet/Benchmark 版本并在两轮中冻结一致。原始回执、两轮身份及暂不归档的用户范围查双轮验收记录；界面输入、运行备注和比较观察查[工作台操作观察](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-two-round-acceptance-20261017/workbench-observations.md)。
- 2026-10-18 核验方法补充：原件读取应复现页面的 `If-Match + Range` 路径，再校验状态码、ETag、长度和实际 SHA-256；完整 GET 的弱 ETag 不能直接代表分段下载失败。状态写回以恢复完成后的初始原件哈希为基线，排除会话身份占位符实化。实际请求、误判更正、最终交付入口及配置观测边界继续见上述[工作台操作观察](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-two-round-acceptance-20261017/workbench-observations.md)。
- 2026-10-18 原评分与资产核验补充：旧配置路径的完整原判分可能保存在 Assessment 的 `methodOutputs` 中，不能仅因原件列表没有独立 `grading_report` 就判取分失败。分开记录执行模型和评分模型，并将逐题原值与自动/采用口径汇总独立对齐。JSONB 读回后，JSON 文本的键序与空白可能变化，不能用重新序列化的字节哈希直接否认冻结资产身份。对应实现版本、回执和可重复检查见[双轮验收报告](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-two-round-acceptance-20261017/report.md)及其逐题比较、评分原件与校验文件。
- **Why:** 目标续行缺省关闭，新版本部署不会自动改变已有 Case；新评分工作台还依赖新增数据库结构。不能把合并、发布、策略启用、真实取分与对比可用混为同一结论。
- **How to apply:** 发布前核对实际迁移版本和结构变更授权；从页面回读 Case 策略及 Benchmark 冻结版本。两轮之间保持输入、评分与交互策略不变；原先单轮结果只作历史参照，不计入新请求的两轮。系统禁止的生图/声音能力不能靠评测续问绕过。

**Why:** 部署就绪和 Agent Card 探测通过不能证明实际内部执行接口权限、原件归档与评分链路可用。必须保留每次真实运行及失败，而不是覆盖结果或把基础设施错误当作质量未通过。

**How to apply:**

- 授权、选题、冻结修订、执行连接、Provider、Run、逐题错误和前端刷新核验见[本轮验收记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/plan.md)。此为 2026-10-15 的历史实验，不代表当前服务状态。
- 记录附十题原始页面诊断及截图；需要继续验收时先沿原 Run 核对具体拒绝接口和权限，再决定修复与新运行，不能仅凭通用 execution_unavailable 错误扩大授权。
- 连接检查与内部执行路径的实现分别查 `services/evolve-server/internal/app/integration/a2a/connection.go` 和 `maxwellexecutor/adapter.go`；这些路径会变化，以对应部署 SHA 为准。
- 上一轮发布证据见[dev 发布核验入口](evolve-nextplay-dev-release-20261015.md)。本轮仅发起十题验收，没有额外部署；原 65 题 Benchmark 保留。

## 2026-10-16 只读诊断指针

- ACK 内嵌应用日志检索、本次调用身份与时间窗、实际拒绝接口及代码解释见[十题诊断记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/diagnosis-20261016.md)。这是历史证据，不表示权限已修复或新运行已通过。
- **Why:** 通用 HTTP 403 无法区分 Preset 读取、Thread 创建和后续文件访问；Card 检查成功不能替代这些实际调用。
- **How to apply:** 先用 Run 时间及 Worker 来源关联独立 HTTP 请求，再按实际部署 SHA 查权限要求；凭据元数据核对、权限修复与新运行分别授权和验证。ACK 容器日志的最近行数不足时可在其日志中心限定业务日志库和时间窗，无需转入集群终端。

## 2026-10-16 权限修复与预检回归指针

- 管理员操作单、准确 Key 身份、账号权限阻塞、本地修复工作区与测试结果见[权限修复记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/permission-repair-20261016.md)。继续工作前重新核对该记录与线上状态，不能将本地测试当作线上出分。
- **Why:** 业务编辑成员可以运行评测，不代表能管理程序执行 Key；业务执行 Key 也不应因此获得密钥管理或配置修改权限。
- **How to apply:** 管理员针对已有 Key 仅补执行所需缺项，回读同一身份且不传输明文；预检用执行时的凭据、源地址和客户端覆盖必要只读接口，再以单题及原子集验证最终评分。

## 2026-10-16 权限配置后单题复验指针

- 单题 Run/Thread、消息拒绝原因、取消回执边界、前端计数不一致及本地模式适配回归见[单题复验记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/retest-20261016.md)。继续验收必须先刷新该记录对应的真实运行，不能把 Thread 创建或“已有评分”汇总计数当原评分证据。
- **Why:** 执行 Key 权限修复后仍可能暴露消息参数与 Preset 能力不匹配；可选执行模式不能无条件附加。取消后的 unknown 也可能被旧页面计入已有评分。
- **How to apply:** 适配器按目标声明决定是否传执行模式，涉及确认模式时不能静默降级；用单题依次核验消息接纳、实际 Run、输出、原评分及页面持久化，成功后再扩大批次。接纳不明的旧 action 保留身份和原 payload，不能篡改后重发。代码通过与发布、真实出分分别记录，部署沿用户确认与 PR 流程。

## 2026-10-16 PR 发布后复验指针

- #357 的限定发布、独立镜像回读、新单题 Runtime 执行与停止、#358 延后合入的边界继续见[单题复验记录](/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-ten-case-acceptance-20261015/retest-20261016.md)。原十题是否启动与最新评分必须沿该记录刷新，不以本页推断实时状态。
- **Why:** 解决权限和消息兼容只代表进入真实执行；复杂 Agent 会继续派生作家、审查等长子任务。取消未确认类别可能覆盖原先的停止触发原因，时长接近固定值也不能直接当成配置已核实。
- **How to apply:** 用 Worker 的派发/停止时间、同一 Runtime Run 的终态及前端刷新三处核对；必须读取实际登记 limits 才能确认执行时限，不能用代码默认值替代。完整输出与原评分成功前不扩大批次，不篡改旧 action 或原题绕过。

## 2026-10-16 执行预算与异步取消回执修复指针

- 具体超时原文、已部署版本边界、当前 PR 和待授权发布范围见[时限与取消复验记录](https://github.com/world-sim-dev/maxwell-ai/blob/codex/evolve-preflight-transport/docs/verification/2026-10-16-evolve-timeout-cancel.md)；线上状态仍需沿原 Run 与验收记录刷新。
- **Why:** 取消接纳成功与 Run 终态是两个时间点；冻结的失败记录和后台稍后确认的清理状态也属于不同事实。新连接默认预算不能替代旧连接已保存值。
- **How to apply:** 优先读失败 Assessment 的原始原因，沿执行器来源核对实际预算；取消只以对应 Run 的终态为回执，未知时保留恢复围栏。页面使用最新 Attempt 表示当前清理状态，历史记录不覆盖；本轮预算编辑和修复发布均需按验收记录核准，单题原评分成功后才扩大十题。
