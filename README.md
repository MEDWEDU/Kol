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

## API: Auth & Users

Base URL: `http://localhost:5000/api`

### Endpoints

| Method | Path | Auth | Content-Type | Description |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | `multipart/form-data` | Create user, optional `avatar` upload (JPG/PNG/WEBP, max 5 MB). Sets HttpOnly auth cookie. |
| POST | `/auth/login` | No | `application/json` | Login and set HttpOnly auth cookie. |
| POST | `/auth/logout` | No | - | Clear auth cookie. |
| GET | `/auth/session` | Cookie | - | Check current session and return the current user. |
| POST | `/auth/refresh` | Cookie | - | Re-issue the auth cookie and return the current user. |
| GET | `/users/me` | Cookie | - | Get current user profile. |
| PUT | `/users/me` | Cookie | `multipart/form-data` | Update `name/email/organization/position/bio/avatar`. |
| GET | `/users/:id` | No | - | Get a public user profile by id. |

### Validation / error responses

- `400` for invalid payloads:

```json
{
  "message": "Validation error",
  "details": [{ "path": ["email"], "message": "\"email\" must be a valid email" }]
}
```

- `401` when missing/invalid auth cookie:

```json
{ "message": "Not authenticated" }
```

### Manual testing (curl)

1) Start MongoDB and the server:

```bash
cp server/.env.example server/.env
npm -w server run dev
```

2) Register (stores cookie to `cookie.txt`):

```bash
curl -i -c cookie.txt \
  -F "email=test@example.com" \
  -F "password=passw0rd123" \
  -F "name=Test User" \
  -F "avatar=@/absolute/path/to/avatar.png" \
  http://localhost:5000/api/auth/register
```

3) Check session:

```bash
curl -i -b cookie.txt http://localhost:5000/api/auth/session
```

4) Update profile:

```bash
curl -i -b cookie.txt -X PUT \
  -F "bio=Hello from curl" \
  http://localhost:5000/api/users/me
```

5) Logout:

```bash
curl -i -b cookie.txt -X POST http://localhost:5000/api/auth/logout
```
