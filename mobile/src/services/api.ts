import axios, { AxiosError } from 'axios';
import i18n from '../i18n/config';

const API_URL = process.env.API_URL || 'http://192.168.1.11:3000';

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
    return response.data;
  },
};

export default api;
