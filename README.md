# MedGuide

A Mobile Applicaiton that detects medicine consumption compatability

# 💊 Medguide - Medication Management App

A mobile app that helps users understand their medications through prescription scanning, AI-powered Q&A, and multi-language support.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Development](#development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Timeline](#timeline)

---

## ✨ Features

### MVP (Phase 1)

- ✅ Multi-language support (English + Chinese)
- ✅ Prescription scanning via camera
- ✅ OCR to extract medication names
- ✅ AI-powered chatbot for medication questions
- ✅ Basic medication information
- ✅ Scan history storage

### Phase 2 (Planned)

- ⏳ Medication package scanning
- ⏳ Drug interaction checking
- ⏳ Reminder system with notifications
- ⏳ Additional languages (Arabic)

### Phase 3 (Future)

- ❌ Advanced NLP for complex queries
- ❌ User profiles & personalization
- ❌ Community feedback integration

---

## 🚀 Tech Stack

### Frontend (Mobile App)

- **React Native** + **Expo** + **TypeScript**
- **React Navigation** - Screen navigation
- **expo-camera** - Camera access
- **AsyncStorage** - Local storage
- **i18n-js** - Multi-language support
- **axios** - API communication

### Backend (API Server)

- **Node.js** + **Express** + **TypeScript**
- **Docker** + **Docker Compose** - Containerization
- **Supabase** - PostgreSQL database (hosted)

### AI & OCR

- **Google Gemini API** (or OpenAI) - Chatbot
- **Google Cloud Vision** (or other cloud OCR) - OCR

### Deployment

- **Render** (or Railway/Fly.io) - Backend hosting
- **Supabase** - Database hosting
- **EAS Build** - Mobile app builds

---

## 📦 Prerequisites

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

## 📦 Packages to install

Minimal commands and packages referenced by this README.

1. Global tools (install once)

```bash
# Node, npm/yarn, Git and Docker: install from official sites (no npm command)
# Expo & EAS CLIs (optional, used for mobile builds)
npm install -g expo-cli eas-cli
# or with yarn
yarn global add expo-cli eas-cli
```

2. Backend (from c:\...\MedGuide\backend)

```bash
cd backend

# runtime / main libs
npm install express cors dotenv @supabase/supabase-js axios

# AI / OCR (choose one or both)
# OpenAI
npm install openai
# Google Cloud Vision (if using Google Cloud)
npm install @google-cloud/vision

# dev / TypeScript tooling
npm install -D typescript ts-node-dev @types/node @types/express
```

3. Mobile (from c:\...\MedGuide\mobile) — Expo managed workflow

```bash
cd mobile

# main deps (Expo provides react-native)
npm install axios i18n-js

# navigation (minimal)
npm install @react-navigation/native @react-navigation/native-stack
# install native dependencies via expo
expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# camera & storage
expo install expo-camera @react-native-async-storage/async-storage

# TypeScript (if using TS)
npm install -D typescript @types/react @types/react-native
```

4. Notes / optional packages

- For database interaction: @supabase/supabase-js (backend).
- For AI: openai (OpenAI) or Google client libs for Gemini; pick according to your provider and API keys.
- For containerized backend: Docker and docker-compose (no npm package).
- Use yarn instead of npm if preferred; replace npm install with yarn add and npm install -D with yarn add -D.

---

## 📁 Project Structure

```
medguide/
├── mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── screens/          # App screens (Home, Scanner, Chat, Reminders)
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API calls, OCR logic
│   │   ├── utils/            # Helper functions
│   │   └── i18n/             # Translations (EN, ZH)
│   ├── App.tsx               # Main app entry
│   ├── package.json
│   └── app.json
│
├── backend/                   # Node.js Express API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Business logic
│   │   ├── services/         # Supabase, AI, OCR services
│   │   ├── middleware/       # Auth, validation, error handling
│   │   └── index.ts          # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docker-compose.yml         # Docker orchestration
├── .gitignore
└── README.md
```

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MedGuide.git
cd MedGuide
```

### 2. Setup Supabase Database

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Once created, go to **Settings** → **API**
3. Copy your:
   - Project URL
   - `anon` public key
4. Go to **SQL Editor** and create tables:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  medication_name TEXT NOT NULL,
  dosage TEXT,
  scan_date TIMESTAMP DEFAULT NOW(),
  image_url TEXT
);

-- Create reminders table (Phase 2)
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  medication_name TEXT NOT NULL,
  time TIME NOT NULL,
  frequency TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
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
```

**Edit `.env` file:**

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# AI (Choose one)
GEMINI_API_KEY=your-gemini-api-key
# OR
OPENAI_API_KEY=your-openai-api-key

# OCR (Optional - for Google Cloud Vision)
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

**Edit `.env` file:**

```env
API_URL=http://localhost:3000
# For testing on physical device, use your computer's IP:
# API_URL=http://192.168.1.XXX:3000
```

---

## 💻 Development

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

---

## 🚀 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name:** medguide-backend
   - **Environment:** Docker
   - **Plan:** Free
6. Add environment variables from your `.env` file
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

## 🔐 Environment Variables

### Backend `.env`

| Variable                  | Description                          | Required |
| ------------------------- | ------------------------------------ | -------- |
| `PORT`                    | Server port (default: 3000)          | Yes      |
| `NODE_ENV`                | Environment (development/production) | Yes      |
| `SUPABASE_URL`            | Your Supabase project URL            | Yes      |
| `SUPABASE_ANON_KEY`       | Your Supabase anon key               | Yes      |
| `GEMINI_API_KEY`          | Google Gemini API key                | Yes\*    |
| `OPENAI_API_KEY`          | OpenAI API key                       | Yes\*    |
| `GOOGLE_CLOUD_VISION_KEY` | Google Cloud Vision key              | No       |

\*Choose either Gemini or OpenAI

### Mobile `.env`

| Variable  | Description     | Required |
| --------- | --------------- | -------- |
| `API_URL` | Backend API URL | Yes      |

---

## 👥 Contributing

### Team Members

- **Alvin** - [Role]
- **Jerey** - [Role]

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

## 📅 Timeline

### Phase 1: MVP (Late Nov - End Dec) - 4 weeks

- [x] Project setup
- [ ] Language selection screen
- [ ] Camera scanning
- [ ] OCR integration (Google Cloud Vision)
- [ ] Basic chatbot (Gemini API)
- [ ] Simple UI/UX

### Phase 2: Features (Jan - Feb) - 4 weeks

- [ ] Medication package scanning
- [ ] Enhanced OCR (Google Cloud Vision)
- [ ] Drug interaction checking
- [ ] Reminder system
- [ ] Push notifications

### Phase 3: Polish (Feb - Mar)

- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User testing feedback
- [ ] App store submission

---

## 📝 Useful Commands

```bash
# Backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
docker-compose up    # Run in Docker

# Mobile
npx expo start       # Start development server
npx expo start --clear  # Clear cache and restart
eas build            # Build for app stores
eas submit           # Submit to app stores

# Database
# Visit https://supabase.com/dashboard to manage
```

---

## 🐛 Troubleshooting

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
2. Check `API_URL` in mobile `.env`
3. For physical device testing, use your computer's local IP:

```bash
# Find your IP (macOS/Linux)
ifconfig | grep "inet "

# Update mobile/.env
API_URL=http://192.168.1.XXX:3000
```

### Expo Go won't scan QR code

1. Ensure phone and computer are on same WiFi
2. Try using tunnel mode: `npx expo start --tunnel`
3. Update Expo Go app to latest version

---

## 📚 Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com/)
- [Docker Docs](https://docs.docker.com/)
- [Google Gemini API](https://ai.google.dev/docs)

---

## 📄 License

This project is for educational purposes as part of [University/Course Name].

---

## 🤝 Support

For questions or issues:

1. Check existing GitHub Issues
2. Create a new Issue with detailed description
3. Contact team members on [Slack/Discord/etc]

---
