# Architecture — bolao-maia

> This document evolves alongside the codebase. Update it whenever a significant structural decision is made. Both humans and AI agents use this as the source of truth for system design.

---

## 1. Domain Overview

**Bolão** (pl. _bolões_) is a Brazilian tradition where a group of people compete by predicting the outcomes of sports matches. The person with the most accurate predictions (highest score) wins.

**bolao-maia** is a web application that digitalizes this experience. The core flow is:

1. An administrator seeds a **Sweepstake** (a competition event with match data).
2. Users join a **Pool** and submit **Guesses** (their match predictions).
3. When real match results are available, the app computes **GuessResults** by comparing guesses against actual scores using a **ScorePolicy**.
4. A **Ranking** is computed from all participants' scores.

See [`docs/domain-glossary.md`](./docs/domain-glossary.md) for full definitions of all domain terms.

---

## 2. Layered Architecture

The system follows a strict layered architecture inspired by Clean Architecture. Each layer has a single responsibility and explicit dependency direction rules.

```
┌─────────────────────────────────────────────────────────┐
│                    app/  (Next.js)                       │
│  Pages · Server Actions · React Components               │
├─────────────────────────────────────────────────────────┤
│                  usecase/                                │
│  Application use cases — orchestrate domain objects      │
│  Input/output via DTOs (usecase/dto/)                    │
├─────────────────────────────────────────────────────────┤
│     entity/                    repository/               │
│  Domain models, policies   Persistence interfaces +      │
│  Pure business logic       implementations (DAOs)        │
├─────────────────────────────────────────────────────────┤
│                    infra/                                │
│  JsonStorage interface + File, S3, and Cache adapters    │
└─────────────────────────────────────────────────────────┘
```

### Dependency Rule

> Dependencies must only point **inward** (toward the domain). Outer layers may import inner layers, never the reverse.

| Layer         | May import from                             | Must NOT import from                                     |
| ------------- | ------------------------------------------- | -------------------------------------------------------- |
| `entity/`     | nothing                                     | `usecase/`, `repository/`, `infra/`, `app/`              |
| `usecase/`    | `entity/`                                   | `repository/` interfaces only (via DI), `infra/`, `app/` |
| `repository/` | `entity/`, `infra/`                         | `usecase/`, `app/`                                       |
| `infra/`      | external libraries                          | `entity/`, `usecase/`, `repository/`, `app/`             |
| `app/`        | `usecase/`, `entity/` (read-only for types) | `repository/`, `infra/` directly                         |

---

## 3. Layer Descriptions

### 3.1 `src/entity/` — Domain Layer

Pure TypeScript classes and interfaces representing the business domain. Zero I/O, zero framework dependencies.

| File                  | Responsibility                                                |
| --------------------- | ------------------------------------------------------------- |
| `Championship.ts`     | A tournament — either Cup (final) or GroupList (group stage)  |
| `Guess.ts`            | A user's match result prediction                              |
| `GuessResult.ts`      | The computed result of a guess vs actual score                |
| `GuessRankingList.ts` | An ordered list of participants by total score                |
| `ScorePolicy.ts`      | The rules for awarding points to a guess                      |
| `Sweepstake.ts`       | A competition event with its championship and pool of guesses |
| `Team.ts`             | A sports team (name identifier)                               |
| `User.ts`             | An application user                                           |

**Testing**: Every entity with non-trivial logic has a `*.test.ts` file. This is non-negotiable.

### 3.2 `src/usecase/` — Application Layer

Orchestrates domain objects to fulfill user intentions. Each use case is a class with an `execute()` method. Use cases accept and return DTOs, never raw domain objects, to decouple the app layer from domain internals.

DTOs live in `src/usecase/dto/`.

The `src/usecase/index.ts` file is the **composition root** — it wires all repositories and use case instances together. The `app/` layer imports from this index, not from individual use case files.

### 3.3 `src/repository/` — Persistence Layer

Implements data access using `JsonStorage`. Each repository class wraps one or more DAOs (`repository/dao/`) that define the raw JSON shapes stored on disk or S3.

