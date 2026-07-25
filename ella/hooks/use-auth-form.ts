import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { VALIDATION_RULES } from '@/constants/validation';
import { useTranslation } from '@/hooks/use-translation';

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

type ErrorKey = keyof ValidationErrors;

export function useAuthForm() {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<ValidationErrors>({});

  const setError = useCallback((key: ErrorKey, message: string | undefined) => {
    setErrors((prev) => {
      if (prev[key] === message) return prev;
      const next = { ...prev };
      if (message === undefined) {
        delete next[key];
      } else {
        next[key] = message;
      }
      return next;
    });
  }, []);

  const validateEmail = useCallback(
    (email: string): boolean => {
      const trimmed = email.trim();
      if (!trimmed) {
        setError('email', t('errors.required'));
        return false;
      }
      if (!VALIDATION_RULES.EMAIL_REGEX.test(trimmed)) {
        setError('email', t('errors.invalidEmail'));
        return false;
      }
      setError('email', undefined);
      return true;
    },
    [setError, t]
  );

  const validatePassword = useCallback(
    (password: string, minLength = VALIDATION_RULES.PASSWORD_MIN_LENGTH): boolean => {
      if (!password.trim()) {
        setError('password', t('errors.required'));
        return false;
      }
      if (password.length < minLength) {
        setError('password', t('errors.passwordTooShort', { min: minLength }));
        return false;
      }
      setError('password', undefined);
      return true;
    },
    [setError, t]
  );

  const validateName = useCallback(
    (name: string): boolean => {
      if (!name.trim()) {
        setError('name', t('errors.required'));
        return false;
      }
      setError('name', undefined);
      return true;
    },
    [setError, t]
  );

  const validatePasswordMatch = useCallback(
    (password: string, confirmPassword: string): boolean => {
      if (password !== confirmPassword) {
        setError('confirmPassword', t('errors.passwordsDontMatch'));
        return false;
      }
      setError('confirmPassword', undefined);
      return true;
    },
    [setError, t]
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  const showError = useCallback(
    (message: string) => {
      Alert.alert(t('common.error'), message);
    },
    [t]
  );

  return {
    errors,
    validateEmail,
    validatePassword,
    validateName,
    validatePasswordMatch,
    clearErrors,
    showError,
  };
}
