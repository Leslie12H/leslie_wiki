---
name: sandeval-correction-fixtures
type: reference
created: 2026-09-18
updated: 2026-09-18
tags: [sandeval, correction, test]
links: [sandeval-e2e-acceptance]
---

# Sand Eval 返修与反馈场景构造

**Why:** 返修验收需同时覆盖不合格、抽检合格和未入样，全部题拒绝不能证明只有问题题必须更新。反馈验收需由标注员真实打开页面，不能用质检员接口回读代替。

**How:** 使用测试站真实接口创建独立任务、派题、正式答题；按部分抽样或全量分配，保存不同 verdict、reason_code、severity、note 后退回标注员。保持整改单未提交供人工验收。在标注员页面核对队列类别、提交按钮门控与反馈字段。场景构造不等于完整整改提交通过。

- 2026-09-18 运行证据、页面链接与复现脚本：`/Users/leslie/Documents/Playground/output/sandeval-requested-scenes-20260918/report.md`、`pages.json`、`create.py` 及逐场景 `events.jsonl` / `fixture.json`。动态对象与当前状态以实际回读为准。
- 复用 HTTP 工作流入口：`sand-eval/platform/acceptance/e2e/flow.py`（工作树 `/Users/leslie/Downloads/sandeval-real-e2e`）；执行前验证目标环境与角色，不能假设本地分支等于已部署前端。
