---
name: ark-seedance-25-pe-entrypoints
type: reference
created: 2026-11-17
updated: 2026-11-17
tags: [ark, seedance, api, prompt-enhancement]
links: [sandai-api-platform-development-entrypoints]
---

# 火山方舟 Seedance 2.5 提示词改写查证入口

**Why**　2026-11-17 核对 Seedance 2.5 和 2.5 flash 能否按请求开关提示词改写。教程里的 `sd25-pe` 容易被当成生成接口的参数。

**How to apply**　以[创建视频生成任务](https://docs.volcengine.com/docs/ark/create-video-generation-task-api?lang=zh)的 Body 参数和提示词尾缀清单核对可用开关。以[Seedance 2.5 系列教程](https://docs.volcengine.com/docs/ark/seedance-2-5?lang=zh)的「提示词技巧」核对 `sd25-pe` 的调用位置。

2026-11-17 的公开文档查证未发现请求级 PE 开关。教程将 `sd25-pe` 用于生成前的提示词调优。此证据仅覆盖公开接口契约，服务端是否自动改写需另行查证。
