# Repository AI Operating Contract

This repository is authoritative for product-specific truth. `jeremytheva/project-master` provides reusable standards/templates and does not replace project decisions.

## Continue semantics
On Continue / Proceed / Next, inspect current repository and GitHub state, select the highest-priority dependency-correct task, prefer integration when WIP limits are reached, bypass only non-critical blockers with independent work, update durable status, and do not invent speculative work.

## PR and WIP policy
Use normal non-draft PRs by default. Lifecycle metadata: `IMPLEMENTING → VALIDATING → READY FOR REVIEW → MERGE READY → MERGED`; `BLOCKED` may overlay a state.

Defaults: dependent stack <= 2; ordinary open implementation PRs <= 3. If exceeded, stop overlapping implementation and validate/reconcile/merge first.

## Validation
Use the canonical repository executor when available. Fallback: canonical executor → trusted alternate → exact-commit equivalent deployment/build → `VALIDATION WAITING`. Never record an unexecuted check as PASS. Zero-step CI is infrastructure evidence only.

## Status and evidence
`STATUS.md` is the continuity source. Keep validation, deployment, runtime and browser evidence separate and reconcile stale GitHub/status state before new work.

## Data/provider governance
Firebase is a provider-managed/non-SQL substrate here. Do not invent authoritative SQL for it. Domain/application semantics belong in project documentation and code; provider schema/collection contracts and migrations must be represented as provider-specific evidence when persistence changes materially.

Provider capability claims distinguish `IMPLEMENTED`, `PROVIDER VERIFIED` and `APPLICATION VERIFIED`. Irreversible production data/provider changes require a migration approval package with affected data, before/after contract, backup/restore, backfill/conflict handling, rollback/roll-forward and verification.

## Template use
Reuse Project Master patterns before introducing shared runtime packages. Record adoption in `.project-master/manifest.yaml`.

## Owner intervention and reporting
Escalate only for inaccessible credentials/secrets, external account/billing configuration, destructive/irreversible operations, third-party approvals, unavailable physical/manual verification, genuinely unresolved product decisions, or material security/privacy/provider/cost choices not already governed.

Routine responses use:
```text
Done
- <1–3 material outcomes>
Next
- <single best next action>
You
- Nothing required.
```
Add `Blocked`, `Problem` or `Decision needed` only when materially necessary. Detailed evidence stays in repository/GitHub.
