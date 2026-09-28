---
name: runner-log-scope-and-error-count
type: pitfall
created: 2026-09-16
updated: 2026-09-16
tags: [vidmuse, admin, runner, logs, rendering, evidence]
links: [vidmuse-admin, vidmuse-aion, storyboard-label-sync-without-visual-verification]
---

# Runner 日志范围、错误计数与精确帧异常

**Why:** Admin 的日志默认视图只提供有上限的末尾片段；即使成功加载当前文件，也不能据此声称覆盖 Thread 的全部历史。同一异常可能被内外层各记录一次，重复余额提示也不等于多个独立故障。视频错误文本还必须回到抛出位置解释，否则容易把中间产物校验失败误判为源视频损坏或当前仍未恢复。

**How to apply:** 先确认日志来源、读取模式、时间范围与时区，再按调用标识、时间窗口、异常信息和产物路径归并事件。对每个事件分别核对起因、失败步骤、重试及最终结果；把日志行数、独立尝试次数和仍未恢复的故障数分开报告。

## 日志覆盖范围的验收

- 在 Admin 的 Workflow & Logs 页面先辨认 tail/full 模式。2026-09-16 核验的实现默认读取 `runner.log` 末尾最多 1 MiB；点击 `Load full log` 后，必须确认完成状态为 `Full log loaded`，不能以点击成功、下载进度完成或仍显示旧文本代替完整读取成功。
- 对接口读取同时核验响应模式；前端会检查 `X-Log-Mode: full`，防止旧服务忽略 `full` 参数却把截断内容标为全量。页面/API 行为以使用时的实际部署为准。
- full 的边界是本次打开的当前 `runner.log` 在开始读取时已存在的内容；不包含此后追加，也不自动拼接已轮转文件。记录首尾时间戳与文件/响应范围；历史仍可能缺失。
- 页面卡顿、读取失败或超时应列为本次取证限制，不能直接解释成业务任务失败。只有足够证据时才归因具体性能原因。

## 错误归并与结果核验

- 相同异常从 `_merge_video_clips` 向 `execute_otio` 传播时，内外层错误日志可能属于同一次渲染尝试。按对应调用、异常及输出路径去重，保留所有原始行以便追溯。
- 重复 low-credit 提示应先关联到余额检查或受阻动作，不按行数推算受损素材数。参数越界、空视频轨、渲染失败等分别归类，不混成单一系统故障。
- 历史失败与当前结果独立核验：找后续重试、成功返回、当前有效产物和可播放文件。存在历史 ERROR 不能单独证明当前仍失败；最终成功也不抹去历史失败。

## 精确帧异常应如何解释

`flex_video_duration` 的精确帧分支先等待 FFmpeg 命令成功，再以 `ffprobe -count_frames` 读取输出视频的可解码帧数，并与目标帧数比较。`expected N, decoded N-1` 表示这一步中间输出的可解码帧数少于约定；仅凭该信息不能认定输入源视频损坏，也不能认定后续尝试仍然失败。进一步原因需要对应输入、完整命令、媒体时间戳和当次运行版本。

## 代码和案例指针（使用时重新核验）

- Admin 仓库 `~/Downloads/sandai-code/vidmuse-admin/`：`playground/src/components/LogViewer.tsx` 的读取状态；`playground/src/api/client.ts` 的 tail 参数和 full 响应头校验。
- 同仓 `apps/admin/controller/public/thread_logs.py`、`apps/admin/service/thread_logs.py`：当前文件、EOF 快照、截断/中断处理与响应头。回归入口为 `playground/src/components/LogViewer.test.tsx`、`playground/src/api/client.threadLogs.test.ts`、`apps/admin/tests/test_thread_logs_api.py`。
- AION 仓库 `~/Downloads/sandai-code/aion/`：`apps/runner/common/video/flex_video_duration.py` 的 `get_decoded_video_frame_count` 与 FFmpeg 后置帧数校验。2026-09-16 源码核验锚点为 `079dfb5e19aee635d42b67a4c29adea858dc7ce6`；源码锚点不等于当次生产部署版本。
- [本次 Thread 的 Admin 入口](https://prod-vidmuse-admin.vidmuse.ai/playground/thread/c3e4bba0-deea-4c21-8482-e2aba194c9b9)：进入 Workflow & Logs 重新取证。文件体积、行数、错误数量和生产恢复状态不作为长期知识保存。
- [分镜标签同步与视觉核验](storyboard-label-sync-without-visual-verification.md)：日志操作成功、文字一致与实际成片验收之间的边界。
