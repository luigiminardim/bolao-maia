# Spec-Driven Development Workflow

This document describes the **hybrid spec-first** development process used in bolao-maia. It applies to both human contributors and AI agents.

> **Summary**: Features and architectural decisions require a GitHub Issue (spec) before implementation. Bug fixes, refactors, and documentation do not. All changes are committed directly to `main` and deployed immediately (continuous delivery).

---

## Why Spec-First?

In AI-assisted development, the biggest risk is not bugs — it is implementing the _wrong thing_ confidently. A spec is the shared contract that aligns human intent with AI execution. It answers:

- **What** is being built?
- **Why** is it needed?
- **What does "done" look like?** (acceptance criteria)
- **What is explicitly out of scope?**

Without a spec, an AI agent may make plausible-but-wrong assumptions that are expensive to undo.

---

## The Hybrid Rule

| Situation                                                 | Spec required? | Action                                                                |
| --------------------------------------------------------- | -------------- | --------------------------------------------------------------------- |
| New user-facing feature                                   | ✅ Yes         | Create or find a GitHub Issue with acceptance criteria                |
| New use case or entity                                    | ✅ Yes         | Create or find a GitHub Issue                                         |
| Architectural change (new layer, new infra backend, etc.) | ✅ Yes         | Create or find a GitHub Issue; update `ARCHITECTURE.md`               |
| Bug fix                                                   | ❌ No          | Describe the bug and fix in the commit message; add a regression test |
| Refactoring with no behavior change                       | ❌ No          | Describe the refactor rationale in the commit message                 |
| Documentation update                                      | ❌ No          | Commit directly                                                       |
| Dependency upgrade                                        | ❌ No          | Document breaking changes in the commit body                          |
| Small UI tweak or copy change                             | ❌ No          | Commit directly                                                       |

**When in doubt, create an Issue first.** It takes two minutes and saves hours of rework.

---

## Creating a Spec

Before any feature is implemented, a spec must exist as a GitHub Issue.

Use the **`/issue`** skill to start a spec-writing session. The agent will research the codebase, conduct a `/grill-me`-style interview (one question at a time, with a recommended answer), produce a full PRD, and publish it to GitHub.

After creation, apply the `spec:ready` label when the acceptance criteria are finalized. **Implementation must not start until `spec:ready` is set.**

See the full spec-writing process in: `.agents/skills/issue/SKILL.md`

---

## Lifecycle of a Feature

### Step 1 — Write the Spec (GitHub Issue)

Use the **Feature Spec** issue template. A good spec includes:

- **Problem statement**: What user need or pain point does this address?
- **Proposed solution**: A brief description of the intended behavior.
- **Acceptance criteria**: A checklist of testable conditions that must all be true for the feature to be "done".
- **Out of scope**: Explicitly lists what this Issue does NOT cover.
- **Technical notes** (optional): Implementation hints, constraints, or pointers to relevant code.

**Example acceptance criteria:**

```markdown
- [ ] A user can submit a guess for each match in the group stage
- [ ] Submitting a guess replaces any previous guess for the same match
- [ ] Submitting after the match deadline returns an error
- [ ] The ranking is recomputed after each guess submission
```

### Step 2 — Triage

The Issue is labelled and assigned. Labels used:

| Label          | Meaning                                                     |
| -------------- | ----------------------------------------------------------- |
| `spec:ready`   | Acceptance criteria are finalized; implementation can begin |
| `spec:draft`   | Issue is open for discussion; do not implement yet          |
| `bug`          | A defect report; no spec required                           |
| `architecture` | Impacts the system structure                                |

**AI agents must not implement a feature until the Issue has the `spec:ready` label.**

### Step 3 — Implement

1. Read the Issue acceptance criteria in full before writing code.
2. Implement against those criteria — not against assumptions.
3. Write or update tests to cover the acceptance criteria.
4. Run `npm run check` and `npm test` — both must pass.

### Step 4 — Commit to `main`

Commit directly to `main` using a [Conventional Commit](../../CONTRIBUTING.md#commit-messages-conventional-commits) message. Reference the Issue in the footer to auto-close it:

```
feat(usecase): add guess submission deadline validation

Closes #42
```

---

## Instructions for AI Agents

When you receive a task to implement a feature:

1. **Check for a GitHub Issue first.** If the user references an Issue number, find it and read its acceptance criteria.
2. **Do not infer requirements.** Implement exactly what the spec says, nothing more.
3. **If requirements are ambiguous**, use the `/grill-me` interview approach — one question at a time, with a recommended answer — to resolve ambiguity before writing any code.
4. **If no spec exists for a feature**, stop, inform the user, and offer to run a **spec-writing session** (see _Creating a Spec_ above).
5. **For bug fixes**, you may proceed without a spec — but include a regression test.
6. **After implementation**, run `npm run check` and `npm test` and confirm they pass before reporting completion.
7. **If you make an architectural decision** (new layer, new pattern, new dependency), update `ARCHITECTURE.md` as part of the same commit.
8. **Commit directly to `main`** — do not create branches or open PRs.

---

## Writing Good Acceptance Criteria

Good acceptance criteria are:

- ✅ **Testable** — you can write a unit or integration test for each one
- ✅ **Specific** — no ambiguous words like "should work correctly"
- ✅ **Bounded** — each criterion covers one behavior
- ✅ **User-focused** — written from the perspective of the outcome, not the implementation

Bad:

> The system handles guesses properly.

Good:

> Submitting a guess with a null score value throws a `ValidationError` with message "Score cannot be null".
