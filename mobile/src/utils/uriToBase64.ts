import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export async function uriToBase64(uri: string): Promise<string> {
  // If it's already a data URL, just extract the base64 part
  if (uri.startsWith('data:')) {
    console.log(
      '[uriToBase64] URI is already a data URL, extracting base64 portion'
    );
    const base64 = uri.split(',')[1];
    if (!base64) {
      throw new Error('Invalid data URL format');
    }
    return base64;
  }

  if (Platform.OS === 'web') {
    console.log('[uriToBase64] Fetching blob URL:', uri);
    try {
      const res = await fetch(uri);
      if (!res.ok) {
        throw new Error(`Failed to fetch blob: ${res.status} ${res.statusText}`);
      }
      const blob = await res.blob();
      console.log('[uriToBase64] Blob fetched, size:', blob.size, 'type:', blob.type);

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string; // data:image/...;base64,xxxx
          const base64 = dataUrl.split(',')[1];
          if (!base64) {
            reject(new Error('Failed to extract base64 from data URL'));
            return;
          }
          console.log('[uriToBase64] Successfully converted to base64, length:', base64.length);
          resolve(base64);
        };
        reader.onerror = () =>
          reject(new Error('Failed to read blob as base64'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('[uriToBase64] Error processing blob URL:', error);
      throw error;
    }
  }

  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}
