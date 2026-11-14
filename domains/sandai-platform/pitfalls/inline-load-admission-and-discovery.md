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
