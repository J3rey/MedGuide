import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export async function uriToBase64(uri: string): Promise<string> {
  // If it's already a data URL, just extract the base64 part
  if (uri.startsWith('data:')) {
    console.log('[uriToBase64] URI is already a data URL, extracting base64 portion');
    const base64 = uri.split(',')[1];
    if (!base64) {
      throw new Error('Invalid data URL format');
    }
    return base64;
  }

  if (Platform.OS === 'web') {
    console.log('[uriToBase64] Fetching blob URL or file path:', uri.substring(0, 50));
    const res = await fetch(uri);
    const blob = await res.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string; // data:image/...;base64,xxxx
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file as base64'));
      reader.readAsDataURL(blob);
    });
  }

  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}
