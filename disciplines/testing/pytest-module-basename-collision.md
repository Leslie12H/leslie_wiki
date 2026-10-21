---
name: pytest-module-basename-collision
type: pitfall
created: 2026-10-21
updated: 2026-10-21
tags: [pytest, ci, sharding, collection]
links: [ci-scope-and-indirect-gates]
---

# pytest 同名模块会随分片分配暴露收集冲突

**Why:** 测试目录未形成独立 Python 包、且使用默认导入方式时，不同目录的同名测试文件可能映射到同一个模块名。修改其他测试后，权重分片可让原先分开的两个文件进入同一进程；单文件通过或旧 Gate 通过不证明这组文件能够共同收集。此时是确定的 import file mismatch，不能当作业务用例失败或依靠重复重跑消除。

**How to apply:** 从 CI 提取报错中 imported module 的真实路径和待收集路径，核对二者是否都属于基线；只跑这两个具名文件的 collect-only 复现。按职责给文件唯一且明确的名字，搜索并更新显式引用，再同时执行两份用例；不为了一个文件名碰撞改变全仓 import mode。最后让完整 Gate 验证新的分片组合。隔离的代码行为回归、本地收集修复与最终 Gate 分开记录。

2026-10-21 Sand Eval 的实际复现、纯仓储文件重命名及五项用例结果，沿[联合审查记录](/Users/leslie/Documents/Playground/output/sand35029-repair-20261021/joint-review-2594.md)查询；分支、CI 和发布状态只查该记录与对应 PR。
