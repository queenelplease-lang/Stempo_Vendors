import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { APP_CONFIG } from '@/constants/config';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: APP_CONFIG.google.webClientId,
    iosClientId: APP_CONFIG.google.iosClientId,
    androidClientId: APP_CONFIG.google.androidClientId,
  });

  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    if (!request) {
      throw new Error('Google Sign-In is not configured');
    }

    const result = await promptAsync();

    if (result.type === 'success') {
      const idToken =
        result.params.id_token ??
        result.authentication?.idToken ??
        null;

      if (!idToken) {
        throw new Error('Google Sign-In did not return an ID token');
      }

      return idToken;
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return null;
    }

    throw new Error('Google Sign-In failed');
  }, [promptAsync, request]);

  return {
    signInWithGoogle,
    isReady: !!request && !!APP_CONFIG.google.webClientId,
  };
}
