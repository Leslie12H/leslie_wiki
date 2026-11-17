---
name: sandai-api-platform-playground-success-video-unavailable
type: pitfall
created: 2026-11-17
updated: 2026-11-17
tags: [sandai, api-platform, playground, video-delivery]
links: [sandai-api-platform-development-entrypoints, sandai-api-platform-playground-catalog-schema-mismatch]
---

# Playground 任务成功但结果区无法播放

**Why**　2026-11-17 的海外生产个案中，Zeus 已记录生成成功和审核通过。管理台能签发成片预览，浏览器也能解码首帧。Playground 的相同提示覆盖两种情况，成功任务的 `output.videoUrl` 为空，或播放器收到地址后触发加载错误。管理台预览使用区域源站签名，Playground 的结果签名可走媒体 CDN。确认源站可读后，仍需核对原账号的任务详情和媒体请求。 [播放器分支](https://github.com/world-sim-dev/sandai-website/blob/045efb6699d04f0f89ca383f82a7b3724a86f430/apps/platform/src/features/generations/generation-media.tsx#L93-L145) · [两种签名路径](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/infra/src/main/java/co/sandai/zeus/infra/oss/OssClient.java#L401-L410)

**How to apply**

1. 用任务 ID 在对应站点读管理台任务状态和审核结果，再通过具有内容权限的管理台 `tasks/{id}/content` 核对对应产物。浏览器的 `loadeddata` 用来验证产物首帧可解码。 [管理台内容路由](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/admin/src/main/java/co/sandai/zeus/admin/task/AdminTaskController.java) · [管理台签名](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/admin/src/main/java/co/sandai/zeus/admin/task/AdminTaskContentService.java#L429-L475)
2. 在任务所属账号查询 `GET /api/v1/platform/generations/{id}`。历史详情按当前组织查，其他账号的 404 不能判定任务缺失。成功态的 `output.videoUrl` 为空时核对结果资产选择、交付过滤和签名。地址存在时记录媒体请求的 HTTP 状态、浏览器媒体错误及刷新后的结果。记录请求 ID 和字段是否为空，省略带签名的完整 URL。 [历史详情](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/GenerationHistory.java#L55-L61) · [媒体交付条件](https://github.com/world-sim-dev/zeus/blob/7f351df52bc2ebb6ce7f0f76990bac790aba9ed3/modules/domain/src/main/java/co/sandai/zeus/domain/platform/generation/GenerationHistory.java#L277-L336)
