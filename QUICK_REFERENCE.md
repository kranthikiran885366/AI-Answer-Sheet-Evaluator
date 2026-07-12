# Quick Reference Guide - Answer Sheet Evaluator

## 🚀 Getting Started (5 Minutes)

### 1. Prerequisites
```bash
Node.js 18+
Python 3.9+
pip
npm or yarn
```

### 2. Install & Run
```bash
# Install dependencies
npm install
pip install -r backend/requirements.txt

# Set API key (at least one)
export OPENAI_API_KEY="sk-..." # or GEMINI_API_KEY, ANTHROPIC_API_KEY

# Run development server
npm run dev

# Visit http://localhost:3000
```

### 3. Test with Demo Credentials
```
Username: teacher
Password: teacher123
```

---

## 📝 Quick API Calls

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myteacher",
    "email": "teacher@school.com",
    "password": "pass123",
    "role": "teacher",
    "name": "My Name",
    "institution": "School"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}'

# Response includes: access_token, user
# Save access_token for subsequent requests
```

### Upload
```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@answer_sheet.jpg" \
  -F "studentName=John Doe" \
  -F "subject=Mathematics" \
  -F "examType=Mid-term"

# Response includes: sessionId, evaluationId
```

### Evaluate (Triggers Python)
```bash
TOKEN="your_access_token_here"
SESSION_ID="from_upload_response"

curl -X POST http://localhost:3000/api/evaluate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\"}"

# Response: status = "processing"
```

### Check Results (Poll every 5 seconds)
```bash
TOKEN="your_access_token_here"
SESSION_ID="from_upload_response"

curl http://localhost:3000/api/results/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN"

# When done: status = "completed", includes full evaluation
```

### Get All Evaluations
```bash
TOKEN="your_access_token_here"

curl "http://localhost:3000/api/evaluations?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Dashboard Stats
```bash
TOKEN="your_access_token_here"

curl http://localhost:3000/api/dashboard-stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📂 File Structure (Key Files Only)

```
/vercel/share/v0-project/
│
├── Backend Python (Core Engine)
│   ├── backend/database.py           ← Data storage
│   ├── backend/ocr_engine.py         ← Image processing
│   ├── backend/evaluation_service.py ← Main logic
│   ├── backend/evaluation_runner.py  ← CLI entry point
│   └── backend/requirements.txt      ← Python deps
│
├── Next.js API Routes (15 endpoints)
│   ├── app/api/auth/               ← Authentication
│   ├── app/api/upload/             ← File upload
│   ├── app/api/evaluate/           ← Trigger Python
│   ├── app/api/results/            ← Get results
│   ├── app/api/evaluations/        ← List/delete
│   ├── app/api/dashboard-stats/    ← Statistics
│   ├── app/api/status/             ← Health check
│   ├── app/api/analytics/          ← Analytics
│   ├── app/api/rubrics/            ← Rubrics
│   └── app/api/feedback/           ← Feedback
│
├── Library (TypeScript Utilities)
│   ├── lib/auth.ts           ← JWT handling
│   ├── lib/db.ts             ← Database layer
│   ├── lib/api-client.ts     ← API utilities
│   ├── lib/evaluation-engine.ts
│   ├── lib/rubrics.ts
│   └── lib/feedback-templates.ts
│
└── Documentation
    ├── COMPLETE_SYSTEM.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── FILES_MANIFEST.md
    └── QUICK_REFERENCE.md ← You are here
```

---

## 🔑 Environment Variables

```bash
# Required for production
JWT_SECRET="your-secret-key-here-min-32-chars"

# AI Providers (need at least one)
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
ANTHROPIC_API_KEY="..."

# Optional
DATABASE_URL="postgresql://user:pass@localhost/db"
MONGODB_URI="mongodb://localhost:27017/evaluator"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="52428800"  # 50MB
```

---

## 🧪 Test Workflow

### Step 1: Create Account or Login
```bash
# Option A: Use demo account
Username: teacher
Password: teacher123

