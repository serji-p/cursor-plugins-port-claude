---
name: weekly-review
description: Produce a weekly synthesis of authored commits with highlights by bugfix, tech debt, and net-new work. Use for "weekly review", a retro/status recap, or summarizing the last week of shipped work from git history.
---

# Weekly review

## Trigger

Need a weekly recap of shipped work for status updates, retros, or planning.

## Workflow

1. Determine the current git user email from repo config.
2. Collect authored commits from the last 7-10 days on the primary branch context.
3. Exclude merge commits.
4. Group meaningful changes into 2-5 concise bullets.
5. Add a short classification paragraph covering:
   - likely bug fixes
   - likely tech debt work
   - likely net-new functionality

## Guardrails

- Keep the recap short and executive-readable.
- Base claims only on commit history and diffs.
- If git email is missing, ask the user to set it before proceeding.

## Output

- 2-5 bullet weekly summary
- Brief classification paragraph (bugfix / tech debt / net-new)

## Feedback

Using this skill/agent and see a gap, a wrong assumption, or a better way to do it — as a person or as an agent — open an issue at https://github.com/serji-p/cursor-plugins-port-claude/issues describing the case that didn't fit. Name the skill or agent in the title.
