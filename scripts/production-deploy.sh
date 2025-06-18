#!/bin/bash

set -e

# Production Deployment Script for AI Answer Sheet Evaluator
# This script handles the complete production deployment

echo "🚀 Starting AI Answer Sheet Evaluator Production Deployment..."

# Configuration
ENVIRONMENT="production"
NAMESPACE="ai-evaluator-prod"
CLUSTER_NAME="ai-evaluator-production"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v kubectl >/dev/null 2>&1 || error "kubectl is required but not installed"
    command -v helm >/dev/null 2>&1 || error "helm is required but not installed"
    command -v aws >/dev/null 2>&1 || error "aws CLI is required but not installed"
    command -v docker >/dev/null 2>&1 || error "docker is required but not installed"
    
    # Check AWS credentials
    aws sts get-caller-identity >/dev/null 2>&1 || error "AWS credentials not configured"
    
    log "Prerequisites check passed ✅"
}

# Setup Kubernetes context
setup_k8s_context() {
    log "Setting up Kubernetes context..."
    
    # Update kubeconfig
    aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME
    
    # Verify connection
    kubectl cluster-info >/dev/null 2>&1 || error "Cannot connect to Kubernetes cluster"
    
    log "Kubernetes context configured ✅"
}

# Create namespace if it doesn't exist
create_namespace() {
    log "Creating namespace if it doesn't exist..."
    
    if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
        kubectl apply -f k8s/production/namespace.yaml
        log "Namespace $NAMESPACE created ✅"
    else
        log "Namespace $NAMESPACE already exists ✅"
    fi
}

# Deploy secrets and configmaps
deploy_configs() {
    log "Deploying configurations..."
    
    # Apply configmaps
    kubectl apply -f k8s/production/configmap.yaml
    
    # Apply secrets (make sure they're properly encoded)
    kubectl apply -f k8s/production/secrets.yaml
    
    log "Configurations deployed ✅"
}

# Deploy persistent volumes
deploy_storage() {
    log "Deploying storage..."
    
    kubectl apply -f k8s/production/pv.yaml
    kubectl apply -f k8s/production/pvc.yaml
    
    # Wait for PVCs to be bound
    kubectl wait --for=condition=Bound pvc --all -n $NAMESPACE --timeout=300s
    
    log "Storage deployed ✅"
}

# Deploy databases
deploy_databases() {
    log "Deploying databases..."
    
    # Deploy PostgreSQL
    kubectl apply -f k8s/production/postgres-deployment.yaml
    
    # Deploy MongoDB
    kubectl apply -f k8s/production/mongodb-deployment.yaml
    
    # Deploy Redis
    kubectl apply -f k8s/production/redis-deployment.yaml
    
    # Wait for databases to be ready
    kubectl wait --for=condition=available --timeout=600s deployment/postgres -n $NAMESPACE
    kubectl wait --for=condition=available --timeout=600s deployment/mongodb -n $NAMESPACE
    kubectl wait --for=condition=available --timeout=600s deployment/redis -n $NAMESPACE
    
    log "Databases deployed ✅"
}

# Deploy message queue
deploy_messaging() {
    log "Deploying messaging system..."
    
    # Deploy Kafka using Helm
    helm repo add confluentinc https://confluentinc.github.io/cp-helm-charts/
    helm repo update
    
    helm upgrade --install kafka confluentinc/cp-helm-charts \
        --namespace $NAMESPACE \
        --set cp-schema-registry.enabled=false \
        --set cp-kafka-rest.enabled=false \
        --set cp-kafka-connect.enabled=false \
        --set cp-ksql-server.enabled=false \
        --set cp-control-center.enabled=false
    
    # Wait for Kafka to be ready
    kubectl wait --for=condition=available --timeout=600s deployment/kafka-cp-kafka -n $NAMESPACE
    
    log "Messaging system deployed ✅"
}

