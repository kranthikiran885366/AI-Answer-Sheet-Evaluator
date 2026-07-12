# EvalAI Pro - Complete Backend Implementation

## Overview

This document summarizes the complete backend implementation for the EvalAI Pro application, including all APIs, database systems, authentication, and processing engines.

## Project Structure

```
/app/api/                           # Next.js API routes
├── auth/                           # Authentication endpoints
│   ├── login/route.ts             # User login
│   ├── register/route.ts          # User registration
│   └── me/route.ts                # Get current user
├── upload/route.ts                 # File upload endpoint
├── evaluate/route.ts               # Start evaluation process
├── evaluations/route.ts            # List/manage evaluations
├── results/[id]/route.ts          # Get evaluation results
├── dashboard-stats/route.ts        # Dashboard statistics
├── status/route.ts                 # System status
├── rubrics/route.ts                # Rubrics management
├── feedback/route.ts               # Feedback templates
├── analytics/route.ts              # Advanced analytics
└── ws/route.ts                     # WebSocket endpoint (future)

/lib/                               # Core libraries
├── auth.ts                         # JWT authentication & user management
├── db.ts                           # Database layer & evaluation storage
├── evaluation-engine.ts            # AI evaluation processing
├── api-client.ts                   # Frontend API client
├── rubrics.ts                      # Rubrics management
└── feedback-templates.ts           # Feedback templates

/docs/                              # Documentation
├── API.md                          # Complete API documentation
└── BACKEND_IMPLEMENTATION.md       # This file
```

## Core Components

### 1. Authentication System (`/lib/auth.ts`)

**Features:**
- JWT-based token authentication
- User registration with validation
- Password hashing with bcryptjs
- Role-based access control (admin, teacher, student)
- Demo users for testing

**Key Functions:**
```typescript
- findUserById(id: string): User
- findUserByUsername(username: string): User
- findUserByEmail(email: string): User
- verifyPassword(plainPassword, hashedPassword): boolean
- createUser(userData): User
- signToken(user): string
- verifyToken(token): TokenPayload
- toPublicUser(user): PublicUser
```

**Demo Credentials:**
- Admin: admin/admin123
- Teacher: teacher/teacher123
- Student: student/student123

### 2. Database Layer (`/lib/db.ts`)

**Features:**
- In-memory database with file persistence
- Evaluation session management
- Statistics tracking
- User evaluation history

**Data Models:**
```typescript
interface Evaluation {
  id: string
  userId: string
  sessionId: string
  studentName: string
  subject: string
  examType: string
  fileName: string
  status: "pending" | "processing" | "completed" | "failed"
  result?: EvaluationResult
  uploadedAt: string
  metadata?: Record<string, any>
}
```

**Key Functions:**
```typescript
- createEvaluation(userId, sessionId, data): Evaluation
- getEvaluation(id): Evaluation | null
- getUserEvaluations(userId): Evaluation[]
- updateEvaluationStatus(id, status, result?): Evaluation
- getStatistics(userId?): Statistics
```

### 3. Evaluation Engine (`/lib/evaluation-engine.ts`)

**Features:**
- OCR text extraction from images
- AI-powered evaluation with multiple providers
- Structured JSON output
- Confidence scoring
- Processing time tracking

**Supported AI Providers:**
1. **OpenAI GPT-4o** - Primary provider (requires OPENAI_API_KEY)
2. **Google Gemini Flash** - Alternative (requires GEMINI_API_KEY)
3. **Demo Mode** - Fallback when no API keys configured

**Key Functions:**
```typescript
- extractTextWithOCR(imagePath, apiKey): Promise<string>
- processWithOpenAI(input, apiKey): Promise<EvaluationResult>
- processWithGemini(input, apiKey): Promise<EvaluationResult>
- generateDemoEvaluation(input): EvaluationResult
- processEvaluation(input, imagePath): Promise<EvaluationResult>
```

**Evaluation Output:**
```json
{
  "obtainedMarks": 75,
  "totalMarks": 100,
  "percentage": 75,
  "grade": "B+",
  "confidenceScore": 88.5,
  "overallFeedback": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "questions": [...],
  "aiProvider": "openai|gemini|demo",
  "evaluationDate": "2024-07-12T10:30:00Z",
  "processingTime": 3.5
}
```

### 4. Rubrics Management (`/lib/rubrics.ts`)

**Features:**
- Create custom evaluation rubrics
- Predefined rubrics for common subjects
- Criteria-based scoring
- Weightage system
- Public/private rubrics

**Predefined Rubrics:**
- Mathematics: Concepts, Problem-Solving, Presentation
- Science: Knowledge, Analysis, Expression
- English: Content, Grammar, Organization

