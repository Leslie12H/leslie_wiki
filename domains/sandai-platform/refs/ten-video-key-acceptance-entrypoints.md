---
name: sandai-api-platform-ten-video-key-acceptance-entrypoints
type: reference
created: 2026-10-29
updated: 2026-10-29
tags: [sandai, openapi, api-key, dev-cn, postman, testing]
links: [sandai-api-platform-admin-rpm-change-verification-entrypoints, sandai-api-platform-development-entrypoints]
---

# 新 Key 十视频验收入口

**Why:** 2026-10-29 用户提供新 Key 要求生成十个视频，随后指定 Dev CN，并明确其与此前 Dev Global 生成入口相同。不能因前端地区或管理后台环境名称不同，猜测新域名或跨环境发送凭据；也不能将模型创建 403 当作 Key 无效。

## 回查入口

- 当次用户确认的精确地址、模型参数、首条响应、GET 鉴权结果和尚未完成的边界：`/Users/leslie/Documents/ChatGPT/Apipltform/postman/reports/ten-videos-dev-cn-20261029/README.md` 及相邻 JSON / CLI 原件。运行入口为 `postman/scripts/generate_ten_dev.py`，本地 Dev CN 环境为 `postman/environments/dev-cn.postman_environment.json`。这些是当次证据；当前地址、Key 状态、模型权限与价格需现场核验。
- 同一 Key 的只读不存在任务查询与创建请求分别验证鉴权和模型使用路径。实际 HTTP / code 以报告原件为准；公开错误文案与内部拒绝来源未必一一对应，根因需进一步沿准确组织和部署查证。
- Dev CN 当前浏览器账号与用户提供 Key 的归属需要用服务端 Key 列表/准确组织独立匹配。当前账号 Key 列表为空时，不能擅自将 Key 归属该账号，也不能创建替代 Key 绕开原问题。
- 管理后台配置可从“平台配置 → 模型配置”现场读取；旧详情 URL 可能重定向。PUBLIC 展示与创建拒绝矛盾时保留两者证据，不静默修改权限或扩大白名单。

**How to apply:** 第一个有效请求计入用户要求的十个；非受理响应立即停止，不继续消耗其余请求。POST 结果未知时不重放，保存阶段启动标记和任务回执；GET 轮询只使用已受理 ID。受理、成功终态、视频 URL 与正式扣费分别核对。完整 Key 仅存在内存，签名结果放忽略目录，报告不得含凭据。fake 验收不用于推断真实视频画质或推理性能。
