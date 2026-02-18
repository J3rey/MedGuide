# 🚀 Render Environment Variable Setup

## Issue
The scanning and medical assistant features aren't working because the backend deployed on Render is missing the `GEMINI_API_KEY` environment variable.

## What Was Fixed
✅ Updated mobile OCR service to call the backend API instead of using stub data
✅ Installed `expo-file-system` dependency for image processing

## ⚠️ CRITICAL: Set Environment Variables on Render

The backend requires environment variables to work properly. Follow these steps:

### 1. Go to Render Dashboard
1. Open https://dashboard.render.com/
2. Find your `medguide-backend` service
3. Click on it to open the service details

### 2. Navigate to Environment Tab
1. Click on **Environment** in the left sidebar
2. You'll see a list of environment variables

### 3. Add/Update These Variables

Make sure these environment variables are set:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `NODE_ENV` | `production` | Already set |
| `SUPABASE_URL` | `https://kzqqeodwdpqlsgvydqyb.supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Your Supabase project anon key (see below) |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google AI Studio API key (see below) |
| `PORT` | `10000` | Set automatically by Render |

### 4. Get Your API Keys

#### Supabase Keys (if not already set)
1. Go to https://supabase.com/dashboard
2. Select your `MedGuide` project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

#### Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **Create API Key**
4. Select your Google Cloud project (or create a new one)
5. Copy the API key → `GEMINI_API_KEY`

**⚠️ IMPORTANT**: Keep your API key secure! Don't share it publicly.

### 5. Save and Redeploy

1. After adding all environment variables, click **Save Changes**
2. Render will automatically redeploy your backend
3. Wait for the deployment to complete (about 2-3 minutes)

### 6. Verify It's Working

Check the logs in Render:
1. Go to **Logs** tab in your Render service
2. Look for these messages:
   ```
   ✅ Server running on port 10000
   🌍 Environment: production
   ```

### 7. Test the Mobile App

1. The mobile app is already configured to use: `https://medguide-p132.onrender.com`
2. Open your mobile app
3. Try scanning a medication or asking the medical assistant a question
4. It should now work!

## Common Issues

### Issue: "GEMINI_API_KEY environment variable is not set"
**Solution**: Make sure you added `GEMINI_API_KEY` in Render's Environment tab and redeployed

### Issue: "OCR processing failed"
**Solution**: 
- Check Render logs for errors
- Verify the Gemini API key is valid and not expired
- Make sure you have quota available in your Google Cloud project

### Issue: Database queries work but AI doesn't
**Solution**: Check if you've exceeded your Gemini API quota. Free tier has limits. Upgrade or wait for quota reset.

### Issue: App shows "Failed to process chat message"
**Solution**: Same as above - likely an API key or quota issue

## Testing Locally

Before deploying, test locally to ensure everything works:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Mobile
cd mobile
npx expo start --clear
```

Make sure your local backend has a `.env` file with:
```env
PORT=3000
SUPABASE_URL=https://kzqqeodwdpqlsgvydqyb.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_key_here
```

## What Changed in the Code

### Mobile App (`mobile/src/services/ocr.ts`)
- ✅ Now calls backend API at `/api/ocr/extract`
- ✅ Sends base64 encoded images
- ✅ Handles errors properly
- ✅ Logs progress for debugging

### Backend (`backend/src/routes/ocr.ts`)
- ✅ Already had OCR endpoint implemented
- ✅ Uses Gemini Vision API for text extraction
- ✅ Returns drug names only (no dosages)

## Status
- ✅ Code updated and committed
- ⏳ **ACTION REQUIRED**: Set environment variables on Render
- ⏳ **PENDING**: Test after Render deployment completes

---

**Need help?** Check the Render logs for detailed error messages.
