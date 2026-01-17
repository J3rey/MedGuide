# OCR & Supabase Integration - Troubleshooting

## Issues Fixed

### 1. **OCR Not Extracting Text (Empty Result)**

**Problem**: OCR returned "(empty)" even with clear handwriting

**Fixes Applied**:
- ✅ Improved Gemini prompt to explicitly handle handwritten text
- ✅ Added detailed logging at each step
- ✅ Increased `maxOutputTokens` to 1024
- ✅ Better error messages

**Check Console for**:
```
[OCR] Reading image from: ...
[OCR] Image read, base64 length: ...
[OCR] Detected mime type: ...
[OCR] Sending request to Gemini API...
[OCR] Response status: 200
[OCR] Extracted text: PANADOL
```

### 2. **Connected to Supabase Database**

**What Changed**:
- ✅ Installed `@supabase/supabase-js`
- ✅ Created Supabase client with your credentials
- ✅ Updated drugSearch to query real database instead of mock data
- ✅ Added proper error handling

## Testing Checklist

### Step 1: Verify Supabase Table Structure

Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Check if table exists and has correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medications';

-- Check your Panadol data
SELECT * FROM medications WHERE brand_name ILIKE '%panadol%';
```

**Expected columns**:
- `id` (text)
- `brand_name` (text)
- `generic_name` (text)
- `precautions` (text)
- `adverse_effects` (text)
- `counselling` (text)

**If table doesn't exist**, run the SQL in `supabase-setup.sql`

### Step 2: Test Database Connection

Stop Expo and restart with clear cache:

```bash
npx expo start --clear
```

Watch the terminal for logs when you scan:

```
[DrugSearch] Searching for: panadol
[DrugSearch] Found 1 results
```

### Step 3: Test OCR with Different Images

**Test A: Handwritten (your case)**
- Write "PANADOL" clearly on paper
- Good lighting, no shadows
- Take photo and scan

**Test B: Printed Text**
- Open text editor
- Type "PANADOL" in large font (72pt+)
- Take photo of screen
- Scan

**Test C: Real Medicine Package**
- Use actual Panadol box if available
- Focus on brand name
- Scan

## Console Logs to Check

### Success Case:
```
[OCR] Reading image from: file:///...
[OCR] Image read, base64 length: 245678
[OCR] Detected mime type: image/jpeg
[OCR] Sending request to Gemini API...
[OCR] Response status: 200
[OCR] Extracted text: PANADOL
OCR TEXT:
 PANADOL
CANDIDATES: ['panadol']
[DrugSearch] Searching for: panadol
[DrugSearch] Found 1 results
MATCHES COUNT: 1
```

### Failure Cases:

**1. Empty OCR (still happening)**
```
[OCR] Extracted text: 
OCR TEXT:
 
