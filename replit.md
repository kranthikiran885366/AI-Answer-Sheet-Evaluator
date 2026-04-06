# EvalAI Pro

AI-powered answer sheet evaluation platform for educators.

## Architecture

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Color palette:** Indigo/Violet/Slate (human-centered, no yellows)
- **Real-time:** Server-Sent Events (SSE) via `/api/progress`
- **Package manager:** npm

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Main dashboard (admin/teacher/student) |
| `/upload` | Upload answer sheets |
| `/api/upload` | POST: Upload file, returns `sessionId` |
| `/api/evaluate` | POST: Run AI evaluation, returns results |
| `/api/progress` | GET (SSE): Real-time evaluation progress stream |
| `/api/status` | GET: System health & stats |
| `/api/results/[id]` | GET: Fetch evaluation result by session ID |

## Backend API Logic

1. **Upload** (`POST /api/upload`) — accepts `multipart/form-data`, saves to `./uploads/<sessionId>/`, returns `sessionId`
2. **Evaluate** (`POST /api/evaluate`) — reads uploaded file, calls OpenAI GPT-4o for OCR + evaluation (falls back to Gemini or demo mode if no API key), stores result JSON
3. **Progress** (`GET /api/progress?sessionId=...`) — Server-Sent Events stream of 8 processing steps
4. **Results** (`GET /api/results/:id`) — Returns stored evaluation JSON

## AI Provider Priority

1. `OPENAI_API_KEY` → GPT-4o (OCR vision + evaluation)
2. `GEMINI_API_KEY` → Gemini 1.5 Flash (text evaluation only)
3. No key → demo/simulated result

## Environment Variables

- `OPENAI_API_KEY` — for GPT-4o OCR + evaluation
- `GEMINI_API_KEY` — for Gemini evaluation
- `ANTHROPIC_API_KEY` — future Claude support

## Development

```bash
npm run dev   # starts on port 5000
npm run build # production build
npm run start # production server on port 5000
```

## Components

All UI components from shadcn/ui in `components/ui/`.
Custom app components in `app/components/`.

Key components:
- `AdvancedUploadSection` — full upload + evaluation flow with real-time SSE progress
- `WebSocketProvider` (in `components/`) — SSE-based real-time context
- `MainSidebar` — role-based navigation (admin/teacher/student)
- `AdminDashboard`, `StudentDashboard`, `OCRProcessingEngine`, etc.

## Notes

- Python FastAPI backend (`backend/`) is present but not running — frontend uses Next.js API routes instead
- Uploaded files stored in `./uploads/` (excluded from git via .gitignore)
- The `app/components/websocket-provider.jsx` is a legacy file; the canonical provider is `components/websocket-provider.tsx`
