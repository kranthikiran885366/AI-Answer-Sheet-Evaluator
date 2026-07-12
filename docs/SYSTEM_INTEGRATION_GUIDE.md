# System Integration Guide - EvalAI Pro Backend

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Integration](#component-integration)
3. [Data Flow](#data-flow)
4. [Deployment Options](#deployment-options)
5. [Integration Checklist](#integration-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Two-Tier Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│            (Next.js Client-Side Components)              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────────┐
│             Next.js API Layer (Tier 1)                  │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Auth Routes │  │ Upload Route │  │ Eval Route   │   │
│  └─────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Internal Libraries (TypeScript)         │   │
│  │ ┌──────────┐ ┌──────┐ ┌──────────┐ ┌────────┐ │   │
│  │ │   Auth   │ │  DB  │ │ Eval Eng │ │Rubrics │ │   │
│  │ └──────────┘ └──────┘ └──────────┘ └────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────┬──────────┘
           │                                  │
           │ Direct AI API Calls              │ FastAPI Calls
           │                                  │
     ┌─────▼─────┐                    ┌──────▼──────┐
     │ OpenAI    │                    │   Python    │
     │ Google    │                    │  FastAPI    │ (Tier 2)
     │ Anthropic │                    │   Bridge    │
     └───────────┘                    └──────┬──────┘
                                             │
                                    ┌────────▼────────────┐
                                    │  Python Backends    │
                                    │                     │
                                    │ ┌───────────────┐   │
                                    │ │ AI Agents     │   │
                                    │ ├───────────────┤   │
                                    │ │ ML Models     │   │
                                    │ ├───────────────┤   │
                                    │ │ Continuous    │   │
                                    │ │ Learning      │   │
                                    │ └───────────────┘   │
                                    └────────┬────────────┘
                                             │
                                    ┌────────▼────────────┐
                                    │  Data Layer         │
                                    │                     │
                                    │ ┌────────────────┐  │
                                    │ │  PostgreSQL    │  │
                                    │ ├────────────────┤  │
                                    │ │  MongoDB       │  │
                                    │ ├────────────────┤  │
                                    │ │  Redis         │  │
                                    │ ├────────────────┤  │
                                    │ │  S3/GCS        │  │
                                    │ └────────────────┘  │
                                    └────────────────────┘
```

### Tier 1: Next.js API (Always Running)

- **Purpose**: REST API entry point, user authentication, file handling
- **Technology**: Node.js + TypeScript
- **Deployment**: Vercel (serverless or standard)
- **Responsibilities**:
  - User registration and login
  - File upload and validation
  - Request routing and load balancing
  - Response formatting and caching
  - WebSocket management

### Tier 2: Python FastAPI (Optional)

- **Purpose**: Advanced AI processing, ML model management
- **Technology**: Python 3.10+, FastAPI, async processing
- **Deployment**: AWS EC2, Docker, or local development
- **Responsibilities**:
  - AI evaluation orchestration
  - Multi-provider consensus
  - Continuous learning
  - Advanced analytics
  - Model management

---

## Component Integration

### 1. Authentication Integration

#### Next.js Side (`/app/api/auth/`)

```typescript
// lib/auth.ts
- JWT token generation
- Password hashing (bcrypt)
- Session management
- Role validation

// app/api/auth/login/route.ts
- Credentials verification
- Token issuance
- Response formatting

// app/api/auth/register/route.ts
- User creation
- Input validation
- Email verification (optional)
```

#### Database Integration

```
Users Table Structure:
├── id (UUID)
├── username (unique)
├── email (unique)
├── passwordHash (bcrypt)
├── role (student|teacher|admin)
├── institution
└── createdAt

File: /databases/sql_config.py :: User model
```

#### How It Works

```
Client Login Request
      ↓
lib/auth.ts: Validate credentials
      ↓
SQL Query: Find user by username
      ↓
bcrypt: Compare passwords
      ↓
JWT: Generate token
      ↓
Redis: Store session (optional)
      ↓
Return token to client
```

---

### 2. File Upload & Processing Integration

#### Next.js Upload Handler (`/app/api/upload/route.ts`)

**Input:**
```
FormData {
  file: File
  studentName: string
  subject: string
  examType: string
  rubric?: string
}
```

**Validation:**
- File type check (JPG, PNG, TIFF, PDF)
- File size limit (50MB)
- MIME type verification

**Processing:**
```typescript
1. Generate unique sessionId (UUID)
2. Create upload directory: uploads/{sessionId}/
3. Save file: uploads/{sessionId}/answer_sheet.{ext}
4. Save metadata: uploads/{sessionId}/meta.json
5. Create DB record: evaluations table
6. Return: { sessionId, evaluationId }
```

#### Database Record Creation

```sql
INSERT INTO evaluations (
  id, user_id, session_id, student_name, subject,
  exam_type, status, created_at
) VALUES (
  uuid(), current_user_id, 'session-123', 'John Doe',
  'Mathematics', 'Final Exam', 'pending', NOW()
);
```

---

### 3. Evaluation Processing Integration

#### Main Workflow: Next.js → Python Bridge → AI APIs

```
Next.js /api/evaluate/route.ts
  │
  ├─ Load file from uploads/{sessionId}/
  │
  ├─ Option A: Direct AI Processing
  │  └─ lib/evaluation-engine.ts
  │     ├─ OpenAI API call (if configured)
  │     ├─ Google Gemini API call (fallback)
  │     └─ Demo mode (fallback)
  │
  └─ Option B: Python Bridge Processing (if enabled)
     └─ POST /evaluate to FastAPI
        └─ backend/fastapi_bridge.py
           ├─ AIAgentManager
           ├─ Multi-provider consensus
           └─ Advanced ML models

Result → Redis Cache → Database → Client
```

#### Direct Evaluation (Next.js Only)

```typescript
// lib/evaluation-engine.ts
async function processEvaluation(request, imagePath) {
  1. Extract text from image (OCR)
     ├─ OpenAI GPT-4 Vision
     ├─ Google Gemini Vision
     └─ Fallback: pytesseract mock

  2. Create evaluation prompt
     ├─ Insert question context
     ├─ Apply rubric
     └─ Format JSON request

  3. Call AI API (with retry logic)
     ├─ Set timeout (30s)
     ├─ Handle errors
     └─ Parse JSON response

  4. Structure result
     ├─ Calculate percentage
     ├─ Assign grade
     └─ Format feedback

  5. Cache and persist
     ├─ Redis cache (30 min)
     └─ Database update
}
```

#### Advanced Evaluation (with Python Bridge)

```python
# backend/fastapi_bridge.py
async def evaluate(request: EvaluationRequest):
  1. Check cache
     └─ Return if found (hash-based)

  2. Route to appropriate processor
     ├─ consensus: Multiple providers
     ├─ openai: Single provider
     ├─ google: Single provider
     └─ local: Demo/local model

  3. Execute evaluation
     ├─ AgentManager.evaluate_with_consensus()
     │  └─ Parallel API calls
     │  └─ Result aggregation
     ├─ Or single provider call
     └─ Or local/demo mode

  4. Post-processing
     ├─ Confidence calibration
     ├─ Explainability scoring
     └─ Quality assurance

  5. Return result
     ├─ Cache for future requests
     └─ Store in MongoDB
```

---

### 4. Results & Analytics Integration

#### Results Retrieval (`/app/api/results/[id]/route.ts`)

```
GET /api/results/{evaluationId}
  │
  ├─ Authentication check
  │
  ├─ Load from database
  │  ├─ evaluations table (SQL)
  │  ├─ evaluation_results collection (MongoDB)
  │  └─ Redis cache (if available)
  │
  └─ Return structured result
     ├─ Score breakdown
     ├─ Feedback details
     ├─ Performance metrics
     └─ Processing metadata
```

#### Analytics Integration

```
API Endpoints:
├─ /api/dashboard-stats
│  └─ User-specific statistics
│     ├─ Total evaluations
│     ├─ Average score
│     ├─ Subject breakdown
│     └─ Recent activities

├─ /api/analytics
│  └─ Detailed analytics
│     ├─ Performance trends
│     ├─ Model accuracy
│     ├─ Processing times
│     └─ Error rates

└─ /api/status
   └─ System health
      ├─ Provider status
      ├─ System resources
      ├─ Active sessions
      └─ Cache statistics
```

#### Data Aggregation

```
Raw Data Sources:
├─ PostgreSQL (structured evaluations)
├─ MongoDB (time-series analytics)
├─ Redis (real-time metrics)
└─ File system (processing logs)

  ↓

Aggregation Layer (lib/db.ts):
├─ Query builders
├─ Cache layers
├─ Pagination
└─ Filtering

  ↓

API Response:
├─ Formatted JSON
├─ Cached results
└─ Real-time metrics
```

---

## Data Flow

### Complete Evaluation Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: FILE UPLOAD                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ User Action: Click upload, select file                      │
│ Frontend: Prepare FormData with metadata                    │
│ Route: POST /api/upload                                     │
│                                                               │
│ Processing:                                                  │
│ ├─ Validate file (type, size, MIME)                         │
│ ├─ Generate session ID                                      │
│ ├─ Create upload directory                                  │
│ ├─ Save file to disk                                        │
│ ├─ Write metadata JSON                                      │
│ ├─ Create evaluation record in DB                           │
│ └─ Return { sessionId, evaluationId }                       │
│                                                               │
│ Storage:                                                     │
│ ├─ File system: uploads/session-123/answer_sheet.jpg       │
│ ├─ File system: uploads/session-123/meta.json              │
│ └─ Database: evaluations record (status: pending)           │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: EVALUATION INITIATION                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ User Action: Click "Start Evaluation"                       │
│ Frontend: POST /api/evaluate with sessionId                │
│ Route: POST /api/evaluate                                   │
│                                                               │
│ Processing:                                                  │
│ ├─ Load file from uploads/{sessionId}/                     │
│ ├─ Load metadata                                            │
│ ├─ Update status: pending → processing                     │
│ ├─ Trigger evaluation engine                               │
│ └─ Return evaluation status                                │
│                                                               │
│ Database Update:                                            │
│ ├─ Set status = 'processing'                               │
│ └─ Set startedAt = NOW()                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: AI PROCESSING (CHOICE A: DIRECT)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ lib/evaluation-engine.ts                                    │
│ ├─ OCR Extraction                                           │
│ │  ├─ Call OpenAI Vision (if API key set)                  │
│ │  ├─ Or call Google Vision API                            │
│ │  └─ Extract and normalize text                           │
│ │                                                            │
│ ├─ Evaluation Prompt Creation                              │
│ │  ├─ Insert question context                              │
│ │  ├─ Apply rubric criteria                                │
│ │  ├─ Format JSON request schema                           │
│ │  └─ Set model parameters                                 │
│ │                                                            │
│ ├─ AI API Call                                             │
│ │  ├─ Attempt 1: OpenAI GPT-4o                            │
│ │  ├─ Attempt 2: Google Gemini (fallback)                 │
│ │  └─ Attempt 3: Demo mode (fallback)                     │
│ │                                                            │
│ ├─ Response Parsing                                        │
│ │  ├─ Extract JSON from response                           │
│ │  ├─ Validate schema                                      │
│ │  └─ Handle errors                                        │
│ │                                                            │
│ └─ Result Structuring                                      │
│    ├─ Calculate percentage                                 │
│    ├─ Assign grade (A+, A, B+, etc.)                      │
│    ├─ Compile feedback                                     │
│    └─ Add metadata (provider, confidence, timing)          │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 3B: AI PROCESSING (CHOICE B: PYTHON BRIDGE)            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ backend/fastapi_bridge.py                                  │
│ ├─ Receive evaluation request                              │
│ ├─ Check Redis cache (with image hash)                     │
│ │  └─ Return if found                                      │
│ │                                                            │
│ ├─ Route to evaluation mode                                │
│ │  ├─ Consensus Mode:                                      │
│ │  │  ├─ Dispatch to OpenAI Agent                         │
│ │  │  ├─ Dispatch to Google Agent                         │
│ │  │  ├─ Dispatch to Claude Agent (if enabled)           │
│ │  │  ├─ Await all results                               │
│ │  │  ├─ Aggregate scores (average)                       │
│ │  │  ├─ Combine feedback                                 │
│ │  │  └─ Return consensus result                          │
│ │  │                                                        │
│ │  └─ Single Provider Mode:                               │
│ │     ├─ Select provider                                  │
│ │     ├─ Call agent's evaluate_answer()                   │
│ │     └─ Return direct result                             │
│ │                                                            │
│ ├─ Result Caching                                          │
│ │  ├─ Store in Redis (30 min TTL)                         │
│ │  └─ Store in MongoDB (permanent)                        │
│ │                                                            │
│ └─ Return to Next.js                                       │
│                                                               │
│ Data Flow:                                                   │
│ OpenAI → AIAgentManager → FastAPI Bridge → Next.js API    │
│ Google ↗                                                     │
│ Claude ↗                                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: RESULT STORAGE & CACHING                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Storage Layer Update:                                       │
│                                                               │
│ PostgreSQL (evaluations table):                             │
│ ├─ Update status: processing → completed                   │
│ ├─ Store scores & grades                                   │
│ ├─ Store feedback text                                     │
│ ├─ Store metadata (provider, confidence, timing)           │
│ └─ Set completedAt = NOW()                                 │
│                                                               │
│ MongoDB (evaluation_results collection):                    │
│ ├─ Insert denormalized result                              │
│ ├─ Add user/subject filters                                │
│ ├─ Store extracted text                                    │
│ └─ Store confidence breakdown                              │
│                                                               │
│ Redis (cache layer):                                       │
│ ├─ Cache full result (30 min TTL)                          │
│ ├─ Store score for leaderboards                            │
│ └─ Update session data                                     │
│                                                               │
│ File System:                                                │
│ └─ Store result JSON: uploads/session-123/result.json     │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 5: NOTIFICATION & RESPONSE                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Client Notification:                                        │
│ ├─ WebSocket: Send evaluation complete event               │
│ ├─ Or: Polling: Client checks /api/results/{id}           │
│ └─ Show success toast notification                         │
│                                                               │
│ Response to Client:                                         │
│ ├─ HTTP 200 OK                                             │
│ ├─ JSON Response:                                           │
│ │  ├─ evaluationId                                         │
│ │  ├─ score, grade, percentage                             │
│ │  ├─ feedback object                                      │
│ │  ├─ strengths array                                      │
│ │  ├─ improvements array                                   │
│ │  ├─ questions array (detailed feedback)                  │
│ │  └─ metadata (provider, confidence, timing)              │
│ │                                                            │
│ └─ Frontend Display:                                        │
│    ├─ Show score card                                      │
│    ├─ Render feedback                                      │
│    ├─ Display question breakdown                           │
│    └─ Offer download/share options                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 6: ANALYTICS & CONTINUOUS LEARNING                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Post-Processing:                                            │
│                                                               │
│ Analytics Update:                                           │
│ ├─ Update user statistics                                  │
│ ├─ Update subject statistics                               │
│ ├─ Update model performance metrics                        │
│ └─ Update leaderboards                                     │
│                                                               │
│ Continuous Learning (if enabled):                           │
│ ├─ Store evaluation as training sample                     │
│ ├─ Check for model drift                                   │
│ ├─ Trigger retraining if drift detected                    │
│ ├─ Update model weights                                    │
│ └─ A/B test new model                                      │
│                                                               │
│ Monitoring:                                                 │
│ ├─ Log metrics to Prometheus                               │
│ ├─ Track request duration                                  │
│ ├─ Monitor error rates                                     │
│ └─ Alert on anomalies                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Options

### Option 1: Next.js Only (Development/Small Scale)

**Setup:**
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Add: OPENAI_API_KEY or GEMINI_API_KEY

# Run locally
npm run dev

# Build for production
npm run build
npm start
```

**Deployment:**
```bash
# Deploy to Vercel
vercel deploy

# Or self-host with Node.js
npm run build
NODE_ENV=production npm start
```

**Architecture:**
```
Client ↔ Vercel/Node.js ↔ OpenAI/Google APIs
         (Direct calls)
```

### Option 2: Next.js + Python Backend (Enterprise)

**Setup Python Backend:**
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_key
export GOOGLE_API_KEY=your_key
export DATABASE_URL=postgresql://...
export MONGODB_URL=mongodb://...
export REDIS_URL=redis://...

# Run FastAPI bridge
uvicorn fastapi_bridge:app --host 0.0.0.0 --port 8000
```

**Setup PostgreSQL:**
```bash
# Docker
docker run -d \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ai_evaluator \
  -p 5432:5432 \
  postgres:15

# Initialize schema
python backend/databases/sql_config.py
```

**Setup MongoDB:**
```bash
# Docker
docker run -d \
  -p 27017:27017 \
  mongo:latest

# Create indexes
python backend/databases/mongodb_config.py
```

**Setup Redis:**
```bash
# Docker
docker run -d \
  -p 6379:6379 \
  redis:latest
```

**Docker Compose:**
```bash
# Run all services
docker-compose -f docker-compose.yml up -d

# Run in production
docker-compose -f docker-compose.production.yml up -d
```

**Deployment:**
```
Vercel (Next.js)
    ↓ REST calls
AWS ECS/EC2 (Python FastAPI)
    ↓
AWS RDS (PostgreSQL)
AWS DocumentDB (MongoDB)
AWS ElastiCache (Redis)
AWS S3 (File Storage)
```

### Option 3: Kubernetes (Large Scale)

**Files:**
- `k8s/deployment.yaml` - Kubernetes deployments
- `k8s/service.yaml` - Service definitions
- `k8s/ingress.yaml` - Ingress configuration
- `helm/` - Helm charts for package management

**Deployment:**
```bash
# Apply configurations
kubectl apply -f k8s/

# Or use Helm
helm install eval-ai ./helm/eval-ai

# Monitor
kubectl get pods
kubectl logs deployment/nextjs-api
kubectl logs deployment/fastapi-backend
```

---

## Integration Checklist

### Pre-Integration Setup

- [ ] Database setup (PostgreSQL, MongoDB, Redis)
- [ ] API keys obtained (OpenAI, Google, Anthropic)
- [ ] Environment variables configured
- [ ] File storage prepared (local or cloud)
- [ ] Logging system set up
- [ ] Monitoring tools configured

### Next.js API Integration

- [ ] Authentication system tested
- [ ] File upload route working
- [ ] Evaluation engine connected to AI APIs
- [ ] Results storage verified
- [ ] Analytics endpoints functional
- [ ] Error handling implemented
- [ ] Rate limiting configured

### Python Backend Integration (if using)

- [ ] FastAPI server running
- [ ] AI agents loaded successfully
- [ ] Database connections established
- [ ] Redis cache operational
- [ ] Evaluation endpoints responding
- [ ] Health checks passing
- [ ] Metrics collection working

### Frontend Integration

- [ ] API client configured with correct endpoints
- [ ] Authentication flow tested end-to-end
- [ ] File upload displays progress
- [ ] Evaluation results display correctly
- [ ] Analytics dashboard shows data
- [ ] Error messages appropriate
- [ ] Loading states visible

### Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end tests pass
- [ ] Load testing completed
- [ ] Security scanning passed
- [ ] Performance benchmarks met

### Deployment

- [ ] Staging environment operational
- [ ] Production environment prepared
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Rollback plan documented
- [ ] Documentation updated
- [ ] User training completed

---

## Troubleshooting

### Common Issues & Solutions

#### 1. AI API Calls Failing

**Error:** `400 Bad Request from OpenAI API`

**Causes:**
- Invalid API key
- Rate limit exceeded
- Invalid request format
- Model availability issues

**Solutions:**
```bash
# Check API key
echo $OPENAI_API_KEY

# Verify request format in evaluation-engine.ts
# Check rate limits at openai.com/account/rate-limits

# Fallback to local demo mode
# (automatically used if API call fails)
```

#### 2. Database Connection Errors

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres

# Verify DATABASE_URL
echo $DATABASE_URL

# Check connection
psql $DATABASE_URL -c "SELECT 1"
```

#### 3. File Upload Failures

**Error:** `413 Payload Too Large`

**Solutions:**
```typescript
// Check file size limit in /api/upload
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Increase Next.js limit if needed
// next.config.mjs
module.exports = {
  serverRuntimeConfig: {
    maxUploadSize: 100 * 1024 * 1024, // 100MB
  },
}
```

#### 4. Evaluation Engine Timeout

**Error:** `504 Gateway Timeout`

**Solutions:**
```typescript
// Increase timeout in evaluation-engine.ts
const EVAL_TIMEOUT = 60000; // 60 seconds

// Or implement async evaluation with polling
// POST /api/evaluate (returns job ID)
// GET /api/results/{id} (checks progress)

// Use Redis queue for background processing
// await redis.enqueue_task('evaluation', {...})
```

#### 5. Cache Issues

**Error:** `Stale data being returned`

**Solutions:**
```bash
# Clear Redis cache
redis-cli FLUSHALL

# Or specific key
redis-cli DEL "eval:*"

# Check cache TTL
redis-cli TTL "key"

# Verify cache is working
redis-cli PING
```

#### 6. Memory Leaks

**Error:** `Out of Memory - Node process crashed`

**Solutions:**
```bash
# Monitor memory usage
node --max_old_space_size=4096 server.js

# Check for memory leaks
npm install clinic
clinic doctor -- npm start

# Profile with Chrome DevTools
node --inspect server.js
# chrome://inspect

# Increase Vercel memory
# vercel.json
{
  "functions": {
    "api/**": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

### Performance Optimization Tips

1. **Enable Caching**
   - Set Redis TTL appropriately
   - Cache rubrics and templates
   - Implement client-side caching

2. **Optimize Queries**
   - Add database indexes
   - Use connection pooling
   - Paginate large results

3. **Parallel Processing**
   - Use multi-agent consensus
   - Parallel AI API calls
   - Background task queuing

4. **CDN Configuration**
   - Cache static assets
   - Compress responses
   - Use edge locations

5. **Database Tuning**
   - Analyze slow queries
   - Optimize indexes
   - Archive old data

---

## Support & Documentation

For more help:
- API Documentation: `/docs` or `/api-docs`
- Health Check: `GET /api/status`
- Logs: Check application logs directory
- Issues: GitHub Issues or internal ticket system

