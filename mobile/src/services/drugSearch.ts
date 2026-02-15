import { Drug } from '../types/drug';

// Use your local IP - update this based on your setup
// For Android emulator use 10.0.2.2, for iOS simulator use localhost
// For physical device use your computer's local IP
const API_BASE = 'http://192.168.1.6:3000/api';

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
