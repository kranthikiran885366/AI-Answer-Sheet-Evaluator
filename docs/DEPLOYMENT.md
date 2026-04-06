# Deployment

## Options
- Vercel for frontend (Next.js)
- Docker images and Kubernetes via Helm for full stack
- Jenkins CI/CD pipeline (Jenkinsfile) for build, scan, deploy
- Terraform for provisioning cloud resources

## Docker/Kubernetes
- Build images for backend and frontend; push to registry
- Helm chart: helm/ai-evaluator (edit values.yaml and environment-specific values)
- K8s manifests under k8s/ and k8s/production/

## CI/CD (Jenkins)
- Stages: test frontend/backend, security scans, docker build, deploy to staging, integration tests, deploy to production, smoke tests
- Configure credentials: kubeconfig, cloud creds, API keys in Jenkins

## Secrets
- Use Kubernetes Secrets and CI secret stores
- Never commit secrets to git
