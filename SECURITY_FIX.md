# 🚨 CRITICAL SECURITY FIX - API Key Leak Resolution

## What Happened

Your Gemini API key `AIzaSyB4Ad46m4epzoVblnQ5TtvRpZXZPnsA5rc` was **hardcoded** in multiple files and exposed publicly, causing Google to flag it as leaked.

## Files That Had the Leaked Key

1. `mobile/app.json` - Hardcoded in extra config ❌
2. `mobile/src/services/ocr.ts` - Hardcoded as fallback ❌
3. `backend/.env` - Likely committed to git ❌

## What Was Fixed

✅ **Removed all hardcoded API keys from mobile app**
✅ **Created secure backend OCR endpoint** (`backend/src/routes/ocr.ts`)
✅ **Mobile app now calls backend API instead of Gemini directly**
✅ **Updated .gitignore to prevent future leaks**

## Architecture Changes

### Before (INSECURE):
```
Mobile App → Gemini API (with exposed key)
```

### After (SECURE):
```
Mobile App → Your Backend → Gemini API (key stays on server)
```

## IMMEDIATE ACTIONS REQUIRED

### 1. Revoke the Leaked Key (DO THIS NOW)
1. Go to https://aistudio.google.com/app/apikey
2. Find the key ending in `...nsA5rc`
3. **DELETE IT IMMEDIATELY**

### 2. Create a New API Key
1. Click "Create API Key"
2. Copy the new key (looks like `AIzaSy...`)
3. **NEVER share or commit this key**

### 3. Update Backend .env
```bash
cd C:\MedGuide\MedGuide\backend
notepad .env
```

Update the line:
```env
GEMINI_API_KEY=YOUR_NEW_KEY_HERE
```

### 4. Ensure .env is NOT Committed
```powershell
# Check if .env is tracked by git
git ls-files backend/.env

# If it shows output, remove it from git:
git rm --cached backend/.env
git commit -m "Remove .env from git tracking"
```

### 5. Update Mobile App Backend URL
In `mobile/app.json`, update the backend URL for your environment:
```json
"extra": {
  "backendUrl": "http://localhost:3000",  // For development
  // or "http://YOUR_SERVER_IP:3000" for production
  ...
}
```

### 6. Restart Backend Server
```powershell
cd C:\MedGuide\MedGuide\backend
npm run dev
```

### 7. Test the Fix
```powershell
cd C:\MedGuide\MedGuide\mobile
npx expo start -c
```

Take a photo in the app - it should now work through the backend.

## Why This Happened

### The Problem with Client-Side API Keys:
- Mobile apps can be **decompiled** - anyone can extract hardcoded keys
- Git repositories are often **public** - keys get exposed
- Even in private repos, **git history** preserves old commits with keys

### The Secure Solution:
- API keys live **only on your backend server**
- Mobile app **never sees** the API key
- Backend validates requests and proxies to Gemini
- If key needs to change, only update backend (no app redeployment)

## Security Best Practices Going Forward

### ✅ DO:
- Keep API keys in `.env` files on the backend only
- Add `.env` to `.gitignore`
- Use environment variables
- Proxy API calls through your backend
- Rotate keys regularly

### ❌ DON'T:
- Hardcode API keys anywhere in code
- Commit `.env` files to git
- Put API keys in `app.json` or mobile code
- Share API keys in documentation
- Use the same key in multiple environments

## Files Modified

1. **`backend/src/routes/ocr.ts`** (NEW) - Secure OCR endpoint
2. **`backend/src/index.ts`** - Registered OCR route
3. **`mobile/src/services/ocr.ts`** - Updated to call backend
4. **`mobile/app.json`** - Removed hardcoded API key
5. **`.gitignore`** - Enhanced to prevent API key commits
6. **`backend/package.json`** - Added multer for file uploads

## Testing the Fix

### 1. Check Backend is Running:
```powershell
curl http://localhost:3000/health
# Should return: {"status":"ok","message":"MedGuide API is running"}
```

### 2. Test OCR Endpoint:
The endpoint is `/api/ocr` and accepts POST with multipart/form-data containing an image file.

### 3. Test Mobile App:
- Open the app
- Go to Camera screen
- Take a photo of medication
- Should work without "API key leaked" error

## If You Still See the Error

1. **Clear Expo cache**: `npx expo start -c`
2. **Verify backend URL**: Check `mobile/app.json` has correct `backendUrl`
3. **Check backend is running**: Should see "Server running on port 3000"
4. **Verify new API key**: Must have revoked old key and created new one
5. **Check logs**: Look at both mobile console and backend terminal

## Long-Term Security

Consider implementing:
- API rate limiting on backend
- User authentication (so only your app can call your backend)
- HTTPS/TLS encryption
- API key rotation schedule
- Monitoring and alerts for unusual API usage

---

**Remember**: API keys in client-side code = PUBLIC keys. Always use a backend proxy.
