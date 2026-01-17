#!/usr/bin/env node

/**
 * Quick Test Script for Camera Scanning Feature
 * 
 * This script helps verify the camera scanning setup is working correctly.
 */

const fs = require('fs');
const path = require('path');

console.log('\n📸 MedGuide Camera Scanning - Setup Verification\n');
console.log('='.repeat(60));

// Check mobile directory
const mobileDir = path.join(__dirname, 'mobile');
if (!fs.existsSync(mobileDir)) {
  console.error('❌ mobile/ directory not found!');
  process.exit(1);
}
console.log('✅ Mobile directory found');

// Check .env file
const envFile = path.join(mobileDir, '.env');
if (!fs.existsSync(envFile)) {
  console.warn('⚠️  .env file not found in mobile/');
  console.log('   Create it with: EXPO_PUBLIC_GEMINI_API_KEY=your-key-here');
} else {
  const envContent = fs.readFileSync(envFile, 'utf8');
  if (envContent.includes('EXPO_PUBLIC_GEMINI_API_KEY')) {
    console.log('✅ Gemini API key configured');
  } else {
    console.warn('⚠️  EXPO_PUBLIC_GEMINI_API_KEY not found in .env');
  }
}

// Check required files
const requiredFiles = [
  'mobile/src/screens/CameraScreen.tsx',
  'mobile/src/screens/ScanResultsScreen.tsx',
  'mobile/src/screens/ManualSearchScreen.tsx',
  'mobile/src/screens/DrugDetailsScreen.tsx',
  'mobile/src/services/ocr.ts',
  'mobile/src/services/matchDrugsFromImage.ts',
  'mobile/src/services/drugSearch.ts',
  'mobile/src/services/match.ts',
  'mobile/App.tsx',
];

console.log('\n📁 Checking required files...');
let allFilesExist = true;
for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.error(`   ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check package.json dependencies
const packageJsonPath = path.join(mobileDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    'expo-camera',
    'expo-file-system',
    '@react-navigation/native',
    '@react-navigation/native-stack',
  ];
  
  console.log('\n📦 Checking dependencies...');
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const dep of requiredDeps) {
    if (deps[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.warn(`   ⚠️  ${dep} - not installed`);
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n✨ Setup verification complete!\n');
console.log('Next steps:');
console.log('1. cd mobile');
console.log('2. npx expo start --clear');
console.log('3. Scan QR code with Expo Go app');
console.log('4. Follow testing guide in CAMERA_TESTING.md\n');
console.log('📖 Full testing guide: CAMERA_TESTING.md');
console.log('🐛 If issues occur, check console logs and debug box in app\n');
