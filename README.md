# bolao-maia

> A web application for running _bolões_ — Brazilian sports pool competitions where friends predict match results and compete for the best score.

---

## What is a Bolão?

A _bolão_ is a Brazilian tradition: a group of people each submit predictions for match results before a tournament. Once real scores are in, participants are ranked by how accurate their guesses were. **bolao-maia** digitalizes this experience for any sports championship.

---

## Features

- 🏆 Support for multiple championship formats (group stage + cup final)
- 📝 Submit and update match result guesses
- 📊 Real-time score computation using a configurable scoring policy
- 🥇 Pool ranking leaderboard
- 👤 Frictionless login — join with just a username, no password required
- ☁️ Dual storage backends: local filesystem for development, AWS S3 for production

---

## Getting Started

### Prerequisites

- [Node.js 24](https://nodejs.org/) (managed via [nvm](https://github.com/nvm-sh/nvm))
- AWS credentials (for production S3 storage) — optional for local development

### Installation

```bash
# Clone the repository
git clone https://github.com/luigiminardim/bolao-maia.git
cd bolao-maia

# Install dependencies
npm install
```

### Configuration

Copy the example environment file and fill in your values:

```bash
cp .env .env.development.local
```

| Variable                | Description                        | Development default |
| ----------------------- | ---------------------------------- | ------------------- |
| `JSON_STORAGE`          | Storage backend: `File` or `AwsS3` | `File`              |
| `FILE_STORAGE_PATH`     | Path for local JSON storage        | `.filestorage`      |
| `AWS_REGION`            | AWS region                         | `us-east-1`         |
| `AWS_S3_BUCKET`         | S3 bucket name                     | —                   |
| `AWS_ACCESS_KEY_ID`     | AWS access key                     | —                   |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key                     | —                   |

### Seed Data

Populate the storage with championship and sweepstake data:

```bash
npm run seed
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── entity/       # Domain layer — pure business logic
├── usecase/      # Application layer — use cases and DTOs
├── repository/   # Persistence layer — JSON-backed repositories
├── infra/        # Infrastructure — storage adapters (File, S3, Cache)
└── app/          # Next.js App Router — pages, Server Actions, components
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown of the architecture, design decisions, and layer responsibilities.

See [docs/domain-glossary.md](./docs/domain-glossary.md) for definitions of domain terms.

---

## Development

### Running Tests

```bash
npm test
```

### Type Check + Lint

```bash
npm run check
```

### Auto-fix Formatting

```bash
npm run check:fix
```

---

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. This project uses a hybrid spec-first workflow — features require a GitHub Issue (spec) before implementation begins.
