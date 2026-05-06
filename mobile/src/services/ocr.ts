import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { uriToBase64 } from '../utils/uriToBase64';

const RENDER_BACKEND_URL = 'https://medguide-p132.onrender.com';

const getPrimaryBackendUrl = () =>
  Constants.expoConfig?.extra?.backendUrl || RENDER_BACKEND_URL;

const getLocalBackendUrl = () => {
  if (Constants.expoConfig?.extra?.localBackendUrl) {
    return Constants.expoConfig.extra.localBackendUrl;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android emulator
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000'; // iOS simulator
  }
  return 'http://localhost:3000';
};

const PRIMARY_API_URL = getPrimaryBackendUrl();
const LOCAL_API_URL = getLocalBackendUrl();

const shouldRetryLocally = (response: Response) => response.status >= 500;

const postOcrRequest = async (baseUrl: string, image: string) =>
  fetch(`${baseUrl}/api/ocr/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image }),
  });

export async function extractTextFromImage(uri: string): Promise<string> {
  try {
    console.log('[OCR] Processing image:', uri);

    // Read the image file as base64
    const base64 = await uriToBase64(uri);

    console.log('[OCR] Image read, base64 length:', base64.length);
    console.log('[OCR] Sending to backend API...');

    let response: Response;
    try {
      response = await postOcrRequest(PRIMARY_API_URL, base64);
      if (shouldRetryLocally(response)) {
        response = await postOcrRequest(LOCAL_API_URL, base64);
      }
    } catch (error) {
      console.warn('[OCR] Primary backend failed, retrying local:', error);
      response = await postOcrRequest(LOCAL_API_URL, base64);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[OCR] API error:', errorData);

      // Handle rate limit errors
      if (response.status === 429) {
        throw new Error(
          errorData.message ||
            'Too many requests. Please wait a moment and try again.'
        );
      }

      // Handle other errors
      const errorMsg =
        errorData.message ||
        errorData.error ||
        `OCR API error: ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('[OCR] Extracted text:', data.text);

    return data.text || '';
  } catch (error) {
    console.error('[OCR] Error extracting text:', error);
    throw error;
  }
}
