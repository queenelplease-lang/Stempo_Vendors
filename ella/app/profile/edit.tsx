import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { updateProfile } from '@/lib/api/services/authService';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { getCities } from '@/lib/api/services/citiesService';
import { City } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { currentUser } = useRequireAuth();
  const { t } = useTranslation();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      if (currentUser.city) {
        setSelectedCity(currentUser.city);
      }
    }
  }, [currentUser]);

  const loadCities = useCallback(async () => {
    setIsLoadingCities(true);
    try {
      const result = await dispatch(getCities()).unwrap();
      setCities(result);
      if (currentUser?.cityId && result.length > 0) {
        const userCity = result.find((c) => Number(c.id) === Number(currentUser.cityId));
        if (userCity) {
          setSelectedCity(userCity);
        }
      }
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setIsLoadingCities(false);
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert(t('common.error'), t('business.loginRequired'));
      router.replace('/login');
      return;
    }

    if (!name.trim()) {
      Alert.alert(t('common.error'), t('business.enterName'));
      return;
    }

    try {
      await dispatch(
        updateProfile({
          name: name.trim(),
          phone: phone.trim() || undefined,
          cityId: selectedCity?.id ? Number(selectedCity.id) : undefined,
        }),
      ).unwrap();

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (err) {
      Alert.alert(t('common.error'), (err as string) || t('errors.unknownError'));
    }
  };

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.icon} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{t('profile.editProfile')}</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('profile.personalInformation')}</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('auth.name')}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.icon + '30' }]}
              value={name}
              onChangeText={setName}
              placeholder={t('auth.enterName')}
              placeholderTextColor={colors.icon + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('auth.email')}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.icon + '30', backgroundColor: '#F3F4F6' }]}
              value={email}
              editable={false}
              placeholder={t('auth.enterEmail')}
              placeholderTextColor={colors.icon + '60'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <ThemedText style={styles.inputHint}>{t('auth.emailCannotChange')}</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('auth.phone')}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.icon + '30' }]}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('auth.enterPhone')}
              placeholderTextColor={colors.icon + '60'}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>{t('city.city')}</ThemedText>
            <TouchableOpacity
              style={[styles.input, { borderColor: colors.icon + '30', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
              onPress={() => setShowCityModal(true)}
            >
              <ThemedText style={selectedCity ? {} : { color: colors.icon + '60' }}>
                {selectedCity ? selectedCity.name : t('city.selectCity')}
              </ThemedText>
              <IconSymbol name="chevron.right" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <ThemedText style={styles.errorText}>
            {t('common.error')}: {error}
          </ThemedText>
        )}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.tint },
            isLoading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.saveButtonText}>{t('profile.saveChanges')}</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>

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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
