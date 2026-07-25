const getApiUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return 'http://192.168.178.111:3000/api';
};

export const APP_CONFIG = {
  name: 'Stempo',
  version: '1.0.0',
  apiUrl: getApiUrl(),
  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  },
  storageKeys: {
    appState: 'stempo-app-storage',
    authToken: 'stempo-auth-token',
  },
} as const;

