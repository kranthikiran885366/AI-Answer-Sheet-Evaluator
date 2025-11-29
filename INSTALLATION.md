# Installation Guide

This guide provides detailed instructions for installing and running EvalAI Pro in different environments.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Docker Installation](#docker-installation)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **Python**: 3.10.0 or higher
- **npm/pnpm/yarn**: Latest version
- **Git**: For version control
- **RAM**: 4GB minimum
- **Disk Space**: 5GB minimum

### Recommended Requirements

- **Node.js**: 20.x LTS
- **Python**: 3.11 or 3.12
- **RAM**: 8GB or more
- **Disk Space**: 10GB or more
- **Docker**: 20.10+ (for containerized setup)
- **Docker Compose**: 2.0+

### Supported Operating Systems

- ✅ macOS 12+
- ✅ Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)
- ✅ Windows 10/11 with WSL2
- ✅ Cloud VMs (AWS EC2, Google Cloud, Azure, etc.)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/evalai-pro.git
cd evalai-pro
```

### 2. Frontend Setup

#### Install Node.js (if not installed)

**macOS:**
```bash
brew install node@18
brew install pnpm
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

**Windows:**
- Download from [nodejs.org](https://nodejs.org/)
- Install Node.js and npm

#### Install Frontend Dependencies

```bash
cd evalai-pro
pnpm install
# or: npm install
```

#### Start Development Server

```bash
pnpm dev
# or: npm run dev
```

Frontend will be available at: **http://localhost:3000**

### 3. Backend Setup

#### Install Python (if not installed)

**macOS:**
```bash
brew install python@3.11
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv
```

**Windows:**
- Download from [python.org](https://www.python.org/)
- Install and add to PATH

#### Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### Install Backend Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Set Environment Variables

Create a `.env` file in the backend directory:

```bash
# Core Configuration
OPENAI_API_KEY=sk-your-openai-key
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/evalai_dev

# Optional AI Providers
GOOGLE_AI_API_KEY=your-google-key
ANTHROPIC_API_KEY=your-anthropic-key

# Data Stores
MONGODB_URL=mongodb://localhost:27017/evalai_dev
REDIS_URL=redis://localhost:6379/0

# Application
LOG_LEVEL=INFO
DEBUG=true
```

#### Start Backend Server

```bash
python main.py
```

Backend API will be available at: **http://localhost:8000**
- API Documentation: **http://localhost:8000/docs**
- Alternative docs: **http://localhost:8000/redoc**

### 4. Database Setup (Optional for Local Development)

The application works with in-memory data stores by default. To use actual databases:

#### PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb evalai_dev
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo service postgresql start
sudo -u postgres createdb evalai_dev
```

**Docker:**
```bash
docker run --name evalai-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=evalai_dev \
  -p 5432:5432 \
  -d postgres:15
```

#### MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Docker:**
```bash
docker run --name evalai-mongodb \
  -p 27017:27017 \
  -d mongo:6
```

#### Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Docker:**
```bash
docker run --name evalai-redis \
  -p 6379:6379 \
  -d redis:7
```

## Docker Installation

### Prerequisites

- Docker: 20.10+
- Docker Compose: 2.0+

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services available:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379

### Building Custom Images

```bash
# Build frontend image
docker build -f Dockerfile.frontend -t evalai:frontend .

# Build backend image
docker build -f backend/Dockerfile -t evalai:backend .

# Run containers
docker run -p 3000:3000 evalai:frontend
docker run -p 8000:8000 evalai:backend
```

## Production Deployment

### 1. Environment Variables

Create `.env.production` with secure values:

```bash
OPENAI_API_KEY=your_production_key
JWT_SECRET=your_production_secret
DATABASE_URL=postgresql://user:password@prod-db-host:5432/evalai
REDIS_URL=redis://prod-redis-host:6379
```

### 2. Deploying to Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Deploying to Heroku (Backend)

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login and deploy
heroku login
heroku create your-app-name
git push heroku main
```

### 4. Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace evalai

# Apply configurations
kubectl apply -f k8s/production/ -n evalai

# Or use Helm
helm install evalai-pro helm/ai-evaluator/ \
  --namespace evalai \
  --values helm/ai-evaluator/values.yaml
```

### 5. Docker Compose Production

```bash
# Start production environment
docker-compose -f docker-compose.production.yml up -d

# Stop services
docker-compose -f docker-compose.production.yml down
```

## Verification

### Frontend Health Check

```bash
curl http://localhost:3000
```

### Backend Health Check

```bash
curl http://localhost:8000/health
```

### API Documentation

Visit: http://localhost:8000/docs

## Troubleshooting

### Frontend Issues

**Issue: `npm install` fails**
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue: Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

**Issue: Module not found**
```bash
# Ensure all dependencies are installed
npm install
# Rebuild modules
npm rebuild
```

### Backend Issues

**Issue: ModuleNotFoundError**
```bash
# Verify virtual environment is activated
which python
# Should show path to venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Issue: Database connection error**
```bash
# Check database is running
psql -U postgres -d evalai_dev

# Verify connection string
echo $DATABASE_URL
```

**Issue: Port 8000 already in use**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
# Or use different port
python main.py --port 8001
```

### Database Issues

**PostgreSQL connection refused**
```bash
# Restart PostgreSQL service
brew services restart postgresql
# or
sudo service postgresql restart
```

**MongoDB connection failed**
```bash
# Verify MongoDB is running
mongosh

# Restart service
brew services restart mongodb-community
```

**Redis connection failed**
```bash
# Verify Redis is running
redis-cli ping
# Should return: PONG

# Restart service
brew services restart redis
```

### Docker Issues

**Docker daemon not running**
```bash
# Start Docker Desktop or daemon
open /Applications/Docker.app
# Linux:
sudo systemctl start docker
```

**Permission denied errors**
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

**Out of space**
```bash
# Clean up Docker resources
docker system prune -a
```

## Next Steps

After successful installation:

1. **Read Documentation**: Check [docs/](docs/) directory
2. **Run Tests**: Execute `bash scripts/run-tests.sh`
3. **Read Contributing Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Check API Docs**: Visit http://localhost:8000/docs
5. **Explore Examples**: Check the codebase structure

## Getting Help

- 📚 [Documentation](docs/)
- 💬 [GitHub Discussions](https://github.com/your-repo/evalai-pro/discussions)
- 🐛 [Issue Tracker](https://github.com/your-repo/evalai-pro/issues)
- 🔒 [Security](SECURITY.md)

---

**Questions?** Open an issue or contact maintainers!
