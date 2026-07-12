# EvalAI Pro API Documentation

## Overview

The EvalAI Pro backend provides a RESTful API for answer sheet evaluation with AI-powered analysis. All endpoints require JWT authentication (except login/register).

**Base URL:** `/api`
**API Version:** 3.0.0

## Authentication

### Login
Create a session and receive an access token.

```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "access_token": "jwt_token_here",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "admin|teacher|student",
    "name": "string",
    "institution": "string"
  }
}
```

### Register
Create a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string@example.com",
  "password": "string",
  "role": "admin|teacher|student",
  "name": "string",
  "institution": "string"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "access_token": "jwt_token_here",
  "user": {...},
  "message": "User registered successfully"
}
```

### Get Current User
Retrieve the authenticated user's profile.

```http
GET /auth/me
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "admin|teacher|student",
    "name": "string",
    "institution": "string"
  }
}
```

## File Upload

### Upload Answer Sheet
Upload an answer sheet image or PDF for evaluation.

```http
POST /upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [binary file]
studentName: string
subject: string
examType: string
rubric: string (optional)
```

**Supported Formats:** JPG, PNG, TIFF, PDF (max 50MB)

**Response:** `201 Created`
```json
{
  "success": true,
  "sessionId": "uuid",
  "evaluationId": "eval-xxx",
  "message": "File uploaded successfully"
}
```

## Evaluation

### Start Evaluation
Begin processing an uploaded answer sheet using AI.

```http
POST /evaluate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "sessionId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "sessionId": "uuid",
  "result": {
    "obtainedMarks": 75,
    "totalMarks": 100,
    "percentage": 75,
    "grade": "B+",
    "confidenceScore": 88.5,
    "overallFeedback": "Good understanding demonstrated...",
    "strengths": ["Clear answers", "Good logic", "..."],
    "improvements": ["More detail needed", "..."],
    "questions": [
      {
        "id": 1,
        "topic": "Core Concepts",
        "studentAnswer": "...",
        "obtainedMarks": 23,
        "maxMarks": 30,
        "feedback": "...",
        "keyPointsCovered": ["..."],
        "keyPointsMissed": ["..."]
      }
    ],
    "aiProvider": "openai|gemini|demo",
    "evaluationDate": "2024-07-12T10:30:00Z",
    "processingTime": 3.5
  }
}
```

### Get Evaluations
Retrieve all evaluations for the authenticated user.

```http
GET /evaluations?subject=Mathematics&status=completed&limit=50&offset=0
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `subject` (optional): Filter by subject
- `status` (optional): pending, processing, completed, failed
- `limit` (optional, default: 50): Results per page
- `offset` (optional, default: 0): Pagination offset

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 15,
  "evaluations": [
    {
      "id": "eval-xxx",
      "userId": "user-xxx",
      "sessionId": "uuid",
      "studentName": "John Doe",
      "subject": "Mathematics",
      "examType": "Final Exam",
      "fileName": "sheet.pdf",
      "fileSize": 2048000,
      "uploadedAt": "2024-07-12T10:00:00Z",
      "status": "completed",
      "result": {...},
      "extractedText": "...",
      "metadata": {}
    }
  ],
  "total": 50,
  "hasMore": true
}
```

### Get Evaluation Result
Retrieve detailed results for a specific evaluation.

```http
GET /results/{evaluationId}
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "sessionId": "uuid",
  "evaluation": {...},
  "fileData": {...}
}
```

### Delete Evaluation
Remove an evaluation and its results.

```http
DELETE /evaluations?id={evaluationId}
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Evaluation deleted successfully"
}
```

## Dashboard & Analytics

### Get Dashboard Statistics
Retrieve statistics for the authenticated user's evaluations.

```http
GET /dashboard-stats
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "role": "admin|teacher|student"
  },
  "statistics": {
    "total": 25,
    "completed": 20,
    "pending": 3,
    "failed": 2,
    "averageMarks": 78.5,
    "averageConfidence": 88.2,
    "gradeDistribution": {
      "A+": 5,
      "A": 8,
      "B+": 5,
      "B": 2
    },
    "totalBytesProcessed": 104857600
  },
  "system": {
    "cpu": 45,
    "memory": 62,
    "uptime": "12h 30m",
    "platform": "linux",
    "cpuCount": 4
  },
  "aiProviders": {
    "openai": true,
    "gemini": false,
    "anthropic": false,
    "active": "OpenAI GPT-4o"
  },
  "timestamp": "2024-07-12T10:30:00Z"
}
```

### Get System Status
Retrieve overall system health and operational status.

```http
GET /status
```

**Response:** `200 OK`
```json
{
  "success": true,
  "status": "operational",
  "version": "3.0.0",
  "uptime": "12h 30m",
  "aiProviders": {
    "openai": true,
    "gemini": false,
    "anthropic": false,
    "active": "OpenAI"
  },
  "sessions": {
    "total": 100,
    "completed": 85,
    "processing": 5,
    "failed": 3,
    "pending": 7
  },
  "evaluations": {
    "total": 100,
    "completed": 85,
    "pending": 10,
    "failed": 5,
    "averageMarks": 78.5,
    "averageConfidence": 88.2,
    "gradeDistribution": {...},
    "totalBytesProcessed": 5368709120
  },
  "system": {
    "platform": "linux",
    "nodeVersion": "v18.x.x",
    "memory": {
      "totalMB": 16384,
      "usedMB": 10158,
      "freeMB": 6226,
      "usedPercent": 62
    },
    "cpus": 4
  },
  "timestamp": "2024-07-12T10:30:00Z"
}
```

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error description",
  "status": 400
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (access denied) |
| 404 | Not Found |
| 409 | Conflict (duplicate user) |
| 500 | Internal Server Error |

## Rate Limiting

- No rate limiting implemented yet (planned for production)
- Recommended: 100 requests per minute per user

## Environment Variables

### Required
- `JWT_SECRET`: Secret key for JWT signing

### Optional (for AI Features)
- `OPENAI_API_KEY`: OpenAI API key for GPT-4 evaluation
- `GEMINI_API_KEY`: Google Gemini API key
- `ANTHROPIC_API_KEY`: Anthropic Claude API key (planned)

## Demo Credentials

For testing purposes:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher | teacher123 |
| Student | student | student123 |

## Usage Examples

### Python
```python
import requests

