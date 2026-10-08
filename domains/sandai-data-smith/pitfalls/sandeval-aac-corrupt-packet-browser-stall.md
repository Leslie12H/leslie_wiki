---
name: sandeval-aac-corrupt-packet-browser-stall
type: pitfall
created: 2026-10-08
updated: 2026-10-08
tags: [sand-eval, video, audio, aac, browser, media-quality]
links: [sandeval-mp4-extra-track-duration]
---

# AAC 坏包导致浏览器在固定时间停止播放

**Why:** 2026-10-08 排查冯杰反馈的视频在11.44秒加载失败。原OSS对象本地副本在独立浏览器停在11.448619秒，原生错误code=3，明确指出11.726077秒的AAC包无法解码。视频有403帧、25FPS、16.12秒，画面可以完整解码；不能由下载成功、CDN 206或视频轨时长正确推断音轨完整。只重编码音轨的验证副本保持视频压缩数据哈希一致，在同一浏览器完整播放并支持11.44秒定位。未修改生产素材。

**How to apply:** 按task/question/assignment追溯ev3_question.material_a和ev2_video的真实对象，核对对象版本及当前交付映射。保存原件校验和；检查全部音视频轨、全片严格解码和浏览器原生error.code/message，以坏包PTS与播放停点关联。用只修音轨、保留画面的副本做独立对照，再在真实题目验证播放、逐帧定位与分割保存。码流重编码不能凭空恢复已损坏的音频内容，生产修复优先从上游原片重建，或明确记录坏包跳过/补齐的影响。

## 当前核验指针

- 个案版本、完整音视频探测、坏包偏移、CDN限定样本和浏览器对照见[2026-10-08诊断报告](/Users/leslie/Documents/Playground/output/sandeval-video-20261008/report.md)。具体账号、地址与实时版本每次重新读取，不能把历史样本当作当前健康状态。
- `sand-eval/platform/backend/app/services/facts/navigation_frame_facts.py::_probe_navigation_grid`核验视频轨帧网格；`media_preparation.py::MediaPreparationService`核验对象版本、可读性和交付一致性。查当前实现是否另有完整音轨解码健康检查，不把上述校验当作AAC完整证明。
- `sand-eval/platform/frontend/src/components/questionTypes/shared/MediaVideo.tsx`的原生onError与`mediaDeliveryRecovery.ts`需区分解码错误和网络错误。同一坏对象反复签发地址不能修复码流。
- 预防性导入/产出校验要让解码错误严格失败并记录轨道与时间。默认FFmpeg可打印错误后退出0；不能只用元信息或默认退出码判断。具体严格校验命令与原件/副本结果存于报告关联证据，不作为已实现平台能力。

额外轨道异常和坏AAC包是不同问题：另见[MP4附加轨道时长异常](mp4-extra-track-duration.md)，不要沿用旧个案的根因。
