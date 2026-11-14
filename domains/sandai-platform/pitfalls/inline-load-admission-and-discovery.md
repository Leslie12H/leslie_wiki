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
