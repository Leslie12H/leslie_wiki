---
name: free-canvas-generation-export
type: reference
created: 2026-09-16
updated: 2026-09-16
tags: [vidmuse, free-canvas, model-request, export, feishu]
links: [vidmuse-zeus, vidmuse-aion, vidmuse-admin]
---

# 自由画布抽卡数据导出入口

**Why:** 作者提交的 prompt、模型实际入参、模型生成文件、作者最终用于成片的素材是不同证据。按模板导出时不能把生成成功当成最终选片，也不能因查询页面省略长文本就认为数据已完整导出。

**How to apply:** 先从生产 `zeus_vidmuse.agent_thread` 限定用户和 `project_category`，核对删除状态与全项目覆盖；再以 `aion_thread_id` 查询 Aion 任务。各表字段和关联方式应现场核验，避免把本地开发库当生产。

## 代码与记录指针

- 任务提交原文：Aion `apps/manager/database/model/agent_thread_task.py`，核对任务 data 中的 prompt、meta、结果与 request ID。
- 实际模型参数：Aion `apps/manager/database/model/model_api_request.py` 与 `apps/manager/service/generation_snapshot.py::build_generation_snapshot`。优先按 model_request_id 精确关联；快照可能只记录 availability，要回查请求事实。缺少 ID 的失败记录独立保留，不能仅靠时间邻近做确定关联。
- CDN 地址转换：Admin `apps/admin/service/test_center_v2/adapters/mcp_tool_call_adapter.py::_file_path_to_public_url`。输出路径与公开 URL 要按当前环境映射，并做有限 HEAD 抽检；抽检不是所有链接可用性的证明。
- 2026-09-16 的三用户导出及覆盖说明：[按用户分表的数据包](https://j0yswlgboxz.feishu.cn/sheets/Ur1ds730ehABlztfIfKc6N5GnAf)。数据会变，仅存文档指针，不在知识库复制用户 prompt、素材地址或任务明细。

## 导出验收

- DMS 页面显示的缩略文本与下载 CSV 的完整长度不同；CSV 本身也可能截断较大的字段。对长 JSON 用有限长度 SUBSTRING 分段读取并拼接，逐行与数据库 CHAR_LENGTH 比较，再解析 JSON。不要只测一个短样本。
- 飞书写入后按用户分片回读，检查读取结果的 truncated / has_more；总字数上限会导致后续子表未读，不能把退出码 0 当完整性证明。
- 模板列不增加时，G 列保存初始 prompt，K 列保存逐次调用参数和结果；实际参数中的 prompt 只有逐字相同时才可明确引用 G 列，不同则保留实际全文。生成模型变体仍在逐次记录中保留。
- 作者是否选用、剪辑起止秒数、选择理由缺少证据时标记待作者确认。项目成片字段为空不能据此宣布没有生成视频。

## 当前展示版本核验（2026-09-16）

- Why：当前展示版本可用于标记抽卡结果，但不能证明用户主动选片或成片采用。
- How：读取项目 `workspace/free-dsl.json`，按 `content.media.activeVersionId` 找到版本素材，再以同项目输出路径精确关联任务；同组多个节点展示不同输出时全部列出。保留读取时间与文档 revision，未匹配要区分失败、节点已移除和节点展示其他版本。
- 自动激活语义：Aion `packages/dsl_manager/src/dsl_manager/free_canvas_dsl_manager.py::complete_generation_result`；生产静态文件地址解析：Admin `apps/admin/service/thread_analytics.py::static_base_url`。不要使用 benchmark 路由的通用域名推测生产域名。
- 写回前读在线表，用户可能已经重命名子表；用稳定 sheet ID 定位并核对任务内容，仅修改授权列。写后完整回读确认其余值未变。
