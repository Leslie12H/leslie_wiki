---
name: sandeval-session-recovery-impersonation
type: pitfall
created: 2026-10-24
updated: 2026-10-24
tags: [sand-eval, authentication, impersonation, browser-draft]
links: [sandeval-returnable-impersonation]
---

# 登录草稿恢复与代登录必须一起验收

**Why:** 普通账号重新登录与管理员代登录恢复不是同一条身份链。只保留原页面并强制同一 user_id，会在管理员重新登录本人后留下缺少返回目标身份的路径；另一组件直接重载也可能绕过草稿写入保护。异步大草稿与后续小修改并行写入，可能让旧快照覆盖新正文；恢复原答案若还原整份判断，会连未保存意见一起覆盖。

**How to apply:** 同时检查 AuthContext 的恢复、SessionRecoveryDialog、ImpersonationBar 轮询、auth.py 飞书回调和控制 Cookie。使用原生授权切号、现场权限和会话版本校验，不能为恢复取消账号隔离。恢复前等待本机写入并检查失败；大小草稿共用顺序，冲突副本必须独立可发现。恢复原答案只还原答案/关联判断，不清空意见和证据。将打回说明、仲裁意见和在途编辑纳入离开保护。

2026-10-24 修复与证据指针：[PR #2831](https://github.com/world-sim-dev/sandai-data-smith/pull/2831)。主要复核 frontend/src/contexts/AuthContext.tsx、components/ImpersonationBar.tsx、pages/myTasks/useAnswerAutosave.ts、largeDraftStorage.ts、pages/quality/inspection/StructuredAnswer.tsx、ReviewWorkspace.tsx 和 backend/app/api/auth.py（均位于 sand-eval/platform）。以 PR 的当前代码、检查和发布记录为准，不把本页当部署状态。

联合验收应包含普通账号重登、管理员重登后显式切回目标、其他标签页切号、旧 Cookie 期限、先大后小写入、冲突副本在共享草稿删除后恢复、存储失败、质检恢复原答案保留意见。标注→供应商质检/验收→Sand→原生退回→整改→复验的正式链路，分别验证来源版本、历史意见、幂等回执和失败回滚。

证据边界：隔离浏览器的真实组件搭配模拟认证、后端实际服务搭配隔离存储，可以验证代码路径，不能证明原设备历史输入已恢复或生产整链已验收。本机草稿不等于正式保存；尚未落入草稿的表单字段由离开确认保护，不能宣称确认放弃、清空浏览器或设备损坏后仍可恢复。