# Option B: Register new account
POST /api/auth/register
```

### Step 2: Get Token
```bash
POST /api/auth/login
→ Save the access_token
```

### Step 3: Upload Answer Sheet
```bash
POST /api/upload
↑ With auth token
← Returns sessionId
```

### Step 4: Start Evaluation
```bash
POST /api/evaluate
↑ With sessionId
← Returns status: "processing"
```

### Step 5: Poll for Results
```bash
GET /api/results/{sessionId}
↑ Every 5 seconds
← When status = "completed", results ready
```

### Step 6: View in Dashboard
```
http://localhost:3000/dashboard
↑ All evaluations listed
← Click any to see details
```

---

## 🗄️ Database Collections (JSON)

### users.json
```json
{
  "user-id": {
    "id": "user-uuid",
    "username": "teacher",
    "email": "teacher@school.com",
    "password_hash": "bcrypted",
    "role": "teacher",
    ...
  }
}
```

### evaluations.json
```json
{
  "eval-id": {
    "id": "eval-uuid",
    "user_id": "user-uuid",
    "status": "completed|processing|failed|uploaded",
    "student_name": "John Doe",
    "subject": "Mathematics",
    ...
  }
}
```

### results.json
```json
{
  "eval-id": {
    "obtainedMarks": 78,
    "grade": "B+",
    "overallFeedback": "...",
    "strengths": [...],
    "improvements": [...],
    ...
  }
}
```

---

## 🔐 Authentication Flow

```
1. User registers/logs in
   ↓
2. Receives JWT token (expires in 24 hours)
   ↓
3. Includes token in Authorization header
   ↓
4. API validates token
   ↓
5. Processes request with user_id from token
```

---

## 📊 Evaluation Flow

```
1. Upload file (JPG/PNG/TIFF/PDF)
   ↓
2. Next.js creates session, saves file
   ↓
3. POST /evaluate triggers Python subprocess
   ↓
4. Python: Extract text (OCR) → Evaluate → Save results
   ↓
5. Frontend polls /api/results
   ↓
6. When done, display evaluation with:
   - Marks & grade
   - Feedback per question
   - Strengths & improvements
   - Recommendations
   - Topic mastery
```

---

## 🎯 15 API Endpoints at a Glance

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | POST | /auth/register | ❌ | Register |
| 2 | POST | /auth/login | ❌ | Login |
| 3 | GET | /auth/me | ✅ | Current user |
| 4 | POST | /upload | ✅ | Upload file |
| 5 | POST | /evaluate | ✅ | Start eval |
| 6 | GET | /results/{id} | ✅ | Get results |
| 7 | GET | /evaluations | ✅ | List evals |
| 8 | DELETE | /evaluations | ✅ | Delete eval |
| 9 | GET | /dashboard-stats | ✅ | Stats |
| 10 | GET | /status | ❌ | Health |
| 11 | GET | /analytics | ✅ | Analytics |
| 12 | GET | /rubrics | ✅ | List rubrics |
| 13 | POST | /rubrics | ✅ | Create rubric |
| 14 | GET | /feedback | ✅ | Feedback |
| 15 | POST | /feedback | ✅ | Gen feedback |

---

## 🐍 Python Backend Structure

```
evaluation_runner.py (CLI entry point)
    ↓
evaluation_service.process_evaluation()
    ├─ OCR: ocr_engine.extract_text_from_image()
    │  ├─ Try OpenAI GPT-4
    │  ├─ Try Gemini
    │  ├─ Try Anthropic
    │  └─ Fallback to demo
    │
    ├─ AI: eval_processor.evaluate_answer_sheet()
    │  └─ Return marks, grade, feedback
    │
    └─ Save: database.save_result()
       └─ Store in results.json
