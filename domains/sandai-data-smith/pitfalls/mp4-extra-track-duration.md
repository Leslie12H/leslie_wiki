---
name: sandeval-mp4-extra-track-duration
type: pitfall
created: 2026-09-19
updated: 2026-09-19
tags: [sand-eval, video, mp4, duration]
links: []
---

# MP4 附加轨道时长与画面时长不一致

2026-09-19 只读核对生产题目 `e44e5ee0-f51b-5231-b45f-16d9d0ead064`、视频 `36b92285-f804-59e1-9f9f-41143aef5cdb`：视频轨 H.264 11.920 秒、298 帧；AAC 音频轨 11.960 秒；第三条 bin_data / text、SubtitleHandler 轨为 2123.309 秒（35 分 23.309 秒）；容器 duration 为 11.960 秒。该长轨与用户报告约 35 分钟相符，但未现场复现用户浏览器，不能声称已验证特定浏览器解析行为。

**Why:** 只读容器或视频轨 duration 会漏掉异常附加轨。不同播放端可能采用不同的时间轴；不能由一个客户端正常直接推断原文件所有轨道均正常。

**How to apply:** 先按题目追溯 ev3_question.material_a → ev2_video，并以 ffprobe 同时检查 format 和所有 streams 的时长、起点、codec、tags；不要只 select v:0。核对异常长轨与用户显示值。对本地副本显式 map 视频与音频、copy 无重编码、map_chapters -1，再核对帧数及轨道时长，并在受影响浏览器复测。2026-09-19 本地副本验证清除附加轨后保留 298 帧及原音视频时长；生产文件未修改。

代码指针：sand-eval/platform/backend/app/services/facts/question_media_facts.py（视频轨 probe）；frontend/src/components/questionTypes/shared/MediaVideo.tsx（浏览器 duration 展示）。具体实现应按当前仓库重新核验。