### 3.4 `src/infra/` — Infrastructure Layer

Defines the `JsonStorage` interface and three implementations:

| Class                          | Description                                                |
| ------------------------------ | ---------------------------------------------------------- |
| `JsonFileStorage`              | Reads/writes JSON files on the local filesystem            |
| `JsonAwsS3Storage`             | Reads/writes JSON objects in AWS S3                        |
| `WithLoadCacheJsonFileStorage` | Decorator that adds in-memory caching to any `JsonStorage` |

The active backend is selected by the `JSON_STORAGE` environment variable.

### 3.5 `src/app/` — Next.js Application Layer

Next.js 16 App Router. Maximizes Server Components. Client components are marked `"use client"` only where necessary.

- **`actions.ts`**: All Server Actions in one file. Client components call these to trigger server-side mutations.
- **`login/`**: Authentication page (cookie-based, username only — no password).
- **`sweepstake/`**: The main sweepstake experience (guess submission, ranking view).

---

## 4. Authentication

Authentication is minimal by design: users log in with a username only (no password). A long-lived `logged_in_user` HttpOnly cookie stores the user ID. If the user doesn't exist on login, they are auto-created.

This is a deliberate simplicity trade-off appropriate for a trusted-group bolão context.

---

## 5. Storage Architecture

### Environment Variables

| Variable                | Purpose                             | Default     |
| ----------------------- | ----------------------------------- | ----------- |
| `JSON_STORAGE`          | Backend selector: `File` or `AwsS3` | —           |
| `FILE_STORAGE_PATH`     | Root directory for file storage     | `data/`     |
| `AWS_REGION`            | AWS region for S3                   | `us-east-1` |
| `AWS_ACCESS_KEY_ID`     | AWS credentials                     | —           |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials                     | —           |
| `AWS_S3_BUCKET`         | S3 bucket name                      | —           |

### Storage Selection

```typescript
// Decided in usecase/index.ts (composition root)
JSON_STORAGE=File   → JsonFileStorage  (development)
JSON_STORAGE=AwsS3  → JsonAwsS3Storage (production)
// Both are optionally wrapped with WithLoadCacheJsonFileStorage
```

### Data Seeding

The `npm run seed` script (`src/seed.ts`) populates the storage with initial championship and sweepstake data. It must be run after a fresh setup or whenever base data changes.

---

## 6. Technology Choices

| Technology            | Version | Rationale                                                                     |
| --------------------- | ------- | ----------------------------------------------------------------------------- |
| **Next.js**           | 16      | App Router + Server Actions eliminate the need for a separate API server      |
| **React**             | 19      | Required by Next.js 16; React Compiler enabled for automatic memoization      |
| **TypeScript**        | 5       | Strict typing for a domain-rich codebase                                      |
| **HeroUI**            | 3       | Component library built on React Aria; accessible, Tailwind CSS v4 compatible |
| **Tailwind CSS**      | 4       | Utility-first CSS; co-located with HeroUI's design system                     |
| **AWS S3**            | —       | Serverless, zero-ops persistence suitable for a low-traffic bolão app         |
| **Jest**              | 30      | Unit testing; `jest-environment-jsdom` for component tests                    |
| **Prettier + ESLint** | —       | Automated formatting and linting                                              |

---

## 7. Key Design Decisions

### No Database / No ORM

The app stores all data as JSON files (locally or in S3). This was a deliberate choice to minimize infrastructure complexity for a low-traffic, trusted-group application. If the project scales significantly, the `JsonStorage` interface is the single point to replace.

### Composition Root in `usecase/index.ts`

All dependency wiring (instantiating repositories, use cases, injecting storage) happens in one file. This makes the dependency graph explicit and easy to reason about. The `app/` layer imports pre-wired instances from this index.

### Username-Only Authentication

Security is intentionally minimal. The app is designed for use within a known group. Introducing OAuth or password auth would be a significant scope increase and is out of scope unless explicitly specified.
