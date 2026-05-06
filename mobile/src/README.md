# MedGuide Mobile — Source Structure

## `/screens/`

Full-page views navigated via React Navigation.

- **`CameraScreen.tsx`** — Prescription scanning with camera and gallery, flash/zoom controls
- **`ScanResultsScreen.tsx`** — Displays OCR results with fuzzy-matched drug names
- **`ChatScreen.tsx`** — AI-powered medication Q&A (Gemini API)
- **`ManualSearchScreen.tsx`** — Text-based drug name search with autocomplete
- **`DrugDetailsScreen.tsx`** — Full drug information (dosage, indications, adverse effects)
- **`ScheduleScreen.tsx`** — Medication reminder setup with time picker
- **`AlarmScreen.tsx`** — Active alarm modal with snooze and dismiss actions
- **`LanguageSelectionScreen.tsx`** — Language picker (EN, ZH, ES, HI, ID, IT, KO)

## `/components/`

Reusable UI components shared across screens.

- **`DarkMainApp.tsx`** — Main app container with tab navigation logic
- **`DarkBottomNavigation.tsx`** — Bottom tab bar (Schedule, Camera, Chat, Settings)
- **`TabIcons.tsx`** — Custom geometric icons for each tab
- **`Logo.tsx`** — MedGuide logo component

## `/services/`

API clients and business logic for backend/external integrations.

- **`api.ts`** — Axios HTTP client configured for the backend URL
- **`ocr.ts`** — Sends images to backend OCR endpoint and parses results
- **`matchDrugsFromImage.ts`** — Fuzzy-matches OCR text against the drug database
- **`drugSearch.ts`** — Queries the drug search API
- **`match.ts`** — Core fuzzy string matching utility
- **`medicationService.ts`** — CRUD operations for medications via Supabase
- **`notificationService.ts`** — Sets up and manages Expo push notifications
- **`supabase.ts`** — Supabase client initialization

## `/contexts/`

React context providers for shared app state.

- **`LanguageContext.tsx`** — Selected language, exposes `useLanguage()` hook
- **`ScanContext.tsx`** — Scan results shared between CameraScreen and ScanResultsScreen

## `/i18n/`

Internationalization setup using `react-i18next`.

- **`config.ts`** — i18next initialization
- **`locales/`** — Translation JSON files: `en`, `zh`, `es`, `hi`, `id`, `it`, `ko`

## `/styles/`

- **`theme.ts`** — Shared colors, spacing, typography, and semantic tokens

## `/types/`

TypeScript type definitions.

- **`drug.ts`** — Drug data model
- **`navigation.ts`** — React Navigation param list types

## `/utils/`

Standalone helper functions.

- **`fuzzyMatch.ts`** — Fuzzy string matching algorithm
- **`cameraConstants.ts`** — Camera configuration constants
- **`uriToBase64.ts`** — Converts a URI to a base64 string for API upload

## Conventions

| Category   | Naming          | Example                    |
|------------|-----------------|----------------------------|
| Screens    | `PascalCase.tsx`| `DrugDetailsScreen.tsx`    |
| Components | `PascalCase.tsx`| `DarkBottomNavigation.tsx` |
| Services   | `camelCase.ts`  | `notificationService.ts`   |
| Utils      | `camelCase.ts`  | `fuzzyMatch.ts`            |
