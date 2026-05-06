# MedGuide Mobile

React Native + Expo mobile app for prescription scanning, medication lookup, and reminder management.

## Requirements

- Node.js 20+
- Expo Go app on your device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- A running MedGuide backend (see `../backend/README.md`)

## Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
```

**`mobile/.env`:**

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
# For physical device testing, use your machine's local IP:
# EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Development

```bash
npx expo start          # Start dev server (scan QR code with Expo Go)
npx expo start --clear  # Clear Metro cache and restart
npx expo start --web    # Run as web app in browser

# Simulator/emulator shortcuts (after starting)
# Press 'i' — iOS simulator
# Press 'a' — Android emulator
```

## Scripts

```bash
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix lint issues
npm run format      # Prettier formatting
npm run type-check  # TypeScript type check
npm run build:web   # Build PWA for web
```

## Building for App Stores

```bash
npm install -g eas-cli
eas login
eas build:configure

eas build --platform android --profile preview  # APK for testing
eas build --platform ios --profile preview      # Requires Apple Developer account
eas submit                                      # Submit to app stores
```

## Project Structure

```
mobile/
├── App.tsx                     # App entry point and navigation setup
├── app.config.js               # Expo configuration
├── src/
│   ├── screens/                # Full-page views
│   │   ├── CameraScreen.tsx        # Prescription scanning (camera + gallery)
│   │   ├── ScanResultsScreen.tsx   # OCR results with matched drug names
│   │   ├── ChatScreen.tsx          # AI-powered medication Q&A
│   │   ├── ManualSearchScreen.tsx  # Text-based drug name search
│   │   ├── DrugDetailsScreen.tsx   # Full drug information view
│   │   ├── ScheduleScreen.tsx      # Medication reminder setup
│   │   ├── AlarmScreen.tsx         # Active alarm with snooze/dismiss
│   │   └── LanguageSelectionScreen.tsx
│   ├── components/             # Reusable UI components
│   │   ├── DarkMainApp.tsx         # Main container with tab navigation
│   │   ├── DarkBottomNavigation.tsx
│   │   ├── TabIcons.tsx
│   │   └── Logo.tsx
│   ├── services/               # API clients and integrations
│   │   ├── api.ts                  # Axios HTTP client
│   │   ├── ocr.ts                  # Image-to-text extraction
│   │   ├── drugSearch.ts           # Drug name search
│   │   ├── matchDrugsFromImage.ts  # Fuzzy match OCR results to drugs
│   │   ├── medicationService.ts    # Medication CRUD
│   │   ├── notificationService.ts  # Push notification management
│   │   └── supabase.ts             # Supabase client
│   ├── contexts/               # React context providers
│   │   ├── LanguageContext.tsx
│   │   └── ScanContext.tsx
│   ├── i18n/                   # Internationalization
│   │   ├── config.ts
│   │   └── locales/            # en, zh, es, hi, id, it, ko
│   ├── styles/
│   │   └── theme.ts            # Colors, spacing, typography
│   ├── types/
│   │   ├── drug.ts
│   │   └── navigation.ts
│   └── utils/
│       ├── fuzzyMatch.ts
│       ├── cameraConstants.ts
│       └── uriToBase64.ts
└── assets/
    └── logo.png
```

## Supported Languages

English, Chinese (Simplified), Spanish, Hindi, Indonesian, Italian, Korean

## Troubleshooting

**Can't connect to backend on physical device:**
Set `EXPO_PUBLIC_BACKEND_URL` to your machine's local IP (e.g., `http://192.168.1.50:3000`), not `localhost`.

**Expo Go won't scan QR code:**
Make sure your phone and computer are on the same WiFi network. If still failing, try `npx expo start --tunnel`.

**Metro cache issues:**
Run `npx expo start --clear` to reset the bundler cache.
