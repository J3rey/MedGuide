import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { uriToBase64 } from '../utils/uriToBase64';

// Get backend URL from config with platform-specific defaults
const getBackendUrl = () => {
  if (Constants.expoConfig?.extra?.backendUrl) {
    return Constants.expoConfig.extra.backendUrl;
  }

  // Default URLs for different platforms (development fallbacks)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android emulator
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000'; // iOS simulator
  }
  // For web, we need the production URL - localhost won't work
  return 'https://medguide-p132.onrender.com';
};

const API_URL = getBackendUrl();

export async function extractTextFromImage(uri: string): Promise<string> {
  try {
    console.log('[OCR] Processing image:', uri);

    // Read the image file as base64
    const base64 = await uriToBase64(uri);

    console.log('[OCR] Image read, base64 length:', base64.length);
    console.log('[OCR] Sending to backend API...');

    // Send to backend API
    const response = await fetch(`${API_URL}/api/ocr/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[OCR] API error:', errorData);
      throw new Error(errorData.error || `OCR API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OCR] Extracted text:', data.text);

    return data.text || '';
  } catch (error) {
    console.error('[OCR] Error extracting text:', error);
    throw error;
  }
}
