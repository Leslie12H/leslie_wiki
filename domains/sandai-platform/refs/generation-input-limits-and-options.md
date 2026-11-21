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

## 2026-11-21 `generateAudio` 成片音轨查证

**Why:** Zeus 的提交和成功状态只证明任务完成。`generateAudio=false` 是否对用户生效，需要检查查询接口实际交付的文件容器流。Athena #819 的静音后处理依赖最终派发目标支持后处理交接，Zeus #519 的选择依赖成功回调中的已确认产物。

**How to apply:** 核对当前 Magi 环境的 Zeus 和 Athena 部署后，用同模型、同输入和种子，仅改变 `generateAudio` 跑正反对照。两条都从各自任务详情下载最终交付视频，使用 `ffprobe` 检查视频流和音频流，必要时用 `volumedetect` 确认开启对照确有信号。涉及水印或不同执行端时分别复验。

- [Zeus #519](https://github.com/world-sim-dev/zeus/pull/519) · [Athena #819](https://github.com/world-sim-dev/athena-admin/pull/819)
- 海外与国内环境分开取证。本次 `staging-cn` 自有 v2 `magi-2` A/B 的请求、成片流和终态见 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr519-audio-20261121/RESULTS.md`。

## 2026-11-21 方舟兼容入口分区回读

先用兼容路径的鉴权响应定位入口，再用有效 Key 完成创建与查询闭环。验证两区提示词阈值不同，可以给同一超默认上限的提示词设置一个下游必定拒绝的时长，读取返回的参数名判断是否通过前面的长度校验，全程避免创建长提示词生成任务。方舟请求字段是 `generate_audio`，最终音轨沿 `content.video_url` 查证。

- 海外与国内方舟入口、代表性阈值、默认音频及静音成片证据见 `/Users/leslie/Documents/ChatGPT/Apipltform/.local/zeus-pr519-ark-20261121/RESULTS.md`。
