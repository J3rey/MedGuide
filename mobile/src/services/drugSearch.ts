import { Drug } from '../types/drug';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

const PRIMARY_API_BASE = `${getPrimaryBackendUrl()}/api`;
const LOCAL_API_BASE = `${getLocalBackendUrl()}/api`;

const fetchDrugSearch = (apiBase: string, query: string) =>
  fetch(`${apiBase}/drugs/search?q=${encodeURIComponent(query)}`);

export async function searchDrugs(query: string): Promise<Drug[]> {
  try {
    let res: Response;
    try {
      res = await fetchDrugSearch(PRIMARY_API_BASE, query);
      if (res.status >= 500) {
        res = await fetchDrugSearch(LOCAL_API_BASE, query);
      }
    } catch (error) {
      console.warn('Primary drug search failed, retrying local:', error);
      res = await fetchDrugSearch(LOCAL_API_BASE, query);
    }

    if (!res.ok) {
      // Handle rate limiting
      if (res.status === 429) {
        console.error('Drug search rate limited');
        throw new Error(
          'Too many requests. Please wait a moment and try again.'
        );
      }
      console.error(`Drug search failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data as Drug[];
  } catch (error) {
    console.error('Drug search error:', error);
    // Re-throw rate limit errors so they can be handled by caller
    if (error instanceof Error && error.message.includes('Too many requests')) {
      throw error;
    }
    return [];
  }
}
