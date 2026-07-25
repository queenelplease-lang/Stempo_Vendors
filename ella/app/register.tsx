import { StyleSheet, View, TouchableOpacity, TextInput, Platform, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AuthLogo } from '@/components/auth-logo';
import { SocialIcons } from '@/components/social-icons';
import { FormSeparator } from '@/components/form-separator';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { register, loginWithGoogle } from '@/lib/api/services/authService';
import { useAuthForm } from '@/hooks/use-auth-form';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { getNetworkErrorMessage } from '@/utils/error-handler';
import { getCities } from '@/lib/api/services/citiesService';
import { City } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const { validateEmail, validatePassword, validateName, validatePasswordMatch, errors, showError } = useAuthForm();
  const { t, setLanguage } = useTranslation();
  const { signInWithGoogle, isReady: isGoogleReady } = useGoogleAuth();

  const loadCities = useCallback(async () => {
    setIsLoadingCities(true);
    try {
      const result = await dispatch(getCities()).unwrap();
      setCities(result);
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setIsLoadingCities(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const handleUseLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Try to use expo-location if available, otherwise show manual selection
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const nearestCity = cities.reduce<{ city: City | null; distance: number }>(
              (acc, city) => {
                if (city.latitude == null || city.longitude == null) return acc;
                const distance = Math.sqrt(
                  Math.pow(city.latitude - latitude, 2) +
                    Math.pow(city.longitude - longitude, 2)
                );
                return distance < acc.distance ? { city, distance } : acc;
              },
              { city: null, distance: Infinity }
            ).city;

            if (nearestCity) {
              setSelectedCity(nearestCity);
              setShowCityModal(false);
              Alert.alert(t('city.cityDetected'), `${t('city.yourCity')}: ${nearestCity.name}`);
            } else {
              Alert.alert(t('common.error'), t('city.detectCityError'));
              setShowCityModal(true);
            }
            setIsLoadingLocation(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            Alert.alert(t('common.error'), t('city.locationError'));
            setShowCityModal(true);
            setIsLoadingLocation(false);
          }
        );
      } else {
        // Fallback: show manual selection
        Alert.alert(t('common.error'), t('city.locationUnavailable'));
        setShowCityModal(true);
        setIsLoadingLocation(false);
      }
    } catch (err) {
      console.error('Location error:', err);
      Alert.alert(t('common.error'), t('city.locationError'));
      setShowCityModal(true);
      setIsLoadingLocation(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!isGoogleReady) {
      Alert.alert(t('common.error'), t('auth.googleNotConfigured'));
      return;
    }

    try {
      await setLanguage(selectedLanguage);

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

  const handleSocialRegister = () => {
    Alert.alert(t('auth.comingSoon'), t('auth.socialRegisterSoon'));
  };

  const handleEmailRegister = async () => {
    if (!validateName(name) || !validateEmail(email) || !validatePassword(password) || !validatePasswordMatch(password, confirmPassword)) {
      return;
    }

    try {
      // Set language preference before registration
      await setLanguage(selectedLanguage);
      
      await dispatch(register({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        name: name.trim(),
        cityId: selectedCity?.id ? Number(selectedCity.id) : undefined,
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
            <ThemedText type="title" style={styles.title}>{t('auth.createAccount')}</ThemedText>
            <ThemedText style={styles.subtitle}>{t('auth.signUpSubtitle')}</ThemedText>

            <SocialIcons 
              onGooglePress={handleGoogleRegister}
              onApplePress={handleSocialRegister}
              onPhonePress={handleSocialRegister}
            />

            <FormSeparator />

            <View style={styles.form}>
              <ThemedText style={styles.label}>{t('auth.name')}</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: '#E5E7EB' }]}
                placeholder={t('auth.enterName')}
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                blurOnSubmit={false}
              />

              <ThemedText style={styles.label}>{t('auth.email')}</ThemedText>
              <TextInput
                ref={emailInputRef}
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
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                blurOnSubmit={false}
              />

              <ThemedText style={styles.label}>{t('auth.confirmPassword')}</ThemedText>
              <TextInput
                ref={confirmPasswordInputRef}
                style={[styles.input, { borderColor: '#E5E7EB' }]}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleEmailRegister}
              />

              <ThemedText style={styles.label}>{t('city.city')}</ThemedText>
              <View style={styles.citySelection}>
                <TouchableOpacity
                  style={[styles.cityButton, { borderColor: '#E5E7EB' }]}
                  onPress={handleUseLocation}
                  disabled={isLoadingLocation || isLoadingCities}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : (
                    <>
                      <IconSymbol name="location.fill" size={20} color={colors.tint} />
                      <ThemedText style={styles.cityButtonText}>
                        {t('city.useLocation')}
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cityButton, { borderColor: '#E5E7EB' }]}
                  onPress={() => setShowCityModal(true)}
                  disabled={isLoadingCities}
                >
                  <IconSymbol name="mappin.circle.fill" size={20} color={colors.tint} />
                  <ThemedText style={styles.cityButtonText}>
                    {selectedCity ? selectedCity.name : t('city.selectCityManually')}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.label}>{t('profile.language')}</ThemedText>
              <TouchableOpacity
                style={[styles.input, { borderColor: colors.icon + '30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => setShowLanguageModal(true)}
              >
                <ThemedText style={selectedLanguage ? {} : { color: colors.icon + '60' }}>
                  {selectedLanguage === 'en' ? t('profile.english') : selectedLanguage === 'he' ? t('profile.hebrew') : t('profile.language')}
                </ThemedText>
                <IconSymbol name="chevron.down" size={20} color={colors.icon} />
              </TouchableOpacity>

              {(error || Object.values(errors).some(e => e)) && (
                <ThemedText style={styles.errorText}>
                  {error || Object.values(errors).find(e => e)}
                </ThemedText>
              )}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: colors.tint },
                  isLoading && styles.registerButtonDisabled
                ]}
                onPress={handleEmailRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.registerButtonText}>{t('auth.createAccount')}</ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.loginLink}>
                <ThemedText style={styles.loginLinkText}>{t('auth.alreadyHaveAccount')} </ThemedText>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <ThemedText style={[styles.loginLinkButton, { color: colors.tint }]}>
                    {t('auth.login')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t('city.selectCity')}</ThemedText>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.cityList}>
              {isLoadingCities ? (
                <ActivityIndicator size="large" color={colors.tint} style={styles.loader} />
              ) : (
                cities.map((city) => (
                  <TouchableOpacity
                    key={city.id}
                    style={[
                      styles.cityItem,
                      selectedCity?.id === city.id && { backgroundColor: colors.tint + '20' }
                    ]}
                    onPress={() => {
                      setSelectedCity(city);
                      setShowCityModal(false);
                    }}
                  >
                    <ThemedText style={styles.cityItemText}>{city.name}</ThemedText>
                    {selectedCity?.id === city.id && (
                      <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{t('profile.language')}</ThemedText>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.languageList}>
              {[
                { code: 'en', name: t('profile.english') },
                { code: 'he', name: t('profile.hebrew') },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    selectedLanguage === lang.code && { backgroundColor: colors.tint + '10' }
                  ]}
                  onPress={() => {
                    setSelectedLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <ThemedText style={[
                    styles.languageItemText,
                    selectedLanguage === lang.code && { color: colors.tint, fontWeight: '600' }
                  ]}>
                    {lang.name}
                  </ThemedText>
                  {selectedLanguage === lang.code && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        </ThemedView>
      </Modal>
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
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  registerButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginLinkText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loginLinkButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  citySelection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageList: {
    padding: 20,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  languageItemText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cityList: {
    padding: 20,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  cityItemText: {
    fontSize: 16,
  },
  loader: {
    padding: 40,
  },
});
