# EvalAI Pro — AI-Powered Answer Sheet Evaluator

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-teal.svg)](https://fastapi.tiangolo.com/)

A full-stack, production-ready application for automated answer sheet evaluation using OCR, Large Language Models (LLMs), and advanced machine learning. The frontend is built with Next.js 14 (App Router, TypeScript, Tailwind CSS), while the backend leverages FastAPI with multi-model AI orchestration, message queues, and comprehensive observability.

## ✨ Features

### Core Functionality
- **Advanced PDF/Image Processing**: Upload and process answer sheets in multiple formats
- **OCR Pipeline**: Extract text and handwriting with high accuracy
- **AI-Powered Evaluation**: Explainable grading using multiple LLM providers
- **Rubric-Based Scoring**: Create and apply custom evaluation rubrics
- **Detailed Feedback**: Generate constructive, student-friendly feedback
- **Performance Tracking**: Monitor evaluation metrics and model performance

### User Experience
- **Real-time Updates**: WebSocket-powered live notifications and dashboard updates
- **Role-Based Dashboards**: Customized interfaces for admins, teachers, and students
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Dark Mode Support**: Built-in theme switching capability
- **Intuitive UI**: Shadcn UI components with Framer Motion animations

### AI & Integration
- **Pluggable AI Providers**: OpenAI, Google AI, Anthropic, and custom models
- **Multi-Model Orchestration**: Automatic model selection and fallback strategies
- **Continuous Learning**: Model improvement through feedback loops
- **API Integration**: RESTful API with comprehensive documentation

### Infrastructure & Operations
- **Scalability**: Horizontal scaling with Kubernetes and Docker
- **Data Management**: Support for PostgreSQL, MongoDB, and Redis
- **Event Processing**: Kafka for asynchronous event handling
- **Monitoring & Observability**: Prometheus metrics and optional Sentry integration
- **Security**: JWT authentication, role-based access control, encrypted credentials
- **File Storage**: S3-compatible cloud storage for artifacts

### DevOps & Deployment
- **Docker Support**: Complete containerization with Docker Compose
- **Kubernetes Ready**: Production Helm charts and K8s manifests
- **CI/CD Pipeline**: Jenkins integration with automated testing and deployment
- **Infrastructure as Code**: Terraform configurations for cloud deployment
- **Multi-Environment Support**: Development, staging, and production configurations

## 📚 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router, SSR, ISR)
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Component Library**: Shadcn UI, Radix UI primitives
- **State Management**: React Context, Server Components
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest, React Testing Library, Cypress E2E

### Backend
- **Framework**: FastAPI with Pydantic
- **ORM**: SQLAlchemy for relational data
- **Async Support**: AsyncIO with Motor for MongoDB
- **Message Queue**: Kafka for event streaming
- **Task Queue**: Celery for async jobs (planned)
- **Caching**: Redis with connection pooling
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **Testing**: PyTest, Bandit for security scanning

### Databases & Services
- **SQL**: PostgreSQL (primary relational store)
- **NoSQL**: MongoDB (flexible document storage)
- **Cache**: Redis (sessions, caching, rate limiting)
- **Events**: Kafka (event bus, streaming)
- **Storage**: AWS S3 or compatible (artifacts, uploads)

### Monitoring & Observability
- **Metrics**: Prometheus + Grafana
- **Error Tracking**: Sentry (optional)
- **ML Tracking**: Weights & Biases (optional)
- **Logging**: Structured logging with JSON output

### Deployment & Infrastructure
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes with Helm
- **IaC**: Terraform, CloudFormation
- **CI/CD**: Jenkins, GitHub Actions ready
- **Reverse Proxy**: Nginx ingress controller

## 🗂️ Repository Structure

```
.
├── .github/                      # GitHub-specific files
│   ├── workflows/               # CI/CD workflow definitions
│   ├── ISSUE_TEMPLATE/          # Issue templates
│   └── pull_request_template.md # PR template
├── app/                         # Next.js application (App Router)
│   ├── admin/                   # Admin dashboard pages
│   ├── teacher/                 # Teacher pages
│   ├── student/                 # Student pages
│   ├── components/              # Page-specific components
│   ├── dashboard/               # Main dashboard
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/                  # Shared UI components
│   ├── ui/                      # Base UI components (Shadcn)
│   ├── websocket-provider.tsx   # WebSocket setup
│   └── theme-provider.tsx       # Theme configuration
├── backend/                     # FastAPI application
│   ├── ai_agents/               # AI orchestration
│   ├── ml_models/               # Model management
│   ├── continuous_learning/     # Learning pipeline
│   ├── testing/                 # Backend tests
│   ├── main.py                  # Application entry
│   └── requirements.txt          # Python dependencies
├── k8s/                         # Kubernetes manifests
│   ├── production/              # Production configs
│   └── dev/                     # Development configs
├── helm/                        # Helm chart for deployment
├── terraform/                   # Infrastructure as Code
├── scripts/                     # Utility scripts
│   ├── deploy.sh                # Deployment script
│   ├── run-tests.sh             # Test runner
│   └── production-deploy.sh     # Production deployment
├── tests/                       # Test suites
│   ├── frontend/                # Frontend tests (Jest, RTL)
│   ├── e2e/                     # End-to-end tests (Cypress)
│   └── load/                    # Load testing (K6, JMeter)
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # System design
│   ├── DEVELOPMENT.md           # Dev setup
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── TESTING.md               # Testing strategy
├── monitoring/                  # Prometheus & alerting
├── databases/                   # Database configs
├── docker-compose.yml           # Development environment
└── docker-compose.production.yml # Production environment
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm/pnpm/yarn**
- **Python 3.10+** and **pip**
- **Docker** and **Docker Compose** (optional, for full stack)
- Environment variables (see below)

### Option 1: Local Development (Recommended for Development)

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Available on http://localhost:3000
```

#### Backend Setup
```bash
# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Set required environment variables
export OPENAI_API_KEY=your_key_here
export JWT_SECRET=your_secret_here
export DATABASE_URL=postgresql://user:password@localhost/evalai

# Run development server
python backend/main.py

# Available on http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Option 2: Docker Compose (Recommended for Full Stack Testing)
```bash
# Start all services (frontend, backend, databases)
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# MongoDB Express: http://localhost:8081 (if included)

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 3: Production-like Deployment
```bash
# Start production environment
docker-compose -f docker-compose.production.yml up -d

# Access via configured reverse proxy (typically http://your-domain)
```

## 🔐 Environment Variables

### Frontend Environment Variables
```bash
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Optional features
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Backend Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-...
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/evalai_db

# AI Providers (optional, but recommended)
GOOGLE_AI_API_KEY=your_google_key
ANTHROPIC_API_KEY=your_anthropic_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Data Stores
MONGODB_URL=mongodb://localhost:27017/evalai
REDIS_URL=redis://localhost:6379/0
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Cloud Storage
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1

# Monitoring & Observability
SENTRY_DSN=your_sentry_dsn
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001

# Machine Learning
WANDB_API_KEY=your_wandb_key
KAGGLE_API_KEY=your_kaggle_key
KAGGLE_USERNAME=your_kaggle_username

# Application Settings
LOG_LEVEL=INFO
DEBUG=false
```

## 📝 Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
npm test             # Run Jest tests
```

### Backend Scripts
```bash
python backend/main.py              # Start development server
python -m pytest backend/testing     # Run tests
bandit -r backend                   # Security scanning
```

### Infrastructure Scripts
```bash
bash scripts/run-tests.sh            # Complete test suite
bash scripts/deploy.sh               # Deploy to staging
bash scripts/production-deploy.sh    # Deploy to production
```

## ✅ Testing

### Frontend Testing
```bash
# Unit tests
npm test

# E2E tests (requires backend running)
npm run cypress:open

# Test coverage
npm run test -- --coverage
```

### Backend Testing
```bash
# Unit and integration tests
pytest backend/testing

# With coverage
pytest backend/testing --cov=backend

# Security scanning
bandit -r backend
```

### Full Test Suite
```bash
# Run all tests
bash scripts/run-tests.sh
```

## 🐳 Docker & Kubernetes

### Build Docker Images
```bash
# Frontend
docker build -f Dockerfile.frontend -t evalai:frontend .

# Backend
docker build -f backend/Dockerfile -t evalai:backend .
```

### Kubernetes Deployment
```bash
# Apply manifests
kubectl apply -f k8s/production/

# Or use Helm
helm install evalai-pro helm/ai-evaluator/ \
  --namespace evalai \
  --create-namespace \
  -f helm/ai-evaluator/values.yaml
```

## 📊 Monitoring & Observability

### Prometheus Metrics
Access Prometheus at `http://localhost:9090` (if running locally)

### Grafana Dashboards
Access Grafana at `http://localhost:3001` (if running locally)

### Application Monitoring
- Real-time metrics for API endpoints
- Model performance tracking
- System resource utilization
- Error rate monitoring

## 🔒 Security

### Best Practices
- All secrets are managed via environment variables (never committed)
- JWT tokens for API authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Rate limiting on API endpoints
- SQL injection prevention via SQLAlchemy ORM

### Security Scanning
```bash
# Frontend security audit
npm audit

# Backend security scanning
bandit -r backend

# SAST scanning with Semgrep
semgrep --config=p/security-audit backend/
```

### Reporting Vulnerabilities
Please see [SECURITY.md](SECURITY.md) for vulnerability disclosure guidelines.

## 🤝 Contributing

We welcome contributions! Please review our [Contributing Guidelines](CONTRIBUTING.md) for:
- Development setup instructions
- Branching and commit conventions
- Testing requirements
- Pull request process
- Code style guidelines

### Code of Conduct
All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md), which ensures a respectful and inclusive community.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What This Means
- ✅ You can use this for commercial projects
- ✅ You can modify and distribute
- ✅ You can use privately
- ❌ Liability is limited
- ❌ No warranty provided

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System design, components, and data flow
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)**: Local development setup and troubleshooting
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Deployment strategies, scaling, and production setup
- **[TESTING.md](docs/TESTING.md)**: Testing strategy, coverage, and CI/CD integration

