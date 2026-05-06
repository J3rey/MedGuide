# MedGuide

A mobile app that helps users understand their medications through prescription scanning, AI-powered Q&A, and multi-language support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Development](#development)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Timeline](#timeline)

---

## Features

### Implemented

- Multi-language support (English, Chinese, Spanish, Hindi, Indonesian, Italian, Korean)
- Prescription scanning via camera
- OCR to extract medication names from images (Google Cloud Vision)
- AI-powered chatbot for medication questions (Google Gemini)
- Drug search with fuzzy matching
- Manual medication search
- Medication alarm & schedule system
- Push notifications for medication reminders
- Drug details view
- Rate limiting & input validation

### Planned

- Advanced drug interaction checking
- User profiles & personalization
- Additional languages (Arabic)
- App store submission

---

## Tech Stack

### Frontend (Mobile App)

- **React Native 0.81** + **Expo SDK 54** + **TypeScript**
- **React Navigation 6** - Screen navigation
- **expo-camera** - Camera access
- **expo-notifications** - Push notifications
- **expo-image-picker** - Image selection
- **AsyncStorage** - Local storage
- **react-i18next** - Multi-language support (7 languages)
- **axios** - API communication
- **zod** - Client-side validation
- **Supabase JS** - Direct database access from mobile

### Backend (API Server)

- **Node.js** + **Express 4** + **TypeScript**
- **Docker** + **Docker Compose** - Containerization
- **Supabase** - PostgreSQL database (hosted)
- **multer** - File upload handling
- **express-rate-limit** - Rate limiting
- **zod** - Schema validation

### AI & OCR

- **Google Gemini API** (`@google/generative-ai`) - AI chatbot
- **Google Cloud Vision** (`@google-cloud/vision`) - OCR

### Deployment

- **Render** - Backend hosting (`https://medguide-p132.onrender.com`)
- **Supabase** - Database hosting
- **EAS Build** - Mobile app builds

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Expo Go app** on your phone - [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Accounts Needed (Free)

- **Supabase Account** - [Sign up](https://supabase.com/)
- **Google AI Studio** (for Gemini API) - [Sign up](https://makersuite.google.com/)
- **Expo Account** - [Sign up](https://expo.dev/)

---

## Installation

All dependencies are defined in the respective `package.json` files. Simply run `npm install` in each directory:

```bash
# Backend
cd backend
npm install

# Mobile
cd ../mobile
npm install
```

> **Note:** Always use `npx expo` instead of `expo-cli` (deprecated as of SDK 46+). To install EAS CLI for app builds: `npm install -g eas-cli`

---

## Project Structure

```
medguide/
├── mobile/                         # React Native mobile app (Expo SDK 54)
│   ├── src/
│   │   ├── screens/                # App screens
│   │   │   ├── CameraScreen.tsx       # Prescription scanning
│   │   │   ├── ChatScreen.tsx         # AI chatbot
│   │   │   ├── AlarmScreen.tsx        # Medication alarms
│   │   │   ├── ScheduleScreen.tsx     # Medication schedule
│   │   │   ├── DrugDetailsScreen.tsx  # Drug information
│   │   │   ├── ManualSearchScreen.tsx # Manual drug search
│   │   │   ├── ScanResultsScreen.tsx  # OCR scan results
│   │   │   └── LanguageSelectionScreen.tsx
│   │   ├── components/             # Reusable UI components
│   │   ├── contexts/               # React contexts (Language, Scan)
│   │   ├── services/               # API, OCR, notifications, Supabase
│   │   ├── i18n/                   # Translations (EN, ZH, ES, HI, ID, IT, KO)
│   │   ├── utils/                  # Fuzzy matching, camera helpers
│   │   ├── styles/                 # Theme configuration
│   │   └── types/                  # TypeScript type definitions
│   ├── App.tsx
│   ├── app.config.js
│   └── package.json
│
├── backend/                        # Node.js Express API
│   ├── src/
│   │   ├── routes/                 # chat, drugs, alarms, ocr
│   │   ├── services/               # Supabase & Gemini integrations
│   │   ├── middleware/             # Rate limiting, Zod validation
│   │   ├── validators/             # Zod schemas
│   │   ├── types/                  # TypeScript type definitions
│   │   └── index.ts                # Server entry point
│   ├── migrations/                 # SQL migration files
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml              # Docker orchestration
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MedGuide.git
cd MedGuide
```

### 2. Setup Supabase Database

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Go to **Settings → API** and copy your:
   - Project URL
   - `anon` public key
3. Go to **SQL Editor** and run the migration files in order:

```
# Run each file in backend/migrations/ in the Supabase SQL Editor:
# 1. 001_create_drugs_table.sql
# 2. 002_create_alarms_table.sql
# 3. 003_add_fuzzy_search.sql
# 4. 003_sample_drugs_data.sql  (optional: seed sample data)
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env
````

**Edit `backend/.env`:**

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# AI
GEMINI_API_KEY=your-gemini-api-key

# OCR
GOOGLE_CLOUD_VISION_KEY=your-vision-key
```

### 4. Setup Mobile App

```bash
cd ../mobile

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your backend URL
nano .env
```

**Edit `mobile/.env`:**

```env
# For local development
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
# For testing on a physical device, use your computer's local IP:
# EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:3000

# Supabase (same values as backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Development

### Option 1: Run Backend with Docker (Recommended for team)

```bash
# From project root
docker-compose up --build

# Backend runs at http://localhost:3000
```

### Option 2: Run Backend Locally (Without Docker)

```bash
cd backend

# Development mode (auto-restart on changes)
npm run dev

# Backend runs at http://localhost:3000
```

### Run Mobile App

```bash
cd mobile

# Start Expo development server
npx expo start

# Options:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

### Testing API Endpoints

```bash
# Test health check
curl http://localhost:3000/health

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is paracetamol?", "language": "en"}'
```

### Code Quality

```bash
# From backend/ or mobile/ — both support the same commands
npm run lint          # Lint TypeScript files
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format code with Prettier
npm run format:check  # Check formatting without writing
npm run type-check    # TypeScript type checking
```

---

## API Routes

| Method   | Route                      | Description            |
| -------- | -------------------------- | ---------------------- |
| `GET`    | `/health`                  | Health check           |
| `POST`   | `/api/chat`                | AI chatbot query       |
| `GET`    | `/api/drugs`               | List all drugs         |
| `GET`    | `/api/drugs/search?q=name` | Fuzzy drug name search |
| `GET`    | `/api/drugs/:id`           | Get drug by ID         |
| `POST`   | `/api/ocr/extract`         | OCR from base64 image  |
| `POST`   | `/api/ocr/upload`          | OCR from uploaded file |
| `GET`    | `/api/alarms`              | Get all alarms         |
| `POST`   | `/api/alarms`              | Create alarm           |
| `PUT`    | `/api/alarms/:id`          | Update alarm           |
| `DELETE` | `/api/alarms/:id`          | Delete alarm           |
| `POST`   | `/api/alarms/:id/snooze`   | Snooze alarm           |

---

## Deployment

### Deploy Backend to Render

The backend is currently deployed at: `https://medguide-p132.onrender.com`

To redeploy or set up a new instance:

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New → Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name:** medguide-backend
   - **Environment:** Docker
   - **Plan:** Free
6. Add environment variables from your `backend/.env` file
7. Click **Create Web Service**

### Deploy Mobile App

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
cd mobile
eas build:configure

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account - $99/year)
eas build --platform ios --profile preview
```

**Download and share the APK with your team!**

---

## Environment Variables

### Backend `backend/.env`

| Variable                  | Description                          | Required |
| ------------------------- | ------------------------------------ | -------- |
| `PORT`                    | Server port (default: 3000)          | Yes      |
| `NODE_ENV`                | Environment (development/production) | Yes      |
| `SUPABASE_URL`            | Your Supabase project URL            | Yes      |
| `SUPABASE_ANON_KEY`       | Your Supabase anon key               | Yes      |
| `GEMINI_API_KEY`          | Google Gemini API key                | Yes      |
| `GOOGLE_CLOUD_VISION_KEY` | Google Cloud Vision API key          | Yes      |

### Mobile `mobile/.env`

| Variable                  | Description               | Required |
| ------------------------- | ------------------------- | -------- |
| `EXPO_PUBLIC_BACKEND_URL` | Backend API URL           | Yes      |
| `SUPABASE_URL`            | Your Supabase project URL | Yes      |
| `SUPABASE_ANON_KEY`       | Your Supabase anon key    | Yes      |

---

## Contributing

### Workflow

1. **Create a branch:**

```bash
git checkout -b feature/your-feature-name
```

2. **Make changes and commit:**

```bash
git add .
git commit -m "Add: brief description of changes"
```

3. **Push to GitHub:**

```bash
git push origin feature/your-feature-name
```

4. **Create Pull Request** on GitHub

5. **Review & Merge** after teammate approval

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/camera-scan`)
- `fix/` - Bug fixes (e.g., `fix/ocr-accuracy`)
- `docs/` - Documentation (e.g., `docs/update-readme`)

---

## Timeline

### Phase 1: MVP

- [x] Project setup
- [x] Language selection screen (7 languages)
- [x] Camera scanning
- [x] OCR integration (Google Cloud Vision)
- [x] AI chatbot (Gemini API)
- [x] Drug search with fuzzy matching
- [x] Basic UI/UX

### Phase 2: Features

- [x] Medication alarm & schedule system
- [x] Push notifications
- [x] Manual search
- [x] Drug details screen
- [ ] Full drug interaction checking

### Phase 3: Polish

- [ ] Performance optimization
- [ ] User testing & feedback
- [ ] App store submission

---

## Useful Commands

```bash
# Backend
npm run dev          # Start development server (auto-restart)
npm run build        # Compile TypeScript to dist/
npm start            # Start production server
npm run lint         # Lint TypeScript files
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
docker-compose up --build  # Build and run in Docker
docker-compose down        # Stop containers

# Mobile
npx expo start            # Start Expo development server
npx expo start --clear    # Clear cache and restart
npx expo start --web      # Run as web app
npm run build:web         # Build PWA
npm run lint              # Lint TypeScript files
npm run format            # Format code with Prettier
npm run type-check        # TypeScript type checking
eas build                 # Build for app stores
eas submit                # Submit to app stores

# Database
# Visit https://supabase.com/dashboard to manage your Supabase project
```

---

## Troubleshooting

### Backend won't start

```bash
# Check if port 3000 is already in use
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Restart Docker
docker-compose down
docker-compose up --build
```

### Mobile app can't connect to backend

1. Make sure backend is running
2. Check `EXPO_PUBLIC_BACKEND_URL` in `mobile/.env`
3. For physical device testing, use your computer's local IP:

```bash
# Find your IP (macOS/Linux)
ifconfig | grep "inet "

# Windows
ipconfig

# Update mobile/.env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:3000
```

### Expo Go won't scan QR code

1. Ensure phone and computer are on same WiFi
2. Try using tunnel mode: `npx expo start --tunnel`
3. Update Expo Go app to latest version

---

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com/)
- [Docker Docs](https://docs.docker.com/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Google Cloud Vision Docs](https://cloud.google.com/vision/docs)

---

## License

This project is for educational purposes as part of [University/Course Name].

---

## Support

For questions or issues:

1. Check existing GitHub Issues
2. Create a new Issue with detailed description
3. Contact team members on [Slack/Discord/etc]

---
