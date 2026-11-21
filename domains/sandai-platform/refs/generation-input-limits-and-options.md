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

## 2026-11-21 海外 staging 分轮实测

**Why:** 同一条输入限制在模型目录回读成功后，还需验证对应请求路径。MP4 带 `edts` 编辑列表时，Zeus 同步探测可能不给出可靠时长。滚动替换期间，部署界面就绪与请求命中新配置可能短暂错开。

**How to apply:** 用 ACK 工作负载的「更多 → 重新部署」同镜像重建相关角色，新 Pod 就绪后继续回读 Swagger、模型目录及实际验证结果。验证 `options` 关闭时，使用启用状态也会拒绝的非法字段，按字段错误区分开关，避免切换期间意外创建任务。测视频时长应分别覆盖有编辑列表与可识别时长的文件。只提供纯文本 fake 时，累计时长只能回读生效值，保留实际多段生成的验收缺口。

- 本地配置与 API 回执：`/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr518-staging-20261121/staging-global-run/RESULTS.md`。沿相邻只读回执核对恢复状态和补测素材。
