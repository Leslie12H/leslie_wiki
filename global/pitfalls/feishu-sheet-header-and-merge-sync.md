---
name: feishu-sheet-header-and-merge-sync
type: pitfall
created: 2026-09-10
updated: 2026-09-10
tags: [feishu, sheets, synchronization]
links: []
---

# 飞书表格同步：列位置、合并区域与状态优先级

**Why:** 用户插入列后，固定列偏移会把日期、当前状态等解释成其他字段；合并公司单元格的后续志愿行仍有业务含义，不能因公司格为空就丢弃。旧投递勾选与明确的当前状态也可能不一致。

**How to apply:** 先读表头和实际合并区域，按字段名映射，仅展开明确的纵向合并；按物理行号分批读取并核对 revision 与完整性。明确当前状态优先于旧勾选，未知状态停止写入。写前备份、事务 upsert、写后逐字段读回，再以无差异 dry-run 检验幂等性。保留未标年份的原始投递日期，不补造时间。单次同步成功不代表定时或事件订阅已启用。

## 当前实现指针

- `/Users/leslie/Documents/面试 2/sync_feishu_applications.py`：读取、映射、备份、事务及核验入口。
- `/Users/leslie/Documents/面试 2/test_feishu_sync.py`：插列、冲突、合并行与重复执行回归。
- 飞书源表：https://my.feishu.cn/wiki/XYzfwMEyMiiypWkCh8aclBB7n2f 。实时行数、状态及调度开关以现场查询为准。
