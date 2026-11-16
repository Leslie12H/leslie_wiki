---
name: sandai-api-platform-playground-catalog-schema-mismatch
type: pitfall
created: 2026-11-16
updated: 2026-11-16
tags: [sandai, api-platform, playground, json-schema, frontend]
links: [sandai-api-platform-development-entrypoints]
---

# 单个模型的 Schema 不兼容导致 Playground 无法打开

**Why**　2026-11-16 海外生产的登录态模型目录返回 200，但客户端将模型 Schema 转换成表单选项时抛错。目录查询逐项转换后才交付整批结果，单项异常会让页面进入模型加载失败状态。JSON Schema 可以用 `pattern` 约束合法输入，而下拉控件需要有限的可选值。此差异要沿实际构建与实际目录响应核对。

**How to apply**　浏览器先核对 `GET /api/v1/platform/models` 的状态、内容类型和响应结构，再检查页面查询的异常。用线上静态资源路径确认前端 SHA，拿同一响应在该 SHA 的 `modelCapabilities` 中逐项复现。后端的比例字段有显式可选集合时生成 `enum`，没有集合时生成格式 `pattern`。对比时在离线副本改变单一字段，分别确认单模型转换和整批查询。模型授权及可见目录按当前组织核对。

- 前端回查入口。[比例和变体解析](https://github.com/world-sim-dev/sandai-website/blob/817c57b7a593675f127a6179d0c5ce1648b22aad/apps/platform/src/features/playground/capabilities.ts#L180-L214) · [目录查询](https://github.com/world-sim-dev/sandai-website/blob/817c57b7a593675f127a6179d0c5ce1648b22aad/apps/platform/src/features/playground/queries.ts#L6-L16) · [错误状态渲染](https://github.com/world-sim-dev/sandai-website/blob/817c57b7a593675f127a6179d0c5ce1648b22aad/apps/platform/src/features/playground/pages/playground-page.tsx#L388-L410)
- 后端回查入口。[比例 Schema 的生成规则](https://github.com/world-sim-dev/zeus/blob/2d7a48ce2b60cc16da8c27ed50156e5ddba32128/modules/api/src/main/java/co/sandai/zeus/api/platform/generation/GenerationInputSchema.java#L123-L127)
- 2026-11-16 受影响模型、构建、异常及对照实验见本机 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/playground-models-20261116/REPORT.md`。
