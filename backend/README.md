# MedGuide Backend

Node.js + Express API server providing drug lookup, OCR processing, AI chatbot, and medication alarm management.

**Production URL:** `https://medguide-p132.onrender.com`

## Requirements

- Node.js 20+
- Docker Desktop (for containerized setup)
- Supabase project ([supabase.com](https://supabase.com/))
- Google Gemini API key ([ai.google.dev](https://ai.google.dev/))
- Google Cloud Vision API key ([cloud.google.com/vision](https://cloud.google.com/vision))

## Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
```

**`backend/.env`:**

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLOUD_VISION_KEY=your-vision-api-key
```

## Database Migration

Run these SQL files in order in the [Supabase SQL Editor](https://supabase.com/dashboard):

1. `migrations/001_create_drugs_table.sql`
2. `migrations/002_create_alarms_table.sql`
3. `migrations/003_add_fuzzy_search.sql`
4. `migrations/003_sample_drugs_data.sql` (optional sample data)

## Development

```bash
# Option 1: Docker (recommended)
docker-compose up --build    # from project root
docker-compose down

# Option 2: Local
npm run dev     # auto-restart on file changes (ts-node-dev)
```

Server runs at `http://localhost:3000`.

## Scripts

```bash
npm run dev         # Start dev server with auto-restart
npm run build       # Compile TypeScript to dist/
npm start           # Start compiled production server
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix lint issues
npm run format      # Prettier formatting
npm run type-check  # TypeScript type check
npm run check-db    # Verify Supabase connection
```

## API Routes

| Method   | Route                      | Description              |
|----------|----------------------------|--------------------------|
| `GET`    | `/health`                  | Health check             |
| `POST`   | `/api/chat`                | AI chatbot query         |
| `GET`    | `/api/drugs`               | List all drugs           |
| `GET`    | `/api/drugs/search?q=name` | Fuzzy drug name search   |
| `GET`    | `/api/drugs/:id`           | Get drug by ID           |
| `POST`   | `/api/ocr/extract`         | OCR from base64 image    |
| `POST`   | `/api/ocr/upload`          | OCR from uploaded file   |
| `GET`    | `/api/alarms`              | Get all alarms           |
| `POST`   | `/api/alarms`              | Create alarm             |
| `PUT`    | `/api/alarms/:id`          | Update alarm             |
| `DELETE` | `/api/alarms/:id`          | Delete alarm             |
| `POST`   | `/api/alarms/:id/snooze`   | Snooze alarm             |

## Project Structure

```
backend/
├── src/
│   ├── index.ts            # Server entry point, route mounting
│   ├── routes/
│   │   ├── chat.ts         # POST /api/chat — Gemini AI chatbot
│   │   ├── drugs.ts        # GET /api/drugs* — drug database queries
│   │   ├── alarms.ts       # CRUD /api/alarms* — medication reminders
│   │   └── ocr.ts          # POST /api/ocr/* — OCR image processing
│   ├── services/
│   │   ├── supabase.ts     # Supabase PostgreSQL client
│   │   └── gemini.ts       # Google Gemini AI integration
│   ├── middleware/
│   │   ├── rateLimiter.ts  # Per-route rate limiting
│   │   └── validation.ts   # Zod request validation
│   ├── validators/
│   │   └── schemas.ts      # Zod schemas for all endpoints
│   └── types/
│       ├── alarms.ts
│       └── errors.ts
├── migrations/             # SQL migration files
├── scripts/                # Utility scripts (seed, check DB, test chatbot)
├── Dockerfile
└── package.json
```

## Rate Limits

| Route          | Limit          |
|----------------|----------------|
| `/api/chat`    | Stricter limit |
| `/api/alarms`  | Moderate limit |
| All others     | General limit  |

## Deployment (Render)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New → Web Service**
3. Connect your GitHub repository
4. Set **Environment** to Docker
5. Add all environment variables from `backend/.env`
6. Click **Create Web Service**

See `../RENDER_ENV_SETUP.md` for detailed Render configuration.
