# Findings format

Every round writes one file per reviewer: `<out>/round-<N>.bugs.json` and
`<out>/round-<N>.quality.json` in full mode, or `<out>/round-<N>.verify.json` in verify mode
(`verify` is not a lens — that file carries both lenses' verify findings). The parent
synthesizes whichever of these exist into `<out>/round-<N>.json`, matching this schema:

```json
{"round": 1, "mode": "full", "base": "<sha|ref>", "reviewed_sha": "<HEAD sha>",
 "findings": [{"id": "B1", "lens": "bugs", "severity": "critical|high|medium|low",
   "title": "...", "file": "path", "line": 123, "evidence": "...", "fix": "...",
   "status": "open|resolved"}]}
```

- `id` is stable across rounds: `B<n>` for the bugs/security lens, `Q<n>` for the code-quality
  lens, `V<n>` for issues found new-in-verify.
- `lens` is `bugs` or `quality`.
- `status` is `open` or `resolved` — verify mode is what flips a prior finding to `resolved`.

## Severity definitions

- **critical** — exploitable security hole, data loss/corruption, prod outage, broken migration.
- **high** — wrong behavior on a main path, auth/permission gap, breaking API/contract change.
- **medium** — wrong behavior on an edge/error path, missing test for changed behavior, a
  maintainability regression the rubric treats as a blocker.
- **low** — nits, naming, style, optional refactors.

## Blocking count

The default blocking set is `critical` + `high` + `medium`. Callers may override which
severities count as blocking; state the set used alongside the count.
