# キャリアけいかくん

キャリアけいかくん is a Japanese-first career preparation demo app. It reads a career history and a target job posting, then shows a match score, requirement coverage, skill map, evidence gaps, a 12-week plan, weekly review, Evidence Builder, and Process Trace.

This repository is a portfolio-grade AI product demo. The public flow works through deterministic mock fallback without API keys.

## Stack

- Next.js App Router
- TypeScript / React / Tailwind CSS
- Zod contracts
- Prisma schema for PostgreSQL
- Vitest unit tests
- Playwright E2E smoke test

## Run Locally

```bash
corepack pnpm install
corepack pnpm dev
```

Open `http://127.0.0.1:3000` and choose sample data.

## Commands

```bash
corepack pnpm check
corepack pnpm test
corepack pnpm build
corepack pnpm test:e2e
corepack pnpm prisma generate
```

## Provider Behavior

The first implementation ships with a deterministic mock pipeline. It exposes the adapter boundary for `mock`, `openai`, and `anthropic`; real provider calls can be filled in behind that boundary later. If no provider key is configured, the demo remains fully usable.

## Privacy Behavior

Raw career history, job posting, and review answers are not persisted by default in the app workflow. The code stores hashes, summaries, structured outputs, and trace-safe metadata. Optional encrypted raw storage is represented by the Prisma `RawPayload` model and utility functions, but `.env` is intentionally not changed by this repo.

## Architecture Notes

See [docs/architecture.md](docs/architecture.md) for the implementation shape and the LLM-vs-deterministic boundary.
