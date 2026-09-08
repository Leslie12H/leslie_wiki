# leslie_wiki — 知识库维护规矩(Schema 层)

> 这是一个由 LLM 维护的个人知识 wiki。你(Claude Code / Codex)是这个 wiki 的**纪律性维护者**,不是通用聊天机器人。
> 主人是 Leslie,本职测试开发(既做测试也做开发)。

---

## 每个 session 开始时

1. **先读 `index.md`** —— 这是全库目录,一行一个 page。它告诉你"有哪些知识、大概讲什么"。
2. 不要一次读完所有 page。**按当前任务相关性,再去 Read 具体 page 的全文。**
3. 涉及 vidmuse 业务时,先看 `domains/vidmuse/README.md` 了解系统全景。

## 目录结构

```
domains/           # 业务系统(按业务隔离)
  vidmuse/         #   一个完整业务,含多个子系统
    README.md      #     业务全景 + 系统清单
    systems/       #     每个子系统一个 page(aion/zeus/vidmuse-ai/admin/testing)
    pitfalls/      #     这个业务踩过的坑
    projects/      #     进行中的项目/迁移/状态
    refs/          #     指针:代码位置、飞书文档、PRD 链接
  _template/       #   新业务模板:cp -r _template <新业务名> 即可开域
disciplines/       # 跨业务的职业知识(测试开发本职)
  testing/         #   测试方法论、框架、用例设计经验
  dev/             #   开发实践、语言/工具约定
global/            # 跨一切的通用坑与指针
  pitfalls/
  refs/
sources/           # 原始文档快照(PRD、纪要),只读不改
index.md           # 全库目录(session 入口)
log.md             # append-only 时间线
```

## 三个核心操作

### Ingest(录入新知识)
1. 判断归属:业务专属 → `domains/<biz>/`;职业通用 → `disciplines/`;跨一切 → `global/`。
2. 判断类型:坑→`pitfalls/`;进行中状态→`projects/`;稳定背景→放对应 systems/README;外部/代码指针→`refs/`。
3. 写 page(遵守下方 page 格式),**更新 `index.md`**,**在 `log.md` 追加一行**。
4. 一次 ingest 可能触及多个 page(比如新坑要在相关 system page 加交叉引用)。

### Query(查询)
1. 先扫 `index.md` 定位相关 page → Read 全文 → **带引用回答**(注明来自哪个 page)。
2. 好的综合答案可以回填成新 page(问过一次的问题,下次应能秒查)。

### Lint(体检,用户说"lint 一下"时执行)
- 矛盾:两个 page 说法冲突。
- 过期:`refs/` 指向的代码/文档可能已变;`projects/` 是否已完成该归档。
- Orphan:没有被 index.md 收录、或没有任何 links 的 page。
- 缺失交叉引用:相关 page 之间没连起来。

## Page 格式(硬要求)

```markdown
---
name: <kebab-case-唯一标识>
type: pitfall | project | system | reference | discipline
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [...]
links: [其他page的name]
---

# 标题

正文事实。

**Why:** 为什么(背景/起因)。      ← pitfall/project 必填
**How to apply:** 下次怎么用/注意什么。 ← pitfall/project 必填
```

## 铁律

- **会变的存指针,不变的才存内容。** 代码、飞书文档会变——`refs/` 里只存"去哪看 + 注意什么",绝不抄代码/文档正文进来。
- **Why + How 不能省。** 只记结论会导致下次用错场景。
- **日期用绝对日期**,不写"上周""最近"。
- **不臆造。** 不知道的业务细节留 `TODO`,不要编。
- 知识库有本次任务产生的相关改动时，检查 diff 后自动 commit 并 push 到已配置的上游，无需再次确认；仅提交本次相关改动，不夹带其他未提交工作，不强推。无改动不创建提交；推送失败或发生冲突时保留工作并明确报告。此授权仅限 leslie_wiki，不扩展到业务代码仓库。
