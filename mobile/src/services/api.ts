import axios from 'axios';
import i18n from '../i18n/config';
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
  searchMedication: async (
    query: string,
    language?: string
  ): Promise<MedicationInfo[]> => {
    const response = await api.get('/medications/search', {
      params: { q: query, lang: language || i18n.language },
    });
    return response.data;
  },

  getMedicationInfo: async (
    medicationId: string,
    language?: string
  ): Promise<MedicationInfo> => {
    const response = await api.get(`/medications/${medicationId}`, {
      params: { lang: language || i18n.language },
    });
    return response.data;
  },

  sendChatMessage: async (
    message: string,
    language?: string
  ): Promise<ChatResponse> => {
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
