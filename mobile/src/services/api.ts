import axios from 'axios';
import i18n from '../i18n/config';
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

const PRIMARY_API_URL = getPrimaryBackendUrl();
const LOCAL_API_URL = getLocalBackendUrl();

const createApiClient = (baseUrl: string) =>
  axios.create({
    baseURL: `${baseUrl}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const api = createApiClient(PRIMARY_API_URL);
const localApi = createApiClient(LOCAL_API_URL);

const attachLanguageHeader = (client: typeof api) => {
  client.interceptors.request.use((config) => {
    config.headers['Accept-Language'] = i18n.language;
    return config;
  });
};

attachLanguageHeader(api);
attachLanguageHeader(localApi);

const shouldRetryLocally = (error: unknown) =>
  axios.isAxiosError(error) &&
  (!error.response || error.response.status >= 500);

const shouldRetryStaleChatResponse = (
  message: string,
  medications?: string[]
) => {
  if (!medications?.length) return false;

  const responseLower = message.toLowerCase();
  return (
    responseLower.includes('not available in our database') ||
    responseLower.includes("don't have information about that medication")
  );
};

const postChatMessage = async (body: {
  message: string;
  language: string;
  medications?: string[];
}) => {
  try {
    const response = await api.post('/chat', body);
    const responseMessage =
      response.data.response || response.data.message || '';

    if (shouldRetryStaleChatResponse(responseMessage, body.medications)) {
      try {
        return await localApi.post('/chat', body);
      } catch (fallbackError) {
        console.warn('Local chat fallback failed:', fallbackError);
      }
    }

    return response;
  } catch (error) {
    if (shouldRetryLocally(error)) {
      return localApi.post('/chat', body);
    }
    throw error;
  }
};

const getWithFallback = async (
  path: string,
  config?: Parameters<typeof api.get>[1]
) => {
  try {
    return await api.get(path, config);
  } catch (error) {
    if (shouldRetryLocally(error)) {
      return localApi.get(path, config);
    }
    throw error;
  }
};

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
    const response = await getWithFallback('/medications/search', {
      params: { q: query, lang: language || i18n.language },
    });
    return response.data;
  },

  getMedicationInfo: async (
    medicationId: string,
    language?: string
  ): Promise<MedicationInfo> => {
    const response = await getWithFallback(`/medications/${medicationId}`, {
      params: { lang: language || i18n.language },
    });
    return response.data;
  },

  sendChatMessage: async (
    message: string,
    language?: string,
    medications?: string[]
  ): Promise<ChatResponse> => {
    const response = await postChatMessage({
      message,
      language: language || i18n.language,
      medications,
    });
    // Backend returns { response: string, language: string, timestamp: string }
    return {
      message: response.data.response || response.data.message,
      suggestions: response.data.suggestions,
    };
  },
};

export default api;