```

---

## 🐛 Troubleshooting Quick Fixes

### "OCR not working"
```bash
# Check environment variables
echo $OPENAI_API_KEY
# Or set it
export OPENAI_API_KEY="sk-..."
```

### "Evaluation stuck in processing"
```bash
# Check if Python process is running
ps aux | grep python

# Check logs
tail -f backend/data/evaluation.log (if exists)

# Verify file exists
ls uploads/{sessionId}/answer_sheet.*
```

### "Can't login"
```bash
# Verify database
ls backend/data/users.json

# Try demo account
Username: teacher
Password: teacher123
```

### "Results not showing"
```bash
# Check status endpoint
curl http://localhost:3000/api/status

# Poll results again
curl http://localhost:3000/api/results/{sessionId}

# Check browser console for errors
# Open DevTools (F12) → Console tab
```

---

## 🚀 Production Deployment

### Environment Setup
```bash
# 1. Set secure keys
export JWT_SECRET="$(openssl rand -base64 32)"
export OPENAI_API_KEY="sk-..."

# 2. Build
npm run build

# 3. Install Python deps
pip install -r backend/requirements.txt

# 4. Start server
npm start

# Or with PM2
pm2 start npm --name "evalai" -- start
```

### Docker
```bash
docker build -t evalai .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY="sk-..." \
  -e JWT_SECRET="secret" \
  evalai
```

### Vercel Deploy
```bash
# Connect repo
vercel link

# Deploy
vercel deploy --prod

# Set env vars in Vercel dashboard
```

---

## 📊 Example API Response

### GET /results/{id} (Success)
```json
{
  "success": true,
  "evaluation": {
    "status": "completed",
    "obtainedMarks": 78,
    "totalMarks": 100,
    "percentage": 78,
    "grade": "B+",
    "confidenceScore": 85,
    "overallFeedback": "Good understanding...",
    "strengths": ["Clear approach", "Accurate math"],
    "improvements": ["Add more steps"],
    "questions": [
      {
        "id": 1,
        "topic": "Algebra",
        "obtainedMarks": 25,
        "maxMarks": 30,
        "feedback": "Good but check..."
      }
    ],
    "recommendations": ["Practice algebra..."],
    "topic_mastery": {
      "Algebra": {"percentage": 83, "level": "Proficient"}
    },
    "next_steps": ["Review weak areas"]
  }
}
```

---

## 💡 Pro Tips

1. **Use Bearer tokens**: `Authorization: Bearer {token}`
2. **Poll every 5 seconds**: For evaluation results
3. **Save sessionId**: You'll need it for results
4. **Test with demo**: Account credentials are built in
5. **Check status endpoint**: To diagnose system issues
6. **Monitor Python logs**: For OCR/AI errors
7. **Use Postman**: Easier for testing APIs
8. **Enable CORS**: For frontend requests

---

## 🔗 Related Files

- Full Architecture: `COMPLETE_SYSTEM.md`
- Complete Summary: `IMPLEMENTATION_SUMMARY.md`
- File Manifest: `FILES_MANIFEST.md`
- This Guide: `QUICK_REFERENCE.md`

---

## 🎓 Demo Test Case

```bash
# 1. Login as teacher
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher","password":"teacher123"}'

TOKEN="[token_from_response]"

# 2. Upload sample image
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample_answer.jpg" \
  -F "studentName=Test Student" \
  -F "subject=Mathematics"

SESSION_ID="[sessionId_from_response]"

# 3. Start evaluation
curl -X POST http://localhost:3000/api/evaluate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\"}"

# 4. Poll results (wait 30-60 seconds)
for i in {1..15}; do
  curl http://localhost:3000/api/results/$SESSION_ID \
    -H "Authorization: Bearer $TOKEN"
  sleep 5
done

# 5. View in dashboard
# Visit http://localhost:3000/dashboard
```

---

**Status: ✅ Ready to Use**

Start with demo credentials and test the flow above in 5 minutes.
