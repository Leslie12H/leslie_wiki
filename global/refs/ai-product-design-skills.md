---
name: ai-product-design-skills
type: reference
created: 2026-10-09
updated: 2026-10-09
tags: [ai, design, ux, skills, user-flow]
links: []
---

# AI 产品整体设计与交互动线技能入口

2026-10-09 用户关注：让 AI 的设计有整体性、交互动线和完整设计。下列选择依据维护者文档与技能正文；未在具体产品上做效果对比，不代表安装或验收完成。

**Why:** 视觉一致性、任务流程完整性和实际交互验收需要分别约束。技能的视觉输出不能单独证明业务闭环。

**How to apply:** 先定义用户、目标和成功标准，再明确信息架构、主流程与异常分支；建立统一设计规则后实现可点击原型；按真实任务逐步验收。选择一个主设计技能，其余按规划、实现、审查职责调用，避免让多个技能同时重设视觉方向。

## 上游指针

- [Impeccable](https://github.com/pbakaus/impeccable)：查看当前 SKILL.md 与 shape、critique、harden 的 reference；用于规划、体验评审和状态补全。当前命令、安装方式与运行依赖随上游变化，使用前核验。
- [Interface Design](https://github.com/Dammyjay93/interface-design)：查看当前 SKILL.md 与 README 的 system 文件约定；优先用于应用、后台和工具的设计一致性。
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)：查看当前设计系统生成与 UX 规则入口；用于设计规则选型，业务流程仍需依据具体需求定义。
- [Anthropic Frontend Design](https://github.com/anthropics/skills/tree/main/skills/frontend-design)：查看当前 SKILL.md；用于视觉方向与前端实现。
- 本机已提供 product-design:audit；从当次技能目录读取，按产品任务逐步捕获截图与行为证据，不把静态截图当作完整业务验收。

## 建议的设计交付约束

1. 用户目标、任务入口和完成判据。
2. 页面职责、导航关系与信息架构。
3. 主流程与取消、返回、重试、编辑等分支；每步写明操作、反馈、数据变化及下一步。
4. 空、加载、失败、成功、权限和未保存状态。
5. 统一设计规则与复用组件。
6. 可点击原型及关键路径实测；清楚标注 mock 数据与未实现行为。

以上流程是本次综合建议，非某一技能对业务完整性的保证。安装量和 stars 只在选型时实时查询，不存数值快照。
