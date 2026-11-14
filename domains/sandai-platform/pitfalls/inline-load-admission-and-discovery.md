---
name: sandai-api-platform-inline-load-admission-and-discovery
type: pitfall
created: 2026-11-14
updated: 2026-11-14
tags: [sandai, api-platform, performance, inline-data, telemetry, admission]
links: [sandai-api-platform-load-generator-readiness, sandai-api-platform-load-test-network-error-attribution, sandai-api-platform-v2-input-validation-entrypoints]
---

# inline 压测的身份、输入准入与健康发现分开证明

**Why:** 2026-11-14 上海 inline 准备中，部署源码具备 image/audio data URI 解析、组织白名单及 Key 查询认证成立，仍不能据此宣称真实生成输入准入通过。同时，固定 Pod IP 的指标清单在扩缩容后失效；修好采集后，历史客户任务的业务保护仍然可能关闭开跑条件。

**How to apply:**

1. 分别保存实际部署镜像/代码、模型与组织权限、原凭据哈希绑定、认证 GET、真实 inline POST、终态及资产/临时对象清理证据。认证后的查询 404 只证明该查询的鉴权和路由经过，不证明生成参数、媒体准备或推理可用。
2. inline 原始素材字节、Base64 字节和 HTTP 正文字节分别计数；先编码、校验并冻结请求体，避免发送时同步编码/读取。记录在途正文上限和发压端资源，已交给 fetch 的字节不能冒充已发出的网卡字节。
3. 创建、查询独立指定 QPS 和时长；单档截止停止新请求，不自动升档或带入历史任务池。无可查任务的查询时隙要显式跳过，不能制造终态重复查询来凑 QPS。
4. 实时指标发现以当前 Ready Pod 为基础，避免把历史 IP 清单当作现网。可使用专用 headless Service 的 DNS 发现；副本集合变化后重新积累完整 HTTP 比较窗口，DNS/源失效时关闭准入，不补造健康。
5. 健康采集成功、客户 SLO 通过和允许开跑是三件事。旧客户队列不能因本轮身份已准备好而排除或改龄。保护未通过时保留真实 inline 受理待验证状态，不直接翻转布尔标志。
6. 新入口放入独立不可变发布目录，直接在 Pod 内读取原凭据文件并核对冻结身份。每轮绑定真实 runId 与采集配置，使用同一地区运行锁；不改写旧运行配置或旧健康输出来冒充新一轮。审计导出采用固定非敏感字段白名单，不复制原始采集配置或 token。

代码、操作命令及本次精确状态只沿以下工作区指针重新核对，不在知识库固化当前准入或健康结论：

- `/Users/leslie/Documents/ChatGPT/Apipltform/postman/load/magi2/inline/README.md`：素材、单档入口、计数口径与恢复边界。
- 同目录 `launch.mjs`、`telemetry.mjs`、`runtime.mjs`：原凭据注入、每轮健康、服务发现及未知 POST 不重发。
- `/Users/leslie/Documents/ChatGPT/Apipltform/.local/ark-inline-shanghai-20261114/README.md`、`independent-readback.json`：现场接线、源码契约、认证、未完成实际生成准入及业务阻塞证据。
- 同审计目录 `metrics-discovery-services.json`：本轮新增指标发现资源及精确选择器；不代表其他环境已部署。


## 2026-11-14：大档 inline 的正文复制与中断台账

**Why:** 大正文的单次创建/查询准入成功，不能证明并发发压器有足够内存。上海随后实际启动的一档被发压容器 OOM 中断；同版本零网络复现确认 Request 正文对象存在额外复制，按一份正文计数的在途预算低估了实际内存。

**How to apply:**

- 对大档同时核对预编码正文、HTTP 客户端复制、控制进程/子进程、JSON 校验和 TLS 等内存；在相同运行时用有限并发、零生产网络方式观察 external/RSS，再确定预算。不能只增加容器限制，或把可回收文件缓存全部当常驻内存。
- 客户明确授权豁免历史时长时，冻结准确任务名单，保留 raw 统计；仅本轮使用，继续保护新增任务、失败、退款和遥测失效。它不自动覆盖未来轮次或其他业务规则。
- OOM 后保留原 Pod、PVC、区域锁及台账，使用临时只读挂载取证，不自动重启补发。预写意图减去 not_sent 只是保守对账候选，不是实发数；旧状态 JSON 可能早于持久化节奏事件。
- 区分 HTTP 开始发送、完整正文传输、服务端受理和终态。阶段中断后不能用计划时长计算的临时均值冒充实际平均速率。数据库查询无结果也不自动允许重发未知 POST。
- 临时采集进程与审计 Pod 用完即清理；任务、资产、暂存对象和账务沿原生台账继续对账，不能以停止发压代表清理完成。

