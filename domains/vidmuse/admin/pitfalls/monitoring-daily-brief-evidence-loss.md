---
name: monitoring-daily-brief-evidence-loss
type: pitfall
created: 2026-09-10
updated: 2026-09-11
tags: [vidmuse, admin, monitoring, daily-brief]
links: [monitoring-problem-title-vs-incident-report]
---

# 日报质量要沿证据输入、综合、渲染与发送链路排查

**Why:** 2026-09-10 对照详尽人工告警总结排查 Admin 代码时，发现问题不只在提示词：摘要字段裁剪、首批记录采样、Top N 展示及模型异常静默降级都会丢失独立故障、影响边界和原始引用。HTTP 200 只证明预览接口返回，不证明智能研判执行成功。不要把未确认的模型配置或 Provider 故障当成生产静默降级的已知根因。

**How to apply:** 使用固定带时区窗口；核对实际加载记录与完整报告；让模型引用真实事故并检查全量覆盖；原始链接与记录计数由程序生成；分别展示请求终态、告警恢复、证据缺口和全量处置统计。源数据没有的日志或群消息不能靠提示词补齐。上线前用真实同窗数据逐项验收，契约测试通过不能替代语义验收。

## 代码与验证指针

- Admin 仓库 `apps/admin/service/monitoring_daily_brief_report.py`：综合、生成诊断、预览与发送边界。
- 分支 `codex/monitoring-brief-quality-20260910` 的 `apps/admin/service/monitoring_brief_evidence.py`：证据净化、来源引用和覆盖契约；`monitoring_incident_query.py` 的 `get_brief_evidence`：firing 窗口批量读取。应确认分支是否已合入，不能当成已部署状态。
- 同分支 `docs/monitoring-daily-brief-quality.md`：时间窗口、七类语义验收目标及已验证边界。
- `POST /admin/api/v1/monitoring/incidents/daily-brief/preview` 只预览；不要用 send 代替。重新核对当前版本参数与诊断字段。
- [历史 Problem 标题与当次报告](monitoring-problem-title-vs-incident-report.md)。

## 发送身份与群成员不一致

**Why:** 2026-09-11 的生产诊断返回 HTTP 400 / `230002`。截图里有抓虫机器人，但实际 token 对应通用后台机器人；专用 App ID 未配置导致客户端回退。仅看显示名称或 HTTP 状态会误判为未入群、卡片过长。

**How to apply:** 对照 Admin `service/feishu_bug_bot/clients.py` 的实际凭据选择，读取所选 App ID 与 `/bot/v3/info/` 返回身份，再核对目标群。专用 App ID 与 Secret 应成对配置。不要打印 Secret/token；先保留业务错误码再决定是否重试。卡片正文长度与整卡字节预算是独立校验，来源折叠只改善展示。当前配置、代码和发布状态到 Admin `docs/monitoring-daily-brief-quality.md` 及生产现场核验，不从历史快照推断。

## 2026-09-12 定时生成失败排查

**Why:** 模型 HTTP 200 不证明 JSON 有效；将格式错误归为不可重试，会阻断当天日报。同窗复现使用当前调查数据，不能冒充历史响应证据。

**How to apply:** 查 SLS 的 synthesis_finished/send_deferred/send_failed，核对 `_try_llm_synthesize`、`_defer_failed_brief` 和 Redis 当日 guard。仅生成复现保存结束原因、解析位置与输入体积，不用真实发送诊断 JSON。

- 历史证据：本机 `/private/tmp/admin-daily-brief-failure-20260912.log`，原始导出 `/Users/leslie/Downloads/32647-076ae317f0bde752a32488c4d59d472e.csv.gz`。10:00 触发、模型 HTTP 200、35 秒后 invalid_output、当天不再重试。历史具体校验码和原始响应没有保留。
- 仅生成复现证据：生产 Pod 临时文件 `/tmp/brief-diagnostic-20260912.json`（随 Pod 删除失效）。同窗 28 条事故，实际请求 22925 字符，响应正常 stop；JSON 内嵌 Service temporarily unavailable 的英文引号未转义，解析失败。字符级原因仅对复现已证实。
- `build_report_with_llm` 在综合失败后仍检查无 LLM 预览卡体积，可能追加 card_size_limit；应与首要失败原因区分，不能据此断言模型生成卡太长。

- 2026-09-12 本地修复指针：Admin 隔离工作树 `/private/tmp/admin-brief-json-20260912`，分支 `codex/brief-json-format-20260912`。JSON 语法修复共用三次调用和总超时预算；invalid_json 可按已有三次调度上限重试；输出诊断仅记录固定错误码、位置与长度。78 个相关测试通过；尚未发布。到该分支确认后续交付状态。

- 2026-09-12 后续修复方向：同一 Admin 分支改用 submit_daily_brief 结构化返回，工具定义经 GenerateTextRequest.extra_params 传递至 Bedrock toolConfig，由适配器序列化参数。该工具不执行发送。用户允许模型整理和改写表达，不要求逐字保留；事实与不确定性仍需保留。验证指针为 test_structured_output_preserves_literal_error_quotes，涵盖真实适配器转义；80 项后端测试通过，尚未生产验证。
- 同分支 Chat 复制交互：playground/src/components/ChatTab.tsx 与 ChatTab.selectionCopy.test.tsx。取消进入模式步骤，桌面悬停或键盘聚焦显示选择入口，已选保持显示；触屏保留可见入口。工具栏移出消息滚动区。用户否定桌面常驻整排勾选框。60 项 Chat 测试与 TypeScript 检查通过，未部署。

- 2026-09-12 Chat 后续交互验证指针：同一分支的 ChatTab.selectionCopy.test.tsx 新增反向 Shift 连选、筛选排除和 Esc 清空测试；选择入口移至消息边缘不占正文列，范围由当前渲染的消息勾选框确定，复制仍按原始时间线。13 项复制测试、49 项相关 Chat 回归及 TypeScript 通过，未部署。
