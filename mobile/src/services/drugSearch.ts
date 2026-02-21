import { Drug } from '../types/drug';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

const BACKEND_URL = getBackendUrl();
const API_BASE = `${BACKEND_URL}/api`;

export async function searchDrugs(query: string): Promise<Drug[]> {
  try {
    const url = `${API_BASE}/drugs/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Drug search failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data as Drug[];
  } catch (error) {
    console.error('Drug search error:', error);
    return [];
  }
}
