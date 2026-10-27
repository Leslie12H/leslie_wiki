---
name: sandeval-session-recovery-impersonation
type: pitfall
created: 2026-10-24
updated: 2026-10-27
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


## 2026-10-27 整改清单的本机草稿读取失败

**Why:** 整改预检把“本机记录无法完整读取”归为unverified；侧栏也把此类阻断计入“未保存”，因此不能用该标签证明正式答案没保存。它与右侧“当前答案已更新”可以同时成立。统一错误文案可能覆盖Storage访问异常、格式错误、大草稿指针/正文不一致或待确认请求读取失败，截图不足以定位具体分支。

**How to apply:** 保留原浏览器、身份与页面；先按服务器授权的这两题作用域只读导出草稿、冲突副本、指针及待确认请求，再用准确整改链接定位服务端答案版本、内容与保存回执。管理员确认差异后定向恢复本机内容或处理已证实无效的残留，再重新核对；不清空站点存储，不在核对前重放保存/提交，也不由侧栏“未保存”要求用户重新做题。处理具体实例需要原整改链接和原设备证据，纯后台改状态不能证明本机副本已恢复。

代码指针：`platform/frontend/src/pages/myTasks/correctionDraftGuard.ts::readScope/inspectCorrectionDraft`、`autosaveStorage.ts::inspectDraftRecord`、`largeDraftStorage.ts::inspectLargeDraftRecords`、`pendingAnswerAction.ts::inspectPendingAnswerActionRecords`，以及`pages/quality/resolution/AnswerCorrectionPanel.tsx`的草稿阻断标签。普通读取与保留异常记录的检查路径要分别核对，原始备份应先于可能触发草稿恢复/整理的交互。此次仅解释截图与核对源码，没有取得当事人的整改链接或读取原设备存储，未修复具体两题。


### 2026-10-27 原设备不在现场时的交接

**Why:** 另一台电脑的浏览器草稿无法由当前电脑或服务端直接读取；正式保存回执也不能证明随后没有本机修改。

**How to apply:** 原设备先保留可见编辑文本，再由管理员在原整改页运行限定两题作用域的只读导出，保全Storage、IndexedDB、冲突副本和待确认记录；收到导出后再与正式答案核对，决定定向恢复或处理残留。不能将“换电脑继续提交”作为本机记录已保全的证据。

本次具体链接、服务端保存回执、原设备交接步骤和只读脚本见本机证据目录 `/Users/leslie/Documents/Playground/output/draft-read-20261027/`，先读 `HANDOFF.md`，再用 `read.json`核对；脚本是 `export-original-browser-drafts.js`。脚本有5个隔离检查，但尚未在报错电脑执行，具体存储错误与恢复结果仍未知。此段补充前述仅截图阶段，不能理解为已恢复原设备。


### 2026-10-27 原设备导出为空的诊断边界

**Why:** 原设备限定作用域导出若Web Storage键均为空、IndexedDB数据库不存在，能说明该次导出没有取得草稿正文，不能重现页面调用 `indexedDB.open` 时的具体失败，也不能把“导出无错误”当成页面读链路正常。导出中的account_id是预设作用域，并非实时认证身份断言。

**How to apply:** 用户确认原设备原标签后，保留导出及其哈希，核对正式保存和送审状态；不要清理并不存在的键。追加同页数据库打开探测，缺库触发upgrade时立即abort以避免创建，保存具体错误名/消息、阻塞或超时，并限定记录读取为readonly；再决定恢复或平台修复。不能仅从“数据库不存在”断言IndexedDB损坏或用户丢失草稿。

本次原设备导出、逐题空记录分析、数据库探测脚本与6项隔离检查指针：`/Users/leslie/Documents/Playground/output/draft-read-20261027/original-export-analysis.json`、`probe-original-browser-storage.js`、`check-probe-script.cjs`。原始上传为 `/Users/leslie/Downloads/sandeval-original-drafts-6c608036.json`；没有执行清理、刷新、正式保存或整批提交。探测脚本尚待用户在原设备执行，具体异常仍未知。


2026-10-27 后续证据：用户确认原设备原标签，第二份限定作用域探测仍无草稿/待确认记录，数据库打开到达创建阶段并由诊断脚本主动abort。这不支持当时发生权限拒绝或打开失败。保全证据后用户普通刷新一次，明确反馈黄色提示消失。完整结果与原始文件哈希见同目录 `storage-probe-analysis.json` 和 `current-conclusion.md`；最初页面的具体异常仍未知，刷新恢复不等于触发源已修复，也不等于整批整改已送审。