# Deploy monitoring stack
deploy_monitoring() {
    log "Deploying monitoring stack..."
    
    # Add Prometheus Helm repo
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Deploy Prometheus
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace $NAMESPACE \
        --set grafana.adminPassword=$GRAFANA_PASSWORD \
        --set prometheus.prometheusSpec.retention=30d \
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi
    
    # Deploy custom monitoring configs
    kubectl apply -f monitoring/servicemonitor.yaml
    kubectl apply -f monitoring/grafana-dashboards.yaml
    
    log "Monitoring stack deployed ✅"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Deploy backend
    kubectl apply -f k8s/production/backend-deployment.yaml
    
    # Deploy frontend
    kubectl apply -f k8s/production/frontend-deployment.yaml
    
    # Deploy ingress
    kubectl apply -f k8s/production/ingress.yaml
    
    # Deploy HPA
    kubectl apply -f k8s/production/hpa.yaml
    
    # Wait for deployments to be ready
    kubectl wait --for=condition=available --timeout=600s deployment/ai-evaluator-backend -n $NAMESPACE
    kubectl wait --for=condition=available --timeout=600s deployment/ai-evaluator-frontend -n $NAMESPACE
    
    log "Application deployed ✅"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Run PostgreSQL migrations
    kubectl run migration-job --image=ai-evaluator-backend:latest \
        --restart=Never \
        --namespace=$NAMESPACE \
        --command -- python manage.py migrate
    
    # Wait for migration to complete
    kubectl wait --for=condition=complete job/migration-job -n $NAMESPACE --timeout=300s
    
    # Clean up migration job
    kubectl delete job migration-job -n $NAMESPACE
    
    log "Database migrations completed ✅"
}

# Initialize data
initialize_data() {
    log "Initializing application data..."
    
    # Create initial datasets
    kubectl run data-init-job --image=ai-evaluator-backend:latest \
        --restart=Never \
        --namespace=$NAMESPACE \
        --command -- python scripts/initialize_data.py
    
    # Wait for initialization to complete
    kubectl wait --for=condition=complete job/data-init-job -n $NAMESPACE --timeout=600s
    
    # Clean up initialization job
    kubectl delete job data-init-job -n $NAMESPACE
    
    log "Application data initialized ✅"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    # Get service endpoints
    BACKEND_URL=$(kubectl get ingress ai-evaluator-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[1].host}')
    FRONTEND_URL=$(kubectl get ingress ai-evaluator-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}')
    
    # Check backend health
    for i in {1..30}; do
        if curl -f "https://$BACKEND_URL/health" >/dev/null 2>&1; then
            log "Backend health check passed ✅"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Backend health check failed after 30 attempts"
        fi
        sleep 10
    done
    
    # Check frontend health
    for i in {1..30}; do
        if curl -f "https://$FRONTEND_URL" >/dev/null 2>&1; then
            log "Frontend health check passed ✅"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Frontend health check failed after 30 attempts"
        fi
        sleep 10
    done
    
    log "All health checks passed ✅"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Install cert-manager if not already installed
    kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.12.0/cert-manager.yaml
    
    # Wait for cert-manager to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/cert-manager -n cert-manager-system
    
    # Apply cluster issuer
    kubectl apply -f k8s/production/cluster-issuer.yaml
    
    log "SSL certificates configured ✅"
}

# Setup backup
setup_backup() {
    log "Setting up backup system..."
    
    # Deploy backup CronJob
    kubectl apply -f k8s/production/backup-cronjob.yaml
    
    # Create initial backup
    kubectl create job --from=cronjob/backup-job initial-backup -n $NAMESPACE
    
    log "Backup system configured ✅"
}

# Main deployment function
main() {
    log "Starting production deployment for AI Answer Sheet Evaluator"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
        error "Please run this script from the project root directory"
    fi
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        source .env.production
    else
        warn ".env.production file not found, using default values"
    fi
    
    # Run deployment steps
    check_prerequisites
    setup_k8s_context
    create_namespace
    setup_ssl
    deploy_configs
    deploy_storage
    deploy_databases
    deploy_messaging
    deploy_monitoring
    deploy_application
    run_migrations
    initialize_data
    setup_backup
    run_health_checks
    
    log "🎉 Production deployment completed successfully!"
    log "Frontend URL: https://$FRONTEND_URL"
    log "Backend API: https://$BACKEND_URL"
    log "Grafana Dashboard: https://$BACKEND_URL/grafana"
    log "Prometheus: https://$BACKEND_URL/prometheus"
    
    # Display useful commands
    echo ""
    log "Useful commands:"
    echo "  kubectl get pods -n $NAMESPACE"
    echo "  kubectl logs -f deployment/ai-evaluator-backend -n $NAMESPACE"
    echo "  kubectl describe ingress ai-evaluator-ingress -n $NAMESPACE"
    echo "  helm list -n $NAMESPACE"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
