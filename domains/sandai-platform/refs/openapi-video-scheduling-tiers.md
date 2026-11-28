---
name: sandai-api-platform-video-scheduling-tiers
type: reference
created: 2026-11-28
updated: 2026-11-28
tags: [sandai, openapi, video-generation, scheduling, pricing]
links: [sandai-api-platform-openapi-quota-entrypoints, sandai-inference-concurrency-dashboard-entrypoints]
---

# OpenAPI 视频生成峰谷与优先级查证入口

**Why**　2026-11-28 调研视频 API 如何让客户用时间换成本，或让有交付时限的任务先开始。绝对时段价格、请求级排队顺序、账户配额和预留容量是不同的产品契约。对异步视频，按提交、开跑或完成时刻计价会给出不同结果，需在接单时定义。

## 竞品查证入口

- [火山方舟创建视频任务](https://docs.volcengine.com/docs/ark/create-video-generation-task-api?lang=zh)与[查询视频任务](https://docs.volcengine.com/docs/ark/get-video-generation-task-api?lang=zh)。查 `priority` 的作用域、取值、同级排序、运行中任务及各型号覆盖。另查 [Seedance 型号能力对照](https://docs.volcengine.com/docs/ark/seedance-2-5?lang=zh)的离线推理行，避免把其他模型的 Flex 能力或计费套给 Seedance。
- [Kimi API 开放平台](https://platform.kimi.com/)、[国际站](https://platform.kimi.ai/)、[充值与限速](https://platform.kimi.com/docs/pricing/limits)与[故障排查](https://www.kimi.com/help/kimi-api/api-troubleshooting)。分别核对高速型号、账户限速等级、服务过载和触发组织配额的行为。同品牌的消费端会员、开发者 API 和其他供应商接入规则需分别核对。
- [DeepSeek 模型与价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)用于核对固定峰谷、时区和适用模型。当前价格页优先于历史促销公告；如需跨时段计费口径，另查官方确认。
- [fal 入队 API](https://fal.ai/docs/api-reference/inference-api/queue/submit)用于核对请求可选择的排队等级和账号权限上限。[Runway API 用量层级](https://docs.dev.runwayml.com/usage/tiers/)用于核对项目并发、等待状态、按负载兑现的配额及企业保障入口。

## Sand.ai 落地查证

- 先看 [Zeus 派发约定](https://github.com/world-sim-dev/zeus/blob/dev/docs/openapi-task-dispatch.md)、[方舟兼容请求解析](https://github.com/world-sim-dev/zeus/blob/dev/modules/openapi/src/main/java/co/sandai/zeus/openapi/compatible/ark/ArkGenerationRequest.java)与 [WAITING 候选顺序](https://github.com/world-sim-dev/zeus/blob/dev/modules/domain/src/main/java/co/sandai/zeus/domain/task/dispatch/TaskDispatchMapper.java)，核对目标地区部署版本、已有字段、幂等边界和组织轮转。
- 链路阶段、组织槽位与地区容量从 [OpenAPI 频率与并发](openapi-quota-entrypoints.md)和 [Inference 并发查证入口](inference-concurrency-dashboard-entrypoints.md)回查。将 Zeus 待派发、Athena 排队与 GPU 开跑时间连成逐任务记录；按区域、模型与资源池识别空闲，较早进入下游队列未必较早开跑。

**How to apply**　评估方案时优先让用户逐单选标准或闲时，并把组织默认、请求覆盖及可用档位权限写入契约。让闲时积压与执行占位分别受控。报价在提交时锁定，排队截止、取消和退款可对账。组织内优先处理保留跨组织公平和同档 FIFO。若要向客户承诺 GPU 开跑更早，须在实际瓶颈队列实现并验证优先级或容量隔离。固定窗口与保障档都需用分区、分模型历史回放定量验证。本次为调研与设计建议。
