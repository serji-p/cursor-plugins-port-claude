---
name: coding-standards
description: Team TypeScript coding standards — top-level imports and exhaustive switch handling. Use when writing or reviewing TypeScript/JavaScript, adding switch statements over unions/enums, or placing imports.
---

# Coding standards

Ported from the Cursor Team Kit `rules/` (`alwaysApply: true`). Claude Code does not have an always-on rule mechanism inside a plugin, so these ship as an invocable skill. **To make them always-on**, paste the block at the bottom into your project `./CLAUDE.md` or global `~/.claude/CLAUDE.md`.

## No inline imports

Always place imports at the top of the module. Avoid inline imports in function bodies, type annotations, or interface fields unless there is a strict circular-dependency reason and it is documented.

## TypeScript exhaustive switch

In `switch` statements over discriminated unions or enums, use a `never` check in the `default` case so newly added variants cause compile-time failures until handled.

```typescript
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.r ** 2;
    case "square":
      return shape.side ** 2;
    default: {
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${_exhaustive}`);
    }
  }
}
```

## Paste-in block for always-on enforcement (CLAUDE.md)

```markdown
## TypeScript standards
- Keep imports at the top of the module. No inline imports in function bodies, type annotations, or interface fields unless a documented circular-dependency reason requires it.
- In switch statements over discriminated unions or enums, add a `never` check in the default case so new variants fail to compile until handled.
```
