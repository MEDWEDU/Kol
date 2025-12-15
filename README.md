# KolTechat Monorepo

This repo is a starter monorepo for **KolTechat** with:

- `/client`: Vite + React + TypeScript (Tailwind + PostCSS stubs)
- `/server`: Node.js + Express + TypeScript

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## Install

```bash
npm install
```

## Development

Runs the API and the web client in parallel.

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000
- Health check: http://localhost:5000/api/health

The Vite dev server proxies `/api/*` to the backend.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Format

```bash
npm run format
```

## Environment variables

Copy the examples and adjust as needed:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

See each package’s `.env.example` for documented variables.
