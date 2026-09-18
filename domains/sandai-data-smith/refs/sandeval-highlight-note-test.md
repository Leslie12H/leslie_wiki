---
name: sandeval-highlight-note-test
type: reference
created: 2026-09-18
updated: 2026-09-18
tags: [sandeval, material-import, acceptance]
links: [sandeval-e2e-acceptance]
---

# 高光题型素材备注验收入口

**Why:** 体验样例、导入映射预览、素材包列表、任务冻结题面与标注答案是不同证据层；一处显示备注不能证明全链路保留。测试过程中页面列配置也可能不同，未核验版本前不要将展示缺失归因为后端丢失。

**How to apply:** 以既有测试视频构造普通备注、多行特殊字符、空备注三条对照，分别回读导入、下发、派题终态。按视频对象和外部编号关联样本，不能假设素材列表顺序与输入相同。实际标注提交与不落库预览分开报告。

- 本次场景、真实对象链接、浏览器观察与待验证项：`/Users/leslie/Documents/Playground/output/sandeval-highlight-notes-20260918/report.md`。
- 可复用输入：同目录 `highlight-notes.jsonl`。
- 题面预览组件调查入口：`sand-eval/platform/frontend/src/pages/dispatchMasters/MaterialPreview.tsx`；运行环境行为与部署版本须现查。
