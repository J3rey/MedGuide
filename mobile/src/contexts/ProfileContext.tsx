import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Profile, defaultAccessibilitySettings, Relationship } from '../types/models';

// Demo profiles for development
const demoProfiles: Profile[] = [
  {
    id: 'profile-1',
    owner_user_id: 'user-1',
    name: 'Me',
    relationship: 'self',
    preferred_language: 'en',
    accessibility_settings: defaultAccessibilitySettings,
    avatar_color: '#364EFF',
    created_at: new Date().toISOString(),
  },
];

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  addProfile: (profile: Omit<Profile, 'id' | 'owner_user_id' | 'created_at'>) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profiles: [],
  activeProfile: null,
  setActiveProfile: () => {},
  addProfile: () => {},
  updateProfile: () => {},
  deleteProfile: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(demoProfiles);
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(demoProfiles[0]);

  const setActiveProfile = useCallback((profile: Profile) => {
    setActiveProfileState(profile);
  }, []);

  const addProfile = useCallback(
    (profileData: Omit<Profile, 'id' | 'owner_user_id' | 'created_at'>) => {
      const newProfile: Profile = {
        ...profileData,
        id: `profile-${Date.now()}`,
        owner_user_id: 'user-1',
        created_at: new Date().toISOString(),
      };
      setProfiles((prev) => [...prev, newProfile]);
    },
    []
  );

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    setActiveProfileState((prev) =>
      prev && prev.id === id ? { ...prev, ...updates } : prev
    );
  }, []);

  const deleteProfile = useCallback(
    (id: string) => {
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
      setActiveProfile,
      addProfile,
      updateProfile,
      deleteProfile,
    }),
    [profiles, activeProfile, setActiveProfile, addProfile, updateProfile, deleteProfile]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  return useContext(ProfileContext);
}
