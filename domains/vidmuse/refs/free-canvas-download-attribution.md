---
name: free-canvas-download-attribution
type: reference
created: 2026-09-17
updated: 2026-09-17
tags: [vidmuse, free-canvas, quicktracking, export]
links: []
---

# 自由画布下载埋点与生成版本关联

**Why:** 当前画布展示、发起下载、下载完成和成片采用是四种不同证据。不能用 activeVersionId 推定用户最终选择，也不能用素材所属用户推定下载者。

**How to apply:** 从 QuickTracking 同时按版本 ID 和用户账号分组，保留查询日期范围。将版本定位到相应项目 free-dsl.json 的 media.versions，再用任务 meta.generation.slotIds、meta.canvas.nodeId 和 result.file_path 交叉校验。模型实际入参由 model_request_id 精确关联模型请求；任务提交 prompt 与实际请求 prompt 分别保留。版本字符串中的 generation UUID 不是任务 ID，不要直接拿它查任务主键。

## 实时证据入口

- [QuickTracking 下载报表](https://quicktracking-ap-southeast-1.quicka.aliyun.com/platform/39122605188288/analysis_insight/segment/qkesht2bfv9l7pmmfcp818ll5mkj8ubk)：核对事件定义、日期、分组、查看 SQL 和完整分页。2026-09-17 调查看到的是 canvas_asset_download_started；只能标记发起下载，不能证明保存完成。
- 该次界面 SQL 的账号关联经过事件 eid 与用户维表 sys_eid/tenant 映射到 sys_user_id；设备 ID 的次数不是用户 ID，也不是下载完成次数。使用前重新核对当前 SQL。
- 生产 agent_thread 查项目归属和 FREE_CANVAS 类别；项目工作区 free-dsl.json 查具体版本；生成任务 JSON 查 meta、model_request_id、初始 prompt 和产物路径；aion 的 model_api_requests.request_params 查实际调用参数。
- [导出 skill 实现和说明](https://github.com/world-sim-dev/vidmuse-codex-plugins/pull/3)：复用按用户分表和原 13 列模板；合并状态以 PR 实时状态为准。

## 判定边界

- 同组抽卡按用户、项目、原始 prompt 和完整参考素材绑定分组；按提交时间排序，显式说明“本组第 N 次”。不同节点可以属于同组。
- 同组可能多个版本都发起下载。只有日期聚合时不能推出最后一次下载，逐条保留，不任意挑一个。
- 没有窗口内事件不代表从未下载。缺少 model_request_id 时只标提交参数，不能伪称实际入参；未关联请求作为附录保留且不重复计入抽卡次数。
- 源任务 JSON 可能在末尾 generation_snapshot 处截断。先核对数据库 JSON_VALID 和字节/字符长度，区分源损坏与导出限制；仅恢复完整字段并标注。可通过完整的请求 ID 找回实际参数，不补造残缺 JSON。
- 导出前固定任务截止时间，分别记录画布快照获取时间。全部分页、所有任务唯一覆盖、ID/路径匹配、写后完整回读共同构成验收。
