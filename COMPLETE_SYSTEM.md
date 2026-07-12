# Complete Answer Sheet Evaluator System

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  - Upload Page | Dashboard | Results | Student Feedback    │
└────────────────────┬────────────────────────────────────────┘
                     │ API Calls
┌─────────────────────▼────────────────────────────────────────┐
│              Next.js API Routes (TypeScript)                │
│  - /auth/login, /auth/register, /auth/me                   │
│  - /upload - File upload with metadata                      │
│  - /evaluate - Triggers Python backend                      │
│  - /evaluations - List user evaluations                     │
│  - /results/{id} - Get evaluation results                   │
│  - /dashboard-stats - User statistics                       │
│  - /status - System health check                            │
│  - /analytics - Advanced analytics                          │
└────────────────────┬────────────────────────────────────────┘
                     │ Triggers Python process
┌─────────────────────▼────────────────────────────────────────┐
│           Python Backend (Async Processing)                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ evaluation_runner.py - Entry Point                      │ │
│  │  - Accepts CLI arguments                               │ │
│  │  - Coordinates evaluation pipeline                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │ database.py - JSON-based Persistence                   │ │
│  │  - Users (id, credentials, metadata)                   │ │
│  │  - Evaluations (records & status)                      │ │
│  │  - Results (evaluation outputs)                        │ │
│  │  - Rubrics (evaluation criteria)                       │ │
│  │  - Submissions (file tracking)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │ ocr_engine.py - Image & Document Processing            │ │
│  │  - OCR: OpenAI GPT-4 Vision / Gemini / Anthropic       │ │
│  │  - Extract text from images, PDFs                      │ │
│  │  - Support for JPG, PNG, TIFF, PDF                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │ evaluation_service.py - AI Evaluation Pipeline         │ │
│  │  - Process extracted text                              │ │
│  │  - Generate scores & grades                            │ │
│  │  - Provide detailed feedback                           │ │
│  │  - Calculate topic mastery                             │ │
│  │  - Generate recommendations                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │ report_generator.py - Output Formatting                │ │
│  │  - Text reports                                        │ │
│  │  - JSON structured output                              │ │
│  │  - PDF generation (optional)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────▼─────────────────────────────────┐
│        Data Storage (File-based & External Options)          │
│  - backend/data/ (JSON files for development)                │
│  - PostgreSQL (production)                                   │
│  - MongoDB (optional NoSQL)                                  │
│  - Redis (caching)                                           │
└─────────────────────────────────────────────────────────────┘
```

## Complete Workflow

### 1. **User Registration & Authentication**
```typescript
POST /api/auth/register
{
  "username": "teacher_name",
  "email": "teacher@example.com",
  "password": "secure_password",
  "role": "teacher",
  "name": "John Doe",
  "institution": "School Name"
}

Response: { access_token, user, message }
```

### 2. **File Upload**
```typescript
POST /api/upload (with multipart form)
{
  "file": <image/pdf>,
  "studentName": "Student Name",
  "subject": "Mathematics",
  "examType": "Mid-term Exam",
  "rubric": "{...criteria}"
}

Response: { sessionId, evaluationId, status: "uploaded" }
```

### 3. **Start Evaluation (Async)**
```typescript
POST /api/evaluate
{
  "sessionId": "uuid-from-upload"
}

Response: {
  success: true,
  status: "processing",
  message: "Evaluation started. Check /api/results/{sessionId}"
}

// Behind the scenes:
// - Next.js spawns: python backend/evaluation_runner.py --eval-id UUID --image-path ...
// - Python process runs independently
// - Results are saved to database
```

### 4. **Python Backend Processing**
```bash
# Command executed by Next.js
python3 backend/evaluation_runner.py \
  --eval-id "eval-123" \
  --image-path "/uploads/session-uuid/answer_sheet.jpg" \
  --subject "Mathematics" \
  --session-id "session-uuid" \
  --rubric "{...criteria}"

# Process flow:
# 1. Load evaluation record from database
# 2. Extract text using OCR (OpenAI/Gemini/Anthropic)
# 3. Send to AI for evaluation
# 4. Calculate scores, grades, feedback
# 5. Generate detailed report
# 6. Save results to database
# 7. Update evaluation status to "completed"
```

### 5. **Get Results**
```typescript
GET /api/results/{sessionId}
Headers: { Authorization: "Bearer token" }

