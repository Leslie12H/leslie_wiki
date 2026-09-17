---
name: sandeval-roles-and-workflow
type: reference
created: 2026-09-17
updated: 2026-09-17
tags: [sandeval, permissions, supplier, quality]
links: [sandeval-local-startup]
---

# Sand Eval 角色与两侧工作流核验入口

**Why:** 2026-09-17 核验发现，旧权限文档还描述非 root 的负责人回落，而当前代码只认显式角色；旧使用指南的任务内质检按钮也不能替代新质量中心的批次验收链路。同名角色的实际能力可能不同。

**How to apply:** 先固定本地提交，再只读查询当前环境的角色与节点。不要把某次角色数量、用户名单、节点集合写成永久配置。区分系统权限、空间范围、任务内任命与导航偏好；只有角色名字不足以判定能否执行动作。

- 当前权限真相：`sand-eval/platform/backend/app/services/facts/roles.py` 的 `PROTECTED_ROLES`、`role_key_from_facts`、`nodes_from_role_facts`；API 区与数据范围见同目录 `access.py`。
- 角色运行数据：`ev2_role`、`ev2_role_node`、`ev2_account_role`；只读核对，避免输出认证标识和手机号。
- Sand 五种视角与权限无关，入口见同目录 `perspective.py`；成员管理的细粒度限制见 `app/api/space_members.py`，不能把 Settings 可见性与 Sand 根空间增删成员权限混同。
- 质量主链：`sand-eval/docs/subsystems/quality-center.md`，并核对 `frontend/src/routes/quality.tsx`、`pages/quality/QualityManagementPage.tsx` 与 `management/AllocationDetail.tsx`；旧任务内质检入口独立说明。
- 终点与判定：`backend/quality/domain/enums.py` 的关卡和推进终点；`domain/inspection/review_rules.py` 的报告判定。不要把质检报告通过直接描述为最终交付，交付关卡是否接通应现查。
