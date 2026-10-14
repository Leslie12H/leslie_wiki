---
name: macos-storage-cache-vs-state
type: pitfall
created: 2026-10-14
updated: 2026-10-14
tags: [macos, storage, cache, go, icloud, codex]
links: []
---

# macOS 清理：构建缓存、应用状态与云盘扫描

**Why:** 2026-10-14 的整机存储排查发现，开发仓库的被忽略目录可能积累多份 Go 构建缓存；同一个 `.tmp` 也包含测试证据、截图和临时数据库，不能整目录删除。应用数据目录里的会话、SQLite、虚拟磁盘也不能仅因占用大就当作缓存。

**How to apply:**

1. 先用 `df -k /System/Volumes/Data` 固定可用空间，再按目录检查。整机 `du` 若停滞，检查该扫描进程的打开目录；本次卡在 `~/Library/Mobile Documents` 的 iCloud 目录访问，后续本地扫描排除 `Mobile Documents` 和 `CloudStorage`。受 macOS 隐私保护而不可读的路径明确列为未统计，不用目录估算冒充全盘审计。
2. Go 构建缓存须验证根目录 README 的官方缓存说明、无跟踪文件和 Git ignored，并检查当前 Go 编译/测试进程。按精确 `GOCACHE` 使用 `go clean -cache`，不删除包源码或证据目录。Maxwell 的缓存位置以其 [AGENTS.md](/Users/leslie/Downloads/sandai-code/maxwell-ai/AGENTS.md) 为当前入口，包含 `.tmp/` 下的独立实验缓存。跨仓库扫描还需覆盖 `services/*/.tmp/`、嵌套实验仓库与 `.claude/worktrees/`；只检查主仓库一级 `.tmp` 会漏掉缓存。递归遇到已验证的缓存根目录就停止深入，避免把缓存内部当成业务文件；`node_modules` 和虚拟环境作为依赖保留。
3. 包管理器下载缓存和旧更新暂存包可按已核实的路径清理。uv 使用官方命令并保留 in-use 检查；存在应用更新进程时保留对应安装/更新缓存。保留项目依赖与虚拟环境。
4. `~/.codex/sessions`、`~/.codex/thread_history_1.sqlite`、Orca 的 `codex-runtime-home/home/sessions` 是会话相关数据；`~/.codex/worktrees` 可能含未提交代码。需要由用户选择保留范围并通过对应应用的受支持流程归档/删除，不做盲删或手工截断数据库。
5. Docker 虚拟磁盘、Claude VM、模拟器设备、飞书数据分别核对应用内可回收项。Docker daemon 未运行时不直接删除 raw 磁盘，也不为磁盘统计启动已有容器或数据库。
6. 清理后独立读取 `df`，逐路径保存执行回执。硬链接、APFS 共享块、活跃进程写入会导致各目录 `du` 数字与实际回收量不同，不能直接求和宣称释放空间。
7. pnpm 的 `packageImportMethod=auto` 默认先尝试 clone（写时复制），然后才尝试 hardlink/copy；见 [pnpm 10.x 配置](https://pnpm.io/10.x/settings#packageimportmethod)。APFS 下，`nlink=1` 只排除普通硬链接，不能证明底层数据块独占。删除 `node_modules` 后 store 或其他 clone 仍保留数据块，故目录占用与物理回收可能差很多；原目录已删除时只能根据现存 store、文件系统与配置推断，不能声称逐文件证实历史共享关系。
8. pnpm store 清理先核对实际 `store path`，显式指定 `--store-dir`，避免当前项目/目录配置指向另一套 store。v10、v11 使用各自现有版本的官方 `store prune`，不强制删除未知目录、不升级包管理器；原已安装依赖仍保留，但以后安装可能重新下载缓存包。参见 [官方 prune 边界](https://pnpm.io/10.x/cli/store)。清理前检查安装进程与直接 store 使用；清理后抽查已有依赖文件、包管理器本身与 `df`，回收量仍按磁盘实测记录。


## 证据入口

- [2026-10-14 整机清理报告及逐路径回执](/Users/leslie/Documents/Playground/storage-cleanup-20261014/report.txt)。容量、目标列表和实际结果均以该次报告与当前系统重新扫描为准，本文不保存会变化的容量快照。
