export default {
  expo: {
    name: 'MedGuide',
    slug: 'medguide',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.medguide.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.medguide.app',
    },
    web: {
      favicon: './assets/favicon.png',
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
          icon: './assets/icon.png',
          color: '#3B82F6',
          sounds: ['./assets/notification.wav'],
        },
      ],
    ],
    extra: {
      backendUrl:
        process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000', // For physical device, set to your computer's IP
      supabaseUrl:
        process.env.SUPABASE_URL || 'https://kzqqeodwdpqlsgvydqyb.supabase.co',
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cXFlb2R3ZHBxbHNndnlkcXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODQ5MTQsImV4cCI6MjA3ODI2MDkxNH0.tDYMxOsIlIso-478XVgbP91zt13O3M_j9Xc7PGyzEX4',
    },
  },
};
