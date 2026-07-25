import { StyleSheet, View, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AuthLogo } from '@/components/auth-logo';
import { SocialIcons } from '@/components/social-icons';
import { FormSeparator } from '@/components/form-separator';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { login, loginWithGoogle } from '@/lib/api/services/authService';
import { useAuthForm } from '@/hooks/use-auth-form';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { getNetworkErrorMessage } from '@/utils/error-handler';
import { useTranslation } from '@/hooks/use-translation';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<TextInput>(null);
  const { validateEmail, validatePassword, showError } = useAuthForm();
  const { signInWithGoogle, isReady: isGoogleReady } = useGoogleAuth();

  const handleGoogleLogin = async () => {
    if (!isGoogleReady) {
      Alert.alert(t('common.error'), t('auth.googleNotConfigured'));
      return;
    }

    try {
      const idToken = await signInWithGoogle();
      if (!idToken) {
        return;
      }

      await dispatch(loginWithGoogle({ idToken })).unwrap();
      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = err as string;
      showError(getNetworkErrorMessage(errorMessage));
    }
  };

  const handleSocialLogin = () => {
    Alert.alert(t('auth.comingSoon'), t('auth.socialLoginSoon'));
  };

  const handleEmailLogin = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }

    try {
      await dispatch(login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })).unwrap();

      router.replace('/(tabs)');
    } catch (err) {
      const errorMessage = err as string;
      showError(getNetworkErrorMessage(errorMessage));
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
            <AuthLogo />
          </View>

          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>{t('auth.welcomeBack')}</ThemedText>
            <ThemedText style={styles.subtitle}>{t('auth.loginSubtitle')}</ThemedText>

            <SocialIcons 
              onGooglePress={handleGoogleLogin}
              onApplePress={handleSocialLogin}
              onPhonePress={handleSocialLogin}
            />

            <FormSeparator />

        <View style={styles.form}>
          <ThemedText style={styles.label}>{t('auth.email')}</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: '#E5E7EB' }]}
            placeholder="your@email.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            blurOnSubmit={false}
          />

          <ThemedText style={styles.label}>{t('auth.password')}</ThemedText>
          <TextInput
            ref={passwordInputRef}
            style={[styles.input, { borderColor: '#E5E7EB' }]}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleEmailLogin}
          />

            <TouchableOpacity onPress={() => {}}>
              <ThemedText style={[styles.forgotPassword, { color: colors.tint }]}>
                {t('auth.forgotPassword')}
              </ThemedText>
            </TouchableOpacity>

            {error && (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: colors.tint },
                isLoading && styles.loginButtonDisabled
              ]}
              onPress={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.loginButtonText}>{t('auth.login')}</ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.registerLink}>
              <ThemedText style={styles.registerLinkText}>{t('auth.dontHaveAccount')} </ThemedText>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <ThemedText style={[styles.registerLinkButton, { color: colors.tint }]}>
                  {t('auth.register')}
                </ThemedText>
              </TouchableOpacity>
            </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerLinkText: {
    fontSize: 14,
    opacity: 0.7,
  },
  registerLinkButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});
