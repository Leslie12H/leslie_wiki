---
name: kling-billing-missing-resolution-20260909
type: pitfall
created: 2026-09-09
updated: 2026-09-09
tags: [vidmuse, aion, vidmcp, billing, kling]
links: [vidmuse-zeus]
---

# Kling 请求漏传分辨率导致 billing/500

**Why:** `Billing failed` 是公共错误包装，不能据此判断余额或 Zeus 故障。2026-09-09 对反馈 `847042792586373` 的生产 SLS 取证证明：请求在 Manager 价格匹配阶段终止。

## 已核对的历史事实

- Thread：`67a65361-1f16-4df1-b264-8dd4e7fdc694`。
- 北京时间窗口：2026-09-09 13:49:00–14:01:00。
- 两轮 Trace：`be6dd617e2e04e0580927707889280ac`、`9b19d2e52ab14b2bb5bfbeec7095eb47`。
- `vidmuse-aion` 六条状态变更均有 `reason=Pricing config did not match for billable model request model_name=fal-ai/kling-video/v3/pro/image-to-video generation_type=video properties={}`；另见 `Marking pre-submission failure`。所有供应商及上游任务字段为空。
- 六个 Model API request ID：`79d072aa-5429-4d49-bd69-9b623e746a10`、`b1890b1b-e612-4699-ba23-dcaedd448c34`、`5c365c66-b699-429c-98a0-6caf1960bcd6`、`0860639e-a751-4a51-9b70-533dedd10521`、`9e08ab12-71cf-4a33-b625-1829c958caf5`、`1cf9ba67-193a-4ccd-b362-b35cfb52e54a`。
- `vidmuse-mcp` 六条发送给 Manager 的 HTTP request，JSON 提取均为：`generation_type=text_to_video`，image_urls/duration/resolution 为 null 或缺省，generate_audio=false。展开的一条完整 body 中这三个字段确实不存在。
- 同 Trace 的 MCP tool request 已显示 image_urls、duration、resolution 为 None，支持调用输入缺失，而不是 HTTP 封装后才丢失。
- 当日调查时生产 Admin 模型配置确认该 I2V 模型已注册启用，只有带 resolution=720p/1080p 的四条价格（音频 on 与非 on），没有空属性价格。配置默认 resolution=1080p 未在本次计费匹配前生效。当前配置读数不是事故时历史快照；事故时匹配失败以 SLS reason 为准。

## 根因与边界

直接失败链：未传 resolution + generate_audio=false → 计费 properties={} → 找不到匹配价格 → ModelApiBillingError → system/billing/500。这个异常分支在 Zeus pre_deduct 之前，所以并发余额冻结、积分桶不足不是此次六次报错的解释。

另有调用语义问题：未传图片，工具推断为 text_to_video，尽管 model_name 是 I2V 路径。时长也没有实际传成 5 秒。费用估算与执行 payload 不一致。

**How to apply:** 先从同 Trace 的 Manager 状态日志读内部 reason，再从 VidMCP HTTP request 核对真实字段，最后看模型注册名、price_items 和默认参数应用时序。不能从总余额与估算金额推导实际请求正确，也不能把所有 billing/500 都称为 Zeus 故障。修复应检查 Agent 参数补齐和计费前的参数校验/默认值处理；本次只读取证，未修改业务代码或生产配置，未重跑生成。

## 可复查指针

- SLS project：`k8s-log-c7c0ede6c71484f8da34a829954c50cd9`，Logstore：`vidmuse-aion` / `vidmuse-mcp`。
- [生产模型配置](https://prod-vidmuse-admin.vidmuse.ai/playground/admin/model-configs)，video 查询后筛选 `kling-video/v3/pro`。
- Aion 本地代码指针：`apps/manager/service/model_api/billing.py` 的 `_build_pricing_properties`、`_pre_deduct_model_request`；`packages/schemas/src/schemas/tools/generation_mcp_specs.py` 的 `infer_video_generation_type`；`packages/cost_manager/src/cost_manager/pricing_manager.py`。
- 日志中的 Manager 镜像标签为 `592d0a3c098ce412ddf76fa19798c8b78698150a`，VidMCP 为 `1e487c50e6101d286e04537da986d52d80a111fc`。本地未取得该 Manager 历史 tree，不将本地代码行号当作已部署源码核验。
