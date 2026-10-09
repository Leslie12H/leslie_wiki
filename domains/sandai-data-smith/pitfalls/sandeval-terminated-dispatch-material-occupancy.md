---
name: sandeval-terminated-dispatch-material-occupancy
type: pitfall
created: 2026-10-09
updated: 2026-10-09
tags: [sand-eval, dispatch, recovery, production]
links: [sandeval-dispatch-history-fixture]
---

# 已终结主任务与素材未下发范围

**Why:** 停止执行任务与释放素材的有效下发占用是两个事实。误下发后只核对“已终结”标签，不能据此认为素材已回到未下发；反过来，直接抹去下发记录会丢失审计。必须从有效历史谓词、正式主任务操作与逐素材身份共同判断。

**How to apply:** 针对人类明确授权的误发恢复，先固定原包、误发主任务、执行任务和需要保留的正常批次；备份、核对版本、未完成操作以及领取/答案/草稿，逐 material_id 核验误发与保留范围无交集。使用 owner 的 operator CLI 默认只读预检、显式 apply、审阅计划哈希和幂等请求ID，调用已部署正式操作。恢复后独立回查实际可选择的未下发ID集合、正常批次未变、历史保留、操作回执，再验收页面。不能无条件套用于有答案、尚未终结或仍在执行的批次。

## 当前逻辑核对入口

- `sand-eval/platform/backend/app/repositories/material_dispatch_history.py::EFFECTIVE_HISTORY`：核对哪些空间和主任务状态进入有效下发统计。2026-10-09核对时，terminated仍计入，deleted排除；下次操作必须重查当前部署。
- `sand-eval/platform/backend/app/repositories/material_dispatch.py::inspect`、`page`：核对统计及实际可再次选择的素材范围，不能只改页面数字。
- `sand-eval/platform/backend/app/repositories/dispatch_masters.py::DispatchMasterRepository.delete` 与对应 actions/delete API：核对创建人限制、可删除状态、版本、软删除及正式审计；不可绕过归属限制或改为物理清除历史。
- `sand-eval/docs/subsystems/dispatch-masters.md` 的主任务页面删除章节：正式产品操作与数据保留契约。
- [发题历史验收场景](../refs/sandeval-dispatch-history-fixture.md)：供应商空间分类与去重素材身份的核对边界。

## 2026-10-09授权恢复证据指针

本次恢复的前后范围、部署版本、正式操作回执、临时operator CLI和页面截图，统一见 `/Users/leslie/Documents/Playground/sandeval-unissue-647-20261009/RESULT.md` 与同目录证据文件。具体数量与任务状态是当次快照，不能当作当前生产事实复用。
