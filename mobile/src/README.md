# MedGuide Mobile Structure

## Directory Organization

### `/src/screens/`

Screen-level components that represent full pages/views in the app.

- **`LoginScreen.tsx`** - Login/authentication screen
- **`HomeScreen.tsx`** - Home dashboard screen
- **`ScanScreen.tsx`** - Prescription scanning screen
- **`HistoryScreen.tsx`** - Scan history list screen
- **`ProfileScreen.tsx`** - User profile and settings screen

### `/src/components/`

Reusable UI components used across multiple screens.

- **`MainApp.tsx`** - Main app container with tab navigation logic
- **`BottomNavigation.tsx`** - Bottom tab navigation bar component

### `/src/services/`

API clients and service layer for backend communication.

- **`api.ts`** - Axios API client configuration

### `/src/utils/`

Utility functions and helpers.

### `/src/i18n/`

Internationalization configuration and translation files.

- **`config.ts`** - i18n setup
- **`locales/en.json`** - English translations
- **`locales/zh.json`** - Chinese translations

### `/src/styles/`

Global styles and theme configuration.

## File Naming Conventions

- Screens: `ScreenName.tsx` (PascalCase)
- Components: `ComponentName.tsx` (PascalCase)
- Services: `serviceName.ts` (camelCase)
- Utils: `utilName.ts` (camelCase)

## Import Path Examples

```tsx
// Import screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";

// Import components
import BottomNavigation from "../components/BottomNavigation";

// Import services
import api from "../services/api";
```

## Component vs Screen

**Screens:**

- Full-page views
- Contain business logic for that view
- Can use multiple components
- Navigate between each other

**Components:**

- Reusable UI pieces
- Can be used in multiple screens
- Focus on presentation
- Minimal business logic
