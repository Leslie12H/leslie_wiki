---
name: sandai-playground-account-generation-entrypoints
type: reference
created: 2026-11-19
updated: 2026-11-19
tags: [sandai, api-platform, playground, video, production, testing]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-v2-input-validation-entrypoints]
---

# 开放平台个人账号的在线体验生成与回读

**Why**　2026-11-19 用户授权在国内生产用自己的账号跑视频测评。在线体验具备该账号的控制台会话，完整 API Key 又只在创建时可见。正确区分会话创建链路、公开 Bearer OpenAPI 和模型能力，才能标明实际覆盖的接口和付费归属。

## 查证入口

- 控制台以 [在线体验](https://platform.sandai.cn/app/playground/) 所选账号的 profile 和 `GET /api/v1/platform/models` 为准。以实时目录核对模型参数、可用素材类型和限制。公开 OpenAPI 另查 [国内契约](https://api.sandai.cn/openapi.json)。参数是否可用仍由所选模型的在服配置决定。
- Zeus 的同源控制台路径、归属和查询实现见 [PlatformMediaController](https://github.com/world-sim-dev/zeus/blob/338d36504de0c03654e92f60e6547df35a285816/modules/api/src/main/java/co/sandai/zeus/api/platform/generation/PlatformMediaController.java)，该控制台创建方法使用共享的 `OpenApiGenerationService.createV2` 并以当前组织作为所有者。控制台实测覆盖共享生成路径；外部 Bearer 鉴权需要独立验证。
- 参考素材按已发布前端 [mentions.ts](https://github.com/world-sim-dev/sandai-website/blob/e7bd6949f6628544c15899852945c418b56f767a/apps/platform/src/features/generations/mentions.ts) 的类型内序号映射文件名引用。以上传回执的素材 ID 与生成详情回读的输入类型确认绑定。
- 生产测试的用量、创建回执、终态及素材兼容性证据见工作区 `.local/video-benchmark-cn-20261119/REPORT.md`。本页保留回查路径。个人账号、余额、模型限制和签名媒体 URL 随当次运行记录处理。

**How to apply**　先核对登录账号、地区、余额及在线能力。将附件作为数据解析并保留素材顺序，记录实际参数与测评要求的差异。提交前限制生成次数、用量与截止时间，以创建回执记录任务 ID。遇到结果未知的创建先回读历史，避免重复消费。用 [生成记录](https://platform.sandai.cn/app/generation-history/) 查到终态与产物，再在 [用量明细](https://platform.sandai.cn/app/general/) 按任务 ID 核对金额。

## 切换提交批次

Ego 的本地命令退出后，浏览器内已启动的执行仍可能推进到下一条 POST。2026-11-19 的批次切换因此留下两条不同任务 ID。交接时等待旧执行器确认停止，并核对最新意图、受理回执和在途请求，随后再启动新批次。让提交执行共用一把互斥锁，提交前检查停止信号及整轮上限。按任务 ID 对账时保留同题的每笔实际受理。

## 生产看板漏计在线体验与低流量延迟

**Why**　2026-11-19 国内在线体验已有创建回执，生产看板的公开 v2 创建仍可在同窗显示零。控制台入口和公开 OpenAPI 复用生成服务，但 HTTP 响应在各自入口服务、路由和状态下采集。低流量时，延迟图的固定最小样本门槛也会把已有样本的窗口隐藏。

**How to apply**　核对请求回执及时间后，在对应区域按 `job/service/uri/method/status` 查实际标签，再比较共享受理事件、HTTP 响应量和延迟桶。先验证无样本、少样本及有响应但无错误序列三种窗口，再保存并独立回读主视图与双区对照。生产配置与验收证据沿工作区 [低流量与在线体验](/Users/leslie/Documents/ChatGPT/Apipltform/monitoring/aliyun/production-load-dashboard.md#2026-11-19-低流量与在线体验) 查看。