**Key Functions:**
```typescript
- createRubric(userId, rubricData): Rubric
- getRubric(id): Rubric | null
- getUserRubrics(userId): Rubric[]
- updateRubric(id, updates): Rubric
- deleteRubric(id, userId): boolean
```

### 5. Feedback Templates (`/lib/feedback-templates.ts`)

**Features:**
- Pre-built feedback templates
- Template population with placeholders
- Feedback generation
- Organized by categories

**Template Categories:**
- Strengths (5 templates)
- Improvements (7 templates)
- Overall Comments (5 templates)

**Key Functions:**
```typescript
- getTemplatesByCategory(category): FeedbackTemplate[]
- populateTemplate(template, placeholders): string
- generateFeedback(strengths, improvements, overall): string
```

### 6. API Client (`/lib/api-client.ts`)

**Features:**
- Centralized API communication
- Automatic token management
- Error handling
- Polling support
- Request/response formatting

**Key Methods:**
```typescript
apiClient.login(username, password)
apiClient.register(username, email, password, role)
apiClient.uploadFile(file, studentName, subject, examType, rubric?)
apiClient.startEvaluation(sessionId)
apiClient.getEvaluations(subject?, status?, limit?, offset?)
apiClient.getEvaluationResult(evaluationId)
apiClient.getDashboardStats()
apiClient.getSystemStatus()
apiClient.pollEvaluation(evaluationId, maxAttempts, delayMs)
```

## API Routes

### Authentication Routes

