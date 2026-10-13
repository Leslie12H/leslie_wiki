---
name: sandeval-terminated-dispatch-material-occupancy
type: pitfall
created: 2026-10-09
updated: 2026-10-13
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


## 2026-10-13 失败副本的在途占用与主任务优先下发

**Why:** 题目数量预览与正式发布受理是两道不同的核对。失败或部分失败的发布可以在没有供应商执行任务时继续占用来源；暂停不等于释放。预览显示未下发素材充足，仍可能在正式受理被 `MATERIAL_PUBLISH_BUSY` 拒绝。

**How to apply:** 先按素材来源查占用主任务、原发布回执、租约、执行项和实际任务；对零执行任务的已失败副本，也须取得终止不可恢复的明确授权。预检、版本及计划哈希核对后调用部署版本的正式 request_action/control/finish，保留历史。解除占用后重新核对目标草稿：版本或状态变化应停止旧计划；若另一请求已发布成功，验证实际批次与题目集，不再重复创建。主任务下发与个人派题分别验收。

- 当前受理停止点：核对仓内 `sand-eval/platform/backend/app/repositories/material_dispatch.py::guard_publish` 的在途及失败发布谓词；本页不固化未来状态。
- 正式控制与不可恢复边界：核对 `app/repositories/dispatch_masters.py::request_action`、`app/services/facts/dispatch_masters.py::control` 及 `sand-eval/docs/subsystems/dispatch-masters.md`。
- 本次授权、默认只读预检、显式 apply、并发发布及 Leader/页面核验：[2026-10-13 证据](/Users/leslie/Documents/Playground/tuchong-dispatch-20261013/RESULT.md)。具体任务标识、人数和操作状态留在证据文件，复用前实时读取。


## 2026-10-13 已有草稿的开放、人数与质检验收

**Why:** 既有草稿中的批次开放开关、每题人数和质检配置是不同合同。发布成功回执不能代替执行任务确已开放、人数限制实际落库及质量系统已登记规则的证据；应答目标也不能当作已派出的个人答题卡。

**How to apply:** 默认只读预览时逐包核对素材身份、完整配额、供应商、`batches_active` 与人数策略；按用户要求通过正式保存服务最小改动，再按计划哈希显式发布。发布后独立读取冻结题目集、执行任务的空间/开放状态和人数字段、质量系统规则以及实际个人分配，最后核验页面。核对 `AssignmentPolicy`、`DispatchTaskOptions`、`DispatchRegistrationService` 与 `QualityConfigRepository` 的当前部署实现，不仅看草稿。已有失败副本仍按上节明确授权与正式终止流程处理。

- 三包下发、首包人数锁定、质量规则独立回读与页面证据：[2026-10-13 三包验收](/Users/leslie/Documents/Playground/tuchong-dispatch-20261013/THREE-RESULT.md)。具体人数、题量和任务标识只留在证据，下次重新核对。
