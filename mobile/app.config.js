export default {
  expo: {
    name: 'MedGuide',
    slug: 'medguide',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.medguide.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#ffffff',
      },
      package: 'com.medguide.app',
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow MedGuide to access your camera to scan prescriptions.',
        },
      ],
      [
        'expo-notifications',
        {
          color: '#3B82F6',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '39383a77-2c35-4319-8692-41d25a0cbe44',
      },
      backendUrl:
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        'https://medguide-p132.onrender.com',
      supabaseUrl:
        process.env.SUPABASE_URL || 'https://kzqqeodwdpqlsgvydqyb.supabase.co',
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cXFlb2R3ZHBxbHNndnlkcXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODQ5MTQsImV4cCI6MjA3ODI2MDkxNH0.tDYMxOsIlIso-478XVgbP91zt13O3M_j9Xc7PGyzEX4',
    },
  },
};
