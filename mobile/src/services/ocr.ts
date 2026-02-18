import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get backend URL from config with platform-specific defaults
const getBackendUrl = () => {
  if (Constants.expoConfig?.extra?.backendUrl) {
    return Constants.expoConfig.extra.backendUrl;
  }

  // Default URLs for different platforms
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android emulator
  }
  return 'http://localhost:3000'; // iOS simulator, web
};

const API_URL = getBackendUrl();

export async function extractTextFromImage(uri: string): Promise<string> {
  try {
    console.log('[OCR] Processing image:', uri);

    // Read the image file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

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
