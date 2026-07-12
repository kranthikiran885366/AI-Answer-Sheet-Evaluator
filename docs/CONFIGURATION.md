# EvalAI Pro - Backend Configuration Guide

## Environment Variables

### Development Setup

Create `.env.development.local` in the project root:

```env
# ===== REQUIRED =====
# JWT secret for token signing
JWT_SECRET=your-secret-key-here-change-in-production

# ===== OPTIONAL - AI PROVIDERS =====
# OpenAI GPT-4o for evaluation
OPENAI_API_KEY=sk-your-key-here

# Google Gemini for evaluation
GEMINI_API_KEY=your-gemini-key-here

# ===== OPTIONAL - MONITORING =====
# Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# ===== OPTIONAL - ANALYTICS =====
# Google Analytics
NEXT_PUBLIC_GA_ID=your-ga-id
```

### Production Setup

For production deployment (e.g., Vercel):

1. Go to Project Settings → Environment Variables
2. Add the same variables as development
3. Set production-specific values
4. Redeploy to apply changes

## AI Provider Configuration

### Option 1: OpenAI GPT-4o (Recommended)

**Setup:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to environment: `OPENAI_API_KEY=sk-...`
3. Restart development server

**Pricing:**
- Variable cost based on usage
- Tokens for input/output
- Estimated: $0.02-0.05 per evaluation

**Features:**
- Fastest evaluation
- Best accuracy
- Vision capabilities for images

### Option 2: Google Gemini Flash

**Setup:**
1. Get API key from https://ai.google.dev
2. Add to environment: `GEMINI_API_KEY=...`
3. Restart development server

**Pricing:**
- Free tier available
- Estimated: $0.01-0.03 per evaluation

**Features:**
- Fast processing
- Good accuracy
- Native vision support

### Option 3: Demo Mode (No API Keys)

**Setup:**
- Leave AI provider keys unset
- App automatically uses demo mode
- Generates realistic evaluation results

**Features:**
- No costs
- Instant evaluation
- Good for testing and development

## JWT Configuration

### Generating a Secure Secret

```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([Random]::new().GetBytes(24))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Token Expiry

Default: 7 days

To change, edit `/lib/auth.ts`:
```typescript
const JWT_EXPIRY = "7d"  // Change this value
// Supported formats: "1h", "7d", "30d", etc.
```

## Database Configuration

### Current Setup (Development)

- **Type**: In-memory with file persistence
- **Location**: `/data/` directory
- **Files**:
  - `evaluations.json`: Evaluation records
  - `rubrics.json`: Custom rubrics
  - `users.json`: (future) User accounts

### File Structure

```
/data/
├── evaluations.json      # Evaluation data
├── rubrics.json         # Custom rubrics
└── .gitkeep            # Ensure directory exists
```

### Production Migration (PostgreSQL)

For production, migrate to PostgreSQL:

```typescript
// Future implementation example
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export async function getEvaluation(id: string) {
  const result = await pool.query(
    'SELECT * FROM evaluations WHERE id = $1',
    [id]
  )
  return result.rows[0]
}
```

Environment variable:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/evalai_db
```

## File Storage Configuration

### Current Setup

- **Location**: `/uploads/` directory
- **Max File Size**: 50MB
- **Supported Formats**: JPG, PNG, TIFF, PDF
- **Organization**: By session ID

### Directory Structure

```
/uploads/
├── {session-id}/
│   ├── answer_sheet.{ext}   # Original file
│   ├── meta.json            # Metadata
│   └── result.json          # Evaluation result
└── .gitkeep
```

### Production: AWS S3 Storage

For production, use S3:

```typescript
// Future implementation example
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

export async function uploadToS3(fileBuffer, key) {
  return s3.upload({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: fileBuffer,
  }).promise()
}
```

Environment variables:
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
```

## CORS Configuration

### Development

Currently allows all origins:
```typescript
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)
```

### Production

Restrict to specific domains:

```typescript
ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://app.yourdomain.com",
    "https://admin.yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
)
```

## Security Configuration

### Rate Limiting (Future)

Implement rate limiting to prevent abuse:

```typescript
// Limit to 100 requests per minute per user
const rateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user.id,
})

app.use('/api/', rateLimit)
```

### HTTPS (Production)

Enforce HTTPS:
```typescript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.get('host')}${req.url}`)
  }
  next()
})
```

