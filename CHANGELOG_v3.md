# MedGuide v3.0 - Major Redesign Summary

## Overview

This release implements a comprehensive redesign of the MedGuide mobile application, transforming it from a simple medication scanner/chat app into a full-featured medication management platform designed for elderly users and their caregivers.

---

## Theme & Design System (`mobile/src/styles/theme.ts`)

| Token | Value | Purpose |
|-------|-------|---------|
| Primary | `#364EFF` | Core brand color - trustworthy, calm |
| Primary Light | `#EEF1FF` | Backgrounds, highlights |
| Primary Dark | `#1E2FBF` | High contrast mode |
| Background | `#F8F9FF` | App background |
| Surface | `#FFFFFF` | Cards, modals |
| Emergency | `#B91C1C` | Emergency actions |

The theme includes full **dark mode** and **high contrast** palettes, accessibility-aware touch targets (minimum 44px), and scalable typography/button multipliers.

---

## New Navigation Structure

The app now uses a **5-tab bottom navigation**:

| Tab | Screen | Description |
|-----|--------|-------------|
| Home | `HomeScreen` | Dashboard with progress, quick actions, profile switcher |
| Schedule | `VisualScheduleScreen` | Timeline-based medication schedule |
| Scan | `CameraScreen` (stack) | Camera scan with results and manual search |
| Chat | `ChatScreen` | AI medication assistant |
| Profile | `ProfileScreen` (stack) | Settings hub with sub-screens |

---

## New Screens

### Home (`HomeScreen.tsx`)
- Greeting with profile switcher
- Today's medication progress (taken/missed/upcoming)
- Next medication card with countdown
- Missed medication alerts
- Quick action grid (Schedule, Scan, Chat, Emergency)

