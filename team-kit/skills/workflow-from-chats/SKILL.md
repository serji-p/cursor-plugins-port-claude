---
name: workflow-from-chats
description: Extract durable working preferences from recent Claude Code sessions and convert them into skills, CLAUDE.md rules, or workflow docs. Use when asked to learn preferences, mine feedback, personalize workflows, or generate team/person-specific agent guidance.
---

# Workflow From Chats

Infer durable working preferences from recent Claude Code sessions. Do not summarize sessions; extract reusable workflow guidance.

## Where the history lives (Claude Code)

- Session transcripts are stored as JSONL under `~/.claude/projects/<sanitized-project-path>/<session-id>.jsonl`. Each line is one message/tool event.
- Prefer a transcript-search tool when available (e.g. an `ccd_session_mgmt` MCP with `list_sessions` / `search_session_transcripts`) over manually parsing JSONL.
- If no search tool is connected, glob the project directory above and read the most recent `.jsonl` files directly.

## Scope

- Default to the last 7 days unless the user asks for a different window.
- Read parent transcripts and relevant subagent transcripts. Use subagent content as evidence, but cite only parent conversations (by session id).
- Do not expose local transcript paths, secrets, customer data, private chat content, or credentials.

## Workflow

1. State the target workflow or preference surface in one paragraph.
2. Build an internal transcript inventory: title/topic, session id, approximate date, completion state, relevant subagents, and why it may contain preference evidence.
3. Scan for explicit preferences, corrections, and workflow markers such as "I prefer", "always", "never", "not what I asked", "stop", "review", "PR", "CI", "logs", and "skill".
4. Extract preference atoms: trigger, workflow step, decision rule, quality bar, stop condition, evidence, and confidence.
5. Rate confidence as strong, medium, weak, or contradicted.
6. Cluster by workflow shape rather than transcript: shipping, review, simplification, debugging, capture, communication, delegation, or validation.
7. Choose the artifact (see below).
8. Draft only the reusable guidance. Filter anecdotes that will not help future tasks.

## Confidence

- Strong: explicit user preference, workflow-changing correction, repeated parent-chat pattern, or direct request to encode behavior.
- Medium: accepted workflow, repeated tool/model/validation preference, or subagent consensus that the parent used successfully.
- Weak: agent-chosen behavior with no user feedback, one ambiguous transcript, or a likely task-specific correction.
- Contradicted: evidence points in incompatible directions; ask the user before writing files.

## Artifact Choice (Claude Code targets)

- **Skill** (`.claude/skills/<name>/SKILL.md` or `~/.claude/skills/...`): recurring multi-step workflow with clear triggers. Use the `skill-creator` skill if available.
- **CLAUDE.md rule** (project `./CLAUDE.md` or global `~/.claude/CLAUDE.md`): general always-on behavior that should apply broadly. This is the Claude Code equivalent of a Cursor always-apply rule.
- **Memory file** (if a file-based memory system is configured): a single durable fact about the user, their feedback, or the project.
- **Workflow doc**: useful context that is not reliably triggerable.
- **No artifact**: situational, stale, or low-confidence observation.

Before writing to a global file (`~/.claude/CLAUDE.md`, global skills), confirm with the user — it is an outward, durable change.

## Output

Return a concise synthesis first:

- Target workflow.
- Evidence corpus with session-id citations only.
- Preference profile.
- Adopt, consider, dismissed.
- Proposed artifacts (with target path and type).
- Open questions only if they block writing.
