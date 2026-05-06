import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { Profile, defaultAccessibilitySettings } from '../types/models';
import { getAppUserId, profileApi } from '../services/api';

const createFallbackProfile = (): Profile => ({
  id: 'profile-local-fallback',
  owner_user_id: getAppUserId(),
  name: 'Me',
  relationship: 'self',
  preferred_language: 'en',
  accessibility_settings: defaultAccessibilitySettings,
  avatar_color: '#364EFF',
  created_at: new Date().toISOString(),
});

const demoProfiles: Profile[] = [createFallbackProfile()];

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfiles: () => Promise<void>;
  setActiveProfile: (profile: Profile) => void;
  addProfile: (
    profile: Omit<Profile, 'id' | 'owner_user_id' | 'created_at'>
  ) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profiles: [],
  activeProfile: null,
  isLoading: false,
  error: null,
  refreshProfiles: async () => {},
  setActiveProfile: () => {},
  addProfile: async () => {},
  updateProfile: async () => {},
  deleteProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(demoProfiles);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(
    demoProfiles[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let nextProfiles = await profileApi.listProfiles();

      if (nextProfiles.length === 0) {
        const defaultProfile = await profileApi.createProfile({
          name: 'Me',
          relationship: 'self',
          preferred_language: 'en',
          accessibility_settings: defaultAccessibilitySettings,
          avatar_color: '#364EFF',
        });
        nextProfiles = [defaultProfile];
      }

      setProfiles(nextProfiles);
      setActiveProfileState((current) => {
        if (!current) return nextProfiles[0] || null;
        return (
          nextProfiles.find((profile) => profile.id === current.id) ||
          nextProfiles[0] ||
          null
        );
      });
    } catch (loadError) {
      console.warn('Failed to load profiles from API:', loadError);
      setError('Using local profile data because the backend is unavailable.');
      setProfiles((current) => (current.length > 0 ? current : demoProfiles));
      setActiveProfileState((current) => current || demoProfiles[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const setActiveProfile = useCallback((profile: Profile) => {
    setActiveProfileState(profile);
  }, []);

  const addProfile = useCallback(
    async (
      profileData: Omit<Profile, 'id' | 'owner_user_id' | 'created_at'>
    ) => {
      const createdProfile = await profileApi.createProfile(profileData);
      setProfiles((prev) => [...prev, createdProfile]);
      setActiveProfileState(createdProfile);
    },
    []
  );

  const updateProfile = useCallback(
    async (id: string, updates: Partial<Profile>) => {
      const updatedProfile = await profileApi.updateProfile(id, updates);
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? updatedProfile : p))
      );
      setActiveProfileState((prev) =>
        prev && prev.id === id ? updatedProfile : prev
      );
    },
    []
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      await profileApi.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (activeProfile?.id === id) {
        setActiveProfileState(profiles.find((p) => p.id !== id) || null);
      }
    },
    [activeProfile, profiles]
  );

  const value = useMemo(
    () => ({
      profiles,
      activeProfile,
      isLoading,
      error,
      refreshProfiles: loadProfiles,
      setActiveProfile,
      addProfile,
      updateProfile,
      deleteProfile,
    }),
    [
      profiles,
      activeProfile,
      isLoading,
      error,
      loadProfiles,
      setActiveProfile,
      addProfile,
      updateProfile,
      deleteProfile,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfiles() {
  return useContext(ProfileContext);
}
