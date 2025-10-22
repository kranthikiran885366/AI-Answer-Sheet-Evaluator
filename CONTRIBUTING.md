# Contributing Guidelines

Thanks for your interest in improving EvalAI Pro! This document explains how to propose changes and contribute safely.

## Development Setup
- Node.js 18+, Python 3.10+
- npm install; npm run dev (frontend)
- Python venv; pip install -r backend/requirements.txt; python backend/main.py (backend)
- Optional: Docker Compose to run full stack

## Branching and Commits
- Create feature branches from main
- Use clear, descriptive commit messages (Conventional Commits recommended)
- Keep PRs focused and small when possible

## Tests and Quality
- Run bash scripts/run-tests.sh before opening a PR
- Frontend: npm test; Backend: pytest backend/testing
- Address lint and type errors; ensure build passes

## Pull Requests
- Link related issues
- Describe motivation, approach, and trade-offs
- Include screenshots for UI changes
- Update docs when behavior or env vars change

## Security and Secrets
- Never commit secrets; use environment variables and secret managers
- Report vulnerabilities per SECURITY.md

## Code of Conduct
- By participating, you agree to the CODE_OF_CONDUCT.md
