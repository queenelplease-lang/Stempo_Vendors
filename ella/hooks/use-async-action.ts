import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppDispatch } from '@/lib/store';
import { AsyncThunk } from '@reduxjs/toolkit';
import i18n from '@/lib/i18n';

interface UseAsyncActionOptions {
  showSuccessFeedback?: boolean;
  showErrorAlert?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for handling async Redux actions with error handling and feedback
 */
export function useAsyncAction() {
  const execute = useCallback(
    async <T, P>(
      dispatch: AppDispatch,
      action: AsyncThunk<T, P, { rejectValue: string }>,
      params: P,
      options: UseAsyncActionOptions = {}
    ): Promise<T | null> => {
      const {
        showSuccessFeedback = false,
        showErrorAlert = true,
        onSuccess,
        onError,
      } = options;

      try {
        const result = await dispatch(action(params as P & undefined)).unwrap();

        if (showSuccessFeedback && Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        onSuccess?.();
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (showErrorAlert) {
          Alert.alert(i18n.t('common.error'), errorMessage);
        }

        onError?.(errorMessage);
        return null;
      }
    },
    []
  );

  return { execute };
}
