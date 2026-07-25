import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { VALIDATION_RULES } from '@/constants/validation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setPasswordFromInvite } from '@/lib/api/services/authService';

export default function SetPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const confirmRef = useRef<TextInput>(null);

  const handleSetPassword = async () => {
    if (!token) {
      Alert.alert(t('common.error'), t('auth.invalidInviteLink'));
      return;
    }

    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      Alert.alert(
        t('common.error'),
        t('errors.passwordTooShort', { min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('errors.passwordsDontMatch'));
      return;
    }

    try {
      await dispatch(setPasswordFromInvite({ token, password })).unwrap();
      router.replace('/(tabs)');
    } catch (err) {
      const message = typeof err === 'string' ? err : t('auth.setPasswordFailed');
      Alert.alert(t('common.error'), message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="lock.fill" size={40} color={colors.tint} />
            </View>
          </View>

          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>
              {t('auth.setYourPassword')}
            </ThemedText>
            <ThemedText style={styles.subtitle}>{t('auth.setPasswordSubtitle')}</ThemedText>

            <View style={styles.form}>
              <View>
                <ThemedText style={styles.label}>{t('auth.password')}</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: '#E5E7EB', color: colors.text }]}
                  placeholder={t('auth.atLeastNChars', {
                    n: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
                  })}
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  blurOnSubmit={false}
                  autoFocus
                />
              </View>

              <View>
                <ThemedText style={styles.label}>{t('auth.confirmPassword')}</ThemedText>
                <TextInput
                  ref={confirmRef}
                  style={[styles.input, { borderColor: '#E5E7EB', color: colors.text }]}
                  placeholder={t('auth.repeatPassword')}
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleSetPassword}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.tint },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleSetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.buttonText}>{t('auth.activateAccount')}</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
