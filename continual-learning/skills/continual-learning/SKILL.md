---
name: continual-learning
description: Orchestrate continual learning by delegating transcript mining and CLAUDE.md updates to the `agents-memory-updater` subagent. Use when the Stop hook injects a follow-up, when the user explicitly asks to mine prior chats / maintain learned preferences, or once at end of session — never as a mid-delivery habit.
---

# Continual Learning

Keep `./CLAUDE.md` current by delegating the memory update flow to one subagent.

## Trigger (once per session)

Run this skill **at most once per Claude Code session**, preferably via the plugin `Stop` hook (cadence + once-per-session gated). Valid triggers:

1. **Stop hook injects** a follow-up asking you to run it — do it, then do not run again in this session unless the user explicitly re-asks.
2. **User explicitly asks** to mine chats / update learned prefs / run continual-learning.
3. **End-of-session wrap-up** (e.g. after a batch/delivery pipeline finishes) — one final pass if the Stop hook has not already fired this session.

**Do not** invoke this skill mid-delivery, between tickets, or as a recurring habit inside a long session. Mid-session memory passes stall the main thread and the Stop hook already covers automatic cadence.

## Workflow

1. If this session already completed a continual-learning pass (Stop-injected or manual) and the user did not explicitly re-ask, respond that it already ran this session and stop.
2. Dispatch the `agents-memory-updater` subagent (via the Agent tool) for the full memory update flow.
3. Return the updater's result verbatim.

## Guardrails

- Keep this parent skill orchestration-only.
- Do not mine transcripts or edit files in the parent flow.
- Do not bypass the subagent.
- At most one automatic/end-of-session run per session; honor an explicit user re-request.
