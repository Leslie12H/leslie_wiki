---
name: video-codec-metadata-watermark-attribution
type: pitfall
created: 2026-11-27
updated: 2026-11-27
tags: [video, ffprobe, h264, watermark, provenance]
links: []
---

# 视频编码元数据与隐形水印的查证

**Why：** 平台分发的 MP4 可能携带编码器和封装器写入的附加信息。ffprobe 逐帧报告的 `User Data Unregistered SEI` 只说明 H.264 有该类载荷。x264 的 `x264_sei_version_write` 使用固定 UUID `dc45e9bd-e6d9-48b7-962c-d820d923eeef` 写入版本和编码参数，单凭 SEI 类型容易把这类信息误认成隐形水印。MP4 的 `free` box 也可能包含封装器版本文本。

**How to apply：** 保留下载文件字节，记录分发 URL、版本和 SHA-256。用 `ffprobe -show_format -show_streams` 查看标签和轨道，用 `ffprobe -show_frames -show_packets` 查附加数据，用 `ffprobe -v trace` 查看 MP4 box。如果发现 SEI，用 `ffmpeg -c:v copy -bsf:v trace_headers` 或按视频包偏移解出载荷，核对 UUID 和实际内容。检查内嵌 C2PA 时直接核对规范所列的 BMFF `uuid` 扩展类型。像素或音频信号中的隐形水印需要对应检测器。分发版的元数据结果只适用于该文件。

2026-11-27 样本是 [A.I.Warper 的 X 帖子第一段](https://x.com/AIWarper/status/2125981679068324079/video/1) 的 1080p MP4，SHA-256 为 `dabb5856fc4091cd6741c37ff9cfe94d640b7848c928338225e63cf5c58f9ed8`。两条 SEI 的载荷均对应 x264 版本和编码参数，MP4 轨道标签和 `free` box 分别给出 X 封装器与 GPAC 字样。该样本的检查未覆盖像素或音频信号水印。

参考：[ffprobe 文档](https://ffmpeg.org/ffprobe.html)、[x264 对应版本源码](https://github.com/mirror/x264/blob/baee400/encoder/set.c#L546-L567)、[C2PA BMFF 规范](https://spec.c2pa.org/specifications/specifications/2.2/specs/C2PA_Specification.html#_the_uuid_box_for_c2pa)。
