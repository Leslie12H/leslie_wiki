---
name: runtime-invalid-image-transient-retry
type: pitfall
created: 2026-11-05
updated: 2026-11-05
tags: [maxwell, runtime, multimodal, retry, evidence]
links: [evolve-runtime-payload-and-terminal-recovery, evolve-usage-accounting]
---

# Invalid image input wrapped as a transient provider error

**Why:** A child batch download can time out after creating a partial image. File existence, a valid PNG header, a complete read of the existing file, and matching original/hosted hashes do not prove the image is valid. A gateway may wrap deterministic image validation in HTTP 503. Treating every 503 as a transient outage repeats the same invalid input and obscures the actual repair needed.

**How to apply:** Correlate the exact model request and image resource, then independently compare original and hosted bytes, PNG chunk completeness and decoding. Check the original download exit status. Do not infer A2A application loss or hosting truncation from a model failure alone. Reuse the existing request-rejection and input-repair path for an explicit structured validation diagnostic; generic invalid_value or opaque 5xx must not be guessed into an image defect. Keep original failures, receipts and missing usage intact.

## Evidence pointers

- Agent transport diagnostics: `services/agent-server/internal/modules/model/infrastructure/openaicompat/gateway.go`, image diagnostic tests, Runtime `model/errors.go`, and `core/nodes/model_calls_test.go` in Maxwell PR #389. Verify current deployed SHA separately.
- Integration evidence under `.tmp/evolve-unified-1019/.tmp/`: `c16-image-bytes-proof-20261105.json`, `c16-image-download-actions-20261105.json`, `invalid-image-classification-review-20261105.json`.
- Full execution and release boundaries: `output/evolve-unified-20261019/flexibility-acceptance-20261022.md`. Source tests do not establish natural recovery or quality acceptance; do not repair historical files to make the old result pass.
