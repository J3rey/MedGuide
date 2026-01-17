# Camera Scanning Feature - Testing Guide

## 📸 Overview
The camera scanning feature allows users to take photos of medicine labels/packages and extracts medication names using OCR (Gemini Vision API).

## ✅ Fixed Issues
1. **Import Error**: Fixed `buildCandidates` import path (was `./buildCandidates`, now correctly `./match`)
2. **Type Error**: Added explicit type annotation for filter callback parameter
3. **Missing Screens**: Added `ManualSearchScreen` and `DrugDetailsScreen` placeholders
4. **Navigation**: Integrated all screens into App.tsx navigation stack
5. **Mock Data**: Enhanced drug database with 8 medications for better testing

## 🛠️ Testing Setup

### Prerequisites
- Gemini API key is already configured in `.env`
- All dependencies installed (`expo-camera`, `expo-file-system`, etc.)
- Camera permissions will be requested on first use

### Start the App
```bash
cd mobile
npx expo start --clear
```

## 🧪 Test Cases

### Test 1: Camera Permissions
1. Launch app → Select language → Navigate to Camera screen
2. **Expected**: Permission prompt appears
3. **Action**: Grant camera permission
4. **Expected**: Camera view appears with circular shutter button

### Test 2: Take Photo
1. Point camera at any text (medicine label, book, etc.)
2. Tap the circular shutter button
3. **Expected**: Photo preview appears with "Retake" and "Scan" buttons
4. **Action**: Tap "Retake" 
5. **Expected**: Returns to camera view
6. Take another photo and tap "Scan"

### Test 3: OCR Processing (Real Medication Names)
Create test images with these medication names written on paper:

**Easy Test (should match):**
- Write "Panadol" or "Paracetamol" clearly
- Take photo and scan
- **Expected**: Matches "Panadol Rapid" and/or "Paracetamol"

**Medium Test (should match):**
- Write "Nurofen" or "Ibuprofen"
- **Expected**: Matches "Nurofen (Ibuprofen)"

**Hard Test (partial match):**
- Write "Aspirin"
- **Expected**: Matches "Aspirin (Acetylsalicylic Acid)"

**No Match Test:**
- Write "Vitamin C" or "Unknown Drug"
- **Expected**: "No matches found" message

### Test 4: Scan Results Screen

**When matches found:**
- ✅ Loading indicator appears briefly
- ✅ Title shows "Possible matches"
- ✅ Debug box shows OCR text and candidates
- ✅ List of matched drugs appears
- ✅ Each drug shows Brand Name and Generic Name
- ✅ "Retry scan" button returns to camera
- ✅ "Manual search" button navigates to placeholder screen

**When no matches:**
- ✅ Title shows "No matches found"
- ✅ Helpful message suggests retrying or manual search
- ✅ Both action buttons work correctly

### Test 5: Drug Details
1. From scan results, tap any medication
2. **Expected**: 
   - Drug details screen opens
   - Shows brand name, generic name
   - Shows precautions, adverse effects, counselling (if available)
   - Back button works

### Test 6: Navigation Flow
Complete flow test:
```
Language Selection → Camera → Take Photo → Scan → 
Results → Drug Details → Back → Retry → Camera
```

## 🐛 Debug Information

### OCR Debug Box
The scan results screen includes a debug box showing:
- **OCR Text**: Raw text extracted by Gemini Vision API
- **Candidates**: Processed search terms sent to database

This helps you understand:
- If OCR is working correctly
- What search terms are being generated
- Why a match succeeded or failed

### Console Logs
Check terminal/console for:
```
OCR TEXT: (shows extracted text)
CANDIDATES: (shows search terms)
MATCHES COUNT: (number of drugs found)
```

## 📝 Testing Checklist

- [ ] Camera permission granted
- [ ] Camera preview works
- [ ] Take photo works
- [ ] Photo preview displays correctly
- [ ] Retake button works
- [ ] Scan button triggers OCR
- [ ] Loading indicator appears during processing
- [ ] OCR extracts text (check debug box)
- [ ] Candidates generated correctly
- [ ] Matches appear for known drugs
- [ ] No matches message for unknown drugs
- [ ] Can tap drug to see details
- [ ] Drug details screen shows all information
- [ ] Back navigation works
- [ ] Retry scan returns to camera
- [ ] Manual search placeholder works

## 🎯 Current Limitations

### Mock Database
Currently using **8 mock medications**:
1. Panadol Rapid (Paracetamol)
2. Paracetamol
3. Nurofen (Ibuprofen)
4. Aspirin (Acetylsalicylic Acid)
5. Amoxil (Amoxicillin)
6. Zyrtec (Cetirizine)
7. Losec (Omeprazole)
8. Glucophage (Metformin)

**To test successfully**: Use these exact brand names or generic names when creating test images.

### OCR Accuracy Tips
For best results:
- ✅ Good lighting (natural light or bright room)
- ✅ Clear, focused image
- ✅ Text fills most of frame
- ✅ Minimal glare or shadows
- ❌ Avoid blurry images
- ❌ Avoid extreme angles
- ❌ Avoid dark/low-light conditions

## 🔧 Troubleshooting

### "Missing EXPO_PUBLIC_GEMINI_API_KEY" error
- Check `.env` file exists in `mobile/` directory
- Restart Expo with: `npx expo start --clear`
- API key is already configured, this shouldn't happen

### Camera not working
- Check permissions in phone settings
- Try restarting app
- On iOS simulator, camera won't work (use physical device)

### No matches found (but should match)
1. Check debug box OCR text - is it correct?
2. Check candidates - do they include drug name?
3. Verify drug name is in mock database (see list above)
4. Try taking clearer photo with better lighting

### App crashes on scan
1. Check terminal for error messages
2. Verify internet connection (Gemini API needs network)
3. Check API key is valid
4. Look for TypeScript errors in console

## 🚀 Next Steps

### For Production:
1. **Replace mock database** with real Supabase/FDA database
2. **Remove debug box** from ScanResultsScreen
3. **Add error tracking** (Sentry, etc.)
4. **Implement manual search** screen functionality
5. **Add scan history** storage
6. **Optimize OCR prompts** for better accuracy
7. **Add loading states** improvements
8. **Implement retry logic** for failed API calls

### Suggested Improvements:
- Add image cropping before OCR
- Allow multiple photos per scan
- Cache OCR results
- Add confidence scores to matches
- Implement fuzzy matching
- Add "Report incorrect match" button
- Save successful scans to history

## 📊 Success Criteria

Camera scanning feature is working correctly if:
1. ✅ Photos can be taken and previewed
2. ✅ OCR extracts visible text from images
3. ✅ Known medications are matched correctly
4. ✅ Results screen displays matches clearly
5. ✅ Navigation between screens works smoothly
6. ✅ Error states are handled gracefully
7. ✅ Debug information helps troubleshoot issues

---

## 💡 Testing Tips

**Create Test Images:**
```
1. Open Notes app or text editor
2. Type medication name in large font (size 72+)
3. Take photo of screen
4. Use for testing
```

**Quick Test Sequence:**
1. Test "Panadol" (should find 1 match)
2. Test "Paracetamol" (should find 2 matches)
3. Test "Ibuprofen" (should find 1 match)
4. Test "XYZ123" (should find 0 matches)

**Check Each Component:**
- ✅ Camera capture
- ✅ OCR text extraction
- ✅ Candidate generation
- ✅ Database search
- ✅ Results display
- ✅ Navigation flow
