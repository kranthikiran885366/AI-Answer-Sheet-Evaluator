pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry.com'
        DOCKER_REPO = 'ai-evaluator'
        KUBECONFIG = credentials('kubeconfig')
        AWS_CREDENTIALS = credentials('aws-credentials')
        OPENAI_API_KEY = credentials('openai-api-key')
        JWT_SECRET = credentials('jwt-secret')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh '''
                        python -m venv venv
                        source venv/bin/activate
                        pip install -r requirements.txt
                        python -m pytest tests/ -v --cov=. --cov-report=xml
                    '''
                }
            }
            post {
                always {
                    publishCoverage adapters: [
                        coberturaAdapter('backend/coverage.xml')
                    ], sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                }
            }
        }
        
        stage('Test Frontend') {
            steps {
                sh '''
                    npm ci
                    npm run test
                    npm run build
                '''
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Backend Security') {
                    steps {
                        dir('backend') {
                            sh '''
                                source venv/bin/activate
                                pip install safety bandit
                                safety check
                                bandit -r . -f json -o bandit-report.json || true
                            '''
                        }
                    }
                }
                stage('Frontend Security') {
                    steps {
                        sh '''
                            npm audit --audit-level moderate
                            npx snyk test || true
                        '''
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            def backendImage = docker.build(
                                "${DOCKER_REGISTRY}/${DOCKER_REPO}-backend:${BUILD_TAG}",
                                "./backend"
                            )
                            backendImage.push()
                            backendImage.push("latest")
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        script {
                            def frontendImage = docker.build(
                                "${DOCKER_REGISTRY}/${DOCKER_REPO}-frontend:${BUILD_TAG}",
                                "."
                            )
                            frontendImage.push()
                            frontendImage.push("latest")
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh '''
                        helm upgrade --install ai-evaluator-staging ./helm/ai-evaluator \
                            --namespace ai-evaluator-staging \
                            --create-namespace \
                            --set image.tag=${BUILD_TAG} \
                            --set environment=staging \
                            --values ./helm/ai-evaluator/values-staging.yaml
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    # Wait for deployment to be ready
                    kubectl wait --for=condition=available --timeout=300s deployment/ai-evaluator-backend -n ai-evaluator-staging
                    kubectl wait --for=condition=available --timeout=300s deployment/ai-evaluator-frontend -n ai-evaluator-staging
                    
                    # Run integration tests
                    npm run test:integration
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    input message: 'Deploy to production?', ok: 'Deploy'
                    
                    sh '''
                        helm upgrade --install ai-evaluator-prod ./helm/ai-evaluator \
                            --namespace ai-evaluator-prod \
                            --create-namespace \
                            --set image.tag=${BUILD_TAG} \
                            --set environment=production \
                            --values ./helm/ai-evaluator/values-production.yaml
                    '''
                }
            }
        }
        
        stage('Smoke Tests') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    # Wait for deployment to be ready
                    kubectl wait --for=condition=available --timeout=300s deployment/ai-evaluator-backend -n ai-evaluator-prod
                    kubectl wait --for=condition=available --timeout=300s deployment/ai-evaluator-frontend -n ai-evaluator-prod
                    
                    # Run smoke tests
                    npm run test:smoke
                '''
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ AI Evaluator deployment successful - Build: ${BUILD_TAG}"
            )
        }
        failure {
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ AI Evaluator deployment failed - Build: ${BUILD_TAG}"
            )
        }
    }
}
