import { useRef, useState } from 'react';
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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { VALIDATION_RULES } from '@/constants/validation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { changePassword } from '@/lib/api/services/authService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  useRequireAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const newPasswordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert(t('common.error'), t('auth.enterCurrentPassword'));
      return;
    }

    if (newPassword.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      Alert.alert(
        t('common.error'),
        t('errors.passwordTooShort', { min: VALIDATION_RULES.PASSWORD_MIN_LENGTH }),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('errors.passwordsDontMatch'));
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword,
          newPassword,
        }),
      ).unwrap();

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(t('common.success'), t('auth.changePasswordSuccess'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch (err) {
      const message = typeof err === 'string' ? err : t('auth.changePasswordFailed');
      Alert.alert(t('common.error'), message);
    }
  };

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.icon} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('auth.changePassword')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

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
          <View style={[styles.iconContainer, { backgroundColor: colors.tint + '15' }]}>
            <IconSymbol name="lock.fill" size={40} color={colors.tint} />
          </View>

          <ThemedText style={styles.subtitle}>{t('auth.changePasswordSubtitle')}</ThemedText>

          <View style={styles.form}>
            <View>
              <ThemedText style={styles.label}>{t('auth.currentPassword')}</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: '#E5E7EB', color: colors.text }]}
                placeholder={t('auth.enterCurrentPassword')}
                placeholderTextColor="#9CA3AF"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                blurOnSubmit={false}
                autoFocus
              />
            </View>

            <View>
              <ThemedText style={styles.label}>{t('auth.newPassword')}</ThemedText>
              <TextInput
                ref={newPasswordRef}
                style={[styles.input, { borderColor: '#E5E7EB', color: colors.text }]}
                placeholder={t('auth.atLeastNChars', {
                  n: VALIDATION_RULES.PASSWORD_MIN_LENGTH,
                })}
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                blurOnSubmit={false}
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
                onSubmitEditing={handleChangePassword}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.tint },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>{t('auth.changePassword')}</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
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