BASE_URL = "http://localhost:3000/api"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "username": "teacher",
    "password": "teacher123"
})
token = response.json()["access_token"]

# Upload file
files = {"file": open("answer_sheet.pdf", "rb")}
data = {
    "studentName": "John Doe",
    "subject": "Mathematics",
    "examType": "Final Exam"
}
response = requests.post(
    f"{BASE_URL}/upload",
    files=files,
    data=data,
    headers={"Authorization": f"Bearer {token}"}
)
session_id = response.json()["sessionId"]

# Start evaluation
response = requests.post(
    f"{BASE_URL}/evaluate",
    json={"sessionId": session_id},
    headers={"Authorization": f"Bearer {token}"}
)
result = response.json()["result"]
print(f"Grade: {result['grade']}, Marks: {result['obtainedMarks']}/100")
```

### JavaScript
```javascript
import { apiClient } from "@/lib/api-client"

// Login
await apiClient.login("teacher", "teacher123")

// Upload and evaluate
const file = document.querySelector("input[type=file]").files[0]
const { sessionId } = await apiClient.uploadFile(
  file,
  "John Doe",
  "Mathematics",
  "Final Exam"
)

// Poll for completion
const result = await apiClient.pollEvaluation(sessionId)
console.log(`Grade: ${result.evaluation.result.grade}`)
```

## Changelog

### v3.0.0 (Current)
- Complete backend implementation
- JWT authentication
- AI-powered evaluation with multiple providers
- File upload and processing
- Statistics and analytics
- System monitoring

### v2.0.0
- Initial API design
- Frontend integration

### v1.0.0
- Project initialization
