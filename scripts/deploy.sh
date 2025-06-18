#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
NAMESPACE="ai-evaluator-${ENVIRONMENT}"
DOCKER_REGISTRY="your-registry.com"
BUILD_TAG=${BUILD_TAG:-latest}

echo -e "${GREEN}🚀 Starting deployment to ${ENVIRONMENT}...${NC}"

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}❌ kubectl is required but not installed.${NC}" >&2; exit 1; }
command -v helm >/dev/null 2>&1 || { echo -e "${RED}❌ helm is required but not installed.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ docker is required but not installed.${NC}" >&2; exit 1; }

# Build and push Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker build -t ${DOCKER_REGISTRY}/ai-evaluator-frontend:${BUILD_TAG} .
docker build -t ${DOCKER_REGISTRY}/ai-evaluator-backend:${BUILD_TAG} ./backend

echo -e "${YELLOW}📤 Pushing Docker images...${NC}"
docker push ${DOCKER_REGISTRY}/ai-evaluator-frontend:${BUILD_TAG}
docker push ${DOCKER_REGISTRY}/ai-evaluator-backend:${BUILD_TAG}

# Create namespace if it doesn't exist
echo -e "${YELLOW}📁 Creating namespace...${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo -e "${YELLOW}⚙️ Applying Kubernetes manifests...${NC}"
envsubst < k8s/secrets.yaml | kubectl apply -f -
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/redis-deployment.yaml -n ${NAMESPACE}
kubectl apply -f k8s/backend-deployment.yaml -n ${NAMESPACE}
kubectl apply -f k8s/frontend-deployment.yaml -n ${NAMESPACE}
kubectl apply -f k8s/ingress.yaml -n ${NAMESPACE}

# Wait for deployments to be ready
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/ai-evaluator-backend -n ${NAMESPACE}
kubectl wait --for=condition=available --timeout=300s deployment/ai-evaluator-frontend -n ${NAMESPACE}
kubectl wait --for=condition=available --timeout=300s deployment/ai-evaluator-redis -n ${NAMESPACE}

# Run health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"
BACKEND_POD=$(kubectl get pods -n ${NAMESPACE} -l app=ai-evaluator-backend -o jsonpath="{.items[0].metadata.name}")
kubectl exec -n ${NAMESPACE} ${BACKEND_POD} -- curl -f http://localhost:8000/health

echo -e "${GREEN}✅ Deployment to ${ENVIRONMENT} completed successfully!${NC}"

# Display access information
echo -e "${GREEN}🌐 Access Information:${NC}"
kubectl get ingress -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}

echo -e "${GREEN}📊 Monitoring:${NC}"
echo "Prometheus: http://prometheus.${ENVIRONMENT}.example.com"
echo "Grafana: http://grafana.${ENVIRONMENT}.example.com"

echo -e "${GREEN}🎉 Deployment complete!${NC}"
