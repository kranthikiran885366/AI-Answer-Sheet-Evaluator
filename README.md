# EvalAI Pro — AI-Powered Answer Sheet Evaluator

A full-stack application for automated answer sheet evaluation using OCR, LLMs, and advanced scoring. Frontend is Next.js (App Router, TypeScript, Tailwind). Backend is FastAPI with multi-model AI orchestration, queues, and observability.

## Features
- Upload PDFs/Images, advanced OCR pipeline, explainable grading, rubrics, and feedback
- Real-time updates via WebSockets; dashboards for admins, teachers, students
- Pluggable AI providers (OpenAI, Google, Anthropic), metrics with Prometheus, optional Sentry
- Datastores: Postgres, Redis, MongoDB; Kafka for events; S3 for artifacts
- Infra: Docker Compose, Kubernetes (manifests + Helm), Terraform, Jenkins CI/CD

## Tech Stack
- Frontend: Next.js 14, React 18, Tailwind, Radix UI, Framer Motion, Shadcn UI components
- Backend: FastAPI, SQLAlchemy, Redis, Motor (MongoDB), Kafka, Celery (planned), Prometheus
- Testing: Jest/RTL, Cypress, K6, PyTest, Bandit, npm audit

## Repository Structure
```
app/                 # Next.js app (App Router)
components/          # Shared UI components
backend/             # FastAPI service and AI pipeline
k8s/                 # K8s manifests (dev/prod)
helm/ai-evaluator/   # Helm chart
scripts/             # Tooling (deploy, tests)
monitoring/          # Prometheus, Grafana
terraform/           # Infra as code
tests/               # Frontend/E2E/Load tests
```

## Quick Start (Local)
1) Install Node.js 18+ and Python 3.10+.
2) Frontend:
- npm install
- npm run dev
- Env: NEXT_PUBLIC_API_URL (default http://localhost:8000)
3) Backend (simplified):
- Create a virtualenv, install requirements (see backend/)
- Export: OPENAI_API_KEY, JWT_SECRET, DATABASE_URL (or use Docker Compose)
- Run: python backend/main.py

Or start everything via Docker Compose:
- docker-compose.yml (dev) or docker-compose.production.yml (prod-like)

## Environment Variables
Frontend:
- NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
Backend (examples, see docker-compose.production.yml):
- OPENAI_API_KEY, GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY, JWT_SECRET
- DATABASE_URL, MONGODB_URL, REDIS_URL, KAFKA_BOOTSTRAP_SERVERS
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET
- SENTRY_DSN, WANDB_API_KEY, KAGGLE_API_KEY, KAGGLE_USERNAME

## Scripts
- npm run dev / build / start
- bash scripts/run-tests.sh — runs unit, e2e, security, and performance tests
- scripts/deploy.sh and scripts/production-deploy.sh for releases

## Testing
- Frontend: Jest/RTL in tests/frontend
- E2E: Cypress in tests/e2e (requires backend running)
- Load: K6 and JMeter in tests/load
- Backend: PyTest under backend/testing

## Deployment
- Frontend can deploy to Vercel; repo also includes:
  - Jenkinsfile for CI/CD (build, scan, deploy)
  - Kubernetes manifests in k8s/ and Helm chart in helm/ai-evaluator/
  - Terraform in terraform/
See docs/DEPLOYMENT.md for details.

## Contributing and Security
- See CONTRIBUTING.md for guidelines and CODE_OF_CONDUCT.md
- See SECURITY.md for reporting vulnerabilities

## Documentation
- docs/ARCHITECTURE.md — system design
- docs/DEVELOPMENT.md — local dev setup
- docs/DEPLOYMENT.md — deploy paths
- docs/TESTING.md — testing strategy
