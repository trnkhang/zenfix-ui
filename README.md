# Zenfix UI

Dashboard for [Zenfix](https://github.com), an automated bug-to-merge-request pipeline. Mention a bug in Microsoft Teams and Zenfix traces it through indexed repositories, opens a Jira ticket, and submits a fix PR — all without manual intervention.

## Features

- **Repositories** — register GitHub repos for semantic indexing; monitor indexing progress in real time
- **Jobs** — live view of active and past fix pipeline runs, with per-step status and links to generated Jira tickets and pull requests
- **Stats bar** — at-a-glance totals for indexed repos, chunk count, and active jobs
- **SSE live updates** — job cards update in real time via a server-sent events stream without polling

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Routing | React Router v6 |
| Container | Docker + nginx |

## Getting started

### Prerequisites

- Node.js 20+
- A running [Zenfix backend](https://github.com/trnkhang/zenfix) on `http://localhost:8000`

### Development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies `/api` and `/webhooks` to the backend.

### Environment variables

Copy `.env.example` to `.env` and adjust if the backend runs on a different host:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the Zenfix backend API |

### Production build

```bash
npm run build       # outputs to dist/
npm run preview     # serve the built output locally
```

### Docker

```bash
docker build -t zenfix-ui .
docker run -p 80:80 -e VITE_API_URL=https://your-backend zenfix-ui
```

## Project structure

```
src/
  lib/api.ts          # API client and shared TypeScript types
  hooks/
    useRepos.ts       # Repos + stats queries and mutations
    useJobs.ts        # Jobs query with SSE live-update integration
  pages/
    IndexingPage.tsx  # Repositories management page
    JobsPage.tsx      # Jobs list and filter page
  components/
    RepoCard.tsx      # Repository card with status badge and actions
    JobCard.tsx       # Job card with step timeline and result links
    StatsBar.tsx      # Summary stats banner
    IndexProgress.tsx # Animated indexing progress bar
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check formatting without writing |
