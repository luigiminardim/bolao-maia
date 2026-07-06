# Contributing to bolao-maia

Thank you for your interest in contributing! This guide explains the conventions and workflow for this project, which uses a **hybrid spec-first development model** and **continuous delivery** — all changes are committed directly to `main` and deployed immediately.

This guide applies equally to **human contributors** and **AI agents**.

---

## Table of Contents

- [Workflow Overview](#workflow-overview)
- [When a Spec is Required](#when-a-spec-is-required)
- [Commit Messages (Conventional Commits)](#commit-messages-conventional-commits)
- [Code Quality Checklist](#code-quality-checklist)
- [Running Tests](#running-tests)

---

## Workflow Overview

```
1. Find or create a GitHub Issue describing the change
       ↓
2. Get the issue triaged / labelled as spec:ready
       ↓
3. Implement directly on main — guided by the issue's acceptance criteria
       ↓
4. Ensure all checks pass (lint · types · tests)
       ↓
5. Commit to main — deployed automatically
```

See [`docs/workflows/spec-driven-workflow.md`](./docs/workflows/spec-driven-workflow.md) for the full workflow, including how AI agents should interact with specs.

---

## When a Spec is Required

| Change type                   | Spec required?                                                    |
| ----------------------------- | ----------------------------------------------------------------- |
| New feature                   | ✅ Yes — create a GitHub Issue with acceptance criteria            |
| Architectural change          | ✅ Yes — create a GitHub Issue and update `ARCHITECTURE.md`        |
| Bug fix                       | ❌ No — describe the fix in the commit message; add a regression test |
| Refactor (no behavior change) | ❌ No — describe the rationale in the commit message              |
| Documentation update          | ❌ No                                                             |
| Dependency upgrade            | ❌ No — document any breaking changes in the commit body          |

---

## Commit Messages (Conventional Commits)

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Because all changes land directly on `main`, the commit message is the primary record of intent.

### Format

```
<type>(<optional scope>): <short summary>

[optional body]

[optional footer — e.g., Closes #42]
```

### Types

| Type       | Use for                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `docs`     | Documentation only                                      |
| `chore`    | Tooling, CI, dependency updates                         |
| `style`    | Formatting changes (no logic change)                    |
| `perf`     | Performance improvement                                 |

### Examples

```
feat(usecase): add GetPoolGuessRankListUsecase

Implements ranking computation for a pool's guess list.
Closes #17

fix(entity): correct score calculation for draw results

When both teams score the same, the guess was incorrectly
awarding zero instead of the partial score.

docs(architecture): update storage selection diagram
```

---

## Code Quality Checklist

Before every commit to `main`, ensure:

- [ ] `npm run check` passes (ESLint + Prettier + TypeScript)
- [ ] `npm test` passes — all existing tests green
- [ ] New entity/use case code has corresponding `.test.ts` files
- [ ] No `!` (non-null assertion) used outside test files
- [ ] No `as` type assertions in production code
- [ ] `ARCHITECTURE.md` updated if a structural decision was made

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Type check + lint + format check
npm run check
```
