# Web Camera Troubleshooting Guide

## Issue: Camera Works on Expo but Not on Vercel

The camera functionality uses `navigator.mediaDevices.getUserMedia()` which has strict browser security requirements that differ from Expo's mobile environment.

## Common Causes & Solutions

### 1. HTTPS Requirement ✅ CRITICAL
**Problem**: Browsers block camera access on non-HTTPS sites (except localhost).

**Check**:
- Open your Vercel site in browser
- Look at the URL bar - does it show `https://` with a lock icon?
- Open Browser Console (F12) and check for errors like:
  ```
  NotAllowedError: Permission denied
  getUserMedia() requires HTTPS
  ```

**Solution**:
- Vercel automatically provides HTTPS
- Always access your site via `https://your-app.vercel.app`
- Never use `http://` 

### 2. Browser Permissions 🔒
**Problem**: User denied camera permission or browser blocked it.

**Check**:
- Click the lock/info icon in browser address bar
- Check if camera permission is set to "Block" or "Denied"
- Open Browser Console for errors like:
  ```
  NotAllowedError: Permission denied by user
  ```

**Solution**:
- Click the lock icon → Site settings → Camera → Allow
- Or: Browser Settings → Privacy & Security → Camera → Allow your site
- Refresh the page and try again

### 3. Browser Compatibility 🌐
**Problem**: Some browsers don't support camera access or have stricter requirements.

**Supported Browsers**:
- ✅ Chrome/Edge (Chromium) - Best support
- ✅ Firefox - Good support  
- ✅ Safari (iOS/macOS) - Good support
- ❌ Older browsers - May not work

**Check**:
- Test in Chrome first (most reliable)
- Update browser to latest version
- Check if `navigator.mediaDevices` exists in console

### 4. Mixed Content Warnings ⚠️
**Problem**: HTTPS page loading HTTP resources blocks camera.

**Check**:
- Open Browser Console
- Look for "Mixed Content" warnings
- Check if API calls are using `http://` instead of `https://`

**Solution**:
- Ensure all resources (images, scripts, API calls) use HTTPS
- Check `backendUrl` in app.json uses `https://`

### 5. Iframe Restrictions 🖼️
**Problem**: If embedded in iframe, camera may be blocked.

**Check**:
- Are you testing in an iframe or embedded view?
- Check console for iframe-related errors

**Solution**:
- Test directly at `https://your-app.vercel.app` (not in iframe)
- If iframe needed, add `allow="camera"` attribute

### 6. iOS Safari Specific Issues 📱
**Problem**: iOS Safari has additional restrictions.

**Solutions**:
- Must use Safari (not Chrome or Firefox on iOS)
- Require user gesture (button click) before camera access - ✅ Already implemented
- Video element needs `playsinline` attribute - ✅ Already implemented

## Testing Checklist

1. **Access via HTTPS**
   ```
   ✅ https://your-app.vercel.app
   ❌ http://your-app.vercel.app
   ```

2. **Check Browser Console**
   ```
   Press F12 → Console tab
   Look for getUserMedia errors
   ```

3. **Test Permission Flow**
   ```
   1. Click "Open Camera" button
   2. Browser shows permission prompt
   3. Click "Allow"
   4. Video feed should appear
   ```

4. **Check Network Tab**
   ```
   F12 → Network tab
   Look for failed requests (red)
   Check if any use http:// instead of https://
   ```

## Updated Error Messages

The camera screen now shows detailed error messages including:
- Browser compatibility issues
- HTTPS requirement violations
- Specific error details for debugging

## How to Debug

### Step 1: Open Browser Console
```javascript
// Paste this in console to test camera support
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Camera access works!');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error('❌ Camera error:', err.name, err.message);
  });
```

### Step 2: Check Security Context
```javascript
// Paste this in console
console.log('Protocol:', location.protocol);
console.log('Hostname:', location.hostname);
console.log('Has getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
```

Expected output on Vercel:
```
Protocol: https:
Hostname: your-app.vercel.app
Has getUserMedia: true
```

### Step 3: Check Permissions
```javascript
// Check permission state (Chrome/Edge only)
navigator.permissions.query({ name: 'camera' })
  .then(result => console.log('Camera permission:', result.state))
  .catch(err => console.log('Permission API not supported'));
```

## Common Error Messages

### "NotAllowedError: Permission denied"
- **Cause**: User denied permission or HTTPS required
- **Fix**: Allow camera permission & use HTTPS

### "NotFoundError: Requested device not found"
- **Cause**: No camera connected or camera in use
- **Fix**: Check camera hardware, close other apps using camera

### "NotReadableError: Could not start video source"
- **Cause**: Camera hardware error or in use by another app
- **Fix**: Restart browser or device

### "TypeError: Cannot read property 'getUserMedia'"
- **Cause**: Old browser doesn't support camera API
- **Fix**: Update browser or use Chrome

## Vercel Deployment Checklist

✅ Site accessible via HTTPS
✅ Camera permission prompt appears
✅ No mixed content warnings
✅ Backend API uses HTTPS
✅ Tested in Chrome, Firefox, Safari
✅ Mobile iOS Safari tested
✅ Error messages display properly

## Need More Help?

1. Share the exact error message from browser console
2. Share the browser name and version
3. Share the Vercel URL
4. Share screenshot of console errors

## Changes Made

Updated [CameraScreen.tsx](mobile/src/screens/CameraScreen.tsx):
- Added HTTPS requirement check
- Added browser compatibility check
- Replaced React Native Alert with web-friendly alerts
- Added detailed error messages
- Improved error logging
