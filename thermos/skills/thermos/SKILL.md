---
name: thermos
description: "Launch both thermo-nuclear review subagents in parallel (full mode) or one verify subagent (verify mode), then synthesize findings into a findings JSON + summary. Use for thermos, double thermo review, or combined bug/security and code-quality branch audits."
---

# Thermos

Run one thermo review round — full (both lenses) or verify (re-check + delta scan) — then
synthesize results into a findings file. **Thermos itself does not define a round limit: it
runs exactly one round per invocation. Round limits are the caller's contract** — a batch
workflow that wants "round 1 = full review, fixes, round 2 = verify" calls thermos twice,
passing `mode=verify` the second time.

See `references/findings-format.md` for the findings JSON schema and severity definitions.

## Invocation args

All optional, given as `key=value` in skill args or prose:

- `base=<ref>` — diff base. Default `main`.
- `out=<dir>` — output directory for diffs/findings. Default `<scratchpad>/thermos`.
- `round=<N>` — round number, stamped into the findings file. Default `1`.
- `mode=full|verify` — default `full`.
- `findings=<path>` — path to the previous round's `round-<N>.json`. **Required for `verify`.**
- `since=<sha>` — sha the previous round reviewed from. **Required for `verify`.**
- `context=<path>` — optional file with a ticket/AC summary to hand reviewers.

## Workflow

1. Determine the review scope (user request, PR, current branch) and resolve the args above,
   applying defaults. For `verify` mode, refuse to proceed without `findings=` and `since=` —
   ask the caller for them rather than guessing. If `findings=` doesn't resolve to a readable
   file, **stop and report** — do not fall back to a full review silently.
2. **Gather step — ONE Bash call, no file contents pasted into any prompt:**
   - Resolve `out` to an **absolute path** and `mkdir -p` it. Every path handed to a subagent
     (diff, files list, context, schema, output JSON) must be absolute — a subagent may run
     from a different working directory than the parent.
   - Verify mode only: first run `git merge-base --is-ancestor <since> HEAD`. If that fails
     (the branch was rebased or squashed since `since`), **stop and report** — tell the caller
     `since` no longer resolves on this branch and suggest re-running with `mode=full` instead
     of guessing at a diff.
   - Full mode: write `<out>/round-<N>.diff` (`git diff <base>...HEAD`) and
     `<out>/round-<N>.files.txt` (`git diff --name-only <base>...HEAD`, plus `wc -l` per file).
     Record HEAD sha (`git rev-parse HEAD`).
   - Verify mode: write `<out>/round-<N>.diff` = `git diff <since>..HEAD` and
     `<out>/round-<N>.files.txt` = `git diff --name-only <since>..HEAD` plus `wc -l` per file —
     the same files-list contract as full mode, since the agent expects that path either way.
     Record HEAD sha.
   - Do **not** dispatch an Explore agent to collect full changed-file contents, and do **not**
     paste diff or file contents into subagent prompts. Reviewers read files themselves.
   - Locate this skill's own directory (wherever the plugin is installed) and compute the
     **absolute path** to `references/findings-format.md` inside it — pass this schema path to
     every subagent dispatch below instead of any hardcoded repo-relative path.
3. **Empty-diff edge cases** (check before dispatching):
   - Full mode, empty `round-<N>.diff`: skip dispatch entirely. Write `<out>/round-<N>.json`
     with an empty `findings` list, and `<out>/round-<N>.md` starting `BLOCKING: 0`.
   - Verify mode, empty `round-<N>.diff`: still dispatch the verify subagent to re-check the
     prior round's open findings, but tell it to skip the delta scan (there is no new code to
     scan).
4. **Dispatch** (skipped in full mode when the diff was empty — see above):
   - **Full mode:** dispatch both subagents via the `Agent` tool in the **same** message so
     they run concurrently (optionally `run_in_background: true` for long branches), passing
     `model: "opus"` explicitly on each `Agent` call (never rely on inheriting the frontmatter
     default):
     - `subagent_type: "thermos:thermo-nuclear-review-subagent"` — writes
       `<out>/round-<N>.bugs.json`.
     - `subagent_type: "thermos:thermo-nuclear-code-quality-review-subagent"` — writes
       `<out>/round-<N>.quality.json`.
     Each prompt carries only: lens, round number, base ref, HEAD sha, path to the diff file,
     path to the files list, optional path to the context file, the absolute schema path, and
     the output JSON path to write. No diff/file contents inline. (The unprefixed
     `thermo-nuclear-review-subagent` / `thermo-nuclear-code-quality-review-subagent` names only
     resolve for a symlink install — always use the `thermos:` prefix so this works as an
     installed plugin.)
   - **Verify mode:** dispatch **one** subagent, `subagent_type:
     "thermos:thermo-nuclear-review-subagent"`, with `model: "opus"` explicitly set, and verify
     instructions in the prompt: (a) for every finding in `findings`, carry it forward
     unchanged except `status` — for ones currently `open`, decide `resolved` or `open` with
     file:line evidence; already-`resolved` findings (and lows) stay as-is, never dropped; (b)
     unless the delta diff is empty (see above), scan it for **new** issues using **both**
     lenses' rubrics — load both rubric skills (`thermos:thermo-nuclear-review` and
     `thermos:thermo-nuclear-code-quality-review`) — reporting new issues at their true
     severity, numbered `V<n>` starting from `max(existing V ids) + 1`. Write
     `<out>/round-<N>.verify.json`.
   - Each subagent returns a ≤20-line summary; it does not need to restate its full findings
     file in the response.
5. **Synthesis** — after dispatched subagent(s) finish (or immediately, in the full-mode
   empty-diff case), merge the lens file(s) (`round-<N>.bugs.json` +
   `round-<N>.quality.json`, or `round-<N>.verify.json`) into:
   - `<out>/round-<N>.json` — the merged findings file, matching the schema in
     `references/findings-format.md`. In verify mode, this **must** contain every finding from
     the previous round carried forward (status updated where re-checked, otherwise unchanged,
     including already-resolved and low-severity ones) plus any new `V<n>` findings — never
     drop a prior finding during synthesis.
   - `<out>/round-<N>.md` — a human summary. Its **first line**, and the chat verdict, is
     `BLOCKING: <count>`, where count = open findings at critical/high/medium severity by
     default (the blocking set); callers may override which severities count as blocking —
     state the set used if overridden.
   - Dedupe overlapping findings across lenses, weight overlapping findings more heavily,
     resolve disagreements with your own judgment, and keep stable ids (`B<n>` bugs lens,
     `Q<n>` quality lens, `V<n>` new-in-verify).

If individual background summaries are already visible to the user, do not restate them
wholesale. Surface the unified verdict, the highest-signal findings, and any remaining
uncertainty.
