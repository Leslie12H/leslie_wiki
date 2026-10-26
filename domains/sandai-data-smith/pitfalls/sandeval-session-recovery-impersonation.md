---
name: sandeval-session-recovery-impersonation
type: pitfall
created: 2026-10-24
updated: 2026-10-26
tags: [sand-eval, authentication, impersonation, browser-draft]
links: [sandeval-returnable-impersonation]
---

# 登录草稿恢复与代登录必须一起验收

**Why:** 普通账号重新登录与管理员代登录恢复不是同一条身份链。只保留原页面并强制同一 user_id，会在管理员重新登录本人后留下缺少返回目标身份的路径；另一组件直接重载也可能绕过草稿写入保护。异步大草稿与后续小修改并行写入，可能让旧快照覆盖新正文；恢复原答案若还原整份判断，会连未保存意见一起覆盖。

**How to apply:** 同时检查 AuthContext 的恢复、SessionRecoveryDialog、ImpersonationBar 轮询、auth.py 飞书回调和控制 Cookie。使用原生授权切号、现场权限和会话版本校验，不能为恢复取消账号隔离。恢复前等待本机写入并检查失败；大小草稿共用顺序，冲突副本必须独立可发现。恢复原答案只还原答案/关联判断，不清空意见和证据。将打回说明、仲裁意见和在途编辑纳入离开保护。

2026-10-24 修复与证据指针：[PR #2831](https://github.com/world-sim-dev/sandai-data-smith/pull/2831)。主要复核 frontend/src/contexts/AuthContext.tsx、components/ImpersonationBar.tsx、pages/myTasks/useAnswerAutosave.ts、largeDraftStorage.ts、pages/quality/inspection/StructuredAnswer.tsx、ReviewWorkspace.tsx 和 backend/app/api/auth.py（均位于 sand-eval/platform）。以 PR 的当前代码、检查和发布记录为准，不把本页当部署状态。

联合验收应包含普通账号重登、管理员重登后显式切回目标、其他标签页切号、旧 Cookie 期限、先大后小写入、冲突副本在共享草稿删除后恢复、存储失败、质检恢复原答案保留意见。标注→供应商质检/验收→Sand→原生退回→整改→复验的正式链路，分别验证来源版本、历史意见、幂等回执和失败回滚。

证据边界：隔离浏览器的真实组件搭配模拟认证、后端实际服务搭配隔离存储，可以验证代码路径，不能证明原设备历史输入已恢复或生产整链已验收。本机草稿不等于正式保存；尚未落入草稿的表单字段由离开确认保护，不能宣称确认放弃、清空浏览器或设备损坏后仍可恢复。


## 2026-10-26 会话有效期与弹窗归因

**Why:** Cookie 的保存期限不等于代登录 JWT 与服务端控制记录的可用期限；仅凭“登录状态需要恢复”截图，不能认定一定是定时过期，也不能由普通登录的配置推导切号时长。

**How to apply:** 先核对 `platform/backend/app/services/facts/impersonation.py` 的 `DELEGATED_SESSION_SECONDS`、`start` 中原登录到期封顶，以及 `transition` 是否重算到期时间；再对照 `platform/backend/app/api/auth.py` 的 Cookie 写入和 `platform/k8s/configmap.yaml` 的普通登录/飞书会话策略。前端沿 `platform/frontend/src/contexts/AuthContext.tsx` 的 401、会话 revision/账号变化分支，以及 `contexts/SessionRecoveryDialog.tsx` 查触发条件。延长代登录必须区分“至多指定时长”和“从切号起完整指定时长”，后者还受原登录剩余时间约束；保留禁用、撤权和撤销检查。

核验入口为 [main 代登录服务](https://github.com/world-sim-dev/sandai-data-smith/blob/main/sand-eval/platform/backend/app/services/facts/impersonation.py) 与 [main 会话配置](https://github.com/world-sim-dev/sandai-data-smith/blob/main/sand-eval/platform/k8s/configmap.yaml)。本次生产 Kubernetes 只读访问返回 Unauthorized，因此源码结论不能直接当成生产实例配置或截图个案根因；线上时长、部署版本和个案 401 原因须重新获取实时证据。

实现与交付核验入口：[main PR #2870](https://github.com/world-sim-dev/sandai-data-smith/pull/2870)、[main PR 完整 Gate](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/40312872592)、[main 自动发布](https://github.com/world-sim-dev/sandai-data-smith/actions/runs/40313172770)。历史测试 PR #2869 及任务分支独立 Gate 仅作冲突处理背景；最终交付沿 main PR 与自动发布核验。沿 PR 的最终差异与精确 head 检查代登录上限、原登录封顶、连续切号到期不变，以及内置管理员帮助。新签发会话和旧已签发会话分别验收，不能把本地回归、独立分支 Gate、可合并性、测试发布和生产生效视为同一结论；动态状态以 PR/Gate 和运行态为准。

生产无凭据只读核验可从 `https://eval.sandaii.cn/health` 的 `deploy_sha`、`deploy_image`、`deploy_version` 入手，并对照合并提交及发布流程的镜像/rollout 回执。健康返回成功不等于个案浏览器会话已经恢复；不要为证明期限而静默重登或恢复业务提交。
