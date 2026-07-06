---
name: Feature Spec (PRD)
about: Define a new feature before implementation begins. The agent will interview you to fill this in. Fill all sections before labelling as `spec:ready`.
title: "feat: <short description>"
labels: ["spec:draft"]
assignees: ""
---

## Problem Statement

<!-- What user need, pain point, or business goal does this feature address? Why is it needed now? -->

## Personas

<!-- Who is affected by this feature? Describe each persona briefly. -->

| Persona | Description |
| ------- | ----------- |
|         |             |

## User Stories

<!-- Express the feature from each persona's perspective. Format: "As a <persona>, I want <goal> so that <reason>." -->

- As a **[persona]**, I want **[goal]** so that **[reason]**.

## Acceptance Criteria

<!-- A checklist of testable, specific conditions. The feature is "done" only when ALL items are checked.
     Each item must be testable — you should be able to write a unit or integration test for it. -->

- [ ] 
- [ ] 
- [ ] 

## Non-Functional Requirements

<!-- Performance, security, accessibility, reliability, or other quality constraints.
     Leave blank if none apply. -->

- **Performance**: 
- **Security**: 
- **Accessibility**: 
- **Other**: 

## Out of Scope

<!-- Explicitly list what this Issue does NOT cover. This prevents scope creep and aligns AI agent implementation boundaries. -->

- 

## Technical Notes *(optional)*

<!-- Implementation hints, constraints, relevant files, or pointers to architecture decisions.
     AI agents will read this section carefully. -->

### Relevant code
<!-- e.g., src/entity/Guess.ts, src/usecase/GuessCupFromPoolSweepstake.ts -->

### Constraints
<!-- e.g., "Must not introduce a database", "Must follow the JsonStorage interface" -->

### References
<!-- Links to related Issues, PRs, or external docs -->

---

> **Before marking `spec:ready`**: Confirm every acceptance criterion is testable and unambiguous, and that the Out of Scope section is filled.
