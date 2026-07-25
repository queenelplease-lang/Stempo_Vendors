import { LoyaltyCard } from '@/components/loyalty-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslation } from '@/hooks/use-translation';
import { getLoyaltyCards } from '@/lib/api/services/loyaltyCardsService';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState, useCallback } from 'react';

export default function BonusesScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { isAuthenticated } = useRequireAuth();
  const { cards, isLoading } = useAppSelector((state) => state.loyaltyCards);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await dispatch(getLoyaltyCards());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [dispatch, isAuthenticated, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemedView style={styles.container} lightColor="#FFFFFF" darkColor="#FFFFFF">
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('bonuses.myLoyaltyCards')}</ThemedText>
          <ThemedText style={styles.subtitle}>{t('bonuses.trackProgress')}</ThemedText>
        </View>

        {isLoading && cards.length === 0 ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : cards.length > 0 ? (
          <View style={styles.section}>
            {cards.map((card) => (
              <LoyaltyCard key={card.id} card={card} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>{t('bonuses.noCards')}</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
  },
});
