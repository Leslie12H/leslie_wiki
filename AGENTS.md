# leslie_wiki — Agent 维护规矩(Codex 入口)

> 这是一个由 LLM 维护的个人知识 wiki。维护规矩与 Claude Code 完全一致。
> **完整规则见 [`CLAUDE.md`](./CLAUDE.md) —— 请以那份为准,本文件只是 Codex 侧入口。**

## 速记

- **每个 session 先读 `index.md`**(全库目录),再按任务相关性读具体 page。
- 目录:`domains/`(业务)· `disciplines/`(测试/开发职业知识)· `global/`(通用)· `sources/`(原始文档)。
- 三操作:**Ingest**(写 page + 更新 index.md + 追加 log.md)· **Query**(扫 index → 带引用回答)· **Lint**(查矛盾/过期/orphan)。
- 铁律:**会变的存指针不存内容;Why+How 不能省;绝对日期;不臆造。**

> 维护本 wiki 时,若修改了规矩,请同步更新 `CLAUDE.md` 与本文件。
