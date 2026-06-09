---
trigger: model_decision
description: You MUST read this file every time you are about to write or modify code. Ensure all code you produce strictly adheres to these rules.
---

# Skill: Clean Code Rules

> "Clean code is not just about making the code work; it's about making the code easy to understand, maintain, and extend."

## 1. Core Principles

- **KISS (Keep It Simple, Stupid):** Strive for simplicity; avoid unnecessary complexity.
- **DRY (Don't Repeat Yourself):** Every piece of knowledge must have a single, unambiguous representation.
- **YAGNI (You Ain't Gonna Need It):** Don't write code for future requirements that may never exist.
- **Boy Scout Rule:** Always leave the code cleaner than you found it.
- **Single Responsibility Principle (SRP):** A class, function, or component should have one, and only one, reason to change.

## 2. Best Practices

### Meaningful Naming

- **Intention-Revealing:** Names should answer: _why_ it exists, _what_ it does, and _how_ it is used.
- **Pronounceable & Searchable:** Use words that are easy to say and find in the codebase.
- **Conventions:** Use noun phrases for classes/objects and verb phrases for methods. Keep boolean prefixes (e.g., `is`, `has`, `should`).

### Functions & Methods

- **Small:** Functions should be small and do one thing only.
- **Arguments:** Keep the number of function arguments to a minimum (ideally 0-2). Use objects for options if there are too many parameters.
- **No Side Effects:** A function should either do something or answer something, but not both.
- **Return Early:** Reduce nesting by returning early from functions (Guard Clauses).

### Comments

- **Code over Comments:** Explain your intent in the code itself whenever possible by extracting variables or functions with clear names.
- **Avoid Redundancy:** Don't comment on bad code; rewrite it.
- **Necessary Comments:** Only use comments for legal reasons, warnings of consequences, complex algorithms, or amplification of intent that code cannot express.

## 3. Formatting

- **Consistency:** Use a consistent indentation and style across the team.
- **Automate:** Rely on Prettier, ESLint, or language-specific formatters to handle structure automatically. Do not manually format if tools are available.

## 4. Error Handling

- **Prefer Exceptions:** Use exceptions rather than returning error codes.
- **Clean Blocks:** Extract `try/catch` blocks into separate functions to keep the main logic clean.
- **Provide Context:** Throw errors with meaningful messages that provide context on what went wrong.

## 5. React & Next.js Specific (If applicable)

- **Component Size:** Keep components small and focused. Extract sub-components if a file exceeds 200-300 lines.
- **Hooks:** Extract complex state logic into custom hooks.
- **Server/Client Boundaries:** Explicitly mark files with `"use client"` or `"use server"` only where strictly necessary. Maximize Server Components where possible.