CANDIDATES: []
```
→ **Fix**: Check API key, internet connection, image quality

**2. OCR Works but No Database Match**
```
[OCR] Extracted text: PANADOL
CANDIDATES: ['panadol']
[DrugSearch] Searching for: panadol
[DrugSearch] Found 0 results
```
→ **Fix**: Check Supabase table has data, verify column names

**3. Supabase Error**
```
[DrugSearch] Supabase error: {...}
```
→ **Fix**: Check `.env` credentials, verify table exists

## Common Issues & Fixes

### Issue: Still Getting Empty OCR

**Possible Causes**:
1. **API Key Invalid/Expired**
   ```bash
   # Verify in .env
   EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...
   ```
   - Test at: https://aistudio.google.com/apikey
   - Generate new key if needed

2. **Network Connection**
   - OCR requires internet
   - Check phone/emulator has internet access
   - Try on different network

3. **Image Format Issue**
   - Expo camera might use unexpected format
   - Check console: `[OCR] Detected mime type: ...`
   - Should be image/jpeg or image/png

4. **API Rate Limit**
   - Gemini has 60 requests/minute limit
   - Wait a minute and try again

5. **Image Too Large**
   - Check: `[OCR] Image read, base64 length: ...`
   - If >5MB, might fail
   - Camera takes at quality: 0.8 (should be fine)

### Issue: OCR Works but Database Returns Empty

**Check These**:

1. **Table Name Mismatch**
   ```typescript
   // In drugSearch.ts, verify:
   .from("medications")  // Must match your table name
   ```

2. **Column Names**
   Your Supabase table must have:
   - `brand_name` (not `brandName`)
   - `generic_name` (not `genericName`)
   - `adverse_effects` (not `adverseEffects`)

3. **RLS Policies**
   - Row Level Security might block queries
   - Run in Supabase SQL Editor:
   ```sql
   -- Temporarily disable RLS for testing
   ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
   ```

4. **Data Actually Exists**
   ```sql
   SELECT COUNT(*) FROM medications;
   SELECT * FROM medications LIMIT 5;
   ```

### Issue: App Crashes on Scan

1. **Missing Supabase Package**
   ```bash
   cd mobile
   npm list @supabase/supabase-js
   # Should show version, if not:
   npm install @supabase/supabase-js
   ```

2. **Environment Variables Not Loaded**
   - Stop Expo (Ctrl+C)
   - Restart: `npx expo start --clear`
   - Verify in console: no "Missing EXPO_PUBLIC_..." errors

## Testing Commands

```bash
# Full clean restart
cd mobile
rm -rf node_modules/.cache
npx expo start --clear

# Check installed packages
npm list @supabase/supabase-js
npm list expo-file-system
npm list expo-camera

# Test Supabase connection (create test file)
# See test-supabase.ts below
```

## Manual Supabase Test

Create `mobile/test-supabase.ts`:

```typescript
import { supabase } from "./src/services/supabase";

async function testSupabase() {
  console.log("Testing Supabase connection...");
  
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .limit(5);
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! Found medications:", data);
  }
}

testSupabase();
```

Run:
```bash
npx ts-node test-supabase.ts
```

## Expected Behavior After Fixes

1. **Take photo of "PANADOL" (handwritten or printed)**
2. **Console shows**:
   ```
   [OCR] Extracted text: PANADOL
   [DrugSearch] Searching for: panadol
   [DrugSearch] Found 1 results
   ```
3. **App displays**:
   - "Possible matches" title
   - Debug box shows: OCR text = "PANADOL", Candidates = ["panadol"]
   - List shows: Panadol (Paracetamol)
4. **Tap the medication** → See full details

## Next Steps If Still Not Working

1. **Share Console Output**
   - Copy all `[OCR]` and `[DrugSearch]` logs
   - Look for error messages

2. **Verify Supabase**
   - Go to Supabase dashboard
   - Table Editor → medications
   - Screenshot of table structure and data

3. **Test API Keys**
   - Test Gemini API: https://aistudio.google.com/app/prompts/new_chat
   - Test Supabase: Run query in SQL Editor

4. **Check Image**
   - The image might be too blurry
   - Try printed text on screen instead of handwriting
   - Ensure good lighting

## Quick Debug Script

Add this button to ScanResultsScreen for testing:

```typescript
// Test button - add in ScanResultsScreen
<TouchableOpacity 
  style={styles.button}
  onPress={async () => {
    console.log("=== MANUAL DB TEST ===");
    const results = await searchDrugs("panadol");
    console.log("Manual search results:", results);
  }}
>
  <Text style={styles.buttonText}>Test DB Connection</Text>
</TouchableOpacity>
```

This will test database connection without OCR.

---

## Summary

✅ **Installed**: `@supabase/supabase-js`  
✅ **Created**: Supabase client configuration  
✅ **Updated**: drugSearch.ts to query real database  
✅ **Improved**: OCR prompts for handwriting  
✅ **Added**: Detailed console logging  
✅ **Provided**: SQL setup script  

**Try scanning again and check console logs!**
