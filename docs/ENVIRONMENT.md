# Environment Variables

## Frontend
- NEXT_PUBLIC_API_URL: Backend HTTP base URL (default http://localhost:8000)
- NEXT_PUBLIC_WS_URL: Backend WebSocket URL (e.g., ws://localhost:8000)

## Backend
- OPENAI_API_KEY, GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY
- JWT_SECRET
- DATABASE_URL (Postgres), MONGODB_URL, REDIS_URL, KAFKA_BOOTSTRAP_SERVERS
- AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET
- SENTRY_DSN, WANDB_API_KEY, KAGGLE_API_KEY, KAGGLE_USERNAME

Store secrets in CI/K8s secret managers; do not commit .env with credentials.