Response: {
  success: true,
  sessionId: "...",
  evaluation: {
    status: "completed",
    obtainedMarks: 78,
    totalMarks: 100,
    percentage: 78,
    grade: "B+",
    confidenceScore: 85,
    overallFeedback: "...",
    strengths: [...],
    improvements: [...],
    questions: [...],
    recommendations: [...],
    topic_mastery: {...},
    next_steps: [...]
  }
}
```

### 6. **Get Evaluations List**
```typescript
GET /api/evaluations?subject=Math&status=completed&limit=50&offset=0
Headers: { Authorization: "Bearer token" }

Response: {
  success: true,
  evaluations: [...],
  total: 150,
  hasMore: true
}
```

### 7. **Dashboard Statistics**
```typescript
GET /api/dashboard-stats
Headers: { Authorization: "Bearer token" }

Response: {
  success: true,
  user: { id, username, role },
  statistics: {
    total_evaluations: 25,
    completed: 20,
    average_score: 76.5,
    subjects: ["Math", "Science"],
    last_evaluation: "2024-01-15T10:30:00Z"
  },
  system: { cpu, memory, uptime, ... }
}
```

## Database Structure

### Users Collection
```json
{
  "id": "user-uuid",
  "username": "teacher_john",
  "email": "john@school.com",
  "password_hash": "bcrypted_hash",
  "role": "teacher",
  "name": "John Doe",
  "institution": "Central School",
  "created_at": "2024-01-01T00:00:00Z",
  "stats": {
    "evaluations_count": 45,
    "total_marks_awarded": 3600,
    "average_score": 78.5,
    "last_evaluation": "2024-01-15T10:30:00Z"
  }
}
```

### Evaluations Collection
```json
{
  "id": "eval-uuid",
  "user_id": "user-uuid",
  "session_id": "session-uuid",
  "student_name": "Alice Johnson",
  "subject": "Mathematics",
  "exam_type": "Mid-term",
  "file_name": "math_exam_jan.pdf",
  "file_size": 2048000,
  "status": "completed",
  "created_at": "2024-01-15T10:00:00Z",
  "started_at": "2024-01-15T10:05:00Z",
  "completed_at": "2024-01-15T10:35:00Z",
  "processing_time": 30.5,
  "confidence_score": 85,
  "extracted_text": "... full extracted text ...",
  "error": null
}
```

### Results Collection
```json
{
  "eval_id": "eval-uuid",
  "session_id": "session-uuid",
  "subject": "Mathematics",
  "obtainedMarks": 78,
  "totalMarks": 100,
  "percentage": 78,
  "grade": "B+",
  "confidenceScore": 85,
  "overallFeedback": "Good understanding with room for improvement",
  "strengths": ["Clear approach", "Accurate calculations"],
  "improvements": ["Add more steps", "Verify answers"],
  "questions": [
    {
      "id": 1,
      "topic": "Algebra",
      "obtainedMarks": 25,
      "maxMarks": 30,
      "feedback": "Good but check formula",
      "keyPoints": ["Method correct"],
      "missingPoints": ["Verification"]
    }
  ],
  "recommendations": [
    "Practice algebraic problems",
    "Review formula applications"
  ],
  "topic_mastery": {
    "Algebra": { "percentage": 83, "level": "Proficient" },
    "Geometry": { "percentage": 72, "level": "Developing" }
  },
  "next_steps": ["Review weak topics", "Practice more"],
  "ai_provider": "openai",
  "processing_time_seconds": 30.5,
  "timestamp": "2024-01-15T10:35:00Z"
}
```

## Installation & Setup

### Prerequisites
```bash
Node.js 18+
Python 3.9+
pip
npm or yarn
```

### Backend Setup
```bash
# Install Python dependencies
cd /vercel/share/v0-project
pip install -r backend/requirements.txt

# Set environment variables
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="..."
export ANTHROPIC_API_KEY="..."
export JWT_SECRET="your-secret-key"
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Running Complete System
```bash
# Terminal 1: Start Next.js frontend
npm run dev

# Terminal 2: (Python backend runs on-demand via spawn)
# No need to start separately - triggered by /api/evaluate

# Test the flow:
# 1. Go to http://localhost:3000/upload
# 2. Register/Login
# 3. Upload answer sheet
# 4. Check results
```