### Visual Schedule (`VisualScheduleScreen.tsx`)
- Timeline view with time-slot groupings (Morning, Afternoon, Evening, Night)
- Color-coded status indicators (upcoming, taken, missed, skipped, due soon)
- Mark as taken/skipped inline
- Profile-aware (shows active profile's medications)

### Profile & Settings (`ProfileScreen.tsx`)
- Profile card with avatar
- Grouped settings: People & Access, Health & Safety, Preferences, About
- Navigation to all sub-screens

### Accessibility Settings (`AccessibilitySettingsScreen.tsx`)
- High contrast mode toggle
- Reduce animations toggle
- Simplified interface toggle
- Text size selector (Small/Default/Large/Extra Large) with live preview
- Button size selector (Default/Large/Extra Large)
- Voice feedback toggle

### Security Settings (`SecuritySettingsScreen.tsx`)
- Biometric authentication (Face ID / Fingerprint) master toggle
- Granular biometric gates: app open, medication notes, caregiver management, emergency contacts
- Security information cards
- PIN backup setup

### Manage Profiles (`ManageProfilesScreen.tsx`)
- View all profiles with active indicator
- Switch between profiles
- Add new profile with name, relationship, avatar color
- Delete non-self profiles with confirmation

### Caregiver Dashboard (`CaregiverDashboardScreen.tsx`)
- Monitor medication status for care recipients
- Completion progress bars
- Missed dose alerts
- Quick actions: Call, Message, View Details
- Emergency alert banners

### Caregiver Invite (`CaregiverInviteScreen.tsx`)
- Role selection (Caregiver, Family Member, Emergency Contact)
- Invite methods: Email, Phone, Invite Code
- Shareable invite codes
- Default permissions preview

### Emergency Protocol (`EmergencyProtocolScreen.tsx`)
- Always-visible emergency call button (000)
- Categorized emergency types with step-by-step guides:
  - Medication Overdose
  - Allergic Reaction
  - Chest Pain
  - Breathing Difficulty
  - Fall or Injury
  - Confusion/Disorientation
- Confirmation modal before dialing

### Emergency Contacts (`EmergencyContactsScreen.tsx`)
- Priority-ordered contact list
- One-tap call and message
- Add/remove contacts
- Relationship and phone fields

### Pharmacy (`PharmacyScreen.tsx`)
- Store pharmacy details (name, phone, address, hours)
- One-tap call pharmacy
- Multiple pharmacies supported

### Cultural Notes (`CulturalNotesScreen.tsx`)
- Cultural preferences text (fasting, prayer times, etc.)
- Dietary/religious considerations (gelatin-free, halal, kosher)
- Family involvement preference (Full/Limited/Minimal)
- Disclaimer about medical advice

---

## New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `BottomTabNavigation` | `components/` | 5-tab navigation bar |
| `MainAppContainer` | `components/` | Root app shell with sub-screen routing |
| `ProfileSwitcher` | `components/` | Dropdown profile selector |
| `SectionCard` | `components/ui/` | Grouped content card |
| `StatusChip` | `components/ui/` | Colored status badge |
| `LargeActionButton` | `components/ui/` | Accessible action button |
| `StateViews` | `components/ui/` | Empty, Loading, Error states |
| `ConfirmActionModal` | `components/ui/` | Destructive action confirmation |

---

## New Contexts

### `ProfileContext`
- Multi-profile state management
- Active profile tracking
- CRUD operations (add, update, delete)
- Profile switching

### `AccessibilityContext`
- Global accessibility settings
- Font size scaling helper
- Button height scaling helper
- High contrast and simplified mode flags

---

## Backend Changes

### New API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/profiles` | GET/POST | List/create profiles |
| `/api/profiles/:id` | PUT/DELETE | Update/delete profile |
| `/api/profiles/:id/caregivers` | GET | List caregivers |
| `/api/profiles/:id/caregivers/invite` | POST | Send invite |
| `/api/caregivers/accept-invite` | POST | Accept invite code |
| `/api/caregivers/:id/permissions` | PUT | Update permissions |
| `/api/caregivers/:id/revoke` | POST | Revoke access |
| `/api/caregivers/my-patients` | GET | Caregiver's patients |
| `/api/profiles/:id/emergency-contacts` | GET/POST | Emergency contacts |
| `/api/emergency-contacts/:id` | DELETE | Remove contact |
| `/api/profiles/:id/emergency-events` | GET/POST | Emergency events |
| `/api/emergency-events/:id/resolve` | POST | Resolve event |
| `/api/profiles/:id/pharmacies` | GET/POST | Pharmacies |
| `/api/pharmacies/:id` | DELETE | Remove pharmacy |
| `/api/profiles/:id/medications` | GET/POST | Medications with schedules |
| `/api/medications/:id` | PUT/DELETE | Update/delete medication |
| `/api/medications/:id/schedules` | POST | Add schedule |
| `/api/schedules/:id` | DELETE | Remove schedule |
| `/api/medication-logs` | POST | Log medication action |
| `/api/profiles/:id/medication-logs/today` | GET | Today's logs |

### Database Migration (`004_create_profiles_and_caregivers.sql`)
- 9 new tables with indexes and Row Level Security
- Caregiver read-access policies for shared medication viewing
- Full RLS for owner-only access patterns

---

## Data Models (`mobile/src/types/models.ts`)

All new TypeScript interfaces and types for:
- User, Profile, AccessibilitySettings
- CaregiverRole, CaregiverPermissions, ProfileCaregiver
- Medication, MedicationSchedule, MedicationLog
- Pharmacy, EmergencyContact, EmergencyEvent
- VoiceNote, ScheduleItem, ScheduleViewMode
- Navigation param lists for all stacks

---

## Architecture Notes

- The old `DarkMainApp` component is preserved but no longer the primary entry point
- `App.tsx` now wraps the app in `AccessibilityProvider > ProfileProvider > ScanProvider`
- Navigation uses a hybrid approach: React Navigation for the camera stack, manual state for tab/sub-screen routing (simpler, more controllable for the elderly UX)
- All new screens follow consistent patterns: safe area insets, back navigation, section cards
- Emergency features are always accessible regardless of biometric locks
