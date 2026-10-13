---
name: sandeval-workbench-context-404-evidence
type: pitfall
created: 2026-10-13
updated: 2026-10-13
tags: [sand-eval, correction, shared-observation, authorization, evidence]
links: [sandeval-transferred-correction-task-visibility, sandeval-direct-return-interrupted-by-leader]
---

# Sand Eval 工作台 404 与任务事实分层取证

**Why:** 整改处置、当前任务持有人、检查轮次与页面身份解析属于不同环节。工作台在加载原业务内容前还可能经过共享查看接口；其 404 不能单独证明任务不存在。管理员只读查看使用的身份和权限也不同于人员原始会话。当前页面能打开不能证明历史报错根因已被修复。

**How to apply:** 固定源任务、质量任务、处置、轮次、责任人及部署 SHA，先核对持久化事实和当前角色，再核对两侧任务列表与工作台。日志分别聚合原业务 API 与 `/api/workbench-observation/context`，记录明确时间窗口及成功/失败状态。按人员账号只读调用线上代码时，必须同时执行路由权限依赖和处理器；仅调用处理器不能验证完整接口授权。使用独立应用实例、不启动 lifespan 或恢复任务，并开启 Holo DML 拒绝。保留原登录账号、原始网址、请求体和错误正文；仅有来源页面与状态码时，保持历史原因未知，不推断为缓存、旧链接或权限问题，也不据此补派或重建任务。

- 2026-10-13 澳鹏 9.30 声音批次的数据库时间线、身份门禁、浏览器只读查看、接口 404/200 聚合、部署指纹和未知项：[只读取证报告](/Users/leslie/Documents/Playground/sandeval-aopeng-missing-20261013/report.md)。任务状态、人员、部署与报错是否仍发生须从报告脚本和现行环境重新核验，知识页不保存当前结论。
- 入口指针：`sand-eval/platform/backend/app/api/root_observation.py` 的 `open_context` 与 `resolve_owner`；`app/dependencies.py` 的 `require_area`；`app/services/facts/shared_observation.py` 的页面资源与共享授权；`app/repositories/observation.py` 的精确责任人查询；前端 `pages/observation/RootReadBoundary.tsx` 的加载与错误展示。源码会变，按线上 SHA 读取。
- 相邻场景：[改派后的整改可见性](sandeval-transferred-correction-task-visibility.md)、[重复退回与旧轮次只读](sandeval-direct-return-interrupted-by-leader.md)。先确认是否属于对应场景，再复用修复方法。
