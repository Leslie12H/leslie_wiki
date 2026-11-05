---
name: nextplay-business-dataset-alignment
type: reference
created: 2026-11-05
updated: 2026-11-05
tags: [maxwell, nextplay, benchmark, dataset, compatibility]
links: [nextplay-independent-benchmark-entry, evolve-ui-results-audit-20261022]
---

# Nextplay 业务题库与 EVOLVE 验收范围对齐

**Why:** A frozen regression subset can remain byte-for-byte identical to the authoritative Dataset while falling behind current business CLI semantics. Passing that subset is neither full-suite acceptance nor proof that the grading requirements still match the product. A workflow default does not prove every actual batch uses that Dataset.

**How to apply:** Fetch all remote references without overwriting the SDK worktree. Check the official manifest, production Dataset loader, workflow defaults and actual batch selections separately. Compare frozen execution input, fixture bytes/history and resolved grading material against the source; preserve content hashes and historical results. Record the exact selected subset and untested coverage. Check current CLI and authoritative nextplay-fe/agent-resources contracts before treating an old-field grading failure as an Agent defect. Product contract updates belong in a new authoritative Dataset version, never an EVOLVE-only silent rewrite.

Current counts, Git SHAs, ten-case source comparisons and the user's decision to retain the new CLI field design are recorded in `/Users/leslie/Downloads/sandai-code/maxwell-ai/output/evolve-unified-20261019/nextplay-dataset-audit-20261105/report.md` and its reproducible `audit.py`/`evidence.json`. Re-read these plus current upstream before reusing numeric claims. Current dataset and run defaults are at `world-sim-dev/nextplay-eval` `datasets/*/dataset.yaml`, `.github/workflows/evaluate.yml`, `eval-runner/scripts/local_dataset_runtime.py`; business Skill ownership is in `AGENTS.md`. Actual dev deployment and quality remain separate gates in the EVOLVE journal.
