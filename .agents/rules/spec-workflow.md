---
trigger: model_decision
description: Read this file before implementing any feature or architectural change. It defines the spec-first policy and when to invoke the /issue and /implement skills.
---

# Agent Rule: Spec-Driven Workflow

This project uses a **hybrid spec-first** development model. All changes land directly on `main` (continuous delivery). Features and architectural changes require a GitHub Issue spec before implementation begins.

---

## When a Spec is Required

A GitHub Issue is **required** before implementing:

- A new user-facing feature
- A new use case or entity
- Any architectural change (new layer, new infra adapter, new dependency)

A spec is **not required** for:

- Bug fixes
- Refactoring with no behavior change
- Documentation updates
- Small UI tweaks or copy changes
- Dependency upgrades

**When in doubt, create an Issue first.**

---

## Workflow

### Creating a spec → use the `/issue` skill

When the user wants to define a new feature, use the **`issue`** skill:

```
.agents/skills/issue/SKILL.md
```

This skill conducts a `/grill-me`-style interview, produces a PRD, and publishes it to GitHub via `gh issue create`.

### Implementing a spec → use the `/implement` skill

When the user wants to implement an existing Issue, use the **`implement`** skill:

```
.agents/skills/implement/SKILL.md
```

This skill fetches the Issue, implements against the acceptance criteria, runs quality checks, and commits to `main`.

### Clarifying ambiguous requirements

If requirements are ambiguous at any point:
- Use the `/grill-me` interview approach: **one question at a time**, with a recommended answer
- Research the codebase first to minimize questions
- Never make silent assumptions

### If no spec exists

If asked to implement a feature without a spec:
1. Stop implementation.
2. Inform the user a spec is needed.
3. Offer to run the **`issue`** skill to create one.

---

## Full Workflow Documentation

```
docs/workflows/spec-driven-workflow.md
```
