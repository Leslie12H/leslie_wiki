---
name: sandai-api-platform
type: system
created: 2026-10-26
updated: 2026-10-26
tags: [sandai, api-platform, website, zeus]
links: [sandai-api-platform-development-entrypoints]
---

# Sand.ai API 开放平台

本业务以官网承接开放平台用户，前端是 `world-sim-dev/sandai-website`，后端是 `world-sim-dev/zeus`。它与 VidMuse 的 `world-sim-dev/vidmuse-zeus` 分开定位，不能互换仓库或部署结论。

**Why:** 多个 Zeus 仓库名称相似，需要将用户明确指定的仓库、PRD 和本地研发入口绑定，避免用 VidMuse 的历史知识推断开放平台。

**How to apply:** 从[研发入口](refs/development-entrypoints.md)重新读取 PRD、实际代码和环境信息；本页不保存线上状态。
