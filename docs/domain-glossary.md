# Domain Glossary — bolao-maia

> This glossary is the canonical reference for every domain term used in the codebase, documentation, and GitHub Issues. When in doubt about what a term means, this is the source of truth.
>
> **AI agents**: Always cross-reference this glossary when reading or writing code that involves these concepts. Consistent naming between the glossary and the code is a project requirement.

---

## Core Concepts

### Bolão

The Portuguese word for a sports pool competition. A group of people (_participants_) each submit predictions (_guesses_) for match results before or during a tournament. The participant with the most accurate guesses (highest score) wins. The English term used in this codebase is **Sweepstake** (for the competition event) and **Pool** (for the shared group context).

### Sweepstake

A competition event. A sweepstake has a **Championship** (the tournament data) and is associated with a **Pool** of participants and their **Guesses**.

**Code location**: `src/entity/Sweepstake.ts`

---

### Pool

A named group that shares a sweepstake. Multiple pools can exist for the same sweepstake — different groups of friends running the same bolão independently.

---

### Championship

A tournament structured as a series of matches. In bolao-maia, there are two championship formats:

| Format        | Description                                                    | Code                                         |
| ------------- | -------------------------------------------------------------- | -------------------------------------------- |
| **Cup**       | The final phase of a tournament (knockout/single matches)      | `CupChampionship` in `Championship.ts`       |
| **GroupList** | The group stage (multiple groups, each with their own matches) | `GroupListChampionship` in `Championship.ts` |

**Code location**: `src/entity/Championship.ts`

---

### Team

A sports team, identified by a name string.

**Code location**: `src/entity/Team.ts`

---

### Guess

A user's prediction for a match result. A guess specifies the predicted score for each team in a match.

**Code location**: `src/entity/Guess.ts`

---

### GuessResult

The computed outcome of comparing a **Guess** against the actual match result. Contains the points awarded to the participant for that guess, computed by the **ScorePolicy**.

**Code location**: `src/entity/GuessResult.ts`

---

### ScorePolicy

The rules that determine how many points a guess is worth, given the actual match result. A ScorePolicy is configurable — it defines thresholds and point values for different levels of accuracy (e.g., exact score, correct winner, partial credit).

**Code location**: `src/entity/ScorePolicy.ts`

---

### GuessRankingList

An ordered list of all participants in a pool, sorted by their total score (sum of all their GuessResults). The top participant is the winner of the bolão.

**Code location**: `src/entity/GuessRankingList.ts`

---

### User

An application user, identified by a unique username. Authentication is username-only (no password).

**Code location**: `src/entity/User.ts`

---

## Application Layer Concepts

### Use Case

A class that orchestrates domain objects to fulfill a single user intention. Each use case has an `execute()` method. Examples:

- `GetPoolSweepstakeUsecase` — fetches a sweepstake for a given pool
- `GuessCupFromPoolSweepstake` — records a user's guess for a cup match
- `GetPoolGuessRankListUsecase` — computes the ranking for a pool

**Code location**: `src/usecase/`

---

### DTO (Data Transfer Object)

A plain object that carries data across layer boundaries. Use cases accept and return DTOs, not raw domain entities. This decouples the `app/` layer from domain internals.

**Code location**: `src/usecase/dto/`

---

### Repository

A class that persists and retrieves domain objects. Repositories abstract the storage mechanism; the rest of the codebase never knows whether data comes from a file or from S3.

**Code location**: `src/repository/`

---

### DAO (Data Access Object)

Defines the raw JSON shape stored by a repository. A DAO is the "on-disk" representation of a domain object — it may differ from the domain entity when denormalization or versioning is needed.

**Code location**: `src/repository/dao/`

---

### JsonStorage

The central infrastructure interface. All persistence in the system goes through `JsonStorage.save()`, `JsonStorage.load()`, and `JsonStorage.listIds()`. Two concrete implementations exist: `JsonFileStorage` (local files) and `JsonAwsS3Storage` (AWS S3).

**Code location**: `src/infra/JsonStorage.ts`

---

## Naming Conventions in Code

| Domain concept           | TypeScript naming convention         |
| ------------------------ | ------------------------------------ |
| Sweepstake               | `Sweepstake`, `sweepstake`           |
| Pool                     | `pool`, `poolId` (string identifier) |
| Championship (Cup)       | `CupChampionship`, `cup`             |
| Championship (GroupList) | `GroupListChampionship`, `groupList` |
| Guess                    | `Guess`, `guess`                     |
| GuessResult              | `GuessResult`, `guessResult`         |
| ScorePolicy              | `ScorePolicy`, `scorePolicy`         |
| Ranking                  | `GuessRankingList`, `rankingList`    |
| User                     | `User`, `userId`                     |