本次参数、时间、逐事件证据、只读查询范围和恢复边界回查 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/cn-inline-large-25qps-20261114/README.md` 及同目录审计文件，不在知识库固化当前任务或 Pod 状态。


## 2026-11-14：完整正文目标与流式发送验证

**Why:** 将原始素材减小，不等于 HTTP JSON 正文已满足同样大小；Base64 和元数据仍需计入。减小正文但沿用总在途字节预算，还可能允许更多并发，抵消内存收益。仅在不同本机 Node 版本测量，也不能代替发压镜像里的正文实现。

**How to apply:**

- 以最终 UTF-8 JSON 字节数为上限，明确 MB 与 MiB；选择真实素材组合，保留每个素材原始档位/哈希，不通过空白或无关字段凑大小。新素材包独立冻结，不覆盖旧包。
- 对预编码共享 Buffer 使用有界切片和背压流，保持准确 Content-Length；在实际运行时验证 Request 对象不再整份复制，并通过回环 HTTP 完整接收核对每份长度和哈希。不能把这一点描述成整个网络链路绝对零拷贝。
- 同时固定并发上限和正文在途预算，避免正文减半后并发翻倍。扩容应核对 Kubernetes requests/limits 与实际 cgroup 上限，记录具体 Pod UID。
- 区分 Request 分配、测试进程 RSS、Pod cgroup 峰值及生产持续 QPS。回环内存通过不代表 TLS、入口带宽、推理或客户健康已验收。
- 共用发压 Pod 被其他流程恢复时，使用独立版本/Pod且复用区域锁，不覆盖对方状态。新 Pod 的健康源访问和新输入准入需要重新核对。

复查入口：`postman/load/magi2/inline/{dataset,runtime,runner}.mjs` 与 `tests/streaming.test.mjs`；本次 20 MB 实物、上海实际版本回环和扩容回执见 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/ark-inline-20mb-stream-20261114/README.md`。


## 2026-11-14：滚动更新、HPA 与启动健康窗口

**Why:** 临时聚合源绑在业务 Pod 中，业务滚动更新会同时丢失进程和 `/tmp` 基线。即便发布已完成，HPA 缩容仍会改变 Ready 集合，使完整 HTTP 健康窗口重新积累；过短的启动等待会在零发压阶段退出，不能据此归因为接口容量不足。

**How to apply:**

- 启动前把授权的精确历史任务 ID 基线保存到独立审计目录和持久卷，不能只放采集 Pod 的临时目录。迁移时核对固定名单、原始时点、组织、Pod UID 和实际 JAR；不因源丢失而重新豁免所有当前积压。
- 分开记录发布滚动替换与 HPA 缩容。只等待当前 Ready 指标和真实完整窗口；可以延长有界启动等待，不通过伪造窗口或关闭监控失效保护开跑。
- 启动失败后先核实没有运行目录/台账、没有 POST、区域锁空闲；重建准备会话用新编号，保留失败启动证据。已经发送但没有回执的 POST 不能按这一规则重发。
- 启动等待时长与用户授权的发压时长分开计时；正式单档必须从实际 schedule_start 计算。每秒保存资源与发送状态，明确发压前的素材/控制进程峰值和阶段内峰值。

现场版本、冻结名单、单请求准入和实际运行状态复查 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/cn-inline-20mb-25qps-20261114-r1/README.md` 及同目录审计文件。启动器等待调整仅属于该目录的本轮独立脚本，不能当成共用发布已更新。


## 2026-11-14：修复内存不等于达到目标 QPS

**Why:** 同一套流式正文可以消除 OOM，但逻辑在途正文预算和并发上限仍会拦截发送。请求受理耗时较长时，少量在途名额不能维持给定到达率；在途回执可能在停止新请求之后才全部返回。

**How to apply:** 同时记录请求占用时长、并发/正文预算、真实 RSS 和每窗口实发数。把已预写意图、到点未发、停止后撤销的未来意图、已发和受理分开。发生速率保护时，用停止发送前的实际窗口计算 QPS，等待已有回执另计；不能用计划时长作为分母。查询因没有到期任务跳过的时隙不等于服务端查询失败。按实测时长估算并发后，还需独立验证内存和网络预算，不能直接扩大至任意并发后自动重跑。

证据沿上面的 20 MB 本轮审计目录重新读取；该轮结果不是业务容量验收，也不证明生成终态和清理已完成。
