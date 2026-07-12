# EvalAI Pro - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Set Environment Variables
Create a `.env.development.local` file:

```env
# Required
JWT_SECRET=your_secret_key_here_change_me_in_production

# Optional (for AI features - recommended for full functionality)
OPENAI_API_KEY=sk-your_openai_key_here
GEMINI_API_KEY=your_gemini_key_here
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

### 3. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

The app will be available at: http://localhost:3000

## Testing the Backend

### Demo Credentials
Use these to test without needing to register:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher | teacher123 |
| Student | student | student123 |

### Example API Calls

#### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher",
    "password": "teacher123"
  }'
```

Save the `access_token` from the response.

#### 2. Upload Answer Sheet
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@sample_answer_sheet.pdf" \
  -F "studentName=John Doe" \
  -F "subject=Mathematics" \
  -F "examType=Final Exam"
```

Save the `sessionId` from the response.

#### 3. Start Evaluation
```bash
curl -X POST http://localhost:3000/api/evaluate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID"
  }'
```

#### 4. Get Results
```bash
curl http://localhost:3000/api/results/YOUR_EVALUATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Get Dashboard Stats
```bash
curl http://localhost:3000/api/dashboard-stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Using the JavaScript API Client

```javascript
import { apiClient } from '@/lib/api-client'

// Login
await apiClient.login('teacher', 'teacher123')

// Upload file
const file = document.querySelector('input[type=file]').files[0]
const { sessionId } = await apiClient.uploadFile(
  file,
  'John Doe',
  'Mathematics',
  'Final Exam'
)

// Start evaluation
const result = await apiClient.startEvaluation(sessionId)
console.log('Evaluation result:', result)

// Poll for completion
try {
  const completed = await apiClient.pollEvaluation(sessionId)
  console.log('Final result:', completed.evaluation.result)
} catch (err) {
  console.error('Evaluation timeout:', err)
}

// Get statistics
const stats = await apiClient.getDashboardStats()
console.log('User statistics:', stats)

// Get system status
const status = await apiClient.getSystemStatus()
console.log('System status:', status)
```

## Project Structure

```
evalai-pro/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── upload/            # File upload
│   │   ├── evaluate/          # Evaluation processing
│   │   ├── evaluations/       # List evaluations
│   │   ├── results/           # Get results
│   │   ├── dashboard-stats/   # Statistics
│   │   ├── rubrics/           # Rubrics management
│   │   ├── feedback/          # Feedback templates
│   │   └── analytics/         # Advanced analytics
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── lib/
│   ├── auth.ts                # JWT authentication
│   ├── db.ts                  # Database layer
│   ├── evaluation-engine.ts   # AI evaluation
│   ├── api-client.ts          # Frontend API client
│   ├── rubrics.ts             # Rubrics management
│   └── feedback-templates.ts  # Feedback templates
├── components/                # React components
├── public/                    # Static files
├── data/                      # Data persistence
│   ├── evaluations.json
│   └── rubrics.json
├── uploads/                   # Uploaded files
└── docs/                      # Documentation
```

## Key Features

### Authentication
- JWT-based token auth
- User registration
- Role-based access (admin, teacher, student)
- Automatic token management

### File Upload & Processing
- Supports: JPG, PNG, TIFF, PDF
- Max file size: 50MB
- Async processing
- Session tracking

### AI Evaluation
- OpenAI GPT-4o (primary)
- Google Gemini Flash (fallback)
- Demo mode (no API keys)
- Confidence scoring

### Data Management
- User evaluation history
- Subject filtering
- Grade distribution
- Performance trends

### Rubrics & Feedback
- Predefined rubrics (Math, Science, English)
- Custom rubric creation
- Feedback templates
- Automatic feedback generation

## Common Tasks

### Create a Custom Rubric
```javascript
const rubric = await fetch('/api/rubrics', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Custom Math Rubric',
    subject: 'Mathematics',
    description: 'For advanced calculus',
    totalMarks: 100,
    criteria: [
      {
        id: 'calc-1',
        name: 'Calculus Concepts',
        description: 'Understanding of derivatives and integrals',
        maxMarks: 50,
        weightage: 50,
        levels: [
          { level: 1, description: 'No understanding', marks: 0 },
          { level: 2, description: 'Partial', marks: 15 },
          { level: 3, description: 'Good', marks: 35 },
          { level: 4, description: 'Excellent', marks: 50 }
        ]
      }
    ]
  })
})
```

### Get Feedback Templates
```javascript
const templates = await fetch('/api/feedback?category=strengths', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json())

console.log('Available strength feedback templates:', templates.templates)
```

### Generate Personalized Feedback
```javascript
const feedback = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    mode: 'generate',
    strengths: [
      'Clear mathematical reasoning',
      'Correct use of formulas'
    ],
    improvements: [
      'Show more working steps',
      'Check arithmetic carefully'
    ],
    overallComment: 'Good effort, keep practicing'
  })
}).then(r => r.json())

console.log(feedback.feedback)
```

## Troubleshooting

### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Port already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### Token errors
- Check JWT_SECRET is set
- Verify token format: `Bearer {token}`
- Ensure token hasn't expired (7 days)

### File upload fails
- Check file size (max 50MB)
- Verify file format (JPG, PNG, TIFF, PDF)
- Ensure write permissions on `/uploads`

### No AI evaluation
- Check OPENAI_API_KEY or GEMINI_API_KEY
- App works in demo mode without API keys
- See console for specific errors

## Next Steps

1. **Explore the API** - Test all endpoints with cURL or Postman
2. **Create evaluations** - Upload test documents and run evaluations
3. **Review analytics** - Check dashboard statistics
4. **Customize rubrics** - Create rubrics for your subjects
5. **Add to frontend** - Integrate with your React components

## Documentation

- **Full API Docs**: See `/docs/API.md`
- **Backend Implementation**: See `/docs/BACKEND_IMPLEMENTATION.md`
- **Database Schema**: Check `lib/db.ts` for models
- **Evaluation Engine**: See `lib/evaluation-engine.ts` for processing

## Performance Tips

1. **Use pagination** - Limit results with `limit` and `offset`
2. **Filter efficiently** - Use `subject` and `status` filters
3. **Batch uploads** - Process multiple files asynchronously
4. **Cache results** - Use browser cache for frequently accessed data

## Security Best Practices

1. **Change JWT_SECRET** in production
2. **Keep API keys secret** - Never commit to git
3. **Use HTTPS** in production
4. **Validate input** - Frontend + backend validation
5. **Implement rate limiting** - Prevent abuse
6. **Use CORS carefully** - Restrict to trusted origins

## Getting Help

- **API Issues**: Check `/docs/API.md` for endpoint details
- **Authentication**: Verify credentials and tokens
- **File Processing**: Check file format and size limits
- **AI Results**: Ensure API keys are configured
- **Data Persistence**: Check `/data` directory exists and writable

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Check types
npx tsc --noEmit

# Format code
npx prettier --write .
```

---

**Happy building!** 🚀

For more detailed information, see the full documentation in `/docs`.