#### `POST /auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{ "username": "string", "password": "string" }
```

**Response:**
```json
{
  "success": true,
  "access_token": "jwt_token",
  "user": { "id", "username", "email", "role", "name", "institution" }
}
```

#### `POST /auth/register`
Create new user account.

**Request:**
```json
{
  "username": "string",
  "email": "email@example.com",
  "password": "string",
  "role": "admin|teacher|student",
  "name": "string",
  "institution": "string"
}
```

#### `GET /auth/me`
Get authenticated user's profile.

### File & Evaluation Routes

#### `POST /upload`
Upload answer sheet for evaluation.

**Authentication:** Required (Bearer token)
**Content-Type:** multipart/form-data

**Form Fields:**
- file: Binary file (JPG, PNG, TIFF, PDF, max 50MB)
- studentName: string
- subject: string
- examType: string
- rubric: string (optional)

**Response:** `{ success: true, sessionId, evaluationId }`

#### `POST /evaluate`
Start AI evaluation of uploaded file.

**Request:**
```json
{ "sessionId": "uuid" }
```

**Response:**
```json
{
  "success": true,
  "result": { ...EvaluationResult }
}
```

#### `GET /evaluations`
List user's evaluations with optional filtering.

**Query Parameters:**
- subject: string (optional)
- status: pending|processing|completed|failed (optional)
- limit: number (default: 50)
- offset: number (default: 0)

#### `GET /results/{evaluationId}`
Get detailed results for specific evaluation.

#### `DELETE /evaluations?id={evaluationId}`
Delete evaluation and its results.

### Dashboard & Analytics Routes

#### `GET /dashboard-stats`
Get user's evaluation statistics.

**Response:**
```json
{
  "statistics": {
    "total": 25,
    "completed": 20,
    "pending": 3,
    "failed": 2,
    "averageMarks": 78.5,
    "averageConfidence": 88.2,
    "gradeDistribution": {...}
  },
  "system": { "cpu", "memory", "uptime", ... },
  "aiProviders": { "openai", "gemini", "active", ... }
}
```

#### `GET /status`
Get system operational status.

**Response:**
```json
{
  "status": "operational",
  "version": "3.0.0",
  "sessions": { "total", "completed", "processing", "failed", "pending" },
  "evaluations": { ...statistics },
  "system": { "platform", "memory", "cpus", ... }
}
```

#### `GET /analytics`
Get detailed analytics and trends.

**Response:**
```json
{
  "summary": { ...statistics },
  "distributions": { "bySubject", "byGrade", "marksDistribution" },
  "trends": { "marksTrend", "recentEvaluations" },
  "timeline": { "2024-07-12": 5, ... },
  "confidenceScores": { "min", "max", "average" },
  "processingTimes": { "min", "max", "average" }
}
```

### Rubrics & Feedback Routes

#### `GET /rubrics`
Get all available rubrics (user + default).

**Response:**
```json
{
  "userRubrics": [...],
  "defaultRubrics": [...],
  "total": number
}
```

#### `POST /rubrics`
Create custom rubric.

**Request:**
```json
{
  "name": "string",
  "subject": "string",
  "description": "string",
  "totalMarks": number,
  "criteria": [...CriteriObjects],
  "isPublic": boolean
}
```

#### `GET /feedback`
Get feedback templates (optional: filter by category or ID).

**Query Parameters:**
- category: string (optional)
- templateId: string (optional)

#### `POST /feedback`
Generate feedback using templates or populate template.

**Mode 1: Populate Template**
```json
{
  "mode": "populate",
  "templateId": "string",
  "placeholders": { "key": "value", ... }
}
```

**Mode 2: Generate Composite Feedback**
```json
{
  "mode": "generate",
  "strengths": ["string", ...],
  "improvements": ["string", ...],
  "overallComment": "string"
}
```

## Environment Variables

### Required
- `JWT_SECRET`: Secret key for JWT signing (generate with: `openssl rand -base64 32`)

### Optional (for AI Features)
- `OPENAI_API_KEY`: OpenAI API key (for GPT-4 evaluation)
- `GEMINI_API_KEY`: Google Gemini API key

## Data Persistence

### File-Based Storage
- `/data/evaluations.json` - Evaluation records
- `/data/rubrics.json` - Custom rubrics
- `/uploads/{sessionId}/` - Uploaded files and metadata

### In-Memory Cache
- User store with fast lookups
- Evaluation cache with session mapping
- Rubrics cache with user filtering

## Security Features

1. **JWT Authentication**
   - Token-based stateless auth
   - Expiry: 7 days
   - Secure signature verification

2. **Password Security**
   - bcryptjs hashing with salt
   - Minimum 6 characters validation
   - Never stored in plain text

3. **Role-Based Access Control**
   - Admin: Full system access
   - Teacher: Can manage evaluations
   - Student: Can view own evaluations

4. **Input Validation**
   - Email format validation
   - Username length validation
   - File type restrictions
   - File size limits (50MB)

5. **CORS & Security Headers**
   - Authorization header validation
   - Token format verification
   - User access scope checking

## Error Handling

All errors follow standardized JSON format:
```json
{
  "error": "Error description",
  "status": 400
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Server Error

## Testing

### Manual Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}'
```

**Upload File:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@answer_sheet.pdf" \
  -F "studentName=John Doe" \
  -F "subject=Mathematics" \
  -F "examType=Final Exam"
```

**Start Evaluation:**
```bash
curl -X POST http://localhost:3000/api/evaluate \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"{sessionId}"}'
```

**Get Statistics:**
```bash
curl http://localhost:3000/api/dashboard-stats \
  -H "Authorization: Bearer {token}"
```

## Performance Considerations

1. **File Processing**
   - Async file handling
   - Streaming for large files
   - Temporary file cleanup

2. **API Optimization**
   - Pagination support (default: 50 items/page)
   - Indexed lookups for fast retrieval
   - Query result caching

3. **Database**
   - In-memory store for low latency
   - File persistence for durability
   - Efficient JSON serialization

## Future Enhancements

1. **Database Migration**
   - PostgreSQL for production
   - Connection pooling
   - Prepared statements

2. **Caching Layer**
   - Redis integration
   - Result caching
   - Session management

3. **Real-time Features**
   - WebSocket connections
   - Server-Sent Events (SSE)
   - Live evaluation progress

4. **Advanced Analytics**
   - Time-series analysis
   - Predictive insights
   - Custom report generation

5. **AI Improvements**
   - Model fine-tuning
   - Batch processing
   - Cost optimization

6. **Monitoring & Observability**
   - Prometheus metrics
   - Structured logging
   - Distributed tracing

## Deployment Checklist

- [ ] Set `JWT_SECRET` environment variable
- [ ] Configure AI provider keys (optional)
- [ ] Create `/data` directory with proper permissions
- [ ] Test all authentication flows
- [ ] Verify file upload limits
- [ ] Test evaluation processing
- [ ] Configure CORS appropriately
- [ ] Set up logging and monitoring
- [ ] Perform security audit
- [ ] Load testing before production

## Support & Troubleshooting

### Common Issues

**"Invalid or expired token"**
- Check JWT_SECRET is set
- Verify token hasn't expired
- Ensure Authorization header format: "Bearer {token}"

**"File too large"**
- Maximum file size is 50MB
- Compress image before uploading

**"Unsupported file type"**
- Supported: JPG, PNG, TIFF, PDF
- Use image compression tools if needed

**"No AI provider available"**
- Set OPENAI_API_KEY or GEMINI_API_KEY
- Falls back to demo mode if not configured

## References

- OpenAI API: https://platform.openai.com/docs
- Google Gemini: https://ai.google.dev
- JWT.io: https://jwt.io
- bcryptjs: https://github.com/dcodeIO/bcrypt.js

---

**Last Updated:** July 12, 2024
**Version:** 3.0.0
**Status:** Complete Implementation