## 🆘 Support & Community

### Getting Help
- **Documentation**: Check [docs/](docs/) directory for guides
- **Issues**: Report bugs or request features via [GitHub Issues](.github/ISSUE_TEMPLATE/)
- **Discussions**: Join community discussions for questions and ideas

### Contributing Issues
- Use provided issue templates for consistency
- Include reproduction steps for bugs
- Provide context about your environment

## 🗺️ Roadmap

### Q1 2024
- [ ] Enhanced ML model versioning
- [ ] Advanced analytics dashboard
- [ ] Batch processing API
- [ ] Mobile application

### Q2 2024
- [ ] Multi-language support
- [ ] Advanced permission system
- [ ] Custom evaluation pipelines
- [ ] Webhook integrations

### Q3 2024
- [ ] AI-powered test generation
- [ ] Integration with LMS platforms
- [ ] Advanced reporting features
- [ ] API rate limiting and quotas

## 🙏 Acknowledgments

Special thanks to:
- All contributors who have helped shape EvalAI Pro
- The open-source community for amazing libraries
- Our users for continuous feedback and improvement ideas

## 📞 Contact & Resources

- **Repository**: [GitHub](https://github.com/yourusername/evalai-pro)
- **Issues**: [GitHub Issues](.github/ISSUE_TEMPLATE/)
- **Documentation**: [docs/](docs/)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

**Made with ❤️ by the EvalAI Pro team**

Last updated: 2024
