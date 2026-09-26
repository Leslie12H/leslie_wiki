---
name: bulk-allocation-stale-client-404
type: pitfall
created: 2026-09-26
updated: 2026-09-26
tags: [sand-eval, quality, api-compatibility, frontend]
links: [sandeval-deployment-availability]
---

# 质检核对方案：旧页面调用被删除接口而返回 404

**Why:** 2026-09-26 的 [PR #1982](https://github.com/world-sim-dev/sandai-data-smith/pull/1982) 将核对方案改成前端本地计算，同时删除旧预览接口。已加载旧 JavaScript 的页面仍可正常打开分配弹窗，因为 prepare 接口保留；点击核对时才暴露接口兼容断裂。页面随后恢复不能证明后端自动修复。

**How to apply:** 对照浏览器实际请求、同窗生产访问日志与删除接口的提交。已打开页面须整页刷新才能重新加载前端，弹窗的“重新加载并重置”只重新 prepare，不更新 JavaScript。未来移除前端仍可能调用的 API 时，应保留兼容过渡或显式处理客户端版本升级；仅给 index.html 设置不缓存不能更新已运行页面。

## 核验指针

- 删除接口与前端切换的提交：`6bf9b57e0b26b984897dd084d5705247ee949060`。
- 后端入口：`sand-eval/platform/backend/quality/api/router.py`；旧接口为 `POST /api/quality/leader/allocations/bulk/preview/stream`（以及非流式 preview）。
- 前端入口：`sand-eval/platform/frontend/src/pages/quality/management/BulkAllocationModal.tsx` 的 verify 与 load，及 `pages/quality/api.ts`。
- 生产日志入口：[当前 SLS](https://sls.console.aliyun.com/lognext/project/k8s-log-c9838d6fa878b43c59a6d37586f0c0747/logsearch/sandeval-prod?slsRegion=cn-shanghai)。查询 `content: "preview/stream"`。2026-09-26 北京时间 19:29:24–19:31:41 的结果为 11 条旧接口访问日志，全部 HTTP 404，分布在同一 ReplicaSet 的四个 Pod；同窗 prepare 的 nginx_http 记录均标记上述新提交。查询结果不能证明更早或更晚的全量情况。
- 同窗 19:32:03、19:32:26 的正式 bulk/stream 返回 200；19:32:26 的 transaction_trace 显示分配 resume succeeded。它证明后续出现成功分配，不单凭 HTTP 200 推断全部历史分配均成功。
- 用户“过一会恢复”与重新加载新页面相符，但没有浏览器历史请求证据证明具体刷新动作。
