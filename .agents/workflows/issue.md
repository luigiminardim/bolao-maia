---
name: issue
description: "Spec-writing skill for bolao-maia. Use this to create a GitHub Issue (feature spec/PRD) via an interactive interview. Triggered by: /issue, /spec, 'create a spec', 'open an issue', 'new feature: ...', or any request to define/document a feature before implementing it. Keywords: issue, spec, PRD, feature, requirement, grill-me, interview."
---

# Skill: Create a Feature Spec (GitHub Issue)

This skill creates a **full PRD-format GitHub Issue** for a new feature through an interactive interview, then publishes it to GitHub using the `gh` CLI.

---

## When to Use This Skill

Use this skill when the user:

- Says "I want to create a spec", "let's spec this out", "new feature: …", or "open an issue for …"
- Uses `/issue` or `/spec`
- Asks you to define/document a feature before implementation

Do **not** use this skill for bug reports or refactoring tasks.

---

## Step 1 — Research First

Before asking the user anything, explore the codebase to minimize questions:

1. Read `docs/domain-glossary.md` — understand the domain terms (Bolão, Sweepstake, Guess, etc.)
2. Read `ARCHITECTURE.md` — understand constraints (no DB, JsonStorage only, Server Actions only)
3. Explore relevant `src/` directories to identify existing patterns, entities, and use cases related to the feature
4. Infer what you can: personas (pool participant, pool admin, anonymous visitor), technical constraints, related files

---

## Step 2 — Interview the User (`/grill-me` style)

Conduct a **one-question-at-a-time** interview. For every question:

- Provide your **recommended answer** based on research
- Let the user accept, refine, or override it
- Never ask two questions simultaneously

Walk through the PRD sections in this order:

| #   | Section                         | Key question                                                                     |
| --- | ------------------------------- | -------------------------------------------------------------------------------- |
| 1   | **Problem Statement**           | What user need or pain point does this address?                                  |
| 2   | **Personas**                    | Who is affected? (Suggest from: pool participant, pool admin, anonymous visitor) |
| 3   | **User Stories**                | "As a `<persona>`, I want `<goal>` so that `<reason>`." — draft one per persona  |
| 4   | **Acceptance Criteria**         | Propose a testable checklist; refine with the user                               |
| 5   | **Non-Functional Requirements** | Any performance, security, or accessibility constraints? Skip if none            |
| 6   | **Out of Scope**                | What does this issue explicitly NOT cover?                                       |
| 7   | **Technical Notes**             | Relevant files, constraints, architectural pointers                              |

**Rules:**

- If you can confidently fill a section from research, propose it and confirm instead of asking from scratch
- Skip sections that clearly don't apply (e.g., NFRs for a pure copy change)

---

## Step 3 — Draft the Issue Body

Produce the GitHub Issue body in this exact format:

```markdown
## Problem Statement

<content>

## Personas

| Persona | Description |
| ------- | ----------- |
| ...     | ...         |

## User Stories

- As a **[persona]**, I want **[goal]** so that **[reason]**.

## Acceptance Criteria

- [ ] ...
- [ ] ...

## Non-Functional Requirements

- **Performance**: ...
- **Security**: ...
- **Accessibility**: ...

## Out of Scope

- ...

## Technical Notes

### Relevant code

...

### Constraints

...
```

---

## Step 4 — Get User Approval

Before creating the issue on GitHub, you MUST output the full issue body as a markdown code block in chat.
Ask the user to review the issue and provide approval. **Do not run the `gh` command until the user explicitly approves.**

---

## Step 5 — Create the GitHub Issue

Once approved, run the following command to publish the Issue (use conventional commits tags for labels, e.g., `feat`, `fix`, `docs`, `refactor`):

```bash
gh issue create \
  --title "<type>: <short description>" \
  --body "<issue body>" \
  --label "<type>" \
  --repo luigiminardim/bolao-maia
```

**If `gh` fails** (not authenticated, no network, etc.):

1. Output the full issue body as a markdown code block in chat (if you haven't already).
2. Say: "I couldn't create the GitHub Issue because: `<error>`. Please paste the content above at https://github.com/luigiminardim/bolao-maia/issues/new."

---

## Step 6 — After Creation

Tell the user:

- The Issue URL (if created successfully)
- To review the issue and let you know when to start implementation
