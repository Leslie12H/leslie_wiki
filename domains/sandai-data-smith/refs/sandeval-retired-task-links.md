---
name: sandeval-retired-task-links
type: reference
created: 2026-09-18
updated: 2026-09-18
tags: [sand-eval, routing, troubleshooting]
links: []
---

# Sand Eval 旧任务链接排查指针

**Why:** 路由退役后，站内手拼链接可能遗漏更新；HTTP 返回 200 仍可能由 React 显示页面不存在，不能据此判断任务被删除或服务故障。

**How to apply:** 先读取用户 URL 的 HTTP 响应和登录后的页面，再核对该站实际加载的 JS 路由与链接生成器。代码会变化，以下位置需现场重验。

- 路由契约：`sand-eval/platform/frontend/src/routes/taskDetail.tsx`，包含旧 `/all_space_tasks/:taskId` 退役理由与空间任务地址。
- 地址生成：`sand-eval/platform/frontend/src/domain/paths.ts::taskPath`。
- 漏改入口排查：`pages/questionBankItems/QuestionSetTasksPage.tsx` 任务名称链接；`pages/questionTypes/QuestionTypeDetailPage.tsx` 相关任务链接（均相对 frontend/src）。
- 2026-09-18 现场：测试站旧任务答题卡链接显示“页面不存在”；同次下载的 `index-TrNwH4Db.js` 含上述两个旧地址生成器与新空间任务路由。仅诊断，未修改或部署业务代码。该结果不证明某个任务的数据状态。

## 下发接口与页面地址混用

2026-09-18 追加排查：`frontend/src/pages/questionBankItems/taskWizard.ts` 的请求构造必须使用后端 `app/api/question_bank_items.py::question_sets_router` 的前缀，不可使用 React 页面地址。`api/client.ts` 会自动添加 `/api`。用真实 fetch 边界测试覆盖创建和 preview，避免弹层测试 mock 掉整个 client 后漏检。

修复与 Gate 的可变状态见 [PR #1350](https://github.com/world-sim-dev/sandai-data-smith/pull/1350)，目标为 `sandeval-test-only`。是否部署须另查 Test Build and Deploy 工作流，分支合并不等于测试站生效。
