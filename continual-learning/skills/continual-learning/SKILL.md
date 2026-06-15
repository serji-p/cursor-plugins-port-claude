---
name: continual-learning
description: Orchestrate continual learning by delegating transcript mining and CLAUDE.md updates to the `agents-memory-updater` subagent. Use when the user asks to mine prior chats, maintain learned preferences/facts, or run the continual-learning loop — or when the Stop hook injects a follow-up to run it.
---

# Continual Learning

Keep `./CLAUDE.md` current by delegating the memory update flow to one subagent.

## Trigger

Use when the user asks to mine prior chats, maintain learned preferences/workspace facts, or run the continual-learning loop. The plugin's `Stop` hook may also inject a follow-up asking you to run this skill on an eligible turn.

## Workflow

1. Dispatch the `agents-memory-updater` subagent (via the Agent tool) for the full memory update flow.
2. Return the updater's result verbatim.

## Guardrails

- Keep this parent skill orchestration-only.
- Do not mine transcripts or edit files in the parent flow.
- Do not bypass the subagent.
