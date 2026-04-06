# Development Guide

## Prerequisites
- Node.js 18+, npm
- Python 3.10+, virtualenv
- Docker & Docker Compose (optional, recommended)

## Frontend
- npm install
- npm run dev
- Env: NEXT_PUBLIC_API_URL=http://localhost:8000 (and optionally NEXT_PUBLIC_WS_URL)

## Backend
- python -m venv venv && source venv/bin/activate
- pip install -r backend/requirements.txt
- export required env vars (see docs/ENVIRONMENT.md)
- python backend/main.py

## Compose
- docker-compose.yml (dev) brings up frontend, backend, dbs, redis, etc.
- docker-compose.production.yml adds observability and DS tools

## Tips
- Keep components small and typed
- Avoid committing secrets
- Use scripts/run-tests.sh to run comprehensive checks
