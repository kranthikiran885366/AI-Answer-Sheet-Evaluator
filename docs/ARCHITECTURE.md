# Architecture Overview

EvalAI Pro is a full-stack system for automated answer sheet evaluation.

## High-Level
- Frontend: Next.js App Router, TypeScript, Tailwind, WebSocketProvider for real-time
- Backend: FastAPI service orchestrating OCR, evaluation, and model pipelines
- Data: Postgres (relational), Redis (cache/queues), MongoDB (document), Kafka (events)
- Observability: Prometheus metrics, optional Sentry error tracking
- Infra: Docker, K8s manifests, Helm chart, Terraform, Jenkins CI/CD

## Frontend
- app/ layout with ThemeProvider, Toaster, WebSocketProvider
- Key pages/components: dashboards, upload, OCR, evaluation, results, rubrics
- Env: NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL

## Backend
- FastAPI (backend/main.py) with:
  - SQLAlchemy models (User, EvaluationSession, SystemMetrics)
  - OCR engines (Tesseract/EasyOCR/PaddleOCR), NLP with spaCy
  - Multi-provider AI calls (OpenAI, Google, Anthropic)
  - Kafka producer/consumer for events
  - Prometheus counters, histograms, gauges
- External storage: S3 for artifacts; optional Azure/GCS clients present

## Data Flows
1. Upload -> backend /api/upload-answer-sheet -> stored, queued, OCR pipeline
2. OCR -> text extraction -> evaluation models -> rubric scoring -> results persisted
3. WebSocket pushes progress and results to the frontend

## Deployment
- Docker images for frontend and backend
- Helm chart under helm/ai-evaluator with values.yaml
- K8s manifests for dev/prod in k8s/
