import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, Modal } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/api/services/authService';
import { getLoyaltyCards } from '@/lib/api/services/loyaltyCardsService';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated } = useRequireAuth();
  const { cards } = useAppSelector((state) => state.loyaltyCards);
  const { t, currentLanguage, setLanguage } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getLoyaltyCards());
    }
  }, [dispatch, isAuthenticated]);

  const handleSignOut = useCallback(async () => {
    Alert.alert(
      t('auth.signOut'),
      t('auth.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
            router.replace('/login');
          },
        },
      ]
    );
  }, [dispatch, router, t]);

  const profileData = useMemo(() => {
    if (!currentUser) return null;

    const totalPoints = cards.reduce(
      (sum, card) => sum + (card.stamps ?? 0) + (card.points ?? 0),
      0,
    );

    return {
      name: currentUser.name || t('profile.user'),
      email: currentUser.email,
      phone: currentUser.phone || t('profile.notSet'),
      memberSince: new Date(currentUser.createdAt).toLocaleDateString(
        currentLanguage === 'he' ? 'he-IL' : 'en-US',
        { month: 'long', year: 'numeric' },
      ),
      totalPoints,
      activePrograms: cards.length,
    };
  }, [currentUser, cards, t, currentLanguage]);

  const menuItems = useMemo(
    () =>
      [
        {
          icon: 'person.fill' as const,
          label: t('profile.editProfile'),
          action: () => router.push('/profile/edit'),
        },
        {
          icon: 'gearshape.fill' as const,
          label: t('auth.changePassword'),
          action: () => router.push('/profile/change-password'),
        },
        {
          icon: 'rectangle.portrait.and.arrow.right' as const,
          label: t('auth.signOut'),
          action: handleSignOut,
        },
      ] satisfies { icon: IconSymbolName; label: string; action: () => void }[],
    [router, handleSignOut, t],
  );

  if (!currentUser || !profileData) {
    return null;
  }

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.avatarText}>
              {profileData.name.split(' ').map(n => n[0]).join('')}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.name}>
            {profileData.name}
          </ThemedText>
          <ThemedText style={styles.email}>{profileData.email}</ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText type="subtitle" style={styles.statValue}>
              {profileData.totalPoints}
            </ThemedText>
            <ThemedText style={styles.statLabel}>{t('profile.totalPoints')}</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText type="subtitle" style={styles.statValue}>
              {profileData.activePrograms}
            </ThemedText>
            <ThemedText style={styles.statLabel}>{t('profile.activePrograms')}</ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('profile.profile')}
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>{t('auth.phone')}</ThemedText>
            <ThemedText style={styles.infoValue}>{profileData.phone}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>{t('profile.memberSince')}</ThemedText>
            <ThemedText style={styles.infoValue}>{profileData.memberSince}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>{t('profile.language')}</ThemedText>
            <TouchableOpacity onPress={() => setShowLanguageModal(true)}>
              <ThemedText style={[styles.infoValue, { color: colors.tint }]}>
                {currentLanguage === 'en' ? t('profile.english') : currentLanguage === 'he' ? t('profile.hebrew') : t('profile.language')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <ThemedView style={styles.menuItemContent}>
                <View style={styles.menuItemLeft}>
                  <IconSymbol name={item.icon} size={24} color={colors.icon} />
                  <ThemedText style={styles.menuItemLabel}>{item.label}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
              </ThemedView>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
                    currentLanguage === lang.code && { backgroundColor: colors.tint + '10' }
                  ]}
                  onPress={async () => {
                    await setLanguage(lang.code);
                    setShowLanguageModal(false);
                  }}
                >
                  <ThemedText style={[
                    styles.languageItemText,
                    currentLanguage === lang.code && { color: colors.tint, fontWeight: '600' }
                  ]}>
                    {lang.name}
                  </ThemedText>
                  {currentLanguage === lang.code && (
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
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  infoSection: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuSection: {
    gap: 8,
  },
  menuItem: {
    marginBottom: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
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
});
