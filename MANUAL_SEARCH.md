# Manual Search Feature

## Overview
The Manual Search feature allows users to manually search for medications in the database with intelligent typo assistance and direct chatbot integration.

## Features

### 1. **Real-time Search with Fuzzy Matching**
- Type at least 2 characters to trigger suggestions
- 300ms debounce to optimize performance
- Searches across drug names, indications, and counseling information
- Prioritizes exact/prefix matches over partial matches

### 2. **Typo Assistance (Fill Assistance)**
- Live autocomplete suggestions as you type
- Case-insensitive search
- Partial matching helps find drugs even with minor spelling errors
- Suggestions show drug name and indications for easy identification

### 3. **Chatbot Integration**
- Select a drug from search results to view detailed information
- "Ask Chatbot About This Drug" button directly opens chat with the drug context
- Seamless transition from search to conversational assistance
- Drug name is automatically passed to the chatbot for contextualized responses

### 4. **Comprehensive Drug Information**
When a drug is selected, the following information is displayed:
- Drug name
- Indications
- Counseling information
- Adverse effects
- Pregnancy precautions
- Children precautions
- Breastfeeding precautions

## User Flow

1. **Access Manual Search**
   - From ScanResults screen: Click "Manual search" button
   - Navigates to ManualSearchScreen

2. **Search for a Drug**
   - Start typing the drug name
   - Wait for autocomplete suggestions to appear
   - Suggestions update in real-time as you type

3. **Select a Drug**
   - Tap on any suggestion to select it
   - Drug details are displayed immediately
   - Suggestions disappear after selection

4. **Ask Chatbot**
   - Review the drug information displayed
   - Tap "Ask Chatbot About This Drug" button
   - Automatically navigated back with drug context set
   - Chat screen opens with drug information pre-loaded

## Technical Implementation

### Frontend (Mobile)
- **Component**: `ManualSearchScreen.tsx`
- **Location**: `mobile/src/screens/ManualSearchScreen.tsx`
- **Dependencies**: 
  - ScanContext for drug name passing
  - drugSearch service for API calls
  - react-navigation for navigation

### Backend (API)
- **Endpoint**: `GET /api/drugs/search?q={query}`
- **Location**: `backend/src/routes/drugs.ts`
- **Search Strategy**:
  1. First query: Exact/prefix matches (`drug_name.ilike.{q}%`)
  2. Second query: Partial matches in name, indications, counseling
  3. Combines results, prioritizing exact matches
  4. Returns up to 15 results

### Database Integration
- Queries Supabase `drugs` table
- Uses PostgreSQL `ilike` for case-insensitive matching
- Efficient with indexed queries on drug_name

## Internationalization
Translations available in:
- English (en)
- Spanish (es)
- Italian (it)
- Korean (ko)
- Chinese (zh)

Translation keys in `mobile/src/i18n/locales/{lang}.json`:
```json
"manualSearch": {
  "title": "Manual Drug Search",
  "searchPlaceholder": "Type drug name...",
  "helperText": "Type at least 2 characters...",
  "suggestions": "Suggestions:",
  "noResults": "No drugs found matching",
  "tryAgain": "Try checking the spelling...",
  "selectedDrug": "Selected Drug:",
  "askChatbot": "Ask Chatbot About This Drug",
  "back": "Back"
}
```

## Navigation Structure
```
CameraStack
├── CameraMain (CameraScreen)
├── ScanResults (ScanResultsScreen)
│   └── [Manual search button] → ManualSearch
└── ManualSearch (ManualSearchScreen)
    └── [Ask Chatbot] → Back to Main (Chat Tab)
```

## API Response Format
```typescript
Drug[] where Drug = {
  id: number;
  drug_name: string;
  counseling: string | null;
  adverse_effects: string | null;
  indications: string | null;
  precautions_pregnancy: string | null;
  precautions_children: string | null;
  precautions_breastfeeding: string | null;
  created_at?: string;
  updated_at?: string;
}
```

## Performance Optimizations
- 300ms debounce on search input to reduce API calls
- Limit results to 15 items
- Efficient Supabase queries with proper filtering
- Prioritized search (exact matches first)

## Future Enhancements
- Add Levenshtein distance algorithm for better fuzzy matching
- Implement search history
- Add voice search capability
- Cache frequently searched drugs
- Add drug images/thumbnails
