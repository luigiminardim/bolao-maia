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

- **Consistency:** Rely on Prettier and ESLint formatters to handle structure automatically.

## 4. Error Handling

- **Prefer Exceptions:** Use exceptions rather than returning error codes.
- **Clean Blocks:** Extract `try/catch` blocks into separate functions to keep the main logic clean.
- **Provide Context:** Throw errors with meaningful messages that provide context on what went wrong.

## 5. Style Preferences

- **Static Methods:** Prefer NOT using `static` methods. Instantiate classes or use standalone functions instead.
- **Null Coalescing:** Prefer `??` (nullish coalescing) over `||` (logical OR) for setting defaults or handling fallbacks, to avoid unintended behavior with falsy values like `0` or `""`.
- **Non-Null Assertions:** Never use the Non-Null Assertion Operator (`!`) outside tests. For production code, use proper type narrowing, explicit null checks, or throw detailed error messages if an invariant is violated.

## 6. Testing

- **Core Business Objects:** Always write tests, especially when dealing with core business objects such as entities, DAOs, builders, policies, and usecases.

## 7. React & Next.js Specific (If applicable)

- **Component Size:** Keep components small and focused. Extract sub-components as separate functions within the same file — there is no need for a separate file if the component is only used in one place.
- **File Cohesion:** A file should only export things related to a single concept. For example, exporting `ScorePolicy` and `ScorePolicyParams` from the same file is fine because they are directly related. Exporting `ScorePolicy` and `Championship` from the same file is not — they are independent concepts and belong in separate files.
- **Hooks:** Extract complex state logic into custom hooks. If the hook is only used by one component, it can live in the same file.
- **Server/Client Boundaries:** Explicitly mark files with `"use client"` or `"use server"` only where strictly necessary. Maximize Server Components where possible.
