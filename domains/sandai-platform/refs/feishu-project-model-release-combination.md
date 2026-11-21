---
name: feishu-project-model-release-combination
type: reference
created: 2026-11-21
updated: 2026-11-21
tags: [sandai, api-platform, feishu-project, release-management]
links: [sandai-api-platform-development-entrypoints]
---

# 飞书项目发布组合与已有版本的关联

**Why**

发布组合需要追溯到版本台账中的记录。Base Model、Quant Model 和 PE 在 Magi War Room 通过同一「版本」工作项类型管理，使用「版本类型」字段区分。

**How to apply**

1. 到「对外模型 → 字段管理」确认是否已有对应的「单选关联工作项」字段。新增时选择本空间的「版本」作为关系目标。已被使用的关系在新字段的选择器里可能不显示，分别建立有明确名称的关系。
2. 在字段的「固定数据范围 → 设置数据范围」中用目标版本的「版本类型」限制候选。检查默认条件是否为「是否完成等于否」，避免无意排除已完成的版本。
3. 到「页面布局 → 详情页布局」把新增字段拖入基本信息。通过实例中的选择器核对工作项 ID，并从量化版本详情核对其来源 Base。
4. 选中条目后页面可以先显示新值。等待保存后重新打开实例，逐项回读 Base、Quant 和 PE。关联回读仅验证版本引用，兼容性和发布状态须回查对应评测与上线记录。

2026-11-21 核验入口见 [对外模型字段管理](https://project.feishu.cn/magi-war-room/setting/workObject/6b013ea22d0cf6415783aa9c?menuTab=fieldManagement)、[版本台账](https://project.feishu.cn/magi-war-room/version/homepage) 和 [发布组合实例](https://project.feishu.cn/magi-war-room/openmodel/detail/7175214507)。