## Key Features Implemented

### Authentication
- ✅ JWT token-based auth
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Token refresh

### File Management
- ✅ Secure file upload (JPG, PNG, TIFF, PDF)
- ✅ File size validation (max 50MB)
- ✅ Session-based organization
- ✅ Metadata tracking

### OCR & Document Processing
- ✅ Multi-provider OCR (OpenAI, Gemini, Anthropic)
- ✅ Image extraction with fallback
- ✅ PDF support
- ✅ Demo mode for testing

### AI Evaluation
- ✅ Intelligent answer analysis
- ✅ Criterion-based grading
- ✅ Confidence scoring
- ✅ Topic-wise breakdown

### Feedback Generation
- ✅ Personalized recommendations
- ✅ Strength/weakness analysis
- ✅ Topic mastery tracking
- ✅ Next learning steps

### Analytics & Reporting
- ✅ User statistics
- ✅ Evaluation history
- ✅ Performance trends
- ✅ Class/batch analytics

### Persistence
- ✅ JSON file storage (development)
- ✅ PostgreSQL ready (production)
- ✅ Data export capabilities
- ✅ Audit trails

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/register | ❌ | Register new user |
| POST | /auth/login | ❌ | User login |
| GET | /auth/me | ✅ | Get current user |
| POST | /upload | ✅ | Upload answer sheet |
| POST | /evaluate | ✅ | Start evaluation |
| GET | /evaluations | ✅ | List evaluations |
| GET | /results/{id} | ✅ | Get evaluation result |
| DELETE | /evaluations | ✅ | Delete evaluation |
| GET | /dashboard-stats | ✅ | User statistics |
| GET | /status | ❌ | System health |
| GET | /analytics | ✅ | Advanced analytics |
| GET | /rubrics | ✅ | List rubrics |
| POST | /rubrics | ✅ | Create rubric |
| GET | /feedback | ✅ | Feedback templates |
| POST | /feedback | ✅ | Generate feedback |

## Demo Credentials

```
Role: Admin
Username: admin
Password: admin123

Role: Teacher
Username: teacher
Password: teacher123

Role: Student
Username: student
Password: student123
```

## Configuration

### Environment Variables
```env
# JWT
JWT_SECRET=your-secret-key-here-min-32-chars

# AI Providers (choose at least one)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...

# Optional Database
DATABASE_URL=postgresql://user:pass@localhost/dbname
MONGODB_URI=mongodb://localhost:27017/evaluator

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB
```

## Performance Considerations

- **Async Processing**: Evaluations run in background Python process
- **Caching**: Results cached with 1-hour TTL
- **Database Indexing**: Evaluations indexed by user_id and created_at
- **Pagination**: All list endpoints support limit/offset
- **Rate Limiting**: Ready to implement via middleware

## Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ File upload restrictions
- ✅ Role-based access control
- ✅ Secure file storage

## Error Handling

- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Validation errors (400)
- Processing errors (500)
- Detailed error messages in response

## Testing

```bash
# Run tests
npm run test

# Run Python tests
pytest backend/

# Test evaluation endpoint
curl -X POST http://localhost:3000/api/evaluate \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "uuid"}'
```

## Deployment

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN pip install -r backend/requirements.txt
EXPOSE 3000
CMD npm start
```

### Production Checklist
- [ ] Set secure JWT_SECRET
- [ ] Configure API keys for all providers
- [ ] Set up PostgreSQL
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring
- [ ] Enable rate limiting
- [ ] Set up backups
- [ ] Configure logging
- [ ] Enable error tracking (Sentry)

## Troubleshooting

**OCR not working:**
- Check API keys are set
- Verify network connectivity
- Check image quality/format
- Review provider rate limits

**Evaluation stuck in processing:**
- Check Python process logs
- Verify file exists at upload path
- Check AI provider connectivity
- Review memory/CPU usage

**Results not showing:**
- Verify authentication token
- Check database connection
- Review evaluation status
- Check browser console for errors

## Next Steps

1. Configure production database
2. Set up API monitoring
3. Implement caching layer
4. Add batch evaluation support
5. Create mobile app
6. Add more rubric templates
7. Implement teacher collaboration
8. Add student progress tracking
9. Create parent portal
10. Add advanced analytics dashboard