### CSRF Protection

Add CSRF tokens to forms:
```typescript
import csrf from 'csurf'

const csrfProtection = csrf({ cookie: true })
app.post('/api/form', csrfProtection, (req, res) => {
  // Handle request
})
```

## Logging Configuration

### Development

Enable verbose logging:
```env
LOG_LEVEL=debug
```

### Production

Use structured logging:
```env
LOG_LEVEL=info
LOG_FORMAT=json
```

### Log File Rotation

Add Winston for log rotation:
```typescript
const winston = require('winston')
require('winston-daily-rotate-file')

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
})
```

## Monitoring & Observability

### Health Check

Monitor endpoint: `/api/status`

```typescript
// Example: Check health every 60 seconds
setInterval(async () => {
  const response = await fetch('http://localhost:3000/api/status')
  const status = await response.json()
  console.log('System status:', status.status)
}, 60000)
```

### Metrics (Prometheus Ready)

Future implementation:
```typescript
import prometheus from 'prom-client'

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
})
```

### Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## Performance Tuning

### API Response Caching

Implement Redis caching (future):
```typescript
const cache = new Redis()

export async function getCachedEvaluations(userId) {
  const cached = await cache.get(`evaluations:${userId}`)
  if (cached) return JSON.parse(cached)
  
  const data = await db.getUserEvaluations(userId)
  await cache.setex(`evaluations:${userId}`, 3600, JSON.stringify(data))
  return data
}
```

### Database Query Optimization

Add indexes:
```sql
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_subject ON evaluations(subject);
```

### Connection Pooling

```typescript
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

## Deployment Configuration

### Vercel Deployment

1. Connect GitHub repository
2. Add environment variables in Project Settings
3. Deploy with: `vercel deploy`

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "JWT_SECRET": "@jwt_secret",
    "OPENAI_API_KEY": "@openai_api_key"
  }
}
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Environment variables via `.env.production`:
```env
JWT_SECRET=your-production-secret
OPENAI_API_KEY=your-production-key
```

### Environment-Specific Configuration

```typescript
// lib/config.ts
export const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    logLevel: 'debug',
    enableMocking: true,
  },
  production: {
    apiUrl: 'https://yourdomain.com',
    logLevel: 'info',
    enableMocking: false,
  },
}

export const getConfig = () => config[process.env.NODE_ENV]
```

## Testing Configuration

### Unit Tests

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverageFrom: ['lib/**/*.ts'],
  coverageThreshold: {
    global: { statements: 80 },
  },
}
```

### E2E Tests

```typescript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Set environment variables
      config.env.API_TOKEN = process.env.TEST_TOKEN
      return config
    },
  },
}
```

## Backup & Recovery

### Database Backup

```bash
# Backup evaluation data
cp data/evaluations.json data/backups/evaluations-$(date +%Y%m%d).json

# Backup rubrics
cp data/rubrics.json data/backups/rubrics-$(date +%Y%m%d).json
```

### Automated Backup (Cron)

```bash
# /etc/cron.daily/evalai-backup
#!/bin/bash
SOURCE="/app/data"
BACKUP="/backups/evalai"
DATE=$(date +%Y%m%d_%H%M%S)

tar -czf "$BACKUP/evalai_$DATE.tar.gz" "$SOURCE"
```

## Troubleshooting

### Configuration Issues

**Q: "JWT_SECRET not set"**
A: Add `JWT_SECRET` to `.env.development.local` or environment variables

**Q: "AI provider not working"**
A: 
- Verify API key is set correctly
- Check API key has necessary permissions
- Review API usage and quotas

**Q: "File upload fails"**
A:
- Ensure `/uploads` directory exists
- Check write permissions
- Verify disk space available

**Q: "Performance issues"**
A:
- Implement caching strategy
- Optimize database queries
- Use CDN for static assets
- Monitor API response times

## Maintenance

### Regular Tasks

1. **Daily**: Monitor error logs
2. **Weekly**: Backup data
3. **Monthly**: Review security logs
4. **Quarterly**: Update dependencies
5. **Annually**: Security audit

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update to latest major versions
npm upgrade
```

## Support

For configuration issues or questions:
- Check documentation in `/docs`
- Review logs for error messages
- Test with demo credentials
- Verify environment variables are set

---

**Last Updated:** July 12, 2024
**Version:** 3.0.0
