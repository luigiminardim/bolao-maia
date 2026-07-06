---
name: implement
description: "Implementation skill for bolao-maia. Use this to implement a GitHub Issue that has been specced. Triggered by: /implement, 'implement issue #N', 'build issue #N', 'work on issue #N'. Reads the issue acceptance criteria, implements against them, runs checks, and commits to main. Keywords: implement, issue, feature, build, develop."
---

# Skill: Implement a GitHub Issue

This skill implements a feature from a GitHub Issue, following the project's CD workflow. It requires creating a plan before implementing and leaves committing to the developer.

---

## When to Use This Skill

Use this skill when the user:

- Says "implement issue #N", "build issue #N", or "work on #N"
- Uses `/implement`
- Provides a GitHub Issue number and asks you to implement it

Do **not** use this skill if no Issue number is provided — ask for one first.

---

## Step 1 — Fetch the Issue

Retrieve the full Issue content:

```bash
gh issue view <issue-number> --repo luigiminardim/bolao-maia
```

Read:

- **Title** — understand the feature at a glance
- **Problem Statement** — the "why"
- **Acceptance Criteria** — the exact checklist you must satisfy
- **Out of Scope** — what you must NOT implement
- **Technical Notes** — constraints and relevant files

> If the Issue is missing acceptance criteria, stop and ask the user to provide them before starting.

---

## Step 2 — Clarify Ambiguities (if any)

If any acceptance criterion is ambiguous or underspecified after reading the Issue:

- Use the `/grill-me` interview approach: **one question at a time**, with a recommended answer
- Do not make silent assumptions
- Research the codebase first to minimize the number of questions

---

## Step 3 — Read the Project Rules

Before writing any code:

1. Read `.agents/rules/code-style.md` — all code must comply with the clean code rules
2. Read `ARCHITECTURE.md` — respect layer boundaries, JsonStorage interface, Server Actions only
3. Read `docs/domain-glossary.md` — use consistent domain terminology

---

## Step 4 — Plan

Before implementing, create an Implementation Plan artifact with `request_feedback=true` to propose your approach. Wait for the user's explicit approval before proceeding.

---

## Step 5 — Implement

Implement each acceptance criterion one at a time:

- Follow the layered architecture: entity → use case → repository → infra → app
- Keep changes to the narrowest scope that satisfies the criteria
- Do not implement anything listed under **Out of Scope**
- Use `JsonStorage` for all persistence — no ORMs, no databases
- Mutations go through Server Actions in `src/app/actions.ts`
- Mark components `"use client"` only where strictly necessary

---

## Step 6 — Write Tests

Every acceptance criterion must have at least one corresponding test:

- Entity and use case files → `.test.ts` file (mandatory)
- Tests live next to the file they test (e.g., `Guess.ts` → `Guess.test.ts`)
- Use descriptive test names that map to the acceptance criterion

---

## Step 7 — Run Quality Checks

```bash
npm run check && npm test
```

Both must pass with **zero errors** before you can consider the implementation complete. Fix any failures before proceeding.

---

## Step 8 — Update Architecture Docs (if needed)

If your implementation introduced:

- A new layer or pattern
- A new infrastructure adapter
- A significant new dependency

Update `ARCHITECTURE.md` and include it in the same commit.

---

## Step 9 — Report Completion

Tell the user:

- What was implemented (brief summary)
- Which acceptance criteria are now satisfied
- A reminder that the code is ready for the developer to review and commit
- A **suggested Conventional Commit message** in a code block, formatted as:

  ```text
  feat(scope): short summary of what was implemented

  Closes #<issue-number>
  ```

  _(Common scopes: `entity`, `usecase`, `repository`, `infra`, `app`, `ui`)_

- Any follow-up work or edge cases that were intentionally deferred
