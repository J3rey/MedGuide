# 📸 Camera Scanning - Quick Reference

## 🚀 Start Testing (3 Steps)

```bash
# 1. Navigate to mobile folder
cd mobile

# 2. Start Expo (clear cache)
npx expo start --clear

# 3. Scan QR with Expo Go app
# (or press 'i' for iOS / 'a' for Android simulator)
```

## ✅ What Was Fixed

| Issue | Status |
|-------|--------|
| Import error (`buildCandidates`) | ✅ Fixed |
| TypeScript type errors | ✅ Fixed |
| Missing navigation screens | ✅ Created |
| Limited mock data (2 drugs) | ✅ Expanded to 8 |
| Unicode warnings | ✅ Fixed |

## 🧪 Quick Test

1. **Write on paper**: "Panadol" (large, clear text)
2. **Open app** → Select language → Camera
3. **Grant permissions** when prompted
4. **Take photo** of the paper
5. **Tap Scan** button
6. **Should find**: "Panadol Rapid" and "Paracetamol"

## 📱 Test Medications (Available in Mock DB)

✅ **Will Match**:
- Panadol / Paracetamol
- Nurofen / Ibuprofen
- Aspirin
- Amoxicillin / Amoxil
- Cetirizine / Zyrtec
- Omeprazole / Losec
- Metformin / Glucophage

❌ **Won't Match**:
- Vitamin C
- Unknown drugs
- Anything not in list above

## 🎯 User Flow

```
Language Selection
    ↓
Camera Screen
    ↓
Take Photo → Preview
    ↓
Scan Button
    ↓
[OCR Processing]
    ↓
Scan Results (with debug info)
    ↓
Tap Drug → Details Screen
```

## 🐛 Debug Info Location

In **Scan Results Screen**, check the **gray debug box** for:
- OCR Text (what Gemini read)
- Candidates (search terms generated)

## 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| Permission denied | Check phone settings → App permissions |
| API key error | Restart: `npx expo start --clear` |
| No matches | Try clearer photo with better lighting |
| Camera black screen | Use physical device (not simulator) |
| App won't start | Check all files with `node test-camera-setup.js` |

## 📚 Full Documentation

- **Complete Guide**: [CAMERA_TESTING.md](CAMERA_TESTING.md)
- **Summary**: [CAMERA_SETUP_SUMMARY.md](CAMERA_SETUP_SUMMARY.md)
- **Verify Setup**: Run `node test-camera-setup.js`

## 💡 Pro Tips

✅ **For Best OCR Results**:
- Good lighting
- Clear, focused image
- Text fills frame
- Avoid glare/shadows

✅ **For Testing**:
- Use large text (72pt+)
- Test with known drugs first
- Check debug box if no matches
- Screenshot errors for debugging

## 📁 Key Files Modified

```
mobile/
├── App.tsx                                    (updated)
├── src/
│   ├── screens/
│   │   ├── CameraScreen.tsx                  (existing)
│   │   ├── ScanResultsScreen.tsx             (existing)
│   │   ├── ManualSearchScreen.tsx            (NEW)
│   │   └── DrugDetailsScreen.tsx             (NEW)
│   └── services/
│       ├── ocr.ts                            (existing)
│       ├── matchDrugsFromImage.ts            (fixed)
│       ├── drugSearch.ts                     (enhanced)
│       └── match.ts                          (existing)
```

## ✨ Status: Ready to Test!

All TypeScript errors resolved. All navigation working. Mock data ready. Go test! 🎉
