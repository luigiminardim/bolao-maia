<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# AI Agent Context — bolao-maia

> **Read this file in full before making any changes to this repository.**

## 1. Project Overview

**bolao-maia** is a web application for running _bolões_ (Brazilian sports pool competitions). Users join a shared pool, submit their match result predictions (guesses), and are ranked based on a configurable scoring policy.

- **Stack**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · HeroUI v3 · AWS S3 (production storage)
- **Architecture style**: Domain-first, layered — no ORM, no database, JSON file storage abstracted behind interfaces.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a full breakdown of the system design and layer responsibilities.

See [`docs/domain-glossary.md`](./docs/domain-glossary.md) for definitions of every domain term (Bolão, Sweepstake, Championship, Guess, ScorePolicy, etc.).

---

## 2. Repository Map

```
bolao-maia/
├── src/
│   ├── entity/         # Domain layer — pure business logic, no I/O
│   ├── usecase/        # Application layer — orchestrates entities
│   │   └── dto/        # Data Transfer Objects (usecase inputs/outputs)
│   ├── repository/     # Persistence layer — implements domain interfaces
│   │   └── dao/        # Data Access Objects (raw storage shapes)
│   ├── infra/          # Infrastructure — JsonStorage implementations (File, S3, Cache)
│   ├── app/            # Next.js App Router (pages, Server Actions, components)
│   │   ├── actions.ts  # All Server Actions (single file)
│   │   ├── login/      # Login page
│   │   └── sweepstake/ # Sweepstake pages
│   └── utils/          # Shared pure utilities
├── docs/               # Human + AI shared documentation
├── .agents/
│   ├── rules/          # Agent-specific rule files (always read before coding)
│   ├── skills/         # Agent skills (HeroUI, etc.)
│   └── workflows/      # Agent workflows (issue, implement)
├── AGENTS.md           # ← You are here
├── ARCHITECTURE.md     # Evolving architecture document
├── CONTRIBUTING.md     # Contribution guide
└── README.md           # Project introduction
```

---

## 3. Mandatory Rules Before Writing Code

### 3.1 Read the Code Style Rules

Before writing or modifying **any** code, read:

```
.agents/rules/code-style.md
```

This is enforced as a user rule and applies to every change.

### 3.2 Read the Spec-Driven Workflow Rules

Before implementing **any feature or architectural change**, read:

```
.agents/rules/spec-workflow.md
```

This defines when a GitHub Issue (spec) is required before you write code.

### 3.3 Next.js Version

This project runs **Next.js 16** which differs significantly from older versions. Always check `node_modules/next/dist/docs/` for the correct APIs before using Next.js-specific features.

---

## 4. Architecture Constraints

These are hard rules derived from the architecture. Do not violate them:

| Constraint                | Rule                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layer isolation**       | `entity/` must never import from `usecase/`, `repository/`, `infra/`, or `app/`.                                                                      |
| **No ORM / DB**           | All persistence goes through the `JsonStorage` interface (`src/infra/JsonStorage.ts`). Do not introduce databases, Prisma, Drizzle, etc.              |
| **Server Actions only**   | Client-to-server communication uses Next.js Server Actions in `src/app/actions.ts`. Do not add API route handlers (`/api/*`) unless explicitly asked. |
| **No non-null assertion** | Never use `!` outside test files. Use type narrowing or throw descriptive errors.                                                                     |
| **No `as` assertions**    | Use type guards or explicit conversion functions instead.                                                                                             |
| **No `static` methods**   | Instantiate classes or use standalone functions.                                                                                                      |

---

## 5. Testing Requirements

- Entity and use case files **must** have corresponding `.test.ts` files.
- Run tests with: `npm test`
- Run type checks with: `npm run check`
- Never commit code that breaks existing tests.

---

## 6. Storage & Environment

The storage backend is selected at runtime via the `JSON_STORAGE` environment variable:

| Value   | Backend                                                            | Use         |
| ------- | ------------------------------------------------------------------ | ----------- |
| `File`  | `JsonFileStorage` — local filesystem under `FILE_STORAGE_PATH`     | Development |
| `AwsS3` | `JsonAwsS3Storage` — AWS S3 bucket `AWS_S3_BUCKET` in `AWS_REGION` | Production  |

A caching decorator `WithLoadCacheJsonFileStorage` wraps either backend transparently.

---

## 7. Feature Specs Live on GitHub

This project uses a **hybrid spec-first** workflow. Features and architectural changes are specified as GitHub Issues before implementation begins. When implementing a feature:

1. Find the corresponding GitHub Issue.
2. Read its acceptance criteria before writing a single line of code.
3. Link your PR to the Issue.
