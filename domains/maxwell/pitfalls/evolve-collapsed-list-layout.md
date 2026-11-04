---
name: evolve-collapsed-list-layout
type: pitfall
created: 2026-11-04
updated: 2026-11-04
tags: [maxwell, evolve, studio, layout, testing]
links: [evolve-concurrency-test-contract-drift, evolve-candidate-version-and-edit-proof]
---

# 折叠内容不等于释放布局空间

**Why:** 2026-11-04 EVOLVE 候选列表默认折叠，但父容器仍沿谱系的双列 grid 分配宽度。加宽工作区后左侧空白占约七成，实际详情只有约 304px。已有 SSR 确认详情存在，不能发现真实计算布局的问题。

**How to apply:** 先在原页面测量容器和各列实际尺寸，区分内容隐藏与布局占位。列表模式可把可选目录和详情上下排列，谱系保留自己的布局，不额外引入状态或导航。验证展开、收起、工作区加宽、窄视口以及相邻谱系模式；异步切换须等待实际 data-layout 更新再取尺寸，不能把点击后旧 DOM 当作结果。实际生成文件若以 attachment 返回，浏览器导航中止不代表文件失效；按原件 SHA 与内容类型只读验证，保留 TLS 校验。

实现入口为 Maxwell `apps/studio/src/products/evolve/v3/ledger/LedgerLineage.tsx` 和同名 CSS。源码、截图、CI 与 dev 生效证据沿 `/Users/leslie/Downloads/sandai-code/maxwell-ai/.tmp/evolve-unified-1019/.tmp/c15-candidate-layout-review-20261104.json` 及根工作区 `output/evolve-unified-20261019/flexibility-acceptance-20261022.md` 的 2026-11-04 记录回查。界面修复不替代候选业务质量验收。
