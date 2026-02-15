import axios from 'axios';
import i18n from '../i18n/config';

// Use your local IP or localhost - update this based on your setup
// For Android emulator use 10.0.2.2, for iOS simulator use localhost
// For physical device use your computer's local IP (e.g., 192.168.1.x)
const API_URL = process.env.API_URL || 'http://192.168.1.6:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language;
  return config;
});

export interface MedicationInfo {
  id: string;
  name: string;
  genericName: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export const medicationApi = {
  searchMedication: async (query: string, language?: string): Promise<MedicationInfo[]> => {
    const response = await api.get('/medications/search', {
      params: { q: query, lang: language || i18n.language },
    });
    return response.data;
  },

  getMedicationInfo: async (medicationId: string, language?: string): Promise<MedicationInfo> => {
    const response = await api.get(`/medications/${medicationId}`, {
      params: { lang: language || i18n.language },
    });
    return response.data;
  },

  sendChatMessage: async (message: string, language?: string): Promise<ChatResponse> => {
    const response = await api.post('/chat', {
      message,
      language: language || i18n.language,
    });
    // Backend returns { response: string, language: string, timestamp: string }
    return {
      message: response.data.response || response.data.message,
      suggestions: response.data.suggestions,
    };
  },
};

export default api;
