import axios from 'axios';
import i18n from '../i18n/config';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  CaregiverPermissions,
  CaregiverRole,
  EmergencyContact,
  Pharmacy,
  Profile,
} from '../types/models';

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
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export const getAppUserId = () =>
  Constants.expoConfig?.extra?.userId || DEFAULT_USER_ID;

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
    config.headers['x-user-id'] = getAppUserId();
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

const postWithFallback = async (
  path: string,
  data?: unknown,
  config?: Parameters<typeof api.post>[2]
) => {
  try {
    return await api.post(path, data, config);
  } catch (error) {
    if (shouldRetryLocally(error)) {
      return localApi.post(path, data, config);
    }
    throw error;
  }
};

const putWithFallback = async (
  path: string,
  data?: unknown,
  config?: Parameters<typeof api.put>[2]
) => {
  try {
    return await api.put(path, data, config);
  } catch (error) {
    if (shouldRetryLocally(error)) {
      return localApi.put(path, data, config);
    }
    throw error;
  }
};

const deleteWithFallback = async (
  path: string,
  config?: Parameters<typeof api.delete>[1]
) => {
  try {
    return await api.delete(path, config);
  } catch (error) {
    if (shouldRetryLocally(error)) {
      return localApi.delete(path, config);
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

export const profileApi = {
  listProfiles: async (): Promise<Profile[]> => {
    const response = await getWithFallback('/profiles');
    return response.data.profiles || [];
  },

  createProfile: async (
    profile: Omit<Profile, 'id' | 'owner_user_id' | 'created_at'>
  ): Promise<Profile> => {
    const response = await postWithFallback('/profiles', profile);
    return response.data.profile;
  },

  updateProfile: async (
    id: string,
    updates: Partial<Profile>
  ): Promise<Profile> => {
    const response = await putWithFallback(`/profiles/${id}`, updates);
    return response.data.profile;
  },

  deleteProfile: async (id: string): Promise<void> => {
    await deleteWithFallback(`/profiles/${id}`);
  },
};

export const pharmacyApi = {
  listPharmacies: async (profileId: string): Promise<Pharmacy[]> => {
    const response = await getWithFallback(`/profiles/${profileId}/pharmacies`);
    return response.data.pharmacies || [];
  },

  createPharmacy: async (
    profileId: string,
    pharmacy: Omit<Pharmacy, 'id' | 'profile_id' | 'created_at'>
  ): Promise<Pharmacy> => {
    const response = await postWithFallback(
      `/profiles/${profileId}/pharmacies`,
      pharmacy
    );
    return response.data.pharmacy;
  },

  deletePharmacy: async (id: string): Promise<void> => {
    await deleteWithFallback(`/pharmacies/${id}`);
  },
};

export const emergencyContactApi = {
  listContacts: async (profileId: string): Promise<EmergencyContact[]> => {
    const response = await getWithFallback(
      `/profiles/${profileId}/emergency-contacts`
    );
    return response.data.contacts || [];
  },

  createContact: async (
    profileId: string,
    contact: Omit<EmergencyContact, 'id' | 'profile_id' | 'created_at'>
  ): Promise<EmergencyContact> => {
    const response = await postWithFallback(
      `/profiles/${profileId}/emergency-contacts`,
      contact
    );
    return response.data.contact;
  },

  deleteContact: async (id: string): Promise<void> => {
    await deleteWithFallback(`/emergency-contacts/${id}`);
  },
};

export interface CaregiverInviteResponse {
  invite_code: string;
}

export interface CaregiverPatient {
  id: string;
  profile_id: string;
  role: CaregiverRole;
  permissions: CaregiverPermissions;
  profiles: Pick<Profile, 'id' | 'name' | 'relationship' | 'avatar_color'>;
  status?: {
    medicationsTaken: number;
    medicationsTotal: number;
    missedCount: number;
    lastCheckIn: string;
    hasEmergencyAlert: boolean;
    phone?: string;
  };
}

export const caregiverApi = {
  inviteCaregiver: async (
    profileId: string,
    invite: {
      role: CaregiverRole;
      email?: string;
      permissions?: CaregiverPermissions;
    }
  ): Promise<CaregiverInviteResponse> => {
    const response = await postWithFallback(
      `/profiles/${profileId}/caregivers/invite`,
      invite
    );
    return { invite_code: response.data.invite_code };
  },

  acceptInvite: async (inviteCode: string) => {
    const response = await postWithFallback('/caregivers/accept-invite', {
      invite_code: inviteCode,
    });
    return response.data.caregiver;
  },

  listMyPatients: async (): Promise<CaregiverPatient[]> => {
    const response = await getWithFallback('/caregivers/my-patients');
    return response.data.patients || [];
  },
};

export default api;
