---
name: sandai-platform-generation-input-limits-and-options
type: reference
created: 2026-11-21
updated: 2026-11-21
tags: [sandai, openapi, staging, generation, validation]
links: [sandai-api-platform-v2-input-validation-entrypoints, sandai-api-platform-development-entrypoints]
---

# 生成输入限制与请求覆盖查证入口

**Why:** 2026-11-21 为 Zeus PR #518 准备 staging 验收。环境阈值与单请求覆盖可以独立变化，素材上传受理和原始对象可读也需要分别核验。

**How to apply:** 核对服务部署 SHA，再从该环境的 OpenAPI Schema 和 Playground `/api/v1/platform/models` 取有效阈值。沿 PR 的部署说明回查公共配置和 OpenAPI 角色开关。覆盖权限使用同一国内 staging 的普通组织 Key 与内部 Key 做对照。按来源分别测试新导入 HTTPS 素材、已有 asset ID、方舟 Base64 和独立上传。累计时长优先使用可读外链，避免把仅在异步预处理才检查的已有素材结果当成同步入口验证。遇到签名下载失败时，保留素材 ID 回执与对象下载证据。

验证环境阈值时，分轮隔离数量、字节数和时长。先用素材清单核对非目标阈值有余量，尤其要排除音视频字节上限先于时长检查触发。总项数边界用例把超额素材放在最后，避免逐项解析先触发单类型数量限制。

- 实现与配置查证：[Zeus PR #518](https://github.com/world-sim-dev/zeus/pull/518)及关联部署工作流。
- 2026-11-21 用例、素材和读回证据入口：`/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr518-staging-20261121/README.md`。阈值、资产回读和验收状态沿该入口重新核验。
